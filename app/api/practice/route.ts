import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { safeError } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000),
  })).min(1).max(40),
  scenario: z.string().max(500),
})

const SYSTEM_PROMPTS: Record<string, string> = {
  'initial-contact': `You are playing the role of a debt collector named "Mark" from ABC Collections LLC. You are calling about a $2,340 credit card debt from Chase Bank that is 8 months past due.

Your character:
- Firm but professional initially
- Uses common collector pressure tactics (urgency, consequences of not paying)
- Will threaten to "note the account" or "escalate"
- Does NOT break the law (no threats of arrest, no profanity)
- Will respond to consumer rights assertions by backing down slightly
- Will negotiate if the consumer is firm and persistent
- Can settle for 40-60% of the balance if pushed

After each exchange, add a short line starting with [Coach:] that gives the user feedback on their response — what they did well, what they could improve, and what to try next.`,

  'debt-validation': `You are playing the role of a debt collector named "Lisa" from Premier Recovery Services calling about a $890 medical debt from 2 years ago. You don't have complete records.

Your character:
- Pushes for immediate payment
- Gets flustered when consumer knows their rights
- Will try to avoid sending validation letter ("I can just tell you the details right now...")
- Eventually complies when consumer insists on written validation
- If consumer mentions FDCPA, becomes more careful and formal

After each exchange, add a short line starting with [Coach:] giving specific feedback on their response and coaching on what to say next.`,

  'settlement-negotiation': `You are playing the role of a supervisor named "David" at Advantage Collections. The user has already spoken to a junior collector and asked to speak with a supervisor about settling a $5,200 debt for less than the full amount.

Your character:
- Acts like you're doing them a favor
- Starts high (will settle for 85%)
- Can come down to 45% if consumer is persistent and knowledgeable
- Uses techniques like "limited time offer," "I'll have to check with my manager," "this is the best I can do"
- Responds to silence and firmness by offering better terms

After each exchange, add a short line starting with [Coach:] with specific negotiation feedback — when to counter, when to stay silent, what leverage to use.`,

  'harassment': `You are playing the role of an aggressive debt collector named "Tony" who is using borderline-illegal tactics. The user needs to practice asserting their rights.

Your character:
- Calls before 8am (claims it's an emergency)
- Uses somewhat threatening language
- Claims they'll "send someone to your house"
- Claims the user "owes this money legally and must pay"
- Backs down IMMEDIATELY when consumer cites specific FDCPA sections (like Section 806, 807, 808)
- Backs down when consumer mentions recording the call
- Completely stops when consumer sends a cease communication letter

After each exchange, add a short line starting with [Coach:] explaining what the user did right, what FDCPA sections apply, and what to say next.`,
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'practice', { limit: 20, windowMs: 60_000 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { messages, scenario } = parsed.data
    const systemPrompt = SYSTEM_PROMPTS[scenario] || SYSTEM_PROMPTS['settlement-negotiation']

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    })
  } catch (err) {
    return safeError(err, 'practice')
  }
}
