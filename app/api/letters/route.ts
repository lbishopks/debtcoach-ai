import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { anthropic, LETTER_SYSTEM_PROMPT } from '@/lib/anthropic'
import { letterSchema, sanitize, safeNumber, safeError } from '@/lib/validation'
import { getPlanLimits } from '@/lib/platform-settings'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const LETTER_TYPE_DESCRIPTIONS: Record<string, string> = {
  dispute: 'formal debt dispute letter challenging the validity and accuracy of the debt under FDCPA § 1692g and FCRA § 1681i, demanding validation and cessation of collection activity',
  validation: 'debt validation demand letter under FDCPA § 1692g requiring the collector to provide: (1) amount of debt, (2) name/address of original creditor, (3) copy of original signed agreement, (4) proof of authorization to collect in consumer\'s state, (5) confirmation debt is within statute of limitations — all collection must cease until provided',
  cease_desist: 'cease and desist letter invoking FDCPA § 1692c(c) demanding ALL contact cease immediately, warning that further contact is an FDCPA violation subject to $1,000 statutory damages per violation plus attorney fees under § 1692k, reserving right to pursue legal action',
  goodwill: 'goodwill deletion letter respectfully requesting removal of a negative mark, acknowledging past circumstances, noting the account is now resolved, emphasizing the ongoing credit damage, and appealing to the creditor\'s discretion under FCRA',
  pay_for_delete: 'pay-for-delete letter making a conditional settlement offer explicitly contingent on complete removal (not just status update) from all three credit bureau reports, requiring a written agreement before any payment is made',
  debt_settlement: 'formal debt settlement offer letter proposing a lump-sum settlement for less than the full balance, explicitly stating this is a conditional offer and NOT an acknowledgment of the debt, conditioning the offer on written confirmation and bureau reporting as "Settled in Full," and noting potential 1099-C tax implications',
  hardship: 'financial hardship letter requesting payment deferment, forbearance, interest rate reduction, or revised payment plan based on documented financial hardship, citing specific circumstances and inability to maintain current payment schedule',
  identity_theft: 'identity theft dispute letter disputing fraudulent accounts or charges under FCRA § 1681i and FTC identity theft provisions, requesting immediate account closure, charge reversal, and credit bureau notification — referencing the consumer\'s right to place a fraud alert under FCRA § 1681c-1',
  statute_of_limitations: 'statute of limitations defense letter notifying the collector the debt appears time-barred under applicable state law, that attempting to collect may violate the FDCPA, that filing suit on a time-barred debt is an FDCPA violation under § 1692e(2)(A), and that any payment or promise to pay CANNOT restart the SOL in most states — explicitly NOT acknowledging the debt',
  fdcpa_violation: 'FDCPA violation notice documenting specific violations with dates, citing § 1692k civil liability ($1,000 per violation plus actual damages and attorney fees), demanding immediate cessation, and stating complaints will be filed with CFPB (consumerfinance.gov/complaint), FTC (reportfraud.ftc.gov), and state Attorney General within 15 days if not resolved',
  medical_debt: 'medical debt dispute letter challenging billing errors or insurance payment discrepancies, citing HIPAA privacy rights, requesting itemized billing statements and proof of medical necessity, questioning billed vs. negotiated rates, disputing violations of the No Surprises Act for out-of-network billing, and noting that CFPB rules restrict medical debt from credit reports starting 2025',
  original_creditor_dispute: 'direct dispute letter to the original creditor under FCRA § 1681s-2(b), disputing inaccurate information being furnished to credit bureaus, demanding correction or deletion of the disputed information, and noting the creditor\'s legal obligation under FCRA to report only accurate information and to investigate disputes',
  account_not_mine: 'account fraud dispute asserting the account was opened without consumer\'s knowledge or consent, constituting identity theft or unauthorized use, demanding immediate account closure, charge reversal, and deletion from all credit bureau files — referencing FTC Identify Theft Affidavit and potential criminal liability for the creditor if they fail to act',
  payment_plan: 'formal payment plan proposal offering a specific monthly payment schedule to satisfy the debt over time, requesting written agreement, confirmation that no additional interest/fees will accrue, and that credit bureau reporting will reflect the active payment arrangement and be updated to "current" upon plan acceptance',
  delete_after_payment: 'post-payment deletion request for a debt already paid or settled, citing that continued negative reporting serves no legitimate purpose now the account is satisfied, requesting deletion under FCRA § 1681i, and noting that ongoing reporting of a resolved account may constitute willful non-compliance under § 1681n',
}

export async function POST(req: NextRequest) {
  try {
    // IP-level rate limit: 10 letter generations per minute per IP.
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'letters', { limit: 10, windowMs: 60_000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Validate and sanitize input
    const body = await req.json()
    const parsed = letterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const {
      letterType, debtId,
      disputeReason, additionalDetails, state,
      fdcpaViolations, contactDates,
    } = parsed.data

    // Sanitize free-text fields before they touch any prompt or DB
    const creditorName = sanitize(parsed.data.creditorName, 200)
    const accountNumber = sanitize(parsed.data.accountNumber ?? '', 50)
    const amount = safeNumber(parsed.data.amount)
    const settlementOffer = safeNumber(parsed.data.settlementOffer)

    // Check plan limits
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('users').select('plan').eq('id', user.id).single()

    const plan = profile?.plan || 'free'
    const { lettersLimit } = await getPlanLimits(plan)

    if (lettersLimit !== -1) {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const { count } = await adminClient
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thisMonth.toISOString())

      if ((count || 0) >= lettersLimit) {
        const limitLabel = plan === 'free' ? 'free plan' : 'your plan'
        return NextResponse.json({
          error: 'LIMIT_REACHED',
          message: `You've reached your ${lettersLimit} letter${lettersLimit !== 1 ? 's' : ''}/month limit on the ${limitLabel}. Upgrade to Pro for more access.`,
        }, { status: 429 })
      }
    }

    // Verify the debt belongs to this user (prevents cross-user data access)
    if (debtId) {
      const { data: ownedDebt } = await adminClient
        .from('debts')
        .select('id')
        .eq('id', debtId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!ownedDebt) {
        return NextResponse.json({ error: 'Debt not found' }, { status: 404 })
      }
    }

    // Fetch full user profile for letterhead
    const { data: userProfile } = await adminClient
      .from('users')
      .select('full_name, address_line1, address_line2, city, state, zip_code, phone, email')
      .eq('id', user.id)
      .single()

    const senderName = userProfile?.full_name || '[YOUR FULL NAME]'
    const senderAddress = [
      userProfile?.address_line1 || '[YOUR STREET ADDRESS]',
      userProfile?.address_line2,
      userProfile?.city && userProfile?.state && userProfile?.zip_code
        ? `${userProfile.city}, ${userProfile.state} ${userProfile.zip_code}`
        : '[CITY, STATE ZIP]',
    ].filter(Boolean).join('\n')
    const senderPhone = userProfile?.phone || '[YOUR PHONE NUMBER]'
    const senderEmail = userProfile?.email || '[YOUR EMAIL]'
    const senderState = state || userProfile?.state || '[YOUR STATE]'

    const description = LETTER_TYPE_DESCRIPTIONS[letterType] || 'professional debt dispute letter'
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const prompt = `Generate a ${description}.

SENDER (CONSUMER) — use exactly in the letterhead:
Name: ${senderName}
Address: ${senderAddress}
Phone: ${senderPhone}
Email: ${senderEmail}

CREDITOR/COLLECTOR DETAILS:
- Company Name: ${creditorName}
- Account Number: ${accountNumber || '[ACCOUNT NUMBER]'}
- Amount in Question: ${amount ? '$' + Number(amount).toLocaleString() : '[AMOUNT]'}
- Consumer State: ${senderState}
- Dispute Reason: ${disputeReason || 'General dispute'}
${fdcpaViolations ? `- FDCPA Violations: ${fdcpaViolations}` : ''}
${settlementOffer ? `- Settlement Offer: $${Number(settlementOffer).toLocaleString()}` : ''}
${contactDates ? `- Relevant Dates: ${contactDates}` : ''}
${additionalDetails ? `- Additional Details: ${additionalDetails}` : ''}

Today's Date: ${today}

The letterhead must show the consumer's real name and address (provided above) — do NOT use placeholders for those fields. Use [BRACKETS] only for fields still unknown (like the creditor's response address if not provided). Generate the complete, ready-to-mail letter with ALL required legal elements and precise statute citations (§ numbers).`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2000,
      system: LETTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    const { data: letter, error } = await adminClient.from('letters').insert({
      user_id: user.id,
      debt_id: debtId || null,
      letter_type: letterType,
      content,
      creditor_name: creditorName,
    }).select().single()

    if (error) console.error('Failed to save letter:', error)

    return NextResponse.json({ content, letterId: letter?.id })
  } catch (err: any) {
    return safeError(err, 'letters-POST')
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: letters } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ letters: letters || [] })
  } catch (err: any) {
    return safeError(err, 'letters-GET')
  }
}
