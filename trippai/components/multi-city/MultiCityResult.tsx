"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Plane, TrendingUp, Sparkles, CloudRain, Users, DollarSign, Route, Info, ChevronDown, ChevronUp, Save, Edit2, Check, X, PartyPopper, Music } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceBreakdown } from "./PriceBreakdown"
import { Progress } from "@/components/ui/progress"
import { savedTripsStorage } from "@/lib/saved-trips"
import { toast } from "sonner"
import type { MultiCityTripResult, ItineraryStop } from "@/lib/multi-city-types"

interface MultiCityResultProps {
  result: MultiCityTripResult | {
    origin_city: string
    cities: string[]
    total_days: number
    start_date: string
    end_date: string
    route_optimized: boolean
    itinerary: ItineraryStop[]
    cost_breakdown: {
      total_cost: number
      hotels_total?: number
      flights_total?: number
      per_person_cost?: number
      per_city?: any[]
      total_hotel?: number
      total_flights?: number
      per_person?: number
      breakdown?: Record<string, number>
      flights?: any[]
    }
    overall_score: {
      overall: number
      average?: number
      min?: number
      max?: number
      weather?: number
      price?: number
      crowd?: number
    }
    summary: string
    generated_at: string
    route_info?: any
    total_distance_km?: number
    metadata?: any
  }
}

export function MultiCityResult({ result }: MultiCityResultProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tripName, setTripName] = useState(`Multi-City: ${result.cities.slice(0, 2).join(', ')}${result.cities.length > 2 ? '...' : ''}`)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(tripName)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  const handleStartEdit = () => {
    setEditNameValue(tripName)
    setIsEditingName(true)
  }

  const handleSaveEdit = () => {
    if (editNameValue.trim()) {
      setTripName(editNameValue.trim())
      setIsEditingName(false)
      toast.success("Trip name updated!")
    }
  }

  const handleCancelEdit = () => {
    setEditNameValue(tripName)
    setIsEditingName(false)
  }

  const handleSaveTrip = async () => {
    if (savedTripId) {
      // Unsave
      const success = savedTripsStorage.delete(savedTripId)
      if (success) {
        setSavedTripId(null)
        toast.success("Trip unsaved", {
          description: `"${tripName}" has been removed from your collection.`,
        })
      } else {
        toast.error("Failed to unsave trip")
      }
    } else {
      // Save
      setIsSaving(true)
      try {
        const savedTrip = savedTripsStorage.save({
          name: tripName,
          type: 'multi',
          data: result,
        })
        
        // Animate success
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setSavedTripId(savedTrip.id)
        toast.success("Multi-city trip saved!", {
          description: `"${tripName}" has been saved to your collection.`,
        })
      } catch (error) {
        toast.error("Failed to save trip", {
          description: "There was an error saving your trip. Please try again.",
        })
      } finally {
        setIsSaving(false)
      }
    }
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  // Handle both old and new response formats safely
  const costBreakdown: any = result.cost_breakdown
  const hotelCost = costBreakdown.hotels_total ?? costBreakdown.total_hotel ?? 0
  const flightCost = costBreakdown.flights_total ?? costBreakdown.total_flights ?? 0
  const perPersonCost = costBreakdown.per_person_cost ?? costBreakdown.per_person ?? 0
  const overallScore: any = result.overall_score

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[480px] max-w-[calc(100vw-2rem)] flex flex-col max-h-[calc(100vh-8rem)]"
    >
      <Card className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="p-4 border-b bg-background/90 backdrop-blur-xl shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              {/* Editable Trip Name */}
              <div className="flex items-center gap-2 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      ref={inputRef}
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="h-7 text-sm font-semibold"
                      placeholder="Enter trip name..."
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-950"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                  >
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {tripName}
                    </h3>
                    <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-xl font-bold truncate">Multi-City Adventure</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.cities.length} cities • {result.total_days} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={result.route_optimized ? "default" : "secondary"}
                className="text-xs"
              >
                {result.route_optimized ? "Optimized" : "Custom"}
              </Badge>
              <Button
                variant={savedTripId ? "secondary" : "default"}
                size="sm"
                onClick={handleSaveTrip}
                disabled={isSaving}
                className={`h-8 gap-1.5 text-xs transition-all ${
                  savedTripId 
                    ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900" 
                    : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="w-3.5 h-3.5" />
                    </motion.div>
                    Saving...
                  </>
                ) : savedTripId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0 shrink-0"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Overall Score</p>
            <p className={`text-xl font-bold ${getScoreColor(result.overall_score.overall)}`}>
              {result.overall_score.overall.toFixed(0)}
              <span className="text-xs">/100</span>
            </p>
          </div>
          {overallScore.weather !== undefined && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Weather</p>
              <p className={`text-xl font-bold ${getScoreColor(overallScore.weather)}`}>
                {overallScore.weather.toFixed(0)}
              </p>
            </div>
          )}
          {overallScore.price !== undefined && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Price</p>
              <p className={`text-xl font-bold ${getScoreColor(overallScore.price)}`}>
                {overallScore.price.toFixed(0)}
              </p>
            </div>
          )}
          {overallScore.crowd !== undefined && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Crowds</p>
              <p className={`text-xl font-bold ${getScoreColor(overallScore.crowd)}`}>
                {overallScore.crowd.toFixed(0)}
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Scrollable Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex flex-col"
            >
              <div className="overflow-y-auto scrollbar-hide flex-1">
              <div className="p-4 space-y-3">{/* Trip Dates */}
      <div className="p-3 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3 h-3 text-primary" />
          <h3 className="text-xs font-semibold">Trip Dates</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div>
            <p className="text-[10px] text-muted-foreground">Departure</p>
            <p className="font-semibold">{formatDate(result.start_date)}</p>
          </div>
          <div className="text-muted-foreground">→</div>
          <div>
            <p className="text-[10px] text-muted-foreground">Return</p>
            <p className="font-semibold">{formatDate(result.end_date)}</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <PriceBreakdown
        hotelCost={hotelCost}
        flightCost={flightCost}
        totalCost={result.cost_breakdown.total_cost}
        perPersonCost={perPersonCost}
      />

      {/* Itinerary */}
      <div className="p-3 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3 h-3 text-primary" />
          <h3 className="text-xs font-semibold">Itinerary</h3>
        </div>

        <div className="space-y-3">
          {/* Origin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Plane className="w-3 h-3 transform -rotate-45" />
            </div>
            <div>
              <p className="text-xs font-semibold">{result.origin_city}</p>
              <p className="text-[10px] text-muted-foreground">Starting Point</p>
            </div>
          </motion.div>

          {/* Cities */}
          {result.itinerary.map((stop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
            >
              <div className="flex gap-2">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  {index < result.itinerary.length - 1 && (
                    <div className="w-0.5 h-12 bg-linear-to-b from-primary/50 to-transparent" />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold truncate">{stop.city}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{stop.days}d</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-1 mt-1 text-xs">
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[9px] text-muted-foreground">Score</p>
                      <p className={`text-xs font-semibold ${getScoreColor(stop.travel_score || 0)}`}>
                        {stop.travel_score ? stop.travel_score.toFixed(0) : "N/A"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[9px] text-muted-foreground">Temp</p>
                      <p className="text-xs font-semibold">
                        {stop.predicted_weather?.temperature !== undefined
                          ? `${stop.predicted_weather.temperature.toFixed(0)}°C`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[9px] text-muted-foreground">Rain</p>
                      <p className="text-xs font-semibold">
                        {stop.predicted_weather?.precipitation !== undefined
                          ? `${stop.predicted_weather.precipitation.toFixed(0)}mm`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[9px] text-muted-foreground">Crowd</p>
                      <p className="text-xs font-semibold">
                        {stop.predicted_crowd !== undefined 
                          ? `${stop.predicted_crowd.toFixed(0)}` 
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Show AI explanation if available */}
                  {stop.ai_explanation && (
                    <div className="mt-2 p-2 bg-muted/30 rounded border border-muted">
                      <div className="flex items-start gap-1">
                        <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {stop.ai_explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show AI travel tip if available */}
                  {stop.ai_travel_tip && (
                    <div className="mt-2 p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                          {stop.ai_travel_tip}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show event warning if available */}
                  {stop.event_warning && (
                    <div className="mt-2 p-2.5 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-start gap-1.5">
                        <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/50 shrink-0">
                          <PartyPopper className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-[10px] text-purple-900/90 dark:text-purple-100/90 leading-relaxed font-medium">
                          {stop.event_warning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show events if available */}
                  {stop.events && stop.events.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Music className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />
                        <span className="text-[10px] font-semibold text-foreground">
                          Events Happening
                        </span>
                        <Badge variant="secondary" className="text-[9px] h-3 px-1">
                          {stop.events.length}
                        </Badge>
                      </div>
                      {stop.events.slice(0, 2).map((event: any, eventIdx: number) => (
                        <div
                          key={eventIdx}
                          className="p-2 rounded-lg bg-linear-to-br from-background to-muted/30 border border-border/50 hover:border-pink-300 dark:hover:border-pink-600 transition-all"
                        >
                            <div className="flex items-start gap-1.5">
                            <div className="p-1 rounded bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 shrink-0">
                              <Calendar className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold line-clamp-1 mb-0.5">
                                {event.name}
                              </p>
                              {event.description && (
                                <p className="text-[9px] text-muted-foreground line-clamp-2 mb-1">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge variant="outline" className="text-[9px] h-3 px-1 border-purple-200 dark:border-purple-700">
                                  {event.category}
                                </Badge>
                                {event.is_free ? (
                                  <Badge className="text-[9px] h-3 px-1 bg-linear-to-r from-green-500 to-emerald-500 text-white border-0">
                                    Free
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[9px] h-3 px-1">
                                    Ticketed
                                  </Badge>
                                )}
                                {event.url && event.url !== "#" && (
                                  <a
                                    href={event.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-primary hover:underline ml-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Info →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stop.events.length > 2 && (
                        <p className="text-[9px] text-center text-muted-foreground pt-0.5">
                          + {stop.events.length - 2} more event{stop.events.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
              </div>
              </div>

              {/* Sticky AI Summary Footer */}
              <div className="p-3 border-t bg-background/90 backdrop-blur-xl shrink-0">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold mb-1">AI Insights</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
