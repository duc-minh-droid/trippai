"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Bookmark, CalendarDays, Lightbulb, PartyPopper, Sparkles, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Postcard } from "./Postcard"
import { ScoreRing } from "./ScoreRing"
import { Heatmap } from "./Heatmap"
import { TrendCharts } from "./TrendCharts"
import { ScoreBreakdown } from "./ScoreBreakdown"
import { RouteMap } from "./RouteMap"
import { WindowCards } from "./WindowCards"
import type { City } from "@/lib/cities"
import { savedTripsStorage } from "@/lib/saved-trips"
import { byMonth, candidateWindows, fmtDate, fmtRange, scoreWeeks, topWindows, type Preferences, type PredictResult, type Weights } from "@/lib/trip"

function Section({ title, kicker, children, delay = 0 }: { title: string; kicker: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300/80">{kicker}</p>
      <h2 className="mt-1 font-display text-3xl text-white sm:text-4xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </motion.section>
  )
}

interface ResultsProps {
  result: PredictResult
  origin: City
  destination: City
  prefs: Preferences
}

export function Results({ result, origin, destination, prefs }: ResultsProps) {
  const [weights, setWeights] = useState<Weights>(prefs.weights)
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    setWeights(prefs.weights)
    setSelected(0)
  }, [prefs, result])

  const weekly = result.weekly ?? []
  const livePrefs = useMemo(() => ({ ...prefs, weights }), [prefs, weights])
  const scored = useMemo(() => scoreWeeks(weekly, livePrefs), [weekly, livePrefs])
  const months = useMemo(() => byMonth(scored), [scored])
  const windows = useMemo(() => topWindows(candidateWindows(scored, prefs.tripDays), 3), [scored, prefs.tripDays])
  const win = windows[Math.min(selected, windows.length - 1)]
  const bestWeeks = useMemo(() => new Set(win?.weeks.map((w) => w.date) ?? []), [win])
  const bestRange = useMemo<[number, number] | null>(() => {
    if (!win) return null
    const i = scored.findIndex((w) => w.date === win.weeks[0].date)
    return [i, i + win.weeks.length - 1]
  }, [win, scored])

  const save = () => {
    savedTripsStorage.save({ name: `${destination.name} · ${win ? fmtRange(win.start, win.end) : ""}`, type: "single", data: result })
    toast.success("Trip saved", { description: "Find it under Saved trips." })
  }

  if (!win) {
    return (
      <div className="rounded-2xl border border-rose-300/30 bg-rose-300/5 p-6 text-rose-100">
        No week in your travel window fits the budget. Try widening the window or raising the budget.
      </div>
    )
  }

  const events = result.events ?? []
  // backend text uses the raw (lower-case) request name
  const fix = (text: string) => {
    const t = text.replace(new RegExp(result.destination, "gi"), destination.name)
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  return (
    <div data-testid="results">
      {/* headline */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1022]"
        >
          <div className="relative h-44 overflow-hidden sm:h-48">
            <Postcard city={destination.name} temp={win.temp} seed={win.start} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1022] via-[#0b1022]/30 to-transparent" />
            <div className="absolute bottom-4 left-6 sm:left-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100">Best time to visit</p>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-1 font-display text-5xl leading-none text-white drop-shadow-lg sm:text-6xl">
                {destination.name}
              </motion.h2>
            </div>
          </div>
          <div className="relative flex items-center gap-5 bg-[#0b1022] px-6 pb-5 pt-3 sm:px-7">
            <div className="min-w-0 flex-1">
              <motion.p key={win.start} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-lg text-white sm:text-xl" data-testid="best-dates">
                <CalendarDays className="h-4 w-4 shrink-0 text-amber-300" />
                {fmtRange(win.start, win.end)}
              </motion.p>
              <p className="mt-1 text-sm text-slate-400">
                from {origin.name} · {prefs.tripDays} days · {win.temp.toFixed(0)}°C · ~${win.price.toFixed(0)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">Confidence {Math.round(result.confidence * 100)}%</span>
                <motion.button whileTap={{ scale: 0.95 }} onClick={save} className="flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs text-amber-100 hover:bg-amber-300/25">
                  <Bookmark className="h-3 w-3" /> Save trip
                </motion.button>
              </div>
            </div>
            <div className="-mt-16 shrink-0 rounded-full bg-[#0b1022] p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <ScoreRing score={win.score} size={128} label="score" />
            </div>
          </div>
          <div className="relative border-t border-white/[0.06] bg-[#0b1022] p-5 sm:px-7">
            <p className="flex gap-2 text-sm leading-relaxed text-slate-300">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span className="line-clamp-3">{fix(result.ai_explanation)}</span>
            </p>
            {result.ai_travel_tip && (
              <p className="mt-2 flex gap-2 text-sm leading-relaxed text-slate-400">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <span className="line-clamp-2">{fix(result.ai_travel_tip)}</span>
              </p>
            )}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="h-full">
          <RouteMap origin={origin} destination={destination} />
        </motion.div>
      </div>

      <Section kicker="The year ahead" title="Month by month">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-4 pt-12 sm:p-6 sm:pt-12">
          <Heatmap
            months={months}
            bestWeeks={bestWeeks}
            onPick={(w) => {
              const idx = windows.findIndex((x) => x.weeks.some((y) => y.date === w.date))
              if (idx >= 0) setSelected(idx)
            }}
          />
        </div>
      </Section>

      <Section kicker="Your options" title="Three windows worth booking">
        <WindowCards city={destination.name} windows={windows} selected={selected} onSelect={setSelected} />
      </Section>

      <Section kicker="The signals" title="Weather, crowds and price">
        <TrendCharts weeks={scored} bestRange={bestRange} />
      </Section>

      <Section kicker="The maths" title="How the score is built">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ScoreBreakdown win={win} weights={weights} onWeights={setWeights} />
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium text-white">
              <PartyPopper className="h-4 w-4 text-rose-300" /> What&apos;s on in {destination.name}
            </h3>
            {result.event_warning && <p className="mt-2 text-xs text-slate-400">{fix(result.event_warning)}</p>}
            <div className="mt-4 space-y-3">
              {events.slice(0, 3).map((e, i) => (
                <motion.a
                  key={e.name}
                  href={e.url && e.url !== "#" ? e.url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3 transition-colors hover:border-white/15"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-400/30 to-amber-300/20 text-center">
                    <div>
                      <div className="text-[9px] uppercase text-rose-200">{fmtDate(e.start_date, { month: "short" })}</div>
                      <div className="text-base font-semibold leading-none text-white">{fmtDate(e.start_date, { day: "numeric" })}</div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">{e.name}</span>
                      {e.is_free && <span className="rounded bg-teal-400/15 px-1.5 text-[10px] text-teal-200">Free</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Ticket className="h-3 w-3" /> {e.category} · {e.venue}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{e.description}</p>
                  </div>
                </motion.a>
              ))}
              {events.length === 0 && <p className="text-sm text-slate-400">No listed events for these dates.</p>}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
