"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Sparkles,
  Route,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ThermometerSun,
  CloudRain,
  Users,
  Star
} from "lucide-react"
import { savedTripsStorage, type SavedTrip } from "@/lib/saved-trips"
import { toast } from "sonner"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"

interface SavedTripCardProps {
  trip: SavedTrip
  onDelete: (id: string) => void
}

export function SavedTripCard({ trip, onDelete }: SavedTripCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDelete = () => {
    if (window.confirm(`Delete "${trip.name}"?`)) {
      const success = savedTripsStorage.delete(trip.id)
      if (success) {
        toast.success("Trip deleted", {
          description: `"${trip.name}" has been removed from your collection.`,
        })
        onDelete(trip.id)
      } else {
        toast.error("Failed to delete trip")
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

  // Extract relevant data based on trip type
  const tripData = trip.data
  const isSingleCity = trip.type === 'single'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background to-muted/20 border-border/50 overflow-hidden group">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isSingleCity ? (
                  <motion.div
                    animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={isHovered ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                  >
                    <Route className="w-5 h-5 text-primary shrink-0" />
                  </motion.div>
                )}
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {trip.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isSingleCity ? "default" : "secondary"} className="text-xs">
                  {isSingleCity ? "Single City" : "Multi-City"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Saved {format(new Date(trip.savedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preview */}
          <div className="space-y-3 mb-4">
            {isSingleCity ? (
              <>
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    {format(new Date(tripData.best_start_date), "MMM d")} - {format(new Date(tripData.best_end_date), "MMM d, yyyy")}
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {tripData.trip_days} days
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-muted-foreground">Price</span>
                    </div>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${tripData.predicted_price?.toFixed(0) || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                    <span className={`text-xl font-bold ${getScoreColor(tripData.travel_score)}`}>
                      {tripData.travel_score?.toFixed(0) || "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    {format(new Date(tripData.start_date), "MMM d")} - {format(new Date(tripData.end_date), "MMM d, yyyy")}
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {tripData.total_days} days
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/30">
                  <Route className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    {tripData.cities?.length || 0} cities
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${tripData.cost_breakdown?.total_cost?.toFixed(0) || "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                    <span className={`text-xl font-bold ${getScoreColor(tripData.overall_score?.overall || 0)}`}>
                      {tripData.overall_score?.overall?.toFixed(0) || "N/A"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 mb-4 pt-4 border-t">
                  {isSingleCity ? (
                    <>
                      {/* Weather Details */}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ThermometerSun className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Weather</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Temperature</p>
                            <p className="font-semibold">{tripData.predicted_temp?.toFixed(1)}°C</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Precipitation</p>
                            <p className="font-semibold">{tripData.predicted_precipitation}mm</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Score</p>
                            <Badge variant={getScoreBadgeVariant(tripData.scores?.weather_score || 0)} className="text-xs">
                              {tripData.scores?.weather_score?.toFixed(0)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Crowd Level */}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Crowd Level</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{tripData.predicted_crowd?.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Expected crowd</p>
                          </div>
                          <Badge variant={getScoreBadgeVariant(tripData.scores?.crowd_score || 0)}>
                            Score: {tripData.scores?.crowd_score?.toFixed(0)}
                          </Badge>
                        </div>
                      </div>

                      {/* AI Explanation */}
                      {tripData.ai_explanation && (
                        <div className="p-3 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2 mb-1">
                            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                              AI Travel Insight
                            </span>
                          </div>
                          <p className="text-xs text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                            {tripData.ai_explanation}
                          </p>
                        </div>
                      )}

                      {/* Score Breakdown */}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Score Breakdown</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Price Score</span>
                              <span className="font-semibold">{tripData.scores?.price_score?.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${tripData.scores?.price_score || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Weather Score</span>
                              <span className="font-semibold">{tripData.scores?.weather_score?.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 rounded-full transition-all"
                                style={{ width: `${tripData.scores?.weather_score || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Crowd Score</span>
                              <span className="font-semibold">{tripData.scores?.crowd_score?.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${tripData.scores?.crowd_score || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Multi-City Itinerary */}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Route className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Itinerary</span>
                        </div>
                        <div className="space-y-3">
                          {tripData.itinerary?.map((stop: any, index: number) => (
                            <div key={index} className="p-3 rounded bg-background/50 border">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                  <span className="text-sm font-semibold">{stop.city}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{stop.days}d</span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {format(new Date(stop.start_date), "MMM d")} - {format(new Date(stop.end_date), "MMM d")}
                              </div>
                              
                              {/* Weather and Crowd Info */}
                              <div className="grid grid-cols-4 gap-1.5 mb-2">
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
                                      ? `${stop.predicted_crowd.toFixed(0)}%` 
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>

                              {/* AI Explanation for this city */}
                              {stop.ai_explanation && (
                                <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-start gap-1.5">
                                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                                      {stop.ai_explanation}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Summary */}
                      {tripData.summary && (
                        <div className="p-3 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                              AI Trip Summary
                            </span>
                          </div>
                          <p className="text-xs text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                            {tripData.summary}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 h-9 text-sm gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Details
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 group/del"
            >
              <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface SavedTripsListProps {
  // No props needed for now
}

export function SavedTripsList({}: SavedTripsListProps = {}) {
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "single" | "multi">("all")

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = () => {
    setIsLoading(true)
    try {
      const savedTrips = savedTripsStorage.getAll()
      setTrips(savedTrips)
    } catch (error) {
      toast.error("Failed to load saved trips")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  // Filter and search trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || trip.type === filterType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Loading your trips...</h3>
          <p className="text-sm text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-24"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6"
        >
          <MapPin className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-3"
        >
          No saved trips yet
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground max-w-md mx-auto mb-6"
        >
          Start planning your next adventure! Create trip predictions and save your favorites to build your dream itinerary collection.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" className="gap-2">
            <a href="/">
              <Sparkles className="w-4 h-4" />
              Start Planning
            </a>
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Saved Trips
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage and explore your travel collection
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
          </Badge>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className="gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              All
            </Button>
            <Button
              variant={filterType === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("single")}
              className="gap-2"
            >
              <MapPin className="w-3.5 h-3.5" />
              Single
            </Button>
            <Button
              variant={filterType === "multi" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("multi")}
              className="gap-2"
            >
              <Route className="w-3.5 h-3.5" />
              Multi
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Trip Cards */}
      {filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No trips match your search.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <SavedTripCard
                  trip={trip}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
