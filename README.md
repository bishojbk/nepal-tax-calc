# 🇳🇵 Nepal Salary Tax Calculator

A production-quality Nepal income tax calculator for **FY 2082/83 (2025/26)** and **FY 2083/84 (2026/27)** — switchable via a year selector — built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.

**[Live Demo](#) · [Report Bug](https://github.com/bishojbk/nepal-tax-calc/issues)**

---

## Features

### Four Income Modes

| Mode | Description |
|------|-------------|
| **Nepal Employment** | Full SSF/CIT, progressive slabs, all deductions |
| **Foreign Employment** | No SSF, foreign tax credit, Gulf country warnings, DTAA flags |
| **Freelancer** | 5% flat rate withheld by bank on foreign currency transfer |
| **Non-Resident** | Flat 25% on Nepal-sourced income, no deductions |

### Calculator

- Live in-hand salary with animated number transitions
- SSF & CIT as prominent "retirement contribution" controls
- Retirement cap indicator — shows whether ₨5L hard cap or 1/3 rule binds
- CIT paradox callout above ₨1,25,000 gross
- All insurance deductions (life, health, building)
- Donation with auto-capped limit
- Fiscal-year selector — FY 2082/83 (current law, default) or FY 2083/84 (proposed Budget 2083/84 — unified slabs, top rate 29%; pending enactment, ~mid-July 2026)
- Filing status (Single/Couple) — FY 2082/83 only; couple filing was abolished for FY 2083/84
- Special situations: female rebate, disability, remote area grades
- Tax slab waterfall chart with animated bars

### Raise Planner

- Current vs target salary comparison
- Marginal efficiency chart — how much of each ₨5K band reaches your pocket
- Side-by-side comparison table
- Verdict badges (Minimal → Job-switch territory)

### Insights

- "What if I skip CIT?" toggle with subsidy percentage
- Tax-saving summary showing active deductions + unclaimed ones as "money on the table"
- Full tax guide: how tax is calculated, slab table, 6 tips to reduce tax

### Bilingual

Full English and Nepali (नेपाली) support — every label, description, tooltip, and guide section is translated.

### Theming

- Light and dark theme with smooth transitions
- Defaults to system preference
- Persists choice to localStorage

---

## Tax Logic Verified

The engine passes 35+ unit tests, including real payslip anchors (FY 2082/83):

```
Test 1: ₨1,20,000/mo → SSF ₨22,320 · CIT ₨17,680 · Tax ₨6,000 · In-hand ₨74,000 ✓
Test 2: ₨1,50,000/mo → SSF ₨27,900 · CIT ₨13,767 · Tax ₨13,167 · In-hand ₨95,167 ✓
```

**FY 2083/84 slabs** (Budget 2083/84 — couple filing removed): 1% ≤₨10L · 10% ₨10–15L · 20% ₨15–25L · 27% ₨25–40L · 29% >₨40L. At ₨1,50,000/mo this drops monthly tax to ~₨2,500.

Key formula details:
- **SSF** = 31% of basic (basic = 60% of gross)
- **Retirement cap** = min(₨5,00,000/yr, 1/3 of annual assessable income)
- **CIT** = retirement cap − SSF (voluntary, tax-deductible)
- **SST waiver** — SSF contributors skip the 1% first slab
- **Female rebate** — 10% off tax liability (individual filing)
- **Medical tax credit** — ₨1,500 flat (Income Tax Act s.51)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion (respects `prefers-reduced-motion`)
- **Testing**: Jest + ts-jest
- **i18n**: Custom lightweight system (no heavy deps)

---

## Getting Started

```bash
# Clone
git clone https://github.com/bishojbk/nepal-tax-calc.git
cd nepal-tax-calc

# Install
npm install

# Run tests
npx jest

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── config/
│   ├── tax.ts              ← Single source of truth for all tax constants
│   └── i18n.ts             ← EN/NE translations
├── lib/
│   ├── calculate.ts        ← Pure calculation functions
│   ├── format.ts           ← Indian number formatting (₨ 1,50,000)
│   ├── app-context.tsx     ← Theme + language context provider
│   └── __tests__/
│       └── calculate.test.ts
├── components/
│   ├── calculator/         ← GrossSlider, DeductionToggles, FilingOptions, etc.
│   ├── raise-planner/      ← RaisePlanner, EfficiencyChart, ComparisonTable
│   ├── insights/           ← SkipCITToggle, TaxSavingSummary, TaxGuide
│   ├── layout/             ← ModeSelector, StickyOutput
│   └── ui/                 ← shadcn components
└── app/
    ├── page.tsx            ← Main page with all 4 modes
    ├── layout.tsx          ← Root layout, fonts, AppProvider
    ├── globals.css         ← Theme variables (light + dark)
    └── icon.tsx            ← Nepal flag favicon
```

---

## Accessibility

- Skip-to-content link
- ARIA roles: `tablist`, `tab`, `tabpanel`, `aria-expanded`, `aria-selected`
- `aria-live="polite"` on animated numbers
- `aria-label` on all sliders, icon buttons, and tooltips
- Keyboard-accessible tooltips and disclosure panels
- Global `focus-visible` ring on all interactive elements
- `scope="col"` on all table headers
- Decorative icons marked `aria-hidden="true"`
- Dynamic `lang` attribute on `<html>` when switching to Nepali
- `prefers-reduced-motion` respected in animations

---

## Updating for Next Fiscal Year

Tax rules live per year in `TAX_YEARS` in `src/config/tax.ts`. To add FY 2084/85:

1. Add the year to the `FiscalYear` union, then copy the most recent `TAX_YEARS` entry.
2. Change its `label` and `taxSlabs.single` (and `couple` if it applies, `disability` if the basic exemption moved).
3. Optionally point `DEFAULT_FY` at the new year.
4. Run `npx jest` to verify.

Shared constants (SSF rates, insurance/donation caps, retirement cap, medical credit) live in `COMMON`; year-independent UI in `UI_CONFIG`. A year offers couple filing iff its `taxSlabs.couple` exists — the selector and filing UI adapt automatically.

---

## License

MIT

---

Built with care for every Nepali taxpayer.
