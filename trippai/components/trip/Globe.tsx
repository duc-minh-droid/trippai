"use client"

import { useEffect, useRef } from "react"
import { geoEquirectangular, geoInterpolate, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import landTopo from "world-atlas/land-110m.json"

export interface GlobeCity {
  name: string
  lat: number
  lon: number
}

interface GlobeProps {
  origin: GlobeCity
  destinations: GlobeCity[]
  /** highlighted route; the globe turns to face it */
  focus?: GlobeCity | null
  className?: string
}

const DEG = Math.PI / 180

/** Sample the land mask once into a list of [lon, lat] dots. */
let DOTS: [number, number][] | null = null
function landDots(): [number, number][] {
  if (DOTS) return DOTS
  const W = 720
  const H = 360
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")!
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>
  const land = feature(topo, topo.objects.land)
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2])
  ctx.fillStyle = "#000"
  ctx.beginPath()
  geoPath(proj, ctx)(land)
  ctx.fill()
  const img = ctx.getImageData(0, 0, W, H).data
  const out: [number, number][] = []
  const step = 1.55
  for (let lat = -82; lat <= 82; lat += step) {
    const lonStep = step / Math.max(0.2, Math.cos(lat * DEG))
    for (let lon = -180; lon < 180; lon += lonStep) {
      const x = Math.floor(((lon + 180) / 360) * W)
      const y = Math.floor(((90 - lat) / 180) * H)
      if (img[(y * W + x) * 4 + 3] > 128) out.push([lon, lat])
    }
  }
  DOTS = out
  return out
}

export function Globe({ origin, destinations, focus, className }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    lon: -origin.lon + 25,
    lat: 22,
    targetLon: null as number | null,
    targetLat: null as number | null,
    dragging: false,
    lastX: 0,
    lastY: 0,
    velocity: 0.06,
  })
  const propsRef = useRef({ origin, destinations, focus })
  propsRef.current = { origin, destinations, focus }

  // Turn to face the focused route
  useEffect(() => {
    const s = state.current
    if (focus) {
      const [mlon, mlat] = geoInterpolate([origin.lon, origin.lat], [focus.lon, focus.lat])(0.5)
      s.targetLon = -mlon
      s.targetLat = Math.max(-35, Math.min(45, mlat))
    } else {
      s.targetLon = null
      s.targetLat = null
    }
  }, [focus, origin])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const dots = landDots()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const s = state.current
    const t0 = performance.now()

    const project = (lon: number, lat: number, alt = 0) => {
      const l = (lon + s.lon) * DEG
      const p = lat * DEG
      const x = Math.cos(p) * Math.sin(l)
      const y = Math.sin(p)
      const z = Math.cos(p) * Math.cos(l)
      const c = Math.cos(s.lat * DEG)
      const sn = Math.sin(s.lat * DEG)
      const y2 = y * c - z * sn
      const z2 = y * sn + z * c
      const R = Math.min(w, h) * 0.42 * (1 + alt)
      return { x: w / 2 + R * x, y: h / 2 - R * y2, z: z2 }
    }

    const drawArc = (a: GlobeCity, b: GlobeCity, t: number, strong: boolean) => {
      const interp = geoInterpolate([a.lon, a.lat], [b.lon, b.lat])
      const dist = Math.hypot(a.lon - b.lon, a.lat - b.lat)
      const lift = Math.min(0.2, 0.05 + dist / 700)
      const N = 64
      const pts = []
      for (let i = 0; i <= N; i++) {
        const u = i / N
        const [lo, la] = interp(u)
        pts.push(project(lo, la, Math.sin(Math.PI * u) * lift))
      }
      // faint full path
      ctx.lineWidth = strong ? 1.6 : 1
      ctx.strokeStyle = strong ? "rgba(255,190,110,0.55)" : "rgba(140,170,255,0.18)"
      ctx.beginPath()
      let pen = false
      for (const p of pts) {
        if (p.z < -0.05) {
          pen = false
          continue
        }
        if (!pen) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
        pen = true
      }
      ctx.stroke()
      // travelling comet
      const head = Math.floor(t * N)
      const tail = Math.max(0, head - (strong ? 18 : 12))
      for (let i = tail; i < head; i++) {
        const p = pts[i]
        const q = pts[i + 1]
        if (!q || p.z < 0 || q.z < 0) continue
        const f = (i - tail) / (head - tail)
        ctx.strokeStyle = strong ? `rgba(255,200,120,${f})` : `rgba(255,170,110,${0.8 * f})`
        ctx.lineWidth = (strong ? 2.6 : 1.8) * f + 0.4
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.stroke()
      }
      const hp = pts[Math.min(head, N)]
      if (hp && hp.z > 0 && head > 0 && head < N) {
        ctx.fillStyle = "rgba(255,230,190,0.95)"
        ctx.beginPath()
        ctx.arc(hp.x, hp.y, strong ? 2.6 : 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let placed: { x: number; y: number }[] = []
    const drawCity = (c: GlobeCity, color: string, pulse: number, label: boolean) => {
      const p = project(c.lon, c.lat)
      if (p.z < 0.05) return
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fill()
      if (pulse >= 0) {
        ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${(1 - pulse) * 0.8})`)
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 + pulse * 14, 0, Math.PI * 2)
        ctx.stroke()
      }
      // skip labels that would collide with one already drawn
      if (label && placed.every((q) => Math.abs(q.x - p.x) > 46 || Math.abs(q.y - p.y) > 14)) {
        placed.push({ x: p.x, y: p.y })
        ctx.font = "500 11px var(--font-geist-sans), system-ui, sans-serif"
        ctx.fillStyle = `rgba(235,240,255,${Math.min(1, p.z * 2)})`
        ctx.fillText(c.name, p.x + 8, p.y - 6)
      }
    }

    const frame = (now: number) => {
      const el = (now - t0) / 1000
      const { origin, destinations, focus } = propsRef.current

      // rotation
      if (!s.dragging) {
        if (s.targetLon != null && s.targetLat != null) {
          let d = s.targetLon - s.lon
          d = ((d + 540) % 360) - 180
          s.lon += d * 0.045
          s.lat += (s.targetLat - s.lat) * 0.045
        } else if (!reduce) {
          s.lon += s.velocity
          s.lat += (22 - s.lat) * 0.01
        }
      }

      ctx.clearRect(0, 0, w, h)
      const R = Math.min(w, h) * 0.42
      const cx = w / 2
      const cy = h / 2

      // atmosphere
      const g = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35)
      g.addColorStop(0, "rgba(90,130,255,0.22)")
      g.addColorStop(0.5, "rgba(90,130,255,0.06)")
      g.addColorStop(1, "rgba(90,130,255,0)")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2)
      ctx.fill()

      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
      body.addColorStop(0, "rgba(38,52,110,0.95)")
      body.addColorStop(1, "rgba(9,13,34,0.98)")
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(140,170,255,0.25)"
      ctx.lineWidth = 1
      ctx.stroke()

      // land dots, bucketed by depth for cheap alpha
      const buckets: number[][] = [[], [], [], []]
      for (let i = 0; i < dots.length; i++) {
        const p = project(dots[i][0], dots[i][1])
        if (p.z <= 0) continue
        const b = p.z > 0.75 ? 3 : p.z > 0.5 ? 2 : p.z > 0.25 ? 1 : 0
        buckets[b].push(p.x, p.y)
      }
      const alphas = [0.18, 0.32, 0.5, 0.72]
      const size = Math.max(1, R / 190)
      buckets.forEach((pts, b) => {
        ctx.fillStyle = `rgba(150,180,255,${alphas[b]})`
        for (let i = 0; i < pts.length; i += 2) ctx.fillRect(pts[i] - size / 2, pts[i + 1] - size / 2, size, size)
      })

      // arcs
      destinations.forEach((d, i) => {
        const strong = !!focus && focus.name === d.name
        if (focus && !strong) {
          drawArc(origin, d, ((el * 0.18 + i * 0.37) % 1.4) / 1.4, false)
          return
        }
        if (!focus) drawArc(origin, d, ((el * 0.22 + i * 0.29) % 1.3) / 1.3, false)
      })
      if (focus) drawArc(origin, focus, Math.min(1, ((el * 0.35) % 1.6) / 1.2), true)

      // cities (origin and focus first so their labels win)
      placed = []
      const pulse = (el % 2) / 2
      drawCity(origin, "rgba(110,230,200,1)", (pulse + 0.5) % 1, true)
      if (focus) drawCity(focus, "rgba(255,190,110,1)", pulse, true)
      destinations.forEach((d) => {
        if (focus?.name !== d.name) drawCity(d, "rgba(170,195,255,0.9)", -1, !focus)
      })

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const down = (e: PointerEvent) => {
      s.dragging = true
      s.lastX = e.clientX
      s.lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!s.dragging) return
      s.lon += (e.clientX - s.lastX) * 0.3
      s.lat = Math.max(-60, Math.min(60, s.lat + (e.clientY - s.lastY) * 0.3))
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.targetLon = null
      s.targetLat = null
    }
    const up = () => {
      s.dragging = false
    }
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", touchAction: "pan-y", cursor: "grab" }}
      aria-label="Rotating globe showing flight routes"
      role="img"
    />
  )
}
