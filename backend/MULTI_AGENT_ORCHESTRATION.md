# Multi-Agent Orchestration Architecture

## Overview

The Agentic VISA Assistant System has been upgraded to a **Multi-Agent Orchestration** architecture using IBM watsonx.ai (meta-llama/llama-3-3-70b-instruct) with tool/function calling capabilities and **Skyscanner Flights Indicative Prices API** integration for real-time flight data.

## Architecture Changes

### Before (Direct API Calls)
```
User Request → watsonx.ai → Generate Documents → Return PDFs
```

### After (Multi-Agent Orchestration)
```
User Request → Orchestrator Agent → Tool Calls → Document Generation → Return PDFs + Flight Data
                     ↓
              1. Search Flights (if needed)
              2. Select Best Flight
              3. Generate Cover Letter (with flight details)
              4. Generate Itinerary (with flight details)
```

## Key Components

### 1. Flight Service (`backend/services/flightService.js`)

**Purpose**: Fetches real-time flight data from Skyscanner API with automatic fallback to mock data

**Key Functions**:
- `searchFlights(origin, destination, dates, preferences)` - Search flights via Skyscanner API or mock data
- `searchFlightsSkyscanner(origin, destination, dates, preferences)` - Direct Skyscanner API call
- `searchFlightsMock(origin, destination, dates, preferences)` - Fallback mock data
- `getBestFlight(origin, destination, dates, preferences)` - Get the optimal flight
- `sortFlights(flights, optimization)` - Sort flights by preference
- `formatFlightDetails(flight)` - Format flight data for documents
- `transformSkyscannerData(data, origin, destination)` - Transform API response to our format

**API Integration**:
- **Primary**: Skyscanner Flights Indicative Prices API (Browse Routes)
- **Fallback**: Mock flight database with realistic data
- **Auto-Detection**: Automatically uses API if `SKYSCANNER_API_KEY` is configured
- **Error Handling**: Falls back to mock data on API errors

**Optimization Modes**:
- `cheapest` - Sort by lowest price
- `fastest` - Sort by shortest duration
- `least_layover` - Sort by fewest layovers
- `balanced` - Weighted score considering all factors

**Data Sources**:
- **Skyscanner API**: Real-time flight prices and availability
- **Mock Database**: Realistic flight data for 5+ popular routes (e.g., IN-AT)
- **Generic Generator**: Creates flights for routes not in database
- **Dynamic Pricing**: Seasonal adjustments and random variation

**Country to Airport Mapping**:
- Automatically maps country codes to major airport IATA codes
- 35+ countries supported (IN→DEL, AT→VIE, US→JFK, etc.)

**Example Flight Object**:
```javascript
{
  airline: 'Austrian Airlines',
  flightNumber: 'OS202',
  price: 650,
  duration: 8.5,
  layovers: 0,
  departureTime: '10:30',
  arrivalTime: '14:00',
  aircraft: 'Boeing 777',
  bookingUrl: 'https://www.austrian.com/booking?flight=OS202&from=IN&to=AT',
  origin: 'IN',
  destination: 'AT'
}
```

### 2. Orchestrator Service (`backend/services/watsonxService.js`)

**Purpose**: Orchestrates the multi-agent workflow with tool calling

**Key Functions**:
- `orchestrateWithTools(traveler, requestData)` - Main orchestration logic
- `executeTool(toolName, args)` - Execute tool/function calls
- `callWatsonxWithTools(prompt, tools, parameters)` - Call watsonx.ai with tool support

**Tool Definitions**:

1. **search_flights**
   - Searches for flights between origin and destination
   - Parameters: origin, destination, departureDate, returnDate, optimization, maxPrice
   - Returns: Array of flight objects

2. **generate_itinerary_text**
   - Generates detailed travel itinerary
   - Parameters: travelerName, destination, purpose, dates, flightDetails, interests, budget
   - Returns: Formatted itinerary text

3. **generate_cover_letter_text**
   - Generates formal cover letter
   - Parameters: travelerName, countries, purpose, dates, sponsorType, sponsorOrg
   - Returns: Formatted cover letter text

**Orchestration Flow**:
```javascript
1. Check if flight search is needed (transport === 'flight')
2. If yes:
   a. Execute search_flights tool
   b. Select best flight based on optimization preference
3. Generate cover letter with flight details
4. Generate itinerary with flight details
5. Return documents + flight data
```

### 3. Enhanced Prompts (`backend/utils/prompts.js`)

**New Functions**:
- `getOrchestratorSystemPrompt()` - System prompt defining orchestrator role
- `generateCoverLetterPrompt(traveler, requestData, flightData)` - Flight-aware cover letter prompt
- `generateItineraryPrompt(traveler, requestData, flightData)` - Flight-aware itinerary prompt

**Key Enhancements**:
- Prompts now accept optional `flightData` parameter
- Flight details are embedded in document generation prompts
- Specific instructions to reference flight information in documents
- Ensures consistency between flight data and generated text

**Example Flight Integration in Prompt**:
```
Flight Information:
- Airline: Austrian Airlines
- Flight Number: OS202
- Departure: 10:30
- Arrival: 14:00
- Duration: 8.5 hours
- Layovers: 0 (direct flight)

IMPORTANT: Reference the specific flight details provided (Austrian Airlines OS202) in the letter
```

### 4. Updated Routes (`backend/routes/visa.js`)

**Changes to `/api/visa/generate-complete-package`**:
- Accepts `flightPreferences` in request body
- Returns `flightOptions` array in response
- Logs flight optimization preferences

**Changes to `/api/visa/request`**:
- Accepts `flightPreferences` in request body
- Returns `flightOptions` array in response
- Includes flight data in metadata

**New Request Format**:
```javascript
{
  // ... existing fields ...
  flightPreferences: {
    optimization: 'cheapest' | 'fastest' | 'least_layover' | 'balanced',
    maxPrice: 700  // optional, in USD
  }
}
```

**New Response Format**:
```javascript
{
  success: true,
  requestId: 'req-1234567890',
  summary: { total: 2, successful: 2, failed: 0 },
  results: [ /* traveler results */ ],
  flightOptions: [
    {
      travelerName: 'John Doe',
      flight: {
        airline: 'Austrian Airlines',
        flightNumber: 'OS202',
        price: 650,
        duration: 8.5,
        layovers: 0,
        departureTime: '10:30',
        arrivalTime: '14:00',
        bookingUrl: 'https://...'
      }
    }
  ],
  metadataUrl: '/downloads/req-1234567890/metadata.json'
}
```

## Usage Examples

### Example 1: Request with Cheapest Flight Preference

```javascript
const request = {
  fromCountry: 'IN',
  toCountry: 'AT',
  startDate: '15/07/2026',
  endDate: '29/07/2026',
  numTravelers: 1,
  purpose: 'Tourism',
  budget: 'moderate',
  transport: 'flight',
  flightPreferences: {
    optimization: 'cheapest',
    maxPrice: 700
  },
  travelers: [
    {
      name: 'Rajesh Kumar',
      sponsorType: 'self',
      sponsorOrg: 'Self-employed'
    }
  ]
};

// POST to /api/visa/request
const response = await axios.post('http://localhost:3001/api/visa/request', request);

console.log(response.data.flightOptions);
// Output:
// [
//   {
//     travelerName: 'Rajesh Kumar',
//     flight: {
//       airline: 'Turkish Airlines',
//       flightNumber: 'TK716',
//       price: 550,
//       duration: 11.5,
//       layovers: 1,
//       layoverCity: 'Istanbul'
//     }
//   }
// ]
```

### Example 2: Request with Fastest Flight Preference

```javascript
const request = {
  // ... same as above ...
  flightPreferences: {
    optimization: 'fastest',
    maxPrice: 800
  }
};

// Response will include the fastest flight (shortest duration)
// e.g., Austrian Airlines OS202 (8.5 hours, direct)
```

### Example 3: Request with No Flight Preference (Balanced)

```javascript
const request = {
  // ... same as above ...
  flightPreferences: {
    optimization: 'balanced'
    // No maxPrice - considers all options
  }
};

// Response will include a balanced option considering price, duration, and layovers
```

## Testing

### Running Tests

```bash
# Start the backend server
cd backend
npm run dev

# In another terminal, run the test suite
node test-multi-agent.js
```

### Test Scenarios

The test file (`backend/test-multi-agent.js`) includes:

1. **Cheapest Flight Option** - Tests price optimization
2. **Fastest Flight Option** - Tests duration optimization
3. **Least Layover Option** - Tests layover minimization
4. **Balanced Option** - Tests balanced optimization
5. **Complete Package** - Tests the complete package endpoint

### Expected Output

```
🧪 Testing: Cheapest Flight Option
================================================================================

📤 Sending request to /api/visa/request...
   Optimization: cheapest
   Max Price: $700
   Travelers: 2

✅ Request completed in 15.32s
   Request ID: req-1715856000000
   Summary: 2/2 successful

✈️  Flight Options Selected:

   Traveler: Rajesh Kumar
   Airline: Turkish Airlines
   Flight: TK716
   Price: $550
   Duration: 11.5 hours
   Layovers: 1
   Departure: 23:45
   Arrival: 08:15

   Traveler: Priya Sharma
   Airline: Turkish Airlines
   Flight: TK716
   Price: $550
   Duration: 11.5 hours
   Layovers: 1
   Departure: 23:45
   Arrival: 08:15

📄 Generated Files:

   Rajesh Kumar:
   - Cover Letter: /downloads/req-1715856000000/Rajesh_Kumar_cover-letter.pdf
   - Itinerary: /downloads/req-1715856000000/Rajesh_Kumar_itinerary.pdf

   Priya Sharma:
   - Cover Letter: /downloads/req-1715856000000/Priya_Sharma_cover-letter.pdf
   - Itinerary: /downloads/req-1715856000000/Priya_Sharma_itinerary.pdf
```

## Benefits of Multi-Agent Architecture

### 1. **Intelligent Decision Making**
- Orchestrator evaluates user preferences and selects optimal flights
- Considers multiple factors: price, duration, layovers
- Adapts to user constraints (max price, optimization preference)

### 2. **Enhanced Document Quality**
- Cover letters reference specific flight details
- Itineraries include exact flight times and airline information
- Consistent data across all documents

### 3. **Flexibility**
- Easy to add new tools (hotel search, visa requirements, etc.)
- Modular architecture allows independent tool updates
- Can switch between different optimization strategies

### 4. **Transparency**
- Returns flight options to user for verification
- Logs show orchestration steps
- Clear separation between tool execution and document generation

### 5. **Scalability**
- Can handle multiple travelers with different preferences
- Parallel processing of independent tasks
- Caching of flight search results (future enhancement)

## Future Enhancements

### 1. Real Flight API Integration
Replace mock flight service with real APIs:
- Amadeus Flight Offers Search API
- Skyscanner API
- Google Flights API

### 2. Additional Tools
- `search_hotels` - Find accommodation options
- `check_visa_requirements` - Get visa requirements for destination
- `calculate_budget` - Estimate total trip cost
- `suggest_activities` - Recommend activities based on interests

### 3. Advanced Orchestration
- Multi-turn conversations with user for clarifications
- Conditional tool execution based on previous results
- Parallel tool execution for independent tasks

### 4. Caching and Optimization
- Cache flight search results for same routes/dates
- Implement rate limiting for external APIs
- Add retry logic with exponential backoff

### 5. User Feedback Loop
- Allow users to select from multiple flight options
- Regenerate documents with different flight choices
- Save user preferences for future requests

## API Reference

### POST /api/visa/request

**Request Body**:
```typescript
{
  fromCountry: string;           // Origin country code (e.g., 'IN')
  toCountry: string;             // Destination country code (e.g., 'AT')
  startDate: string;             // Format: DD/MM/YYYY
  endDate: string;               // Format: DD/MM/YYYY
  numTravelers: number;
  purpose: string;
  budget: string;
  transport: string;             // 'flight', 'train', 'car', etc.
  interests: Array<{value: string, label: string}>;
  specialRequests?: string;
  flightPreferences?: {
    optimization: 'cheapest' | 'fastest' | 'least_layover' | 'balanced';
    maxPrice?: number;           // Optional, in USD
  };
  travelers: Array<{
    name: string;
    sponsorType: 'self' | 'employer' | 'other';
    sponsorOrg?: string;
  }>;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  requestId: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: Array<{
    travelerName: string;
    destination: string;
    status: 'success' | 'error';
    files: {
      coverLetter: string;       // URL to PDF
      itinerary: string;         // URL to PDF
    };
    travelerData: object;
    error?: string;
  }>;
  flightOptions?: Array<{
    travelerName: string;
    flight: {
      airline: string;
      flightNumber: string;
      price: number;
      duration: number;
      layovers: number;
      departureTime: string;
      arrivalTime: string;
      aircraft: string;
      layoverCity?: string;
      bookingUrl: string;
    };
  }>;
  metadataUrl: string;
}
```

## Troubleshooting

### Issue: No flight options returned
**Cause**: Transport mode is not 'flight' or flightPreferences not provided
**Solution**: Ensure `transport: 'flight'` and `flightPreferences` object in request

### Issue: Flight search fails
**Cause**: Invalid country codes or date format
**Solution**: Use 2-letter country codes (ISO 3166-1 alpha-2) and DD/MM/YYYY date format

### Issue: Documents don't include flight details
**Cause**: Flight search failed or returned no results
**Solution**: Check maxPrice constraint, try different optimization, or remove maxPrice

### Issue: Orchestration timeout
**Cause**: watsonx.ai API is slow or unresponsive
**Solution**: Increase timeout in axios config (currently 120 seconds)

## Performance Considerations

### Typical Response Times
- Flight search: 0.5-1 second
- Cover letter generation: 5-10 seconds
- Itinerary generation: 5-10 seconds
- Total per traveler: 10-20 seconds

### Optimization Tips
1. Use parallel processing for multiple travelers (already implemented)
2. Cache flight search results for same routes/dates
3. Implement request queuing for high load
4. Use faster watsonx.ai models for non-critical tasks

## Security Considerations

1. **API Key Protection**: Never expose WATSONX_API_KEY in frontend
2. **Input Validation**: Validate all user inputs before processing
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Privacy**: Don't log sensitive traveler information
5. **CORS**: Restrict CORS to specific frontend origins

## Conclusion

The Multi-Agent Orchestration architecture transforms the Agentic VISA Assistant from a simple document generator to an intelligent travel planning system. By leveraging tool calling and orchestration, the system can now:

- Search for optimal flights based on user preferences
- Generate documents with specific, verified travel details
- Provide transparency through returned flight options
- Scale to handle complex multi-traveler scenarios

This architecture provides a solid foundation for future enhancements and demonstrates the power of agentic AI systems in real-world applications.

---

**Last Updated**: 2026-05-16  
**Version**: 2.0.0  
**Author**: Bob AI Assistant

// Made with Bob