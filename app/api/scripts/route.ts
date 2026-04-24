import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, SCRIPTS_SYSTEM_PROMPT } from '@/lib/anthropic'
import { sanitize, safeNumber, safeError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('plan').eq('id', user.id).single()
    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
    }

    const body = await req.json()

    // Sanitize all user-supplied inputs before they touch the AI prompt
    const scriptTemplate = sanitize(body.scriptTemplate ?? '', 5000)
    const scriptTitle = sanitize(body.scriptTitle ?? '', 200)
    const userName = sanitize(body.userInfo?.name ?? '', 100)
    const userState = sanitize(body.userInfo?.state ?? '', 50)
    const creditorName = sanitize(body.debtInfo?.creditorName ?? '', 200)
    const balance = safeNumber(body.debtInfo?.balance)
    const debtType = sanitize(body.debtInfo?.debtType ?? '', 100)
    const hasDebt = !!body.debtInfo

    if (!scriptTemplate) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const prompt = `Personalize this call script template as an educational reference for a consumer preparing for their own call. This is for educational purposes only — not legal advice.

Script Title: ${scriptTitle}

Original Script Template:
${scriptTemplate}

Consumer's Situation (for personalization):
- Name: ${userName || '[USER NAME]'}
- State: ${userState || 'Unknown'}
${hasDebt ? `- Creditor: ${creditorName}
- Balance: $${balance.toLocaleString()}
- Debt Type: ${debtType}` : '- No specific debt selected'}

Personalization Instructions:
1. Keep the same script structure and key phrases
2. Fill in specific details where available (e.g., name, creditor, calculate an example 35% settlement figure from the balance as an illustrative starting point — not a recommendation)
3. Replace generic placeholders with the consumer's actual info where provided
4. Add any general state-specific educational notes about what the law in that state generally provides
5. Keep [BRACKETS] for anything the consumer must decide or fill in themselves
6. Frame all language as general possibilities ("some consumers say..." / "one approach is...") — never as directives
7. Do NOT include language threatening litigation or claiming specific legal violations occurred`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1400,
      system: SCRIPTS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const script = message.content[0].type === 'text' ? message.content[0].text : scriptTemplate

    return NextResponse.json({ script })
  } catch (err: any) {
    return safeError(err, 'scripts')
  }
}
