"""Multi-city trip planner for complex itineraries."""

import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import logging
from itertools import permutations

from models.trip_time_ai import TripTimeAI
from services.booking_service import BookingService
from config import CITY_COORDINATES, EVENTBRITE_API_KEY
from services.event_service import EventService

logger = logging.getLogger(__name__)


class CityStop:
    """Represents a single city stop in a multi-city trip."""
    
    def __init__(
        self,
        city: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        min_days: int = 2,
        max_days: int = 7,
        preferred_days: Optional[int] = None
    ):
        """
        Initialize a city stop.
        
        Args:
            city: Name of the city
            lat: Latitude (optional, will be looked up)
            lon: Longitude (optional, will be looked up)
            min_days: Minimum days to spend in this city
            max_days: Maximum days to spend in this city
            preferred_days: Preferred number of days (optional)
        """
        self.city = city
        self.min_days = min_days
        self.max_days = max_days
        self.preferred_days = preferred_days or min_days
        
        # Look up coordinates
        if lat is None or lon is None:
            coords = self._lookup_coordinates(city)
            self.lat = coords["lat"]
            self.lon = coords["lon"]
        else:
            self.lat = lat
            self.lon = lon
    
    def _lookup_coordinates(self, city: str) -> Dict[str, float]:
        """Look up coordinates from the city database."""
        city_key = city.lower()
        if city_key in CITY_COORDINATES:
            return CITY_COORDINATES[city_key]
        else:
            raise ValueError(
                f"Coordinates not found for '{city}'. "
                f"Please provide lat/lon manually or add to CITY_COORDINATES in config.py"
            )


class MultiCityPlanner:
    """
    Plans optimal multi-city trips with flexible routing.
    
    Features:
    - Optimal city ordering based on geography and travel scores
    - Flexible day allocation per city
    - Inter-city travel optimization
    - Overall trip scoring
    """
    
    def __init__(self, origin_city: str = "London", use_real_prices: bool = False):
        """
        Initialize the multi-city planner.
        
        Args:
            origin_city: Starting city for the trip
            use_real_prices: Whether to use real API prices
        """
        self.origin_city = origin_city
        self.use_real_prices = use_real_prices
        self.booking_service = BookingService() if use_real_prices else None
        
    def plan_trip(
        self,
        cities: List[CityStop],
        total_days: int,
        start_date: Optional[datetime] = None,
        optimize_route: bool = True,
        forecast_weeks: int = 52,
        max_budget: Optional[float] = None
    ) -> Dict:
        """
        Plan a multi-city trip with optimal routing and timing.
        
        Args:
            cities: List of CityStop objects representing destinations
            total_days: Total trip duration in days
            start_date: Preferred start date (None = find optimal)
            optimize_route: Whether to optimize city order
            forecast_weeks: Number of weeks to forecast for date optimization
            max_budget: Maximum budget constraint (optional)
        
        Returns:
            Dictionary with complete trip plan including route, dates, and costs
        """
        logger.info(f"Planning multi-city trip: {[c.city for c in cities]}")
        if max_budget:
            logger.info(f"Budget constraint: ${max_budget:.2f}")
        
        # Validate inputs
        min_total_days = sum(c.min_days for c in cities)
        if total_days < min_total_days:
            raise ValueError(
                f"Total trip days ({total_days}) is less than minimum required "
                f"({min_total_days}) for all cities"
            )
        
        # Optimize city order if requested
        if optimize_route and len(cities) > 2:
            cities = self._optimize_route(cities)
            logger.info(f"Optimized route: {[c.city for c in cities]}")
        
        # Allocate days to each city
        day_allocation = self._allocate_days(cities, total_days)
        logger.info(f"Day allocation: {day_allocation}")
        
        # Find optimal start date if not provided
        if start_date is None:
            start_date = self._find_optimal_start_date(
                cities, day_allocation, forecast_weeks, max_budget
            )
            logger.info(f"Optimal start date: {start_date.date()}")
        
        # Build detailed itinerary
        itinerary = self._build_itinerary(
            cities, day_allocation, start_date
        )
        
        # Calculate costs
        cost_breakdown = self._calculate_trip_costs(itinerary)
        
        # Check if total cost exceeds budget
        if max_budget and cost_breakdown["grand_total"] > max_budget:
            raise ValueError(
                f"No itinerary found within budget of ${max_budget:.2f}. "
                f"Minimum predicted cost: ${cost_breakdown['grand_total']:.2f}"
            )
        
        # Calculate overall trip score
        overall_score = self._calculate_overall_score(itinerary)
        
        # Generate trip summary
        summary = self._generate_summary(
            itinerary, cost_breakdown, overall_score
        )
        
        # Calculate total distance
        total_distance = self._calculate_total_distance(itinerary)
        
        # Get route details
        route_info = self._get_route_info(cities, optimize_route)
        
        return {
            "origin_city": self.origin_city,
            "cities": [c.city for c in cities],
            "total_days": total_days,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": (start_date + timedelta(days=total_days)).strftime("%Y-%m-%d"),
            "route_optimized": optimize_route,
            "route_info": route_info,
            "total_distance_km": round(total_distance, 1),
            "itinerary": itinerary,
            "cost_breakdown": cost_breakdown,
            "overall_score": overall_score,
            "summary": summary,
            "metadata": {
                "forecast_weeks": forecast_weeks,
                "optimization_enabled": optimize_route,
                "number_of_cities": len(cities),
                "generated_at": datetime.now().isoformat()
            },
            "generated_at": datetime.now().isoformat()
        }
    
    def _optimize_route(self, cities: List[CityStop]) -> List[CityStop]:
        """
        Optimize the order of cities to minimize travel distance.
        
        Uses a greedy nearest-neighbor approach for efficiency.
        For very small numbers of cities (<=6), can try all permutations.
        """
        if len(cities) <= 1:
            return cities
        
        # For small number of cities, try all permutations
        if len(cities) <= 6:
            return self._optimize_route_exhaustive(cities)
        
        # For larger numbers, use greedy nearest neighbor
        return self._optimize_route_greedy(cities)
    
    def _optimize_route_exhaustive(self, cities: List[CityStop]) -> List[CityStop]:
        """Try all possible routes and pick the shortest."""
        best_route = cities
        best_distance = float('inf')
        
        for perm in permutations(cities):
            distance = self._calculate_route_distance(list(perm))
            if distance < best_distance:
                best_distance = distance
                best_route = list(perm)
        
        return best_route
    
    def _optimize_route_greedy(self, cities: List[CityStop]) -> List[CityStop]:
        """Greedy nearest-neighbor route optimization."""
        if not cities:
            return cities
        
        remaining = cities[1:]  # Start with first city
        route = [cities[0]]
        
        while remaining:
            last_city = route[-1]
            # Find nearest remaining city
            nearest = min(
                remaining,
                key=lambda c: self._calculate_distance(
                    last_city.lat, last_city.lon, c.lat, c.lon
                )
            )
            route.append(nearest)
            remaining.remove(nearest)
        
        return route
    
    def _calculate_distance(
        self, lat1: float, lon1: float, lat2: float, lon2: float
    ) -> float:
        """Calculate distance between two points using Haversine formula."""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        
        lat1_rad = radians(lat1)
        lat2_rad = radians(lat2)
        delta_lat = radians(lat2 - lat1)
        delta_lon = radians(lon2 - lon1)
        
        a = (sin(delta_lat / 2) ** 2 +
             cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2)
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
    
    def _calculate_route_distance(self, cities: List[CityStop]) -> float:
        """Calculate total distance for a route."""
        total = 0.0
        for i in range(len(cities) - 1):
            total += self._calculate_distance(
                cities[i].lat, cities[i].lon,
                cities[i + 1].lat, cities[i + 1].lon
            )
        return total
    
    def _allocate_days(
        self, cities: List[CityStop], total_days: int
    ) -> Dict[str, int]:
        """
        Allocate days to each city based on preferences and constraints.
        
        Strategy:
        1. Start with minimum days for each city
        2. Distribute remaining days based on preferred_days ratio
        """
        allocation = {city.city: city.min_days for city in cities}
        remaining_days = total_days - sum(allocation.values())
        
        if remaining_days <= 0:
            return allocation
        
        # Calculate preference weights
        total_preferred = sum(city.preferred_days for city in cities)
        
        # Distribute remaining days proportionally to preferences
        for city in cities:
            # Calculate share based on preference
            preference_ratio = city.preferred_days / total_preferred
            extra_days = int(remaining_days * preference_ratio)
            
            # Don't exceed max_days
            max_extra = city.max_days - allocation[city.city]
            extra_days = min(extra_days, max_extra)
            
            allocation[city.city] += extra_days
        
        # Handle any remaining days due to rounding
        days_allocated = sum(allocation.values())
        if days_allocated < total_days:
            leftover = total_days - days_allocated
            # Give leftover days to cities that haven't hit max_days
            for city in cities:
                if allocation[city.city] < city.max_days and leftover > 0:
                    allocation[city.city] += 1
                    leftover -= 1
        
        return allocation
    
    def _find_optimal_start_date(
        self,
        cities: List[CityStop],
        day_allocation: Dict[str, int],
        forecast_weeks: int,
        max_budget: Optional[float] = None
    ) -> datetime:
        """
        Find the optimal start date for the multi-city trip.
        
        Uses AI predictions for each city and finds the best overall timing.
        If max_budget is provided, attempts to find dates within budget.
        """
        logger.info("Finding optimal start date...")
        
        # Calculate per-city budget if total budget provided
        per_city_budget = None
        if max_budget and len(cities) > 0:
            # Rough estimate: divide by number of cities plus some buffer for flights
            per_city_budget = max_budget / (len(cities) * 1.3)
            logger.info(f"Per-city budget estimate: ${per_city_budget:.2f}")
        
        # Get predictions for each city
        city_predictions = {}
        for city in cities:
            try:
                model = TripTimeAI(city.city, lat=city.lat, lon=city.lon)
                result = model.predict_best_time(
                    trip_days=day_allocation[city.city],
                    forecast_weeks=forecast_weeks,
                    max_budget=per_city_budget,
                    save_output=False
                )
                city_predictions[city.city] = result
            except Exception as e:
                logger.warning(f"Failed to get predictions for {city.city}: {e}")
                # If budget filtering failed, try without budget for this city
                if max_budget and "budget" in str(e).lower():
                    try:
                        model = TripTimeAI(city.city, lat=city.lat, lon=city.lon)
                        result = model.predict_best_time(
                            trip_days=day_allocation[city.city],
                            forecast_weeks=forecast_weeks,
                            max_budget=None,
                            save_output=False
                        )
                        city_predictions[city.city] = result
                    except Exception as e2:
                        logger.warning(f"Failed again for {city.city}: {e2}")
        
        # If we got predictions, use the best scored city as anchor
        if city_predictions:
            best_city = max(
                city_predictions.items(),
                key=lambda x: x[1].get("travel_score", 0)
            )
            best_start = datetime.strptime(
                best_city[1]["best_start_date"], "%Y-%m-%d"
            )
            return best_start
        
        # Fallback: start 4 weeks from now
        return datetime.now() + timedelta(weeks=4)
    
    def _build_itinerary(
        self,
        cities: List[CityStop],
        day_allocation: Dict[str, int],
        start_date: datetime
    ) -> List[Dict]:
        """
        Build detailed day-by-day itinerary with predictions for each city.
        """
        itinerary = []
        current_date = start_date
        previous_city = self.origin_city
        
        # Initialize event service
        event_service = EventService(api_key=EVENTBRITE_API_KEY)
        
        for i, city in enumerate(cities):
            days_in_city = day_allocation[city.city]
            city_start = current_date
            city_end = current_date + timedelta(days=days_in_city)
            
            # Get predictions for this city stay
            try:
                model = TripTimeAI(city.city, lat=city.lat, lon=city.lon)
                prediction = model.predict_best_time(
                    trip_days=days_in_city,
                    forecast_weeks=52,
                    save_output=False
                )
                
                # Fetch events for this city during the stay
                event_data = event_service.get_events_for_trip(
                    city=city.city,
                    start_date=city_start.strftime("%Y-%m-%d"),
                    end_date=city_end.strftime("%Y-%m-%d"),
                    lat=city.lat,
                    lon=city.lon
                )
                
                city_info = {
                    "city": city.city,
                    "order": i + 1,
                    "start_date": city_start.strftime("%Y-%m-%d"),
                    "end_date": city_end.strftime("%Y-%m-%d"),
                    "days": days_in_city,
                    "coordinates": {"lat": city.lat, "lon": city.lon},
                    "predicted_weather": {
                        "temperature": prediction.get("predicted_temp"),
                        "precipitation": prediction.get("predicted_precipitation")
                    },
                    "predicted_price": prediction.get("predicted_price"),
                    "predicted_crowd": prediction.get("predicted_crowd"),
                    "travel_score": prediction.get("travel_score"),
                    "confidence": prediction.get("confidence"),
                    "scores": prediction.get("scores", {}),
                    "ai_explanation": prediction.get("ai_explanation"),
                    "ai_travel_tip": prediction.get("ai_travel_tip"),
                    "from_city": previous_city,
                    "events": event_data.get("events", []),
                    "event_warning": event_data.get("warning"),
                    "event_suggestions": event_data.get("suggestions", []),
                    "has_major_events": event_data.get("has_major_events", False)
                }
                
                if event_data.get("has_major_events"):
                    logger.info(f"Found {len(event_data['events'])} events in {city.city}")
                    
            except Exception as e:
                logger.warning(f"Could not get predictions for {city.city}: {e}")
                city_info = {
                    "city": city.city,
                    "order": i + 1,
                    "start_date": city_start.strftime("%Y-%m-%d"),
                    "end_date": city_end.strftime("%Y-%m-%d"),
                    "days": days_in_city,
                    "coordinates": {"lat": city.lat, "lon": city.lon},
                    "from_city": previous_city,
                    "events": [],
                    "event_suggestions": [],
                    "has_major_events": False,
                    "error": str(e)
                }
            
            itinerary.append(city_info)
            current_date = city_end
            previous_city = city.city
        
        return itinerary
    
    def _calculate_trip_costs(self, itinerary: List[Dict]) -> Dict:
        """
        Calculate total trip costs including hotels and inter-city travel.
        """
        total_hotel = 0.0
        total_flights = 0.0
        city_costs = {}
        detailed_flights = []
        
        for i, stop in enumerate(itinerary):
            city = stop["city"]
            days = stop["days"]
            
            # Hotel costs (from prediction or estimate)
            hotel_cost = stop.get("predicted_price", 0)
            total_hotel += hotel_cost
            
            # Inter-city flight cost (estimate based on distance)
            if i > 0:
                prev_stop = itinerary[i - 1]
                distance = self._calculate_distance(
                    prev_stop["coordinates"]["lat"],
                    prev_stop["coordinates"]["lon"],
                    stop["coordinates"]["lat"],
                    stop["coordinates"]["lon"]
                )
                # Rough estimate: $0.15 per km for flights
                flight_cost = distance * 0.15
                total_flights += flight_cost
                
                flight_detail = {
                    "from": prev_stop['city'],
                    "to": city,
                    "distance_km": round(distance, 1),
                    "cost": round(flight_cost, 2)
                }
                detailed_flights.append(flight_detail)
                city_costs[f"Flight {prev_stop['city']} → {city}"] = round(flight_cost, 2)
            
            city_costs[f"{city} accommodation"] = round(hotel_cost, 2)
        
        # Add return flight to origin
        if itinerary:
            last_stop = itinerary[-1]
            origin_coords = self._lookup_origin_coords()
            distance = self._calculate_distance(
                last_stop["coordinates"]["lat"],
                last_stop["coordinates"]["lon"],
                origin_coords["lat"],
                origin_coords["lon"]
            )
            return_flight_cost = distance * 0.15
            total_flights += return_flight_cost
            
            flight_detail = {
                "from": last_stop['city'],
                "to": self.origin_city,
                "distance_km": round(distance, 1),
                "cost": round(return_flight_cost, 2)
            }
            detailed_flights.append(flight_detail)
            city_costs[f"Flight {last_stop['city']} → {self.origin_city}"] = round(return_flight_cost, 2)
        
        return {
            "total_hotel": round(total_hotel, 2),
            "total_flights": round(total_flights, 2),
            "total_cost": round(total_hotel + total_flights, 2),
            "per_person": round((total_hotel + total_flights) / 2, 2),  # Assume 2 people
            "breakdown": city_costs,
            "flights": detailed_flights
        }
    
    def _lookup_origin_coords(self) -> Dict[str, float]:
        """Look up origin city coordinates."""
        city_key = self.origin_city.lower()
        if city_key in CITY_COORDINATES:
            return CITY_COORDINATES[city_key]
        return {"lat": 51.5074, "lon": -0.1278}  # Default to London
    
    def _calculate_overall_score(self, itinerary: List[Dict]) -> Dict:
        """Calculate overall trip score based on all city scores."""
        scores = [
            stop.get("travel_score", 50)
            for stop in itinerary
            if "travel_score" in stop
        ]
        
        if not scores:
            return {"overall": 50.0, "average": 50.0, "min": 50.0, "max": 50.0}
        
        # Weight by days spent in each city
        weighted_scores = []
        total_days = sum(stop["days"] for stop in itinerary)
        
        for stop in itinerary:
            if "travel_score" in stop:
                weight = stop["days"] / total_days
                weighted_scores.append(stop["travel_score"] * weight)
        
        overall = sum(weighted_scores)
        
        return {
            "overall": round(overall, 2),
            "average": round(sum(scores) / len(scores), 2),
            "min": round(min(scores), 2),
            "max": round(max(scores), 2)
        }
    
    def _generate_summary(
        self,
        itinerary: List[Dict],
        cost_breakdown: Dict,
        overall_score: Dict
    ) -> str:
        """Generate a human-readable trip summary."""
        cities_list = " → ".join([stop["city"] for stop in itinerary])
        total_days = sum(stop["days"] for stop in itinerary)
        
        summary = f"Multi-city trip visiting {len(itinerary)} cities over {total_days} days.\n"
        summary += f"Route: {self.origin_city} → {cities_list} → {self.origin_city}\n"
        summary += f"Overall trip score: {overall_score['overall']}/100\n"
        summary += f"Estimated total cost: ${cost_breakdown['total_cost']:,.2f} "
        summary += f"(${cost_breakdown['per_person']:,.2f} per person)"
        
        return summary
    
    def _calculate_total_distance(self, itinerary: List[Dict]) -> float:
        """Calculate total distance traveled including return to origin."""
        if not itinerary:
            return 0.0
        
        total = 0.0
        origin_coords = self._lookup_origin_coords()
        
        # Distance from origin to first city
        first_stop = itinerary[0]
        total += self._calculate_distance(
            origin_coords["lat"], origin_coords["lon"],
            first_stop["coordinates"]["lat"], first_stop["coordinates"]["lon"]
        )
        
        # Distance between cities
        for i in range(len(itinerary) - 1):
            curr = itinerary[i]
            next_stop = itinerary[i + 1]
            total += self._calculate_distance(
                curr["coordinates"]["lat"], curr["coordinates"]["lon"],
                next_stop["coordinates"]["lat"], next_stop["coordinates"]["lon"]
            )
        
        # Distance from last city back to origin
        last_stop = itinerary[-1]
        total += self._calculate_distance(
            last_stop["coordinates"]["lat"], last_stop["coordinates"]["lon"],
            origin_coords["lat"], origin_coords["lon"]
        )
        
        return total
    
    def _get_route_info(self, cities: List[CityStop], optimized: bool) -> Dict:
        """Get detailed route information."""
        route_order = [c.city for c in cities]
        
        info = {
            "order": route_order,
            "was_optimized": optimized,
            "optimization_method": "greedy_nearest_neighbor" if optimized and len(cities) > 6 else "exhaustive" if optimized else "manual"
        }
        
        if optimized and len(cities) > 1:
            # Calculate distances between consecutive cities
            segments = []
            for i in range(len(cities) - 1):
                distance = self._calculate_distance(
                    cities[i].lat, cities[i].lon,
                    cities[i + 1].lat, cities[i + 1].lon
                )
                segments.append({
                    "from": cities[i].city,
                    "to": cities[i + 1].city,
                    "distance_km": round(distance, 1)
                })
            info["segments"] = segments
        
        return info
