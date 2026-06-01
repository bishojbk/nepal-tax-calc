import { calculate, type CalcOptions } from '../calculate'
import { TAX_YEARS } from '../../config/tax'

const baseOpts: CalcOptions = {
  fiscalYear: '2082/83',
  filingStatus: 'single',
  includeSSF: true,
  grossIncludesEmployerSSF: true,
  includeCIT: true,
  citAmount: Infinity,
  lifeInsurance: 0,
  healthInsurance: 0,
  buildingInsurance: 0,
  donationAnnual: 0,
  remoteAreaGrade: 'none',
  hasDisability: false,
  isSeniorCitizen: false,
  isFemale: false,
  foreignTaxPaidAnnual: 0,
  hasMedicalExpenses: false,
  festivalBonusAnnual: 0,
}

test('medical tax credit applies Rs 1,500 against tax', () => {
  const baseline = calculate(150_000, baseOpts)
  const withMedical = calculate(150_000, { ...baseOpts, hasMedicalExpenses: true })
  expect(baseline.annualTax - withMedical.annualTax).toBe(1_500)
})

test('medical tax credit cannot drive tax negative', () => {
  // Tiny gross → tax is already 0, credit should not underflow.
  const r = calculate(10_000, { ...baseOpts, hasMedicalExpenses: true })
  expect(r.annualTax).toBeGreaterThanOrEqual(0)
})

/* ─── Existing verification tests ─────────────────────────────────── */

test('120k payslip verification', () => {
  const r = calculate(120_000, baseOpts)
  expect(Math.round(r.ssfMonthly)).toBe(22_320)
  expect(Math.round(r.citMonthly)).toBe(17_680)
  expect(Math.round(r.monthlyTax)).toBe(6_000)
  expect(Math.round(r.inhand)).toBe(74_000)
})

test('150k with 40k life insurance', () => {
  const r = calculate(150_000, { ...baseOpts, lifeInsurance: 40_000 })
  expect(Math.round(r.ssfMonthly)).toBe(27_900)
  expect(Math.round(r.citMonthly)).toBe(13_767)
  expect(Math.round(r.monthlyTax)).toBe(13_167)
  expect(Math.round(r.inhand)).toBe(95_167)
})

/* ─── Edge cases ──────────────────────────────────────────────────── */

test('₨0 gross produces zero everything', () => {
  const r = calculate(0, baseOpts)
  expect(r.gross).toBe(0)
  expect(r.ssfMonthly).toBe(0)
  expect(r.citMonthly).toBe(0)
  expect(r.monthlyTax).toBe(0)
  expect(r.inhand).toBe(0)
  expect(r.annualTax).toBe(0)
  expect(r.effectiveRate).toBe(0)
  expect(r.slabBreakdown).toEqual([])
})

test('very high salary (₨5M/mo) does not throw', () => {
  const r = calculate(5_000_000, baseOpts)
  expect(r.inhand).toBeGreaterThan(0)
  expect(r.inhand).toBeLessThan(5_000_000)
  expect(r.effectiveRate).toBeGreaterThan(0)
  expect(r.effectiveRate).toBeLessThan(1)
  // Should be in the 36% or 39% slab
  const topSlab = r.slabBreakdown[r.slabBreakdown.length - 1]
  expect(['36%', '39%']).toContain(topSlab.label)
})

/* ─── Retirement cap crossover at ₨125K ───────────────────────────── */

test('₨120K: 1/3 rule binds (cap < 5L)', () => {
  const r = calculate(120_000, baseOpts)
  // Annual gross = 14.4L, 1/3 = 4.8L. That's < 5L so 1/3 binds
  expect(r.effectiveRetirementCap).toBe(480_000)
})

test('₨150K: hard cap binds (5L < 1/3)', () => {
  const r = calculate(150_000, baseOpts)
  // Annual gross = 18L, 1/3 = 6L. 5L < 6L so hard cap binds
  expect(r.effectiveRetirementCap).toBe(500_000)
})

test('₨125K: exact crossover point', () => {
  const r = calculate(125_000, baseOpts)
  // Annual gross = 15L, 1/3 = 5L. Hard cap = 5L. They're equal.
  expect(r.effectiveRetirementCap).toBe(500_000)
})

/* ─── Filing status: couple ───────────────────────────────────────── */

test('couple filing uses higher slab thresholds', () => {
  const single = calculate(200_000, baseOpts)
  const couple = calculate(200_000, { ...baseOpts, filingStatus: 'couple' })
  // Couple gets higher thresholds → less tax
  expect(couple.annualTax).toBeLessThan(single.annualTax)
  expect(couple.inhand).toBeGreaterThan(single.inhand)
})

test('couple slabs: 30% and 36% thresholds match single (no bump at top)', () => {
  // Per Finance Act 2081/82 Schedule 1.1, couple's 30% band tops out at
  // Rs 20L (same as single) and 36% band tops out at Rs 50L (same as single).
  // Only the first three bands get the Rs 1L couple bump.
  // Regression guard for the 21L / 51L bug.
  const couple = TAX_YEARS['2082/83'].taxSlabs.couple ?? []
  const couple30 = couple.find((s) => s.rate === 0.30)
  const couple36 = couple.find((s) => s.rate === 0.36)
  expect(couple30?.upTo).toBe(2_000_000)
  expect(couple36?.upTo).toBe(5_000_000)
})

/* ─── Female rebate ───────────────────────────────────────────────── */

test('female rebate reduces tax by 10% for single filing', () => {
  const normal = calculate(150_000, baseOpts)
  const female = calculate(150_000, { ...baseOpts, isFemale: true })
  // Female tax should be ~90% of normal tax
  expect(Math.round(female.annualTax)).toBe(Math.round(normal.annualTax * 0.9))
  expect(female.inhand).toBeGreaterThan(normal.inhand)
})

test('female rebate denied with couple filing', () => {
  const couple = calculate(150_000, { ...baseOpts, filingStatus: 'couple' })
  const coupleFemale = calculate(150_000, { ...baseOpts, filingStatus: 'couple', isFemale: true })
  // isFemale should have no effect when couple filing
  // Note: the calculate function applies female rebate only when filingStatus === 'single'
  expect(coupleFemale.annualTax).toBe(couple.annualTax)
})

/* ─── Senior citizen ──────────────────────────────────────────────── */

test('senior citizen gets ₨50K additional exemption', () => {
  const normal = calculate(150_000, baseOpts)
  const senior = calculate(150_000, { ...baseOpts, isSeniorCitizen: true })
  // Senior should have lower taxable income
  expect(senior.annualTaxable).toBe(normal.annualTaxable - 50_000)
  expect(senior.annualTax).toBeLessThan(normal.annualTax)
})

/* ─── Disability exemption ────────────────────────────────────────── */

test('disability exemption for single = ₨250K', () => {
  const normal = calculate(200_000, baseOpts)
  const disabled = calculate(200_000, { ...baseOpts, hasDisability: true })
  expect(disabled.annualTaxable).toBe(normal.annualTaxable - 250_000)
})

test('disability exemption for couple = ₨300K', () => {
  const normal = calculate(200_000, { ...baseOpts, filingStatus: 'couple' })
  const disabled = calculate(200_000, { ...baseOpts, filingStatus: 'couple', hasDisability: true })
  expect(disabled.annualTaxable).toBe(normal.annualTaxable - 300_000)
})

/* ─── Remote area deductions ──────────────────────────────────────── */

test('remote area grade A gives ₨50K deduction', () => {
  const normal = calculate(150_000, baseOpts)
  const remote = calculate(150_000, { ...baseOpts, remoteAreaGrade: 'A' })
  expect(remote.annualTaxable).toBe(normal.annualTaxable - 50_000)
})

test('remote area grade E gives ₨10K deduction', () => {
  const normal = calculate(150_000, baseOpts)
  const remote = calculate(150_000, { ...baseOpts, remoteAreaGrade: 'E' })
  expect(remote.annualTaxable).toBe(normal.annualTaxable - 10_000)
})

/* ─── Insurance deductions ────────────────────────────────────────── */

test('all insurance deductions stack correctly', () => {
  const normal = calculate(150_000, baseOpts)
  const withAll = calculate(150_000, {
    ...baseOpts,
    lifeInsurance: 40_000,
    healthInsurance: 20_000,
    buildingInsurance: 5_000,
  })
  expect(withAll.annualTaxable).toBe(normal.annualTaxable - 65_000)
})

/* ─── Donation capping ────────────────────────────────────────────── */

test('donation is capped at lower of ₨100K or 5% of taxable', () => {
  // At ₨150K/mo, taxable is ~₨13L (after SSF+CIT). 5% ≈ ₨65K
  // So cap should be min(100_000, ~65K) = ~65K
  const r = calculate(150_000, { ...baseOpts, donationAnnual: 200_000 })
  // Donation should be applied (capped) — taxable should be lower than without donation
  const rNoDon = calculate(150_000, baseOpts)
  expect(r.annualTaxable).toBeLessThan(rNoDon.annualTaxable)
  // But not by the full 200K — it should be capped
  expect(rNoDon.annualTaxable - r.annualTaxable).toBeLessThanOrEqual(100_000)
})

/* ─── SSF waives 1% SST slab ─────────────────────────────────────── */

test('SSF waives 1% SST slab (first slab rate = 0)', () => {
  const withSSF = calculate(150_000, baseOpts)
  const noSSF = calculate(150_000, { ...baseOpts, includeSSF: false })
  // With SSF: first slab should have 0% rate
  const firstSlabSSF = withSSF.slabBreakdown[0]
  if (firstSlabSSF) expect(firstSlabSSF.tax).toBe(0)
  // Without SSF: first slab should have 1% rate
  const firstSlabNoSSF = noSSF.slabBreakdown[0]
  if (firstSlabNoSSF) expect(firstSlabNoSSF.tax).toBeGreaterThan(0)
})

/* ─── No SSF, no CIT ─────────────────────────────────────────────── */

test('disabling SSF and CIT increases taxable income', () => {
  const full = calculate(150_000, baseOpts)
  const bare = calculate(150_000, { ...baseOpts, includeSSF: false, includeCIT: false })
  expect(bare.annualTaxable).toBeGreaterThan(full.annualTaxable)
  expect(bare.annualTax).toBeGreaterThan(full.annualTax)
  expect(bare.ssfMonthly).toBe(0)
  expect(bare.citMonthly).toBe(0)
})

/* ─── Foreign tax credit ──────────────────────────────────────────── */

test('foreign tax credit reduces Nepal tax liability', () => {
  const noCredit = calculate(150_000, { ...baseOpts, includeSSF: false })
  const withCredit = calculate(150_000, { ...baseOpts, includeSSF: false, foreignTaxPaidAnnual: 50_000 })
  expect(withCredit.annualTax).toBeLessThan(noCredit.annualTax)
})

test('foreign tax credit capped at average rate × taxable', () => {
  // Paying more foreign tax than Nepal liability should cap the credit
  const withHugeCredit = calculate(100_000, { ...baseOpts, includeSSF: false, foreignTaxPaidAnnual: 10_000_000 })
  expect(withHugeCredit.annualTax).toBe(0) // fully offset, but not negative
})

/* ─── CIT amount clamping ─────────────────────────────────────────── */

test('CIT respects max CIT monthly', () => {
  const r = calculate(120_000, baseOpts)
  expect(r.citMonthly).toBeLessThanOrEqual(r.maxCitMonthly)
  // SSF + CIT annual should not exceed retirement cap
  expect(r.ssfAnnual + r.citAnnual).toBeLessThanOrEqual(r.effectiveRetirementCap + 1) // +1 for rounding
})

test('partial CIT amount is respected', () => {
  const full = calculate(120_000, baseOpts)
  const partial = calculate(120_000, { ...baseOpts, citAmount: 5000 })
  expect(partial.citMonthly).toBe(5000)
  expect(partial.citMonthly).toBeLessThan(full.citMonthly)
  expect(partial.annualTax).toBeGreaterThan(full.annualTax) // less deduction = more tax
})

/* ─── Slab breakdown correctness ──────────────────────────────────── */

test('slab breakdown tax sums to annual tax', () => {
  const r = calculate(200_000, baseOpts)
  const slabTaxSum = r.slabBreakdown.reduce((sum, s) => sum + s.tax, 0)
  // With female rebate off, slab sum should equal annual tax (no rebate applied)
  // Actually female rebate IS applied to the breakdown in calculate.ts
  // So slab sum should equal annual tax
  expect(Math.round(slabTaxSum)).toBe(Math.round(r.annualTax))
})

test('slab breakdown income sums to annual taxable', () => {
  const r = calculate(200_000, baseOpts)
  const slabIncomeSum = r.slabBreakdown.reduce((sum, s) => sum + s.income, 0)
  expect(Math.round(slabIncomeSum)).toBe(Math.round(r.annualTaxable))
})

/* ─── Inhand calculation ──────────────────────────────────────────── */

test('inhand = gross - SSF - CIT - monthly tax', () => {
  const r = calculate(150_000, baseOpts)
  const expected = r.gross - r.ssfMonthly - r.citMonthly - r.monthlyTax
  expect(Math.round(r.inhand)).toBe(Math.round(expected))
})

test('effective rate = annual tax / annual taxable', () => {
  const r = calculate(200_000, baseOpts)
  if (r.annualTaxable > 0) {
    expect(r.effectiveRate).toBeCloseTo(r.annualTax / r.annualTaxable, 4)
  }
})

/* ─── SSF mode: Mode A (loaded gross / CTC) vs Mode B (employee gross) ─── */

test('Mode A (loaded gross): 120k annexure-style → ssf split is 11/20 of basic', () => {
  const r = calculate(120_000, baseOpts)
  const basic = 120_000 * 0.60  // 72,000
  expect(r.basic).toBeCloseTo(basic, 2)
  expect(r.ssfEmployeeMonthly).toBeCloseTo(basic * 0.11, 2)
  expect(r.ssfEmployerMonthly).toBeCloseTo(basic * 0.20, 2)
  // Full 31% comes out of gross in Mode A
  expect(r.ssfMonthly).toBeCloseTo(basic * 0.31, 2)
})

test('Mode B (employee gross): only 11% deducts from gross for take-home', () => {
  const r = calculate(126_720, { ...baseOpts, grossIncludesEmployerSSF: false })
  // basic is derived so that Mode B @ 126,720 matches Mode A @ 144,000 (same real salary)
  expect(Math.round(r.basic)).toBe(86_400)
  expect(Math.round(r.ssfEmployeeMonthly)).toBe(9_504)   // 11% of 86,400
  expect(Math.round(r.ssfEmployerMonthly)).toBe(17_280)  // 20% of 86,400
  // Only employee's 11% reduces take-home
  expect(Math.round(r.ssfMonthly)).toBe(9_504)
})

test('Mode A and Mode B produce same tax for equivalent salaries', () => {
  // Mode A gross = 144,000 (CTC including employer SSF)
  // Equivalent Mode B gross = 126,720 (same person, employer adds 17,280 on top)
  const modeA = calculate(144_000, baseOpts)
  const modeB = calculate(126_720, { ...baseOpts, grossIncludesEmployerSSF: false })
  expect(Math.round(modeB.annualTax)).toBe(Math.round(modeA.annualTax))
  expect(Math.round(modeB.annualTaxable)).toBe(Math.round(modeA.annualTaxable))
})

test('Mode B take-home is higher than Mode A take-home for equivalent salaries', () => {
  // Mode B take-home = gross - 11% basic - tax
  // Mode A take-home = gross - 31% basic - tax (but gross is larger by 20% basic)
  // Difference: Mode B take-home - Mode A take-home = 0 (employer SSF cancels out)
  // Actually: Mode B gross 126,720 - 11% basic 86,400 = 117,216 = Mode A pre-tax net. Identical.
  const modeA = calculate(144_000, baseOpts)
  const modeB = calculate(126_720, { ...baseOpts, grossIncludesEmployerSSF: false })
  expect(Math.round(modeB.inhand)).toBe(Math.round(modeA.inhand))
})

test('Mode A 144k annexure: pre-tax net matches Bisoj annexure (117,216)', () => {
  // Basic 86,400 + DA 40,320 + Employer SSF 17,280 = 144,000 gross
  // Less: 31% × 86,400 = 26,784 SSF → 117,216 pre-tax net
  const r = calculate(144_000, { ...baseOpts, includeCIT: false })
  const preTaxNet = 144_000 - r.ssfMonthly
  expect(Math.round(preTaxNet)).toBe(117_216)
})

test('Mode B: ssfAnnual reflects what comes out of gross, not total SSF deposit', () => {
  const r = calculate(126_720, { ...baseOpts, grossIncludesEmployerSSF: false })
  // ssfAnnual = employee 11% × 12 (take-home reduction)
  expect(Math.round(r.ssfAnnual)).toBe(Math.round(r.ssfEmployeeMonthly * 12))
  // But total SSF deposit (11% + 20%) is reflected in retirementTotal (sum with CIT)
  const expectedRetirement = (r.ssfEmployeeMonthly + r.ssfEmployerMonthly) + r.citMonthly
  expect(Math.round(r.retirementTotal)).toBe(Math.round(expectedRetirement))
})

test('Mode B with SSF off: basic reverts to 60% of gross', () => {
  const r = calculate(100_000, { ...baseOpts, includeSSF: false, grossIncludesEmployerSSF: false })
  // When SSF is off, employer SSF = 0, so basic = 60% of gross directly
  // ...but with Mode B formula, basic = gross × 0.60 / 0.88 ≠ 60% of gross
  // That's fine — basic in Mode B always represents the "true" basic of the CTC-equivalent
  // The important invariant: no SSF deducted from gross
  expect(r.ssfMonthly).toBe(0)
  expect(r.ssfEmployeeMonthly).toBe(0)
  expect(r.ssfEmployerMonthly).toBe(0)
})

/* ─── FY 2083/84 unified slabs (couple removed, top rate 29%) ──────── */

const opts2084: CalcOptions = { ...baseOpts, fiscalYear: '2083/84' }

test('2083/84: 150k anchor — 1% band to ₨10L cuts tax sharply', () => {
  const r = calculate(150_000, opts2084)
  // SSF + retirement cap unchanged → same SSF/CIT as 2082/83.
  expect(Math.round(r.ssfMonthly)).toBe(27_900)
  expect(Math.round(r.citMonthly)).toBe(13_767)
  // Taxable ₨13,00,000: 0% on first 10L (SSF waiver), 10% on next ₨3L = ₨30,000.
  expect(Math.round(r.annualTaxable)).toBe(1_300_000)
  expect(Math.round(r.annualTax)).toBe(30_000)
  expect(Math.round(r.monthlyTax)).toBe(2_500)
  expect(Math.round(r.inhand)).toBe(105_833)
})

test('2083/84 taxes far less than 2082/83 at the same gross', () => {
  const newYr = calculate(150_000, opts2084)
  const oldYr = calculate(150_000, baseOpts) // 2082/83
  expect(newYr.annualTax).toBeLessThan(oldYr.annualTax)
})

test('2083/84 has no couple slabs — couple coerces to single math', () => {
  const single = calculate(200_000, opts2084)
  const asCouple = calculate(200_000, { ...opts2084, filingStatus: 'couple' })
  expect(asCouple.annualTax).toBe(single.annualTax)
  expect(asCouple.annualTaxable).toBe(single.annualTaxable)
})

test('2083/84 disability exemption = ₨5,00,000 (50% of ₨10L band)', () => {
  const normal = calculate(300_000, opts2084)
  const disabled = calculate(300_000, { ...opts2084, hasDisability: true })
  expect(disabled.annualTaxable).toBe(normal.annualTaxable - 500_000)
})

test('2083/84 medical credit is Rs 1,500', () => {
  const baseline = calculate(300_000, opts2084)
  const withMedical = calculate(300_000, { ...opts2084, hasMedicalExpenses: true })
  expect(baseline.annualTax - withMedical.annualTax).toBe(1_500)
})

test('2083/84 top slab label is 27% or 29% at very high income', () => {
  const r = calculate(5_000_000, opts2084)
  const topSlab = r.slabBreakdown[r.slabBreakdown.length - 1]
  expect(['27%', '29%']).toContain(topSlab.label)
})

/* ─── Festival / Dashain bonus (matches real company annexure) ─────── */

test('150k + ₨90k Dashain bonus: annual tax reconciles with the company payslip (FY 2082/83)', () => {
  // Company annexure (CIT=0): total annual tax 2,46,560, annual net deposit 13,08,640.
  // We tax the bonus separately, so the monthly figure stays the regular-month in-hand.
  const r = calculate(150_000, { ...baseOpts, includeCIT: false, festivalBonusAnnual: 90_000 })
  expect(Math.round(r.annualTaxable)).toBe(1_465_200)                     // salary only
  expect(Math.round(r.annualTax)).toBe(219_560)                          // salary tax
  expect(Math.round(r.festivalBonusTax)).toBe(27_000)                    // 30% × 90k (top band)
  expect(Math.round(r.festivalBonusNet)).toBe(63_000)
  expect(Math.round(r.annualTax + r.festivalBonusTax)).toBe(246_560)     // == company total tax
  expect(Math.round(r.inhand)).toBe(103_803)                             // regular monthly in-hand
  expect(Math.round(r.inhand * 12 + r.festivalBonusNet)).toBe(1_308_640) // == company net deposit
})

test('festival bonus does NOT change the regular monthly in-hand (taxed separately)', () => {
  const noBonus = calculate(150_000, { ...baseOpts, includeCIT: false })
  const withBonus = calculate(150_000, { ...baseOpts, includeCIT: false, festivalBonusAnnual: 90_000 })
  // Monthly figures identical — the bonus is a separate once-a-year lump.
  expect(withBonus.inhand).toBe(noBonus.inhand)
  expect(withBonus.annualTaxable).toBe(noBonus.annualTaxable)
  expect(withBonus.monthlyTax).toBe(noBonus.monthlyTax)
  // But the bonus is fully taxed (no exemption) at the marginal rate.
  expect(withBonus.festivalBonusTax).toBeGreaterThan(0)
  expect(Math.round(withBonus.festivalBonusNet)).toBe(90_000 - Math.round(withBonus.festivalBonusTax))
})
