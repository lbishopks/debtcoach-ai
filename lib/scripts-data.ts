export interface ScriptTemplate {
  id: string
  title: string
  category: 'negotiation' | 'rights' | 'credit' | 'validation'
  channel: 'phone' | 'email' | 'letter'
  description: string
  tags: string[]
  script: string
  tips: string[]
}

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'settlement-offer',
    title: "I Can't Afford Full Payment — Settlement Offer",
    category: 'negotiation',
    channel: 'phone',
    description: 'Use this when calling to negotiate a lump-sum settlement for less than the full balance.',
    tags: ['settlement', 'negotiation', 'lump sum', 'hardship'],
    tips: [
      'Start by offering 30% and work up to 50%',
      'Do NOT reveal how much money you actually have',
      'Get any settlement in writing BEFORE sending payment',
      'Never pay by personal check — use money order or cashier\'s check',
    ],
    script: `COLLECTOR: [Answers call]

YOU: "Hello, my name is [YOUR NAME] and I'm calling about account number [ACCOUNT NUMBER]. I understand I owe [COMPANY NAME] money and I want to resolve this today.

I've been going through a serious financial hardship — [brief explanation: job loss/medical bills/etc.] — and I'm not able to pay the full amount. However, I do have access to some funds and I'd like to settle this account.

I can offer [30-35% of the balance] as a lump-sum settlement to resolve this completely. If we can reach an agreement today, I can have a money order ready immediately.

Would you be able to accept that to close the account?"

IF THEY SAY NO:
"I understand. That's genuinely the maximum I can put together. What I'd ask you to consider is that partial payment today is better than continued non-payment. Would you need to speak with a supervisor to authorize a settlement at this level?"

IF THEY COUNTER:
"I appreciate that, but I truly cannot go higher than [AMOUNT]. Let me know if that changes — you have my number."

CRITICAL: Do NOT agree to anything verbally. Say:
"Before I make any payment, I'll need that settlement agreement in writing — either by mail or email. Once I receive that and confirm the terms, I'll process payment immediately."`,
  },
  {
    id: 'debt-validation',
    title: 'Requesting Debt Validation',
    category: 'validation',
    channel: 'phone',
    description: 'Use within 30 days of first contact to demand proof the debt is legitimate.',
    tags: ['validation', 'FDCPA', 'rights', 'first contact'],
    tips: [
      'You have 30 days from first contact to request validation',
      'Send a follow-up validation letter by certified mail',
      'They must stop collection activities until they provide validation',
      'Note the date, time, and representative name',
    ],
    script: `COLLECTOR: [Contact about debt]

YOU: "I'm requesting debt validation under the Fair Debt Collection Practices Act, 15 U.S.C. § 1692g.

I need written verification of:
1. The amount of the debt
2. The name and address of the original creditor
3. Proof that your company is authorized to collect this debt in my state
4. A copy of the original signed agreement

Until you provide this validation, please note that I am formally disputing this debt and requesting that all collection activities cease. This request will be followed up in writing via certified mail.

What is your full name, company name, and mailing address so I can send that certified letter?"`,
  },
  {
    id: 'cease-desist',
    title: 'Cease and Desist — Stop All Contact',
    category: 'rights',
    channel: 'phone',
    description: 'Invoke your FDCPA right to stop all collector contact immediately.',
    tags: ['cease desist', 'FDCPA', 'harassment', 'stop contact'],
    tips: [
      'This stops phone calls but does NOT eliminate the debt',
      'Collector can still sue after receiving a C&D',
      'Always follow up with a certified letter',
      'They may contact you once more to confirm they received the notice',
    ],
    script: `YOU: "I am invoking my right under the Fair Debt Collection Practices Act, Section 805(c), to cease all communication with me regarding this debt.

This means all phone calls, letters, emails, texts, and any other contact must stop immediately. This request applies to your agency and any affiliated companies.

If you continue to contact me after receiving this written notice, you will be in violation of the FDCPA and I will file a complaint with the Consumer Financial Protection Bureau and my state Attorney General's office.

A written cease and desist letter will be sent to your address via certified mail. Please provide your mailing address now."

IF THEY ASK WHY:
"I am not required to provide a reason. I am invoking a right granted to me by federal law."`,
  },
  {
    id: 'goodwill-deletion-call',
    title: 'Goodwill Deletion Request',
    category: 'credit',
    channel: 'phone',
    description: 'Ask a creditor to remove a negative mark as a goodwill gesture (works best when account is now current).',
    tags: ['goodwill', 'credit repair', 'negative mark', 'deletion'],
    tips: [
      'Best used when the account is now paid or current',
      'Be genuinely apologetic and explain the hardship',
      'Ask for a specific person\'s name and their supervisor',
      'Follow up with a written goodwill letter',
    ],
    script: `YOU: "Hello, may I speak with someone in the customer retention or goodwill department?

[Once transferred]

My name is [NAME] and I have account number [ACCOUNT NUMBER]. I've been a customer for [X years] and I want to talk about a late payment on my credit report from [DATE].

At that time, I was going through [medical emergency/job loss/family crisis]. It was completely out of character for me — I've had a perfect payment history before and since then.

I've since [resolved the situation / paid the account in full / set up automatic payments]. I'm asking if your company would consider removing that negative mark from my credit report as a goodwill gesture. I know you're not required to, but I'm hoping you'll consider my long account history and my commitment to being a responsible customer.

Would you be able to approve a goodwill deletion, or is there someone with the authority to do so?"`,
  },
  {
    id: 'pay-for-delete',
    title: 'Pay-for-Delete Negotiation',
    category: 'credit',
    channel: 'phone',
    description: 'Offer payment in exchange for complete removal of the account from credit reports.',
    tags: ['pay for delete', 'credit report', 'settlement', 'deletion'],
    tips: [
      'Not all creditors will agree — collection agencies are more likely than original creditors',
      'Get the agreement in writing before paying',
      'Make sure the agreement specifies removal from ALL three bureaus',
      'Large banks rarely do this; smaller collectors sometimes will',
    ],
    script: `YOU: "I'm calling about account [ACCOUNT NUMBER] with [CREDITOR NAME]. I understand there's an outstanding balance of [AMOUNT] that's affecting my credit report.

I'm prepared to pay [SETTLEMENT AMOUNT — typically 40-60% of balance] to fully satisfy this debt, but only on the condition that your company agrees to delete the account from all three credit bureaus — Experian, Equifax, and TransUnion — within 30 days of payment.

This is a standard pay-for-delete arrangement. I'll need this agreement in writing before I make any payment. The letter should state the amount we've agreed to, and that upon receipt of payment, you will request deletion from all three bureaus.

Are you authorized to approve this type of arrangement, or do I need to speak with a supervisor or your credit department?"`,
  },
  {
    id: 'credit-bureau-dispute',
    title: 'Disputing with Credit Bureaus',
    category: 'credit',
    channel: 'phone',
    description: 'Script for calling Experian, Equifax, or TransUnion to dispute inaccurate information.',
    tags: ['credit bureau', 'FCRA', 'dispute', 'Experian', 'Equifax', 'TransUnion'],
    tips: [
      'Credit bureaus must investigate within 30 days',
      'It\'s often more effective to dispute in writing via certified mail',
      'You can also dispute online at each bureau\'s website',
      'If they verify incorrectly, you can request method of verification',
    ],
    script: `YOU: "Hello, I'm calling to initiate a dispute under the Fair Credit Reporting Act for an item on my credit report.

I'm [FULL NAME], date of birth [DOB], last 4 of SSN [####], address [ADDRESS].

I'm disputing the following item:
- Creditor/Account Name: [CREDITOR]
- Account Number: [ACCOUNT NUMBER]
- Reason for Dispute: [This account is not mine / The balance is incorrect / This account was paid / This is past the statute of limitations / etc.]

Under the FCRA, you are required to investigate this dispute within 30 days and remove or correct any information that cannot be verified.

Can you please confirm you've opened a dispute on this item and provide me with the dispute reference number? I will also be sending a written dispute via certified mail."`,
  },
]

export const SCRIPT_CATEGORIES = [
  { value: 'all', label: 'All Scripts' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'validation', label: 'Debt Validation' },
  { value: 'rights', label: 'Know Your Rights' },
  { value: 'credit', label: 'Credit Report' },
]
