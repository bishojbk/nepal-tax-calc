"use client"

import { motion } from 'framer-motion'
import type { SlabBreakdown } from '@/lib/calculate'
import { formatNPR } from '@/lib/format'
import { useApp } from '@/lib/app-context'

/* Nepal earth-tone palette for tax slabs — prayer-flag inspired */
const SLAB_COLORS: Record<string, string> = {
  '1% SST': 'var(--positive)',
  '10%': 'var(--info)',
  '20%': 'var(--warm)',
  '27%': 'var(--destructive)',
  '29%': '#7A2E1A',
  '30%': 'var(--primary)',
  '36%': 'var(--destructive)',
  '39%': '#7A2E1A',
}

/* Fallback colors for dark mode */
const SLAB_COLORS_DARK: Record<string, string> = {
  '1% SST': 'var(--positive)',
  '10%': 'var(--info)',
  '20%': 'var(--warm)',
  '27%': 'var(--destructive)',
  '29%': '#B85C3C',
  '30%': 'var(--primary)',
  '36%': 'var(--destructive)',
  '39%': '#B85C3C',
}

interface Props {
  breakdown: SlabBreakdown[]
  annualTaxable: number
}

export function SlabWaterfall({ breakdown, annualTaxable }: Props) {
  const { t } = useApp()

  if (annualTaxable <= 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        {t('slab.notaxable')}
      </div>
    )
  }

  const maxIncome = Math.max(...breakdown.map((s) => s.income), 1)

  return (
    <div className="space-y-3">
      {breakdown.map((slab, i) => {
        const pct = slab.income / maxIncome
        const colorLight = SLAB_COLORS[slab.label] || 'var(--positive)'
        const colorDark = SLAB_COLORS_DARK[slab.label] || 'var(--positive)'
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-foreground font-semibold">{slab.label}</span>
              <span className="text-muted-foreground font-mono">
                {formatNPR(slab.tax)}
              </span>
            </div>
            <div className="h-7 bg-secondary rounded-md overflow-hidden relative">
              <motion.div
                className="h-full rounded-md dark:hidden"
                style={{ backgroundColor: colorLight }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct * 100, 3)}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: i * 0.06 }}
              />
              <motion.div
                className="h-full rounded-md hidden dark:block absolute top-0 left-0"
                style={{ backgroundColor: colorDark }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct * 100, 3)}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: i * 0.06 }}
              />
              <span className="absolute inset-0 flex items-center px-3 text-xs font-mono font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                {formatNPR(slab.income)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
