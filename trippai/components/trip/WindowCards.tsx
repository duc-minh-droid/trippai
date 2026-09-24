"use client"

import { motion } from "framer-motion"
import { CloudRain, Crown, Thermometer, Users } from "lucide-react"
import { Postcard } from "./Postcard"
import { fmtRange, scoreColor, type TripWindow } from "@/lib/trip"
import { cn } from "@/lib/utils"

function strongest(w: TripWindow) {
  const f = [
    { k: "Great value", v: w.price_score },
    { k: "Ideal weather", v: w.weather_score },
    { k: "Quiet streets", v: w.crowd_score },
  ].sort((a, b) => b.v - a.v)
  return f[0].k
}

export function WindowCards({ city, windows, selected, onSelect }: { city: string; windows: TripWindow[]; selected: number; onSelect: (i: number) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-3" data-testid="window-cards">
      {windows.map((w, i) => (
        <motion.button
          key={w.start}
          type="button"
          onClick={() => onSelect(i)}
          initial={{ opacity: 0, y: 30, rotate: i === 1 ? 0 : i === 0 ? -1.5 : 1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          whileHover={{ y: -6 }}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 160, damping: 20 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border text-left transition-colors",
            selected === i ? "border-amber-300/60 bg-amber-300/[0.05] shadow-[0_20px_60px_-20px_rgba(251,191,36,0.45)]" : "border-white/[0.08] bg-white/[0.025] hover:border-white/20"
          )}
        >
          <div className="relative h-36 overflow-hidden">
            <Postcard city={city} temp={w.temp} seed={w.start} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1022] via-[#0b1022]/10 to-transparent" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {i === 0 ? <Crown className="h-3 w-3 text-amber-300" /> : <span className="text-slate-300">#{i + 1}</span>}
              {i === 0 ? "Best match" : "Alternative"}
            </div>
            <div className="absolute right-3 top-3 rounded-lg px-2 py-1 text-sm font-semibold text-black shadow-lg" style={{ background: scoreColor(w.score) }}>
              {Math.round(w.score)}
            </div>
            <div className="absolute bottom-2 left-4 right-4">
              <div className="font-display text-xl text-white">{fmtRange(w.start, w.end)}</div>
              <div className="text-xs text-amber-200/90">{strongest(w)}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 px-4 pb-4 pt-3 text-xs">
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500"><Thermometer className="h-3 w-3" />Temp</div>
              <div className="mt-0.5 text-slate-200">{w.temp.toFixed(0)}°C</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500"><CloudRain className="h-3 w-3" />Rain</div>
              <div className="mt-0.5 text-slate-200">{w.precip.toFixed(0)}mm</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500"><Users className="h-3 w-3" />Crowd</div>
              <div className="mt-0.5 text-slate-200">{w.crowd.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Price</div>
              <div className="mt-0.5 text-slate-200">${w.price.toFixed(0)}</div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
