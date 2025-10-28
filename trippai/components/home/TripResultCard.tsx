"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Sparkles,
  MapPin,
  ThermometerSun,
  CloudRain,
  Star,
  ChevronDown,
  ChevronUp,
  Hotel,
  Plane,
  Save,
  Edit2,
  Check,
  X,
  PartyPopper,
  Music,
  Calendar as CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { PriceBreakdown } from "@/components/multi-city/PriceBreakdown"
import { savedTripsStorage } from "@/lib/saved-trips"
import { toast } from "sonner"

interface TripResult {
  destination: string
  coordinates: { lat: number; lon: number }
  origin_city?: string
  best_start_date: string
  best_end_date: string
  predicted_price: number
  price_breakdown?: {
    hotel: number
    flight: number
    total: number
    per_person: number
  }
  predicted_temp: number
  predicted_precipitation: number
  predicted_crowd: number
  travel_score: number
  confidence: number
  scores: {
    price_score: number
    weather_score: number
    crowd_score: number
  }
  ai_explanation: string
  ai_travel_tip?: string
  generated_at: string
  trip_days: number
  data_source?: string
  events?: Array<{
    name: string
    description?: string
    start_date: string
    end_date?: string
    category: string
    url?: string
    is_free: boolean
    venue?: string
  }>
  event_warning?: string
  event_suggestions?: string[]
}

interface TripResultCardProps {
  result: TripResult
  onClose?: () => void
  isNew?: boolean
}

export function TripResultCard({ result, onClose, isNew = true }: TripResultCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [displayedTip, setDisplayedTip] = useState("")
  const [isStreaming, setIsStreaming] = useState(true)
  const [isTipStreaming, setIsTipStreaming] = useState(true)
  const [tripName, setTripName] = useState(`Trip to ${result.destination}`)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(tripName)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debug: Log the result to see if ai_travel_tip is present
  useEffect(() => {
    console.log("TripResultCard received result:", result)
    console.log("AI Travel Tip:", result.ai_travel_tip)
  }, [result])

  // Streaming effect for AI explanation
  useEffect(() => {
    if (!isNew) {
      setDisplayedText(result.ai_explanation)
      setIsStreaming(false)
      return
    }

    setDisplayedText("")
    setIsStreaming(true)
    let currentIndex = 0
    
    const interval = setInterval(() => {
      if (currentIndex <= result.ai_explanation.length) {
        setDisplayedText(result.ai_explanation.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsStreaming(false)
        clearInterval(interval)
      }
    }, 20) // 20ms per character for smooth streaming

    return () => clearInterval(interval)
  }, [result.ai_explanation, isNew])

  // Streaming effect for AI travel tip (starts after explanation)
  useEffect(() => {
    if (!result.ai_travel_tip) {
      setIsTipStreaming(false)
      return
    }

    if (!isNew) {
      setDisplayedTip(result.ai_travel_tip)
      setIsTipStreaming(false)
      return
    }

    // Wait for explanation to finish before starting tip
    if (isStreaming) {
      return
    }

    const travelTip = result.ai_travel_tip
    setDisplayedTip("")
    setIsTipStreaming(true)
    let currentIndex = 0
    
    const interval = setInterval(() => {
      if (currentIndex <= travelTip.length) {
        setDisplayedTip(travelTip.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTipStreaming(false)
        clearInterval(interval)
      }
    }, 20) // 20ms per character for smooth streaming

    return () => clearInterval(interval)
  }, [result.ai_travel_tip, isNew, isStreaming])

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
          type: 'single',
          data: result,
        })
        
        // Animate success
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setSavedTripId(savedTrip.id)
        toast.success("Trip saved successfully!", {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "outline"
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy")
    } catch {
      return dateStr
    }
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: "Very High", color: "bg-green-500" }
    if (confidence >= 0.6) return { label: "High", color: "bg-blue-500" }
    if (confidence >= 0.4) return { label: "Medium", color: "bg-yellow-500" }
    return { label: "Low", color: "bg-red-500" }
  }

  const confidenceInfo = getConfidenceLabel(result.confidence)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-[420px] max-w-[calc(100vw-2rem)]"
    >
      <Card className="shadow-2xl bg-background/80 backdrop-blur-xl border border-border/50 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Sticky Header */}
        <motion.div
          className="p-4 pb-3 border-b bg-background/95 backdrop-blur-xl sticky top-0 z-10 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Editable Trip Name */}
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
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
              </motion.div>

              <motion.div
                className="flex items-center gap-2 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-xl font-bold capitalize truncate">{result.destination}</h2>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {formatDate(result.best_start_date)} - {formatDate(result.best_end_date)}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {result.trip_days} days
                </Badge>
              </motion.div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
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
              </motion.div>
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
        </motion.div>

        {/* Scrollable Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-y-auto flex-1 p-4 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Travel Score Hero */}
              <motion.div
                className="relative mb-3 p-3 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Travel Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${getScoreColor(result.travel_score)}`}>
                        {result.travel_score.toFixed(0)}
                      </span>
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {confidenceInfo.label}
                      </Badge>
                    </div>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${confidenceInfo.color} rounded-full transition-all`}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Key Metrics Grid */}
              <motion.div
                className="grid grid-cols-2 gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Price - Updated with breakdown */}
                {result.price_breakdown ? (
                  <motion.div
                    className="col-span-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <PriceBreakdown
                      hotelCost={result.price_breakdown.hotel}
                      flightCost={result.price_breakdown.flight}
                      totalCost={result.predicted_price}
                      perPersonCost={result.price_breakdown.per_person}
                      dataSource={result.data_source}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="p-3 rounded-lg bg-muted/50 border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-muted-foreground">Est. Price</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">${result.predicted_price.toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground">USD</span>
                    </div>
                    <Badge variant={getScoreBadgeVariant(result.scores.price_score)} className="mt-1 text-xs">
                      Score: {result.scores.price_score.toFixed(0)}
                    </Badge>
                  </motion.div>
                )}

                {/* Weather */}
                <motion.div
                  className="p-3 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ThermometerSun className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-muted-foreground">Weather</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold">{result.predicted_temp.toFixed(1)}°C</span>
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{result.predicted_precipitation}mm</span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(result.scores.weather_score)} className="mt-1 text-xs">
                    {result.scores.weather_score.toFixed(0)}
                  </Badge>
                </motion.div>

                {/* Crowd Level */}
                <motion.div
                  className="p-3 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-muted-foreground">Crowds</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold">{result.predicted_crowd.toFixed(1)}%</span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(result.scores.crowd_score)} className="mt-1 text-xs">
                    {result.scores.crowd_score.toFixed(0)}
                  </Badge>
                </motion.div>

                {/* Score Breakdown */}
                <motion.div
                  className="col-span-2 p-3 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-muted-foreground">Score Breakdown</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Price</span>
                        <span className="font-semibold">{result.scores.price_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${result.scores.price_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Weather</span>
                        <span className="font-semibold">{result.scores.weather_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${result.scores.weather_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Crowds</span>
                        <span className="font-semibold">{result.scores.crowd_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${result.scores.crowd_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* AI Explanation */}
              <motion.div
                className="p-3 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-start gap-2 mb-1">
                  <Star className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    AI Travel Insight
                  </span>
                </div>
                <p className="text-xs text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                  {displayedText}
                  {isStreaming && (
                    <motion.span
                      className="inline-block w-1 h-3 ml-1 bg-blue-600 dark:bg-blue-400"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>
              </motion.div>

              {/* AI Travel Tip */}
              {result.ai_travel_tip && (
                <motion.div
                  className="p-3 rounded-lg bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Travel Tip
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                    {displayedTip}
                    {isTipStreaming && (
                      <motion.span
                        className="inline-block w-1 h-3 ml-1 bg-amber-600 dark:bg-amber-400"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </p>
                </motion.div>
              )}

              {/* Events & Festivals Section */}
              {(result.event_warning || (result.events && result.events.length > 0)) && (
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  {/* Event Warning Banner */}
                  {result.event_warning && (
                    <div className="p-3 rounded-lg bg-linear-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-fuchsia-950/30 border border-purple-200 dark:border-purple-700 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50 shrink-0">
                          <PartyPopper className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                            🎉 Events During Your Trip
                          </h4>
                          <p className="text-xs text-purple-800/90 dark:text-purple-100/80 leading-relaxed">
                            {result.event_warning}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Cards */}
                  {result.events && result.events.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        <h4 className="text-xs font-semibold text-foreground">
                          Events to Check Out
                        </h4>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {result.events.length} found
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {result.events.slice(0, 3).map((event, idx) => (
                          <motion.div
                            key={idx}
                            className="group p-3 rounded-lg bg-linear-to-br from-background to-muted/30 border border-border/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + idx * 0.1 }}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-md bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 shrink-0">
                                <CalendarIcon className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {event.name}
                                </h5>
                                {event.description && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                    {event.description}
                                  </p>
                                )}
                                {event.venue && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                                      {event.venue}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-purple-200 dark:border-purple-700">
                                    {event.category}
                                  </Badge>
                                  {event.is_free ? (
                                    <Badge className="text-[10px] h-4 px-1.5 bg-linear-to-r from-green-500 to-emerald-500 text-white border-0">
                                      Free Entry
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                      Ticketed
                                    </Badge>
                                  )}
                                  {event.start_date && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDate(event.start_date)}
                                    </span>
                                  )}
                                  {event.url && event.url !== "#" && (
                                    <a
                                      href={event.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-primary hover:text-primary/80 font-medium hover:underline ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Details →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {result.events.length > 3 && (
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                          + {result.events.length - 3} more event{result.events.length - 3 !== 1 ? 's' : ''} happening during your trip
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Footer */}
        {!isCollapsed && (
          <motion.div
            className="p-4 pt-2 border-t bg-background/95 backdrop-blur-xl sticky bottom-0 z-10 shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Generated: {format(new Date(result.generated_at), "MMM d, yyyy 'at' h:mm a")}</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
