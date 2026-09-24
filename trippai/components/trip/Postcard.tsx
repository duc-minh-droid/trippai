"use client"

/**
 * Procedural "postcard" illustration: sky tinted by the forecast temperature,
 * sun or moon, layered hills and a skyline with a simple landmark for the city.
 * Pure SVG so the static build needs no image assets or network.
 */

import { useId } from "react"

function rng(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function palette(temp: number) {
  if (temp >= 24) return { top: "#ff9a6b", mid: "#ffc58a", low: "#ffe4b8", hill: "#c2587a", city: "#5b2a52", sun: "#fff4d6" }
  if (temp >= 17) return { top: "#f78fb3", mid: "#fbc2a4", low: "#fde5c8", hill: "#8a5a9e", city: "#3d2b5c", sun: "#fff8e1" }
  if (temp >= 10) return { top: "#6c8cd5", mid: "#a7b8e8", low: "#e3d9f0", hill: "#4f5d9a", city: "#262f5a", sun: "#fffbef" }
  return { top: "#3b4a8a", mid: "#6f7fbf", low: "#b9c3e6", hill: "#2f3a70", city: "#161d42", sun: "#eef2ff" }
}

const LANDMARKS: Record<string, (x: number, base: number) => string> = {
  paris: (x, b) => `M${x - 16},${b} L${x - 3},${b - 70} L${x - 2},${b - 96} L${x},${b - 110} L${x + 2},${b - 96} L${x + 3},${b - 70} L${x + 16},${b} L${x + 8},${b} Q${x},${b - 22} ${x - 8},${b} Z`,
  tokyo: (x, b) => `M${x - 14},${b} L${x - 3},${b - 60} L${x - 7},${b - 60} L${x - 7},${b - 64} L${x - 2},${b - 64} L${x},${b - 112} L${x + 2},${b - 64} L${x + 7},${b - 64} L${x + 7},${b - 60} L${x + 3},${b - 60} L${x + 14},${b} Z`,
  "new york": (x, b) => `M${x - 12},${b} L${x - 12},${b - 60} L${x - 8},${b - 60} L${x - 8},${b - 78} L${x - 4},${b - 78} L${x - 4},${b - 92} L${x},${b - 118} L${x + 4},${b - 92} L${x + 4},${b - 78} L${x + 8},${b - 78} L${x + 8},${b - 60} L${x + 12},${b - 60} L${x + 12},${b} Z`,
  rome: (x, b) => `M${x - 34},${b} L${x - 34},${b - 34} Q${x},${b - 48} ${x + 34},${b - 34} L${x + 34},${b} Z`,
  barcelona: (x, b) => `M${x - 22},${b} L${x - 20},${b - 62} L${x - 17},${b - 84} L${x - 14},${b - 62} L${x - 8},${b - 60} L${x - 5},${b - 96} L${x - 2},${b - 60} L${x + 2},${b - 60} L${x + 5},${b - 96} L${x + 8},${b - 60} L${x + 14},${b - 62} L${x + 17},${b - 84} L${x + 20},${b - 62} L${x + 22},${b} Z`,
  sydney: (x, b) => `M${x - 40},${b} Q${x - 30},${b - 40} ${x - 12},${b - 46} Q${x - 18},${b - 20} ${x - 8},${b} M${x - 14},${b} Q${x - 2},${b - 52} ${x + 16},${b - 56} Q${x + 8},${b - 24} ${x + 18},${b} M${x + 10},${b} Q${x + 22},${b - 34} ${x + 38},${b - 36} Q${x + 32},${b - 14} ${x + 40},${b} Z`,
  bangkok: (x, b) => `M${x - 20},${b} Q${x - 14},${b - 30} ${x - 6},${b - 44} L${x},${b - 100} L${x + 6},${b - 44} Q${x + 14},${b - 30} ${x + 20},${b} Z`,
  lisbon: (x, b) => `M${x - 16},${b} L${x - 16},${b - 44} L${x - 12},${b - 44} L${x - 12},${b - 50} L${x - 8},${b - 50} L${x - 8},${b - 44} L${x - 4},${b - 44} L${x - 4},${b - 74} L${x - 6},${b - 74} L${x - 6},${b - 80} L${x - 2},${b - 80} L${x - 2},${b - 76} L${x + 2},${b - 76} L${x + 2},${b - 80} L${x + 6},${b - 80} L${x + 6},${b - 74} L${x + 4},${b - 74} L${x + 4},${b - 44} L${x + 16},${b - 44} L${x + 16},${b} Z`,
}

export function Postcard({ city, temp, seed = "", className = "" }: { city: string; temp: number; seed?: string; className?: string }) {
  const id = useId().replace(/:/g, "")
  const r = rng(city.toLowerCase())
  const rs = rng(city.toLowerCase() + seed)
  const p = palette(temp)
  const W = 320
  const H = 180
  const base = 150
  const buildings: string[] = []
  let x = -4
  while (x < W) {
    const w = 10 + r() * 22
    const h = 18 + r() * 52
    buildings.push(`M${x},${base} L${x},${base - h} L${x + w},${base - h} L${x + w},${base} Z`)
    x += w + r() * 3
  }
  const lmX = 90 + r() * 140
  const lm = LANDMARKS[city.toLowerCase()]
  const sunX = 40 + rs() * 240
  const sunY = 40 + rs() * 50
  const hill = (y: number, amp: number, k: number) => {
    let d = `M0,${H} L0,${y}`
    for (let i = 0; i <= 8; i++) d += ` Q${i * 40 + 20},${y - amp * Math.sin(i * k + r())} ${(i + 1) * 40},${y}`
    return d + ` L${W},${H} Z`
  }
  const windows: [number, number][] = []
  for (let i = 0; i < 26; i++) windows.push([r() * W, base - 6 - r() * 40])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="55%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.low} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0%" stopColor={p.sun} />
          <stop offset="60%" stopColor={p.sun} stopOpacity={0.6} />
          <stop offset="100%" stopColor={p.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx={sunX} cy={sunY} r={46} fill={`url(#${id}-sun)`} />
      <circle cx={sunX} cy={sunY} r={18} fill={p.sun} />
      <path d={hill(118, 16, 1.3)} fill={p.hill} opacity={0.45} />
      <path d={hill(132, 10, 0.9)} fill={p.hill} opacity={0.7} />
      <g fill={p.city} opacity={0.9}>
        {buildings.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {lm && <path d={lm(lmX, base)} />}
      </g>
      <g fill={p.sun} opacity={0.5}>
        {windows.map(([wx, wy], i) => (
          <rect key={i} x={wx} y={wy} width={1.6} height={2.2} />
        ))}
      </g>
      <rect y={base} width={W} height={H - base} fill={p.city} />
      <rect y={base} width={W} height={H - base} fill={`url(#${id}-sky)`} opacity={0.18} />
    </svg>
  )
}
