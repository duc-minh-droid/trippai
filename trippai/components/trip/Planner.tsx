"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CalendarRange, CloudSun, DollarSign, Minus, Plane, PlaneTakeoff, Plus, Users, Wallet } from "lucide-react"
import { CitySearch } from "./CitySearch"
import { cities, type City } from "@/lib/cities"
import { DEMO_DESTINATIONS, DEMO_MODE, DEMO_ORIGIN } from "@/lib/api"
import type { Preferences, Weights } from "@/lib/trip"
import { cn } from "@/lib/utils"

export interface PlanInput {
  origin: City
  destination: City
  prefs: Preferences
}

interface PlannerProps {
  origin: City
  destination: City | null
  onOrigin: (c: City) => void
  onDestination: (c: City) => void
  onSubmit: (p: PlanInput) => void
  loading: boolean
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function nextMonths(n: number) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[d.getMonth()], year: d.getFullYear() }
  })
}

const PRESETS = [
  { label: "Weekend", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
]

const FACTORS: { key: keyof Weights; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "price", label: "Price", icon: <DollarSign className="h-3.5 w-3.5" />, color: "#f6c453" },
  { key: "weather", label: "Weather", icon: <CloudSun className="h-3.5 w-3.5" />, color: "#5eead4" },
  { key: "crowd", label: "Quiet", icon: <Users className="h-3.5 w-3.5" />, color: "#a5b4fc" },
]

export function Planner({ origin, destination, onOrigin, onDestination, onSubmit, loading }: PlannerProps) {
  const months = useMemo(() => nextMonths(12), [])
  const [tripDays, setTripDays] = useState(7)
  const [range, setRange] = useState<[number, number]>([0, 11])
  const [anchor, setAnchor] = useState<number | null>(null)
  const [weights, setWeights] = useState<Weights>({ price: 40, weather: 30, crowd: 30 })
  const [budget, setBudget] = useState("")

  const total = weights.price + weights.weather + weights.crowd || 1

  const clickMonth = (i: number) => {
    if (anchor === null) {
      setAnchor(i)
      setRange([i, i])
    } else {
      setRange([Math.min(anchor, i), Math.max(anchor, i)])
      setAnchor(null)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination) return
    const whole = range[0] === 0 && range[1] === 11
    onSubmit({
      origin,
      destination,
      prefs: {
        tripDays,
        weights,
        budget: budget ? Number(budget) : null,
        window: whole ? null : [months[range[0]].key, months[range[1]].key],
      },
    })
  }

  const demoAllowed = DEMO_MODE ? DEMO_DESTINATIONS : undefined

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl border border-white/10 bg-[#0b1022]/80 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

      <div className="grid gap-3 sm:grid-cols-2">
        <CitySearch
          label="From"
          value={origin}
          onChange={onOrigin}
          icon={<PlaneTakeoff className="h-4 w-4" />}
          allowed={DEMO_MODE ? [DEMO_ORIGIN] : undefined}
          disabledHint="live only"
          exclude={destination?.name}
          testId="origin-input"
        />
        <CitySearch
          label="To"
          value={destination}
          onChange={onDestination}
          placeholder="Where to?"
          icon={<Plane className="h-4 w-4" />}
          allowed={demoAllowed}
          disabledHint="live only"
          exclude={origin.name}
          testId="destination-input"
        />
      </div>

      {/* trip length */}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Trip length</span>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Fewer days" onClick={() => setTripDays((d) => Math.max(2, d - 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10">
              <Minus className="h-4 w-4" />
            </motion.button>
            <motion.span key={tripDays} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 text-center text-sm font-medium text-white tabular-nums">
              {tripDays} days
            </motion.span>
            <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="More days" onClick={() => setTripDays((d) => Math.min(28, d + 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10">
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setTripDays(p.days)}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tripDays === p.days ? "text-[#1a1203]" : "text-slate-300 hover:text-white"
              )}
            >
              {tripDays === p.days && <motion.span layoutId="preset" className="absolute inset-0 rounded-full bg-amber-300" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* travel window */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            <CalendarRange className="h-3.5 w-3.5" /> Travel window
          </span>
          <span className="text-xs text-slate-400">
            {months[range[0]].label} {months[range[0]].year} – {months[range[1]].label} {months[range[1]].year}
            {anchor !== null && <span className="ml-1 text-amber-300">· pick end</span>}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-12" data-testid="month-strip">
          {months.map((m, i) => {
            const on = i >= range[0] && i <= range[1]
            const edge = i === range[0] || i === range[1]
            return (
              <motion.button
                key={m.key}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => clickMonth(i)}
                className={cn(
                  "relative h-10 rounded-lg text-[11px] font-medium transition-colors duration-200",
                  on ? "text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                )}
              >
                {on && (
                  <motion.span
                    layout
                    className={cn("absolute inset-0 rounded-lg", edge ? "bg-amber-300/25 ring-1 ring-amber-300/60" : "bg-white/[0.08]")}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative block leading-tight">{m.label}</span>
                {(i === 0 || m.label === "Jan") && <span className="relative block text-[9px] text-slate-500">{String(m.year).slice(2)}</span>}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* priorities */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">What matters most</span>
          <div className="flex h-1.5 w-28 overflow-hidden rounded-full bg-white/5">
            {FACTORS.map((f) => (
              <motion.span key={f.key} animate={{ width: `${(weights[f.key] / total) * 100}%` }} style={{ background: f.color }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {FACTORS.map((f) => (
            <label key={f.key} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <span className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5" style={{ color: f.color }}>
                  {f.icon}
                  <span className="text-slate-200">{f.label}</span>
                </span>
                <span className="tabular-nums text-slate-400">{Math.round((weights[f.key] / total) * 100)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[f.key]}
                onChange={(e) => setWeights((w) => ({ ...w, [f.key]: Number(e.target.value) }))}
                className="trip-range mt-2 w-full"
                style={{ ["--c" as string]: f.color, ["--p" as string]: `${weights[f.key]}%` }}
                aria-label={`${f.label} priority`}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Max budget (optional)</span>
          <span className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 focus-within:border-amber-300/60">
            <Wallet className="h-4 w-4 text-slate-400" />
            <input
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="No limit"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">USD</span>
          </span>
        </label>
        <motion.button
          type="submit"
          data-testid="find-button"
          disabled={!destination || loading}
          whileHover={{ scale: destination ? 1.02 : 1 }}
          whileTap={{ scale: 0.97 }}
          className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-6 text-sm font-semibold text-[#1a1203] shadow-[0_10px_40px_-10px_rgba(251,191,36,0.7)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-56"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">{loading ? "Reading the forecast…" : "Find the best time"}</span>
          <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.form>
  )
}

export const LONDON = cities.find((c) => c.name === "London")!
