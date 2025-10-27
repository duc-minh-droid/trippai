"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Map, { NavigationControl, GeolocateControl, MapRef } from "react-map-gl/mapbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { TripResultCard } from "@/components/home/TripResultCard"
import { PredictionLoadingCard } from "@/components/home/PredictionLoadingCard"
import { MultiCityResult } from "@/components/multi-city/MultiCityResult"
import { CityStopInput, CityStopData } from "@/components/multi-city/CityStopInput"
import { cities } from "@/lib/cities"
import { Plus, MapPin, Route } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import "mapbox-gl/dist/mapbox-gl.css"

export default function Home() {
  const mapRef = useRef<MapRef>(null)
  
  // Mode toggle
  const [isMultiCity, setIsMultiCity] = useState(false)
  
  // Single city states
  const [destination, setDestination] = useState("barcelona")
  const [tripDays, setTripDays] = useState(7)
  
  // Multi-city states
  const [cityStops, setCityStops] = useState<CityStopData[]>([
    { id: "1", city: "paris", min_days: 3, max_days: 5, preferred_days: 4 },
    { id: "2", city: "barcelona", min_days: 3, max_days: 6, preferred_days: 4 },
  ])
  const [totalDays, setTotalDays] = useState(12)
  const [optimizeRoute, setOptimizeRoute] = useState(true)
  
  // Common states
  const [forecastWeeks, setForecastWeeks] = useState(52)
  const useRealPrices = true // Always use real-time prices
  const [originCity, setOriginCity] = useState("London")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNewResult, setIsNewResult] = useState(true)

  // Map state
  const [viewState, setViewState] = useState({
    longitude: 2.1734,
    latitude: 41.3851,
    zoom: 12,
  })

  // Create city options for combobox
  const cityOptions: ComboboxOption[] = cities.map((city) => ({
    value: city.name.toLowerCase(),
    label: `${city.name}, ${city.country}`,
  }))

  const animateToCity = useCallback((cityName: string) => {
    const selectedCity = cities.find(
      (city) => city.name.toLowerCase() === cityName.toLowerCase()
    )

    if (selectedCity && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedCity.longitude, selectedCity.latitude],
        zoom: 12,
        duration: 2000, // 2 seconds smooth animation
        essential: true
      })
    }
  }, [])

  const handleCityChange = (value: string) => {
    setDestination(value)
    // Animate map to selected city when chosen from dropdown
    animateToCity(value)
  }

  // Multi-city functions
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
    setIsNewResult(true)

    try {
      if (isMultiCity) {
        // Multi-city API call
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
      } else {
        // Single city API call
        animateToCity(destination)
        
        const response = await fetch("http://localhost:8000/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination,
            trip_days: tripDays,
            forecast_weeks: forecastWeeks,
            use_real_prices: useRealPrices,
            origin_city: originCity,
          }),
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full h-screen">
      {/* Map container - full screen */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"}
      >
        <NavigationControl position="bottom-left" />
        <GeolocateControl position="bottom-left" />
      </Map>

      {/* Compact input form - top right corner */}
      <Card className="absolute top-4 right-4 w-80 p-4 shadow-lg bg-background/95 backdrop-blur-sm z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant={!isMultiCity ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setIsMultiCity(false)
              setResult(null)
              setError(null)
            }}
            className="flex-1 gap-2"
          >
            <MapPin className="w-4 h-4" />
            Single City
          </Button>
          <Button
            type="button"
            variant={isMultiCity ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setIsMultiCity(true)
              setResult(null)
              setError(null)
            }}
            className="flex-1 gap-2"
          >
            <Route className="w-4 h-4" />
            Multi-City
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="originCity" className="text-xs font-medium text-foreground">
              Origin City
            </label>
            <Input
              id="originCity"
              type="text"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="Origin city"
              className="h-9 text-sm"
              required
            />
          </div>

          {!isMultiCity ? (
            <>
              {/* Single City Form */}
              <div className="space-y-1">
                <label htmlFor="destination" className="text-xs font-medium text-foreground">
                  Destination City
                </label>
                <Combobox
                  options={cityOptions}
                  value={destination}
                  onChange={handleCityChange}
                  placeholder="Select a city..."
                  searchPlaceholder="Search cities..."
                  emptyText="No city found."
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tripDays" className="text-xs font-medium text-foreground">
                  Trip Days
                </label>
                <Input
                  id="tripDays"
                  type="number"
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  placeholder="Trip days"
                  className="h-9 text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Multi-City Form */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Total Trip Days
                </label>
                <Input
                  type="number"
                  min={3}
                  max={60}
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-y">
                <div>
                  <label className="text-xs font-medium text-foreground">Optimize Route</label>
                  <p className="text-[10px] text-muted-foreground">Auto-reorder cities</p>
                </div>
                <Switch checked={optimizeRoute} onCheckedChange={setOptimizeRoute} />
              </div>

              {/* City Stops */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Cities to Visit</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCityStop}
                    className="h-7 px-2 gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Stop
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
              </div>
            </>
          )}

          <div className="space-y-1">
            <label htmlFor="forecastWeeks" className="text-xs font-medium text-foreground">
              Forecast Weeks
            </label>
            <Input
              id="forecastWeeks"
              type="number"
              value={forecastWeeks}
              onChange={(e) => setForecastWeeks(Number(e.target.value))}
              placeholder="Forecast weeks"
              className="h-9 text-sm"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || (isMultiCity && (cityStops.length < 2 || cityStops.some((s) => !s.city)))} 
            className="w-full h-9 text-sm"
          >
            {loading ? "Analyzing..." : isMultiCity ? "Plan Multi-City Trip" : "Predict"}
          </Button>
        </form>

        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </Card>

      {/* Loading state - bottom left corner */}
      {loading && (
        <div className="absolute bottom-4 left-4 max-h-[calc(100vh-6rem)] overflow-auto z-10">
          <PredictionLoadingCard />
        </div>
      )}

      {/* Results panel - bottom left corner */}
      {result && !loading && (
        <div className="absolute bottom-4 left-4 max-h-[calc(100vh-6rem)] overflow-auto z-10">
          {isMultiCity ? (
            <MultiCityResult result={result} />
          ) : (
            <TripResultCard result={result} isNew={isNewResult} />
          )}
        </div>
      )}
    </div>
  )
}