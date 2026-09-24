"use client"

import { useId, useMemo, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { CloudRain, DollarSign, Thermometer, Users } from "lucide-react"
import { fmtDate, type ScoredWeek } from "@/lib/trip"

const W = 360
const H = 150
const PAD = { l: 8, r: 8, t: 14, b: 22 }

interface Series {
  values: number[]
  color: string
  kind: "line" | "bars"
  fill?: boolean
  min?: number
  max?: number
}

function scale(values: number[], min?: number, max?: number) {
  const lo = min ?? Math.min(...values)
  const hi = max ?? Math.max(...values)
  const span = hi - lo || 1
  return (v: number) => PAD.t + (1 - (v - lo) / span) * (H - PAD.t - PAD.b)
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return ""
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

function Chart({
  weeks,
  series,
  bestRange,
  hover,
  setHover,
  delay,
}: {
  weeks: ScoredWeek[]
  series: Series[]
  bestRange: [number, number] | null
  hover: number | null
  setHover: (i: number | null) => void
  delay: number
}) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const gid = useId().replace(/:/g, "")
  const n = weeks.length
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r)
  const ticks = useMemo(() => {
    const starts = weeks.map((w, i) => ({ i, d: w.date })).filter((t, k, arr) => k === 0 || t.d.slice(5, 7) !== arr[k - 1].d.slice(5, 7))
    // drop a partial first month so its label does not collide with the next
    return starts.length > 1 && starts[1].i - starts[0].i < 3 ? starts.slice(1) : starts
  }, [weeks])

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const fx = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((fx - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <defs>
        {series.map((s, k) => (
          <linearGradient key={k} id={`${gid}-f${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="rgba(255,255,255,0.05)" />
      ))}
      {bestRange && (
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay: delay + 1.1 }}
          x={x(bestRange[0]) - 4}
          width={Math.max(8, x(bestRange[1]) - x(bestRange[0]) + 8)}
          y={PAD.t - 6}
          height={H - PAD.t - PAD.b + 6}
          rx={4}
          fill="rgba(251,191,36,0.12)"
          stroke="rgba(251,191,36,0.45)"
          strokeDasharray="3 3"
        />
      )}
      {series.map((s, k) => {
        const y = scale(s.values, s.min, s.max)
        if (s.kind === "bars") {
          const bw = ((W - PAD.l - PAD.r) / n) * 0.6
          return (
            <g key={k}>
              {s.values.map((v, i) => (
                <motion.rect
                  key={i}
                  x={x(i) - bw / 2}
                  width={bw}
                  rx={1}
                  fill={s.color}
                  fillOpacity={hover === i ? 0.9 : 0.45}
                  initial={{ y: H - PAD.b, height: 0 }}
                  animate={inView ? { y: y(v), height: H - PAD.b - y(v) } : {}}
                  transition={{ delay: delay + i * 0.012, duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </g>
          )
        }
        const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number])
        const line = smoothPath(pts)
        return (
          <g key={k}>
            {s.fill && (
              <motion.path
                d={`${line} L${x(n - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`}
                fill={`url(#${gid}-f${k})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ delay: delay + 0.9, duration: 0.8 }}
              />
            )}
            <motion.path
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ delay, duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
              style={{ filter: `drop-shadow(0 0 6px ${s.color}66)` }}
            />
          </g>
        )
      })}
      {ticks.map((t) => (
        <text key={t.i} x={x(t.i)} y={H - 6} fill="rgba(148,163,184,0.8)" fontSize={9} textAnchor="start">
          {fmtDate(t.d, { month: "short" }).slice(0, 1)}
        </text>
      ))}
      {hover !== null && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={PAD.t - 6} y2={H - PAD.b} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 3" />
          {series
            .filter((s) => s.kind === "line")
            .map((s, k) => (
              <circle key={k} cx={x(hover)} cy={scale(s.values, s.min, s.max)(s.values[hover])} r={3.5} fill="#0b1022" stroke={s.color} strokeWidth={2} />
            ))}
        </g>
      )}
    </svg>
  )
}

export function TrendCharts({ weeks, bestRange }: { weeks: ScoredWeek[]; bestRange: [number, number] | null }) {
  const [hover, setHover] = useState<number | null>(null)
  const h = hover !== null ? weeks[hover] : null

  const cards = [
    {
      title: "Weather",
      icon: <Thermometer className="h-4 w-4 text-teal-300" />,
      readout: h ? `${h.temp.toFixed(0)}°C · ${h.precip.toFixed(0)}mm` : `${Math.min(...weeks.map((w) => w.temp)).toFixed(0)}–${Math.max(...weeks.map((w) => w.temp)).toFixed(0)}°C`,
      legend: (
        <>
          <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-teal-300" />Temp</span>
          <span className="flex items-center gap-1"><CloudRain className="h-3 w-3 text-sky-400" />Rain</span>
        </>
      ),
      series: [
        { values: weeks.map((w) => w.precip), color: "#38bdf8", kind: "bars" as const, min: 0 },
        { values: weeks.map((w) => w.temp), color: "#5eead4", kind: "line" as const, fill: true },
      ],
    },
    {
      title: "Crowds",
      icon: <Users className="h-4 w-4 text-indigo-300" />,
      readout: h ? `${h.crowd.toFixed(0)} / 100` : "search interest",
      legend: <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-indigo-300" />Google Trends index</span>,
      series: [{ values: weeks.map((w) => w.crowd), color: "#a5b4fc", kind: "line" as const, fill: true, min: 0 }],
    },
    {
      title: "Price",
      icon: <DollarSign className="h-4 w-4 text-amber-300" />,
      readout: h ? `$${h.price.toFixed(0)}` : `$${Math.min(...weeks.map((w) => w.price)).toFixed(0)}–${Math.max(...weeks.map((w) => w.price)).toFixed(0)}`,
      legend: <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-amber-300" />Forecast trip price</span>,
      series: [{ values: weeks.map((w) => w.price), color: "#f6c453", kind: "line" as const, fill: true }],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3" data-testid="trend-charts">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              {c.icon}
              {c.title}
            </span>
            <span className="text-xs tabular-nums text-slate-300">{c.readout}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">{h ? `Week of ${fmtDate(h.date)}` : "Next 12 months, weekly"}</div>
          <div className="mt-2">
            <Chart weeks={weeks} series={c.series} bestRange={bestRange} hover={hover} setHover={setHover} delay={0.2 + i * 0.15} />
          </div>
          <div className="mt-1 flex gap-3 text-[10px] text-slate-400">{c.legend}</div>
        </motion.div>
      ))}
    </div>
  )
}
