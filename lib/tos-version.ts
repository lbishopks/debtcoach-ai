/**
 * Current Terms of Service version.
 * Format: YYYY-MM-DD of the effective date.
 *
 * To trigger re-acceptance for all existing users:
 * 1. Update this string to the new effective date
 * 2. Update TOS_CHANGELOG below with what changed
 * 3. Deploy — users will see the compact "what changed" modal on next login
 */
export const CURRENT_TOS_VERSION = '2026-04-19'

/**
 * Human-readable summary of what changed since the previous version.
 * Shown in the compact update modal for returning users.
 * Keep to 3-4 bullet points max.
 */
export const TOS_CHANGELOG = [
  'Added comprehensive AI disclosure explaining how Claude AI generates your letters',
  'Clarified that this Service provides legal information, not legal advice',
  'Added mandatory arbitration clause with 30-day opt-out right',
  'Added CCPA and GLBA privacy protections for your financial information',
]

/** Effective date formatted for display */
export const TOS_EFFECTIVE_DATE = 'April 19, 2026'
