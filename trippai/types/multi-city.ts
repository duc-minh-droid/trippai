/**
 * Type definitions for multi-city trips
 */

import { TripResult } from "./trip"

export interface CityStop {
  city: string
  days: number
}

export interface MultiCityRequest {
  cities: CityStop[]
  origin_city?: string
}

export interface CityStopResult extends TripResult {
  stop_number: number
  days_in_city: number
}

export interface MultiCityTripResult {
  id: string
  total_duration: number
  total_distance: number
  cities: CityStopResult[]
  total_cost: number
  total_cost_breakdown: {
    flights: number
    hotels: number
  }
  ai_summary?: string
  created_at: string
}
