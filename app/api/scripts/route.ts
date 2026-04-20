import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
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

    const prompt = `Personalize this debt negotiation script for a specific user's situation. This is for educational purposes only — not legal advice.

Script Title: ${scriptTitle}

Original Script Template:
${scriptTemplate}

User's Specific Situation:
- Name: ${userName || '[USER NAME]'}
- State: ${userState || 'Unknown'}
${hasDebt ? `- Creditor: ${creditorName}
- Balance: $${balance.toLocaleString()}
- Debt Type: ${debtType}` : '- No specific debt selected'}

Instructions:
1. Keep the same script structure and key phrases
2. Fill in or suggest specific numbers (e.g., calculate a 35% settlement offer from the balance)
3. Replace generic placeholders with the user's actual info where available
4. Add any state-specific tips if relevant
5. Keep [BRACKETS] only for things the user truly needs to fill in themselves
6. Make the language sound natural and confident
7. Include a reminder that this script is for educational use and users should consult an attorney before taking legal action`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const script = message.content[0].type === 'text' ? message.content[0].text : scriptTemplate

    return NextResponse.json({ script })
  } catch (err: any) {
    return safeError(err, 'scripts')
  }
}
