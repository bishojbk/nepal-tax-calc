import type { FilingStatus, RemoteGrade, FiscalYear } from '@/config/tax'
import { TAX_YEARS } from '@/config/tax'

export interface CalcOptions {
  fiscalYear: FiscalYear
  filingStatus: FilingStatus
  includeSSF: boolean
  // true  → entered gross already includes employer's 20% SSF (CTC/loaded — annexure convention).
  //         Full 31% of basic deducts from gross for take-home.
  // false → entered gross excludes employer SSF; employer pays 20% on top.
  //         Only employee's 11% deducts from take-home; employer SSF is added
  //         back to assessable income so tax stays consistent.
  grossIncludesEmployerSSF: boolean
  includeCIT: boolean
  citAmount: number           // monthly; 0 to maxCitMonthly
  lifeInsurance: number       // annual
  healthInsurance: number     // annual
  buildingInsurance: number   // annual
  donationAnnual: number
  remoteAreaGrade: RemoteGrade
  hasDisability: boolean
  isFemale: boolean
  foreignTaxPaidAnnual: number
  hasMedicalExpenses: boolean
  festivalBonusAnnual: number   // Dashain/festival bonus — taxable income, paid once a year (legal min ≈ 1 month basic)
}

export interface CalcResult {
  gross: number
  basic: number
  ssfMonthly: number              // amount actually deducted from gross for take-home
  ssfAnnual: number
  ssfEmployeeMonthly: number      // employee's 11% share
  ssfEmployerMonthly: number      // employer's 20% share (on top of gross in Mode B)
  citMonthly: number
  citAnnual: number
  maxCitMonthly: number
  effectiveRetirementCap: number
  annualTaxable: number
  annualTax: number
  monthlyTax: number
  inhand: number
  effectiveRate: number
  retirementTotal: number
  festivalBonusAnnual: number     // gross festival/Dashain bonus, received once a year
  festivalBonusTax: number        // tax on the bonus (marginal), withheld in the bonus month
  festivalBonusNet: number        // bonus take-home after its own tax
  slabBreakdown: SlabBreakdown[]
}

export interface SlabBreakdown {
  label: string
  rate: number
  income: number
  tax: number
}

function calcSlabTax(
  taxable: number,
  slabs: readonly { readonly upTo: number; readonly rate: number; readonly label: string }[]
): { total: number; breakdown: SlabBreakdown[] } {
  let tax = 0
  let remaining = Math.max(0, taxable)
  let prev = 0
  const breakdown: SlabBreakdown[] = []

  for (const slab of slabs) {
    const band = Math.min(remaining, slab.upTo - prev)
    const bandTax = band * slab.rate
    if (band > 0) {
      breakdown.push({ label: slab.label, rate: slab.rate, income: band, tax: bandTax })
    }
    tax += bandTax
    remaining -= band
    prev = slab.upTo
    if (remaining <= 0) break
  }

  return { total: tax, breakdown }
}

export function calculate(gross: number, opts: CalcOptions): CalcResult {
  const CFG = TAX_YEARS[opts.fiscalYear]
  const annualGross = gross * 12
  const { basicRatio } = CFG.salary
  const { employeeRate, employerRate, totalRate } = CFG.ssf

  // Basic salary:
  //   Mode A (loaded gross, default): basic = 60% of gross.
  //   Mode B (employee gross):       basic = 60% of total CTC, where CTC = gross + employer SSF.
  //     Solving for basic: basic × (1 - basicRatio × employerRate) = basicRatio × gross
  //     → keeps basic (and therefore tax) consistent with the equivalent Mode A salary.
  const basic = opts.grossIncludesEmployerSSF
    ? gross * basicRatio
    : (gross * basicRatio) / (1 - basicRatio * employerRate)

  // SSF split
  const ssfEmployeeMonthly = opts.includeSSF ? basic * employeeRate : 0
  const ssfEmployerMonthly = opts.includeSSF ? basic * employerRate : 0
  const ssfTotalMonthly = opts.includeSSF ? basic * totalRate : 0

  // What comes out of gross for take-home:
  //   Mode A: full 31% (employer 20% is already baked into the gross figure).
  //   Mode B: only the employee's 11%.
  const ssfMonthly = opts.grossIncludesEmployerSSF ? ssfTotalMonthly : ssfEmployeeMonthly
  const ssfAnnual = ssfMonthly * 12

  // Total SSF contribution that reduces taxable income (always 31% of basic, subject to cap)
  const ssfTaxDeductionAnnual = ssfTotalMonthly * 12

  // Assessable income for tax (regular salary only — the festival bonus is taxed
  // separately below so it doesn't distort the monthly take-home):
  //   Mode A: gross × 12.
  //   Mode B: (gross + employer SSF) × 12 — employer's contribution is part of
  //   employee's assessable income under Nepal's Income Tax Act (ITA 2058 §8).
  const annualAssessable = opts.grossIncludesEmployerSSF
    ? annualGross
    : annualGross + ssfEmployerMonthly * 12

  // Retirement cap: min(5L, 1/3 of annual assessable income)
  const effectiveRetirementCap = Math.min(
    CFG.retirementCap.absoluteMax,
    annualAssessable * CFG.retirementCap.ratioMax
  )
  const maxCitAnnual = Math.max(0, effectiveRetirementCap - ssfTaxDeductionAnnual)
  const maxCitMonthly = maxCitAnnual / 12

  // CIT: use provided amount clamped to max, or 0 if CIT disabled
  const citMonthly = opts.includeCIT ? Math.min(opts.citAmount, maxCitMonthly) : 0
  const citAnnual = citMonthly * 12

  // Special exemptions
  const remoteBonus = CFG.deductions.remoteArea[opts.remoteAreaGrade]
  const disabilityBonus = opts.hasDisability
    ? (CFG.specialExemptions.disability[opts.filingStatus] ?? CFG.specialExemptions.disability.single)
    : 0

  // Taxable income (before donation, to calculate donation cap)
  const preDonation = annualAssessable - ssfTaxDeductionAnnual - citAnnual
    - opts.lifeInsurance - opts.healthInsurance - opts.buildingInsurance
    - remoteBonus - disabilityBonus

  const maxDonation = Math.min(
    CFG.deductions.donation.maxAbsolute,
    preDonation * CFG.deductions.donation.maxPctOfTaxable
  )
  const donation = Math.min(opts.donationAnnual, Math.max(0, maxDonation))
  const annualTaxable = Math.max(0, preDonation - donation)

  // Slabs for the selected filing status (couple absent for years that removed it),
  // with the SST band zeroed out when SSF is active.
  const rawSlabs = CFG.taxSlabs[opts.filingStatus] ?? CFG.taxSlabs.single
  const slabs = rawSlabs.map((s, i) =>
    i === 0 && opts.includeSSF ? { ...s, rate: 0 } : s
  )

  let { total: annualTax, breakdown } = calcSlabTax(annualTaxable, slabs)

  // Female rebate (single filing + Nepal employment only)
  if (opts.isFemale && opts.filingStatus === 'single') {
    annualTax = annualTax * (1 - CFG.rebates.female.rate)
    breakdown = breakdown.map(b => ({ ...b, tax: b.tax * 0.9 }))
  }

  // Foreign tax credit
  const avgRate = annualTaxable > 0 ? annualTax / annualTaxable : 0
  const credit = Math.min(opts.foreignTaxPaidAnnual, annualTaxable * avgRate)
  annualTax = Math.max(0, annualTax - credit)

  // Medical tax credit (Section 51): flat credit against tax when claimed
  if (opts.hasMedicalExpenses) {
    annualTax = Math.max(0, annualTax - CFG.rebates.medicalTaxCredit.max)
  }

  // Festival/Dashain bonus: a once-a-year lump that is fully taxable (no exemption
  // under ITA 2058 §8), but it is NOT spread into the monthly take-home. Tax it at
  // the marginal slab rate (it stacks on top of regular taxable income) so the
  // monthly figure stays the real regular-month in-hand and the bonus is shown apart.
  let festivalBonusTax = 0
  if (opts.festivalBonusAnnual > 0) {
    const slabOnSalary = calcSlabTax(annualTaxable, slabs).total
    const slabWithBonus = calcSlabTax(annualTaxable + opts.festivalBonusAnnual, slabs).total
    festivalBonusTax = slabWithBonus - slabOnSalary
    if (opts.isFemale && opts.filingStatus === 'single') {
      festivalBonusTax *= (1 - CFG.rebates.female.rate)
    }
    festivalBonusTax = Math.max(0, festivalBonusTax)
  }
  const festivalBonusNet = Math.max(0, opts.festivalBonusAnnual - festivalBonusTax)

  const monthlyTax = annualTax / 12
  const inhand = gross - ssfMonthly - citMonthly - monthlyTax

  return {
    gross, basic,
    ssfMonthly, ssfAnnual,
    ssfEmployeeMonthly, ssfEmployerMonthly,
    citMonthly, citAnnual,
    maxCitMonthly, effectiveRetirementCap,
    annualTaxable, annualTax, monthlyTax, inhand,
    effectiveRate: annualTaxable > 0 ? annualTax / annualTaxable : 0,
    retirementTotal: ssfTotalMonthly + citMonthly,
    festivalBonusAnnual: opts.festivalBonusAnnual,
    festivalBonusTax,
    festivalBonusNet,
    slabBreakdown: breakdown,
  }
}
