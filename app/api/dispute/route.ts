import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { anthropic, BUREAU_DISPUTE_SYSTEM_PROMPT } from '@/lib/anthropic'
import { disputeSchema, sanitize, safeNumber, safeError } from '@/lib/validation'

const BUREAU_ADDRESSES: Record<string, { name: string; address: string; online: string }> = {
  equifax: {
    name: 'Equifax Information Services LLC',
    address: 'P.O. Box 740256\nAtlanta, GA 30374-0256',
    online: 'equifax.com/personal/credit-report-services/free-credit-report-dispute',
  },
  experian: {
    name: 'Experian',
    address: 'P.O. Box 4500\nAllen, TX 75013',
    online: 'experian.com/disputes/main.html',
  },
  transunion: {
    name: 'Trans Union LLC, Consumer Dispute Center',
    address: 'P.O. Box 2000\nChester, PA 19016',
    online: 'transunion.com/credit-disputes/dispute-your-credit',
  },
}

const DISPUTE_TYPE_DESCRIPTIONS: Record<string, string> = {
  account_not_mine: 'account that does not belong to the consumer — was opened fraudulently or without authorization',
  incorrect_balance: 'account showing an incorrect balance or credit limit that does not reflect the actual amount owed',
  incorrect_status: 'account showing an incorrect status (e.g., showing as open when it is closed, or as delinquent when it is current)',
  late_payment_error: 'late payment reported in error — consumer made timely payment but it was incorrectly reported as late',
  identity_theft: 'fraudulent account created by identity theft — consumer never opened this account',
  account_paid_not_updated: 'account that has been paid in full or settled but still shows as delinquent or outstanding balance',
  duplicate_account: 'account appearing multiple times on the credit report, artificially inflating debt amounts',
  incorrect_inquiry: 'unauthorized hard inquiry that the consumer did not authorize and that should not appear on their report',
  outdated_information: 'negative information that is past the 7-year reporting limit (10 years for Chapter 7 bankruptcy) and must be deleted under FCRA § 1681c',
  incorrect_personal_info: 'incorrect personal information (name, address, SSN, date of birth, employer) that may indicate mixed files or identity fraud',
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Validate and sanitize input
    const body = await req.json()
    const parsed = disputeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { bureau: bureauTarget, disputeType, state } = parsed.data

    // Sanitize all free-text fields
    const creditorName = sanitize(parsed.data.creditorName, 200)
    const accountNumber = sanitize(parsed.data.accountNumber ?? '', 50)
    const reportedBalance = safeNumber(parsed.data.reportedBalance)
    const correctInfo = sanitize(parsed.data.correctInfo ?? '', 500)
    const additionalDetails = sanitize(parsed.data.additionalDetails ?? '', 1000)
    const dateOfError = sanitize(parsed.data.dateOfError ?? '', 100)
    const supportingDocs = sanitize(parsed.data.supportingDocs ?? '', 500)

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('users').select('plan').eq('id', user.id).single()

    if (profile?.plan === 'free') {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const { count } = await adminClient
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thisMonth.toISOString())

      if ((count || 0) >= 1) {
        return NextResponse.json({
          error: 'LIMIT_REACHED',
          message: 'Free plan allows 1 letter per month. Upgrade to Pro for unlimited dispute letters.',
        }, { status: 429 })
      }
    }

    // Fetch user profile for letterhead
    const { data: userProfile } = await adminClient
      .from('users')
      .select('full_name, address_line1, address_line2, city, state, zip_code, phone, email')
      .eq('id', user.id)
      .single()

    const senderName = userProfile?.full_name || '[YOUR FULL LEGAL NAME]'
    const senderAddress = [
      userProfile?.address_line1 || '[YOUR STREET ADDRESS]',
      userProfile?.address_line2,
      userProfile?.city && userProfile?.state && userProfile?.zip_code
        ? `${userProfile.city}, ${userProfile.state} ${userProfile.zip_code}`
        : '[CITY, STATE ZIP]',
    ].filter(Boolean).join('\n')
    const senderPhone = userProfile?.phone || '[YOUR PHONE]'
    const senderState = state || userProfile?.state || '[YOUR STATE]'

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const bureausToDispute = (bureauTarget === 'all' || bureauTarget === 'all_three')
      ? ['equifax', 'experian', 'transunion']
      : [bureauTarget]

    const letters: Record<string, string> = {}

    for (const bureau of bureausToDispute) {
      const bureauInfo = BUREAU_ADDRESSES[bureau]
      const disputeDescription = DISPUTE_TYPE_DESCRIPTIONS[disputeType] || 'inaccurate information'

      const prompt = `Generate a complete FCRA credit bureau dispute letter to ${bureauInfo.name}.

SENDER (CONSUMER) — use exactly in letterhead:
Name: ${senderName}
Address: ${senderAddress}
Phone: ${senderPhone}
Date of Birth: [DATE OF BIRTH]
Last 4 SSN: [LAST 4 OF SSN]

BUREAU:
Name: ${bureauInfo.name}
Address: ${bureauInfo.address}

DISPUTE:
- Account/Creditor: ${creditorName}
- Account Number (as shown on report): ${accountNumber || '[ACCOUNT NUMBER AS IT APPEARS ON REPORT]'}
- Reported Balance: ${reportedBalance ? '$' + Number(reportedBalance).toLocaleString() : '[AS SHOWN ON REPORT]'}
- Error Type: ${disputeDescription}
- Correct Information: ${correctInfo || '[CORRECT INFORMATION]'}
- Date of Error: ${dateOfError || '[DATE]'}
- Consumer State: ${senderState}
- Documents Being Enclosed: ${supportingDocs || 'None at this time'}
${additionalDetails ? `- Additional Details: ${additionalDetails}` : ''}

Today's Date: ${today}

Use the consumer's REAL name and address from the Sender section above — do not use placeholders for those. Use [BRACKETS] only for SSN last 4 and DOB (which the user must fill in manually for security). Generate a complete FCRA § 1681i compliant letter with all legal citations, 30-day response deadline, and request for furnisher notification.`

      const message = await anthropic.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 2000,
        system: BUREAU_DISPUTE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      letters[bureau] = message.content[0].type === 'text' ? message.content[0].text : ''

      // Save each bureau letter
      await adminClient.from('letters').insert({
        user_id: user.id,
        letter_type: 'dispute',
        content: letters[bureau],
        creditor_name: `${bureauInfo.name} — ${creditorName}`,
      })
    }

    return NextResponse.json({ letters, bureaus: bureausToDispute })
  } catch (err: any) {
    return safeError(err, 'dispute')
  }
}
