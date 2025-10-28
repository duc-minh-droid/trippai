"""Prophet-based forecasting service for travel predictions."""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Optional
from prophet import Prophet

from services.weather_service import WeatherService
from services.price_service import PriceService
from services.crowd_service import CrowdService


class ForecastService:
    """
    Advanced forecasting model using Facebook Prophet.
    
    Forecasts future values for:
    - Flight/hotel prices
    - Weather patterns (temperature, precipitation)
    - Crowd levels (tourist demand)
    
    Then computes a TravelScore to find optimal travel windows.
    """
    
    def __init__(self):
        """Initialize all services."""
        self.weather_service = WeatherService()
        self.price_service = PriceService()
        self.crowd_service = CrowdService()
    
    def prepare_data(
        self,
        destination: str,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Fetch and merge all data sources, then aggregate weekly.
        
        Args:
            destination: Destination name
            start_date: Start date for historical data
            end_date: End date for historical data
        
        Returns:
            Weekly aggregated DataFrame with all features
        """
        print(f"Preparing data for {destination}...")
        
        # Fetch weather data
        print("Fetching weather data...")
        weather_df = self.weather_service.get_weather_for_destination(
            destination, start_date, end_date
        )
        
        # Generate price data
        print("Generating price data...")
        price_df = self.price_service.generate_price_data(start_date, end_date)
        
        # Fetch crowd data
        print("Fetching crowd data...")
        crowd_df = self.crowd_service.get_search_interest(destination, start_date, end_date)
        
        # Merge all data
        df_all = self._merge_data(weather_df, price_df, crowd_df)
        
        # Convert to weekly averages
        df_weekly = self._aggregate_weekly(df_all)
        
        print(f"Data prepared: {len(df_weekly)} weeks of data")
        return df_weekly
    
    def _merge_data(
        self,
        weather_df: pd.DataFrame,
        price_df: pd.DataFrame,
        crowd_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Clean and merge the data from all sources.
        
        Aligns everything on date and handles missing values.
        """
        print(f"\nMerging data sources:")
        print(f"  - Price data: {len(price_df)} days")
        print(f"  - Weather data: {len(weather_df)} days")
        print(f"  - Crowd data: {len(crowd_df)} days")
        
        # Start with price data (has consistent daily range)
        df_all = price_df[["date", "avg_price"]].copy()
        
        # Merge weather data
        if not weather_df.empty and "date" in weather_df.columns:
            df_all = df_all.merge(
                weather_df[["date", "temp_avg", "precipitation"]],
                on="date",
                how="left"
            )
        else:
            # If no weather data, fill with defaults
            df_all["temp_avg"] = 20.0
            df_all["precipitation"] = 0.0
            print("⚠️  Using default weather values due to missing data")
        
        # Merge crowd data
        if not crowd_df.empty and "date" in crowd_df.columns:
            df_all = df_all.merge(
                crowd_df[["date", "crowd_level"]],
                on="date",
                how="left"
            )
        else:
            # If no crowd data, fill with default medium crowd level
            df_all["crowd_level"] = 50.0
            print("⚠️  Using default crowd level (50) due to missing data")
        
        # Fill any remaining missing values
        df_all = df_all.ffill().bfill()
        
        # If still have NaN values, fill with defaults
        df_all["temp_avg"] = df_all["temp_avg"].fillna(20.0)
        df_all["precipitation"] = df_all["precipitation"].fillna(0.0)
        df_all["crowd_level"] = df_all["crowd_level"].fillna(50.0)
        
        print(f"  - Merged data: {len(df_all)} days")
        
        return df_all
    
    def _aggregate_weekly(self, daily_df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert daily data to weekly averages.
        
        Args:
            daily_df: DataFrame with daily data
        
        Returns:
            DataFrame with weekly aggregated data
        """
        df = daily_df.copy()
        df["date"] = pd.to_datetime(df["date"])
        
        # Set date as index for resampling
        df = df.set_index("date")
        
        # Resample to weekly (W = week ending on Sunday)
        df_weekly = df.resample("W").agg({
            "avg_price": "mean",
            "temp_avg": "mean",
            "precipitation": "sum",
            "crowd_level": "mean"
        }).reset_index()
        
        # Remove rows with NaN values
        df_weekly = df_weekly.dropna()
        
        # Rename crowd_level to crowd_index for consistency with the prompt
        df_weekly = df_weekly.rename(columns={"crowd_level": "crowd_index"})
        
        # Validate we have enough data
        if len(df_weekly) < 2:
            print(f"\n⚠️  WARNING: Only {len(df_weekly)} weeks of historical data available.")
            print("    Prophet requires at least 2 data points to train.")
            print("    Using extended synthetic data to meet minimum requirements.\n")
            # Generate at least 8 weeks of synthetic historical data to train Prophet
            if len(df_weekly) == 0:
                # Create a baseline week from the daily data means
                baseline_week = pd.DataFrame({
                    "date": [daily_df["date"].min()],
                    "avg_price": [daily_df["avg_price"].mean()],
                    "temp_avg": [daily_df["temp_avg"].mean()],
                    "precipitation": [daily_df["precipitation"].sum()],
                    "crowd_index": [daily_df["crowd_level"].mean()]
                })
                df_weekly = baseline_week
            
            # Generate additional synthetic weeks to meet minimum requirement
            while len(df_weekly) < 8:
                last_date = df_weekly["date"].iloc[-1]
                next_date = last_date + timedelta(weeks=1)
                
                # Create slightly varied synthetic data
                import numpy as np
                new_row = df_weekly.iloc[-1].copy()
                new_row["date"] = next_date
                new_row["avg_price"] += np.random.uniform(-50, 50)
                new_row["temp_avg"] += np.random.uniform(-2, 2)
                new_row["precipitation"] += np.random.uniform(-5, 5)
                new_row["crowd_index"] += np.random.uniform(-10, 10)
                
                df_weekly = pd.concat([df_weekly, pd.DataFrame([new_row])], ignore_index=True)
            
            print(f"✓ Extended to {len(df_weekly)} weeks of data for training")
        
        elif len(df_weekly) < 8:
            print(f"\n⚠️  WARNING: Only {len(df_weekly)} weeks of historical data available.")
            print("    Prophet works best with 8+ weeks (2+ months) of data.")
            print("    Predictions may be less accurate with limited historical data.")
            print("    Consider using a longer historical period if possible.\n")
        
        return df_weekly
    
    def train_forecast_models(
        self,
        df_weekly: pd.DataFrame,
        forecast_weeks: int = 52
    ) -> Tuple[pd.DataFrame, dict]:
        """
        Build Prophet forecasting models for each time series.
        
        Args:
            df_weekly: Weekly aggregated historical data
            forecast_weeks: Number of weeks to forecast into the future
        
        Returns:
            Tuple of (merged forecast DataFrame, dict of trained models)
        """
        print("\nTraining forecasting models...")
        
        # a) Flight price forecast
        print("Training price model...")
        price_df = df_weekly[["date", "avg_price"]].rename(
            columns={"date": "ds", "avg_price": "y"}
        )
        model_price = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode='multiplicative'
        )
        model_price.fit(price_df)
        
        future_price = model_price.make_future_dataframe(periods=forecast_weeks, freq="W")
        forecast_price = model_price.predict(future_price)
        
        # b) Temperature forecast
        print("Training temperature model...")
        temp_df = df_weekly[["date", "temp_avg"]].rename(
            columns={"date": "ds", "temp_avg": "y"}
        )
        model_temp = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
        model_temp.fit(temp_df)
        
        future_temp = model_temp.make_future_dataframe(periods=forecast_weeks, freq="W")
        forecast_temp = model_temp.predict(future_temp)
        
        # c) Precipitation forecast
        print("Training precipitation model...")
        precip_df = df_weekly[["date", "precipitation"]].rename(
            columns={"date": "ds", "precipitation": "y"}
        )
        model_precip = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
        model_precip.fit(precip_df)
        
        future_precip = model_precip.make_future_dataframe(periods=forecast_weeks, freq="W")
        forecast_precip = model_precip.predict(future_precip)
        
        # d) Crowd forecast
        print("Training crowd model...")
        crowd_df = df_weekly[["date", "crowd_index"]].rename(
            columns={"date": "ds", "crowd_index": "y"}
        )
        model_crowd = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
        model_crowd.fit(crowd_df)
        
        future_crowd = model_crowd.make_future_dataframe(periods=forecast_weeks, freq="W")
        forecast_crowd = model_crowd.predict(future_crowd)
        
        # Merge all forecasts
        print("Merging forecasts...")
        merged = self._merge_forecasts(
            forecast_price, forecast_temp, forecast_precip, forecast_crowd
        )
        
        models = {
            "price": model_price,
            "temperature": model_temp,
            "precipitation": model_precip,
            "crowd": model_crowd
        }
        
        print(f"Forecasting complete: {len(merged)} weeks predicted")
        return merged, models
    
    def _merge_forecasts(
        self,
        forecast_price: pd.DataFrame,
        forecast_temp: pd.DataFrame,
        forecast_precip: pd.DataFrame,
        forecast_crowd: pd.DataFrame
    ) -> pd.DataFrame:
        """Merge forecasts from all models by date."""
        # Start with price forecast
        merged = forecast_price[["ds", "yhat"]].copy()
        merged = merged.rename(columns={"yhat": "price_hat"})
        
        # Merge temperature
        merged = merged.merge(
            forecast_temp[["ds", "yhat"]].rename(columns={"yhat": "temp_hat"}),
            on="ds"
        )
        
        # Merge precipitation
        merged = merged.merge(
            forecast_precip[["ds", "yhat"]].rename(columns={"yhat": "precip_hat"}),
            on="ds"
        )
        
        # Merge crowd
        merged = merged.merge(
            forecast_crowd[["ds", "yhat"]].rename(columns={"yhat": "crowd_hat"}),
            on="ds"
        )
        
        # Apply bounds checking and validation
        merged = self._apply_bounds_validation(merged)
        
        return merged
    
    def _apply_bounds_validation(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply realistic bounds to forecast values to prevent unrealistic predictions.
        
        Args:
            df: DataFrame with forecast predictions
            
        Returns:
            DataFrame with validated and bounded values
        """
        df = df.copy()
        
        # Price bounds (in USD)
        # Reasonable flight/hotel prices: $100 - $2000
        df["price_hat"] = df["price_hat"].clip(lower=100, upper=2000)
        
        # Temperature bounds (in Celsius)
        # Reasonable travel temperatures: -20°C to 45°C
        df["temp_hat"] = df["temp_hat"].clip(lower=-20, upper=45)
        
        # Precipitation bounds (in mm per week)
        # Reasonable weekly precipitation: 0mm to 200mm
        df["precip_hat"] = df["precip_hat"].clip(lower=0, upper=200)
        
        # Crowd level bounds
        # Normalized to 0-100 scale
        df["crowd_hat"] = df["crowd_hat"].clip(lower=0, upper=100)
        
        return df
    
    def calculate_travel_scores(
        self,
        forecast_df: pd.DataFrame,
        ideal_temp: float = 22.0,
        temp_tolerance: float = 15.0
    ) -> pd.DataFrame:
        """
        Create scoring metrics and compute TravelScore.
        
        Args:
            forecast_df: Merged forecast DataFrame
            ideal_temp: Ideal temperature in Celsius
            temp_tolerance: Temperature range for scoring
        
        Returns:
            DataFrame with normalized scores and final TravelScore
        """
        df = forecast_df.copy()
        
        print(f"\nCalculating travel scores:")
        print(f"  - Price range: ${df['price_hat'].min():.2f} to ${df['price_hat'].max():.2f}")
        print(f"  - Temp range: {df['temp_hat'].min():.1f}°C to {df['temp_hat'].max():.1f}°C")
        print(f"  - Crowd range: {df['crowd_hat'].min():.1f} to {df['crowd_hat'].max():.1f}")
        
        # Normalize price score (lower price = higher score)
        price_min = df["price_hat"].min()
        price_max = df["price_hat"].max()
        price_range = price_max - price_min
        
        if price_range > 0.01:  # Avoid division by zero
            df["price_score"] = (price_max - df["price_hat"]) / price_range
            df["price_score"] = df["price_score"].clip(0, 1) * 100
        else:
            print("  ⚠️  Price range is too small, using neutral score (50)")
            df["price_score"] = 50.0
        
        # Normalize crowd score (lower crowd = higher score)
        crowd_min = df["crowd_hat"].min()
        crowd_max = df["crowd_hat"].max()
        crowd_range = crowd_max - crowd_min
        
        if crowd_range > 0.01:  # Avoid division by zero
            df["crowd_score"] = (crowd_max - df["crowd_hat"]) / crowd_range
            df["crowd_score"] = df["crowd_score"].clip(0, 1) * 100
        else:
            print("  ⚠️  Crowd range is too small, using neutral score (50)")
            df["crowd_score"] = 50.0
        
        # Weather score (ideal temp ~22°C)
        df["weather_score"] = 1 - np.abs(df["temp_hat"] - ideal_temp) / temp_tolerance
        df["weather_score"] = df["weather_score"].clip(0, 1) * 100
        
        # Precipitation penalty (more rain = lower score)
        # Normalize precipitation impact
        if df["precip_hat"].max() > 0:
            precip_normalized = df["precip_hat"] / df["precip_hat"].max()
            df["precip_penalty"] = (1 - precip_normalized) * 20  # Up to 20 point penalty
        else:
            df["precip_penalty"] = 0
        
        # Adjust weather score by precipitation
        df["weather_score"] = (df["weather_score"] - df["precip_penalty"]).clip(0, 100)
        
        # Compute final TravelScore (weighted average)
        df["travel_score"] = (
            0.40 * df["price_score"] +
            0.30 * df["weather_score"] +
            0.30 * df["crowd_score"]
        )
        
        # Check for NaN values
        nan_count = df["travel_score"].isna().sum()
        if nan_count > 0:
            print(f"  ⚠️  Warning: {nan_count} rows have NaN travel_score")
            # Fill NaN with a neutral score
            df["travel_score"] = df["travel_score"].fillna(50.0)
        
        print(f"  ✓ Travel scores calculated (range: {df['travel_score'].min():.1f} to {df['travel_score'].max():.1f})")
        
        # Rename ds to date for consistency
        df = df.rename(columns={"ds": "date"})
        
        return df
    
    def find_best_travel_window(
        self,
        scored_df: pd.DataFrame,
        trip_days: int = 7,
        future_only: bool = True,
        max_budget: Optional[float] = None
    ) -> Tuple[pd.DataFrame, dict]:
        """
        Find the best travel window accounting for trip length and budget.
        
        Args:
            scored_df: DataFrame with travel scores
            trip_days: Length of trip in days
            future_only: Only consider future dates
            max_budget: Maximum budget constraint (optional)
        
        Returns:
            Tuple of (full scored DataFrame, best window info dict)
        """
        df = scored_df.copy()
        
        print(f"\nFinding best travel window (trip_days={trip_days}, future_only={future_only}, max_budget={max_budget}):")
        print(f"  - Input DataFrame has {len(df)} weeks")
        print(f"  - Columns: {df.columns.tolist()}")
        
        # Filter to future dates only if requested
        if future_only:
            today = pd.Timestamp.now()
            df = df[df["date"] >= today].copy()
            print(f"  - After filtering to future dates: {len(df)} weeks")
        
        if df.empty:
            print("⚠️  Error: No future dates available in forecast")
            return df, {"error": "No future dates available"}
        
        # Apply budget filter if specified
        if max_budget is not None and "price_hat" in df.columns:
            df_before_filter = len(df)
            df = df[df["price_hat"] <= max_budget].copy()
            print(f"  - After filtering by budget (≤${max_budget}): {len(df)} weeks (removed {df_before_filter - len(df)})")
            
            if df.empty:
                print(f"⚠️  Error: No periods found within budget of ${max_budget}")
                return scored_df, {
                    "error": f"No periods found within budget of ${max_budget}",
                    "min_price": float(scored_df["price_hat"].min()) if "price_hat" in scored_df.columns else None
                }
        
        # Check for NaN values in key columns
        print(f"  - NaN counts: travel_score={df['travel_score'].isna().sum()}, "
              f"price_hat={df.get('price_hat', pd.Series([np.nan])).isna().sum()}")
        
        # Calculate rolling average over trip window (in weeks)
        weeks_window = max(1, trip_days // 7)
        df["rolling_score"] = df["travel_score"].rolling(
            window=weeks_window,
            min_periods=1,
            center=False
        ).mean()
        
        # Remove any NaN values from rolling score
        df_valid = df.dropna(subset=["rolling_score"])
        
        if df_valid.empty or df_valid["rolling_score"].isna().all():
            # Fallback to using travel_score directly if rolling_score is all NaN
            print("⚠️  Warning: No valid rolling scores, using travel_score directly")
            df["rolling_score"] = df["travel_score"]
            df_valid = df[df["travel_score"].notna()].copy()
            print(f"  - Valid rows with travel_score: {len(df_valid)}")
        
        if df_valid.empty:
            print("⚠️  Error: No valid scores available after filtering")
            print(f"  - DataFrame sample:\n{df.head()}")
            return df, {"error": "No valid scores available"}
        
        # Find best window
        try:
            if "rolling_score" in df_valid.columns and df_valid["rolling_score"].notna().any():
                best_idx = df_valid["rolling_score"].idxmax()
            else:
                best_idx = df_valid["travel_score"].idxmax()
            
            best_row = df_valid.loc[best_idx]
        except Exception as e:
            print(f"⚠️  Error finding best window: {e}")
            # Try to use the first valid row
            best_row = df_valid.iloc[0]
        
        # Use rolling_score if available, otherwise fall back to travel_score
        final_score = best_row.get("rolling_score", best_row.get("travel_score", 0))
        if pd.isna(final_score):
            final_score = best_row.get("travel_score", 0)
        
        best_window = {
            "best_week": best_row["date"],
            "travel_score": round(float(final_score), 2),
            "price": round(float(best_row["price_hat"]), 2),
            "temperature": round(float(best_row["temp_hat"]), 1),
            "precipitation": round(float(best_row["precip_hat"]), 1),
            "crowd_level": round(float(best_row["crowd_hat"]), 1),
            "price_score": round(float(best_row["price_score"]), 1),
            "weather_score": round(float(best_row["weather_score"]), 1),
            "crowd_score": round(float(best_row["crowd_score"]), 1),
            "trip_days": trip_days
        }
        
        # Sort by rolling score or travel score for easy viewing
        sort_column = "rolling_score" if "rolling_score" in df.columns and df["rolling_score"].notna().any() else "travel_score"
        df = df.sort_values(sort_column, ascending=False, na_position='last').reset_index(drop=True)
        
        return df, best_window
    
    def predict_optimal_travel_time(
        self,
        destination: str,
        historical_start: datetime,
        historical_end: datetime,
        forecast_weeks: int = 52,
        trip_days: int = 7,
        max_budget: Optional[float] = None
    ) -> Tuple[pd.DataFrame, dict]:
        """
        Full pipeline: prepare data, train models, forecast, score, and find best window.
        
        Args:
            destination: Destination name
            historical_start: Start of historical data period
            historical_end: End of historical data period
            forecast_weeks: Number of weeks to forecast ahead
            trip_days: Trip length in days
            max_budget: Maximum budget constraint (optional)
        
        Returns:
            Tuple of (predictions DataFrame, best window dict)
        """
        print("=" * 80)
        print("PROPHET FORECASTING MODEL - OPTIMAL TRAVEL TIME PREDICTION")
        print("=" * 80)
        
        # Step 1: Prepare data
        df_weekly = self.prepare_data(destination, historical_start, historical_end)
        
        # Step 2: Train models and forecast
        forecast_df, models = self.train_forecast_models(df_weekly, forecast_weeks)
        
        # Step 3: Calculate scores
        scored_df = self.calculate_travel_scores(forecast_df)
        
        # Step 4: Find best window
        predictions, best_window = self.find_best_travel_window(
            scored_df,
            trip_days=trip_days,
            future_only=True,
            max_budget=max_budget
        )
        
        print("\n" + "=" * 80)
        print("PREDICTION COMPLETE")
        print("=" * 80)
        
        return predictions, best_window
