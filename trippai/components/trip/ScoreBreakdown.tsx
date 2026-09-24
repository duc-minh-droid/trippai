"use client"

import { motion } from "framer-motion"
import { CloudSun, DollarSign, SlidersHorizontal, Users } from "lucide-react"
import { normWeights, type TripWindow, type Weights } from "@/lib/trip"

const FACTORS = [
  { key: "price" as const, score: "price_score" as const, label: "Price", hint: "cheaper than the year's range", color: "#f6c453", icon: DollarSign },
  { key: "weather" as const, score: "weather_score" as const, label: "Weather", hint: "close to 22°C, low rain", color: "#5eead4", icon: CloudSun },
  { key: "crowd" as const, score: "crowd_score" as const, label: "Quiet", hint: "low search interest", color: "#a5b4fc", icon: Users },
]

export function ScoreBreakdown({ win, weights, onWeights }: { win: TripWindow; weights: Weights; onWeights: (w: Weights) => void }) {
  const nw = normWeights(weights)
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5" data-testid="score-breakdown">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Why this week</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" /> drag to re-weight
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {FACTORS.map((f, i) => {
          const s = win[f.score]
          const Icon = f.icon
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200">
                  <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `${f.color}22`, color: f.color }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {f.label}
                  <span className="hidden text-slate-500 sm:inline">· {f.hint}</span>
                </span>
                <span className="tabular-nums text-slate-300">
                  {s.toFixed(0)}
                  <span className="text-slate-500"> × {(nw[f.key] * 100).toFixed(0)}%</span>
                </span>
              </div>
              <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${f.color}66, ${f.color})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s}%` }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-2 flex items-center justify-end gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                weight
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[f.key]}
                  onChange={(e) => onWeights({ ...weights, [f.key]: Number(e.target.value) })}
                  className="trip-range w-32 sm:w-40"
                  style={{ ["--c" as string]: `${f.color}99`, ["--p" as string]: `${weights[f.key]}%` }}
                  aria-label={`${f.label} weight`}
                  data-testid={`weight-${f.key}`}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 rounded-xl bg-black/20 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-slate-400">
        {FACTORS.map((f, i) => (
          <span key={f.key}>
            {i > 0 && " + "}
            <span style={{ color: f.color }}>{(nw[f.key]).toFixed(2)}</span>×{win[f.score].toFixed(0)}
          </span>
        ))}
        <span className="text-white"> = {win.score.toFixed(1)}</span>
      </div>
    </div>
  )
}
