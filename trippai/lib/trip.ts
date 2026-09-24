/**
 * Client-side helpers for working with the model's week-by-week forecast.
 *
 * The API returns one scored row per forecast week (`weekly`). The backend
 * picks a single best week with fixed weights (40% price, 30% weather, 30%
 * crowd). Everything here re-runs that same arithmetic in the browser so the
 * results view can react instantly when the user changes priorities, trip
 * length, budget or travel window, without another 20-second model run.
 */

export interface WeekRow {
  date: string // week start, YYYY-MM-DD
  price: number
  temp: number
  precip: number // mm over the week
  crowd: number // 0-100 search interest
  travel_score: number
  price_score: number
  weather_score: number
  crowd_score: number
}

export interface TripEvent {
  name: string
  description?: string
  start_date: string
  end_date?: string
  category: string
  url?: string
  is_free: boolean
  venue?: string
}

export interface PredictResult {
  destination: string
  coordinates: { lat: number; lon: number }
  origin_city?: string
  best_start_date: string
  best_end_date: string
  predicted_price: number
  price_breakdown?: { hotel: number; flight: number; total: number; per_person: number } | null
  predicted_temp: number
  predicted_precipitation: number
  predicted_crowd: number
  travel_score: number
  confidence: number
  scores: { price_score: number; weather_score: number; crowd_score: number }
  ai_explanation: string
  ai_travel_tip?: string
  generated_at: string
  trip_days: number
  data_source?: string
  events?: TripEvent[]
  event_warning?: string | null
  event_suggestions?: string[]
  weekly?: WeekRow[]
}

export interface Weights {
  price: number
  weather: number
  crowd: number
}

export const DEFAULT_WEIGHTS: Weights = { price: 40, weather: 30, crowd: 30 }

export interface Preferences {
  tripDays: number
  weights: Weights
  budget: number | null
  /** inclusive month keys (YYYY-MM); null = whole forecast */
  window: [string, string] | null
}

export interface ScoredWeek extends WeekRow {
  score: number // re-weighted, 0-100
  eligible: boolean // inside travel window and budget
}

export interface TripWindow {
  start: string
  end: string
  score: number
  weeks: ScoredWeek[]
  temp: number
  precip: number
  crowd: number
  price: number
  price_score: number
  weather_score: number
  crowd_score: number
}

export const monthKey = (d: string) => d.slice(0, 7)

export function normWeights(w: Weights): Weights {
  const s = w.price + w.weather + w.crowd || 1
  return { price: w.price / s, weather: w.weather / s, crowd: w.crowd / s }
}

export function scoreWeeks(weekly: WeekRow[], prefs: Preferences): ScoredWeek[] {
  const w = normWeights(prefs.weights)
  return weekly.map((r) => {
    const score = w.price * r.price_score + w.weather * r.weather_score + w.crowd * r.crowd_score
    const mk = monthKey(r.date)
    const inWindow = !prefs.window || (mk >= prefs.window[0] && mk <= prefs.window[1])
    const inBudget = prefs.budget == null || r.price <= prefs.budget
    return { ...r, score, eligible: inWindow && inBudget }
  })
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Every possible trip start week, scored as the mean over the weeks it spans. */
export function candidateWindows(scored: ScoredWeek[], tripDays: number): TripWindow[] {
  const span = Math.max(1, Math.round(tripDays / 7))
  const out: TripWindow[] = []
  for (let i = 0; i + span <= scored.length; i++) {
    const weeks = scored.slice(i, i + span)
    if (!weeks.every((x) => x.eligible)) continue
    out.push({
      start: weeks[0].date,
      end: addDays(weeks[0].date, tripDays),
      score: avg(weeks.map((x) => x.score)),
      weeks,
      temp: avg(weeks.map((x) => x.temp)),
      precip: avg(weeks.map((x) => x.precip)),
      crowd: avg(weeks.map((x) => x.crowd)),
      price: avg(weeks.map((x) => x.price)),
      price_score: avg(weeks.map((x) => x.price_score)),
      weather_score: avg(weeks.map((x) => x.weather_score)),
      crowd_score: avg(weeks.map((x) => x.crowd_score)),
    })
  }
  return out
}

/** Best N windows that do not overlap and sit at least `gapWeeks` apart. */
export function topWindows(windows: TripWindow[], n = 3, gapWeeks = 4): TripWindow[] {
  const sorted = [...windows].sort((a, b) => b.score - a.score)
  const picked: TripWindow[] = []
  const ms = (d: string) => new Date(d).getTime()
  for (const w of sorted) {
    if (picked.every((p) => Math.abs(ms(p.start) - ms(w.start)) >= gapWeeks * 7 * 864e5)) {
      picked.push(w)
      if (picked.length === n) break
    }
  }
  return picked
}

export interface MonthSummary {
  key: string
  label: string
  year: number
  weeks: ScoredWeek[]
  score: number
  temp: number
  precip: number
  crowd: number
  price: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function byMonth(scored: ScoredWeek[]): MonthSummary[] {
  const groups = new Map<string, ScoredWeek[]>()
  for (const r of scored) {
    const k = monthKey(r.date)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(r)
  }
  return [...groups.entries()].map(([key, weeks]) => ({
    key,
    label: MONTHS[Number(key.slice(5, 7)) - 1],
    year: Number(key.slice(0, 4)),
    weeks,
    score: avg(weeks.map((w) => w.score)),
    temp: avg(weeks.map((w) => w.temp)),
    precip: avg(weeks.map((w) => w.precip)),
    crowd: avg(weeks.map((w) => w.crowd)),
    price: avg(weeks.map((w) => w.price)),
  }))
}

/** Sequential colour ramp for scores: deep indigo (poor) -> teal -> gold (best). */
const RAMP: [number, [number, number, number]][] = [
  [0, [30, 33, 72]],
  [35, [45, 74, 128]],
  [55, [34, 150, 150]],
  [72, [132, 204, 120]],
  [86, [246, 196, 83]],
  [100, [255, 150, 92]],
]

export function scoreColor(score: number, alpha = 1): string {
  const s = Math.max(0, Math.min(100, score))
  for (let i = 1; i < RAMP.length; i++) {
    const [s1, c1] = RAMP[i]
    const [s0, c0] = RAMP[i - 1]
    if (s <= s1) {
      const t = (s - s0) / (s1 - s0)
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * t))
      return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
    }
  }
  return `rgba(255,150,92,${alpha})`
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...opts })
}

export function fmtRange(start: string, end: string) {
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  return `${fmtDate(start)} – ${fmtDate(end)}${sameYear ? `, ${start.slice(0, 4)}` : ""}`
}

export function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}
