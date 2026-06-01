"use client"

import { TAX_YEARS } from '@/config/tax'
import { formatNPR } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import type { CalcOptions } from '@/lib/calculate'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface Props {
  gross: number
  options: CalcOptions
  maxCitMonthly: number
  onChange: (patch: Partial<CalcOptions>) => void
}

export function DeductionToggles({ gross, options, maxCitMonthly, onChange }: Props) {
  const { t } = useApp()
  const CFG = TAX_YEARS[options.fiscalYear]
  const { retirementCap } = CFG
  const basic = gross * CFG.salary.basicRatio / (options.grossIncludesEmployerSSF ? 1 : (1 - CFG.salary.basicRatio * CFG.ssf.employerRate))
  const annualGross = gross * 12
  const absCapBinds = retirementCap.absoluteMax <= annualGross * retirementCap.ratioMax
  const capLabel = absCapBinds
    ? t('retirement.hardcap')
    : `${t('retirement.thirdrule')} (${formatNPR(annualGross * retirementCap.ratioMax)}${t('common.yr')})`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('retirement.title')}</CardTitle>
        <CardDescription>{capLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* SSF */}
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{t('ssf.title')}</span>
              <span className="block text-xs text-muted-foreground">
                {t('ssf.desc')}
              </span>
            </div>
            <Switch
              checked={options.includeSSF}
              onCheckedChange={(v: boolean) => onChange({ includeSSF: v })}
            />
          </label>

          {options.includeSSF && (
            <div className="space-y-2 pl-1">
              <label className="flex items-start justify-between gap-3 cursor-pointer">
                <div className="flex-1">
                  <span className="text-xs font-medium text-foreground">{t('ssf.mode.label')}</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {options.grossIncludesEmployerSSF ? t('ssf.mode.loaded') : t('ssf.mode.employee')}
                  </span>
                </div>
                <Switch
                  checked={options.grossIncludesEmployerSSF}
                  onCheckedChange={(v: boolean) => onChange({ grossIncludesEmployerSSF: v })}
                />
              </label>
              <div className="text-[11px] text-muted-foreground font-mono">
                Basic {formatNPR(basic)}
              </div>
            </div>
          )}
        </div>

        {/* CIT */}
        <div className="space-y-1.5 pt-4 border-t border-border">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{t('cit.title')}</span>
              <span className="block text-xs text-muted-foreground">
                {t('cit.max')}: {formatNPR(maxCitMonthly)}{t('common.mo')}
              </span>
            </div>
            <Switch
              checked={options.includeCIT}
              onCheckedChange={(v: boolean) => onChange({ includeCIT: v, citAmount: v ? Infinity : 0 })}
            />
          </label>
          {options.includeCIT && (
            <div className="space-y-1.5 pl-1">
              <input
                type="range"
                aria-label={t('cit.title')}
                min={0}
                max={Math.round(maxCitMonthly)}
                step={100}
                value={Math.min(options.citAmount, Math.round(maxCitMonthly))}
                onChange={(e) => onChange({ citAmount: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">₨ 0</span>
                <span className="text-primary font-semibold">{formatNPR(Math.min(options.citAmount, maxCitMonthly))}</span>
                <span className="text-muted-foreground">{formatNPR(maxCitMonthly)}</span>
              </div>
              <button
                onClick={() => onChange({ citAmount: Infinity })}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
              >
                {t('cit.usemax')}
              </button>
              {gross > 125_000 && (
                <div className="bg-warm/8 border border-warm/15 rounded-lg p-3 mt-1">
                  <p className="text-xs text-warm">
                    {t('cit.paradox')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Insurance deductions */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-[0.1em]">{t('deductions.title')}</p>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="text-sm text-foreground font-medium">{t('deductions.life')}</span>
              <span className="block text-xs text-muted-foreground">{formatNPR(CFG.deductions.lifeInsurance.max)}{t('common.yr')} {t('common.cap')}</span>
            </div>
            <Switch
              checked={options.lifeInsurance > 0}
              onCheckedChange={(v: boolean) => onChange({ lifeInsurance: v ? CFG.deductions.lifeInsurance.max : 0 })}
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="text-sm text-foreground font-medium">{t('deductions.health')}</span>
              <span className="block text-xs text-muted-foreground">{formatNPR(CFG.deductions.healthInsurance.max)}{t('common.yr')} {t('common.cap')}</span>
            </div>
            <Switch
              checked={options.healthInsurance > 0}
              onCheckedChange={(v: boolean) => onChange({ healthInsurance: v ? CFG.deductions.healthInsurance.max : 0 })}
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="text-sm text-foreground font-medium">{t('deductions.building')}</span>
              <span className="block text-xs text-muted-foreground">{t('common.upto')} {formatNPR(CFG.deductions.buildingInsurance.max)}{t('common.yr')}</span>
            </div>
            <Switch
              checked={options.buildingInsurance > 0}
              onCheckedChange={(v: boolean) => onChange({ buildingInsurance: v ? CFG.deductions.buildingInsurance.max : 0 })}
            />
          </label>

          {(() => {
            const maxDonation = Math.min(
              CFG.deductions.donation.maxAbsolute,
              Math.round(gross * 12 * CFG.deductions.donation.maxPctOfTaxable)
            )
            const isCapped = options.donationAnnual > 0 && options.donationAnnual >= maxDonation
            return (
              <div>
                <label htmlFor="donation-input" className="text-sm text-foreground font-medium block mb-1">{t('deductions.donation')}</label>
                <input
                  id="donation-input"
                  type="text"
                  inputMode="numeric"
                  aria-label={t('deductions.donation')}
                  value={options.donationAnnual > 0 ? Math.round(options.donationAnnual).toLocaleString('en-IN') : ''}
                  placeholder="0"
                  onChange={(e) => {
                    const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                    onChange({ donationAnnual: Math.min(v, maxDonation) })
                  }}
                  className="w-full bg-background border-2 border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                <p className={`text-xs mt-1 ${isCapped ? 'text-warm font-medium' : 'text-muted-foreground'}`}>
                  {isCapped ? `Capped at ${formatNPR(maxDonation)}` : `${t('cit.max')}: ${formatNPR(maxDonation)}`} ({t('deductions.donation.cap')})
                </p>
              </div>
            )
          })()}
        </div>

        {/* Festival / Dashain bonus — taxable income paid once a year */}
        <div className="space-y-1.5 pt-4 border-t border-border">
          <label htmlFor="bonus-input" className="text-sm text-foreground font-medium block">{t('income.bonus')}</label>
          <div className="flex gap-2 items-center">
            <input
              id="bonus-input"
              type="text"
              inputMode="numeric"
              aria-label={t('income.bonus')}
              value={options.festivalBonusAnnual > 0 ? Math.round(options.festivalBonusAnnual).toLocaleString('en-IN') : ''}
              placeholder="0"
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                onChange({ festivalBonusAnnual: v })
              }}
              className="flex-1 bg-background border-2 border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => onChange({ festivalBonusAnnual: Math.round(basic) })}
              className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2 px-2 py-2.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
            >
              {t('income.bonus.fill')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('income.bonus.hint')}</p>
        </div>
      </CardContent>
    </Card>
  )
}
