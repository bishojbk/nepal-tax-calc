"use client"

import { useEffect, useRef } from 'react'
import type { CalcOptions } from './calculate'
import type { IncomeMode } from '@/components/layout/ModeSelector'
import { FISCAL_YEARS, DEFAULT_FY, SUPPORTS_COUPLE, type FiscalYear, type RemoteGrade } from '@/config/tax'

interface UrlState {
  mode: IncomeMode
  gross: number
  options: CalcOptions
}

const PARAM_MAP = {
  m: 'mode',
  g: 'gross',
  y: 'fiscalYear',
  f: 'filingStatus',
  ssf: 'includeSSF',
  ssfm: 'grossIncludesEmployerSSF',
  cit: 'includeCIT',
  ca: 'citAmount',
  li: 'lifeInsurance',
  hi: 'healthInsurance',
  bi: 'buildingInsurance',
  don: 'donationAnnual',
  ra: 'remoteAreaGrade',
  dis: 'hasDisability',
  sen: 'isSeniorCitizen',
  fem: 'isFemale',
  ftx: 'foreignTaxPaidAnnual',
  med: 'hasMedicalExpenses',
  fb: 'festivalBonusAnnual',
} as const

const VALID_MODES: IncomeMode[] = ['nepal', 'foreign', 'freelancer', 'nonresident']
const VALID_FILING = ['single', 'couple'] as const
const VALID_FY = FISCAL_YEARS as readonly string[]
const VALID_REMOTE = ['none', 'A', 'B', 'C', 'D', 'E'] as const

export function parseUrlState(): Partial<UrlState> | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  if (params.size === 0) return null

  const result: Partial<UrlState> = {}

  const m = params.get('m')
  if (m && VALID_MODES.includes(m as IncomeMode)) {
    result.mode = m as IncomeMode
  }

  const g = params.get('g')
  if (g) {
    const num = parseInt(g, 10)
    if (!isNaN(num) && num >= 0) result.gross = num
  }

  const opts: Partial<CalcOptions> = {}
  let hasOpts = false

  const f = params.get('f')
  if (f && (VALID_FILING as readonly string[]).includes(f)) {
    opts.filingStatus = f as 'single' | 'couple'
    hasOpts = true
  }

  const y = params.get('y')
  if (y && VALID_FY.includes(y)) {
    opts.fiscalYear = y as FiscalYear
    hasOpts = true
  }

  const boolParams: [string, keyof CalcOptions][] = [
    ['ssf', 'includeSSF'], ['ssfm', 'grossIncludesEmployerSSF'], ['cit', 'includeCIT'],
    ['dis', 'hasDisability'], ['sen', 'isSeniorCitizen'], ['fem', 'isFemale'],
    ['med', 'hasMedicalExpenses'],
  ]
  for (const [key, prop] of boolParams) {
    const val = params.get(key)
    if (val !== null) {
      (opts as Record<string, unknown>)[prop] = val === '1'
      hasOpts = true
    }
  }

  const numParams: [string, keyof CalcOptions][] = [
    ['ca', 'citAmount'], ['li', 'lifeInsurance'], ['hi', 'healthInsurance'],
    ['bi', 'buildingInsurance'], ['don', 'donationAnnual'], ['ftx', 'foreignTaxPaidAnnual'],
    ['fb', 'festivalBonusAnnual'],
  ]
  for (const [key, prop] of numParams) {
    const val = params.get(key)
    if (val !== null) {
      const num = val === 'max' ? Infinity : parseInt(val, 10)
      if (!isNaN(num) && num >= 0) {
        (opts as Record<string, unknown>)[prop] = num
        hasOpts = true
      }
    }
  }

  const ra = params.get('ra')
  if (ra && (VALID_REMOTE as readonly string[]).includes(ra)) {
    opts.remoteAreaGrade = ra as RemoteGrade
    hasOpts = true
  }

  if (hasOpts) {
    const fy = opts.fiscalYear ?? DEFAULT_FY
    result.options = {
      fiscalYear: fy,
      // Old links with ?f=couple on a year that dropped couple fall back to single.
      filingStatus: SUPPORTS_COUPLE(fy) ? (opts.filingStatus ?? 'single') : 'single',
      includeSSF: opts.includeSSF ?? true,
      grossIncludesEmployerSSF: opts.grossIncludesEmployerSSF ?? true,
      includeCIT: opts.includeCIT ?? true,
      citAmount: opts.citAmount ?? Infinity,
      lifeInsurance: opts.lifeInsurance ?? 0,
      healthInsurance: opts.healthInsurance ?? 0,
      buildingInsurance: opts.buildingInsurance ?? 0,
      donationAnnual: opts.donationAnnual ?? 0,
      remoteAreaGrade: opts.remoteAreaGrade ?? 'none',
      hasDisability: opts.hasDisability ?? false,
      isSeniorCitizen: opts.isSeniorCitizen ?? false,
      isFemale: opts.isFemale ?? false,
      foreignTaxPaidAnnual: opts.foreignTaxPaidAnnual ?? 0,
      hasMedicalExpenses: opts.hasMedicalExpenses ?? false,
      festivalBonusAnnual: opts.festivalBonusAnnual ?? 0,
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

export function useUrlSync(mode: IncomeMode, gross: number, options: CalcOptions) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the initial render (don't overwrite URL on page load)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const params = new URLSearchParams()
    params.set('m', mode)
    params.set('g', String(Math.round(gross)))
    params.set('y', options.fiscalYear)
    params.set('f', options.filingStatus)
    params.set('ssf', options.includeSSF ? '1' : '0')
    // Only emit non-default ssfm (default = true, loaded/CTC)
    if (!options.grossIncludesEmployerSSF) params.set('ssfm', '0')
    params.set('cit', options.includeCIT ? '1' : '0')
    params.set('ca', options.citAmount === Infinity ? 'max' : String(Math.round(options.citAmount)))
    if (options.lifeInsurance > 0) params.set('li', String(options.lifeInsurance))
    if (options.healthInsurance > 0) params.set('hi', String(options.healthInsurance))
    if (options.buildingInsurance > 0) params.set('bi', String(options.buildingInsurance))
    if (options.donationAnnual > 0) params.set('don', String(Math.round(options.donationAnnual)))
    if (options.remoteAreaGrade !== 'none') params.set('ra', options.remoteAreaGrade)
    if (options.hasDisability) params.set('dis', '1')
    if (options.isSeniorCitizen) params.set('sen', '1')
    if (options.isFemale) params.set('fem', '1')
    if (options.foreignTaxPaidAnnual > 0) params.set('ftx', String(Math.round(options.foreignTaxPaidAnnual)))
    if (options.hasMedicalExpenses) params.set('med', '1')
    if (options.festivalBonusAnnual > 0) params.set('fb', String(Math.round(options.festivalBonusAnnual)))

    const url = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', url)
  }, [mode, gross, options])
}
