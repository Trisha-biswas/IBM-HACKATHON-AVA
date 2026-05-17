# Quick Start Guide: Multi-Agent Orchestration

## Overview

The Agentic VISA Assistant now uses **Multi-Agent Orchestration** to intelligently search for flights and generate visa documents with specific travel details.

## What's New?

### 1. Automatic Flight Search
- System automatically searches for flights when `transport: 'flight'`
- Optimizes based on your preference: cheapest, fastest, least layovers, or balanced
- Returns selected flight details in the response

### 2. Flight-Aware Documents
- Cover letters reference specific flight details
- Itineraries include exact flight times and airline information
- All documents are consistent with selected flights

### 3. Flexible Optimization
- Choose optimization strategy per request
- Set maximum price constraints
- Get transparent flight options in response

## Quick Example

### Basic Request with Flight Preferences

```javascript
POST http://localhost:3001/api/visa/request

{
  "fromCountry": "IN",
  "toCountry": "AT",
  "startDate": "15/07/2026",
  "endDate": "29/07/2026",
  "numTravelers": 1,
  "purpose": "Tourism",
  "budget": "moderate",
  "transport": "flight",
  "flightPreferences": {
    "optimization": "cheapest",
    "maxPrice": 700
  },
  "travelers": [
    {
      "name": "John Doe",
      "sponsorType": "self",
      "sponsorOrg": "Self-employed"
    }
  ]
}
```

### Response with Flight Options

```javascript
{
  "success": true,
  "requestId": "req-1715856000000",
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "flightOptions": [
    {
      "travelerName": "John Doe",
      "flight": {
        "airline": "Turkish Airlines",
        "flightNumber": "TK716",
        "price": 550,
        "duration": 11.5,
        "layovers": 1,
        "layoverCity": "Istanbul",
        "departureTime": "23:45",
        "arrivalTime": "08:15",
        "aircraft": "Boeing 737",
        "bookingUrl": "https://www.turkishairlines.com/booking?flight=TK716&from=IN&to=AT"
      }
    }
  ],
  "results": [
    {
      "travelerName": "John Doe",
      "status": "success",
      "files": {
        "coverLetter": "/downloads/req-1715856000000/John_Doe_cover-letter.pdf",
        "itinerary": "/downloads/req-1715856000000/John_Doe_itinerary.pdf"
      }
    }
  ]
}
```

## Flight Optimization Options

### 1. Cheapest (`optimization: 'cheapest'`)
Finds the lowest-priced flight within your budget.

```javascript
"flightPreferences": {
  "optimization": "cheapest",
  "maxPrice": 700  // Optional: set maximum price
}
```

**Best for**: Budget-conscious travelers

### 2. Fastest (`optimization: 'fastest'`)
Finds the shortest duration flight.

```javascript
"flightPreferences": {
  "optimization": "fastest",
  "maxPrice": 800  // Optional
}
```

**Best for**: Business travelers, time-sensitive trips

### 3. Least Layover (`optimization: 'least_layover'`)
Prioritizes direct flights or minimal layovers.

```javascript
"flightPreferences": {
  "optimization": "least_layover"
}
```

**Best for**: Travelers who prefer convenience, families with children

### 4. Balanced (`optimization: 'balanced'`)
Considers price, duration, and layovers equally.

```javascript
"flightPreferences": {
  "optimization": "balanced"
}
```

**Best for**: Most travelers, general use

## Testing the System

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3001`

### 2. Run the Test Suite

```bash
node test-multi-agent.js
```

This will test all optimization strategies and generate sample documents.

### 3. Manual Testing with curl

```bash
curl -X POST http://localhost:3001/api/visa/request \
  -H "Content-Type: application/json" \
  -d '{
    "fromCountry": "IN",
    "toCountry": "AT",
    "startDate": "15/07/2026",
    "endDate": "29/07/2026",
    "numTravelers": 1,
    "purpose": "Tourism",
    "transport": "flight",
    "flightPreferences": {
      "optimization": "cheapest",
      "maxPrice": 700
    },
    "travelers": [
      {
        "name": "Test User",
        "sponsorType": "self"
      }
    ]
  }'
```

## Available Routes

### 1. `/api/visa/request` (Recommended)
- Full orchestration with flight search
- Returns flight options and metadata
- Creates organized folder structure

### 2. `/api/visa/generate-complete-package`
- Similar to `/request` but different response format
- Returns all files in a single array
- Includes itineraries in response body

### 3. `/api/visa/generate-cover-letter`
- Generate only cover letter (legacy)
- No flight search

### 4. `/api/visa/generate-itinerary`
- Generate only itinerary (legacy)
- No flight search

## Common Use Cases

### Use Case 1: Budget Traveler
```javascript
{
  "flightPreferences": {
    "optimization": "cheapest",
    "maxPrice": 600
  }
}
```

### Use Case 2: Business Trip
```javascript
{
  "flightPreferences": {
    "optimization": "fastest"
  }
}
```

### Use Case 3: Family Vacation
```javascript
{
  "flightPreferences": {
    "optimization": "least_layover",
    "maxPrice": 1000
  }
}
```

### Use Case 4: Flexible Traveler
```javascript
{
  "flightPreferences": {
    "optimization": "balanced"
  }
}
```

## Understanding the Response

### Flight Options Array
Contains the selected flight for each traveler:

```javascript
"flightOptions": [
  {
    "travelerName": "John Doe",
    "flight": {
      "airline": "Austrian Airlines",      // Airline name
      "flightNumber": "OS202",             // Flight number
      "price": 650,                        // Price in USD
      "duration": 8.5,                     // Duration in hours
      "layovers": 0,                       // Number of layovers
      "layoverCity": null,                 // Layover city (if any)
      "departureTime": "10:30",            // Departure time
      "arrivalTime": "14:00",              // Arrival time
      "aircraft": "Boeing 777",            // Aircraft type
      "bookingUrl": "https://..."          // Booking URL
    }
  }
]
```

### Results Array
Contains document generation results:

```javascript
"results": [
  {
    "travelerName": "John Doe",
    "destination": "Austria",
    "status": "success",
    "files": {
      "coverLetter": "/downloads/req-123/John_Doe_cover-letter.pdf",
      "itinerary": "/downloads/req-123/John_Doe_itinerary.pdf"
    },
    "travelerData": { /* traveler details */ }
  }
]
```

## Tips and Best Practices

### 1. Set Realistic Max Prices
- Research typical flight prices for your route
- Add 20-30% buffer for flexibility
- Omit `maxPrice` if you want all options

### 2. Choose the Right Optimization
- **Cheapest**: When budget is the primary concern
- **Fastest**: When time is critical
- **Least Layover**: When comfort is important
- **Balanced**: When you want a good overall option

### 3. Handle Multiple Travelers
- All travelers get the same flight by default
- Future enhancement: individual flight preferences per traveler

### 4. Check Flight Options Before Downloading
- Review the `flightOptions` array in the response
- Verify the selected flight meets your needs
- Download PDFs only if satisfied

### 5. Error Handling
- Check `status` field in results array
- If `status: 'error'`, check the `error` field for details
- Common errors: no flights found, API timeout, invalid dates

## Troubleshooting

### Problem: No flight options returned
**Solution**: Ensure `transport: 'flight'` and `flightPreferences` are included

### Problem: All flights exceed maxPrice
**Solution**: Increase `maxPrice` or remove it entirely

### Problem: Documents don't mention flights
**Solution**: Check if flight search succeeded (look at `flightOptions` in response)

### Problem: Request timeout
**Solution**: Increase timeout in your HTTP client (default: 120 seconds)

## Next Steps

1. **Test the system**: Run `node test-multi-agent.js`
2. **Review documentation**: Read `MULTI_AGENT_ORCHESTRATION.md` for details
3. **Integrate with frontend**: Update frontend to send `flightPreferences`
4. **Customize**: Modify flight data in `flightService.js` for your routes

## Support

For detailed architecture information, see:
- `MULTI_AGENT_ORCHESTRATION.md` - Complete architecture guide
- `AGENTS.md` - Project overview and guidelines
- `PROJECT_PLAN.md` - Original project plan

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-16

// Made with Bob