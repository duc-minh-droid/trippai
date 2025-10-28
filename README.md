# 🌍 TrippAI - AI-Powered Trip Planning Platform# 🌍 TripAI - Smart Travel Time Predictor

TrippAI is an intelligent trip planning application that helps users find the optimal time to travel based on real-time data including weather, crowd levels, prices, and local events.![TripAI Banner](https://img.shields.io/badge/TripAI-Smart%20Travel-blue?style=for-the-badge)

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)

## 🚀 Features![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?style=flat-square&logo=fastapi)

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

- **AI-Powered Trip Recommendations**: Get smart suggestions on the best time to travel

- **Weather Forecasting**: Real-time weather predictions for your destinationAn AI-powered full-stack application that predicts the optimal time to travel to any destination based on weather patterns, price trends, and crowd levels. TripAI uses machine learning with Facebook Prophet for time-series forecasting and provides interactive visualizations through a modern Next.js interface.

- **Price Analysis**: Track flight and hotel prices to find the best deals

- **Event Tracking**: Discover major events and festivals at your destination## 🆕 Latest Features

- **Crowd Intelligence**: Avoid peak tourist seasons with crowd predictions

- **Multi-City Planning**: Plan complex itineraries across multiple cities### 💾 **Save & Manage Trips**

- **Saved Trips**: Save and manage your favorite trip plans

- **Save trips** with custom names to your personal collection

## 📁 Project Structure- **Beautiful Saved Trips page** with search and filter functionality

- **Inline editing** of trip names with smooth animations

````- **Persistent storage** using browser localStorage

mockhack1/- Works for both single-city and multi-city trips

├── trippai/              # Next.js Frontend

│   ├── app/              # Next.js app directory### 🗺️ **Multi-City Trip Planner**

│   ├── components/       # React components

│   ├── lib/              # Utilities and helpers- **Plan complex itineraries** visiting multiple cities in one trip

│   └── types/            # TypeScript type definitions- **Route optimization** for efficient travel paths

│- **Comprehensive AI insights** for each city stop

└── trippai_ai/           # FastAPI Backend- **Real-time streaming progress** during planning

    ├── api/              # API routes- **Total cost breakdown** including flights between cities

    ├── services/         # Business logic services- **Distance calculations** for the entire journey

    ├── models/           # AI/ML models

    ├── utils/            # Utility functions### ✨ **Enhanced Trip Information**

    └── main.py           # FastAPI application entry point

```- **AI-generated explanations** for each destination

- **Confidence scores** showing prediction reliability

## 🛠️ Tech Stack- **Score breakdowns**: Individual price, weather, and crowd scores

- **Fixed crowd display** showing accurate 0-100 scale

### Frontend- **Rich data visualization** with detailed metrics

- **Framework**: Next.js 14+ (React)

- **Language**: TypeScript### � **Improved Navigation**

- **Styling**: Tailwind CSS

- **UI Components**: Custom component library- Clean, focused navigation: **Home | Multi-City | Saved Trips**

- **State Management**: React Hooks- Removed cluttered pages (charts, forms, profile)

- Streamlined user experience

### Backend- Responsive mobile design

- **Framework**: FastAPI (Python)

- **AI/ML**: Custom prediction models### 💰 **Real Flight & Hotel Prices**

- **APIs**: Weather, Events, Crowd data

- **Data Processing**: Pandas, NumPy**TripAI supports REAL pricing** from Booking.com API! Get actual pricing data from thousands of properties worldwide. Simply set `use_real_prices: true` in your API request.



## 📦 Installation🧪 **Test Script**: `python trippai_ai/test_booking_api.py`

🔑 **Get API Key**: [RapidAPI Booking.com15](https://rapidapi.com/DataCrawler/api/booking-com15) (Free tier: 100 requests/month)

### Prerequisites

- Node.js 18+ and npm/yarn## 📋 Table of Contents

- Python 3.9+

- Git- [Features](#-features)

- [Project Structure](#-project-structure)

### Frontend Setup- [Tech Stack](#-tech-stack)

- [Getting Started](#-getting-started)

```bash  - [Prerequisites](#prerequisites)

cd trippai  - [Backend Setup](#backend-setup-trippai_ai)

npm install  - [Frontend Setup](#frontend-setup-trippai)

npm run dev- [Usage](#-usage)

```- [API Documentation](#-api-documentation)

- [How It Works](#-how-it-works)

The frontend will run on `http://localhost:3000`- [Screenshots](#-screenshots)

- [Future Features](#-future-features-roadmap)

### Backend Setup- [Contributing](#-contributing)

- [License](#-license)

```bash

cd trippai_ai---

python -m venv venv

source venv/bin/activate  # On Windows: venv\Scripts\activate## ✨ Features

pip install -r requirements.txt

python main.py### 🤖 AI-Powered Predictions

````

- **Machine Learning Forecasting**: Uses Facebook Prophet for advanced time-series forecasting up to 2 years ahead

The backend API will run on `http://localhost:8000`- **Multi-Factor Analysis**: Combines weather, pricing, and crowd data into a comprehensive TravelScore

- **AI Explanations**: Natural language explanations of predictions using OpenAI GPT-4o-mini

## 🔑 Environment Variables- **Confidence Scoring**: Provides reliability metrics for each prediction (0-100%)

- **Score Breakdowns**: Individual ratings for price, weather, and crowd levels

### Backend (.env in trippai_ai/)

```env### 🗺️ Multi-City Trip Planning

# API Keys (Optional - mock data will be used if not provided)

EVENTBRITE_API_KEY=your_eventbrite_api_key- **Complex Itineraries**: Plan trips visiting multiple cities in one journey

WEATHER_API_KEY=your_weather_api_key- **Route Optimization**: Automatically finds the most efficient travel path

- **Exhaustive Search**: Evaluates all possible routes for optimal planning

# Server Configuration- **Distance Calculations**: Shows distances between cities and total trip distance

HOST=0.0.0.0- **Per-City Insights**: AI explanations and detailed metrics for each destination

PORT=8000- **Cost Breakdown**: Flight costs between cities, hotel costs per stop, and total trip cost

DEBUG=True- **Real-Time Progress**: Live streaming updates during route optimization

```

### 💾 Trip Management

### Frontend (.env.local in trippai/)

````env- **Save Trips**: Save both single-city and multi-city trips to your collection

NEXT_PUBLIC_API_URL=http://localhost:8000- **Custom Names**: Rename trips with inline editing (press Enter to save, Escape to cancel)

```- **Saved Trips Page**: Beautiful dedicated page to manage all saved trips

- **Search & Filter**: Find trips by name or filter by type (Single-City / Multi-City)

## 🧪 Testing- **Persistent Storage**: Trips saved in browser localStorage

- **Easy Management**: Delete unwanted trips with confirmation

### Backend Tests- **Visual States**: Save button turns green when trip is saved

```bash

cd trippai_ai### 🌤️ Weather Analysis

python test_events_debug.py  # Debug event service

python -m pytest              # Run all tests- Real-time weather data from Open-Meteo API

```- Temperature comfort analysis (ideal range: 15-25°C)

- Precipitation tracking and forecasting

### Frontend Tests- Weather comfort scoring based on ideal travel conditions

```bash- Historical weather patterns for accurate predictions

cd trippai

npm test### 💰 Price Intelligence

````

- **Real-time pricing** from Booking.com API via RapidAPI

## 📡 API Documentation- Actual flight and hotel prices from thousands of properties

- Automatic fallback to synthetic data if API unavailable

Once the backend is running, visit:- Detailed price breakdown (hotels vs flights)

- Swagger UI: `http://localhost:8000/docs`- Per-person cost calculations

- ReDoc: `http://localhost:8000/redoc`- Price trend analysis and forecasting

- Best value period identification

### Main Endpoints- Historical price comparison

- `POST /api/trip/analyze` - Analyze trip recommendations### 👥 Crowd Estimation

- `GET /api/events/{city}` - Get events for a city

- `GET /api/weather/{city}` - Get weather forecast- Google Trends integration for tourist demand analysis

- `GET /api/crowds/{city}` - Get crowd predictions- Peak season identification

- Crowd level normalization and scoring (0-100 scale)

## 🎯 Key Services- Avoid overcrowded destinations

### Event Service### 🗺️ Interactive Map Interface

Fetches major events and festivals using the Eventbrite API. Falls back to mock data if API is unavailable.

- Beautiful Mapbox GL integration with smooth animations

### Weather Service- Real-time destination selection

Provides weather forecasts and climate data for destination cities.- 40+ pre-configured popular destinations worldwide

- City transitions with visual feedback

### Price Service- Responsive map controls

Tracks and predicts flight and hotel prices based on historical data.

### 📊 Data Visualization

### Crowd Service

Estimates tourist crowd levels using multiple data sources.- Interactive charts showing trends over time

- Line charts for time-series analysis

## 🐛 Debugging- Visual score indicators and progress bars

- Color-coded metrics for easy reading

### Event Service 404 Errors- Responsive chart layouts

If you see `Eventbrite API returned status 404`, this is normal when:

1. No API key is configured (mock data will be used)### 🎨 Modern UI/UX

2. Invalid API key (mock data will be used)

3. City not found in Eventbrite's database- **Dark/Light Theme**: System preference detection with manual toggle

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

Run the debug test to see detailed API calls:- **Smooth Animations**: Framer Motion for delightful interactions

````bash- **Accessible Components**: Built with Radix UI primitives

cd trippai_ai- **Toast Notifications**: Beautiful feedback using Sonner

python test_events_debug.py- **Clean Navigation**: Focused user experience (Home | Multi-City | Saved Trips)

```- **Loading States**: Animated loading indicators throughout

- **Gradient Designs**: Beautiful gradient backgrounds and text effects

## 🤝 Contributing- **Hover Effects**: Interactive elements with visual feedback



1. Fork the repository---

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)## 📁 Project Structure

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request```

mockhack1/

## 📝 License├── trippai/                    # Frontend (Next.js 15)

│   ├── app/                    # App router pages

This project is licensed under the MIT License - see the LICENSE file for details.│   │   ├── page.tsx           # Home page with map & predictions

│   │   ├── multi-city/        # Multi-city trip planner page

## 👥 Authors│   │   │   └── page.tsx

│   │   └── saved-trips/       # Saved trips management page

- Your Name - Initial work│   │       └── page.tsx

│   ├── components/            # React components

## 🙏 Acknowledgments│   │   ├── home/              # Home page components

│   │   │   ├── TripResultCard.tsx       # Single-city trip display

- Eventbrite API for event data│   │   │   ├── SavedTripsList.tsx       # Saved trips list component

- OpenWeather API for weather data│   │   │   └── ...

- Next.js and FastAPI communities│   │   ├── multi-city/        # Multi-city components

│   │   │   ├── MultiCityResult.tsx      # Multi-city trip display

## 📞 Support│   │   │   ├── CityStopInput.tsx        # City input component

│   │   │   ├── StreamingProgress.tsx    # Real-time progress

For issues and questions:│   │   │   ├── PriceBreakdown.tsx       # Cost breakdown display

- Open an issue on GitHub│   │   │   └── ...

- Contact: your.email@example.com│   │   ├── navbar/            # Navigation components

│   │   │   ├── DesktopNav.tsx

---│   │   │   ├── MobileSidebar.tsx

│   │   │   └── ...

Made with ❤️ by the TrippAI Team│   │   └── ui/                # Reusable UI components

│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── hooks/                 # Custom React hooks
│   │   └── use-media-query.ts
│   ├── lib/                   # Utilities and helpers
│   │   ├── cities.ts          # City data and coordinates
│   │   ├── saved-trips.ts     # LocalStorage utility for saving trips
│   │   ├── multi-city-types.ts # TypeScript types for multi-city
│   │   └── utils.ts           # General utilities
│   └── public/                # Static assets
│
├── trippai_ai/                # Backend (FastAPI + ML)
│   ├── main.py               # FastAPI application & endpoints
│   ├── travel_model.py       # Core ML prediction model
│   ├── forecast_model.py     # Facebook Prophet forecasting
│   ├── multi_city_planner.py # Multi-city route optimization
│   ├── weather_service.py    # Weather API integration
│   ├── price_service.py      # Price generation & API integration
│   ├── booking_service.py    # Booking.com API integration
│   ├── crowd_service.py      # Google Trends integration
│   ├── config.py             # Configuration & constants
│   ├── requirements.txt      # Python dependencies
│   ├── test_*.py            # Test scripts for various features
│   └── models/               # Saved predictions (JSON)
│
└── README.md                  # This file
````

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5 with React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Radix UI primitives
- **Maps**: Mapbox GL + React Map GL
- **Charts**: Chart.js + React-Chartjs-2
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode

### Backend

- **Framework**: FastAPI (Python)
- **ML/AI**:
  - Facebook Prophet (time-series forecasting)
  - OpenAI GPT-4o-mini (AI explanations)
- **Data Processing**: Pandas, NumPy
- **APIs**:
  - Open-Meteo (weather data)
  - Google Trends via pytrends (crowd data)
- **Validation**: Pydantic models
- **Server**: Uvicorn (ASGI)

### DevOps & Tools

- **Package Manager**: npm (frontend), pip (backend)
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Environment Variables**: dotenv

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Mapbox API Key** (for maps) - [Get it here](https://www.mapbox.com/)
- **RapidAPI Key** (optional, for real flight/hotel prices) - [Get it here](https://rapidapi.com/DataCrawler/api/booking-com15)
- **OpenAI API Key** (optional, for AI explanations) - [Get it here](https://platform.openai.com/)

### Backend Setup (trippai_ai)

1. **Navigate to backend directory**

   ```bash
   cd trippai_ai
   ```

2. **Create virtual environment** (recommended)

   ```bash
   python -m venv venv

   # Windows
   .\venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (optional)

   ```bash
   # Create .env file
   cp .env.example .env

   # Add your API keys
   RAPIDAPI_KEY=your_rapidapi_key_here    # For real flight/hotel prices
   OPENAI_API_KEY=your_openai_key_here    # For AI explanations (optional)
   ```

   > **Getting API Keys:**
   >
   > - **RapidAPI** (Real Prices): Sign up at [RapidAPI.com](https://rapidapi.com/), subscribe to [Booking.com15 API](https://rapidapi.com/DataCrawler/api/booking-com15) - Free tier: 100 requests/month
   > - **OpenAI** (AI Explanations): Optional. Without it, template-based explanations are used.
   >
   > See [`trippai_ai/REAL_API_SETUP.md`](trippai_ai/REAL_API_SETUP.md) for detailed setup instructions.

5. **Start the FastAPI server**

   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

   Interactive API docs at `http://localhost:8000/docs`

### Frontend Setup (trippai)

1. **Navigate to frontend directory**

   ```bash
   cd trippai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Create .env.local file
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 💡 Usage

### Single-City Trip Planning

1. **Select Destination**: Choose from 40+ popular cities on the map or use the search
2. **Configure Trip**: Set trip duration (1-30 days) and forecast period (1-104 weeks)
3. **Get Predictions**: Click "Find Best Time" to analyze travel data
4. **View Results**:
   - Best travel dates
   - Expected weather conditions
   - Detailed price breakdown
   - Crowd levels (0-100 scale)
   - Overall TravelScore (0-100)
   - AI-generated explanation with travel tips
   - Confidence score for prediction reliability
5. **Save Trip**: Click "Save" to add to your collection (optionally rename first)

### Multi-City Trip Planning

1. **Set Origin City**: Choose your starting point
2. **Add Destinations**: Enter multiple cities you want to visit
3. **Configure Trip**: Set days per city and forecast period
4. **Optimize Route**: Enable route optimization for efficient travel
5. **Get Plan**: Click "Plan Trip" to analyze all destinations
6. **Watch Progress**: See real-time updates as the AI plans your route
7. **View Comprehensive Results**:
   - Optimized route order
   - Distance between cities
   - Per-city weather, price, and crowd predictions
   - AI insights for each destination
   - Individual confidence and score breakdowns
   - Total trip cost with flight segments
   - Complete itinerary timeline
8. **Save Itinerary**: Save the entire multi-city plan with a custom name

### Managing Saved Trips

1. **Navigate to Saved Trips**: Click "Saved Trips" in the navigation menu
2. **Browse Collection**: View all your saved trips in a beautiful grid layout
3. **Search**: Use the search bar to find trips by name
4. **Filter**: Filter by trip type (All / Single-City / Multi-City)
5. **View Details**: Click on any trip to see full information
6. **Delete**: Remove unwanted trips with the delete button (with confirmation)

### Editing Trip Names

1. **While Viewing Trip**: Click on the trip name at the top of the card
2. **Edit Mode Activates**: Input field appears with check/cancel buttons
3. **Make Changes**: Type your new trip name
4. **Save**: Press Enter or click the check button
5. **Cancel**: Press Escape or click the X button

### API Usage Examples

**Single-City Prediction**:

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris",
    "trip_days": 7,
    "forecast_weeks": 52,
    "use_real_prices": true,
    "origin_city": "London"
  }'
```

**Multi-City Planning**:

```bash
curl -X POST "http://localhost:8000/api/multi-city-predict" \
  -H "Content-Type: application/json" \
  -d '{
    "origin_city": "London",
    "cities": ["paris", "barcelona", "rome"],
    "days_per_city": 4,
    "forecast_weeks": 52,
    "optimize_route": true,
    "use_real_prices": true
  }'
```

---

## 📊 API Documentation

### Endpoints

#### `GET /`

Welcome message and API information

#### `GET /health`

Health check endpoint
**Response includes:**

- API status
- RapidAPI configuration status
- Version information

#### `GET /api/destinations`

List all supported destinations (40+ cities worldwide)

#### `GET /api/destination/{name}/prices`

Get current prices for specific dates

**Query Parameters:**

- `check_in`: Check-in date (YYYY-MM-DD)
- `check_out`: Check-out date (YYYY-MM-DD)
- `origin_city`: Origin city for flights (default: "London")

#### `POST /api/predict`

Single-city travel prediction

**Request Body**:

```typescript
{
  destination: string;        // City name (e.g., "Paris", "Barcelona")
  lat?: number;              // Optional: Latitude override
  lon?: number;              // Optional: Longitude override
  origin_city?: string;      // Origin city for flights (default: "London")
  start_date?: string;       // Optional: YYYY-MM-DD format
  end_date?: string;         // Optional: YYYY-MM-DD format
  trip_days?: number;        // Default: 7, Range: 1-30
  forecast_weeks?: number;   // Default: 52, Range: 1-104
  use_real_prices?: boolean; // Default: false, Use real API prices
}
```

**Response Fields**:

- `destination`: City name
- `origin_city`: Origin city for flights
- `coordinates`: Lat/lon of destination
- `best_start_date`: Optimal trip start date
- `best_end_date`: Optimal trip end date
- `predicted_price`: Expected cost (flight + hotel)
- `price_breakdown`: Object with hotel, flight, total, and per_person costs
- `predicted_temp`: Average temperature (°C)
- `predicted_precipitation`: Expected rain (mm)
- `predicted_crowd`: Tourist density (0-100)
- `travel_score`: Overall score (0-100, higher is better)
- `explanation`: AI-generated travel advice
- `confidence`: Prediction confidence (0-100)
- `scores`: Breakdown of price_score, weather_score, crowd_score
- `data_source`: "real_api" or "synthetic"
- `forecast_data`: Array of weekly predictions

#### `POST /api/multi-city-predict`

Multi-city itinerary planning

**Request Body**:

```typescript
{
  origin_city: string;       // Starting city
  cities: string[];          // Array of destination city names
  days_per_city?: number;    // Default: 4, days to spend in each city
  forecast_weeks?: number;   // Default: 52
  optimize_route?: boolean;  // Default: true, optimize travel order
  use_real_prices?: boolean; // Default: false
}
```

**Response Fields**:

- `origin_city`: Starting city
- `cities`: Array of city names in order
- `total_days`: Total trip duration
- `total_cost`: Complete trip cost
- `total_distance_km`: Total distance including return
- `route_info`: Object containing:
  - `order`: Optimized city order
  - `was_optimized`: Whether route was optimized
  - `optimization_method`: "exhaustive", "greedy_nearest_neighbor", or "manual"
  - `segments`: Distance between consecutive cities
- `itinerary`: Array of city stops, each containing:
  - `city`: City name
  - `arrival_date`: Check-in date
  - `departure_date`: Check-out date
  - `days`: Number of days
  - `predicted_price`: Cost for this city
  - `predicted_temp`: Temperature
  - `predicted_precipitation`: Rainfall
  - `predicted_crowd`: Crowd level (0-100)
  - `travel_score`: Overall score
  - `confidence`: Prediction confidence (0-100)
  - `explanation`: AI-generated insights
  - `scores`: Individual price_score, weather_score, crowd_score
- `cost_breakdown`: Detailed costs:
  - `hotels`: Array of hotel costs per city
  - `flights`: Array of flight costs between cities
  - `total_hotels`: Sum of all hotel costs
  - `total_flights`: Sum of all flight costs
  - `grand_total`: Complete trip cost
- `metadata`: Additional information:
  - `forecast_weeks`: Forecast period used
  - `optimization_enabled`: Whether optimization was used
  - `number_of_cities`: Count of cities

---

## 🧠 How It Works

### 1. Data Collection

#### Weather Data

- Fetches historical and forecast data from Open-Meteo API
- Retrieves temperature, precipitation, and other weather metrics
- Analyzes patterns for accurate predictions

#### Price Data

- **Real Mode** (`use_real_prices: true`):
  - Fetches actual hotel prices from Booking.com API via RapidAPI
  - Searches for flight prices between origin and destination
  - Provides real-time pricing from thousands of properties
- **Synthetic Mode** (default):
  - Generates realistic prices with seasonal patterns
  - Models typical price fluctuations
  - Useful for testing and when API limits are reached

#### Crowd Data

- Scrapes Google Trends for destination search interest
- Analyzes historical tourist demand patterns
- Predicts peak and off-peak seasons

### 2. Feature Engineering

#### Weather Comfort Scoring

- Ideal temperature range: 15-25°C (59-77°F)
- Penalty for precipitation
- Comfort score normalized to 0-100

#### Price Scoring

- Normalized inverse score (lower price = higher score)
- Considers both flight and hotel costs
- Adjusted for trip duration

#### Crowd Scoring

- Normalized inverse score (lower crowds = higher score)
- Based on 0-100 scale
- Higher score means less crowded

### 3. Time-Series Forecasting with Prophet

- Uses Facebook Prophet ML model to forecast:
  - Temperature trends over time
  - Precipitation patterns
  - Price fluctuations
  - Crowd level changes
- Handles seasonality automatically
- Considers holidays and weekly patterns
- Provides confidence intervals for predictions

### 4. Multi-City Route Optimization

#### Optimization Methods

1. **Exhaustive Search** (≤5 cities):

   - Evaluates all possible route permutations
   - Guarantees optimal route
   - Minimizes total travel distance

2. **Greedy Nearest Neighbor** (>5 cities):

   - Efficient heuristic for large itineraries
   - Always visits nearest unvisited city
   - Good approximation of optimal route

3. **Manual** (optimization disabled):
   - Keeps cities in user-specified order
   - No route optimization applied

#### Route Scoring

- Calculates distances between all city pairs
- Considers both outbound and return journey
- Optimizes for minimal total travel distance

### 5. TravelScore Calculation

```python
TravelScore = (
  weather_score × 0.40 +  # 40% weight - Weather comfort
  price_score × 0.30 +     # 30% weight - Affordability
  crowd_score × 0.30       # 30% weight - Crowd levels
) × 100
```

Result: Score from 0-100 (higher is better)

- **90-100**: Excellent time to visit
- **80-89**: Very good conditions
- **70-79**: Good conditions
- **60-69**: Acceptable conditions
- **Below 60**: Consider alternative dates

### 6. Optimal Period Selection

- Ranks all forecast periods by TravelScore
- Considers trip duration for continuity
- Returns best consecutive days within forecast window
- Ensures selected dates have:
  - Highest combined TravelScore
  - Continuous availability
  - Sufficient data confidence

### 7. AI Explanation Generation

#### With OpenAI API (Optional)

- Sends prediction data to GPT-4o-mini
- Generates natural language explanations
- Includes actionable travel tips
- Contextualizes scores and metrics

#### Without OpenAI API

- Uses template-based explanations
- Highlights key metrics
- Provides general travel advice
- Still informative and useful

### 8. Confidence Scoring

- Analyzes prediction reliability
- Considers data quality and availability
- Factors in forecast distance from present
- Reported as percentage (0-100%)
- Higher confidence = more reliable prediction

### 9. Saved Trips Storage

- Uses browser localStorage for persistence
- Stores complete trip data including:
  - Custom trip names
  - All prediction metrics
  - Timestamps
  - Trip type (single/multi)
- Data format: JSON
- Survives browser sessions
- Per-device, per-browser storage

---

## 🖼️ Screenshots

### Main Interface

![Main Interface - Map View with Predictions]

### Dark Mode

![Dark Mode Interface]

### Charts Dashboard

![Interactive Charts and Visualizations]

---

## 🚀 Future Features & Roadmap

### 🎯 High Priority

#### 1. **Enhanced Authentication & User Profiles**

- User authentication (Firebase/Supabase)
- Cloud-based trip storage (sync across devices)
- Personalized travel preferences
- Travel history and statistics
- Social features (share trips with friends)

#### 2. **Advanced Booking Integration**

- Direct booking through the platform
- Multiple booking platforms comparison
- Price tracking and alerts
- Availability checking in real-time
- User reviews and ratings integration

#### 3. **Price Alerts & Notifications**

- Email/SMS notifications for price drops
- Best time alerts when TravelScore improves
- Last-minute deal notifications
- Push notifications via PWA
- Custom alert thresholds

#### 4. **Trip Collaboration**

- Invite friends to plan together
- Voting system for destinations
- Shared budgets and expense splitting
- Group chat within trips
- Collaborative itinerary editing

#### 5. **Calendar Integration**

- Export trips to Google Calendar
- iCal format support
- Sync with Outlook
- Automatic reminders
- Flight/hotel booking reminders

### 🌟 Medium Priority

#### 6. **Budget Constraints & Optimization**

- Set maximum budget limits
- Find destinations within budget
- Budget-optimized route planning
- Cost-saving suggestions
- Currency conversion support

#### 7. **Activity & Attraction Integration**

- Things to do at each destination
- Event calendar (festivals, concerts, sports)
- Restaurant recommendations
- Local experiences and tours
- Ticket booking integration

#### 8. **Travel Restrictions & Requirements**

- Visa requirements by passport
- Entry requirements and documentation
- COVID-19 or health restrictions
- Travel advisories and safety alerts
- Vaccination requirements

#### 9. **Transportation Alternatives**

- Train routes and prices (especially Europe/Asia)
- Bus/coach options
- Car rental integration
- Local transportation guides
- Carbon footprint comparison
- Eco-friendly travel options

#### 10. **Enhanced Weather Features**

- Air quality index
- UV index and sun protection advice
- Best time of day for activities
- Sunrise/sunset times
- Historical weather comparison
- Weather-based activity suggestions
- Extreme weather alerts

### 📱 User Experience

#### 11. **Mobile App Development**

- Native iOS app
- Native Android app
- Offline mode for saved trips
- GPS integration
- Mobile-first features
- Camera integration for travel photos

#### 12. **Progressive Web App (PWA)**

- Installable web app
- Offline functionality
- Push notifications
- App-like experience
- Fast loading times
- Background sync

#### 13. **Accessibility Improvements**

- WCAG 2.1 AAA compliance
- Screen reader optimization
- Keyboard navigation enhancements
- High contrast themes
- Font size customization
- Voice controls

#### 14. **Internationalization**

- Multi-language support (Spanish, French, German, Chinese, etc.)
- Currency localization
- Date/time format localization
- RTL language support (Arabic, Hebrew)
- Region-specific recommendations

### 📊 Analytics & Insights

#### 15. **Personal Travel Analytics**

- Travel statistics dashboard
- Carbon footprint tracking
- Money saved through predictions
- Countries/cities visited map
- Travel trends over time
- Budget vs actual spending

#### 16. **Advanced Visualizations**

- Interactive comparison charts
- Historical price trends
- Weather pattern visualizations
- Crowd heatmaps
- Best month finder
- Destination comparison tool

#### 17. **Travel Recommendations Engine**

- AI-powered destination suggestions
- "Similar destinations" feature
- Off-the-beaten-path recommendations
- Budget-based suggestions
- Interest-based recommendations (adventure, culture, relaxation)
- Seasonal highlights

### 🔧 Technical Enhancements

#### 18. **Performance Optimizations**

- Redis caching for predictions
- PostgreSQL for user data
- CDN for static assets
- Response time optimization
- Lazy loading improvements
- Server-side rendering optimization

#### 19. **Enhanced ML Models**

- LSTM networks for price prediction
- Ensemble models for accuracy
- Transfer learning from larger datasets
- Real-time model retraining
- Anomaly detection for deals
- Demand forecasting

#### 20. **API & Developer Tools**

- Public API with documentation
- Webhook support
- GraphQL API option
- SDKs (JavaScript, Python, Go)
- API rate limiting with tiers
- Developer portal

#### 21. **Testing & Quality**

- Comprehensive unit test coverage
- Integration testing suite
- E2E tests with Playwright
- Performance testing
- Load testing
- CI/CD pipeline automation

### 💼 Business Features

#### 22. **Monetization Options**

- Freemium model (free + premium tiers)
- Ad-free experience (premium)
- Advanced features (premium)
- Travel agency partnership program
- Affiliate commissions
- White-label licensing

#### 23. **Travel Agency Portal**

- B2B API access
- Client management system
- Commission tracking
- Booking management
- Custom branding
- Bulk operations

#### 24. **Content & Community**

- Travel blog integration
- User-generated content
- Photo sharing
- Trip reports
- Destination guides
- Travel tips and hacks
- Community forums

### 🎨 Additional Features

#### 25. **Packing Assistant**

- AI-generated packing lists
- Weather-based recommendations
- Activity-specific items
- Checklist functionality
- Carry-on vs checked luggage

#### 26. **Travel Insurance**

- Compare insurance providers
- Coverage recommendations
- Direct purchase integration
- Claims assistance

#### 27. **Accommodation Variety**

- Airbnb integration
- Hostel options
- Vacation rentals
- Boutique hotels
- Neighborhood comparisons

#### 28. **AR/VR Features**

- Virtual destination previews
- 360° city tours
- AR navigation
- Virtual hotel room tours

#### 29. **Smart Suggestions**

- Best layover cities
- Hidden gems near popular destinations
- Seasonal events and festivals
- Local food recommendations
- Photography spots

#### 30. **Export & Sharing**

- PDF itinerary generation
- Shareable trip links
- Social media integration
- Trip embedding for blogs
- Print-friendly formats

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript/Python best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Open-Meteo** for free weather API
- **Facebook Prophet** for time-series forecasting
- **Mapbox** for beautiful maps
- **Vercel** for Next.js framework
- **FastAPI** for modern Python API framework
- **OpenAI** for AI-powered explanations
- **Radix UI** for accessible components
- **Shadcn/ui** for UI component inspiration

---

## 📧 Contact & Support

- **Developer**: Duc Minh
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/mockhack1/issues)
- **Documentation**: Check `/trippai_ai/README.md` for detailed backend docs

---

## 🌟 Star This Repo

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Made with ❤️ for travelers worldwide**
