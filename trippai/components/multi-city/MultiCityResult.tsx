"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Plane, TrendingUp, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PriceBreakdown } from "./PriceBreakdown"

interface ItineraryStop {
  city: string
  start_date: string
  end_date: string
  days: number
  prediction: {
    travel_score: number
    predicted_price: number
    predicted_temp: number
    predicted_precipitation: number
    predicted_crowd: number
  }
}

interface MultiCityResultProps {
  result: {
    origin_city: string
    cities: string[]
    total_days: number
    start_date: string
    end_date: string
    route_optimized: boolean
    itinerary: ItineraryStop[]
    cost_breakdown: {
      total_cost: number
      hotels_total: number
      flights_total: number
      per_person_cost: number
      per_city: any[]
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
  }
}

export function MultiCityResult({ result }: MultiCityResultProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <Card className="p-6 bg-linear-to-br from-primary/5 via-background to-background">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Your Multi-City Adventure</h2>
            </div>
            <p className="text-muted-foreground">
              {result.cities.length} cities • {result.total_days} days
            </p>
          </div>
          <Badge
            variant={result.route_optimized ? "default" : "secondary"}
            className="text-xs"
          >
            {result.route_optimized ? "Route Optimized" : "Custom Route"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(result.overall_score.overall)}`}>
              {result.overall_score.overall.toFixed(0)}
              <span className="text-sm">/100</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Weather</p>
            <p className={`text-2xl font-bold ${getScoreColor(result.overall_score.weather)}`}>
              {result.overall_score.weather.toFixed(0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className={`text-2xl font-bold ${getScoreColor(result.overall_score.price)}`}>
              {result.overall_score.price.toFixed(0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Crowds</p>
            <p className={`text-2xl font-bold ${getScoreColor(result.overall_score.crowd)}`}>
              {result.overall_score.crowd.toFixed(0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Trip Dates */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Trip Dates</h3>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Departure</p>
            <p className="font-semibold">{formatDate(result.start_date)}</p>
          </div>
          <div className="text-muted-foreground">→</div>
          <div>
            <p className="text-xs text-muted-foreground">Return</p>
            <p className="font-semibold">{formatDate(result.end_date)}</p>
          </div>
        </div>
      </Card>

      {/* Price Breakdown */}
      <PriceBreakdown
        hotelCost={result.cost_breakdown.hotels_total}
        flightCost={result.cost_breakdown.flights_total}
        totalCost={result.cost_breakdown.total_cost}
        perPersonCost={result.cost_breakdown.per_person_cost}
      />

      {/* Itinerary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Day-by-Day Itinerary</h3>
        </div>

        <div className="space-y-4">
          {/* Origin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Plane className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <p className="font-semibold">{result.origin_city}</p>
              <p className="text-xs text-muted-foreground">Starting Point</p>
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
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {index + 1}
                  </div>
                  {index < result.itinerary.length - 1 && (
                    <div className="w-0.5 h-16 bg-linear-to-b from-primary/50 to-transparent" />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{stop.city}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                      </p>
                    </div>
                    <Badge variant="outline">{stop.days} days</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className={`font-semibold ${getScoreColor(stop.prediction.travel_score)}`}>
                        {stop.prediction.travel_score.toFixed(0)}/100
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Temp</p>
                      <p className="font-semibold">{stop.prediction.predicted_temp.toFixed(0)}°C</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Rain</p>
                      <p className="font-semibold">{stop.prediction.predicted_precipitation.toFixed(0)}mm</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Crowds</p>
                      <p className="font-semibold">{(stop.prediction.predicted_crowd * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Summary */}
      <Card className="p-4 bg-linear-to-br from-primary/5 to-background">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
