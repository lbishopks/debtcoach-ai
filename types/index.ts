export type Plan = 'free' | 'pro'
export type DebtStatus = 'active' | 'in_dispute' | 'settled' | 'paid' | 'closed'
export type DebtType = 'credit_card' | 'medical' | 'student_loan' | 'personal_loan' | 'auto' | 'collections' | 'mortgage' | 'other'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export type LetterType =
  | 'dispute'
  | 'validation'
  | 'cease_desist'
  | 'goodwill'
  | 'pay_for_delete'
  | 'debt_settlement'
  | 'hardship'
  | 'identity_theft'
  | 'statute_of_limitations'
  | 'fdcpa_violation'
  | 'medical_debt'
  | 'original_creditor_dispute'
  | 'account_not_mine'
  | 'payment_plan'
  | 'delete_after_payment'

export type BureauTarget = 'equifax' | 'experian' | 'transunion' | 'all_three'
export type BureauDisputeType =
  | 'account_not_mine'
  | 'incorrect_balance'
  | 'incorrect_status'
  | 'late_payment_error'
  | 'identity_theft'
  | 'account_paid_not_updated'
  | 'duplicate_account'
  | 'incorrect_inquiry'
  | 'outdated_information'
  | 'incorrect_personal_info'

export interface User {
  id: string
  email: string
  full_name: string
  state: string
  plan: Plan
  stripe_customer_id?: string
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  creditor_name: string
  debt_type: DebtType
  original_amount: number
  current_balance: number
  days_past_due: number
  status: DebtStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  user_id: string
  debt_id?: string
  messages: Message[]
  title?: string
  created_at: string
  updated_at: string
}

export interface Letter {
  id: string
  user_id: string
  debt_id?: string
  letter_type: LetterType
  content: string
  creditor_name: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  plan: Plan
  status: SubscriptionStatus
  current_period_end: string
}

export interface ScriptTemplate {
  id: string
  title: string
  category: string
  description: string
  script: string
  tags: string[]
}

export interface SituationInput {
  totalDebt: string
  debtTypes: string[]
  monthlyIncome: string
  monthlyExpenses: string
  state: string
  creditScore: string
  oldestDebtAge: string
  employmentStatus: string
  hasAssets: boolean
  primaryGoal: string
  additionalContext: string
}

export interface PriorityAction {
  step: number
  action: string
  urgency: 'immediate' | 'this_week' | 'this_month'
  detail: string
}
