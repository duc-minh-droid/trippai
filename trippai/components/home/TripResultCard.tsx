"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Plane
} from "lucide-react"
import { format } from "date-fns"
import { PriceBreakdown } from "@/components/multi-city/PriceBreakdown"

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
  generated_at: string
  trip_days: number
  data_source?: string
}

interface TripResultCardProps {
  result: TripResult
  onClose?: () => void
  isNew?: boolean
}

export function TripResultCard({ result, onClose, isNew = true }: TripResultCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isStreaming, setIsStreaming] = useState(true)

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
    >
      <Card className="w-full max-w-2xl p-6 shadow-xl bg-background/98 backdrop-blur-md border-2">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex-1">
            <motion.div
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold capitalize">{result.destination}</h2>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {formatDate(result.best_start_date)} - {formatDate(result.best_end_date)}
              </p>
              <Badge variant="secondary" className="ml-2">
                {result.trip_days} days
              </Badge>
            </motion.div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-2"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Travel Score Hero */}
              <motion.div
                className="relative mb-6 p-6 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Travel Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${getScoreColor(result.travel_score)}`}>
                        {result.travel_score.toFixed(0)}
                      </span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {confidenceInfo.label} Confidence
                      </Badge>
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
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
                className="grid grid-cols-2 gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Price - Updated with breakdown */}
                {result.price_breakdown ? (
                  <motion.div
                    className="col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <PriceBreakdown
                      hotelCost={result.price_breakdown.hotel}
                      flightCost={result.price_breakdown.flight}
                      totalCost={result.price_breakdown.total}
                      perPersonCost={result.price_breakdown.per_person}
                      dataSource={result.data_source}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="p-4 rounded-lg bg-muted/50 border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-muted-foreground">Estimated Price</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">${result.predicted_price.toFixed(0)}</span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    <Badge variant={getScoreBadgeVariant(result.scores.price_score)} className="mt-2">
                      Score: {result.scores.price_score.toFixed(0)}
                    </Badge>
                  </motion.div>
                )}

                {/* Weather */}
                <motion.div
                  className="p-4 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ThermometerSun className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-muted-foreground">Weather</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold">{result.predicted_temp.toFixed(1)}°C</span>
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{result.predicted_precipitation}mm</span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(result.scores.weather_score)} className="mt-2">
                    Score: {result.scores.weather_score.toFixed(0)}
                  </Badge>
                </motion.div>

                {/* Crowd Level */}
                <motion.div
                  className="p-4 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-muted-foreground">Crowd Level</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold">{result.predicted_crowd.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground">occupancy</span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(result.scores.crowd_score)} className="mt-2">
                    Score: {result.scores.crowd_score.toFixed(0)}
                  </Badge>
                </motion.div>

                {/* Score Breakdown */}
                <motion.div
                  className="p-4 rounded-lg bg-muted/50 border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-muted-foreground">Score Breakdown</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Price</span>
                        <span className="font-semibold">{result.scores.price_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${result.scores.price_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Weather</span>
                        <span className="font-semibold">{result.scores.weather_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${result.scores.weather_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Crowds</span>
                        <span className="font-semibold">{result.scores.crowd_score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${result.scores.crowd_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* AI Explanation */}
              <motion.div
                className="p-4 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    AI Travel Insight
                  </span>
                </div>
                <p className="text-sm text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                  {displayedText}
                  {isStreaming && (
                    <motion.span
                      className="inline-block w-1 h-4 ml-1 bg-blue-600 dark:bg-blue-400"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span>Generated: {format(new Date(result.generated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Data
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
