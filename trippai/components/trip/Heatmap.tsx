"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { fmtDate, scoreColor, type MonthSummary, type ScoredWeek } from "@/lib/trip"
import { cn } from "@/lib/utils"

interface HeatmapProps {
  months: MonthSummary[]
  bestWeeks: Set<string>
  onPick?: (w: ScoredWeek) => void
}

export function Heatmap({ months, bestWeeks, onPick }: HeatmapProps) {
  const [hover, setHover] = useState<ScoredWeek | null>(null)
  const maxWeeks = Math.max(...months.map((m) => m.weeks.length))

  return (
    <div className="relative">
      <div
        className="grid grid-cols-7 gap-1.5 sm:gap-2 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
        style={{ ["--n" as string]: months.length }}
        data-testid="heatmap"
      >
        {months.map((m, mi) => {
          const hasBest = m.weeks.some((w) => bestWeeks.has(w.date))
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + mi * 0.045, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex flex-col items-stretch rounded-xl border p-1 sm:p-1.5 transition-colors",
                hasBest ? "border-amber-300/40 bg-amber-300/[0.06]" : "border-white/[0.06] bg-white/[0.02]"
              )}
            >
              <div className="mb-1.5 text-center">
                <div className={cn("text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]", hasBest ? "text-amber-200" : "text-slate-300")}>{m.label}</div>
                <div className="hidden text-[9px] text-slate-500 sm:block">{m.year}</div>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {Array.from({ length: maxWeeks }).map((_, wi) => {
                  const w = m.weeks[wi]
                  if (!w) return <div key={wi} className="h-5 sm:h-6" />
                  const best = bestWeeks.has(w.date)
                  return (
                    <motion.button
                      key={w.date}
                      type="button"
                      aria-label={`Week of ${fmtDate(w.date)}: score ${Math.round(w.score)}`}
                      onMouseEnter={() => setHover(w)}
                      onMouseLeave={() => setHover((h) => (h?.date === w.date ? null : h))}
                      onFocus={() => setHover(w)}
                      onClick={() => onPick?.(w)}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{
                        opacity: w.eligible ? 1 : 0.28,
                        scale: 1,
                        backgroundColor: scoreColor(w.score, w.eligible ? 0.95 : 0.5),
                      }}
                      whileHover={{ scale: 1.12, zIndex: 5 }}
                      transition={{
                        opacity: { delay: 0.25 + mi * 0.045 + wi * 0.035 },
                        scale: { delay: 0.25 + mi * 0.045 + wi * 0.035, type: "spring", stiffness: 380, damping: 22 },
                        backgroundColor: { duration: 0.5 },
                      }}
                      className={cn(
                        "relative h-5 rounded-md sm:h-6",
                        best && "outline-2 outline-offset-2 outline-amber-200"
                      )}
                      style={best ? { boxShadow: `0 0 16px ${scoreColor(w.score, 0.8)}` } : undefined}
                    >
                      {best && <span className="absolute inset-0 animate-ping rounded-md bg-amber-200/30" style={{ animationDuration: "2.4s" }} />}
                      <span className="relative hidden text-[9px] font-semibold text-black/60 md:inline">{Math.round(w.score)}</span>
                    </motion.button>
                  )
                })}
              </div>
              <div className="mt-1.5 text-center text-[9px] tabular-nums text-slate-400 sm:text-[10px]">{Math.round(m.temp)}°</div>
            </motion.div>
          )
        })}
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>Poor</span>
          <span className="h-2 w-40 rounded-full" style={{ background: `linear-gradient(90deg, ${[0, 30, 50, 65, 80, 92, 100].map((s) => scoreColor(s)).join(",")})` }} />
          <span>Ideal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded outline-2 outline-offset-1 outline-amber-200" /> Recommended week</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-500/30" /> Outside window / budget</span>
        </div>
      </div>

      <AnimatePresence>
        {hover && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-3 left-1/2 z-20 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-[#0d1328]/95 p-3 text-xs shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">Week of {fmtDate(hover.date, { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="rounded-md px-1.5 py-0.5 font-semibold text-black" style={{ background: scoreColor(hover.score) }}>{Math.round(hover.score)}</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-slate-300">
              <div><div className="text-[10px] text-slate-500">Temp</div>{hover.temp.toFixed(0)}°C</div>
              <div><div className="text-[10px] text-slate-500">Rain</div>{hover.precip.toFixed(0)}mm</div>
              <div><div className="text-[10px] text-slate-500">Crowd</div>{hover.crowd.toFixed(0)}</div>
              <div><div className="text-[10px] text-slate-500">Price</div>${hover.price.toFixed(0)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
