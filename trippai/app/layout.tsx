import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/ui/theme/theme-provider"
import { SiteNav } from "@/components/site/SiteNav"
import { SiteFooter } from "@/components/site/SiteFooter"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const display = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "TrippAI · Find the best week to travel",
  description:
    "TrippAI forecasts weather, crowds and prices for the year ahead and tells you the best week to visit a city.",
}

export const viewport: Viewport = {
  themeColor: "#070a17",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} min-h-screen bg-[#070a17] font-sans text-slate-100 antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <SiteNav />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
