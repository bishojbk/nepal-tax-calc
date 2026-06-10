import type { Metadata } from "next"
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProvider } from "@/lib/app-context"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
})

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Nepal Salary Tax Calculator — FY 2082/83 & 2083/84",
  description: "Calculate your Nepal income tax, SSF, CIT, and take-home salary. Supports all filing statuses and deductions under Income Tax Act 2058.",
  keywords: ["Nepal tax calculator", "income tax Nepal", "salary calculator Nepal", "SSF calculator", "CIT calculator", "FY 2083/84", "FY 2082/83", "Nepal tax slab", "take home salary Nepal"],
  authors: [{ name: "nepal-tax-calc" }],
  metadataBase: new URL("https://nepal-tax-calc.vercel.app"),
  openGraph: {
    title: "Nepal Salary Tax Calculator — FY 2082/83 & 2083/84",
    description: "Calculate your Nepal income tax, SSF, CIT, and take-home salary instantly. Supports Nepal employment, foreign employment, freelancer, and non-resident modes.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ne_NP",
    siteName: "Nepal Tax Calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Salary Tax Calculator — FY 2082/83 & 2083/84",
    description: "Calculate your Nepal income tax, SSF, CIT, and take-home salary instantly.",
  },
  other: {
    "theme-color": "#B4632A",
    "color-scheme": "light dark",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#B4632A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nepal Tax Calc" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <AppProvider>{children}</AppProvider>
        <footer style={{ textAlign: "center", padding: "16px", fontSize: "13px", opacity: 0.6 }}>
          Made by <a href="https://github.com/bishojbk" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>EJR</a>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
