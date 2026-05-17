# SerpAPI Google Flights Integration Guide

## Overview

The flight service integrates with **SerpAPI Google Flights** to fetch real-time flight data. SerpAPI provides a simple REST API to access Google Flights data with a generous free tier perfect for development and testing.

## Why SerpAPI?

- ✅ **Free Tier**: 100 searches/month (no credit card required)
- ✅ **Easy Setup**: Simple API key authentication
- ✅ **No Commercial Restrictions**: Available for all users
- ✅ **Reliable**: Scrapes Google Flights data
- ✅ **Well Documented**: Comprehensive API documentation
- ✅ **Fast**: Quick response times

## API Documentation

- **Website**: https://serpapi.com/
- **API Used**: Google Flights API
- **Documentation**: https://serpapi.com/google-flights-api
- **Playground**: https://serpapi.com/playground

## Getting Started

### Step 1: Sign Up for SerpAPI (FREE)

1. Visit https://serpapi.com/users/sign_up
2. Sign up with your email (no credit card required)
3. Verify your email address
4. You'll automatically get 100 free searches/month

### Step 2: Get Your API Key

1. After signing in, go to https://serpapi.com/manage-api-key
2. Your API key will be displayed on the page
3. Copy the API key (looks like: `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`)

### Step 3: Configure the Backend

1. Open `backend/.env` file
2. Replace the placeholder with your actual API key:

```env
SERPAPI_API_KEY=your_actual_api_key_here
```

3. Save the file
4. Restart the backend server

```bash
cd backend
npm run dev
```

## API Configuration

### Environment Variables

```env
# SerpAPI Configuration
SERPAPI_API_KEY=your_serpapi_api_key
```

### Automatic Fallback

The system automatically detects if the API is configured:

- **API Key Present**: Uses SerpAPI for real flight data from Google Flights
- **API Key Missing/Invalid**: Falls back to mock data
- **API Error**: Falls back to mock data with warning

### Checking API Status

When the server starts, check the logs:

```
✈️  Searching flights: IN → AT
   API Mode: SerpAPI Google Flights    ← Real API enabled
```

or

```
✈️  Searching flights: IN → AT
   API Mode: Mock Data                 ← Using fallback data
```

## API Features

### 1. Google Flights Search

**What it does**: Returns real flight data from Google Flights including prices, airlines, times, and layovers

**Request Format**:
```
GET https://serpapi.com/search?engine=google_flights&departure_id=Delhi,%20India&arrival_id=Vienna,%20Austria&outbound_date=2026-07-15&return_date=2026-07-29&currency=USD&hl=en&api_key=YOUR_API_KEY
```

**Parameters**:
- `engine`: Always `google_flights`
- `departure_id`: Origin city/airport (e.g., "Delhi, India")
- `arrival_id`: Destination city/airport (e.g., "Vienna, Austria")
- `outbound_date`: Departure date (YYYY-MM-DD)
- `return_date`: Return date (YYYY-MM-DD)
- `currency`: Currency code (USD, EUR, INR, etc.)
- `hl`: Language (en, es, fr, etc.)
- `api_key`: Your SerpAPI key

**Response**: JSON with best_flights, other_flights, and search metadata

### 2. Country to Location Mapping

The service automatically maps country codes to city names:

```javascript
'IN' → 'Delhi, India'
'AT' → 'Vienna, Austria'
'US' → 'New York, USA'
'GB' → 'London, United Kingdom'
'FR' → 'Paris, France'
// ... and 30+ more
```

### 3. Data Transformation

SerpAPI response is transformed to our standard format:

**SerpAPI Format**:
```json
{
  "best_flights": [{
    "flights": [{
      "departure_airport": {
        "name": "Indira Gandhi International Airport",
        "id": "DEL",
        "time": "10:30"
      },
      "arrival_airport": {
        "name": "Vienna International Airport",
        "id": "VIE",
        "time": "14:00"
      },
      "airline": "Austrian Airlines",
      "flight_number": "OS 202",
      "airplane": "Boeing 777"
    }],
    "total_duration": 510,
    "price": 650,
    "booking_token": "abc123..."
  }]
}
```

**Our Format**:
```json
{
  "airline": "Austrian Airlines",
  "flightNumber": "OS202",
  "price": 650,
  "duration": 8.5,
  "layovers": 0,
  "departureTime": "10:30",
  "arrivalTime": "14:00",
  "aircraft": "Boeing 777",
  "bookingUrl": "https://www.google.com/travel/flights/booking?token=abc123...",
  "origin": "IN",
  "destination": "AT",
  "carbonEmissions": 1234
}
```

## Usage Examples

### Example 1: Basic Flight Search

```javascript
const flightService = require('./services/flightService');

const flights = await flightService.searchFlights(
  'IN',  // Origin: India
  'AT',  // Destination: Austria
  {
    departureDate: '15/07/2026',
    returnDate: '29/07/2026'
  },
  {
    optimization: 'cheapest',
    maxPrice: 700
  }
);

console.log(flights);
// Returns array of flights sorted by price from Google Flights
```

### Example 2: Get Best Flight

```javascript
const bestFlight = await flightService.getBestFlight(
  'US',
  'FR',
  {
    departureDate: '01/08/2026',
    returnDate: '15/08/2026'
  },
  {
    optimization: 'fastest'
  }
);

console.log(bestFlight);
// Returns the fastest flight option from Google Flights
```

### Example 3: With API Request

```javascript
POST http://localhost:3001/api/visa/request

{
  "fromCountry": "IN",
  "toCountry": "AT",
  "startDate": "15/07/2026",
  "endDate": "29/07/2026",
  "transport": "flight",
  "flightPreferences": {
    "optimization": "cheapest",
    "maxPrice": 700
  },
  "travelers": [...]
}
```

## API Limits and Pricing

### Free Tier (100 searches/month)

- **Per Request**: 1 flight search
- **Per Traveler**: 1 request (if same route)
- **Monthly Capacity**: ~100 visa requests (single traveler)
- **Cost**: $0/month
- **No Credit Card**: Required

### Paid Plans

If you need more searches:

- **Developer**: $50/month - 5,000 searches
- **Production**: $150/month - 15,000 searches
- **Enterprise**: Custom pricing

Visit https://serpapi.com/pricing for current pricing

### Best Practices

1. **Cache Results**: Cache flight search results for same routes/dates (1 hour TTL)
2. **Batch Requests**: Group multiple travelers on same route
3. **Error Handling**: Always have fallback to mock data
4. **Monitor Usage**: Check dashboard at https://serpapi.com/dashboard
5. **Optimize Queries**: Only search when necessary

### Rate Limiting

- Free tier: 100 searches/month
- No per-second rate limit
- Searches reset on the 1st of each month

## Troubleshooting

### Issue 1: "SerpAPI error: 401"

**Cause**: Invalid or missing API key

**Solution**:
1. Verify API key in `.env` file
2. Check if key is active at https://serpapi.com/manage-api-key
3. Ensure no extra spaces in the key
4. Make sure you're signed in to SerpAPI

### Issue 2: "SerpAPI error: 429"

**Cause**: Monthly search limit exceeded

**Solution**:
1. Check your usage at https://serpapi.com/dashboard
2. Wait until next month for free tier reset
3. Upgrade to a paid plan
4. System will automatically fall back to mock data

### Issue 3: "No flights found"

**Cause**: No flights available for the route/date or invalid location

**Solution**:
1. Check if location names are correct
2. Try different dates
3. Verify route exists (major cities work best)
4. System will fall back to mock data

### Issue 4: API returns empty response

**Cause**: Google Flights has no data for this route

**Solution**:
1. Verify location strings are correct
2. Try alternative cities
3. Check if route is commonly flown
4. System will fall back to mock data

## API Response Examples

### Successful Response

```json
{
  "search_metadata": {
    "status": "Success",
    "created_at": "2026-05-16 10:00:00 UTC",
    "processed_at": "2026-05-16 10:00:02 UTC"
  },
  "best_flights": [
    {
      "flights": [
        {
          "departure_airport": {
            "name": "Indira Gandhi International Airport",
            "id": "DEL",
            "time": "10:30"
          },
          "arrival_airport": {
            "name": "Vienna International Airport",
            "id": "VIE",
            "time": "14:00"
          },
          "duration": 510,
          "airline": "Austrian Airlines",
          "airline_logo": "https://...",
          "travel_class": "Economy",
          "flight_number": "OS 202",
          "airplane": "Boeing 777",
          "legroom": "31 in"
        }
      ],
      "total_duration": 510,
      "carbon_emissions": {
        "this_flight": 1234,
        "typical_for_this_route": 1200,
        "difference_percent": 3
      },
      "price": 650,
      "type": "Round trip",
      "booking_token": "WyJDalJJVkhCM..."
    }
  ],
  "other_flights": [...]
}
```

### Error Response

```json
{
  "error": "Invalid API key. Your API key should be here: https://serpapi.com/manage-api-key"
}
```

## Testing with Real API

### 1. Configure API Key

```bash
# Edit .env file
SERPAPI_API_KEY=your_real_api_key
```

### 2. Run Test Suite

```bash
cd backend
node test-multi-agent.js
```

### 3. Check Logs

Look for:
```
🔍 Calling SerpAPI Google Flights...
   Route: Delhi, India → Vienna, Austria
   Dates: 2026-07-15 to 2026-07-29
✓ SerpAPI response received
✓ Found 8 flights from SerpAPI
```

### 4. Verify Response

Check that `flightOptions` in response contains real data:
- Realistic prices from Google Flights
- Actual airline names
- Valid flight times
- Real booking URLs

## Cost Estimation

### Free Tier (100 searches/month)

- **Per Request**: 1 flight search
- **Per Traveler**: 1 request (if same route)
- **Monthly Capacity**: ~100 visa requests (single traveler)
- **Cost**: $0/month
- **Perfect For**: Development, testing, small projects

### Developer Tier (5,000 searches/month)

- **Monthly Capacity**: ~5,000 visa requests
- **Cost**: $50/month
- **Best For**: Small agencies, production apps

### Production Tier (15,000 searches/month)

- **Monthly Capacity**: ~15,000 visa requests
- **Cost**: $150/month
- **Best For**: Medium agencies, high-traffic apps

## Advantages Over Other APIs

### vs Skyscanner API
- ✅ No commercial restrictions
- ✅ Free tier available
- ✅ Easier setup
- ✅ Better documentation

### vs Amadeus API
- ✅ Simpler authentication
- ✅ More generous free tier
- ✅ Faster integration
- ✅ No complex booking flows

### vs Direct Google Flights API
- ✅ No Google Cloud setup needed
- ✅ Simple REST API
- ✅ No OAuth complexity
- ✅ Better rate limits

## Migration from Mock to Real API

### Step 1: Test with Mock Data

```bash
# Keep SERPAPI_API_KEY empty
SERPAPI_API_KEY=your_serpapi_api_key

# Run tests
node test-multi-agent.js
```

### Step 2: Sign Up for SerpAPI

1. Go to https://serpapi.com/users/sign_up
2. Create free account
3. Get API key from https://serpapi.com/manage-api-key

### Step 3: Configure Real API

```bash
# Add real API key
SERPAPI_API_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Step 4: Test with Real API

```bash
# Run tests again
node test-multi-agent.js

# Verify logs show "SerpAPI Google Flights" mode
```

### Step 5: Monitor Usage

- Check dashboard: https://serpapi.com/dashboard
- View search history
- Track remaining searches
- Set up email alerts

## Advanced Features

### 1. Carbon Emissions Data

SerpAPI returns carbon emissions for each flight:

```javascript
{
  "carbonEmissions": {
    "this_flight": 1234,
    "typical_for_this_route": 1200,
    "difference_percent": 3
  }
}
```

### 2. Multiple Booking Options

Each flight includes a booking token for direct booking:

```javascript
{
  "bookingUrl": "https://www.google.com/travel/flights/booking?token=abc123..."
}
```

### 3. Flight Extensions

Additional information like legroom, travel class, etc.:

```javascript
{
  "extensions": [
    "31 in seat pitch",
    "No in-flight entertainment",
    "USB outlet"
  ]
}
```

## Support and Resources

- **SerpAPI Website**: https://serpapi.com/
- **Documentation**: https://serpapi.com/google-flights-api
- **API Playground**: https://serpapi.com/playground
- **Dashboard**: https://serpapi.com/dashboard
- **Support**: support@serpapi.com
- **Status Page**: https://status.serpapi.com/

## FAQ

### Q: Do I need a credit card for the free tier?
**A**: No, the free tier (100 searches/month) requires no credit card.

### Q: What happens if I exceed the free tier limit?
**A**: The API will return an error, and the system will automatically fall back to mock data.

### Q: Can I use this for commercial projects?
**A**: Yes, SerpAPI has no restrictions on commercial use.

### Q: How accurate are the prices?
**A**: Prices are scraped directly from Google Flights and are as accurate as Google's data.

### Q: Can I search for one-way flights?
**A**: Yes, just omit the `return_date` parameter (requires code modification).

### Q: Does it support multi-city routes?
**A**: Not in the current implementation, but SerpAPI supports it (requires code modification).

---

**Last Updated**: 2026-05-16  
**Version**: 2.0.0  
**Integration Status**: Production Ready  
**API Provider**: SerpAPI (https://serpapi.com/)

// Made with Bob