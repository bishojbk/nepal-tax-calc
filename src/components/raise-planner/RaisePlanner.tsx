"use client"

import { useMemo, useState, useCallback } from 'react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { EfficiencyChart } from './EfficiencyChart'
import { ComparisonTable } from './ComparisonTable'
import { formatNPR, formatPct } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import { calculate, type CalcOptions, type CalcResult } from '@/lib/calculate'
import { UI_CONFIG } from '@/config/tax'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, TrendingUp, Target, AlertTriangle, Building2 } from 'lucide-react'

interface Props {
  currentResult: CalcResult
  options: CalcOptions
}

export function RaisePlanner({ currentResult, options }: Props) {
  const { t } = useApp()
  const [targetGross, setTargetGross] = useState(
    Math.round(currentResult.gross * 1.25 / 5000) * 5000
  )
  const [goalInhand, setGoalInhand] = useState('')
  const { slider } = UI_CONFIG

  const targetResult = useMemo(
    () => calculate(targetGross, { ...options, citAmount: Infinity }),
    [targetGross, options]
  )

  const raisePct = currentResult.gross > 0
    ? (targetGross - currentResult.gross) / currentResult.gross
    : 0
  const inhandDelta = targetResult.inhand - currentResult.inhand
  const annualInhandDelta = inhandDelta * 12
  const grossDelta = targetGross - currentResult.gross

  // Overall raise efficiency: what % of gross raise reaches your pocket
  const overallEfficiency = grossDelta > 0 ? inhandDelta / grossDelta : 0

  // Employer cost: gross raise + employer SSF share on the raise
  // In Mode B (employee-gross) the employer's 20% is already on top of gross,
  // so the "extra CTC" is just the gross delta plus the employer SSF delta.
  const employerSSFDelta = targetResult.ssfEmployerMonthly - currentResult.ssfEmployerMonthly
  const employerCost = grossDelta + employerSSFDelta

  // Detect new slab crossing
  const currentTopSlab = [...currentResult.slabBreakdown].reverse().find((s) => s.tax > 0)
  const targetTopSlab = [...targetResult.slabBreakdown].reverse().find((s) => s.tax > 0)
  const newSlabCrossed = targetTopSlab && currentTopSlab && targetTopSlab.label !== currentTopSlab.label
    ? targetTopSlab.label : null

  const verdict = UI_CONFIG.verdicts.find(
    (v) => raisePct >= v.minPct && raisePct < v.maxPct
  )

  const verdictStyles: Record<string, string> = {
    slate: 'bg-secondary text-muted-foreground',
    blue: 'bg-info/10 text-info',
    green: 'bg-positive/10 text-positive',
    amber: 'bg-warm/10 text-warm',
    red: 'bg-destructive/10 text-destructive',
  }

  const bands = useMemo(() => {
    const start = currentResult.gross
    const end = Math.max(start, targetGross)
    const range = end - start
    // Adaptive step: keep max ~60 bands to avoid performance issues
    const step = range > 300_000 ? Math.ceil(range / 60 / 5000) * 5000 : 5000
    const result: { from: number; to: number; efficiency: number }[] = []
    for (let g = start; g < end; g += step) {
      const gEnd = Math.min(g + step, end)
      const r1 = calculate(g, options)
      const r2 = calculate(gEnd, options)
      const grossD = gEnd - g
      const inhandD = r2.inhand - r1.inhand
      result.push({ from: g, to: gEnd, efficiency: grossD > 0 ? inhandD / grossD : 0 })
    }
    return result
  }, [currentResult.gross, targetGross, options])

  // Goal-based reverse calculator: binary search for gross that gives desired extra in-hand
  const goalResult = useMemo(() => {
    const desiredExtra = parseInt(goalInhand.replace(/[^0-9]/g, ''), 10)
    if (!desiredExtra || desiredExtra <= 0) return null

    const targetInhand = currentResult.inhand + desiredExtra
    let lo = currentResult.gross
    let hi = currentResult.gross + desiredExtra * 5 // generous upper bound
    hi = Math.max(hi, slider.max)

    for (let i = 0; i < 40; i++) {
      const mid = Math.round((lo + hi) / 2)
      const r = calculate(mid, { ...options, citAmount: Infinity })
      if (r.inhand < targetInhand) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }

    const requiredGross = Math.ceil(lo / 1000) * 1000 // round up to nearest 1K
    const requiredResult = calculate(requiredGross, { ...options, citAmount: Infinity })
    const requiredRaise = requiredGross - currentResult.gross
    const requiredRaisePct = currentResult.gross > 0 ? requiredRaise / currentResult.gross : 0

    return {
      gross: requiredGross,
      inhand: requiredResult.inhand,
      raise: requiredRaise,
      raisePct: requiredRaisePct,
    }
  }, [goalInhand, currentResult, options, slider.max])

  return (
    <div className="space-y-5">
      {/* Main raise card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <CardTitle>{t('raise.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block">
            <span className="text-xs text-muted-foreground font-semibold">{t('raise.target')}</span>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-muted-foreground font-mono">₨</span>
              <input
                type="text"
                inputMode="numeric"
                value={Math.round(targetGross).toLocaleString('en-IN')}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
                  if (!isNaN(v)) setTargetGross(v)
                }}
                className="flex-1 bg-background border-2 border-border rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <input
              type="range"
              min={currentResult.gross}
              max={Math.max(slider.max, currentResult.gross + 200000)}
              step={slider.step}
              value={targetGross}
              onChange={(e) => setTargetGross(Number(e.target.value))}
              className="mt-3 w-full"
            />
          </label>

          {/* Current vs Target */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{t('raise.current')}</p>
              <p className="font-mono text-lg text-foreground">{formatNPR(currentResult.inhand)}</p>
              <p className="text-xs text-muted-foreground">{t('raise.inhand')}</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{formatNPR(currentResult.inhand * 12)}{t('common.yr')}</p>
            </div>
            <ArrowRight size={20} className="text-primary" />
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{t('raise.target.label')}</p>
              <p className="font-mono text-lg text-foreground">{formatNPR(targetResult.inhand)}</p>
              <p className="text-xs text-muted-foreground">{t('raise.inhand')}</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{formatNPR(targetResult.inhand * 12)}{t('common.yr')}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/70 rounded-lg p-3 border border-border/40">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block">{t('raise.grosspct')}</span>
              <AnimatedNumber value={raisePct} format={formatPct} className="font-mono text-lg text-primary font-semibold" />
              {verdict && (
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold mt-1 ${verdictStyles[verdict.color]}`}>
                  {verdict.label}
                </span>
              )}
            </div>
            <div className="bg-secondary/70 rounded-lg p-3 border border-border/40">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block">{t('raise.delta')}</span>
              <span className={`font-mono text-lg font-semibold ${inhandDelta >= 0 ? 'text-positive' : 'text-primary'}`}>
                {inhandDelta >= 0 ? '+' : '−'}
                <AnimatedNumber value={Math.abs(inhandDelta)} format={(n) => formatNPR(n).slice(1)} className="" />
              </span>
              <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                {annualInhandDelta >= 0 ? '+' : '−'}{formatNPR(Math.abs(annualInhandDelta))}{t('common.yr')}
              </span>
            </div>
            <div className="bg-secondary/70 rounded-lg p-3 border border-border/40">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block">{t('raise.overall.efficiency')}</span>
              <AnimatedNumber
                value={overallEfficiency}
                format={(n) => `${(n * 100).toFixed(0)}%`}
                className={`font-mono text-lg font-semibold ${
                  overallEfficiency > 0.7 ? 'text-positive' :
                  overallEfficiency > 0.5 ? 'text-warm' : 'text-destructive'
                }`}
              />
              <span className="block text-[10px] text-muted-foreground mt-0.5">{t('raise.overall.efficiency.desc')}</span>
            </div>
            <div className="bg-secondary/70 rounded-lg p-3 border border-border/40">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block flex items-center gap-1">
                <Building2 size={11} />
                {t('raise.employer.cost')}
              </span>
              <span className="font-mono text-lg font-semibold text-foreground">
                {grossDelta > 0 ? '+' : ''}{formatNPR(employerCost)}
              </span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">{t('raise.employer.cost.desc')}</span>
            </div>
          </div>

          {/* New slab alert */}
          {newSlabCrossed && (
            <div className="bg-warm/8 border border-warm/15 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-warm mt-0.5 shrink-0" />
              <p className="text-xs text-warm">
                {t('raise.slab.alert')} <strong>{newSlabCrossed}</strong> {t('raise.slab.alert.suffix')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal-based reverse calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target size={16} className="text-primary" />
            <CardTitle>{t('raise.goal.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground font-semibold">{t('raise.goal.label')}</span>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-muted-foreground font-mono">+₨</span>
              <input
                type="text"
                inputMode="numeric"
                value={goalInhand}
                placeholder="10,000"
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  setGoalInhand(raw ? parseInt(raw, 10).toLocaleString('en-IN') : '')
                }}
                className="flex-1 bg-background border-2 border-border rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </label>

          {goalResult && (
            <div className="bg-secondary/70 border border-border/40 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('raise.goal.need')}</span>
                <span className="font-mono text-sm text-foreground font-semibold">{formatNPR(goalResult.gross)}{t('common.mo')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('raise.goal.raise')}</span>
                <span className="font-mono text-sm text-primary font-semibold">+{formatNPR(goalResult.raise)} ({formatPct(goalResult.raisePct)})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('raise.inhand')}</span>
                <span className="font-mono text-sm text-positive font-semibold">{formatNPR(goalResult.inhand)}</span>
              </div>
              <button
                onClick={() => setTargetGross(goalResult.gross)}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2 mt-1"
              >
                Use as target
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <EfficiencyChart bands={bands} />
      <ComparisonTable current={currentResult} target={targetResult} />
    </div>
  )
}
