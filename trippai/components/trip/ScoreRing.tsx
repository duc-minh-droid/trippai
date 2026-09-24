"use client"

import { useEffect, useState } from "react"
import { animate, motion } from "framer-motion"
import { scoreColor } from "@/lib/trip"

export function CountUp({ value, decimals = 0, duration = 1.4, prefix = "", suffix = "" }: { value: number; decimals?: number; duration?: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const c = animate(v, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setV })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <span className="tabular-nums">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function ScoreRing({ score, size = 148, label = "Travel score" }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 10
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor={scoreColor(score)} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-g)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 10px ${scoreColor(score, 0.5)})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl leading-none text-white">
          <CountUp value={score} />
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
      </div>
    </div>
  )
}
