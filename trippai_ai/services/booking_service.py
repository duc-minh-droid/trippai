"""
Booking.com API Integration Service
Fetches real hotel and flight prices for TripAI predictions
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class BookingService:
    """Service for interacting with Booking.com15 RapidAPI"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("RAPIDAPI_KEY")
        self.base_url = "https://booking-com15.p.rapidapi.com/api/v1"
        self.headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "booking-com15.p.rapidapi.com"
        }
    
    def _make_request(self, endpoint: str, params: Dict) -> Optional[Dict]:
        """Make API request with error handling"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return None
    
    def search_destination(self, destination_name: str) -> Optional[str]:
        """
        Search for destination ID
        Endpoint: /hotels/searchDestination
        """
        params = {"query": destination_name}
        data = self._make_request("hotels/searchDestination", params)
        
        if data and data.get("data"):
            # Return first destination ID
            destinations = data["data"]
            if destinations:
                return destinations[0].get("dest_id")
        return None
    
    def get_hotel_prices(
        self,
        destination: str,
        check_in: str,
        check_out: str,
        adults: int = 2,
        rooms: int = 1,
        dest_type: str = "city"
    ) -> Dict:
        """
        Get hotel prices for a destination
        Endpoint: /hotels/searchHotels
        
        Args:
            destination: Destination ID or name
            check_in: Check-in date (YYYY-MM-DD)
            check_out: Check-out date (YYYY-MM-DD)
            adults: Number of adults
            rooms: Number of rooms
            dest_type: Type of destination (city, region, etc.)
        
        Returns:
            Dict with average price, min price, max price, and hotel count
        """
        # Get destination ID if name provided
        dest_id = destination
        if not destination.isdigit():
            dest_id = self.search_destination(destination)
            if not dest_id:
                logger.warning(f"Could not find destination ID for {destination}")
                return self._get_fallback_hotel_price(check_in, check_out)
        
        params = {
            "dest_id": dest_id,
            "search_type": dest_type,
            "arrival_date": check_in,
            "departure_date": check_out,
            "adults": adults,
            "room_qty": rooms,
            "page_number": 1,
            "units": "metric",
            "temperature_unit": "c",
            "languagecode": "en-us",
            "currency_code": "USD"
        }
        
        data = self._make_request("hotels/searchHotels", params)
        
        if data and data.get("data") and data["data"].get("hotels"):
            return self._process_hotel_data(data["data"]["hotels"])
        
        return self._get_fallback_hotel_price(check_in, check_out)
    
    def _process_hotel_data(self, hotels: List[Dict]) -> Dict:
        """Process hotel data to extract pricing statistics"""
        prices = []
        
        for hotel in hotels:
            # Extract price from different possible locations
            price = None
            
            if "price" in hotel:
                price = hotel["price"].get("value") or hotel["price"].get("amount")
            elif "composite_price_breakdown" in hotel:
                breakdown = hotel["composite_price_breakdown"]
                if "gross_amount_per_night" in breakdown:
                    price = breakdown["gross_amount_per_night"].get("value")
            elif "min_total_price" in hotel:
                price = hotel["min_total_price"]
            
            if price:
                prices.append(float(price))
        
        if not prices:
            return {"average_price": 0, "min_price": 0, "max_price": 0, "hotel_count": 0}
        
        return {
            "average_price": sum(prices) / len(prices),
            "min_price": min(prices),
            "max_price": max(prices),
            "median_price": sorted(prices)[len(prices) // 2],
            "hotel_count": len(prices),
            "currency": "USD"
        }
    
    def get_flight_prices(
        self,
        from_airport: str,
        to_airport: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "ECONOMY"
    ) -> Dict:
        """
        Get flight prices
        Endpoint: /flights/searchFlights
        
        Args:
            from_airport: Origin airport code (e.g., 'JFK', 'LAX')
            to_airport: Destination airport code
            departure_date: Departure date (YYYY-MM-DD)
            return_date: Return date for round-trip (YYYY-MM-DD)
            adults: Number of adult passengers
            cabin_class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
        
        Returns:
            Dict with flight pricing information
        """
        params = {
            "fromId": from_airport,
            "toId": to_airport,
            "departDate": departure_date,
            "adults": adults,
            "cabinClass": cabin_class,
            "sort": "BEST"  # or CHEAPEST, FASTEST
        }
        
        if return_date:
            params["returnDate"] = return_date
        
        data = self._make_request("flights/searchFlights", params)
        
        if data and data.get("data") and data["data"].get("flights"):
            return self._process_flight_data(data["data"]["flights"])
        
        return self._get_fallback_flight_price(from_airport, to_airport)
    
    def _process_flight_data(self, flights: List[Dict]) -> Dict:
        """Process flight data to extract pricing statistics"""
        prices = []
        
        for flight in flights:
            price = flight.get("price", {}).get("total")
            if price:
                prices.append(float(price))
        
        if not prices:
            return {"average_price": 0, "min_price": 0, "max_price": 0, "flight_count": 0}
        
        return {
            "average_price": sum(prices) / len(prices),
            "min_price": min(prices),
            "max_price": max(prices),
            "median_price": sorted(prices)[len(prices) // 2],
            "flight_count": len(prices),
            "currency": "USD"
        }
    
    def get_total_trip_cost(
        self,
        destination: str,
        origin_city: str,
        check_in: str,
        check_out: str,
        adults: int = 2
    ) -> Dict:
        """
        Get total trip cost including flights and hotels
        
        Returns:
            Dict with total cost breakdown
        """
        # Get hotel prices
        hotel_data = self.get_hotel_prices(
            destination=destination,
            check_in=check_in,
            check_out=check_out,
            adults=adults
        )
        
        # Get flight prices (you'll need to map cities to airport codes)
        from_airport = self._get_airport_code(origin_city)
        to_airport = self._get_airport_code(destination)
        
        flight_data = self.get_flight_prices(
            from_airport=from_airport,
            to_airport=to_airport,
            departure_date=check_in,
            return_date=check_out,
            adults=adults
        )
        
        # Calculate nights
        check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
        check_out_date = datetime.strptime(check_out, "%Y-%m-%d")
        nights = (check_out_date - check_in_date).days
        
        # Calculate total costs
        hotel_total = hotel_data["average_price"] * nights
        flight_total = flight_data["average_price"]
        
        return {
            "hotel_cost": hotel_total,
            "flight_cost": flight_total,
            "total_cost": hotel_total + flight_total,
            "per_person_cost": (hotel_total + flight_total) / adults,
            "nights": nights,
            "hotel_details": hotel_data,
            "flight_details": flight_data,
            "currency": "USD"
        }
    
    def get_forecast_prices(
        self,
        destination: str,
        origin_city: str,
        start_date: datetime,
        weeks: int = 52,
        trip_days: int = 7
    ) -> List[Dict]:
        """
        Get price forecasts for multiple weeks ahead
        Useful for Prophet model training
        
        Returns:
            List of price data points for each week
        """
        price_data = []
        
        for week in range(weeks):
            check_in_date = start_date + timedelta(weeks=week)
            check_out_date = check_in_date + timedelta(days=trip_days)
            
            check_in = check_in_date.strftime("%Y-%m-%d")
            check_out = check_out_date.strftime("%Y-%m-%d")
            
            try:
                trip_cost = self.get_total_trip_cost(
                    destination=destination,
                    origin_city=origin_city,
                    check_in=check_in,
                    check_out=check_out
                )
                
                price_data.append({
                    "date": check_in,
                    "price": trip_cost["total_cost"],
                    "hotel_cost": trip_cost["hotel_cost"],
                    "flight_cost": trip_cost["flight_cost"],
                    "per_person": trip_cost["per_person_cost"]
                })
                
            except Exception as e:
                logger.warning(f"Failed to get prices for {check_in}: {e}")
                # Use fallback
                price_data.append({
                    "date": check_in,
                    "price": self._get_fallback_total_price(check_in, destination),
                    "hotel_cost": 0,
                    "flight_cost": 0,
                    "per_person": 0
                })
        
        return price_data
    
    def _get_airport_code(self, city_name: str) -> str:
        """Map city names to airport codes"""
        airport_codes = {
            "London": "LHR",
            "Paris": "CDG",
            "New York": "JFK",
            "Tokyo": "HND",
            "Barcelona": "BCN",
            "Rome": "FCO",
            "Dubai": "DXB",
            "Singapore": "SIN",
            "Amsterdam": "AMS",
            "Bangkok": "BKK",
            "Istanbul": "IST",
            "Los Angeles": "LAX",
            "Madrid": "MAD",
            "Sydney": "SYD",
            "Berlin": "BER",
            "Vienna": "VIE",
            "Prague": "PRG",
            "Athens": "ATH",
            "Lisbon": "LIS",
            "Copenhagen": "CPH",
            "Stockholm": "ARN",
            "Oslo": "OSL",
            "Helsinki": "HEL",
            "Warsaw": "WAW",
            "Budapest": "BUD",
            "Edinburgh": "EDI",
            "Dublin": "DUB",
            "Brussels": "BRU",
            "Zurich": "ZRH",
            "Munich": "MUC",
            "Frankfurt": "FRA",
            "Milan": "MXP",
            "Venice": "VCE",
            "Florence": "FLR",
            "Naples": "NAP",
            "Nice": "NCE",
            "Lyon": "LYS",
            "Marseille": "MRS",
            "Geneva": "GVA",
            "Hamburg": "HAM",
            "Krakow": "KRK",
            "Hong Kong": "HKG",
            "San Francisco": "SFO",
            "Melbourne": "MEL"
        }
        return airport_codes.get(city_name, "JFK")  # Default to JFK
    
    def _get_fallback_hotel_price(self, check_in: str, check_out: str) -> Dict:
        """Fallback hotel pricing when API fails"""
        check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
        nights = (datetime.strptime(check_out, "%Y-%m-%d") - check_in_date).days
        
        # Seasonal pricing
        month = check_in_date.month
        if month in [6, 7, 8, 12]:  # Peak season
            base_price = 150
        elif month in [4, 5, 9, 10]:  # Shoulder season
            base_price = 100
        else:  # Low season
            base_price = 80
        
        return {
            "average_price": base_price,
            "min_price": base_price * 0.7,
            "max_price": base_price * 1.5,
            "median_price": base_price,
            "hotel_count": 0,
            "currency": "USD",
            "fallback": True
        }
    
    def _get_fallback_flight_price(self, from_airport: str, to_airport: str) -> Dict:
        """Fallback flight pricing when API fails"""
        base_price = 400  # Base international flight
        
        return {
            "average_price": base_price,
            "min_price": base_price * 0.8,
            "max_price": base_price * 1.3,
            "median_price": base_price,
            "flight_count": 0,
            "currency": "USD",
            "fallback": True
        }
    
    def _get_fallback_total_price(self, date_str: str, destination: str) -> float:
        """Fallback total price estimation"""
        date = datetime.strptime(date_str, "%Y-%m-%d")
        month = date.month
        
        # Seasonal multiplier
        if month in [6, 7, 8, 12]:  # Peak
            multiplier = 1.3
        elif month in [4, 5, 9, 10]:  # Shoulder
            multiplier = 1.0
        else:  # Low
            multiplier = 0.8
        
        base_total = 1200  # Base trip cost
        return base_total * multiplier


# Example usage
if __name__ == "__main__":
    # Initialize service
    service = BookingService(api_key="YOUR_RAPIDAPI_KEY")
    
    # Example 1: Get hotel prices
    print("=== Hotel Prices ===")
    hotel_prices = service.get_hotel_prices(
        destination="Barcelona",
        check_in="2025-06-15",
        check_out="2025-06-22",
        adults=2
    )
    print(f"Average: ${hotel_prices['average_price']:.2f}")
    print(f"Range: ${hotel_prices['min_price']:.2f} - ${hotel_prices['max_price']:.2f}")
    
    # Example 2: Get flight prices
    print("\n=== Flight Prices ===")
    flight_prices = service.get_flight_prices(
        from_airport="JFK",
        to_airport="BCN",
        departure_date="2025-06-15",
        return_date="2025-06-22"
    )
    print(f"Average: ${flight_prices['average_price']:.2f}")
    
    # Example 3: Get total trip cost
    print("\n=== Total Trip Cost ===")
    trip_cost = service.get_total_trip_cost(
        destination="Barcelona",
        origin_city="New York",
        check_in="2025-06-15",
        check_out="2025-06-22",
        adults=2
    )
    print(f"Hotels: ${trip_cost['hotel_cost']:.2f}")
    print(f"Flights: ${trip_cost['flight_cost']:.2f}")
    print(f"Total: ${trip_cost['total_cost']:.2f}")
    print(f"Per Person: ${trip_cost['per_person_cost']:.2f}")
