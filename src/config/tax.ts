/* ─────────────────────────────────────────────────────────────────────────
 * Nepal income-tax configuration.
 *
 * Tax rules live per fiscal year in TAX_YEARS. Year-independent UI constants
 * live in UI_CONFIG; flat-mode rates (freelancer / non-resident) in FLAT_TAX.
 *
 * To add a fiscal year: copy the most recent TAX_YEARS entry, change the
 * label + slabs (+ disability if the basic exemption moved), then run
 * `npx jest`. A year supports couple filing iff its taxSlabs.couple exists.
 * ───────────────────────────────────────────────────────────────────────── */

export type FilingStatus = 'single' | 'couple'
export type RemoteGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'none'
export type FiscalYear = '2082/83' | '2083/84'

export interface TaxSlab {
  upTo: number
  rate: number
  label: string
}

export interface YearConfig {
  label: { bs: string; ad: string }
  salary: { basicRatio: number }
  ssf: {
    employeeRate: number
    employerRate: number
    totalRate: number
    waivesSocialSecurityTax: boolean
  }
  retirementCap: { absoluteMax: number; ratioMax: number }
  taxSlabs: { single: TaxSlab[]; couple?: TaxSlab[] }
  deductions: {
    lifeInsurance: { max: number }
    healthInsurance: { max: number }
    buildingInsurance: { max: number }
    donation: { maxAbsolute: number; maxPctOfTaxable: number }
    remoteArea: Record<RemoteGrade, number>
  }
  specialExemptions: {
    disability: { single: number; couple?: number }
    seniorCitizen: { additional: number }
  }
  rebates: {
    female: { rate: number }
    medicalTaxCredit: { max: number }
  }
}

// Constants identical across the supported years — spread into each year below.
const COMMON = {
  salary: {
    basicRatio: 0.60,
    // 60% is the common employer convention; employers set their own structure.
  },
  ssf: {
    employeeRate: 0.11,
    employerRate: 0.20,
    totalRate: 0.31,          // of basic salary
    // Contributing to SSF waives the 1% Social Security Tax on the first slab.
    waivesSocialSecurityTax: true,
  },
  retirementCap: {
    // SSF + CIT combined = min(₨5,00,000/yr, 1/3 of annual assessable income).
    absoluteMax: 500_000,
    ratioMax: 1 / 3,
  },
  deductions: {
    lifeInsurance:     { max: 40_000 },
    healthInsurance:   { max: 20_000 },
    buildingInsurance: { max: 5_000  },
    donation: {
      maxAbsolute: 100_000,
      maxPctOfTaxable: 0.05,
    },
    remoteArea: {
      A: 50_000, B: 40_000, C: 30_000, D: 20_000, E: 10_000, none: 0,
    } as Record<RemoteGrade, number>,
  },
  rebates: {
    female: { rate: 0.10 },
    // Medical tax credit (Income Tax Act s.51 / Rule 17(3)) — raised 750 → 1,500
    // effective Shrawan 1, 2081 (FY 2081/82).
    medicalTaxCredit: { max: 1_500 },
  },
}

export const TAX_YEARS: Record<FiscalYear, YearConfig> = {
  // FY 2082/83 (2025/26) — rates unchanged from 2081/82. Couple filing available.
  '2082/83': {
    label: { bs: '2082/83', ad: '2025/26' },
    ...COMMON,
    taxSlabs: {
      single: [
        { upTo: 500_000,   rate: 0.01, label: '1% SST' },
        { upTo: 700_000,   rate: 0.10, label: '10%' },
        { upTo: 1_000_000, rate: 0.20, label: '20%' },
        { upTo: 2_000_000, rate: 0.30, label: '30%' },
        { upTo: 5_000_000, rate: 0.36, label: '36%' },
        { upTo: Infinity,  rate: 0.39, label: '39%' },
      ],
      couple: [
        { upTo: 600_000,   rate: 0.01, label: '1% SST' },
        { upTo: 800_000,   rate: 0.10, label: '10%' },
        { upTo: 1_100_000, rate: 0.20, label: '20%' },
        // Above ₨11L, couple thresholds match single (Finance Act 2081/82 Sch 1.1).
        { upTo: 2_000_000, rate: 0.30, label: '30%' },
        { upTo: 5_000_000, rate: 0.36, label: '36%' },
        { upTo: Infinity,  rate: 0.39, label: '39%' },
      ],
    },
    specialExemptions: {
      // 50% of the 5L (single) / 6L (couple) basic exemption.
      disability: { single: 250_000, couple: 300_000 },
      seniorCitizen: { additional: 50_000 },
    },
  },

  // FY 2083/84 (2026/27) — Budget 2083/84. Couple concept removed; top rate
  // cut to 29%; 1% band raised to ₨10L.
  '2083/84': {
    label: { bs: '2083/84', ad: '2026/27' },
    ...COMMON,
    taxSlabs: {
      single: [
        { upTo: 1_000_000, rate: 0.01, label: '1% SST' },
        { upTo: 1_500_000, rate: 0.10, label: '10%' },
        { upTo: 2_500_000, rate: 0.20, label: '20%' },
        { upTo: 4_000_000, rate: 0.27, label: '27%' },
        { upTo: Infinity,  rate: 0.29, label: '29%' },
      ],
      // No couple slabs — married/single distinction abolished from FY 2083/84.
    },
    specialExemptions: {
      disability: { single: 500_000 },   // 50% of the new ₨10L basic exemption
      seniorCitizen: { additional: 50_000 },
    },
  },
}

export const DEFAULT_FY: FiscalYear = '2083/84'

export const FISCAL_YEARS = Object.keys(TAX_YEARS) as FiscalYear[]

export const SUPPORTS_COUPLE = (fy: FiscalYear): boolean =>
  TAX_YEARS[fy].taxSlabs.couple !== undefined

// Year-independent UI constants.
export const UI_CONFIG = {
  slider: { min: 0, max: 5_000_000, step: 5_000 },
  defaults: { gross: 150_000, currentGross: 120_000 },
  verdicts: [
    { minPct: 0,    maxPct: 0.10, label: 'Minimal',              color: 'slate'  },
    { minPct: 0.10, maxPct: 0.20, label: 'Decent',               color: 'blue'   },
    { minPct: 0.20, maxPct: 0.30, label: 'Good ask',             color: 'green'  },
    { minPct: 0.30, maxPct: 0.40, label: 'Ambitious',            color: 'amber'  },
    { minPct: 0.40, maxPct: Infinity, label: 'Job-switch territory', color: 'red' },
  ],
} as const

// Flat-rate (non-progressive) mode rates.
export const FLAT_TAX = {
  freelancer: 0.05,   // 5% withheld by bank on foreign-currency transfer
  nonResident: 0.25,  // 25% flat on Nepal-sourced income
} as const
