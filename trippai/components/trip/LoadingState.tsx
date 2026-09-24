"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

const STEPS = [
  "Pulling 365 days of weather history",
  "Reading search-interest trends",
  "Fitting Prophet forecasts",
  "Scoring 52 weeks ahead",
  "Checking the event calendar",
]

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

export function LoadingState({ destination, fast }: { destination: string; fast: boolean }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const per = fast ? 480 : 3800
    const id = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), per)
    return () => clearInterval(id)
  }, [fast])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} className="relative">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Shimmer className="h-56" />
        <Shimmer className="h-56" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Shimmer className="h-44" />
        <Shimmer className="h-44" />
        <Shimmer className="h-44" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10">
        <motion.div
          initial={{ y: 16, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="pointer-events-auto w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-[#0b1022]/90 p-5 shadow-2xl backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Forecasting</p>
          <p className="mt-1 font-display text-2xl text-white">{destination}</p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-amber-300 to-rose-300" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <ul className="mt-4 space-y-2.5">
            {STEPS.map((s, i) => (
              <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: i <= step ? 1 : 0.35, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="grid h-5 w-5 place-items-center">
                  {i < step ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-5 w-5 place-items-center rounded-full bg-teal-400/20 text-teal-300">
                      <Check className="h-3 w-3" />
                    </motion.span>
                  ) : i === step ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  )}
                </span>
                {s}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
