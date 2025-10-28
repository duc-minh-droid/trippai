"""Service for fetching weather data from Open-Meteo API."""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import pandas as pd
from config import OPEN_METEO_API, IDEAL_TEMPERATURE, TEMPERATURE_TOLERANCE


class WeatherService:
    """Fetch and process weather data from Open-Meteo API."""
    
    def __init__(self):
        self.api_url = OPEN_METEO_API
        self.archive_api_url = "https://archive-api.open-meteo.com/v1/archive"
    
    def get_coordinates(self, destination: str) -> Tuple[float, float]:
        """
        Get latitude and longitude for a destination.
        In production, use a geocoding service. For now, using a simple mapping.
        """
        # Simple coordinate mapping (expand this in production)
        coordinates = {
            "paris": (48.8566, 2.3522),
            "tokyo": (35.6762, 139.6503),
            "new york": (40.7128, -74.0060),
            "london": (51.5074, -0.1278),
            "barcelona": (41.3851, 2.1734),
            "bali": (-8.3405, 115.0920),
            "dubai": (25.2048, 55.2708),
            "sydney": (-33.8688, 151.2093),
            "rome": (41.9028, 12.4964),
            "bangkok": (13.7563, 100.5018),
        }
        
        dest_lower = destination.lower()
        if dest_lower in coordinates:
            return coordinates[dest_lower]
        
        # Default to Paris if destination not found
        print(f"Warning: Coordinates for '{destination}' not found. Using Paris as default.")
        return coordinates["paris"]
    
    def fetch_weather_data(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: datetime, 
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Fetch weather data from Open-Meteo API for the given date range.
        Uses Archive API for historical data and Forecast API for future data.
        Falls back to synthetic data if API calls fail.
        """
        today = datetime.now()
        today_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        
        all_data = []
        
        # Split date range into historical and forecast parts
        # Historical data: up to 5 days ago (Archive API needs a buffer)
        historical_end = min(end_date, today_date - timedelta(days=5))
        forecast_start = max(start_date, today_date)
        
        # Fetch historical data (if needed)
        if start_date < (today_date - timedelta(days=5)) and historical_end >= start_date:
            print(f"Fetching historical weather data from {start_date.date()} to {historical_end.date()}...")
            historical_df = self._fetch_historical_weather(
                latitude, longitude, start_date, historical_end
            )
            if not historical_df.empty:
                all_data.append(historical_df)
                print(f"✓ Retrieved {len(historical_df)} days of historical data")
            else:
                print("⚠️  Historical weather API returned no data, using synthetic data")
                # Generate synthetic for this period
                historical_df = self._generate_synthetic_weather(
                    latitude, longitude, start_date, historical_end
                )
                all_data.append(historical_df)
        
        # Fill the gap between historical and forecast with synthetic data
        gap_start = historical_end + timedelta(days=1) if start_date < (today_date - timedelta(days=5)) else start_date
        gap_end = forecast_start - timedelta(days=1)
        
        if gap_start <= gap_end and gap_end >= start_date:
            print(f"Generating synthetic data for gap period: {gap_start.date()} to {gap_end.date()}...")
            gap_df = self._generate_synthetic_weather(
                latitude, longitude, gap_start, gap_end
            )
            all_data.append(gap_df)
        
        # Fetch forecast data (if needed)
        if end_date >= today_date and forecast_start <= end_date:
            # Forecast API typically supports up to 16 days ahead
            max_forecast_date = today_date + timedelta(days=15)
            forecast_end = min(end_date, max_forecast_date)
            
            if forecast_start <= forecast_end:
                print(f"Fetching forecast weather data from {forecast_start.date()} to {forecast_end.date()}...")
                forecast_df = self._fetch_forecast_weather(
                    latitude, longitude, forecast_start, forecast_end
                )
                if not forecast_df.empty:
                    all_data.append(forecast_df)
                    print(f"✓ Retrieved {len(forecast_df)} days of forecast data")
                else:
                    print("⚠️  Forecast weather API returned no data, using synthetic data")
                    forecast_df = self._generate_synthetic_weather(
                        latitude, longitude, forecast_start, forecast_end
                    )
                    all_data.append(forecast_df)
            
            # Generate synthetic data for dates beyond forecast range
            if end_date > max_forecast_date:
                synthetic_start = max(forecast_start, max_forecast_date + timedelta(days=1))
                print(f"Generating synthetic weather data for future dates: {synthetic_start.date()} to {end_date.date()}...")
                synthetic_df = self._generate_synthetic_weather(
                    latitude, longitude, synthetic_start, end_date
                )
                all_data.append(synthetic_df)
        
        # Combine all data
        if all_data:
            df = pd.concat(all_data, ignore_index=True)
            df = df.sort_values("date").reset_index(drop=True)
            return df
        else:
            # Fallback to fully synthetic data
            print("No API data available. Using synthetic weather data based on historical patterns.")
            return self._generate_synthetic_weather(latitude, longitude, start_date, end_date)
    
    def _fetch_historical_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Fetch historical weather data from Open-Meteo Archive API.
        Archive API provides historical data from 1940 to a few days ago.
        """
        # Ensure dates are not too recent for archive API
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        max_archive_date = today - timedelta(days=5)
        
        if end_date > max_archive_date:
            print(f"⚠️  Archive API only supports data up to {max_archive_date.date()}")
            end_date = max_archive_date
        
        if start_date > end_date:
            print(f"⚠️  Start date is after adjusted end date, no historical data available")
            return pd.DataFrame()
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "windspeed_10m_max",
                "cloudcover_mean"
            ],
            "timezone": "auto"
        }
        
        try:
            response = requests.get(self.archive_api_url, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"⚠️  Archive API error (status {response.status_code}): {response.text[:200]}")
                return pd.DataFrame()
                
            response.raise_for_status()
            data = response.json()
            
            # Parse the response
            daily_data = data.get("daily", {})
            
            if not daily_data or "time" not in daily_data:
                print("⚠️  Archive API returned no daily data")
                return pd.DataFrame()
            
            df = pd.DataFrame({
                "date": pd.to_datetime(daily_data["time"]),
                "temp_max": daily_data["temperature_2m_max"],
                "temp_min": daily_data["temperature_2m_min"],
                "precipitation": daily_data["precipitation_sum"],
                "wind_speed": daily_data["windspeed_10m_max"],
                "cloud_cover": daily_data["cloudcover_mean"]
            })
            
            # Calculate average temperature
            df["temp_avg"] = (df["temp_max"] + df["temp_min"]) / 2
            
            return df
            
        except requests.RequestException as e:
            print(f"⚠️  Error fetching historical weather data: {e}")
            return pd.DataFrame()
    
    def _fetch_forecast_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Fetch forecast weather data from Open-Meteo Forecast API.
        Forecast API typically provides data for the next 16 days.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "windspeed_10m_max",
                "cloudcover_mean"
            ],
            "timezone": "auto"
        }
        
        try:
            response = requests.get(self.api_url, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"⚠️  Forecast API error (status {response.status_code}): {response.text[:200]}")
                return pd.DataFrame()
                
            response.raise_for_status()
            data = response.json()
            
            # Parse the response
            daily_data = data.get("daily", {})
            
            if not daily_data or "time" not in daily_data:
                print("⚠️  Forecast API returned no daily data")
                return pd.DataFrame()
            
            df = pd.DataFrame({
                "date": pd.to_datetime(daily_data["time"]),
                "temp_max": daily_data["temperature_2m_max"],
                "temp_min": daily_data["temperature_2m_min"],
                "precipitation": daily_data["precipitation_sum"],
                "wind_speed": daily_data["windspeed_10m_max"],
                "cloud_cover": daily_data["cloudcover_mean"]
            })
            
            # Calculate average temperature
            df["temp_avg"] = (df["temp_max"] + df["temp_min"]) / 2
            
            return df
            
        except requests.RequestException as e:
            print(f"⚠️  Error fetching forecast weather data: {e}")
            return pd.DataFrame()
    
    def _generate_synthetic_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Generate synthetic weather data based on location and season.
        Uses realistic seasonal patterns appropriate for the latitude.
        
        For well-known cities, uses actual climate data patterns.
        """
        import numpy as np
        
        date_rng = pd.date_range(start_date, end_date, freq="D")
        day_of_year = date_rng.dayofyear
        
        # Check if we have specific climate data for this location
        city_climate = self._get_city_climate(latitude, longitude)
        
        if city_climate:
            # Use city-specific climate patterns
            base_temp = city_climate["base_temp"]
            temp_amplitude = city_climate["temp_amplitude"]
            temp_phase = city_climate["temp_phase"]
            precip_pattern = city_climate["precip_pattern"]
        else:
            # Generic climate based on latitude
            base_temp = 25 - abs(latitude) * 0.4
            temp_amplitude = 10
            # Northern hemisphere: peak around day 200, Southern: peak around day 20
            temp_phase = 80 if latitude >= 0 else 260
            precip_pattern = "uniform"
        
        # Seasonal temperature variation (sine wave)
        seasonal_temp = temp_amplitude * np.sin(2 * np.pi * (day_of_year - temp_phase) / 365)
        temp_avg = base_temp + seasonal_temp + np.random.normal(0, 2, len(date_rng))
        temp_max = temp_avg + np.random.uniform(3, 8, len(date_rng))
        temp_min = temp_avg - np.random.uniform(3, 8, len(date_rng))
        
        # Precipitation patterns
        if precip_pattern == "mediterranean":
            # Dry summers, wet winters (like Barcelona)
            precip_base = 2 + 5 * np.cos(2 * np.pi * (day_of_year - 15) / 365)
            precipitation = np.maximum(0, precip_base + np.random.exponential(1.5, len(date_rng)))
        elif precip_pattern == "tropical":
            # Wet summers, dry winters
            precip_base = 3 + 6 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
            precipitation = np.maximum(0, precip_base + np.random.exponential(2.5, len(date_rng)))
        else:
            # Uniform throughout year
            precip_base = 2 + 3 * np.sin(2 * np.pi * day_of_year / 365)
            precipitation = np.maximum(0, precip_base + np.random.exponential(2, len(date_rng)))
        
        # Wind speed (slightly higher in winter for many locations)
        wind_speed = 10 + 3 * np.sin(2 * np.pi * (day_of_year - 15) / 365) + np.random.uniform(0, 5, len(date_rng))
        
        # Cloud cover (higher in winter for many locations)
        cloud_cover = 45 + 15 * np.sin(2 * np.pi * (day_of_year - 15) / 365) + np.random.uniform(-15, 15, len(date_rng))
        cloud_cover = np.clip(cloud_cover, 0, 100)
        
        df = pd.DataFrame({
            "date": date_rng,
            "temp_max": temp_max,
            "temp_min": temp_min,
            "temp_avg": temp_avg,
            "precipitation": precipitation,
            "wind_speed": wind_speed,
            "cloud_cover": cloud_cover
        })
        
        return df
    
    def _get_city_climate(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Get specific climate patterns for well-known cities.
        Returns None if no specific data available.
        """
        # Define climate patterns for major cities
        # Format: (lat_range, lon_range): climate_data
        
        # Barcelona climate (Mediterranean)
        if 41.3 <= latitude <= 41.5 and 2.0 <= longitude <= 2.3:
            return {
                "base_temp": 17.5,  # Annual average around 17.5°C
                "temp_amplitude": 8.5,  # Seasonal variation
                "temp_phase": 200,  # Peak in summer (July-August)
                "precip_pattern": "mediterranean"  # Dry summers, wet autumns
            }
        
        # Paris climate (Oceanic)
        if 48.7 <= latitude <= 48.9 and 2.2 <= longitude <= 2.5:
            return {
                "base_temp": 12.5,
                "temp_amplitude": 9,
                "temp_phase": 200,
                "precip_pattern": "uniform"
            }
        
        # Tokyo climate (Humid subtropical)
        if 35.5 <= latitude <= 35.8 and 139.5 <= longitude <= 139.8:
            return {
                "base_temp": 16.5,
                "temp_amplitude": 12,
                "temp_phase": 200,
                "precip_pattern": "tropical"
            }
        
        # London climate (Oceanic)
        if 51.4 <= latitude <= 51.6 and -0.2 <= longitude <= 0.1:
            return {
                "base_temp": 11.5,
                "temp_amplitude": 8,
                "temp_phase": 200,
                "precip_pattern": "uniform"
            }
        
        # Add more cities as needed...
        
        return None
    
    def calculate_weather_comfort(self, weather_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate weather comfort score (0-100) based on various weather factors.
        Higher score = better weather conditions.
        """
        df = weather_df.copy()
        
        # Temperature comfort (0-100)
        # Best around IDEAL_TEMPERATURE, decreases as it moves away
        temp_diff = abs(df["temp_avg"] - IDEAL_TEMPERATURE)
        temp_score = 100 * (1 - (temp_diff / TEMPERATURE_TOLERANCE).clip(0, 1))
        
        # Precipitation discomfort (0-100, lower precipitation is better)
        # Normalize precipitation (assuming max 50mm is very bad)
        precip_score = 100 * (1 - (df["precipitation"] / 50).clip(0, 1))
        
        # Cloud cover score (0-100, less clouds is better)
        cloud_score = 100 - df["cloud_cover"]
        
        # Wind speed score (0-100, moderate wind is okay, too much is bad)
        # Assuming wind > 30 km/h is uncomfortable
        wind_score = 100 * (1 - (df["wind_speed"] / 30).clip(0, 1))
        
        # Weighted average for overall weather comfort
        df["weather_comfort"] = (
            0.4 * temp_score +
            0.3 * precip_score +
            0.2 * cloud_score +
            0.1 * wind_score
        )
        
        return df
    
    def get_weather_for_destination(
        self, 
        destination: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Get weather data and comfort scores for a destination.
        """
        lat, lon = self.get_coordinates(destination)
        weather_df = self.fetch_weather_data(lat, lon, start_date, end_date)
        
        if weather_df.empty:
            return pd.DataFrame()
        
        return self.calculate_weather_comfort(weather_df)
