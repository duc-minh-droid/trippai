"use client"

import { DEMO_MODE } from "@/lib/api"
import { Logo } from "./SiteNav"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#05070f]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            Forecasts the best week to travel from a year of weather history (Open-Meteo), search interest (Google Trends) and a price model, fitted with Prophet.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {DEMO_MODE ? (
            <span data-testid="demo-badge" className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Demo data: pre-computed model snapshots for 8 cities from London
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs text-teal-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
              Live: connected to the TrippAI API
            </span>
          )}
          <a href="https://github.com/duc-minh-droid/trippai" className="text-xs text-slate-500 hover:text-slate-300">
            github.com/duc-minh-droid/trippai
          </a>
        </div>
      </div>
    </footer>
  )
}
