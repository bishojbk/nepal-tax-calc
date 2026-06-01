"use client"

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { formatPct } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import type { CalcResult } from '@/lib/calculate'

interface Props {
  result: CalcResult
}

export function InhandHero({ result }: Props) {
  const { t } = useApp()

  return (
    <div className="text-center py-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-warm/4 rounded-xl pointer-events-none" />
      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] mb-2 relative font-semibold">{t('output.inhand')}</p>
      <div className="relative">
        <span className="text-muted-foreground text-lg md:text-xl font-mono mr-1">₨</span>
        <AnimatedNumber
          value={result.inhand}
          format={(n) => Math.round(n).toLocaleString('en-IN')}
          className="text-4xl md:text-5xl font-heading font-semibold text-copper-gradient tracking-tight"
        />
      </div>
      <div className="mt-2 relative">
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] mb-1 font-semibold">{t('output.annual.inhand')}</p>
        <div>
          <span className="text-muted-foreground text-sm font-mono mr-0.5">₨</span>
          <AnimatedNumber
            value={result.inhand * 12 + result.festivalBonusNet}
            format={(n) => Math.round(n).toLocaleString('en-IN')}
            className="text-xl md:text-2xl font-heading font-semibold text-foreground tracking-tight"
          />
        </div>
        {result.festivalBonusAnnual > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1">
            + ₨{Math.round(result.festivalBonusNet).toLocaleString('en-IN')} {t('output.bonus.note')}
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-sm relative">
        <span className="text-muted-foreground">
          {t('output.effective')}:{' '}
          <AnimatedNumber
            value={result.effectiveRate}
            format={(n) => formatPct(n)}
            className="text-primary font-mono font-semibold"
          />
        </span>
      </div>
    </div>
  )
}
