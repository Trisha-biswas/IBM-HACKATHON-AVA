# New Request Format Guide

## Overview

The Agentic VISA Assistant now accepts a simplified request format that is more intuitive and easier to use. The system automatically transforms this format into the internal structure required for document generation.

## New Request Format

### Complete Example

```json
{
  "fromCountry": "IN",
  "toCountry": "AT",
  "startDate": "01/05/2026",
  "endDate": "07/05/2026",
  "budget": "20,000",
  "numTravelers": 2,
  "travelers": [
    {
      "name": "Suvu",
      "sponsorType": "employer",
      "sponsorOrg": "Google"
    },
    {
      "name": "Trisha",
      "sponsorType": "employer",
      "sponsorOrg": "IBM"
    }
  ],
  "transport": "flight",
  "purpose": "tourism",
  "interests": [
    {
      "id": 1,
      "label": "Art"
    },
    {
      "id": 2,
      "label": "History"
    }
  ],
  "specialRequests": "Would like to visit museums and historical sites. Prefer vegetarian food options."
}
```

## Field Specifications

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `fromCountry` | string | Origin country code (ISO 3166-1 alpha-2) | "IN", "US", "GB" |
| `toCountry` | string | Destination country code | "AT", "FR", "JP" |
| `startDate` | string | Trip start date (DD/MM/YYYY) | "01/05/2026" |
| `endDate` | string | Trip end date (DD/MM/YYYY) | "07/05/2026" |
| `numTravelers` | number | Number of travelers | 2 |
| `travelers` | array | Array of traveler objects | See below |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `budget` | string | Trip budget | null |
| `transport` | string | Mode of transport | "flight" |
| `purpose` | string | Purpose of visit | "Tourism" |
| `interests` | array | Array of interest objects | [] |
| `specialRequests` | string | Special requests or notes | "None" |

### Traveler Object

Each traveler object must contain:

```json
{
  "name": "string (required)",
  "sponsorType": "string (required)",
  "sponsorOrg": "string (optional)"
}
```

**Sponsor Types:**
- `"employer"` - Sponsored by employer
- `"self"` - Self-sponsored
- `"family"` - Sponsored by family member
- `"organization"` - Sponsored by organization

### Interest Object

```json
{
  "id": number,
  "label": "string"
}
```

**Common Interests:**
- Art
- History
- Culture
- Nature
- Adventure
- Food
- Shopping
- Sports
- Music
- Architecture

## Country Codes

### Supported Country Codes

| Code | Country |
|------|---------|
| IN | India |
| AT | Austria |
| US | United States |
| GB | United Kingdom |
| FR | France |
| DE | Germany |
| IT | Italy |
| ES | Spain |
| JP | Japan |
| CN | China |
| CA | Canada |
| AU | Australia |
| NZ | New Zealand |
| SG | Singapore |
| AE | United Arab Emirates |
| CH | Switzerland |
| NL | Netherlands |
| BE | Belgium |
| SE | Sweden |
| NO | Norway |
| DK | Denmark |
| FI | Finland |
| IE | Ireland |
| PT | Portugal |
| GR | Greece |
| TR | Turkey |
| EG | Egypt |
| ZA | South Africa |
| BR | Brazil |
| MX | Mexico |
| AR | Argentina |
| CL | Chile |
| KR | South Korea |
| TH | Thailand |
| MY | Malaysia |
| ID | Indonesia |
| PH | Philippines |
| VN | Vietnam |

## Transformation Logic

The system automatically transforms the new format to the internal format:

### Date Transformation
- Input: `"01/05/2026"` (DD/MM/YYYY)
- Output: `"2026-05-01"` (YYYY-MM-DD)

### Duration Calculation
- Automatically calculated from `startDate` and `endDate`
- Example: 01/05/2026 to 07/05/2026 = 6 days

### Country Name Resolution
- Input: `"IN"` → Output: `"India"`
- Input: `"AT"` → Output: `"Austria"`

### Interests Formatting
- Input: `[{id: 1, label: "Art"}, {id: 2, label: "History"}]`
- Output: `"Art, History"`

### Passport Number Generation
- Automatically generates placeholder passport numbers
- Format: `{CountryCode}{9-digit-number}`
- Example: `"IN123456789"`

## API Usage

### Endpoint
```
POST /api/visa/request
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
Use the new format as shown in the complete example above.

### Response
```json
{
  "success": true,
  "requestId": "req-1714689600000",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "results": [
    {
      "travelerName": "Suvu",
      "destination": "Austria",
      "status": "success",
      "requestId": "req-1714689600000",
      "files": {
        "coverLetter": "/downloads/req-1714689600000/cover-letter-Suvu-1714689600123.pdf",
        "itinerary": "/downloads/req-1714689600000/itinerary-Suvu-1714689600456.pdf"
      },
      "travelerData": {
        "fullName": "Suvu",
        "destination": "Austria",
        "purpose": "tourism",
        "departureDate": "2026-05-01",
        "returnDate": "2026-05-07"
      },
      "generatedAt": "2026-05-02T21:00:00.000Z"
    }
  ],
  "metadataUrl": "/downloads/req-1714689600000/metadata.json"
}
```

## Validation Rules

### Required Field Validation
- All required fields must be present
- `travelers` array length must match `numTravelers`
- Each traveler must have `name` and `sponsorType`

### Date Validation
- Dates must be in DD/MM/YYYY format
- `endDate` must be after `startDate`
- Dates must be valid calendar dates

### Country Code Validation
- Must be valid ISO 3166-1 alpha-2 codes
- Both `fromCountry` and `toCountry` are required

### Traveler Validation
- At least 1 traveler required
- Maximum recommended: 10 travelers per request
- Each traveler must have unique name (recommended)

## Error Responses

### Invalid Format
```json
{
  "error": "Invalid request format",
  "details": [
    "fromCountry is required",
    "endDate must be after startDate",
    "travelers[0].name is required"
  ]
}
```

### Validation Failure
```json
{
  "error": "Invalid request format",
  "details": [
    "travelers array length (1) must match numTravelers (2)"
  ]
}
```

## Testing

### Test with curl

```bash
curl -X POST http://localhost:3001/api/visa/request \
  -H "Content-Type: application/json" \
  -d @backend/test-data-new-format.json
```

### Test with Node.js script

```bash
cd backend
node test-new-format.js
```

### Test with Postman

1. Create new POST request
2. URL: `http://localhost:3001/api/visa/request`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON (use example above)
5. Send request

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function createVisaRequest() {
  const request = {
    fromCountry: 'IN',
    toCountry: 'AT',
    startDate: '01/05/2026',
    endDate: '07/05/2026',
    budget: '20,000',
    numTravelers: 2,
    travelers: [
      {
        name: 'Suvu',
        sponsorType: 'employer',
        sponsorOrg: 'Google'
      },
      {
        name: 'Trisha',
        sponsorType: 'employer',
        sponsorOrg: 'IBM'
      }
    ],
    transport: 'flight',
    purpose: 'tourism',
    interests: [
      { id: 1, label: 'Art' },
      { id: 2, label: 'History' }
    ],
    specialRequests: 'Prefer vegetarian food options'
  };

  try {
    const response = await axios.post(
      'http://localhost:3001/api/visa/request',
      request
    );
    
    console.log('Request ID:', response.data.requestId);
    console.log('Files:', response.data.results[0].files);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### React Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function VisaRequestForm() {
  const [formData, setFormData] = useState({
    fromCountry: 'IN',
    toCountry: 'AT',
    startDate: '01/05/2026',
    endDate: '07/05/2026',
    budget: '20,000',
    numTravelers: 1,
    travelers: [
      {
        name: '',
        sponsorType: 'self',
        sponsorOrg: ''
      }
    ],
    transport: 'flight',
    purpose: 'tourism',
    interests: [],
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/visa/request',
        formData
      );
      
      setResult(response.data);
      alert('Visa documents generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields here */}
      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Documents'}
      </button>
      
      {result && (
        <div className="results">
          <h3>Request ID: {result.requestId}</h3>
          {result.results.map((r, i) => (
            <div key={i}>
              <h4>{r.travelerName}</h4>
              <a href={r.files.coverLetter}>Download Cover Letter</a>
              <a href={r.files.itinerary}>Download Itinerary</a>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
```

## Benefits of New Format

1. **Simplified Input**: Fewer nested objects, more intuitive structure
2. **Country Codes**: Standard ISO codes instead of full names
3. **Date Format**: Common DD/MM/YYYY format
4. **Interests**: Structured array for better categorization
5. **Budget**: Explicit budget field for financial planning
6. **Transport**: Explicit transport mode for itinerary planning
7. **Special Requests**: Flexible field for custom requirements

## Migration from Old Format

If you have existing code using the old format, you can continue using the other endpoints:
- `POST /api/visa/generate-cover-letter`
- `POST /api/visa/generate-itinerary`
- `POST /api/visa/generate-complete-package`

Or transform your data to the new format using the transformation utility:

```javascript
const { transformRequest } = require('./utils/requestTransformer');

// Old format data
const oldFormat = { /* ... */ };

// Transform to new format (manual mapping required)
const newFormat = {
  fromCountry: 'IN',
  toCountry: oldFormat.travelInfo.destination,
  // ... map other fields
};
```

## Troubleshooting

### Issue: "Invalid date format"
**Solution**: Ensure dates are in DD/MM/YYYY format, not MM/DD/YYYY or YYYY-MM-DD

### Issue: "Country code not recognized"
**Solution**: Use ISO 3166-1 alpha-2 codes (2 letters), check supported codes list

### Issue: "travelers array length mismatch"
**Solution**: Ensure `travelers.length === numTravelers`

### Issue: "Transformation failed"
**Solution**: Check all required fields are present and in correct format

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Author**: Agentic VISA Assistant Team