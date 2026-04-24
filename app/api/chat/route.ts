import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { anthropic, DEBT_COACH_SYSTEM_PROMPT } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { chatSchema, safeError } from '@/lib/validation'
import { getPlanLimits } from '@/lib/platform-settings'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // IP-level rate limit: 30 chat requests per minute per IP address.
    // This caps runaway clients before they touch auth or the DB.
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'chat', { limit: 30, windowMs: 60_000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfterSeconds) },
        }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Validate and sanitize input
    const body = await req.json()
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { messages, conversationId: rawConvId, debtId } = parsed.data
    // Treat temp IDs (client-generated) as new conversations
    const conversationId = rawConvId && !String(rawConvId).startsWith('temp-') ? rawConvId : null

    // Check usage limits
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'free'
    const { messagesLimit } = await getPlanLimits(plan)

    // Track monthly usage for all limited plans
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    let currentUsageCount = 0

    if (messagesLimit !== -1) {
      const { data: usageRows } = await adminClient
        .from('usage_tracking')
        .select('messages_count')
        .eq('user_id', user.id)
        .gte('date', startOfMonthStr)

      currentUsageCount = (usageRows || []).reduce((s: number, r: { messages_count: number | null }) => s + (r.messages_count || 0), 0)

      if (currentUsageCount >= messagesLimit) {
        const limitLabel = plan === 'free' ? 'free plan' : 'your plan'
        return NextResponse.json({
          error: 'LIMIT_REACHED',
          message: `You've reached your ${messagesLimit} messages/month limit on the ${limitLabel}. Upgrade to Pro for more access.`,
        }, { status: 429 })
      }
    }

    // Format messages for Claude API
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Pre-create conversation row so we can return its ID in the response header
    let realConversationId = conversationId
    if (!conversationId) {
      const firstUserMsg = messages[0]?.content || 'Debt consultation'
      const title = firstUserMsg.length > 50 ? firstUserMsg.substring(0, 50) + '...' : firstUserMsg
      const { data: newConv } = await adminClient
        .from('conversations')
        .insert({ user_id: user.id, debt_id: debtId || null, title, messages: [] })
        .select('id')
        .single()
      realConversationId = newConv?.id || null
    }

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: DEBT_COACH_SYSTEM_PROMPT,
      messages: claudeMessages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()

        // Save conversation after streaming
        try {
          const finalMessage = await stream.finalMessage()
          const assistantContent = finalMessage.content[0].type === 'text'
            ? finalMessage.content[0].text
            : ''

          const allMessages = [
            ...messages,
            { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() },
          ]

          if (realConversationId) {
            await adminClient
              .from('conversations')
              .update({ messages: allMessages, updated_at: new Date().toISOString() })
              .eq('id', realConversationId)
          }
        } catch (saveErr) {
          console.error('Failed to save conversation:', saveErr)
        }

        // Increment usage after a successful AI response (for all limited plans)
        if (messagesLimit !== -1) {
          await adminClient
            .from('usage_tracking')
            .upsert({
              user_id: user.id,
              date: today,
              messages_count: currentUsageCount + 1,
            }, { onConflict: 'user_id,date' })
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        ...(realConversationId ? { 'X-Conversation-Id': realConversationId } : {}),
      },
    })
  } catch (err: any) {
    // Check for key config error (safe to surface) but never leak raw messages
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 503 }
      )
    }
    return safeError(err, 'chat')
  }
}
