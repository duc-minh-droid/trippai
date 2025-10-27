# 🚀 Real Flight & Hotel API Integration Guide

This guide will help you set up real-time flight and hotel pricing using the Booking.com API via RapidAPI.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Your RapidAPI Key](#getting-your-rapidapi-key)
3. [Configuration](#configuration)
4. [Testing the Integration](#testing-the-integration)
5. [API Usage](#api-usage)
6. [Troubleshooting](#troubleshooting)
7. [Alternative APIs](#alternative-apis)

---

## Overview

TripAI now supports **real-time pricing** from actual flight and hotel APIs! This enhancement provides:

✅ **Real hotel prices** from thousands of properties worldwide  
✅ **Real flight prices** for round-trip bookings  
✅ **Automatic fallback** to synthetic data if API fails  
✅ **Cost breakdown** (hotels vs flights)  
✅ **Per-person pricing** calculations

### How It Works

```
Frontend Request → FastAPI Backend → Booking Service → RapidAPI → Real Prices
                                          ↓ (if API fails)
                                    Synthetic Fallback
```

---

## Getting Your RapidAPI Key

### Step 1: Sign Up for RapidAPI

1. Go to [RapidAPI.com](https://rapidapi.com/)
2. Click **"Sign Up"** (top right)
3. Create account with email or Google/GitHub

### Step 2: Subscribe to Booking.com15 API

1. Visit the [Booking.com15 API page](https://rapidapi.com/DataCrawler/api/booking-com15)
2. Click **"Subscribe to Test"**
3. Choose a pricing plan:
   - **Free Tier**: 100 requests/month (perfect for testing)
   - **Basic**: $9.99/month - 1,000 requests
   - **Pro**: $49.99/month - 10,000 requests
   - **Ultra**: $99.99/month - 50,000 requests

### Step 3: Get Your API Key

1. After subscribing, go to the **"Endpoints"** tab
2. Your API key will be shown in the code snippets
3. Look for: `X-RapidAPI-Key: YOUR_KEY_HERE`
4. Copy this key

---

## Configuration

### Method 1: Environment Variable (Recommended)

1. **Create `.env` file** in `trippai_ai/` folder:

   ```bash
   cd trippai_ai
   cp .env.example .env
   ```

2. **Add your API key** to `.env`:

   ```bash
   # RapidAPI Key for Booking.com Integration
   RAPIDAPI_KEY=your_actual_api_key_here
   ```

3. **Save the file**

### Method 2: Direct Configuration (Testing Only)

You can also pass the API key directly when initializing:

```python
from booking_service import BookingService

service = BookingService(api_key="your_api_key_here")
```

⚠️ **Warning**: Don't commit your API key to Git!

---

## Testing the Integration

### Test 1: Check API Key Configuration

```bash
cd trippai_ai
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', 'Configured ✓' if os.getenv('RAPIDAPI_KEY') else 'Missing ✗')"
```

### Test 2: Test Booking Service Directly

Create a test file `test_booking.py`:

```python
from booking_service import BookingService
from datetime import datetime, timedelta

# Initialize service
service = BookingService()

# Test hotel search
print("Testing hotel search...")
hotel_prices = service.get_hotel_prices(
    destination="Barcelona",
    check_in="2025-06-15",
    check_out="2025-06-22",
    adults=2
)

print(f"Average Hotel Price: ${hotel_prices['average_price']:.2f}/night")
print(f"Total Hotels Found: {hotel_prices['hotel_count']}")
print(f"Price Range: ${hotel_prices['min_price']:.2f} - ${hotel_prices['max_price']:.2f}")

# Test flight search
print("\nTesting flight search...")
flight_prices = service.get_flight_prices(
    from_airport="JFK",
    to_airport="BCN",
    departure_date="2025-06-15",
    return_date="2025-06-22",
    adults=2
)

print(f"Average Flight Price: ${flight_prices['average_price']:.2f}")
print(f"Total Flights Found: {flight_prices['flight_count']}")

# Test total trip cost
print("\nTesting total trip cost...")
trip_cost = service.get_total_trip_cost(
    destination="Barcelona",
    origin_city="New York",
    check_in="2025-06-15",
    check_out="2025-06-22",
    adults=2
)

print(f"Hotel Total: ${trip_cost['hotel_cost']:.2f}")
print(f"Flight Total: ${trip_cost['flight_cost']:.2f}")
print(f"Grand Total: ${trip_cost['total_cost']:.2f}")
print(f"Per Person: ${trip_cost['per_person_cost']:.2f}")
```

Run the test:

```bash
python test_booking.py
```

### Test 3: Test via API Endpoint

Start the FastAPI server:

```bash
python main.py
```

Make a prediction with real prices:

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Barcelona",
    "trip_days": 7,
    "forecast_weeks": 52,
    "use_real_prices": true,
    "origin_city": "London"
  }'
```

Check the response for:

- `"data_source": "real_api"` ← Should say "real_api" not "synthetic"
- `"price_breakdown"` object with hotel and flight costs

---

## API Usage

### Frontend Integration

Update your Next.js fetch call to request real prices:

```typescript
// In trippai/app/page.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("http://localhost:8000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        trip_days: tripDays,
        forecast_weeks: forecastWeeks,
        use_real_prices: true, // ← Enable real prices
        origin_city: "London", // ← Set origin city
      }),
    });

    const data = await response.json();

    // Check if real prices were used
    if (data.data_source === "real_api") {
      console.log("✓ Using real prices!");
      console.log("Hotels:", data.price_breakdown.hotel);
      console.log("Flights:", data.price_breakdown.flight);
    } else {
      console.log("⚠ Using synthetic prices (API unavailable)");
    }

    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Available API Endpoints

#### 1. Predict with Real Prices

```
POST /api/predict
```

**Request:**

```json
{
  "destination": "Paris",
  "trip_days": 7,
  "forecast_weeks": 52,
  "use_real_prices": true,
  "origin_city": "London"
}
```

**Response:**

```json
{
  "destination": "Paris",
  "origin_city": "London",
  "predicted_price": 1450.50,
  "price_breakdown": {
    "hotel": 700.00,
    "flight": 750.50,
    "total": 1450.50,
    "per_person": 725.25
  },
  "data_source": "real_api",
  ...
}
```

#### 2. Get Current Prices for Specific Dates

```
GET /api/destination/{name}/prices?check_in=2025-06-15&check_out=2025-06-22&origin_city=London
```

**Response:**

```json
{
  "destination": "Barcelona",
  "origin": "London",
  "check_in": "2025-06-15",
  "check_out": "2025-06-22",
  "pricing": {
    "hotel_cost": 1050.0,
    "flight_cost": 450.0,
    "total_cost": 1500.0,
    "per_person_cost": 750.0,
    "nights": 7
  }
}
```

#### 3. List Supported Destinations

```
GET /api/destinations
```

---

## Troubleshooting

### Issue: "RAPIDAPI_KEY not configured"

**Solution:**

1. Check `.env` file exists in `trippai_ai/`
2. Verify key format: `RAPIDAPI_KEY=your_key` (no quotes, no spaces)
3. Restart the FastAPI server after adding the key

### Issue: "API request failed: 429"

**Cause:** Rate limit exceeded

**Solution:**

- Free tier: 100 requests/month
- Upgrade plan or wait for reset
- Use `use_real_prices: false` to use synthetic data

### Issue: "No hotels found" or empty results

**Possible Causes:**

1. Destination name doesn't match API database
2. Dates too far in the future (>1 year)
3. No availability for those dates

**Solutions:**

- Try major city names: "Barcelona", "Paris", "London"
- Use dates within next 6 months
- Check API logs for detailed error messages

### Issue: Prices seem incorrect

**Check:**

1. Currency is USD by default
2. Prices include tax/fees
3. "Fallback" flag in response (means synthetic data was used)

### Issue: Slow response times

**Causes:**

- Real API calls take 2-5 seconds
- Multiple weeks of forecasting = multiple API calls

**Solutions:**

- Reduce `forecast_weeks` for faster results
- Implement caching (Redis/database)
- Use background jobs for long forecasts

---

## Alternative APIs

If Booking.com15 doesn't work for you, here are alternatives:

### 1. **Amadeus API** (Recommended Alternative)

- **Best for:** Flights
- **Pricing:** Free tier: 1,000 calls/month
- **Link:** https://developers.amadeus.com/
- **Features:** Real flight prices, hotel search, car rentals

### 2. **Skyscanner API**

- **Best for:** Flights
- **Pricing:** Contact for pricing
- **Link:** https://www.partners.skyscanner.net/
- **Features:** Best for flight price comparison

### 3. **Hotels.com API (via RapidAPI)**

- **Best for:** Hotels
- **Pricing:** Free tier available
- **Link:** https://rapidapi.com/apidojo/api/hotels-com-provider

### 4. **Kayak API**

- **Best for:** Multi-source aggregation
- **Pricing:** Enterprise only
- **Link:** https://www.kayak.com/

### Integration Template

To add a new API, create a new service file like `amadeus_service.py`:

```python
class AmadeusService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.amadeus.com/v2"

    def get_flight_prices(self, origin, destination, date):
        # Implement API calls
        pass

    def get_hotel_prices(self, city, check_in, check_out):
        # Implement API calls
        pass
```

Then update `booking_service.py` to use the new service as a fallback.

---

## Rate Limits & Best Practices

### RapidAPI Rate Limits

| Plan  | Requests/Month | Requests/Second |
| ----- | -------------- | --------------- |
| Free  | 100            | 1               |
| Basic | 1,000          | 10              |
| Pro   | 10,000         | 100             |
| Ultra | 50,000         | 500             |

### Best Practices

1. **Cache results**: Store prices for 24 hours to reduce API calls
2. **Batch requests**: If possible, batch multiple date queries
3. **Graceful degradation**: Always fall back to synthetic data
4. **Monitor usage**: Track API calls to avoid overage charges
5. **Error handling**: Log failures for debugging

### Implementing Caching (Advanced)

```python
from functools import lru_cache
from datetime import datetime, timedelta

class CachedBookingService(BookingService):
    @lru_cache(maxsize=1000)
    def get_hotel_prices_cached(self, destination, check_in, check_out):
        return self.get_hotel_prices(destination, check_in, check_out)
```

---

## 📊 Cost Estimation

### Example Usage Costs

**Scenario 1: Personal Use (Free Tier)**

- 10 predictions per week
- Each prediction = 1-2 API calls
- Monthly: ~80-100 calls ✓ Fits in free tier

**Scenario 2: Beta Testing (Basic Plan - $9.99/mo)**

- 100 predictions per week
- Monthly: ~800-1,000 calls ✓ Fits in basic plan

**Scenario 3: Production (Pro Plan - $49.99/mo)**

- 500+ predictions per week
- Monthly: ~4,000-10,000 calls ✓ Fits in pro plan

---

## 🎯 Next Steps

Once you have real pricing integrated:

1. **Add price alerts** - Notify users when prices drop
2. **Price history tracking** - Store prices in database
3. **Price prediction ML** - Train on historical real prices
4. **Multi-origin support** - Let users select their origin city
5. **Currency conversion** - Support multiple currencies

---

## 📞 Support

- **RapidAPI Support**: https://rapidapi.com/contact
- **Booking.com15 API Issues**: Contact DataCrawler via RapidAPI
- **TripAI Issues**: Create issue on GitHub

---

**Happy coding! 🚀✈️🏨**
