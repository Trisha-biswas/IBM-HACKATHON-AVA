# Dashboard Endpoint Documentation

## Overview
The GET /api/visa/dashboard endpoint provides a complete history of all visa requests by reading the file system.

## Endpoint Details

**Method**: GET  
**Path**: `/api/visa/dashboard`  
**Authentication**: None (single-user system)  
**Response Type**: JSON

## How It Works

### 1. Directory Scanning
```javascript
// Reads backend/public/downloads directory
const entries = fs.readdirSync(DOWNLOADS_DIR, { withFileTypes: true });
const requestFolders = entries.filter(entry => 
  entry.isDirectory() && entry.name.startsWith('req-')
);
```

### 2. Metadata Parsing
For each request folder (e.g., `req-1777758310168`):
- Reads `metadata.json` file
- Extracts traveler details and trip information
- Counts successful/failed generations

### 3. PDF File Discovery
```javascript
// Scans folder for all PDF files
const files = fs.readdirSync(folderPath);
const pdfFiles = files.filter(f => f.endsWith('.pdf'));

// Maps to accessible URLs
pdfFiles.map(f => `/downloads/${requestId}/${f}`)
```

### 4. Error Handling
- Returns empty array if downloads directory doesn't exist
- Handles missing metadata.json gracefully
- Includes folders even if metadata parsing fails

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Found 5 visa requests",
  "requests": [
    {
      "requestId": "req-1777758310168",
      "createdAt": "2026-05-02T22:00:00.000Z",
      "summary": {
        "total": 2,
        "successful": 2,
        "failed": 0
      },
      "travelers": [
        {
          "name": "Suvu",
          "destination": "AT",
          "status": "success",
          "files": {
            "coverLetter": "/downloads/req-1777758310168/cover-letter-Suvu-1777758400575.pdf",
            "itinerary": "/downloads/req-1777758310168/itinerary-Suvu-1777758400677.pdf"
          },
          "travelerData": {
            "name": "Suvu",
            "destination": "AT",
            "purpose": "tourism",
            "departureDate": "01/05/2026",
            "returnDate": "07/05/2026",
            "sponsorType": "employer",
            "sponsorOrg": "Google"
          }
        },
        {
          "name": "Trisha",
          "destination": "AT",
          "status": "success",
          "files": {
            "coverLetter": "/downloads/req-1777758310168/cover-letter-Trisha-1777758400632.pdf",
            "itinerary": "/downloads/req-1777758310168/itinerary-Trisha-1777758400657.pdf"
          },
          "travelerData": {
            "name": "Trisha",
            "destination": "AT",
            "purpose": "tourism",
            "departureDate": "01/05/2026",
            "returnDate": "07/05/2026",
            "sponsorType": "employer",
            "sponsorOrg": "IBM"
          }
        }
      ],
      "pdfFiles": [
        "/downloads/req-1777758310168/cover-letter-Suvu-1777758400575.pdf",
        "/downloads/req-1777758310168/itinerary-Suvu-1777758400677.pdf",
        "/downloads/req-1777758310168/cover-letter-Trisha-1777758400632.pdf",
        "/downloads/req-1777758310168/itinerary-Trisha-1777758400657.pdf"
      ],
      "metadataUrl": "/downloads/req-1777758310168/metadata.json"
    }
  ],
  "summary": {
    "totalRequests": 5,
    "totalTravelers": 10,
    "successfulGenerations": 10,
    "failedGenerations": 0
  },
  "fetchedAt": "2026-05-03T03:30:00.000Z"
}
```

### Empty Response (No Requests)
```json
{
  "success": true,
  "message": "No requests found",
  "requests": [],
  "summary": {
    "totalRequests": 0,
    "totalTravelers": 0,
    "successfulGenerations": 0,
    "failedGenerations": 0
  }
}
```

### Folder Without Metadata
```json
{
  "requestId": "req-1777758310168",
  "createdAt": null,
  "summary": {
    "total": 0,
    "successful": 0,
    "failed": 0
  },
  "travelers": [],
  "pdfFiles": [
    "/downloads/req-1777758310168/some-file.pdf"
  ],
  "metadataUrl": null,
  "note": "No metadata found for this request"
}
```

### Folder With Parse Error
```json
{
  "requestId": "req-1777758310168",
  "createdAt": null,
  "summary": {
    "total": 0,
    "successful": 0,
    "failed": 0
  },
  "travelers": [],
  "pdfFiles": [],
  "metadataUrl": null,
  "error": "Failed to parse metadata: Unexpected token in JSON"
}
```

## Response Fields

### Top Level
- `success` (boolean): Always true for successful API call
- `message` (string): Human-readable message
- `requests` (array): Array of request objects
- `summary` (object): Aggregate statistics
- `fetchedAt` (string): ISO 8601 timestamp of when data was fetched

### Request Object
- `requestId` (string): Unique request identifier (e.g., "req-1777758310168")
- `createdAt` (string|null): ISO 8601 timestamp of request creation
- `summary` (object): Request-level statistics
  - `total` (number): Total travelers in request
  - `successful` (number): Successfully generated documents
  - `failed` (number): Failed generations
- `travelers` (array): Array of traveler objects with details
- `pdfFiles` (array): Array of PDF download URLs
- `metadataUrl` (string|null): URL to metadata.json file
- `note` (string, optional): Note if metadata is missing
- `error` (string, optional): Error message if parsing failed

### Traveler Object (from metadata)
- `name` (string): Traveler's name
- `destination` (string): Destination country code
- `status` (string): "success" or "error"
- `files` (object|null): Download URLs for documents
  - `coverLetter` (string): Cover letter PDF URL
  - `itinerary` (string): Itinerary PDF URL
- `travelerData` (object|null): Full traveler information
  - `name` (string): Traveler's name
  - `destination` (string): Destination country
  - `purpose` (string): Trip purpose
  - `departureDate` (string): Start date (DD/MM/YYYY)
  - `returnDate` (string): End date (DD/MM/YYYY)
  - `sponsorType` (string): Sponsor type
  - `sponsorOrg` (string): Sponsor organization
- `error` (string|null): Error message if generation failed

### Summary Object
- `totalRequests` (number): Total number of requests
- `totalTravelers` (number): Total number of travelers across all requests
- `successfulGenerations` (number): Total successful document generations
- `failedGenerations` (number): Total failed document generations

## Sorting

Requests are sorted by creation date (newest first):
```javascript
requests.sort((a, b) => {
  if (!a.createdAt) return 1;
  if (!b.createdAt) return -1;
  return new Date(b.createdAt) - new Date(a.createdAt);
});
```

## File Structure

The endpoint reads from this structure:
```
backend/public/downloads/
├── req-1777758310168/
│   ├── metadata.json
│   ├── cover-letter-Suvu-1777758400575.pdf
│   ├── itinerary-Suvu-1777758400677.pdf
│   ├── cover-letter-Trisha-1777758400632.pdf
│   └── itinerary-Trisha-1777758400657.pdf
├── req-1777759000000/
│   ├── metadata.json
│   └── ...
└── itinerary-suvu-1777759762825.pdf (standalone file, ignored)
```

**Note**: Only folders starting with "req-" are processed. Standalone PDF files in the downloads root are ignored.

## Usage Examples

### cURL
```bash
curl http://localhost:3001/api/visa/dashboard
```

### JavaScript (Axios)
```javascript
const response = await axios.get('http://localhost:3001/api/visa/dashboard');
console.log(response.data.requests);
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3001/api/visa/dashboard');
const data = await response.json();
console.log(data.summary);
```

### React Component
```jsx
import { useEffect, useState } from 'react';

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/visa/dashboard')
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests);
        setSummary(data.summary);
      });
  }, []);

  return (
    <div>
      <h1>Visa Requests Dashboard</h1>
      <p>Total Requests: {summary?.totalRequests}</p>
      <p>Total Travelers: {summary?.totalTravelers}</p>
      
      {requests.map(req => (
        <div key={req.requestId}>
          <h2>{req.requestId}</h2>
          <p>Created: {new Date(req.createdAt).toLocaleString()}</p>
          <p>Travelers: {req.travelers.length}</p>
          
          <h3>Documents:</h3>
          <ul>
            {req.pdfFiles.map(file => (
              <li key={file}>
                <a href={`http://localhost:3001${file}`} download>
                  {file.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## Testing

Run the test script:
```bash
cd backend
node test-dashboard.js
```

Expected output:
```
🧪 Testing Dashboard Endpoint

============================================================

📊 Test: Fetching dashboard data...
📤 Sending GET request to http://localhost:3001/api/visa/dashboard

✅ Dashboard Response:
{
  "success": true,
  "message": "Found 1 visa requests",
  "requests": [...],
  "summary": {...}
}

📈 Summary:
   Total Requests: 1
   Total Travelers: 2
   Successful: 2
   Failed: 0

📋 Recent Requests:

   1. Request ID: req-1777758310168
      Created: 2026-05-02T22:00:00.000Z
      Travelers: 2
      PDF Files: 4
      Files:
        - /downloads/req-1777758310168/cover-letter-Suvu-1777758400575.pdf
        - /downloads/req-1777758310168/itinerary-Suvu-1777758400677.pdf
        - /downloads/req-1777758310168/cover-letter-Trisha-1777758400632.pdf
        - /downloads/req-1777758310168/itinerary-Trisha-1777758400657.pdf

✅ Dashboard test completed successfully!
```

## Error Scenarios

### Server Not Running
```
❌ Error: Cannot connect to server
   Make sure the backend server is running:
   cd backend && npm run dev
```

### Empty Downloads Directory
Returns empty array with zero statistics (not an error).

### Corrupted metadata.json
Includes the folder in results with error message, continues processing other folders.

## Performance Considerations

- **File System I/O**: Synchronous file operations (acceptable for small datasets)
- **Scalability**: For large numbers of requests (>1000), consider:
  - Pagination
  - Caching
  - Database migration
  - Asynchronous file operations

## Security Considerations

- **Path Traversal**: Only reads from DOWNLOADS_DIR, no user input in paths
- **File Access**: Only reads files, never writes or deletes
- **Metadata Validation**: JSON parsing wrapped in try-catch
- **CORS**: Configured to allow frontend access

## Future Enhancements

Potential improvements (not currently implemented):
- Pagination (limit/offset parameters)
- Filtering (by date range, traveler name, status)
- Sorting options (by date, traveler count, status)
- Search functionality
- Request deletion endpoint
- Metadata caching for performance

---

**Last Updated**: 2026-05-03  
**Status**: Fully Implemented ✅  
**Test Script**: `backend/test-dashboard.js`