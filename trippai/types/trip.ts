/**
 * Type definitions for trip results and predictions
 */

export interface Coordinates {
  lat: number
  lon: number
}

export interface PriceBreakdownData {
  hotel: number
  flight: number
  total: number
  per_person: number
}

export interface TripScores {
  price_score: number
  weather_score: number
  crowd_score: number
}

export interface TripEvent {
  name: string
  description?: string
  start_date: string
  end_date?: string
  category: string
  url?: string
  is_free: boolean
  venue?: string
}

export interface TripResult {
  destination: string
  coordinates: Coordinates
  origin_city?: string
  best_start_date: string
  best_end_date: string
  predicted_price: number
  price_breakdown?: PriceBreakdownData
  predicted_temp: number
  predicted_precipitation: number
  predicted_crowd: number
  travel_score: number
  confidence: number
  scores: TripScores
  ai_explanation: string
  ai_travel_tip?: string
  generated_at: string
  trip_days: number
  data_source?: string
  events?: TripEvent[]
  event_warning?: string
  event_suggestions?: string[]
}

export interface SavedTrip {
  id: string
  name: string
  result: TripResult
  savedAt: string
}
