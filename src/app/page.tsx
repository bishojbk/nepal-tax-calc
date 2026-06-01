"use client"

import { useMemo, useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ModeSelector, type IncomeMode } from '@/components/layout/ModeSelector'
import { StickyOutput } from '@/components/layout/StickyOutput'
import { GrossSlider } from '@/components/calculator/GrossSlider'
import { DeductionToggles } from '@/components/calculator/DeductionToggles'
import { FilingOptions } from '@/components/calculator/FilingOptions'
import { SpecialSituations } from '@/components/calculator/SpecialSituations'
import { SkipCITToggle } from '@/components/insights/SkipCITToggle'
import { TaxGuide } from '@/components/insights/TaxGuide'
import { TaxSavingSummary } from '@/components/insights/TaxSavingSummary'
import { RaisePlanner } from '@/components/raise-planner/RaisePlanner'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { UI_CONFIG, FLAT_TAX, TAX_YEARS, FISCAL_YEARS, DEFAULT_FY, SUPPORTS_COUPLE, type FiscalYear } from '@/config/tax'
import { useApp } from '@/lib/app-context'
import { calculate, type CalcOptions } from '@/lib/calculate'
import { formatNPR, formatPct } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { MoneyInput } from '@/components/ui/money-input'
import { parseUrlState, useUrlSync } from '@/lib/use-url-state'
import { Calculator, TrendingUp, Sparkles, Globe, Laptop, Plane, Info, AlertTriangle, Sun, Moon, Languages } from 'lucide-react'

type Section = 'calculator' | 'raise' | 'insights'

export default function Page() {
  const { t, theme, setTheme, lang, setLang } = useApp()
  const [mode, setMode] = useState<IncomeMode>('nepal')
  const [section, setSection] = useState<Section>('calculator')
  const [gross, setGross] = useState<number>(UI_CONFIG.defaults.gross)

  const [options, setOptions] = useState<CalcOptions>({
    fiscalYear: DEFAULT_FY,
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
  })

  // Restore state from URL on mount
  useEffect(() => {
    const urlState = parseUrlState()
    if (!urlState) return
    if (urlState.mode) setMode(urlState.mode)
    if (urlState.gross !== undefined) setGross(urlState.gross)
    if (urlState.options) setOptions(urlState.options)
  }, [])

  // Sync state to URL on changes
  useUrlSync(mode, gross, options)

  const handleOptionsChange = useCallback((patch: Partial<CalcOptions>) => {
    setOptions((prev) => {
      const next = { ...prev, ...patch }
      if (patch.filingStatus === 'couple') next.isFemale = false
      // Switching to a fiscal year without couple filing forces single.
      if (patch.fiscalYear && !SUPPORTS_COUPLE(patch.fiscalYear)) next.filingStatus = 'single'
      return next
    })
  }, [])

  const result = useMemo(() => calculate(gross, options), [gross, options])

  const sections: { id: Section; label: string; icon: typeof Calculator }[] = [
    { id: 'calculator', label: t('section.calculator'), icon: Calculator },
    { id: 'raise', label: t('section.raise'), icon: TrendingUp },
    { id: 'insights', label: t('section.insights'), icon: Sparkles },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 dhaka-pattern pointer-events-none" />

      {/* Skip link */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium">
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
                <span className="text-2xl" role="img" aria-label="Nepal flag">🇳🇵</span>
                <span>{t('app.title')}</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 tracking-wide">{t('fy.prefix')} {TAX_YEARS[options.fiscalYear].label.bs} ({TAX_YEARS[options.fiscalYear].label.ad}) — {options.fiscalYear === DEFAULT_FY ? t('fy.new') : t('fy.current')} · {t('app.actname')}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-secondary/80 rounded-lg p-0.5 mr-0.5" role="group" aria-label={t('fy.label')}>
                {FISCAL_YEARS.map((fy) => (
                  <button
                    key={fy}
                    onClick={() => handleOptionsChange({ fiscalYear: fy })}
                    aria-pressed={options.fiscalYear === fy}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all text-center focus-visible:ring-2 focus-visible:ring-ring ${
                      options.fiscalYear === fy ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="block leading-none">{TAX_YEARS[fy].label.bs}</span>
                    <span className="block text-[9px] font-normal opacity-70 leading-tight mt-0.5">{fy === DEFAULT_FY ? t('fy.new') : t('fy.current')}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
                aria-label={lang === 'en' ? 'Switch to Nepali' : 'English मा बदल्नुहोस्'}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary px-3 py-2 rounded-lg transition-all"
              >
                <Languages size={13} aria-hidden="true" />
                {t('lang.toggle')}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary rounded-lg transition-all"
              >
                {theme === 'dark' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
              </button>
              <a
                href="https://github.com/bishojbk/nepal-tax-calc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source on GitHub"
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary rounded-lg transition-all"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
          </div>
          <ModeSelector value={mode} onChange={setMode} />
        </div>
        <div className="gradient-line" />
      </header>

      <main id="main" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {mode === 'nepal' && (
            <motion.div
              key="nepal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <nav aria-label="Calculator sections" className="flex gap-1 mb-8 bg-secondary/70 rounded-xl p-1 max-w-md border border-border/40" role="tablist">
                {sections.map((s) => {
                  const Icon = s.icon
                  const active = section === s.id
                  return (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`section-${s.id}`}
                      onClick={() => setSection(s.id)}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="section-pill"
                          className="absolute inset-0 bg-card rounded-lg ledger-shadow"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon size={13} aria-hidden="true" />
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </nav>

              <AnimatePresence mode="wait">
                {section === 'calculator' && (
                  <motion.div key="calc" id="section-calculator" role="tabpanel" aria-label={t('section.calculator')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
                    <div className="space-y-5">
                      <GrossSlider value={gross} onChange={setGross} />
                      <DeductionToggles gross={gross} options={options} maxCitMonthly={result.maxCitMonthly} onChange={handleOptionsChange} />
                      {SUPPORTS_COUPLE(options.fiscalYear) && (
                        <FilingOptions options={options} onChange={handleOptionsChange} />
                      )}
                      <SpecialSituations options={options} onChange={handleOptionsChange} />
                      <SkipCITToggle result={result} options={options} />
                      <TaxGuide fiscalYear={options.fiscalYear} />
                    </div>
                    <div className="lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:scrollbar-thin">
                      <StickyOutput result={result} />
                    </div>
                  </motion.div>
                )}
                {section === 'raise' && (
                  <motion.div key="raise" id="section-raise" role="tabpanel" aria-label={t('section.raise')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <RaisePlanner currentResult={result} options={options} />
                  </motion.div>
                )}
                {section === 'insights' && (
                  <motion.div key="insights" id="section-insights" role="tabpanel" aria-label={t('section.insights')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl">
                    <TaxSavingSummary result={result} options={options} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {mode === 'foreign' && (
            <motion.div key="foreign" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ForeignMode fiscalYear={options.fiscalYear} />
            </motion.div>
          )}
          {mode === 'freelancer' && (
            <motion.div key="freelancer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <FreelancerMode />
            </motion.div>
          )}
          {mode === 'nonresident' && (
            <motion.div key="nonresident" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <NonResidentMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative border-t border-border/50 mt-16 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          {t('footer.disclaimer')}
        </p>
      </footer>
    </div>
  )
}

/* ─── Foreign Employment Mode ──────────────────────────────────────── */

const ZERO_TAX = ['UAE', 'Saudi Arabia', 'Bahrain', 'Kuwait', 'Oman']
const DTAA = ['Austria', 'Bangladesh', 'China', 'India', 'Korea', 'Mauritius', 'Norway', 'Pakistan', 'Qatar', 'Sri Lanka', 'Thailand']
const ALL_COUNTRIES = [...new Set([...ZERO_TAX, ...DTAA, 'Other'])].sort()

function ForeignMode({ fiscalYear }: { fiscalYear: FiscalYear }) {
  const { t } = useApp()
  const [gross, setGross] = useState<number>(UI_CONFIG.defaults.gross)
  const [country, setCountry] = useState('Other')
  const [foreignTax, setForeignTax] = useState(0)
  const [filing, setFiling] = useState<'single' | 'couple'>('single')
  const [useCit, setUseCit] = useState(false)
  const [isFemale, setIsFemale] = useState(false)

  const isZero = ZERO_TAX.includes(country)
  const isDtaa = DTAA.includes(country)
  const coupleOk = SUPPORTS_COUPLE(fiscalYear)
  const effectiveFiling: 'single' | 'couple' = coupleOk ? filing : 'single'

  const opts: CalcOptions = {
    fiscalYear, filingStatus: effectiveFiling, includeSSF: false, grossIncludesEmployerSSF: true,
    includeCIT: useCit, citAmount: Infinity,
    lifeInsurance: 0, healthInsurance: 0, buildingInsurance: 0, donationAnnual: 0,
    remoteAreaGrade: 'none', hasDisability: false, isSeniorCitizen: false,
    isFemale, foreignTaxPaidAnnual: isZero ? 0 : foreignTax,
    hasMedicalExpenses: false, festivalBonusAnnual: 0,
  }
  const result = useMemo(() => calculate(gross, opts), [gross, opts])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              <CardTitle>{t('foreign.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-info/8 border border-info/15 rounded-lg p-4">
              <p className="text-xs text-info">
                {t('foreign.info')}
              </p>
            </div>

            <MoneyInput value={gross} onChange={setGross} label={t('foreign.gross')}
              min={UI_CONFIG.slider.min} max={UI_CONFIG.slider.max} step={UI_CONFIG.slider.step} showSlider />

            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1.5">{t('foreign.country')}</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-background border-2 border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                {ALL_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {isDtaa && !isZero && <p className="text-xs text-info mt-1">{t('foreign.dtaa')}</p>}
            </div>

            {isZero && (
              <div className="bg-destructive/8 border border-destructive/15 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-destructive" />
                  <span className="text-xs font-semibold text-destructive">{t('foreign.zerotax')}</span>
                </div>
                <p className="text-xs text-destructive/80">{country} {t('foreign.zerotax.desc')}</p>
              </div>
            )}

            {!isZero && (
              <MoneyInput value={foreignTax} onChange={setForeignTax} label={t('foreign.taxpaid')} size="sm" showSlider={false} />
            )}

            {coupleOk && (
              <div className="flex gap-2">
                {(['single', 'couple'] as const).map((s) => (
                  <button key={s} onClick={() => { setFiling(s); if (s === 'couple') setIsFemale(false) }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${filing === s ? 'bg-foreground text-background border-foreground' : 'bg-background border-border text-muted-foreground hover:border-foreground/30'}`}>
                    {t(s === 'single' ? 'filing.single' : 'filing.couple')}
                  </button>
                ))}
              </div>
            )}

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <span className="text-sm text-foreground font-medium">{t('cit.title')}</span>
                <span className="block text-xs text-muted-foreground">{t('foreign.voluntary')}</span>
              </div>
              <Switch checked={useCit} onCheckedChange={(v: boolean) => setUseCit(v)} />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <span className="text-sm text-foreground font-medium">{t('special.female')}</span>
                <span className="block text-xs text-muted-foreground">{t('special.female.desc')}</span>
                {effectiveFiling === 'couple' && <span className="block text-xs text-destructive">{t('special.female.denied')}</span>}
              </div>
              <Switch checked={isFemale} onCheckedChange={(v: boolean) => setIsFemale(v)} disabled={effectiveFiling === 'couple'} />
            </label>
          </CardContent>
        </Card>
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:scrollbar-thin">
        <StickyOutput result={result} />
      </div>
    </div>
  )
}

/* ─── Freelancer Mode (5% flat rate) ─────────────────────────────────── */

function FreelancerMode() {
  const { t } = useApp()
  const [gross, setGross] = useState<number>(UI_CONFIG.defaults.gross)
  const flatRate = FLAT_TAX.freelancer  // 5%
  const annual = gross * 12
  const tax = annual * flatRate
  const inhand = gross - tax / 12

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Laptop size={16} className="text-primary" />
            <CardTitle>{t('freelancer.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-positive/8 border border-positive/15 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-positive mt-0.5 shrink-0" />
              <p className="text-xs text-positive">
                {t('freelancer.info')}
              </p>
            </div>
          </div>
          <MoneyInput value={gross} onChange={setGross} label={t('freelancer.gross')}
            min={UI_CONFIG.slider.min} max={UI_CONFIG.slider.max} step={UI_CONFIG.slider.step} showSlider />
        </CardContent>
      </Card>

      <FlatTaxOutput inhand={inhand} tax={tax} flatRate={flatRate} />
    </div>
  )
}

/* ─── Non-Resident Mode ──────────────────────────────────────────────── */

function NonResidentMode() {
  const { t } = useApp()
  const [gross, setGross] = useState<number>(UI_CONFIG.defaults.gross)
  const flatRate = FLAT_TAX.nonResident
  const annual = gross * 12
  const tax = annual * flatRate
  const inhand = gross - tax / 12

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plane size={16} className="text-primary" />
            <CardTitle>{t('nonresident.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-warm/8 border border-warm/15 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-warm mt-0.5 shrink-0" />
              <div className="text-xs text-warm">
                <p>{t('nonresident.info1')}</p>
                <p className="mt-1">{t('nonresident.info2')}</p>
              </div>
            </div>
          </div>
          <MoneyInput value={gross} onChange={setGross} label={t('nonresident.gross')}
            min={UI_CONFIG.slider.min} max={UI_CONFIG.slider.max} step={UI_CONFIG.slider.step} showSlider />
        </CardContent>
      </Card>

      <FlatTaxOutput inhand={inhand} tax={tax} flatRate={flatRate} rateLabel="25%" />
    </div>
  )
}

/* ─── Shared flat-tax output card ──────────────────────────────────── */

function FlatTaxOutput({ inhand, tax, flatRate, rateLabel }: { inhand: number; tax: number; flatRate: number; rateLabel?: string }) {
  const { t } = useApp()
  return (
    <Card>
      <CardContent className="text-center py-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">{t('output.inhand')}</p>
        <div>
          <span className="text-muted-foreground text-xl font-mono mr-1">₨</span>
          <AnimatedNumber value={inhand} format={(n) => Math.round(n).toLocaleString('en-IN')} className="text-4xl font-heading font-semibold text-copper-gradient" />
        </div>
        <div className="mt-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1 font-semibold">{t('output.annual.inhand')}</p>
          <div>
            <span className="text-muted-foreground text-sm font-mono mr-0.5">₨</span>
            <AnimatedNumber value={inhand * 12} format={(n) => Math.round(n).toLocaleString('en-IN')} className="text-xl font-heading font-semibold text-foreground" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t('common.monthly.tax')}{rateLabel ? ` (${rateLabel})` : ''}</p>
            <p className="font-mono text-sm text-primary font-medium">{formatNPR(tax / 12)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('common.annual.tax')}</p>
            <p className="font-mono text-sm text-primary font-medium">{formatNPR(tax)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('common.effective.rate')}</p>
            <p className="font-mono text-sm text-foreground font-semibold">{formatPct(flatRate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
