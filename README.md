# 🌍 TripAI - Smart Travel Time Predictor

![TripAI Banner](https://img.shields.io/badge/TripAI-Smart%20Travel-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

An AI-powered full-stack application that predicts the optimal time to travel to any destination based on weather patterns, price trends, and crowd levels. TripAI uses machine learning with Facebook Prophet for time-series forecasting and provides interactive visualizations through a modern Next.js interface.

## 🆕 What's New: Real-Time Pricing! 🎉

**TripAI now supports REAL flight and hotel prices** from Booking.com API! Get actual pricing data from thousands of properties worldwide. Simply set `use_real_prices: true` in your API request.

📖 **Setup Guide**: [`trippai_ai/REAL_API_SETUP.md`](trippai_ai/REAL_API_SETUP.md)  
🧪 **Test Script**: `python trippai_ai/test_booking_api.py`  
🔑 **Get API Key**: [RapidAPI Booking.com15](https://rapidapi.com/DataCrawler/api/booking-com15) (Free tier: 100 requests/month)

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup-trippai_ai)
  - [Frontend Setup](#frontend-setup-trippai)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Future Features](#-future-features-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Predictions

- **Machine Learning Forecasting**: Uses Facebook Prophet for advanced time-series forecasting up to 2 years ahead
- **Multi-Factor Analysis**: Combines weather, pricing, and crowd data into a comprehensive TravelScore
- **AI Explanations**: Natural language explanations of predictions using OpenAI GPT-4o-mini
- **Confidence Scoring**: Provides reliability metrics for each prediction

### 🌤️ Weather Analysis

- Real-time weather data from Open-Meteo API
- Temperature comfort analysis
- Precipitation tracking
- Weather comfort scoring based on ideal travel conditions

### 💰 Price Intelligence

- **Real-time pricing** from Booking.com API via RapidAPI
- Actual flight and hotel prices from thousands of properties
- Automatic fallback to synthetic data if API unavailable
- Price breakdown (hotels vs flights)
- Per-person cost calculations
- Price trend analysis
- Best value period identification
- Historical price comparison

### 👥 Crowd Estimation

- Google Trends integration for tourist demand analysis
- Peak season identification
- Crowd level normalization and scoring

### 🗺️ Interactive Map Interface

- Beautiful Mapbox GL integration
- Smooth city animations and transitions
- Real-time destination selection
- 40+ pre-configured popular destinations worldwide

### 📊 Data Visualization

- Interactive charts using Chart.js and React-Chartjs-2
- Line charts for trend analysis
- Bar charts for comparative data
- Pie charts for distribution visualization
- Bubble charts for multi-dimensional data

### 🎨 Modern UI/UX

- Dark/Light theme with system preference detection
- Responsive design for mobile and desktop
- Smooth animations with Framer Motion
- Accessible components using Radix UI
- Beautiful toast notifications with Sonner

---

## 📁 Project Structure

```
mockhack1/
├── trippai/                    # Frontend (Next.js 15)
│   ├── app/                    # App router pages
│   │   ├── page.tsx           # Home page with map & predictions
│   │   ├── charts/            # Chart showcase page
│   │   ├── forms/             # Form examples page
│   │   └── user/              # User profile page
│   ├── components/            # React components
│   │   ├── charts/            # Chart components
│   │   ├── forms/             # Form field components
│   │   ├── home/              # Home page components
│   │   ├── navbar/            # Navigation components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   └── public/                # Static assets
│
├── trippai_ai/                # Backend (FastAPI + ML)
│   ├── main.py               # FastAPI application
│   ├── travel_model.py       # Core ML model
│   ├── forecast_model.py     # Prophet forecasting
│   ├── weather_service.py    # Weather API integration
│   ├── price_service.py      # Price generation logic
│   ├── crowd_service.py      # Google Trends integration
│   ├── config.py             # Configuration & constants
│   ├── requirements.txt      # Python dependencies
│   └── models/               # Saved predictions (JSON)
│
└── models/                    # Shared model outputs
    └── output_barcelona.json
```

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

### Basic Workflow

1. **Select Destination**: Choose from 40+ popular cities or type to search
2. **Configure Trip**: Set trip duration (1-30 days) and forecast period (1-104 weeks)
3. **Get Predictions**: Click "Find Best Time" to analyze travel data
4. **View Results**:
   - Best travel dates
   - Expected weather conditions
   - Price estimates
   - Crowd levels
   - Overall TravelScore (0-100)
   - AI-generated explanation

### API Usage

**Endpoint**: `POST /api/predict`

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

**Response**:

```json
{
  "destination": "Paris",
  "origin_city": "London",
  "coordinates": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "best_start_date": "2025-05-15",
  "best_end_date": "2025-05-22",
  "predicted_price": 1450.50,
  "price_breakdown": {
    "hotel": 700.00,
    "flight": 750.50,
    "total": 1450.50,
    "per_person": 725.25
  },
  "predicted_temp": 18.3,
  "predicted_precipitation": 2.1,
  "predicted_crowd": 65.0,
  "travel_score": 82.5,
  "explanation": "May offers ideal conditions with pleasant weather...",
  "confidence": 0.85,
  "data_source": "real_api",
  "forecast_data": [...]
}
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

Main prediction endpoint

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
- `confidence`: Prediction confidence (0-1)
- `data_source`: "real_api" or "synthetic"
- `forecast_data`: Array of weekly predictions

---

## 🧠 How It Works

### 1. Data Collection

- **Weather**: Fetches historical and forecast data from Open-Meteo API
- **Prices**:
  - **Real Mode**: Fetches actual prices from Booking.com API via RapidAPI
  - **Synthetic Mode**: Generates synthetic prices with realistic seasonal patterns
- **Crowds**: Scrapes Google Trends for destination search interest

### 2. Feature Engineering

- **Weather Comfort**: Scores based on ideal temperature range (15-25°C) and low precipitation
- **Price Score**: Normalized inverse score (lower price = higher score)
- **Crowd Score**: Normalized inverse score (lower crowds = higher score)

### 3. Real Price Integration

When `use_real_prices=true`:

1. API fetches actual hotel prices from booking platforms
2. API searches for flight prices between origin and destination
3. Calculates total trip cost with breakdown
4. Falls back to synthetic data if API fails or rate limit reached

### 3. Time-Series Forecasting

- Uses Facebook Prophet to forecast:
  - Temperature trends
  - Precipitation patterns
  - Price fluctuations
  - Crowd levels
- Handles seasonality, holidays, and weekly patterns
- Provides confidence intervals

### 4. TravelScore Calculation

```python
TravelScore = (
  weather_score × 0.40 +  # 40% weight
  price_score × 0.30 +     # 30% weight
  crowd_score × 0.30       # 30% weight
) × 100
```

### 5. Optimal Period Selection

- Ranks all periods by TravelScore
- Considers trip duration for continuity
- Returns best consecutive days

### 6. AI Explanation (Optional)

- Sends prediction data to GPT-4o-mini
- Generates natural language explanation
- Includes actionable travel tips

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

#### 1. **Real Flight Price Integration**

- Connect to Skyscanner, Kayak, or Google Flights API
- Real-time price tracking and alerts
- Multi-airline comparison
- Price history and trend analysis

#### 2. **Hotel Booking Integration**

- Booking.com or Expedia API integration
- Price comparison across platforms
- Availability checking
- User reviews and ratings display

#### 3. **User Authentication & Profiles**

- Firebase or Appwrite authentication (already in dependencies)
- Save favorite destinations
- Travel history and preferences
- Personalized recommendations

#### 4. **Trip Saved & Wishlist**

- Save predicted trips
- Create travel wishlists
- Share trips with friends
- Export to calendar (Google Calendar, iCal)

#### 5. **Price Alerts & Notifications**

- Email/SMS notifications for price drops
- Best time alerts when TravelScore improves
- Last-minute deal notifications
- Push notifications via PWA

### 🌟 Advanced Features

#### 6. **Multi-City Itinerary Planner**

- Plan trips across multiple destinations
- Optimize route and timing
- Calculate total costs
- Suggest optimal order of cities

#### 7. **Budget Constraints**

- Set budget limits
- Find destinations within budget
- Budget breakdown (flights, hotels, food, activities)
- Currency conversion

#### 8. **Activity & Attraction Integration**

- TripAdvisor or Google Places API
- Things to do at destination
- Event calendar (festivals, concerts, sports)
- Restaurant recommendations
- Local experiences

#### 9. **Travel Restrictions & Visa Info**

- Visa requirements by passport
- COVID-19 restrictions (if applicable)
- Entry requirements
- Travel advisories and safety alerts

#### 10. **Social Features**

- Travel community/forum
- Share trip experiences
- Photo uploads and albums
- Travel blogs and reviews
- Friend recommendations

#### 11. **Advanced Weather Features**

- Air quality index
- UV index
- Sunrise/sunset times
- Best time of day for activities
- Historical weather comparison
- Weather-based activity suggestions

#### 12. **Transportation Options**

- Train alternatives (for Europe, Asia)
- Bus routes and prices
- Car rental options
- Local transportation info
- Carbon footprint comparison

#### 13. **Accommodation Variety**

- Airbnb integration
- Hostel options
- Vacation rentals
- Luxury vs budget options
- Neighborhood recommendations

#### 14. **Packing List Generator**

- AI-generated packing lists based on weather
- Trip duration considerations
- Activity-specific items
- Checklist functionality

#### 15. **Travel Insurance**

- Compare insurance providers
- Coverage recommendations
- Direct purchase integration
- Claims assistance

### 📱 Mobile & UX Enhancements

#### 16. **Mobile App**

- React Native or Flutter app
- Offline mode for saved trips
- GPS integration
- Mobile-first features

#### 17. **Progressive Web App (PWA)**

- Installable web app
- Offline functionality
- Push notifications
- App-like experience

#### 18. **Voice Interface**

- Voice search for destinations
- Voice-controlled navigation
- Accessibility features

#### 19. **AR/VR Features**

- Virtual destination tours
- 360° city previews
- AR navigation

### 📊 Analytics & Business Features

#### 20. **Travel Analytics Dashboard**

- Personal travel statistics
- Carbon footprint tracking
- Money saved through predictions
- Travel trends

#### 21. **Group Travel Planning**

- Collaborate with friends
- Poll for destinations
- Shared budget management
- Split costs calculator

#### 22. **Travel Agency Portal**

- B2B API for travel agencies
- White-label solution
- Commission tracking
- Client management

#### 23. **Premium Features / Monetization**

- Subscription tiers (Free, Pro, Enterprise)
- Ad-free experience
- Advanced analytics
- Priority support
- Unlimited predictions

### 🔧 Technical Improvements

#### 24. **Performance Optimizations**

- Cache predictions
- Redis for session management
- CDN for static assets
- Database optimization (PostgreSQL/MongoDB)

#### 25. **More ML Models**

- LSTM networks for price prediction
- Ensemble models for better accuracy
- Transfer learning from larger datasets
- Real-time model retraining

#### 26. **API Rate Limiting & Security**

- JWT authentication
- Rate limiting with Redis
- API key management
- HTTPS enforcement

#### 27. **Testing & CI/CD**

- Unit tests (Jest, Pytest)
- Integration tests
- E2E tests (Playwright)
- GitHub Actions CI/CD pipeline
- Automated deployments

#### 28. **Internationalization (i18n)**

- Multi-language support
- Currency localization
- Date/time format localization
- RTL language support

#### 29. **Accessibility (A11y)**

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode

#### 30. **Developer Features**

- Public API with documentation
- Webhook support
- GraphQL API option
- SDK for popular languages

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
