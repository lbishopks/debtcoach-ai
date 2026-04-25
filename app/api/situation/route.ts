import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { anthropic, SITUATION_SYSTEM_PROMPT } from '@/lib/anthropic'
import { situationSchema, sanitize, safeError } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-log'

export async function POST(req: NextRequest) {
  try {
    // IP-level rate limit
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'situation', { limit: 10, windowMs: 60_000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Hard subscription gate
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('users').select('plan').eq('id', user.id).single()
    if (profile?.plan !== 'pro') {
      return NextResponse.json(
        { error: 'PRO_REQUIRED', message: 'A Pro subscription is required.' },
        { status: 403 }
      )
    }

    // Validate and sanitize input
    const body = await req.json()
    const parsed = situationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const {
      totalDebt, debtTypes, monthlyIncome, monthlyExpenses,
      state, creditScore, oldestDebtAge, employmentStatus,
      hasAssets, primaryGoal, additionalContext,
    } = parsed.data

    // Sanitize all string fields going into the AI prompt
    const safeState = sanitize(state, 50)
    const safeCreditScore = sanitize(creditScore, 50)
    const safeOldestDebt = sanitize(oldestDebtAge, 50)
    const safeEmployment = sanitize(employmentStatus, 100)
    const safePrimaryGoal = sanitize(primaryGoal, 200)
    const safeContext = additionalContext ? sanitize(additionalContext, 500) : null
    const safeDebtTypes = debtTypes.map(t => sanitize(t, 50)).filter(Boolean)

    const debtToIncome = monthlyIncome > 0
      ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1)
      : 'Unknown'

    const prompt = `Provide a general educational overview for a consumer with the following debt situation:

FINANCIAL SNAPSHOT:
- Total Debt: $${totalDebt.toLocaleString()}
- Monthly Gross Income: $${monthlyIncome.toLocaleString()}
- Monthly Expenses (debt payments): $${monthlyExpenses.toLocaleString()}
- Debt-to-Income Ratio: ${debtToIncome}%
- Types of Debt: ${safeDebtTypes.join(', ')}
- State: ${safeState}
- Estimated Credit Score Range: ${safeCreditScore}
- Age of Oldest Debt: ${safeOldestDebt}
- Employment Status: ${safeEmployment}
- Has Significant Assets (home/retirement): ${hasAssets ? 'Yes' : 'No'}
- Primary Goal: ${safePrimaryGoal}
${safeContext ? `- Additional Context: ${safeContext}` : ''}

Provide a general educational overview of options and resources available to consumers in similar situations.`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 3000,
      system: SITUATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const analysis = message.content[0].type === 'text' ? message.content[0].text : ''

    logActivity(user.id, 'situation_analyzed', {})
    return NextResponse.json({ analysis })
  } catch (err: any) {
    return safeError(err, 'situation')
  }
}
