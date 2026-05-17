/**
 * Flight Service with SerpAPI Integration
 * Uses SerpAPI Google Flights for real flight data
 * Falls back to mock data if API is unavailable
 */

require('dotenv').config();

// SerpAPI configuration
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';
const USE_REAL_API = SERPAPI_API_KEY && SERPAPI_API_KEY !== 'your_serpapi_api_key';

/**
 * Mock flight database (fallback when API is unavailable)
 */
const MOCK_FLIGHTS_DB = {
  routes: {
    'IN-AT': [
      {
        airline: 'Austrian Airlines',
        flightNumber: 'OS202',
        basePrice: 650,
        duration: 8.5,
        layovers: 0,
        departureTime: '10:30',
        arrivalTime: '14:00',
        aircraft: 'Boeing 777'
      },
      {
        airline: 'Lufthansa',
        flightNumber: 'LH756',
        basePrice: 580,
        duration: 10.5,
        layovers: 1,
        departureTime: '08:15',
        arrivalTime: '15:45',
        aircraft: 'Airbus A320',
        layoverCity: 'Frankfurt'
      },
      {
        airline: 'Emirates',
        flightNumber: 'EK123',
        basePrice: 720,
        duration: 12.0,
        layovers: 1,
        departureTime: '02:30',
        arrivalTime: '11:30',
        aircraft: 'Airbus A380',
        layoverCity: 'Dubai'
      },
      {
        airline: 'Turkish Airlines',
        flightNumber: 'TK716',
        basePrice: 550,
        duration: 11.5,
        layovers: 1,
        departureTime: '23:45',
        arrivalTime: '08:15',
        aircraft: 'Boeing 737',
        layoverCity: 'Istanbul'
      },
      {
        airline: 'Qatar Airways',
        flightNumber: 'QR234',
        basePrice: 690,
        duration: 11.0,
        layovers: 1,
        departureTime: '03:00',
        arrivalTime: '11:00',
        aircraft: 'Boeing 787',
        layoverCity: 'Doha'
      }
    ]
  }
};

/**
 * Country code to airport/city mapping for SerpAPI
 */
const COUNTRY_TO_LOCATION = {
  'IN': 'DEL', // Delhi
  'AT': 'VIE', // Vienna
  'US': 'JFK', // New York (All airports)
  'GB': 'LHR', // London (All airports)
  'FR': 'CDG', // Paris (All airports)
  'DE': 'FRA', // Frankfurt
  'IT': 'FCO', // Rome
  'ES': 'MAD', // Madrid
  'JP': 'NRT', // Tokyo (All airports)
  'CN': 'PEK', // Beijing
  'CA': 'YYZ', // Toronto (All airports)
  'AU': 'SYD', // Sydney
  'AE': 'DST', // Dubai
  'SG': 'SIN', // Singapore
  'TH': 'BKK', // Bangkok
  'MY': 'KUL', // Kuala Lumpur
  'ID': 'CGK', // Jakarta
  'PH': 'MNL', // Manila
  'VN': 'SGN', // Ho Chi Minh City
  'KR': 'ICN', // Seoul
  'TR': 'IST', // Istanbul
  'CH': 'ZRH', // Zurich
  'NL': 'AMS', // Amsterdam
  'BE': 'BRU', // Brussels
  'SE': 'ARN', // Stockholm
  'NO': 'OSL', // Oslo
  'DK': 'CPH', // Copenhagen
  'FI': 'HEL', // Helsinki
  'IE': 'DUB', // Dublin
  'PT': 'TND', // Lisbon
  'GR': 'ATH', // Athens
  'EG': 'CCE', // Cairo
  'ZA': 'JNB', // Johannesburg
  'BR': 'GRU', // São Paulo
  'MX': 'MEX', // Mexico City
  'AR': 'EZE', // Buenos Aires
  'CL': 'SCL', // Santiago
  'NZ': 'AKL'  // Auckland
};

/**
 * Convert country code to location string for SerpAPI
 */
function getLocationString(countryCode) {
  return COUNTRY_TO_LOCATION[countryCode.toUpperCase()] || countryCode.toUpperCase();
}

/**
 * Parse date string in DD/MM/YYYY or MM/DD/YYYY format to YYYY-MM-DD
 */
function parseDateToISO(dateStr) {
  const parts = dateStr.split('/');
  
  // Handle DD/MM/YYYY format (day first)
  if (parts.length === 3) {
    const [first, second, year] = parts;
    
    // Check if it's DD/MM/YYYY (day > 12 or month <= 12)
    const firstNum = parseInt(first, 10);
    const secondNum = parseInt(second, 10);
    
    // If first part is > 12, it must be day (DD/MM/YYYY)
    // If second part is > 12, first must be month (MM/DD/YYYY)
    let day, month;
    
    if (firstNum > 12) {
      // DD/MM/YYYY format
      day = first;
      month = second;
    } else if (secondNum > 12) {
      // MM/DD/YYYY format
      month = first;
      day = second;
    } else {
      // Ambiguous - assume DD/MM/YYYY (European format)
      day = second;
      month = first;
    }
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Fallback
  return dateStr;
}

/**
 * Calculate duration in hours from departure and arrival times
 */
function calculateDuration(departureTime, arrivalTime) {
  // Simple calculation - in real scenario would need to handle date changes
  const [depHour, depMin] = departureTime.split(':').map(Number);
  const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
  
  let hours = arrHour - depHour;
  let minutes = arrMin - depMin;
  
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  
  if (hours < 0) {
    hours += 24; // Handle overnight flights
  }
  
  return hours + (minutes / 60);
}

/**
 * Search flights using SerpAPI Google Flights
 * @param {string} origin - Origin country code
 * @param {string} destination - Destination country code
 * @param {Object} dates - Travel dates
 * @param {Object} preferences - User preferences
 * @returns {Promise<Array>} Array of flight objects
 */
async function searchFlightsSerpAPI(origin, destination, dates, preferences = {}) {
  try {
    const originLocation = getLocationString(origin);
    const destLocation = getLocationString(destination);
    const outboundDate = parseDateToISO(dates.departureDate);
    const returnDate = parseDateToISO(dates.returnDate);

    console.log(`\n🔍 Calling SerpAPI Google Flights...`);
    console.log(`   Route: ${originLocation} → ${destLocation}`);
    console.log(`   Dates: ${outboundDate} to ${returnDate}`);

    // Build SerpAPI query parameters
    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id: originLocation,
      arrival_id: destLocation,
      outbound_date: outboundDate,
      return_date: returnDate,
      currency: 'USD',
      hl: 'en',
      api_key: SERPAPI_API_KEY
    });

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;
    console.log(`************************URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️  SerpAPI error: ${response.status}`);
      throw new Error(`SerpAPI returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✓ SerpAPI response received`);

    // Check for errors in response
    if (data.error) {
      throw new Error(data.error);
    }

    // Transform SerpAPI data to our format
    const flights = transformSerpAPIData(data, origin, destination);
    
    if (flights.length === 0) {
      console.warn(`⚠️  No flights found in SerpAPI response`);
      throw new Error('No flights found');
    }

    console.log(`✓ Found ${flights.length} flights from SerpAPI`);
    return flights;

  } catch (error) {
    console.error(`❌ SerpAPI error:`, error.message);
    throw error;
  }
}

/**
 * Transform SerpAPI response to our flight format
 */
function transformSerpAPIData(data, origin, destination) {
  const flights = [];

  // SerpAPI returns best_flights and other_flights
  const allFlights = [
    ...(data.best_flights || []),
    ...(data.other_flights || [])
  ];

  if (allFlights.length === 0) {
    return flights;
  }

  allFlights.forEach((flight, index) => {
    // Get first flight segment for details
    const firstFlight = flight.flights && flight.flights[0];
    if (!firstFlight) return;

    // Extract airline information
    const airline = firstFlight.airline || 'Unknown Airline';
    const flightNumber = firstFlight.flight_number || `FL${100 + index}`;

    // Extract times
    const departureTime = firstFlight.departure_airport?.time || '00:00';
    const arrivalTime = firstFlight.arrival_airport?.time || '00:00';

    // Calculate duration
    const durationMinutes = flight.total_duration || 600; // Default 10 hours
    const duration = Math.round((durationMinutes / 60) * 10) / 10;

    // Count layovers
    const layovers = (flight.flights?.length || 1) - 1;
    
    // Get layover cities
    let layoverCity;
    if (layovers > 0 && flight.flights && flight.flights.length > 1) {
      const layoverAirports = flight.flights
        .slice(0, -1)
        .map(f => f.arrival_airport?.name || f.arrival_airport?.id)
        .filter(Boolean);
      layoverCity = layoverAirports.join(', ');
    }

    // Extract price
    const price = flight.price || 500;

    // Get aircraft type (if available)
    const aircraft = firstFlight.airplane || 'Various';

    // Build booking URL
    const bookingToken = flight.booking_token || '';
    const bookingUrl = bookingToken 
      ? `https://www.google.com/travel/flights/booking?token=${bookingToken}`
      : `https://www.google.com/travel/flights`;

    flights.push({
      airline: airline,
      flightNumber: flightNumber,
      price: Math.round(price),
      duration: duration,
      layovers: layovers,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      aircraft: aircraft,
      layoverCity: layoverCity,
      bookingUrl: bookingUrl,
      origin: origin,
      destination: destination,
      searchDate: new Date().toISOString(),
      direct: layovers === 0,
      carbonEmissions: flight.carbon_emissions?.this_flight || null,
      extensions: flight.extensions || []
    });
  });

  return flights;
}

/**
 * Search flights using mock data (fallback)
 */
function searchFlightsMock(origin, destination, dates, preferences = {}) {
  console.log(`\n📦 Using mock flight data (SerpAPI not configured)`);
  
  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
  let flights = MOCK_FLIGHTS_DB.routes[routeKey] || generateGenericFlights(origin, destination);
  
  // Calculate dynamic prices
  flights = flights.map(flight => ({
    ...flight,
    price: calculateDynamicPrice(flight.basePrice, dates, preferences),
    bookingUrl: generateBookingUrl(flight, origin, destination),
    origin,
    destination,
    searchDate: new Date().toISOString()
  }));

  return flights;
}

/**
 * Calculate dynamic price based on dates and preferences
 */
function calculateDynamicPrice(basePrice, dates, preferences) {
  let price = basePrice;
  
  const departureDate = parseDateString(dates.departureDate);
  const month = departureDate.getMonth();
  
  // Peak season (June-August, December): +20%
  if ([5, 6, 7, 11].includes(month)) {
    price *= 1.2;
  }
  // Off-season (January-March): -15%
  else if ([0, 1, 2].includes(month)) {
    price *= 0.85;
  }
  
  // Add random variation (±10%)
  const variation = 0.9 + (Math.random() * 0.2);
  price *= variation;
  
  return Math.round(price);
}

/**
 * Parse date string in DD/MM/YYYY format
 */
function parseDateString(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Generate booking URL for a flight
 */
function generateBookingUrl(flight, origin, destination) {
  const baseUrls = {
    'Austrian Airlines': 'https://www.austrian.com/booking',
    'Lufthansa': 'https://www.lufthansa.com/booking',
    'Emirates': 'https://www.emirates.com/booking',
    'Turkish Airlines': 'https://www.turkishairlines.com/booking',
    'Qatar Airways': 'https://www.qatarairways.com/booking'
  };
  
  const baseUrl = baseUrls[flight.airline] || 'https://www.google.com/travel/flights';
  return `${baseUrl}?flight=${flight.flightNumber}&from=${origin}&to=${destination}`;
}

/**
 * Generate generic flights for routes not in database
 */
function generateGenericFlights(origin, destination) {
  const airlines = [
    'International Airways',
    'Global Connect',
    'Sky Alliance',
    'World Flights'
  ];
  
  return airlines.map((airline, index) => ({
    airline,
    flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + index}`,
    basePrice: 500 + (index * 50),
    duration: 8 + (index * 2),
    layovers: index > 1 ? 1 : 0,
    departureTime: `${8 + (index * 3)}:00`,
    arrivalTime: `${16 + (index * 3)}:00`,
    aircraft: index % 2 === 0 ? 'Boeing 777' : 'Airbus A320',
    layoverCity: index > 1 ? 'Hub City' : undefined
  }));
}

/**
 * Search for flights based on criteria
 * Uses SerpAPI if configured, otherwise falls back to mock data
 * @param {string} origin - Origin country code
 * @param {string} destination - Destination country code
 * @param {Object} dates - Travel dates { departureDate: 'DD/MM/YYYY', returnDate: 'DD/MM/YYYY' }
 * @param {Object} preferences - User preferences { optimization: string, maxPrice: number }
 * @returns {Promise<Array>} Array of flight objects
 */
async function searchFlights(origin, destination, dates, preferences = {}) {
  try {
    console.log(`\n✈️  Searching flights: ${origin} → ${destination}`);
    console.log(`   Dates: ${dates.departureDate} to ${dates.returnDate}`);
    console.log(`   Optimization: ${preferences.optimization || 'balanced'}`);
    console.log(`   Max Price: ${preferences.maxPrice ? `$${preferences.maxPrice}` : 'No limit'}`);
    console.log(`   API Mode: ${USE_REAL_API ? 'SerpAPI Google Flights' : 'Mock Data'}`);
    
    let flights;

    // Try SerpAPI first if configured
    if (USE_REAL_API) {
      try {
        flights = await searchFlightsSerpAPI(origin, destination, dates, preferences);
      } catch (error) {
        console.warn(`⚠️  SerpAPI failed, falling back to mock data`);
        flights = searchFlightsMock(origin, destination, dates, preferences);
      }
    } else {
      flights = searchFlightsMock(origin, destination, dates, preferences);
    }
    
    // Filter by max price if specified
    if (preferences.maxPrice) {
      flights = flights.filter(f => f.price <= preferences.maxPrice);
    }
    
    // Sort based on optimization preference
    flights = sortFlights(flights, preferences.optimization || 'balanced');
    
    console.log(`   Found ${flights.length} flights`);
    
    return flights;
    
  } catch (error) {
    console.error('Error searching flights:', error);
    throw new Error(`Flight search failed: ${error.message}`);
  }
}

/**
 * Sort flights based on optimization preference
 */
function sortFlights(flights, optimization) {
  switch (optimization) {
    case 'cheapest':
      return flights.sort((a, b) => a.price - b.price);
    
    case 'fastest':
      return flights.sort((a, b) => a.duration - b.duration);
    
    case 'least_layover':
      return flights.sort((a, b) => {
        if (a.layovers !== b.layovers) {
          return a.layovers - b.layovers;
        }
        return a.duration - b.duration;
      });
    
    case 'balanced':
    default:
      return flights.sort((a, b) => {
        const scoreA = (a.price / 100) + (a.duration * 10) + (a.layovers * 50);
        const scoreB = (b.price / 100) + (b.duration * 10) + (b.layovers * 50);
        return scoreA - scoreB;
      });
  }
}

/**
 * Get the best flight based on optimization preference
 */
async function getBestFlight(origin, destination, dates, preferences = {}) {
  const flights = await searchFlights(origin, destination, dates, preferences);
  
  if (flights.length === 0) {
    throw new Error('No flights found matching criteria');
  }
  
  return flights[0];
}

/**
 * Format flight details for display in documents
 */
function formatFlightDetails(flight) {
  const layoverText = flight.layovers > 0 
    ? ` with ${flight.layovers} layover${flight.layovers > 1 ? 's' : ''} in ${flight.layoverCity || 'hub city'}`
    : ' (direct flight)';
  
  return `${flight.airline} Flight ${flight.flightNumber}${layoverText}
Departure: ${flight.departureTime} | Arrival: ${flight.arrivalTime}
Duration: ${flight.duration} hours | Price: $${flight.price}
Aircraft: ${flight.aircraft}
Booking: ${flight.bookingUrl}`;
}

/**
 * Get flight statistics for a set of flights
 */
function getFlightStatistics(flights) {
  if (flights.length === 0) {
    return {
      count: 0,
      avgPrice: 0,
      avgDuration: 0,
      directFlights: 0,
      cheapest: null,
      fastest: null
    };
  }
  
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => f.duration);
  
  return {
    count: flights.length,
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    avgDuration: Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10,
    directFlights: flights.filter(f => f.layovers === 0).length,
    cheapest: flights.reduce((min, f) => f.price < min.price ? f : min, flights[0]),
    fastest: flights.reduce((min, f) => f.duration < min.duration ? f : min, flights[0])
  };
}

module.exports = {
  searchFlights,
  getBestFlight,
  formatFlightDetails,
  getFlightStatistics,
  sortFlights
};

// Made with Bob