/**
 * Data access for the planner.
 *
 * Live mode calls the FastAPI backend (NEXT_PUBLIC_API_URL).
 * Demo mode (NEXT_PUBLIC_DEMO_MODE=true) reads JSON snapshots from
 * /public/demo/, produced by `python scripts/export_demo.py` in trippai_ai/.
 * The snapshots are genuine model output captured ahead of time, so the static
 * build behaves like the real app for a fixed set of destinations.
 */

import type { PredictResult } from "./trip"

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/** Destinations with a snapshot in public/demo (origin London). */
export const DEMO_DESTINATIONS = [
  "Barcelona",
  "Tokyo",
  "Lisbon",
  "New York",
  "Rome",
  "Bangkok",
  "Paris",
  "Sydney",
]
export const DEMO_ORIGIN = "London"

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export interface PredictRequest {
  destination: string
  origin_city: string
  trip_days: number
  lat?: number
  lon?: number
  max_budget?: number | null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function predict(req: PredictRequest): Promise<PredictResult> {
  if (DEMO_MODE) {
    if (!DEMO_DESTINATIONS.some((d) => slug(d) === slug(req.destination))) {
      throw new Error(
        `Demo mode has pre-computed forecasts for ${DEMO_DESTINATIONS.join(", ")}. Run the backend for other cities.`
      )
    }
    const [res] = await Promise.all([fetch(`/demo/${slug(req.destination)}.json`), sleep(2600)])
    if (!res.ok) throw new Error("Demo snapshot missing")
    const data = (await res.json()) as PredictResult
    return { ...data, trip_days: req.trip_days }
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: req.destination,
        origin_city: req.origin_city,
        trip_days: Math.min(30, Math.max(1, req.trip_days)),
        forecast_weeks: 52,
        use_real_prices: true,
        lat: req.lat,
        lon: req.lon,
        max_budget: req.max_budget ?? null,
      }),
    })
  } catch {
    throw new Error(`Could not reach the TrippAI API at ${API_URL}. Is the backend running?`)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `API error ${res.status}`)
  }
  return res.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function planMultiCity(body: Record<string, unknown>): Promise<any> {
  if (DEMO_MODE) {
    const [res] = await Promise.all([fetch(`/demo/multi-city.json`), sleep(2000)])
    if (!res.ok) throw new Error("Demo snapshot missing")
    return res.json()
  }
  const res = await fetch(`${API_URL}/api/multi-city/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}
