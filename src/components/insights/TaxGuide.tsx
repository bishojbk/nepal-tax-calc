"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { TAX_YEARS, SUPPORTS_COUPLE, type FiscalYear } from '@/config/tax'
import { formatNPR } from '@/lib/format'

interface Props {
  fiscalYear: FiscalYear
}

export function TaxGuide({ fiscalYear }: Props) {
  const [open, setOpen] = useState(false)
  const { lang } = useApp()

  return (
    <Card>
      <CardContent>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="tax-guide-panel"
          className="w-full flex items-center justify-between focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-lg"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">
              {lang === 'ne' ? 'कर कसरी गणना हुन्छ र कसरी घटाउने?' : 'How is tax calculated & how to reduce it?'}
            </span>
          </div>
          {open ? <ChevronUp size={16} className="text-muted-foreground" aria-hidden="true" /> : <ChevronDown size={16} className="text-muted-foreground" aria-hidden="true" />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id="tax-guide-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-5 text-sm text-muted-foreground">
                {lang === 'ne' ? <NepaliContent fiscalYear={fiscalYear} /> : <EnglishContent fiscalYear={fiscalYear} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/* Slab table generated from the selected year's config (single filer). */
function SlabTable({ fiscalYear, lang }: { fiscalYear: FiscalYear; lang: 'en' | 'ne' }) {
  const slabs = TAX_YEARS[fiscalYear].taxSlabs.single
  const h = lang === 'ne' ? { band: 'आय ब्यान्ड', rate: 'दर' } : { band: 'Income band', rate: 'Rate' }
  const rowLabel = (i: number) => {
    const prev = i === 0 ? 0 : slabs[i - 1].upTo
    const s = slabs[i]
    if (i === 0) return lang === 'ne' ? `पहिलो ${formatNPR(s.upTo)}` : `First ${formatNPR(s.upTo)}`
    if (s.upTo === Infinity) return lang === 'ne' ? `${formatNPR(prev)} भन्दा माथि` : `Above ${formatNPR(prev)}`
    return lang === 'ne' ? `अर्को ${formatNPR(s.upTo - prev)}` : `Next ${formatNPR(s.upTo - prev)}`
  }
  return (
    <div className="bg-secondary rounded-lg overflow-hidden border border-border/50">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="text-left py-2.5 px-4 font-semibold text-foreground">{h.band}</th>
            <th scope="col" className="text-right py-2.5 px-4 font-semibold text-foreground">{h.rate}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {slabs.map((s, i) => (
            <tr key={i}>
              <td className="py-2 px-4">{rowLabel(i)}</td>
              <td className="py-2 px-4 text-right font-mono">{s.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EnglishContent({ fiscalYear }: { fiscalYear: FiscalYear }) {
  const cfg = TAX_YEARS[fiscalYear]
  const slabs = cfg.taxSlabs.single
  const topRate = Math.round(slabs[slabs.length - 1].rate * 100)
  const firstBand = formatNPR(slabs[0].upTo)
  const couple = SUPPORTS_COUPLE(fiscalYear)

  return (
    <>
      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">How your tax is calculated</h4>
        <ol className="list-decimal list-inside space-y-1.5">
          <li><strong className="text-foreground">Start with gross salary</strong> — your total monthly CTC before any deductions.</li>
          <li><strong className="text-foreground">Subtract SSF</strong> — 31% of basic salary (basic = 60% of gross). This goes to your Social Security Fund.</li>
          <li><strong className="text-foreground">Subtract CIT</strong> — voluntary contribution to Citizen Investment Trust, up to the retirement cap.</li>
          <li><strong className="text-foreground">Subtract other deductions</strong> — life insurance, health insurance, building insurance, donations.</li>
          <li><strong className="text-foreground">Apply progressive slabs</strong> — the remaining taxable income is taxed at increasing rates from 1% to {topRate}%.</li>
          <li><strong className="text-foreground">Apply rebates</strong> — female employees get 10% off the tax (individual filing).</li>
        </ol>
      </div>

      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">Tax slabs (FY {cfg.label.bs} — Single)</h4>
        <SlabTable fiscalYear={fiscalYear} lang="en" />
        <p className="text-xs mt-2">If you contribute to SSF, the 1% SST slab is waived — effectively tax-free.</p>
      </div>

      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">Ways to legally reduce your tax</h4>
        <div className="space-y-2.5">
          <TipCard title="Contribute to SSF" desc={`Waives the 1% SST on the first ${firstBand} and reduces taxable income by 31% of basic. This is the biggest single lever.`} saving="High impact" color="text-positive" />
          <TipCard title="Max out CIT" desc="Voluntary retirement contribution. Tax-deductible and government-subsidised at your marginal rate." saving="High impact" color="text-positive" />
          <TipCard title="Life insurance premium" desc="Up to ₨ 40,000/year is deductible. At 20% marginal rate, saves ₨ 8,000 in tax." saving="₨ 4,000–8,000/yr" color="text-info" />
          <TipCard title="Health insurance premium" desc="Up to ₨ 20,000/year is deductible." saving="₨ 2,000–4,000/yr" color="text-info" />
          {couple && (
            <TipCard title="Couple filing" desc="If your spouse has no income, opt for couple assessment at IRD — the first slab widens. But you lose the female 10% rebate." saving="Varies" color="text-warm" />
          )}
          <TipCard title="Donation to approved charities" desc="Up to ₨ 1,00,000 or 5% of taxable income (whichever is lower) is deductible." saving="₨ 1,000–5,000/yr" color="text-info" />
        </div>
      </div>

      <div className="bg-primary/8 border border-primary/15 rounded-lg p-4">
        <p className="text-xs text-foreground">
          <strong>Key insight:</strong> SSF + CIT together reduce your taxable income the most. For someone earning ₨ 1,50,000/month,
          these two alone trim annual taxable income by up to ₨ 5,00,000 — a large cut at your marginal rate.
        </p>
      </div>
    </>
  )
}

function NepaliContent({ fiscalYear }: { fiscalYear: FiscalYear }) {
  const cfg = TAX_YEARS[fiscalYear]
  const slabs = cfg.taxSlabs.single
  const topRate = Math.round(slabs[slabs.length - 1].rate * 100)
  const firstBand = formatNPR(slabs[0].upTo)
  const couple = SUPPORTS_COUPLE(fiscalYear)

  return (
    <>
      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">तपाईंको कर कसरी गणना हुन्छ</h4>
        <ol className="list-decimal list-inside space-y-1.5">
          <li><strong className="text-foreground">कुल तलबबाट सुरु</strong> — कुनै पनि कटौती अघिको तपाईंको मासिक CTC।</li>
          <li><strong className="text-foreground">SSF घटाउनुहोस्</strong> — आधारभूत तलबको ३१% (आधारभूत = कुलको ६०%)। सामाजिक सुरक्षा कोषमा जान्छ।</li>
          <li><strong className="text-foreground">CIT घटाउनुहोस्</strong> — नागरिक लगानी कोषमा स्वैच्छिक योगदान।</li>
          <li><strong className="text-foreground">अन्य कटौती घटाउनुहोस्</strong> — जीवन बीमा, स्वास्थ्य बीमा, भवन बीमा, दान।</li>
          <li><strong className="text-foreground">प्रगतिशील स्ल्याब लागू</strong> — बाँकी करयोग्य आयमा १% देखि {topRate}% सम्म बढ्दो दरमा कर लाग्छ।</li>
          <li><strong className="text-foreground">छुट लागू</strong> — महिला कर्मचारीले करमा १०% छुट पाउँछन् (एकल दाखिला)।</li>
        </ol>
      </div>

      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">कर स्ल्याब (आ.व. {cfg.label.bs} — एकल)</h4>
        <SlabTable fiscalYear={fiscalYear} lang="ne" />
        <p className="text-xs mt-2">SSF मा योगदान गरेमा, १% SST स्ल्याब माफ हुन्छ — प्रभावकारी रूपमा कर-मुक्त।</p>
      </div>

      <div>
        <h4 className="text-foreground font-heading font-semibold mb-2">कानूनी रूपमा कर कसरी घटाउने</h4>
        <div className="space-y-2.5">
          <TipCard title="SSF मा योगदान गर्नुहोस्" desc={`पहिलो ${firstBand} मा १% SST माफ र आधारभूतको ३१% ले करयोग्य आय घटाउँछ। सबैभन्दा ठूलो बचत।`} saving="उच्च प्रभाव" color="text-positive" />
          <TipCard title="CIT अधिकतम बनाउनुहोस्" desc="स्वैच्छिक सेवानिवृत्ति योगदान। तपाईंको सीमान्त दरमा कर कटौतीयोग्य।" saving="उच्च प्रभाव" color="text-positive" />
          <TipCard title="जीवन बीमा प्रिमियम" desc="₨ ४०,०००/वर्ष सम्म कटौतीयोग्य।" saving="₨ ४,०००–८,०००/वर्ष" color="text-info" />
          <TipCard title="स्वास्थ्य बीमा प्रिमियम" desc="₨ २०,०००/वर्ष सम्म कटौतीयोग्य।" saving="₨ २,०००–४,०००/वर्ष" color="text-info" />
          {couple && (
            <TipCard title="दम्पती दाखिला" desc="पति/पत्नीको आय नभएमा, IRD मा दम्पती मूल्याङ्कन — पहिलो स्ल्याब फराकिलो हुन्छ। तर महिला १०% छुट गुम्छ।" saving="फरक पर्छ" color="text-warm" />
          )}
          <TipCard title="स्वीकृत संस्थामा दान" desc="₨ १,००,००० वा करयोग्य आयको ५% (जुन कम) सम्म कटौतीयोग्य।" saving="₨ १,०००–५,०००/वर्ष" color="text-info" />
        </div>
      </div>

      <div className="bg-primary/8 border border-primary/15 rounded-lg p-4">
        <p className="text-xs text-foreground">
          <strong>मुख्य कुरा:</strong> SSF + CIT ले सँगै सबैभन्दा बढी करयोग्य आय घटाउँछ। ₨ १,५०,००० मासिक कमाउनेको लागि,
          यी दुईले मात्र वार्षिक करयोग्य आय ₨ ५,००,००० सम्म घटाउँछ — सीमान्त दरमा ठूलो बचत।
        </p>
      </div>
    </>
  )
}

function TipCard({ title, desc, saving, color }: { title: string; desc: string; saving: string; color: string }) {
  return (
    <div className="bg-secondary/70 border border-border/40 rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-foreground font-medium text-xs">{title}</span>
        <span className={`text-xs font-mono font-semibold ${color}`}>{saving}</span>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  )
}
