"use client"

import { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, BrainCircuit, CloudSun, LineChart, Sparkles } from "lucide-react"
import { Globe } from "@/components/trip/Globe"
import { Planner, LONDON, type PlanInput } from "@/components/trip/Planner"
import { LoadingState } from "@/components/trip/LoadingState"
import { Results } from "@/components/trip/Results"
import { cities, type City } from "@/lib/cities"
import { DEMO_DESTINATIONS, DEMO_MODE, predict } from "@/lib/api"
import type { PredictResult } from "@/lib/trip"

const toGlobe = (c: City) => ({ name: c.name, lat: c.latitude, lon: c.longitude })

const HEADLINE = ["Go", "when", "the", "city", "is", "at", "its", "best."]

const STEPS = [
  { icon: CloudSun, title: "A year of real signals", body: "365 days of Open-Meteo weather history and Google Trends search interest for the city." },
  { icon: BrainCircuit, title: "Forecast 52 weeks", body: "Prophet models project temperature, rain, crowds and price for every week ahead." },
  { icon: LineChart, title: "Score and rank", body: "Each week gets a 0-100 score from your priorities. The best non-overlapping windows win." },
]

export default function Home() {
  const [origin, setOrigin] = useState<City>(LONDON)
  const [destination, setDestination] = useState<City | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState<{ input: PlanInput; result: PredictResult } | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const globeCities = useMemo(() => {
    const list = DEMO_DESTINATIONS.map((n) => cities.find((c) => c.name === n)!).filter(Boolean)
    return list.filter((c) => c.name !== origin.name).map(toGlobe)
  }, [origin])

  const submit = async (input: PlanInput) => {
    setLoading(true)
    setError(null)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    try {
      const result = await predict({
        destination: input.destination.name,
        origin_city: input.origin.name,
        trip_days: input.prefs.tripDays,
        lat: input.destination.latitude,
        lon: input.destination.longitude,
      })
      setRun({ input, result })
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-x-clip">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_75%_10%,rgba(76,91,200,0.28),transparent_60%),radial-gradient(900px_500px_at_10%_30%,rgba(251,146,60,0.12),transparent_60%),radial-gradient(800px_600px_at_50%_100%,rgba(45,212,191,0.08),transparent_60%)]" />
        <div className="noise absolute inset-0 opacity-60" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] opacity-[0.15]" />
      </div>

      {/* hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:min-h-[100svh] lg:grid-cols-[1fr_1fr] lg:gap-10 lg:pt-20">
        <div className="relative z-10 order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Weather, crowds and price, forecast 52 weeks ahead
          </motion.div>
          <h1 className="mt-4 font-display text-[44px] leading-[0.98] text-white sm:text-6xl lg:text-[64px]">
            {HEADLINE.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`mr-[0.22em] inline-block ${i >= 6 ? "bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text pr-[0.12em] italic text-transparent" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-400">
            Pick a city. TrippAI reads a year of weather and search data, forecasts every week ahead and tells you which one to book.
          </motion.p>
          <div className="mt-6">
            <Planner origin={origin} destination={destination} onOrigin={setOrigin} onDestination={setDestination} onSubmit={submit} loading={loading} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 mx-auto aspect-square w-full max-w-[300px] sm:max-w-[460px] lg:order-2 lg:max-w-[620px]"
        >
          <Globe origin={toGlobe(origin)} destinations={globeCities} focus={destination ? toGlobe(destination) : null} />
          <AnimatePresence>
            {destination && (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-[6%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0b1022]/80 px-4 py-1.5 text-xs text-slate-200 backdrop-blur"
              >
                <span className="text-teal-300">{origin.name}</span> <span className="text-slate-500">→</span> <span className="text-amber-300">{destination.name}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* results */}
      <section ref={resultsRef} className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <AnimatePresence mode="wait">
          {loading && destination ? (
            <LoadingState key="loading" destination={destination.name} fast={DEMO_MODE} />
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 rounded-2xl border border-rose-300/30 bg-rose-300/[0.06] p-5 text-sm text-rose-100">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-300" />
              {error}
            </motion.div>
          ) : run ? (
            <motion.div key={`r-${run.result.generated_at}-${run.input.destination.name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Results result={run.result} origin={run.input.origin} destination={run.input.destination} prefs={run.input.prefs} />
            </motion.div>
          ) : (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-400/25 to-amber-300/20 text-amber-200">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs text-slate-500">0{i + 1}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.body}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
