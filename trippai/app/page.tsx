"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Map, { NavigationControl, GeolocateControl, MapRef, Source, Layer, Marker } from "react-map-gl/mapbox"
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
import { Plus, MapPin, Route, ChevronDown, ChevronUp, Settings, Plane } from "lucide-react"
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
  const [maxBudget, setMaxBudget] = useState<string>("")
  const useRealPrices = true // Always use real-time prices
  const [originCity, setOriginCity] = useState("london")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNewResult, setIsNewResult] = useState(true)

  // Input form collapse state
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)

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

  // Helper to get the proper city name (capitalized) from lowercase value
  const getCityName = (value: string): string => {
    const city = cities.find(c => c.name.toLowerCase() === value.toLowerCase())
    return city ? city.name : value
  }

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

  // Animate map to show route between origin and destination
  const animateToRoute = useCallback((originCityName: string, destCityName: string) => {
    const origin = cities.find(
      (city) => city.name.toLowerCase() === originCityName.toLowerCase()
    )
    const destination = cities.find(
      (city) => city.name.toLowerCase() === destCityName.toLowerCase()
    )

    if (origin && destination && mapRef.current) {
      // Calculate bounds that include both cities
      const minLng = Math.min(origin.longitude, destination.longitude)
      const maxLng = Math.max(origin.longitude, destination.longitude)
      const minLat = Math.min(origin.latitude, destination.latitude)
      const maxLat = Math.max(origin.latitude, destination.latitude)

      // Add padding to the bounds
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        {
          padding: 100,
          duration: 2000,
          essential: true
        }
      )
    }
  }, [])

  // Animate map to show all multi-city stops
  const animateToMultiCityRoute = useCallback((cityNames: string[]) => {
    if (!cityNames || cityNames.length === 0) return

    const validCities = cityNames
      .map(name => cities.find(city => city.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean) as typeof cities

    if (validCities.length === 0 || !mapRef.current) return

    // Calculate bounds that include all cities
    const lngs = validCities.map(c => c.longitude)
    const lats = validCities.map(c => c.latitude)
    
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat]
      ],
      {
        padding: 100,
        duration: 2000,
        essential: true
      }
    )
  }, [])

  const handleCityChange = (value: string) => {
    setDestination(value)
    // Animate map to selected city when chosen from dropdown
    animateToCity(value)
  }

  const handleOriginChange = (value: string) => {
    setOriginCity(value)
    // Animate map to selected city when chosen from dropdown
    animateToCity(value)
  }

  // Animate map when single trip result is available
  useEffect(() => {
    if (result && !isMultiCity && result.destination && result.origin_city) {
      animateToRoute(result.origin_city, result.destination)
    }
  }, [result, isMultiCity, animateToRoute])

  // Show route when both origin and destination are selected (even without result)
  useEffect(() => {
    if (!isMultiCity && originCity && destination) {
      animateToRoute(originCity, destination)
    }
  }, [originCity, destination, isMultiCity, animateToRoute])

  // Animate map for multi-city stops
  useEffect(() => {
    if (isMultiCity) {
      const selectedCities = cityStops
        .map(stop => stop.city)
        .filter(city => city) // Filter out empty strings
      
      if (selectedCities.length > 0) {
        // Include origin in the route
        animateToMultiCityRoute([originCity, ...selectedCities])
      }
    }
  }, [isMultiCity, cityStops, originCity, animateToMultiCityRoute])

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
    setIsFormCollapsed(true) // Collapse form after submission

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
            origin_city: getCityName(originCity),
            start_date: null,
            optimize_route: optimizeRoute,
            forecast_weeks: forecastWeeks,
            use_real_prices: useRealPrices,
            max_budget: maxBudget ? parseFloat(maxBudget) : null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || `API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("API Response received:", data)
        console.log("AI Travel Tip in response:", data.ai_travel_tip)
        setResult(data)
      } else {
        // Single city API call
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
            origin_city: getCityName(originCity),
            max_budget: maxBudget ? parseFloat(maxBudget) : null,
          }),
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Single City API Response:", data)
        console.log("Has ai_travel_tip?", !!data.ai_travel_tip)
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
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {/* Route line and markers - always show when both cities are selected */}
        {!isMultiCity && originCity && destination && (() => {
          const origin = cities.find(
            (city) => city.name.toLowerCase() === originCity.toLowerCase()
          )
          const dest = cities.find(
            (city) => city.name.toLowerCase() === destination.toLowerCase()
          )

          if (!origin || !dest) return null

          // Create GeoJSON for the route line
          const routeGeoJSON = {
            type: "Feature" as const,
            properties: {},
            geometry: {
              type: "LineString" as const,
              coordinates: [
                [origin.longitude, origin.latitude],
                [dest.longitude, dest.latitude]
              ]
            }
          }

          return (
            <>
              {/* Dotted route line */}
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#3b82f6",
                    "line-width": 4,
                    "line-opacity": 0.8,
                    "line-dasharray": [2, 2]
                  }}
                />
              </Source>

              {/* Origin marker */}
              <Marker
                longitude={origin.longitude}
                latitude={origin.latitude}
                anchor="bottom"
              >
                <div className="flex flex-col items-center animate-bounce-slow">
                  <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded text-sm font-semibold shadow-lg">
                    {origin.name}
                  </div>
                </div>
              </Marker>

              {/* Destination marker */}
              <Marker
                longitude={dest.longitude}
                latitude={dest.latitude}
                anchor="bottom"
              >
                <div className="flex flex-col items-center animate-bounce-slow">
                  <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded text-sm font-semibold shadow-lg">
                    {dest.name}
                  </div>
                </div>
              </Marker>
            </>
          )
        })()}

        {/* Multi-city routes and markers */}
        {isMultiCity && (() => {
          // Get all valid city stops
          const validStops = cityStops
            .map(stop => {
              const city = cities.find(c => c.name.toLowerCase() === stop.city.toLowerCase())
              return city ? { ...stop, cityData: city } : null
            })
            .filter(Boolean) as (CityStopData & { cityData: typeof cities[0] })[]

          if (validStops.length === 0) return null

          // Get origin city
          const origin = cities.find(c => c.name.toLowerCase() === originCity.toLowerCase())
          if (!origin) return null

          // Create route: origin -> all stops
          const allCities = [origin, ...validStops.map(s => s.cityData)]

          // Create individual route segments
          const routeSegments = []
          for (let i = 0; i < allCities.length - 1; i++) {
            const from = allCities[i]
            const to = allCities[i + 1]
            
            routeSegments.push({
              id: `route-${i}`,
              coordinates: [
                [from.longitude, from.latitude],
                [to.longitude, to.latitude]
              ]
            })
          }

          // Color palette for markers
          const colors = [
            'bg-green-500',   // Origin
            'bg-blue-500',    // Stop 1
            'bg-purple-500',  // Stop 2
            'bg-pink-500',    // Stop 3
            'bg-orange-500',  // Stop 4
            'bg-red-500',     // Stop 5
            'bg-yellow-500',  // Stop 6
          ]

          return (
            <>
              {/* Render all route segments */}
              {routeSegments.map((segment, idx) => {
                const routeGeoJSON = {
                  type: "Feature" as const,
                  properties: {},
                  geometry: {
                    type: "LineString" as const,
                    coordinates: segment.coordinates
                  }
                }

                return (
                  <Source key={segment.id} id={segment.id} type="geojson" data={routeGeoJSON}>
                    <Layer
                      id={`${segment.id}-line`}
                      type="line"
                      paint={{
                        "line-color": "#3b82f6",
                        "line-width": 4,
                        "line-opacity": 0.8,
                        "line-dasharray": [2, 2]
                      }}
                    />
                  </Source>
                )
              })}

              {/* Origin marker */}
              <Marker
                longitude={origin.longitude}
                latitude={origin.latitude}
                anchor="bottom"
              >
                <div className="flex flex-col items-center animate-bounce-slow">
                  <div className={`${colors[0]} text-white p-3 rounded-full shadow-lg`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded text-sm font-semibold shadow-lg">
                    {origin.name}
                  </div>
                </div>
              </Marker>

              {/* Stop markers */}
              {validStops.map((stop, idx) => (
                <Marker
                  key={stop.id}
                  longitude={stop.cityData.longitude}
                  latitude={stop.cityData.latitude}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center animate-bounce-slow">
                    <div className={`${colors[(idx + 1) % colors.length]} text-white p-3 rounded-full shadow-lg relative`}>
                      <Plane className="w-6 h-6" />
                      <div className="absolute -top-1 -right-1 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded text-sm font-semibold shadow-lg">
                      {stop.cityData.name}
                    </div>
                  </div>
                </Marker>
              ))}
            </>
          )
        })()}
      </Map>

      {/* Compact input form - top right corner */}
      <Card className="absolute top-4 right-4 w-80 shadow-2xl bg-background/80 backdrop-blur-xl border border-border/50 z-10 overflow-hidden">
        {/* Collapsible Header */}
        <div className="flex items-center justify-between p-3 border-b bg-background/50">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Trip Settings</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isFormCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {!isFormCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide">
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
            <Combobox
              options={cityOptions}
              value={originCity}
              onChange={handleOriginChange}
              placeholder="Select origin city..."
              searchPlaceholder="Search cities..."
              emptyText="No city found."
              className="h-9 text-sm"
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

          <div className="space-y-1">
            <label htmlFor="maxBudget" className="text-xs font-medium text-foreground">
              Max Budget (Optional)
            </label>
            <Input
              id="maxBudget"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g., 2000"
              className="h-9 text-sm"
              min="0"
            />
            <p className="text-[10px] text-muted-foreground">Leave empty for no budget limit</p>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Loading state - bottom left corner */}
      {loading && (
        <div className="fixed bottom-4 left-4 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
          <PredictionLoadingCard />
        </div>
      )}

      {/* Results panel - bottom left corner */}
      {result && !loading && (
        <div className="fixed bottom-4 left-4 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
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