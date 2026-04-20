import { z } from 'zod'
import { NextResponse } from 'next/server'

// ─── Sanitize a string: strip HTML tags, control chars, limit length ───────────
export function sanitize(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLength)
}

// ─── Safe number: coerce to finite number, return 0 if invalid ────────────────
export function safeNumber(value: unknown, max = 999_999_999): number {
  const n = Number(value)
  if (!isFinite(n) || isNaN(n)) return 0
  return Math.min(Math.abs(n), max)
}

// ─── Generic safe error response — never leaks internals to the client ────────
export function safeError(err: unknown, label: string): NextResponse {
  console.error(`[${label}]`, err)
  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  )
}

// ─── Zod schemas for every API endpoint ───────────────────────────────────────

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(10_000, 'Message too long'),
    })
  ).min(1).max(100),
  conversationId: z.string().max(100).optional().nullable(),
  debtId: z.string().uuid('Invalid debt ID').optional().nullable(),
})

const VALID_LETTER_TYPES = [
  'dispute', 'validation', 'cease_desist', 'goodwill', 'pay_for_delete',
  'debt_settlement', 'hardship', 'identity_theft', 'statute_of_limitations',
  'fdcpa_violation', 'medical_debt', 'original_creditor_dispute',
  'account_not_mine', 'payment_plan', 'delete_after_payment',
] as const

export const letterSchema = z.object({
  letterType: z.enum(VALID_LETTER_TYPES),
  creditorName: z.string().min(1, 'Creditor name required').max(200),
  accountNumber: z.string().max(50).optional().nullable(),
  debtId: z.string().uuid('Invalid debt ID').optional().nullable(),
  disputeReason: z.string().max(200).optional().nullable(),
  additionalDetails: z.string().max(1_000).optional().nullable(),
  amount: z.union([z.string(), z.number()]).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  fdcpaViolations: z.string().max(500).optional().nullable(),
  settlementOffer: z.union([z.string(), z.number()]).optional().nullable(),
  contactDates: z.string().max(200).optional().nullable(),
})

const VALID_DEBT_TYPES = [
  'credit_card', 'medical', 'personal_loan', 'auto', 'student', 'mortgage', 'utility', 'other',
] as const

export const situationSchema = z.object({
  totalDebt: z.union([z.string(), z.number()]).transform(v => safeNumber(v, 10_000_000)),
  debtTypes: z.array(z.string().max(50)).max(10),
  monthlyIncome: z.union([z.string(), z.number()]).transform(v => safeNumber(v, 1_000_000)),
  monthlyExpenses: z.union([z.string(), z.number()]).transform(v => safeNumber(v, 1_000_000)),
  state: z.string().max(50),
  creditScore: z.string().max(50),
  oldestDebtAge: z.string().max(50),
  employmentStatus: z.string().max(100),
  hasAssets: z.boolean(),
  primaryGoal: z.string().max(200),
  additionalContext: z.string().max(500).optional().nullable(),
})

const VALID_BUREAUS = ['equifax', 'experian', 'transunion', 'all', 'all_three'] as const
const VALID_DISPUTE_TYPES = [
  'account_not_mine', 'incorrect_balance', 'incorrect_status', 'late_payment_error',
  'identity_theft', 'account_paid_not_updated', 'duplicate_account',
  'incorrect_inquiry', 'outdated_information', 'incorrect_personal_info',
] as const

export const disputeSchema = z.object({
  bureau: z.enum(VALID_BUREAUS),
  disputeType: z.enum(VALID_DISPUTE_TYPES),
  creditorName: z.string().min(1).max(200),
  accountNumber: z.string().max(50).optional().nullable(),
  reportedBalance: z.union([z.string(), z.number()]).optional().nullable(),
  correctInfo: z.string().max(500).optional().nullable(),
  additionalDetails: z.string().max(1_000).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  dateOfError: z.string().max(100).optional().nullable(),
  supportingDocs: z.string().max(500).optional().nullable(),
})

export const scriptSchema = z.object({
  scriptId: z.string().max(100),
  debtId: z.string().uuid('Invalid debt ID').optional().nullable(),
  creditorName: z.string().max(200).optional().nullable(),
  balance: z.union([z.string(), z.number()]).optional().nullable(),
  situation: z.string().max(500).optional().nullable(),
})
