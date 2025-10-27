"""
Quick test script for Booking.com API integration
Run this to verify your RapidAPI key is working correctly
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if API key is configured
api_key = os.getenv("RAPIDAPI_KEY")

print("=" * 60)
print("🚀 TripAI - Booking API Integration Test")
print("=" * 60)

if not api_key:
    print("\n❌ RAPIDAPI_KEY not found in environment!")
    print("\n📝 Setup Instructions:")
    print("1. Copy .env.example to .env")
    print("2. Add your RapidAPI key to .env file")
    print("3. Get key from: https://rapidapi.com/DataCrawler/api/booking-com15")
    print("\nExample .env file:")
    print("RAPIDAPI_KEY=your_actual_api_key_here")
    sys.exit(1)

print(f"\n✓ API Key configured: {api_key[:8]}...{api_key[-4:]}")

# Import booking service
try:
    from booking_service import BookingService
    print("✓ BookingService imported successfully")
except ImportError as e:
    print(f"\n❌ Failed to import BookingService: {e}")
    print("Make sure you're in the trippai_ai directory")
    sys.exit(1)

# Initialize service
print("\n" + "=" * 60)
print("Testing Booking Service...")
print("=" * 60)

service = BookingService()

# Test 1: Search for destination
print("\n[Test 1] Searching for Barcelona...")
try:
    dest_id = service.search_destination("Barcelona")
    if dest_id:
        print(f"✓ Found Barcelona (ID: {dest_id})")
    else:
        print("⚠ Barcelona not found, will use fallback")
except Exception as e:
    print(f"❌ Search failed: {e}")

# Test 2: Get hotel prices
print("\n[Test 2] Fetching hotel prices...")
check_in = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
check_out = (datetime.now() + timedelta(days=37)).strftime("%Y-%m-%d")

print(f"Dates: {check_in} to {check_out}")

try:
    hotel_data = service.get_hotel_prices(
        destination="Barcelona",
        check_in=check_in,
        check_out=check_out,
        adults=2
    )
    
    if hotel_data.get("fallback"):
        print("⚠ Using fallback pricing (API unavailable)")
    else:
        print(f"✓ Hotel prices retrieved successfully!")
        print(f"  Average: ${hotel_data['average_price']:.2f}/night")
        print(f"  Range: ${hotel_data['min_price']:.2f} - ${hotel_data['max_price']:.2f}")
        print(f"  Hotels found: {hotel_data['hotel_count']}")
except Exception as e:
    print(f"❌ Hotel search failed: {e}")

# Test 3: Get flight prices
print("\n[Test 3] Fetching flight prices...")
try:
    flight_data = service.get_flight_prices(
        from_airport="JFK",
        to_airport="BCN",
        departure_date=check_in,
        return_date=check_out,
        adults=2
    )
    
    if flight_data.get("fallback"):
        print("⚠ Using fallback pricing (API unavailable)")
    else:
        print(f"✓ Flight prices retrieved successfully!")
        print(f"  Average: ${flight_data['average_price']:.2f}")
        print(f"  Range: ${flight_data['min_price']:.2f} - ${flight_data['max_price']:.2f}")
        print(f"  Flights found: {flight_data['flight_count']}")
except Exception as e:
    print(f"❌ Flight search failed: {e}")

# Test 4: Get total trip cost
print("\n[Test 4] Calculating total trip cost...")
try:
    trip_cost = service.get_total_trip_cost(
        destination="Barcelona",
        origin_city="New York",
        check_in=check_in,
        check_out=check_out,
        adults=2
    )
    
    print("✓ Total cost calculated!")
    print(f"\n💰 Trip Summary:")
    print(f"  Hotel (7 nights): ${trip_cost['hotel_cost']:.2f}")
    print(f"  Flights (round-trip): ${trip_cost['flight_cost']:.2f}")
    print(f"  {'─' * 35}")
    print(f"  Total: ${trip_cost['total_cost']:.2f}")
    print(f"  Per Person: ${trip_cost['per_person_cost']:.2f}")
    
except Exception as e:
    print(f"❌ Trip cost calculation failed: {e}")

# Summary
print("\n" + "=" * 60)
print("✅ API Integration Test Complete!")
print("=" * 60)

print("\n📊 Results:")
print("- If you see '✓' marks, your API is working correctly")
print("- If you see '⚠' warnings, API returned fallback data")
print("- If you see '❌' errors, check your API key and subscription")

print("\n🔍 Next Steps:")
print("1. Start the FastAPI server: python main.py")
print("2. Test via API: curl -X POST http://localhost:8000/api/predict \\")
print("   -H 'Content-Type: application/json' \\")
print("   -d '{\"destination\":\"Barcelona\",\"use_real_prices\":true}'")
print("3. Or visit http://localhost:8000/docs for interactive API docs")

print("\n📖 For detailed setup guide, see: REAL_API_SETUP.md")
print("=" * 60)
