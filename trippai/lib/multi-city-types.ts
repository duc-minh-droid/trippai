// Enhanced Multi-City Trip API Response Types

export interface Coordinates {
  lat: number
  lon: number
}

export interface PredictedWeather {
  temperature: number
  precipitation: number
}

export interface ScoreBreakdown {
  price_score: number
  weather_score: number
  crowd_score: number
}

export interface Event {
  name: string
  description?: string
  start_date: string
  end_date?: string
  category: string
  url?: string
  is_free: boolean
  venue?: string
}

export interface ItineraryStop {
  city: string
  order: number
  start_date: string
  end_date: string
  days: number
  coordinates: Coordinates
  predicted_weather: PredictedWeather
  predicted_price: number
  predicted_crowd: number
  travel_score: number
  confidence: number
  scores: ScoreBreakdown
  ai_explanation: string
  ai_travel_tip?: string
  from_city: string
  events?: Event[]
  event_warning?: string
  event_suggestions?: string[]
  has_major_events?: boolean
  error?: string
}

export interface FlightSegment {
  from: string
  to: string
  distance_km: number
  cost: number
}

export interface CostBreakdown {
  total_hotel: number
  total_flights: number
  total_cost: number
  per_person: number
  breakdown: Record<string, number>
  flights: FlightSegment[]
}

export interface OverallScore {
  overall: number
  average: number
  min: number
  max: number
}

export interface RouteSegment {
  from: string
  to: string
  distance_km: number
}

export interface RouteInfo {
  order: string[]
  was_optimized: boolean
  optimization_method: "greedy_nearest_neighbor" | "exhaustive" | "manual"
  segments?: RouteSegment[]
}

export interface TripMetadata {
  forecast_weeks: number
  optimization_enabled: boolean
  number_of_cities: number
  generated_at: string
}

export interface MultiCityTripResult {
  origin_city: string
  cities: string[]
  total_days: number
  start_date: string
  end_date: string
  route_optimized: boolean
  route_info: RouteInfo
  total_distance_km: number
  itinerary: ItineraryStop[]
  cost_breakdown: CostBreakdown
  overall_score: OverallScore
  summary: string
  metadata: TripMetadata
  generated_at: string
}

// Props for components
export interface MultiCityResultProps {
  result: MultiCityTripResult
}

export interface ItineraryCardProps {
  stop: ItineraryStop
  isLast: boolean
}

export interface CostBreakdownProps {
  costBreakdown: CostBreakdown
}

export interface RouteVisualizationProps {
  routeInfo: RouteInfo
  originCity: string
  totalDistance: number
}
