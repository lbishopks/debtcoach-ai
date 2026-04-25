import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, WEB_SEARCH_TOOL } from '@/lib/anthropic'
import { safeError } from '@/lib/validation'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  collector_name: z.string().min(1).max(200),
  collector_phone: z.string().max(50).optional(),
  collector_address: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'collector-check', { limit: 10, windowMs: 60_000 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { collector_name, collector_phone, collector_address } = parsed.data

    const prompt = `You are a consumer protection research assistant. A user wants to verify whether the following debt collector is legitimate and check for any red flags.

Collector Name: ${collector_name}
${collector_phone ? `Phone: ${collector_phone}` : ''}
${collector_address ? `Address: ${collector_address}` : ''}

Please research this collector and provide:

1. **Legitimacy Assessment** — Is this a known, registered debt collection agency? Any licensing information you can find?

2. **CFPB Complaint History** — Have there been complaints filed against this company with the CFPB? How many, and what types?

3. **Red Flags** — Any signs this could be a scam debt collector? (fake debts, phantom debt, threats, unlicensed operation, etc.)

4. **Verification Steps** — What should the consumer do to verify this debt is real? (request debt validation letter, check state licensing, etc.)

5. **Recommended Actions** — Based on your research, what should the consumer do next?

Be factual and cite sources where possible. Use web search to find current information.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      tools: [WEB_SEARCH_TOOL],
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract text content from response (may include tool use blocks)
    const textContent = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('\n\n')

    return NextResponse.json({ analysis: textContent })
  } catch (err) {
    return safeError(err, 'collectors-check')
  }
}
