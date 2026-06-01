"use client"

import { TAX_YEARS } from '@/config/tax'
import { formatNPR } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import type { CalcResult, CalcOptions } from '@/lib/calculate'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Sparkles } from 'lucide-react'

interface Props {
  result: CalcResult
  options: CalcOptions
}

interface Item {
  label: string
  active: boolean
  annualSaving: number
  potentialSaving?: number
}

export function TaxSavingSummary({ result, options }: Props) {
  const { t } = useApp()
  const CFG = TAX_YEARS[options.fiscalYear]
  const activeSlab = [...result.slabBreakdown].reverse().find((s) => s.tax > 0)
  const marginalRate = activeSlab?.rate ?? 0

  // Full SSF contribution (11% + 20%) reduces taxable income regardless of mode
  const ssfTaxDeductionAnnual = (result.ssfEmployeeMonthly + result.ssfEmployerMonthly) * 12

  const items: Item[] = [
    {
      label: t('ssf.title'),
      active: options.includeSSF,
      annualSaving: options.includeSSF ? ssfTaxDeductionAnnual * marginalRate : 0,
      potentialSaving: !options.includeSSF
        ? result.gross * CFG.salary.basicRatio * CFG.ssf.totalRate * 12 * marginalRate
        : undefined,
    },
    {
      label: t('cit.title'),
      active: options.includeCIT && result.citMonthly > 0,
      annualSaving: result.citAnnual * marginalRate,
      potentialSaving: !options.includeCIT
        ? result.maxCitMonthly * 12 * marginalRate
        : undefined,
    },
    {
      label: t('deductions.life'),
      active: options.lifeInsurance > 0,
      annualSaving: options.lifeInsurance * marginalRate,
      potentialSaving: options.lifeInsurance === 0
        ? CFG.deductions.lifeInsurance.max * marginalRate
        : undefined,
    },
    {
      label: t('deductions.health'),
      active: options.healthInsurance > 0,
      annualSaving: options.healthInsurance * marginalRate,
      potentialSaving: options.healthInsurance === 0
        ? CFG.deductions.healthInsurance.max * marginalRate
        : undefined,
    },
    {
      label: t('deductions.building'),
      active: options.buildingInsurance > 0,
      annualSaving: options.buildingInsurance * marginalRate,
      potentialSaving: options.buildingInsurance === 0
        ? CFG.deductions.buildingInsurance.max * marginalRate
        : undefined,
    },
  ]

  if (options.isFemale && options.filingStatus === 'single') {
    const rebateAmt = result.annualTax * CFG.rebates.female.rate / (1 - CFG.rebates.female.rate)
    items.push({
      label: `${t('special.female')} (10%)`,
      active: true,
      annualSaving: rebateAmt,
    })
  }

  const totalSaving = items.reduce((s, i) => s + i.annualSaving, 0)
  const unused = items.filter((i) => !i.active && i.potentialSaving && i.potentialSaving > 0)

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-heading font-semibold text-foreground">{t('insights.saving.title')}</span>
        </div>

        <div className="space-y-3">
          {items.filter((i) => i.active).map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-positive" />
                <span className="text-sm text-foreground font-medium">{item.label}</span>
              </div>
              <span className="font-mono text-xs text-positive font-medium">
                −{formatNPR(item.annualSaving)}{t('common.yr')}
              </span>
            </div>
          ))}
        </div>

        {unused.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium mb-2">{t('insights.unclaimed')}</p>
            <div className="space-y-3">
              {unused.map((item) => (
                <div key={item.label} className="flex items-center justify-between opacity-60 hover:opacity-90 transition-opacity">
                  <div className="flex items-center gap-2">
                    <X size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-mono text-xs text-warm">
                    {t('insights.couldsave')} {formatNPR(item.potentialSaving!)}{t('common.yr')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-border flex justify-between">
          <span className="text-sm text-foreground font-semibold">{t('insights.total.saving')}</span>
          <span className="font-mono text-sm text-primary font-bold">{formatNPR(totalSaving)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('insights.marginal')} {(marginalRate * 100).toFixed(0)}%
        </p>
      </CardContent>
    </Card>
  )
}
