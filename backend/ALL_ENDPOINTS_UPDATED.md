# All Endpoints Updated to New Format

## Summary
All API endpoints have been updated to accept the new simplified request format. The old nested structure (personalInfo, travelInfo, additionalInfo) is no longer required.

## Updated Endpoints

### 1. POST /api/visa/generate-cover-letter ✅
**Purpose**: Generate a single cover letter PDF  
**Behavior**: Uses the first traveler from the travelers array

**Request Format**:
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
      "name": "suvu",
      "sponsorType": "employer",
      "sponsorOrg": "Google"
    }
  ],
  "transport": "flight",
  "purpose": "tourism",
  "interests": [{"id": 1, "label": "Art"}],
  "specialRequests": "abcdef"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cover letter generated successfully",
  "downloadUrl": "/downloads/suvu-cover-letter-1746221144000.pdf",
  "fileName": "suvu-cover-letter-1746221144000.pdf",
  "travelerName": "suvu",
  "destination": "AT",
  "generatedAt": "2026-05-02T22:00:00.000Z"
}
```

### 2. POST /api/visa/generate-itinerary ✅
**Purpose**: Generate a single itinerary PDF  
**Behavior**: Uses the first traveler from the travelers array

**Request Format**: Same as above

**Response**:
```json
{
  "success": true,
  "message": "Itinerary generated successfully",
  "downloadUrl": "/downloads/suvu-itinerary-1746221144000.pdf",
  "fileName": "suvu-itinerary-1746221144000.pdf",
  "travelerName": "suvu",
  "destination": "AT",
  "generatedAt": "2026-05-02T22:00:00.000Z"
}
```

### 3. POST /api/visa/generate-complete-package ✅
**Purpose**: Generate both cover letter and itinerary as a ZIP package  
**Behavior**: Uses the first traveler from the travelers array

**Request Format**: Same as above

**Response**:
```json
{
  "success": true,
  "message": "Complete visa package generated successfully",
  "coverLetter": {
    "downloadUrl": "/downloads/suvu-cover-letter-1746221144000.pdf",
    "fileName": "suvu-cover-letter-1746221144000.pdf"
  },
  "itinerary": {
    "downloadUrl": "/downloads/suvu-itinerary-1746221144000.pdf",
    "fileName": "suvu-itinerary-1746221144000.pdf"
  },
  "package": {
    "downloadUrl": "/downloads/visa-package-suvu-1746221144000.zip",
    "fileName": "visa-package-suvu-1746221144000.zip"
  },
  "metadata": {
    "generatedAt": "2026-05-02T22:00:00.000Z",
    "travelerName": "suvu",
    "destination": "AT"
  }
}
```

### 4. POST /api/visa/orchestrate-batch ✅
**Purpose**: Generate documents for multiple travelers in parallel  
**Behavior**: Processes all travelers in the travelers array

**Request Format**: Same as above (but processes all travelers)

**Response**:
```json
{
  "success": true,
  "message": "Batch processing completed",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "results": [
    {
      "travelerName": "suvu",
      "destination": "AT",
      "status": "success",
      "coverLetter": "...",
      "itinerary": "...",
      "files": {
        "coverLetter": "/downloads/suvu-cover-letter-1746221144000.pdf",
        "itinerary": "/downloads/suvu-itinerary-1746221144000.pdf",
        "package": "/downloads/visa-package-suvu-1746221144000.zip"
      }
    },
    {
      "travelerName": "Trisha",
      "destination": "AT",
      "status": "success",
      "coverLetter": "...",
      "itinerary": "...",
      "files": {
        "coverLetter": "/downloads/Trisha-cover-letter-1746221144000.pdf",
        "itinerary": "/downloads/Trisha-itinerary-1746221144000.pdf",
        "package": "/downloads/visa-package-Trisha-1746221144000.zip"
      }
    }
  ]
}
```

### 5. POST /api/visa/request ✅
**Purpose**: Generate documents with request-specific folder structure  
**Behavior**: Processes all travelers and creates a request folder with metadata

**Request Format**: Same as above

**Response**:
```json
{
  "success": true,
  "message": "Visa request processed successfully",
  "requestId": "req-1746221144000",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "results": [
    {
      "travelerName": "suvu",
      "destination": "AT",
      "status": "success",
      "requestId": "req-1746221144000",
      "files": {
        "coverLetter": "/downloads/req-1746221144000/suvu-cover-letter.pdf",
        "itinerary": "/downloads/req-1746221144000/suvu-itinerary.pdf"
      },
      "travelerData": {
        "name": "suvu",
        "destination": "AT",
        "purpose": "tourism",
        "departureDate": "01/05/2026",
        "returnDate": "07/05/2026",
        "sponsorType": "employer",
        "sponsorOrg": "Google"
      }
    }
  ],
  "metadataUrl": "/downloads/req-1746221144000/metadata.json"
}
```

### 6. GET /api/visa/dashboard ✅
**Purpose**: Get history of all visa requests  
**Behavior**: Reads all request folders and returns metadata

**Response**:
```json
{
  "success": true,
  "message": "Found 5 visa requests",
  "requests": [
    {
      "requestId": "req-1746221144000",
      "createdAt": "2026-05-02T22:00:00.000Z",
      "summary": {
        "total": 2,
        "successful": 2,
        "failed": 0
      },
      "travelers": [...],
      "pdfFiles": [
        "/downloads/req-1746221144000/suvu-cover-letter.pdf",
        "/downloads/req-1746221144000/suvu-itinerary.pdf"
      ],
      "metadataUrl": "/downloads/req-1746221144000/metadata.json"
    }
  ],
  "summary": {
    "totalRequests": 5,
    "totalTravelers": 10,
    "successfulGenerations": 10,
    "failedGenerations": 0
  },
  "fetchedAt": "2026-05-02T22:00:00.000Z"
}
```

### 7. GET /api/visa/health ✅
**Purpose**: Health check endpoint  
**Behavior**: Returns service status

**Response**:
```json
{
  "status": "healthy",
  "service": "Agentic VISA Assistant API",
  "timestamp": "2026-05-02T22:00:00.000Z"
}
```

## Required Fields

### Mandatory:
- `travelers` (array, non-empty) - Array of traveler objects
- `fromCountry` (string) - Origin country code
- `toCountry` (string) - Destination country code
- `startDate` (string, DD/MM/YYYY) - Trip start date
- `endDate` (string, DD/MM/YYYY) - Trip end date

### Optional:
- `budget` (string) - Trip budget
- `numTravelers` (number) - Number of travelers
- `transport` (string) - Preferred transport mode
- `purpose` (string) - Trip purpose
- `interests` (array) - Array of interest objects with id and label
- `specialRequests` (string) - Any special requests

### Traveler Object:
- `name` (required) - Traveler's full name
- `sponsorType` (optional) - Type of sponsor (e.g., "employer", "self")
- `sponsorOrg` (optional) - Sponsor organization name

## Validation

All endpoints now validate:
1. `travelers` array exists and is non-empty
2. `fromCountry` and `toCountry` are present
3. `startDate` and `endDate` are present

If validation fails, endpoints return:
```json
{
  "error": "Missing required fields",
  "details": "Specific error message"
}
```

## Testing

Test all endpoints with:
```bash
curl -X POST http://localhost:3001/api/visa/generate-itinerary \
  -H "Content-Type: application/json" \
  -d @backend/test-data-new-format.json
```

Replace `/generate-itinerary` with any endpoint path.

## Migration Notes

**Breaking Change**: The old format with `personalInfo`, `travelInfo`, and `additionalInfo` is no longer supported.

**Before** (Old Format):
```json
{
  "personalInfo": {
    "fullName": "John Doe",
    "nationality": "United States",
    "passportNumber": "123456789",
    "dateOfBirth": "1990-01-15"
  },
  "travelInfo": {
    "destination": "France",
    "purpose": "Tourism",
    "duration": 14,
    "departureDate": "2026-07-01",
    "returnDate": "2026-07-15"
  },
  "additionalInfo": {
    "occupation": "Software Engineer",
    "employer": "Tech Corp",
    "accommodations": "Hotel Booking Confirmed",
    "previousVisits": false
  }
}
```

**After** (New Format):
```json
{
  "fromCountry": "US",
  "toCountry": "FR",
  "startDate": "01/07/2026",
  "endDate": "15/07/2026",
  "budget": "5000",
  "travelers": [
    {
      "name": "John Doe",
      "sponsorType": "employer",
      "sponsorOrg": "Tech Corp"
    }
  ],
  "transport": "flight",
  "purpose": "tourism",
  "interests": [{"id": 1, "label": "Culture"}],
  "specialRequests": "Hotel booking confirmed"
}
```

## Benefits

1. **Simplified Structure**: Flat structure, easier to work with
2. **Multi-Traveler Support**: Native support for multiple travelers
3. **Flexible Fields**: Easy to add new fields without restructuring
4. **Better Semantics**: Field names directly reflect their purpose
5. **Consistent Format**: Same format across all endpoints

---

**Last Updated**: 2026-05-02  
**Status**: All Endpoints Updated ✅