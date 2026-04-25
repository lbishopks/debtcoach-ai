export type DebtCategory =
  | 'credit_card'
  | 'medical'
  | 'personal_loan'
  | 'auto'
  | 'student_loan_private'
  | 'utility'
  | 'other'

export interface SOLEntry {
  /** Written contract SOL in years (medical, personal loan, auto, private student loan) */
  writtenContract: number
  /** Open account SOL in years (credit cards) */
  openAccount: number
  /** Oral contract SOL in years */
  oral: number
}

/**
 * Statute of Limitations data by US state/territory.
 * openAccount: used for credit cards.
 * writtenContract: used for medical, personal loan, auto, student loans.
 * oral: used for utility/other debts where no written contract.
 *
 * Sources: state statutes as publicly reported. For informational purposes only.
 */
export const SOL_BY_STATE: Record<string, SOLEntry> = {
  AL: { writtenContract: 6, openAccount: 6, oral: 6 },
  AK: { writtenContract: 3, openAccount: 3, oral: 3 },
  AZ: { writtenContract: 6, openAccount: 6, oral: 3 },
  AR: { writtenContract: 5, openAccount: 5, oral: 3 },
  CA: { writtenContract: 4, openAccount: 4, oral: 2 },
  CO: { writtenContract: 6, openAccount: 6, oral: 6 },
  CT: { writtenContract: 6, openAccount: 6, oral: 3 },
  DE: { writtenContract: 3, openAccount: 3, oral: 3 },
  FL: { writtenContract: 5, openAccount: 5, oral: 4 },
  GA: { writtenContract: 6, openAccount: 6, oral: 4 },
  HI: { writtenContract: 6, openAccount: 6, oral: 6 },
  ID: { writtenContract: 5, openAccount: 5, oral: 4 },
  IL: { writtenContract: 5, openAccount: 5, oral: 5 },
  IN: { writtenContract: 6, openAccount: 6, oral: 6 },
  IA: { writtenContract: 5, openAccount: 5, oral: 5 },
  KS: { writtenContract: 5, openAccount: 5, oral: 3 },
  KY: { writtenContract: 5, openAccount: 5, oral: 5 },
  LA: { writtenContract: 3, openAccount: 3, oral: 3 },
  ME: { writtenContract: 6, openAccount: 6, oral: 6 },
  MD: { writtenContract: 3, openAccount: 3, oral: 3 },
  MA: { writtenContract: 6, openAccount: 6, oral: 6 },
  MI: { writtenContract: 6, openAccount: 6, oral: 6 },
  MN: { writtenContract: 6, openAccount: 6, oral: 6 },
  MS: { writtenContract: 3, openAccount: 3, oral: 3 },
  MO: { writtenContract: 5, openAccount: 5, oral: 5 },
  MT: { writtenContract: 5, openAccount: 5, oral: 5 },
  NE: { writtenContract: 5, openAccount: 5, oral: 4 },
  NV: { writtenContract: 6, openAccount: 6, oral: 4 },
  NH: { writtenContract: 3, openAccount: 3, oral: 3 },
  NJ: { writtenContract: 6, openAccount: 6, oral: 6 },
  NM: { writtenContract: 6, openAccount: 6, oral: 4 },
  NY: { writtenContract: 6, openAccount: 6, oral: 6 },
  NC: { writtenContract: 3, openAccount: 3, oral: 3 },
  ND: { writtenContract: 6, openAccount: 6, oral: 6 },
  OH: { writtenContract: 6, openAccount: 6, oral: 6 },
  OK: { writtenContract: 5, openAccount: 5, oral: 3 },
  OR: { writtenContract: 6, openAccount: 6, oral: 6 },
  PA: { writtenContract: 4, openAccount: 4, oral: 4 },
  RI: { writtenContract: 10, openAccount: 10, oral: 10 },
  SC: { writtenContract: 3, openAccount: 3, oral: 3 },
  SD: { writtenContract: 6, openAccount: 6, oral: 6 },
  TN: { writtenContract: 6, openAccount: 6, oral: 6 },
  TX: { writtenContract: 4, openAccount: 4, oral: 4 },
  UT: { writtenContract: 6, openAccount: 6, oral: 4 },
  VT: { writtenContract: 6, openAccount: 6, oral: 6 },
  VA: { writtenContract: 5, openAccount: 5, oral: 3 },
  WA: { writtenContract: 6, openAccount: 6, oral: 3 },
  WV: { writtenContract: 10, openAccount: 10, oral: 10 },
  WI: { writtenContract: 6, openAccount: 6, oral: 6 },
  WY: { writtenContract: 8, openAccount: 8, oral: 8 },
  DC: { writtenContract: 3, openAccount: 3, oral: 3 },
}

export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'DC', name: 'Washington, D.C.' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
  credit_card: 'Credit Card',
  medical: 'Medical Debt',
  personal_loan: 'Personal Loan',
  auto: 'Auto Loan',
  student_loan_private: 'Private Student Loan',
  utility: 'Utility Bill',
  other: 'Other Debt',
}

/**
 * Returns the SOL in years for a given state and debt category.
 */
export function getSOLYears(stateCode: string, category: DebtCategory): number {
  const entry = SOL_BY_STATE[stateCode.toUpperCase()]
  if (!entry) return 6 // safe default

  switch (category) {
    case 'credit_card':
      return entry.openAccount
    case 'medical':
    case 'personal_loan':
    case 'auto':
    case 'student_loan_private':
      return entry.writtenContract
    case 'utility':
    case 'other':
      return entry.oral
    default:
      return entry.writtenContract
  }
}

export interface SOLStatus {
  isTimedOut: boolean
  yearsTotal: number
  yearsElapsed: number
  yearsRemaining: number
  monthsRemaining: number
  expiryDate: Date
  /** safe = >2 years remaining, warning = <2 years remaining, expired = timed out */
  warningLevel: 'safe' | 'warning' | 'expired'
}

/**
 * Calculates the SOL status given a state, debt category, and last activity date string (YYYY-MM-DD).
 */
export function calculateSOLStatus(
  stateCode: string,
  category: DebtCategory,
  lastActivityDate: string,
): SOLStatus {
  const yearsTotal = getSOLYears(stateCode, category)
  const lastActivity = new Date(lastActivityDate + 'T00:00:00')
  const expiryDate = new Date(lastActivity)
  expiryDate.setFullYear(expiryDate.getFullYear() + yearsTotal)

  const now = new Date()
  const msElapsed = now.getTime() - lastActivity.getTime()
  const msTotal = expiryDate.getTime() - lastActivity.getTime()
  const msRemaining = expiryDate.getTime() - now.getTime()

  const yearsElapsed = msElapsed / (1000 * 60 * 60 * 24 * 365.25)
  const yearsRemaining = Math.max(0, msRemaining / (1000 * 60 * 60 * 24 * 365.25))
  const monthsRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 30.44)))
  const isTimedOut = now >= expiryDate

  let warningLevel: 'safe' | 'warning' | 'expired'
  if (isTimedOut) {
    warningLevel = 'expired'
  } else if (yearsRemaining < 2) {
    warningLevel = 'warning'
  } else {
    warningLevel = 'safe'
  }

  return {
    isTimedOut,
    yearsTotal,
    yearsElapsed: Math.round(yearsElapsed * 10) / 10,
    yearsRemaining: Math.round(yearsRemaining * 10) / 10,
    monthsRemaining,
    expiryDate,
    warningLevel,
  }
}
