"""Event Service for fetching major events and festivals from Eventbrite API."""

import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class EventService:
    """
    Service for fetching events/festivals that affect travel prices and crowds.
    
    Uses Eventbrite API to find major events happening during trip dates.
    Events can significantly impact:
    - Hotel prices (higher during major events)
    - Crowd levels (festivals attract tourists)
    - Travel recommendations
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the event service.
        
        Args:
            api_key: Eventbrite API key (optional, not used - always uses mock data)
        """
        self.api_key = None  # Not using API, always use mock data
        self.base_url = "https://www.eventbriteapi.com/v3"
        self.available = False  # Always use mock data
        
        logger.info("✓ Event Service initialized with comprehensive mock data")
    
    def get_events_for_trip(
        self,
        city: str,
        start_date: str,
        end_date: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 5
    ) -> Dict:
        """
        Get major events happening during a trip to a city.
        
        Args:
            city: City name
            start_date: Trip start date (YYYY-MM-DD)
            end_date: Trip end date (YYYY-MM-DD)
            lat: Latitude (optional, for more accurate search)
            lon: Longitude (optional, for more accurate search)
            limit: Maximum number of events to return
        
        Returns:
            Dictionary with:
            - events: List of event details
            - has_major_events: Boolean indicating if major events found
            - impact: Impact level (low/medium/high)
            - warning: Warning message if applicable
        """
        # Always use mock data for consistent, rich responses
        return self._get_mock_events(city, start_date, end_date)
    
    def _fetch_events_from_api(
        self,
        city: str,
        start_date: str,
        end_date: str,
        lat: Optional[float],
        lon: Optional[float],
        limit: int
    ) -> List[Dict]:
        """Fetch events from Eventbrite API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # Build search parameters
        params = {
            "location.address": city,
            "start_date.range_start": f"{start_date}T00:00:00",
            "start_date.range_end": f"{end_date}T23:59:59",
            "expand": "venue,ticket_availability",
            "categories": "103,105,110,113",  # Festivals, Music, Food & Drink, Performing Arts
            "sort_by": "best"
        }
        
        # Add coordinates if available for more accurate search
        if lat is not None and lon is not None:
            params["location.latitude"] = lat
            params["location.longitude"] = lon
            params["location.within"] = "50km"
        
        try:
            logger.info(f"Fetching events from Eventbrite API for {city} ({start_date} to {end_date})")
            response = requests.get(
                f"{self.base_url}/events/search/",
                headers=headers,
                params=params,
                timeout=10
            )
            
            logger.info(f"Eventbrite API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.warning(f"Eventbrite API returned status {response.status_code}: {response.text[:200]}")
                return []
            
            data = response.json()
            logger.info(f"Eventbrite returned {len(data.get('events', []))} events")
            events = []
            
            for event in data.get("events", [])[:limit]:
                events.append({
                    "name": event.get("name", {}).get("text", "Unknown Event"),
                    "description": event.get("description", {}).get("text", "")[:200] + "...",
                    "start_date": event.get("start", {}).get("local", ""),
                    "end_date": event.get("end", {}).get("local", ""),
                    "category": self._get_category_name(event.get("category_id")),
                    "url": event.get("url", ""),
                    "is_free": event.get("is_free", False),
                    "venue": event.get("venue", {}).get("name", city)
                })
            
            logger.info(f"Found {len(events)} events in {city} from {start_date} to {end_date}")
            return events
            
        except Exception as e:
            logger.error(f"Error calling Eventbrite API: {e}")
            return []
    
    def _get_category_name(self, category_id: Optional[str]) -> str:
        """Map Eventbrite category ID to readable name."""
        categories = {
            "103": "Music",
            "105": "Performing Arts",
            "110": "Food & Drink",
            "113": "Festival"
        }
        return categories.get(str(category_id), "Event")
    
    def _calculate_event_impact(self, events: List[Dict]) -> str:
        """
        Calculate the impact level of events on travel.
        
        Returns:
            "low", "medium", or "high"
        """
        if not events:
            return "low"
        
        # Check for major festivals/events (keywords in name)
        major_keywords = [
            "fashion week", "festival", "olympics", "world cup", 
            "championship", "expo", "marathon", "conference",
            "summit", "awards", "carnival", "pride"
        ]
        
        major_event_count = 0
        for event in events:
            name_lower = event["name"].lower()
            if any(keyword in name_lower for keyword in major_keywords):
                major_event_count += 1
        
        if major_event_count >= 2 or len(events) >= 4:
            return "high"
        elif major_event_count >= 1 or len(events) >= 2:
            return "medium"
        else:
            return "low"
    
    def _get_crowd_multiplier(self, impact: str) -> float:
        """
        Get crowd score multiplier based on event impact.
        
        Args:
            impact: Impact level (low/medium/high)
        
        Returns:
            Multiplier to apply to crowd score (1.0 = no change)
        """
        multipliers = {
            "low": 1.0,
            "medium": 1.3,  # 30% increase in crowds
            "high": 1.6     # 60% increase in crowds
        }
        return multipliers.get(impact, 1.0)
    
    def _generate_event_warning(
        self,
        city: str,
        events: List[Dict],
        start_date: str,
        end_date: str
    ) -> Optional[str]:
        """Generate a warning message about events affecting the trip."""
        if not events:
            return None
        
        # Find the most significant event
        major_keywords = ["fashion week", "festival", "olympics", "world cup"]
        major_event = None
        
        for event in events:
            name_lower = event["name"].lower()
            if any(keyword in name_lower for keyword in major_keywords):
                major_event = event
                break
        
        if major_event:
            event_name = major_event["name"]
            return f"Your trip overlaps with {event_name} — expect higher hotel prices and larger crowds."
        
        if len(events) >= 3:
            return f"Multiple events are happening in {city} during your trip — expect increased prices and crowds."
        
        return f"{len(events)} event(s) happening during your trip may affect local crowds."
    
    def _generate_event_suggestions(self, events: List[Dict]) -> List[str]:
        """Generate suggestions for events the user might want to attend."""
        suggestions = []
        
        for event in events[:3]:  # Top 3 events
            event_name = event["name"]
            category = event["category"]
            is_free = event["is_free"]
            
            if is_free:
                suggestions.append(f"Consider attending {event_name} (Free {category} event)")
            else:
                suggestions.append(f"Check out {event_name} ({category} event)")
        
        return suggestions
    
    def _get_mock_events(
        self,
        city: str,
        start_date: str,
        end_date: str
    ) -> Dict:
        """
        Generate mock event data with comprehensive coverage for major cities.
        
        This provides realistic example data for demos and development.
        """
        # Parse dates to determine season
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            city_lower = city.lower()
            
            # Comprehensive mock events database for major cities
            mock_events_db = {
                "paris": [
                    {
                        "name": "Paris Fashion Week",
                        "description": "The world's premier fashion event showcasing the latest collections from top designers. A must-see for fashion enthusiasts from around the globe.",
                        "start_date": "2026-03-01",
                        "end_date": "2026-03-09",
                        "category": "Fashion",
                        "url": "https://fhcm.paris/en/",
                        "is_free": False,
                        "venue": "Various venues, Paris",
                        "months": [3, 9]
                    },
                    {
                        "name": "Fête de la Musique",
                        "description": "Free music festival held throughout Paris on the summer solstice. Streets filled with live performances from all genres.",
                        "start_date": "2026-06-21",
                        "end_date": "2026-06-21",
                        "category": "Music Festival",
                        "url": "https://fetedelamusique.culture.gouv.fr/",
                        "is_free": True,
                        "venue": "Citywide, Paris",
                        "months": [6]
                    },
                    {
                        "name": "Nuit Blanche",
                        "description": "All-night contemporary art festival with installations and performances across the city.",
                        "start_date": "2026-10-03",
                        "end_date": "2026-10-04",
                        "category": "Art Festival",
                        "url": "https://nuitblanche.paris.fr/",
                        "is_free": True,
                        "venue": "Citywide, Paris",
                        "months": [10]
                    },
                    {
                        "name": "Paris Marathon",
                        "description": "One of Europe's most iconic marathons, attracting over 60,000 runners through the scenic streets of Paris.",
                        "start_date": "2026-04-05",
                        "end_date": "2026-04-05",
                        "category": "Sports Event",
                        "url": "https://www.schneiderelectricparismarathon.com/",
                        "is_free": True,
                        "venue": "Paris city streets",
                        "months": [4]
                    }
                ],
                "barcelona": [
                    {
                        "name": "Primavera Sound Festival",
                        "description": "One of Europe's largest music festivals featuring top international acts across multiple stages.",
                        "start_date": "2026-05-28",
                        "end_date": "2026-06-01",
                        "category": "Music Festival",
                        "url": "https://www.primaverasound.com/",
                        "is_free": False,
                        "venue": "Parc del Fòrum, Barcelona",
                        "months": [5, 6]
                    },
                    {
                        "name": "La Mercè Festival",
                        "description": "Barcelona's biggest street festival with parades, concerts, fireworks, and the famous human towers (castells).",
                        "start_date": "2026-09-24",
                        "end_date": "2026-09-27",
                        "category": "Festival",
                        "url": "https://www.barcelona.cat/lamerce/",
                        "is_free": True,
                        "venue": "Citywide, Barcelona",
                        "months": [9]
                    },
                    {
                        "name": "Sónar Festival",
                        "description": "International festival of advanced music and new media art, showcasing electronic music and digital culture.",
                        "start_date": "2026-06-18",
                        "end_date": "2026-06-20",
                        "category": "Music Festival",
                        "url": "https://sonar.es/",
                        "is_free": False,
                        "venue": "Fira Barcelona, Barcelona",
                        "months": [6]
                    },
                    {
                        "name": "Sant Jordi Festival",
                        "description": "Catalonia's version of Valentine's Day - streets filled with book and rose stalls, street performances.",
                        "start_date": "2026-04-23",
                        "end_date": "2026-04-23",
                        "category": "Cultural Festival",
                        "url": "https://www.barcelona.cat/",
                        "is_free": True,
                        "venue": "Citywide, Barcelona",
                        "months": [4]
                    }
                ],
                "london": [
                    {
                        "name": "Notting Hill Carnival",
                        "description": "Europe's largest street festival celebrating Caribbean culture with vibrant parades, music, and food.",
                        "start_date": "2026-08-30",
                        "end_date": "2026-08-31",
                        "category": "Festival",
                        "url": "https://nhcarnival.org/",
                        "is_free": True,
                        "venue": "Notting Hill, London",
                        "months": [8]
                    },
                    {
                        "name": "London Fashion Week",
                        "description": "One of the 'Big Four' fashion weeks, showcasing British and international designers.",
                        "start_date": "2026-02-20",
                        "end_date": "2026-02-24",
                        "category": "Fashion",
                        "url": "https://londonfashionweek.co.uk/",
                        "is_free": False,
                        "venue": "Various venues, London",
                        "months": [2, 9]
                    },
                    {
                        "name": "Wimbledon Championships",
                        "description": "The world's most prestigious tennis tournament and oldest Grand Slam event.",
                        "start_date": "2026-06-29",
                        "end_date": "2026-07-12",
                        "category": "Sports Event",
                        "url": "https://www.wimbledon.com/",
                        "is_free": False,
                        "venue": "All England Club, London",
                        "months": [6, 7]
                    },
                    {
                        "name": "New Year's Day Parade",
                        "description": "Spectacular parade through central London featuring performers from around the world.",
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-01",
                        "category": "Parade",
                        "url": "https://lnydp.com/",
                        "is_free": True,
                        "venue": "Central London",
                        "months": [1]
                    }
                ],
                "new york": [
                    {
                        "name": "New York Fashion Week",
                        "description": "Showcasing the latest collections from top American and international designers.",
                        "start_date": "2026-02-10",
                        "end_date": "2026-02-17",
                        "category": "Fashion",
                        "url": "https://nyfw.com/",
                        "is_free": False,
                        "venue": "Various venues, NYC",
                        "months": [2, 9]
                    },
                    {
                        "name": "Governors Ball Music Festival",
                        "description": "NYC's premier music festival featuring rock, hip-hop, electronic, and more.",
                        "start_date": "2026-06-05",
                        "end_date": "2026-06-07",
                        "category": "Music Festival",
                        "url": "https://governorsballmusicfestival.com/",
                        "is_free": False,
                        "venue": "Randall's Island Park, NYC",
                        "months": [6]
                    },
                    {
                        "name": "US Open Tennis",
                        "description": "The final Grand Slam tennis tournament of the year, featuring the world's top players.",
                        "start_date": "2026-08-31",
                        "end_date": "2026-09-13",
                        "category": "Sports Event",
                        "url": "https://www.usopen.org/",
                        "is_free": False,
                        "venue": "USTA Billie Jean King National Tennis Center",
                        "months": [8, 9]
                    },
                    {
                        "name": "Thanksgiving Day Parade",
                        "description": "Macy's iconic parade featuring giant balloons, floats, and performances.",
                        "start_date": "2026-11-26",
                        "end_date": "2026-11-26",
                        "category": "Parade",
                        "url": "https://www.macys.com/parade",
                        "is_free": True,
                        "venue": "Manhattan, NYC",
                        "months": [11]
                    }
                ],
                "tokyo": [
                    {
                        "name": "Tokyo Marathon",
                        "description": "One of the World Marathon Majors, attracting elite runners and thousands of participants.",
                        "start_date": "2026-03-01",
                        "end_date": "2026-03-01",
                        "category": "Sports Event",
                        "url": "https://www.marathon.tokyo/",
                        "is_free": True,
                        "venue": "Tokyo city streets",
                        "months": [3]
                    },
                    {
                        "name": "Cherry Blossom Festival",
                        "description": "Celebrate hanami (flower viewing) with traditional performances and food stalls under blooming sakura.",
                        "start_date": "2026-03-25",
                        "end_date": "2026-04-10",
                        "category": "Cultural Festival",
                        "url": "https://www.gotokyo.org/",
                        "is_free": True,
                        "venue": "Various parks, Tokyo",
                        "months": [3, 4]
                    },
                    {
                        "name": "Sumida River Fireworks Festival",
                        "description": "One of Tokyo's largest fireworks displays with over 20,000 fireworks lighting up the night sky.",
                        "start_date": "2026-07-25",
                        "end_date": "2026-07-25",
                        "category": "Festival",
                        "url": "https://www.sumidagawa-hanabi.com/",
                        "is_free": True,
                        "venue": "Sumida River, Tokyo",
                        "months": [7]
                    },
                    {
                        "name": "Tokyo Game Show",
                        "description": "Asia's largest video game expo featuring the latest games, consoles, and gaming technology.",
                        "start_date": "2026-09-24",
                        "end_date": "2026-09-27",
                        "category": "Convention",
                        "url": "https://tgs.nikkeibp.co.jp/",
                        "is_free": False,
                        "venue": "Makuhari Messe, Chiba",
                        "months": [9]
                    }
                ],
                "rome": [
                    {
                        "name": "Rome Marathon",
                        "description": "Run through 2,000 years of history past iconic landmarks like the Colosseum and Vatican.",
                        "start_date": "2026-03-22",
                        "end_date": "2026-03-22",
                        "category": "Sports Event",
                        "url": "https://www.maratonadiroma.it/",
                        "is_free": True,
                        "venue": "Rome city streets",
                        "months": [3]
                    },
                    {
                        "name": "Easter Week Celebrations",
                        "description": "Special masses and ceremonies at the Vatican, including the Pope's Easter Sunday address.",
                        "start_date": "2026-04-05",
                        "end_date": "2026-04-12",
                        "category": "Religious Festival",
                        "url": "https://www.vatican.va/",
                        "is_free": True,
                        "venue": "Vatican City & Rome",
                        "months": [3, 4]
                    },
                    {
                        "name": "Estate Romana",
                        "description": "Summer-long cultural festival with concerts, cinema, dance, and theater across the city.",
                        "start_date": "2026-06-15",
                        "end_date": "2026-09-15",
                        "category": "Cultural Festival",
                        "url": "https://www.estateromana.comune.roma.it/",
                        "is_free": True,
                        "venue": "Various locations, Rome",
                        "months": [6, 7, 8, 9]
                    }
                ],
                "amsterdam": [
                    {
                        "name": "King's Day",
                        "description": "Netherlands' biggest party! Streets turn orange with markets, music, and celebrations.",
                        "start_date": "2026-04-27",
                        "end_date": "2026-04-27",
                        "category": "Festival",
                        "url": "https://www.iamsterdam.com/en/see-and-do/whats-on/kings-day",
                        "is_free": True,
                        "venue": "Citywide, Amsterdam",
                        "months": [4]
                    },
                    {
                        "name": "Amsterdam Dance Event",
                        "description": "World's largest electronic music conference and festival with 1,000+ events.",
                        "start_date": "2026-10-14",
                        "end_date": "2026-10-18",
                        "category": "Music Festival",
                        "url": "https://www.amsterdam-dance-event.nl/",
                        "is_free": False,
                        "venue": "Various venues, Amsterdam",
                        "months": [10]
                    },
                    {
                        "name": "Pride Amsterdam",
                        "description": "One of the world's most famous Pride celebrations featuring the iconic canal parade.",
                        "start_date": "2026-07-30",
                        "end_date": "2026-08-02",
                        "category": "Festival",
                        "url": "https://pride.amsterdam/",
                        "is_free": True,
                        "venue": "Citywide, Amsterdam",
                        "months": [7, 8]
                    }
                ],
                "berlin": [
                    {
                        "name": "Berlinale Film Festival",
                        "description": "One of the world's leading film festivals showcasing international cinema.",
                        "start_date": "2026-02-11",
                        "end_date": "2026-02-21",
                        "category": "Film Festival",
                        "url": "https://www.berlinale.de/",
                        "is_free": False,
                        "venue": "Various venues, Berlin",
                        "months": [2]
                    },
                    {
                        "name": "Berlin Marathon",
                        "description": "World record course! The fastest marathon in the world through Berlin's historic streets.",
                        "start_date": "2026-09-27",
                        "end_date": "2026-09-27",
                        "category": "Sports Event",
                        "url": "https://www.bmw-berlin-marathon.com/",
                        "is_free": True,
                        "venue": "Berlin city streets",
                        "months": [9]
                    },
                    {
                        "name": "Festival of Lights",
                        "description": "Historic landmarks illuminated with spectacular light installations and projections.",
                        "start_date": "2026-10-09",
                        "end_date": "2026-10-18",
                        "category": "Art Festival",
                        "url": "https://festival-of-lights.de/",
                        "is_free": True,
                        "venue": "Citywide, Berlin",
                        "months": [10]
                    }
                ],
                "sydney": [
                    {
                        "name": "Sydney Festival",
                        "description": "Summer arts festival featuring theater, music, dance, and circus performances.",
                        "start_date": "2026-01-07",
                        "end_date": "2026-01-26",
                        "category": "Cultural Festival",
                        "url": "https://www.sydneyfestival.org.au/",
                        "is_free": False,
                        "venue": "Various venues, Sydney",
                        "months": [1]
                    },
                    {
                        "name": "Vivid Sydney",
                        "description": "World's largest festival of light, music, and ideas with stunning light projections.",
                        "start_date": "2026-05-22",
                        "end_date": "2026-06-13",
                        "category": "Art Festival",
                        "url": "https://www.vividsydney.com/",
                        "is_free": True,
                        "venue": "Sydney Harbour & CBD",
                        "months": [5, 6]
                    },
                    {
                        "name": "Sydney Gay and Lesbian Mardi Gras",
                        "description": "One of the world's largest LGBTQ+ celebrations with a spectacular parade.",
                        "start_date": "2026-02-28",
                        "end_date": "2026-02-28",
                        "category": "Parade",
                        "url": "https://www.mardigras.org.au/",
                        "is_free": True,
                        "venue": "Oxford Street, Sydney",
                        "months": [2, 3]
                    }
                ],
                "dubai": [
                    {
                        "name": "Dubai Shopping Festival",
                        "description": "Month-long shopping extravaganza with discounts, entertainment, and fireworks.",
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-31",
                        "category": "Festival",
                        "url": "https://www.mydsf.ae/",
                        "is_free": True,
                        "venue": "Citywide, Dubai",
                        "months": [1]
                    },
                    {
                        "name": "Dubai World Cup",
                        "description": "World's richest horse race with over $30 million in prize money.",
                        "start_date": "2026-03-28",
                        "end_date": "2026-03-28",
                        "category": "Sports Event",
                        "url": "https://www.dubairacingclub.com/",
                        "is_free": False,
                        "venue": "Meydan Racecourse, Dubai",
                        "months": [3]
                    },
                    {
                        "name": "Dubai Jazz Festival",
                        "description": "International music festival featuring world-renowned jazz and contemporary artists.",
                        "start_date": "2026-02-25",
                        "end_date": "2026-02-27",
                        "category": "Music Festival",
                        "url": "https://dubaijazzfest.com/",
                        "is_free": False,
                        "venue": "Dubai Media City, Dubai",
                        "months": [2]
                    }
                ],
                "singapore": [
                    {
                        "name": "Singapore Grand Prix",
                        "description": "Formula 1's only night race on the streets of Singapore's Marina Bay.",
                        "start_date": "2026-09-18",
                        "end_date": "2026-09-20",
                        "category": "Sports Event",
                        "url": "https://www.singaporegp.sg/",
                        "is_free": False,
                        "venue": "Marina Bay Street Circuit",
                        "months": [9]
                    },
                    {
                        "name": "Chinese New Year Festival",
                        "description": "Vibrant celebrations in Chinatown with street markets, performances, and decorations.",
                        "start_date": "2026-01-29",
                        "end_date": "2026-02-12",
                        "category": "Cultural Festival",
                        "url": "https://www.chinatown.sg/",
                        "is_free": True,
                        "venue": "Chinatown, Singapore",
                        "months": [1, 2]
                    },
                    {
                        "name": "Singapore Food Festival",
                        "description": "Celebrate Singapore's diverse culinary heritage with food trails and dining events.",
                        "start_date": "2026-07-10",
                        "end_date": "2026-07-26",
                        "category": "Food Festival",
                        "url": "https://www.singaporefoodfestival.sg/",
                        "is_free": False,
                        "venue": "Various locations, Singapore",
                        "months": [7]
                    }
                ]
            }
            
            # Get events for this city
            city_events = mock_events_db.get(city_lower, [])
            
            # Filter events that might occur during the trip dates
            relevant_events = []
            for event in city_events:
                if start.month in event.get("months", []):
                    relevant_events.append({
                        "name": event["name"],
                        "description": event["description"],
                        "start_date": event["start_date"],
                        "end_date": event["end_date"],
                        "category": event["category"],
                        "url": event["url"],
                        "is_free": event["is_free"],
                        "venue": event["venue"]
                    })
            
            # If we found events, return them
            if relevant_events:
                impact = self._calculate_event_impact(relevant_events)
                warning = self._generate_event_warning(city, relevant_events, start_date, end_date)
                
                return {
                    "events": relevant_events,
                    "has_major_events": True,
                    "impact": impact,
                    "warning": warning,
                    "crowd_multiplier": self._get_crowd_multiplier(impact),
                    "suggestions": self._generate_event_suggestions(relevant_events)
                }
            
            # If no events found for this specific month, return generic events for the city
            if city_events:
                # Return up to 2 events from the city regardless of month
                generic_events = city_events[:2]
                formatted_events = [{
                    "name": event["name"],
                    "description": event["description"],
                    "start_date": event["start_date"],
                    "end_date": event["end_date"],
                    "category": event["category"],
                    "url": event["url"],
                    "is_free": event["is_free"],
                    "venue": event["venue"]
                } for event in generic_events]
                
                return {
                    "events": formatted_events,
                    "has_major_events": False,
                    "impact": "low",
                    "warning": f"No major events during your exact dates, but {city} hosts great events throughout the year!",
                    "crowd_multiplier": 1.0,
                    "suggestions": [f"Consider attending {event['name']}" for event in formatted_events]
                }
            
        except Exception as e:
            logger.error(f"Error generating mock events: {e}")
        
        # Fallback for cities not in database - return general travel events
        return {
            "events": [
                {
                    "name": f"{city} Cultural Festival",
                    "description": f"Experience local culture, cuisine, and traditions in {city}.",
                    "start_date": start_date,
                    "end_date": end_date,
                    "category": "Cultural Event",
                    "url": "#",
                    "is_free": True,
                    "venue": f"Various locations, {city}"
                },
                {
                    "name": f"{city} Food Market",
                    "description": f"Explore local flavors and culinary delights at {city}'s vibrant food markets.",
                    "start_date": start_date,
                    "end_date": end_date,
                    "category": "Food & Drink",
                    "url": "#",
                    "is_free": True,
                    "venue": f"City center, {city}"
                }
            ],
            "has_major_events": False,
            "impact": "low",
            "warning": None,
            "crowd_multiplier": 1.0,
            "suggestions": [
                f"Explore local markets and cultural sites in {city}",
                f"Try authentic local cuisine during your visit"
            ]
        }
