"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { animate, motion, useInView } from "framer-motion"
import { geoDistance, geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import type { FeatureCollection } from "geojson"
import { Plane } from "lucide-react"
import type { City } from "@/lib/cities"

const W = 640
const H = 360

let LAND: FeatureCollection | null = null

export function RouteMap({ origin, destination }: { origin: City; destination: City }) {
  const [land, setLand] = useState<FeatureCollection | null>(LAND)
  const [t, setT] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (LAND) return
    import("world-atlas/land-50m.json").then((m) => {
      const topo = (m.default ?? m) as unknown as Topology<{ land: GeometryCollection }>
      LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection
      setLand(LAND)
    })
  }, [])

  const a: [number, number] = [origin.longitude, origin.latitude]
  const b: [number, number] = [destination.longitude, destination.latitude]
  const km = geoDistance(a, b) * 6371
  const hours = km / 820 + 0.6

  const { path, projection, route } = useMemo(() => {
    const interp = geoInterpolate(a, b)
    const samples = Array.from({ length: 33 }, (_, i) => interp(i / 32))
    const route = { type: "LineString" as const, coordinates: samples }
    const frame = {
      type: "MultiPoint" as const,
      coordinates: [...samples, [a[0], a[1] + 6], [b[0], b[1] - 6]] as [number, number][],
    }
    const projection = geoNaturalEarth1()
      .rotate([-(a[0] + b[0]) / 2, 0])
      .fitExtent(
        [
          [70, 60],
          [W - 70, H - 60],
        ],
        frame
      )
    return { path: geoPath(projection), projection, route }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.name, destination.name])

  useEffect(() => {
    if (!inView) return
    setT(0)
    const c = animate(0, 1, { duration: 2.6, delay: 0.5, ease: [0.45, 0, 0.2, 1], onUpdate: setT })
    return () => c.stop()
  }, [inView, origin.name, destination.name])

  const interp = geoInterpolate(a, b)
  const p = projection(interp(t)) ?? [0, 0]
  const p2 = projection(interp(Math.min(1, t + 0.01))) ?? p
  const angle = (Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180) / Math.PI
  const pa = projection(a)!
  const pb = projection(b)!

  return (
    <div ref={ref} className="relative h-full min-h-[260px] overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a1024]" data-testid="route-map">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block h-full w-full">
        <defs>
          <radialGradient id="rm-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1b2a5c" />
            <stop offset="100%" stopColor="#0a1024" />
          </radialGradient>
          <linearGradient id="rm-arc" x1="0" x2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <pattern id="rm-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.1" fill="rgba(150,180,255,0.55)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#rm-glow)" />
        <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="rgba(140,170,255,0.07)" />
        {land && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <path d={path(land) ?? ""} fill="rgba(60,80,150,0.35)" />
            <path d={path(land) ?? ""} fill="url(#rm-dots)" stroke="rgba(150,180,255,0.25)" strokeWidth={0.6} />
          </motion.g>
        )}
        <path d={path(route) ?? ""} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="4 6" />
        <motion.path
          d={path(route) ?? ""}
          fill="none"
          stroke="url(#rm-arc)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 2.6, delay: 0.5, ease: [0.45, 0, 0.2, 1] }}
          style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.6))" }}
        />
        {[
          { p: pa, c: "#5eead4", name: origin.name, anchor: "end" as const },
          { p: pb, c: "#fbbf24", name: destination.name, anchor: "start" as const },
        ].map((m, i) => (
          <g key={m.name} transform={`translate(${m.p[0]},${m.p[1]})`}>
            <motion.circle r={14} fill="none" stroke={m.c} initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ repeat: Infinity, duration: 2, delay: i }} />
            <circle r={5} fill={m.c} stroke="#0a1024" strokeWidth={2} />
            <text x={m.anchor === "end" ? -12 : 12} y={-10} textAnchor={m.anchor} fill="white" fontSize={14} fontWeight={600}>
              {m.name}
            </text>
          </g>
        ))}
        {t > 0 && t < 1 && (
          <g transform={`translate(${p[0]},${p[1]}) rotate(${angle + 45})`}>
            <foreignObject x={-11} y={-11} width={22} height={22}>
              <Plane className="h-[22px] w-[22px] fill-white text-white" />
            </foreignObject>
          </g>
        )}
      </svg>
      <div className="absolute bottom-3 left-3 flex gap-2 text-[11px]">
        <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-slate-200 backdrop-blur">{Math.round(km).toLocaleString()} km</span>
        <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-slate-200 backdrop-blur">~{hours.toFixed(1)} h flight</span>
      </div>
    </div>
  )
}
