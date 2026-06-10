"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TAX_YEARS } from '@/config/tax'
import type { RemoteGrade } from '@/config/tax'
import type { CalcOptions } from '@/lib/calculate'
import { formatNPR } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  options: CalcOptions
  onChange: (patch: Partial<CalcOptions>) => void
}

const grades: RemoteGrade[] = ['none', 'A', 'B', 'C', 'D', 'E']

export function SpecialSituations({ options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useApp()
  const CFG = TAX_YEARS[options.fiscalYear]

  return (
    <Card>
      <CardContent>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="special-situations-panel"
          className="w-full flex items-center justify-between text-sm text-foreground hover:text-foreground/80 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-lg"
        >
          <span className="font-semibold">{t('special.title')}</span>
          {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id="special-situations-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex-1">
                    <span className="text-sm text-foreground font-medium">{t('special.female')}</span>
                    <span className="block text-xs text-muted-foreground">{t('special.female.desc')}</span>
                    {options.filingStatus === 'couple' && (
                      <span className="block text-xs text-destructive">{t('special.female.denied')}</span>
                    )}
                  </div>
                  <Switch
                    checked={options.isFemale}
                    onCheckedChange={(v: boolean) => onChange({ isFemale: v })}
                    disabled={options.filingStatus === 'couple'}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="text-sm text-foreground font-medium">{t('special.disability')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatNPR(CFG.specialExemptions.disability[options.filingStatus] ?? CFG.specialExemptions.disability.single)} {t('special.disability.desc')}
                    </span>
                  </div>
                  <Switch
                    checked={options.hasDisability}
                    onCheckedChange={(v: boolean) => onChange({ hasDisability: v })}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="text-sm text-foreground font-medium">{t('special.medical')}</span>
                    <span className="block text-xs text-muted-foreground">{t('special.medical.desc')}</span>
                  </div>
                  <Switch
                    checked={options.hasMedicalExpenses}
                    onCheckedChange={(v: boolean) => onChange({ hasMedicalExpenses: v })}
                  />
                </label>

                <div>
                  <p className="text-sm text-foreground font-medium mb-2">{t('special.remote')}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {grades.map((g) => {
                      const val = CFG.deductions.remoteArea[g]
                      return (
                        <button
                          key={g}
                          onClick={() => onChange({ remoteAreaGrade: g })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                            options.remoteAreaGrade === g
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background border-border text-muted-foreground hover:border-foreground/30'
                          }`}
                        >
                          {g === 'none' ? t('special.remote.none') : `Grade ${g}`}
                          {val > 0 && <span className="ml-1 opacity-70">{formatNPR(val)}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
