"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Sparkles, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CityStopInput, CityStopData } from "@/components/multi-city/CityStopInput"
import { MultiCityResult } from "@/components/multi-city/MultiCityResult"

export default function MultiCityPage() {
  const [cityStops, setCityStops] = useState<CityStopData[]>([
    { id: "1", city: "paris", min_days: 3, max_days: 5, preferred_days: 4 },
    { id: "2", city: "barcelona", min_days: 3, max_days: 6, preferred_days: 4 },
  ])
  const [originCity, setOriginCity] = useState("London")
  const [totalDays, setTotalDays] = useState(12)
  const [optimizeRoute, setOptimizeRoute] = useState(true)
  const [useRealPrices, setUseRealPrices] = useState(false)
  const [forecastWeeks, setForecastWeeks] = useState(52)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addCityStop = () => {
    const newId = String(Date.now())
    setCityStops([
      ...cityStops,
      {
        id: newId,
        city: "",
        min_days: 2,
        max_days: 5,
        preferred_days: 3,
      },
    ])
  }

  const updateCityStop = (id: string, data: Partial<CityStopData>) => {
    setCityStops(cityStops.map((stop) => (stop.id === id ? { ...stop, ...data } : stop)))
  }

  const removeCityStop = (id: string) => {
    setCityStops(cityStops.filter((stop) => stop.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("http://localhost:8000/api/multi-city/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cities: cityStops.map((stop) => ({
            city: stop.city,
            min_days: stop.min_days,
            max_days: stop.max_days,
            preferred_days: stop.preferred_days,
          })),
          total_days: totalDays,
          origin_city: originCity,
          start_date: null,
          optimize_route: optimizeRoute,
          forecast_weeks: forecastWeeks,
          use_real_prices: useRealPrices,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to plan trip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Multi-City Trip Planner</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Plan the perfect multi-destination adventure with AI-powered optimization
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Trip Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Origin City */}
              <div>
                <label className="text-sm font-medium">Origin City</label>
                <Input
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder="London"
                  className="mt-1"
                />
              </div>

              {/* Total Days */}
              <div>
                <label className="text-sm font-medium">Total Trip Duration (days)</label>
                <Input
                  type="number"
                  min={3}
                  max={60}
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              {/* Forecast Weeks */}
              <div>
                <label className="text-sm font-medium">Forecast Window (weeks)</label>
                <Input
                  type="number"
                  min={1}
                  max={104}
                  value={forecastWeeks}
                  onChange={(e) => setForecastWeeks(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              {/* Optimize Route */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Optimize Route</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically reorder cities for optimal travel
                  </p>
                </div>
                <Switch checked={optimizeRoute} onCheckedChange={setOptimizeRoute} />
              </div>

              {/* Real-Time Prices */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Real-Time Prices</label>
                  <p className="text-xs text-muted-foreground">
                    Fetch live hotel & flight prices
                  </p>
                </div>
                <Switch checked={useRealPrices} onCheckedChange={setUseRealPrices} />
              </div>
            </form>
          </Card>

          {/* City Stops */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Cities to Visit</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCityStop}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add City
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {cityStops.map((cityStop, index) => (
                  <CityStopInput
                    key={cityStop.id}
                    cityStop={cityStop}
                    index={index}
                    onUpdate={updateCityStop}
                    onRemove={removeCityStop}
                    canRemove={cityStops.length > 2}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || cityStops.length < 2 || cityStops.some((s) => !s.city)}
            className="w-full h-12 text-lg gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Planning Your Trip...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Plan My Multi-City Trip
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:sticky lg:top-4 h-fit">
          {loading && (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Planning your perfect trip...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzing destinations, optimizing routes, and forecasting conditions
                  </p>
                </div>
              </div>
            </Card>
          )}

          {result && !loading && <MultiCityResult result={result} />}

          {!loading && !result && (
            <Card className="p-8 border-dashed">
              <div className="text-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Your trip plan will appear here</p>
                <p className="text-sm mt-2">Configure your cities and click "Plan My Multi-City Trip"</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
