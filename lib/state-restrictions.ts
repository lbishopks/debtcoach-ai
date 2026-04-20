/**
 * State-level service restrictions for DebtCoach AI.
 *
 * ⚠️  LEGAL NOTICE: This file was compiled from legal research as of April 2026.
 *     It is NOT legal advice. Have a licensed attorney in each state review
 *     before launch. The law in this area is rapidly evolving.
 *
 * REGULATORY FRAMEWORK:
 * Two separate bodies of law can restrict this service:
 *  1. State Debt Settlement / Debt Management Services licensing laws
 *  2. Unauthorized Practice of Law (UPL) — bars non-attorneys from giving legal advice
 *
 * KEY DISTINCTION: DebtCoach AI does NOT negotiate with creditors, does NOT hold
 * client funds, and does NOT create an attorney-client relationship. It provides
 * general consumer legal INFORMATION and letter templates. This distinction matters
 * for legal defensibility but is NOT universally dispositive.
 *
 * TIER SYSTEM:
 *  BLOCKED — Service unavailable. Users see referral to lawhelp.org / nfcc.org.
 *  CAUTION — Service available with enhanced state-specific disclaimers.
 *  ALLOWED — No material restriction beyond standard UPL disclaimer.
 *
 * HOW TO UPDATE:
 *  1. Edit the arrays below.
 *  2. Update RESTRICTION_NOTES with the legal citation.
 *  3. Bump RESTRICTIONS_LAST_REVIEWED date.
 *
 * Last reviewed: 2026-04-20
 */

export type RestrictionTier = 'BLOCKED' | 'CAUTION' | 'ALLOWED'

// ─── BLOCKED STATES (26) ──────────────────────────────────────────────────────
// These states have debt settlement / management licensing laws that require a
// license the service cannot obtain, or have outright criminal prohibitions.
//
// NOTE ON TEXAS: TX Finance Code § 394 requires registration, BUT TX Gov't Code
// § 81.101 exempts software that "clearly and conspicuously states the products are
// not a substitute for the advice of an attorney." Consider seeking TX attorney
// review before permanently blocking — a proper disclaimer may be sufficient.
//
// NOTE ON CALIFORNIA: DFPI registration requirement effective Feb. 15, 2025.
// Registration is theoretically obtainable; consult counsel on whether to pursue.

export const BLOCKED_STATES: string[] = [
  'NC', // NC Debt Settlement Services Act, N.C. Gen. Stat. Ch. 53 Art. 26 (eff. Jan 1, 2026) — license required; no SaaS exemption
  'HI', // HRS § 446-2 — debt adjusting is a CRIMINAL OFFENSE; no license pathway for for-profit companies
  'LA', // La. Rev. Stat. § 14:331 — for-profit debt adjusting is a criminal misdemeanor; no licensing pathway
  'AR', // Ark. Code Ann. § 5-63-301 — Debt Adjusting Act; criminal penalties; no commercial license available
  'WY', // Wyo. Stat. § 33-14-101 — debt adjusting prohibited; criminal penalties; no license available
  'IL', // 225 ILCS 429 — Debt Settlement Consumer Protection Act; license required; penalties up to 4× enrolled debt
  'CA', // Cal. Financial Code § 12100 + DFPI registration required (eff. Feb. 15, 2025)
  'MN', // Minn. Stat. Ch. 332B — registration required with MN Dept. of Commerce; broadly defined
  'TX', // Tex. Finance Code Ch. 394 — registration required; see note above re: § 81.101 software exemption
  'VA', // Va. Code Ann. § 6.2-2027 — license required from VA SCC; $25,000 surety bond; no software exemption
  'MI', // Mich. Comp. Laws § 451.411 — Debt Management Act (Act 148 of 1975); license required; no SaaS exemption
  'PA', // Pa. Stat. Ann. tit. 63 — Debt Management Services Act (Act 117 of 2008); license via NMLS
  'MS', // Miss. Code Ann. § 81-22-1 — Debt Management Services Act; license required from MS Banking Dept.
  'NV', // NRS Ch. 676A — Uniform Debt-Management Services Act; registration required; attorney/CPA exemptions only
  'DE', // 6 Del. C. Ch. 24A — Uniform Debt-Management Services Act; license required from DE Attorney General
  'CT', // Conn. Gen. Stat. § 36a-655 — Debt Negotiation; license required; $40,000–$50,000 surety bond
  'MD', // Md. Code Ann., Fin. Inst. § 12-901 — Debt Management Services; license required
  'OR', // Or. Rev. Stat. § 697.602 — Debt Management Service Providers; registration + $25,000 surety bond
  'NH', // RSA Ch. 399-D — Debt Adjustment Services; license required from NH Banking Dept.
  'GA', // Ga. Code Ann. § 18-5-1 — Debt Adjustment Act; among strictest; 7.5% fee cap; license/registration required
  'IA', // Iowa Code § 533A — Debt Management; license required from Iowa Division of Banking
  'WA', // RCW Ch. 18.28 — Debt Adjusting; fee caps + conduct requirements; offering for compensation triggers Act
  'NJ', // N.J. Stat. Ann. § 17:16G — Debt Adjustment; Debt Adjuster License required; $50,000 surety bond
  'MO', // Mo. Rev. Stat. § 425.010 — Debt Adjustment Act; license required from MO Division of Finance
  'NM', // N.M. Stat. Ann. § 58-15-1 — Debt Management Services; license required
  'WI', // Wis. Stat. § 218.02 — Adjustment Service Companies; license required; debt settlement fee structures non-compliant
]

// ─── CAUTION STATES (24 + DC) ────────────────────────────────────────────────
// Service is available but extra disclaimers and state-specific acknowledgment required.

export const CAUTION_STATES: string[] = [
  'NY', // NY SB 7263 (passed Senate committee Feb. 2026) would create private right of action for AI "substantive" professional advice — treat as imminent RED
  'FL', // No statewide debt settlement license but FL UPL laws actively enforced; letter generation may be questioned
  'OH', // Ohio Rev. Code Ch. 4710 — Debt Adjusters Act; $100/year fee cap scrutiny; no formal license but compliance expected
  'IN', // IN debt collection registration; ambiguous application to coaching tools
  'RI', // R.I. Gen. Laws § 19-14 — license requirements; degree of applicability to SaaS unclear
  'TN', // Tenn. Code Ann. § 47-18-109 — Consumer Protection Act; disclosure requirements for debt settlement
  'CO', // Debt settlement bond/registration required BUT Colorado OARC adopted nonprosecution policy (Sept. 2025) for AI legal tools with proper attorney supervision + disclosures
  'AZ', // A.R.S. § 6-702 — Debt Management license under AZ Dept. of Financial Institutions; exemptions may apply
  'MA', // Mass. Gen. Laws Ch. 180; no clear commercial debt settlement license but AG aggressively enforces UPL
  'KY', // KRS § 380.010 — Debt Adjusting; license required for debt adjusters; fee structure regulated
  'SC', // S.C. Code Ann. § 37-7-101 — debt settlement services restricted; major companies don't operate in SC
  'ME', // Me. Rev. Stat. tit. 32 § 6171 — debt settlement restricted; licensing requirements apply
  'VT', // 8 V.S.A. Ch. 83 — Debt Adjusters; licensing required; major debt settlement companies unavailable
  'WV', // W.Va. Code § 46A — Consumer Credit Protection Act; debt settlement restricted
  'KS', // K.S.A. 50-1116 — Credit Services Organization Act; may apply depending on service structure
  'ND', // N.D. Cent. Code § 13-06 — Debt Settlement Services; restrictions; major companies unavailable
  'UT', // Utah AI Policy Act (UAIPA, 2024/2025) — AI disclosure obligations; regulatory sandbox FAVORABLE for AI legal tools
  'NE', // Neb. Rev. Stat. § 69-2001 — Debt Management Services Act; license requirements
  'MT', // Montana Consumer Protection Act; registration required with MT Office of Consumer Protection
  'ID', // Idaho Code § 26-2231 — debt management licensing applies
  'OK', // Okla. Stat. tit. 14A — Consumer Credit Code; broad consumer protection provisions
  'AK', // No specific debt settlement license; ambiguous — SaaS consumer tool may be outside scope
  'DC', // D.C. Code § 28-3814 — consumer protection; debt adjusting licensing
  'AL', // No debt settlement license requirement; strong disclaimers sufficient; listed CAUTION for UPL risk
  'SD', // No specific debt settlement prohibition; CAUTION for general UPL
]

// ─── RESTRICTION NOTES (legal citations for the blocked state display) ────────

export const RESTRICTION_NOTES: Record<string, string> = {
  NC: 'N.C. Gen. Stat. Ch. 53, Art. 26 — Debt Settlement Services Act (eff. Jan. 1, 2026). License required; no SaaS exemption.',
  HI: 'Hawaii Rev. Stat. § 446-2 — Debt adjusting is a criminal offense in Hawaii; no commercial license pathway exists.',
  LA: 'La. Rev. Stat. § 14:331 — For-profit debt adjusting is a criminal misdemeanor in Louisiana.',
  AR: 'Ark. Code Ann. § 5-63-301 — Debt Adjusting Act. Criminal penalties apply; no commercial license available.',
  WY: 'Wyo. Stat. § 33-14-101 — Debt adjusting prohibited with criminal penalties.',
  IL: '225 ILCS 429 — Debt Settlement Consumer Protection Act. License required from IL Dept. of Financial & Professional Regulation.',
  CA: 'Cal. Financial Code § 12100 + DFPI registration requirement (effective Feb. 15, 2025).',
  MN: 'Minn. Stat. Ch. 332B — Debt Settlement Services. Registration required with MN Dept. of Commerce.',
  TX: 'Tex. Finance Code Ch. 394 — Consumer Debt Management Services. Registration required with TX OCCC.',
  VA: 'Va. Code Ann. § 6.2-2027 — License required from VA State Corporation Commission.',
  MI: 'Mich. Comp. Laws § 451.411 — Debt Management Act (Act 148 of 1975). License required.',
  PA: 'Pa. Debt Management Services Act (Act 117 of 2008). License required via NMLS.',
  MS: 'Miss. Code Ann. § 81-22-1 — Debt Management Services Act. License required.',
  NV: 'NRS Ch. 676A — Uniform Debt-Management Services Act. Registration required.',
  DE: '6 Del. C. Ch. 24A — Uniform Debt-Management Services Act. License required from DE Attorney General.',
  CT: 'Conn. Gen. Stat. § 36a-655 — Debt Negotiation. License required; $50,000 surety bond.',
  MD: 'Md. Code Ann., Fin. Inst. § 12-901 — Debt Management Services. License required.',
  OR: 'Or. Rev. Stat. § 697.602 — Debt Management Service Providers. Registration + $25,000 surety bond.',
  NH: 'RSA Ch. 399-D — Debt Adjustment Services. License required from NH Banking Dept.',
  GA: 'Ga. Code Ann. § 18-5-1 — Debt Adjustment Act. License/registration required; 7.5% fee cap.',
  IA: 'Iowa Code § 533A — Debt Management. License required from Iowa Division of Banking.',
  WA: 'RCW Ch. 18.28 — Debt Adjusting Act. Fee caps and conduct requirements for compensated services.',
  NJ: 'N.J. Stat. Ann. § 17:16G — Debt Adjustment. Debt Adjuster License required; $50,000 surety bond.',
  MO: 'Mo. Rev. Stat. § 425.010 — Debt Adjustment Act. License required from MO Division of Finance.',
  NM: 'N.M. Stat. Ann. § 58-15-1 — Debt Management Services. License required.',
  WI: 'Wis. Stat. § 218.02 — Adjustment Service Companies. License required.',
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
  'DebtCoach AI is not currently available to residents of your state due to state-specific ' +
  'licensing requirements for debt management services. We recommend visiting ' +
  'lawhelp.org or nfcc.org to find free, licensed help in your area.'

export const CAUTION_STATE_DISCLAIMER =
  'Your state has specific regulations around debt management and debt settlement services. ' +
  'DebtCoach AI provides general consumer legal information and letter templates only — ' +
  'it does not constitute legal advice, does not negotiate with creditors on your behalf, ' +
  'and does not create an attorney-client relationship. ' +
  'Consult a licensed attorney or nonprofit credit counselor for personalized guidance. ' +
  'This software is not a substitute for the advice of an attorney.'

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
