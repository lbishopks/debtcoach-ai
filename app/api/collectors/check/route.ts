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

    const prompt = `You are a consumer protection research assistant providing general educational information only. A user wants to look up publicly available information about the following debt collector. You are NOT providing legal advice. Do not tell the user what they "should" do or recommend any legal action.

Collector Name: ${collector_name}
${collector_phone ? `Phone: ${collector_phone}` : ''}
${collector_address ? `Address: ${collector_address}` : ''}

Please research this collector and provide the following factual, publicly available information:

1. **Registration & Licensing** — Is this a known, registered debt collection agency? What licensing information is publicly available?

2. **CFPB Complaint History** — Have there been complaints filed against this company with the CFPB? How many, and what types? Link to the CFPB database.

3. **Potential Red Flags** — Any publicly documented signs that could indicate scam or phantom debt operations (e.g., unlicensed, no public business records, known scam reports)?

4. **Consumer Resources** — Link to relevant public resources: CFPB complaint portal, FTC fraud reporting, state AG consumer protection office, and the CFPB's debt collection guidance page.

Be factual, cite sources, and use web search to find current information. Do not draw legal conclusions or recommend specific actions. End your response with: *This research is for general informational purposes only and is not legal advice. Consult a licensed consumer rights attorney for advice specific to your situation.*`

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
