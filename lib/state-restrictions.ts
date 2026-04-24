/**
 * State-level service tiers for DebtCoach AI.
 *
 * ⚠️  LEGAL NOTICE: This file was compiled from legal research as of April 2026.
 *     It is NOT legal advice. Have a licensed attorney review before launch.
 *
 * KEY LEGAL DISTINCTION:
 * State debt management / debt settlement licensing laws target companies that:
 *   (a) Receive money from consumers to pay creditors, or
 *   (b) Negotiate with creditors on behalf of consumers for a fee, or
 *   (c) Hold consumer funds in trust accounts.
 *
 * DebtCoach AI does NONE of those things. It:
 *   • Provides general consumer rights information (FDCPA, FCRA, SOL)
 *   • Generates letter templates for consumers to use themselves
 *   • Does NOT negotiate with creditors on anyone's behalf
 *   • Does NOT receive, hold, or distribute consumer funds
 *   • Does NOT create an attorney-client relationship
 *   • Charges a flat software subscription — not a percentage of enrolled debt
 *
 * Because DebtCoach AI is a self-help educational software tool, not a debt
 * settlement or debt management company, the licensing statutes cited below
 * do NOT clearly apply. The BLOCKED tier has been removed. A CAUTION tier
 * is retained for states whose regulators have historically applied broad
 * interpretations or where pending legislation could affect AI legal tools.
 *
 * TIER SYSTEM:
 *  CAUTION — Service available with enhanced state-specific disclaimers.
 *  ALLOWED — Standard disclaimer only.
 *
 * Last reviewed: 2026-04-23
 */

export type RestrictionTier = 'BLOCKED' | 'CAUTION' | 'ALLOWED'

// ─── BLOCKED STATES ───────────────────────────────────────────────────────────
// Intentionally empty. DebtCoach AI is available in all 50 states + DC.
// As a self-help educational software tool it does not fall under debt
// settlement / debt management licensing statutes. See header comment above.
export const BLOCKED_STATES: string[] = []

// ─── CAUTION STATES ───────────────────────────────────────────────────────────
// These states have broad regulatory definitions, active AG enforcement, or
// pending AI-specific legislation. Service is fully available; enhanced
// disclaimers are shown to users in these states.

export const CAUTION_STATES: string[] = [
  'NC', // Debt Settlement Services Act (eff. Jan 1, 2026) — broadly drafted; enhanced disclaimer prudent
  'CA', // DFPI broad consumer protection enforcement; aggressive UPL environment
  'IL', // Broad Debt Settlement Consumer Protection Act definitions; AG actively enforces
  'WA', // Debt Adjusting Act — AG has historically applied broadly; enhanced disclaimer prudent
  'NY', // SB 7263 (2026) proposes AI "substantive advice" liability; treat as elevated risk
  'TX', // Finance Code Ch. 394 — registration required for debt management companies; software exemption exists (§ 81.101) but add disclaimer
  'HI', // HRS § 446-2 — criminal statute targets fund-holding intermediaries, not software; CAUTION for belt-and-suspenders
  'LA', // § 14:331 criminal prohibition on debt adjusting (fund-holding); software tools not covered; CAUTION
  'AR', // Debt Adjusting Act criminal penalties apply to fund-holding intermediaries; software not covered; CAUTION
  'FL', // No statewide debt settlement license but active UPL enforcement
  'MA', // AG aggressively enforces UPL; enhanced disclaimer prudent
  'GA', // Debt Adjustment Act — broad; license required for companies negotiating with creditors
  'VA', // License required for debt settlement services; AI tools not clearly covered
  'CO', // OARC adopted nonprosecution policy (Sept. 2025) for AI legal tools with proper disclosures — FAVORABLE but keep caution
]

// ─── RESTRICTION NOTES ───────────────────────────────────────────────────────
export const RESTRICTION_NOTES: Record<string, string> = {
  NC: 'North Carolina Debt Settlement Services Act (N.C. Gen. Stat. Ch. 53, Art. 26, eff. Jan. 1, 2026). DebtCoach AI is a self-help educational tool and does not negotiate with creditors on your behalf.',
  CA: 'California DFPI consumer protection laws are broadly enforced. DebtCoach AI is not a debt settlement or debt management service.',
  IL: 'Illinois Debt Settlement Consumer Protection Act (225 ILCS 429) applies to debt settlement companies. DebtCoach AI is a self-help software tool.',
  WA: 'Washington Debt Adjusting Act (RCW Ch. 18.28) regulates companies that negotiate with creditors. DebtCoach AI does not negotiate on your behalf.',
  NY: 'New York pending legislation (SB 7263) may impose additional AI disclosure requirements. All content is general information only.',
  TX: 'Texas Finance Code Ch. 394 regulates debt management companies. A software exemption exists under Tex. Gov\'t Code § 81.101 for tools that clearly disclose they are not a substitute for attorney advice.',
  HI: 'Hawaii Rev. Stat. § 446-2 prohibits commercial debt adjusting (receiving/distributing consumer funds). DebtCoach AI does not hold or distribute funds.',
  LA: 'Louisiana Rev. Stat. § 14:331 prohibits for-profit debt adjusting (acting as a fund-holding intermediary). DebtCoach AI is not a debt adjuster.',
  AR: 'Arkansas Debt Adjusting Act (§ 5-63-301) applies to companies acting as intermediaries for consumer funds. DebtCoach AI is a self-help tool.',
  FL: 'Florida UPL laws are actively enforced. All letters are templates for your own use; DebtCoach AI does not provide legal representation.',
  MA: 'Massachusetts AG actively enforces consumer protection and UPL laws. All content is for educational purposes only.',
  GA: 'Georgia Debt Adjustment Act (Ga. Code Ann. § 18-5-1) applies to companies negotiating with creditors. DebtCoach AI provides tools for you to negotiate yourself.',
  VA: 'Virginia Code § 6.2-2027 requires licensing for debt settlement services. DebtCoach AI does not provide debt settlement services.',
  CO: 'Colorado OARC adopted a favorable nonprosecution policy (Sept. 2025) for AI legal tools with proper disclosures. All content is educational only.',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getStateTier(stateCode: string | null | undefined): RestrictionTier {
  if (!stateCode) return 'ALLOWED'
  const code = stateCode.toUpperCase().trim()
  if (BLOCKED_STATES.includes(code)) return 'BLOCKED'
  if (CAUTION_STATES.includes(code)) return 'CAUTION'
  return 'ALLOWED'
}

export function isStateBlocked(stateCode: string | null | undefined): boolean {
  return getStateTier(stateCode) === 'BLOCKED'
}

export function isStateCaution(stateCode: string | null | undefined): boolean {
  return getStateTier(stateCode) === 'CAUTION'
}

export const BLOCKED_STATE_MESSAGE =
  'DebtCoach AI is not currently available in your state.'

export const CAUTION_STATE_DISCLAIMER =
  'Your state has specific regulations around debt management and debt settlement services. ' +
  'DebtCoach AI is a self-help educational software tool — it provides general consumer ' +
  'legal information and letter templates for your own use. It does not negotiate with ' +
  'creditors on your behalf, does not hold or distribute funds, and does not create an ' +
  'attorney-client relationship. This software is not a substitute for the advice of a ' +
  'licensed attorney. Consult a licensed attorney or nonprofit credit counselor (nfcc.org) ' +
  'for personalized guidance.'

// ─── FULL STATE LIST (for dropdowns) ─────────────────────────────────────────
export const US_STATES = [
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
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
]
