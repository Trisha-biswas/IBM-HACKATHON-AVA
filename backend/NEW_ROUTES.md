# New Routes Documentation

## POST /api/visa/request

Creates a new visa request with unique request ID and folder structure.

### Endpoint
```
POST /api/visa/request
```

### Request Body
```json
{
  "travelers": [
    {
      "personalInfo": {
        "fullName": "Jane Smith",
        "nationality": "Canada",
        "passportNumber": "CA987654321",
        "dateOfBirth": "1985-03-20"
      },
      "travelInfo": {
        "destination": "Japan",
        "purpose": "Tourism",
        "duration": 10,
        "departureDate": "2026-08-15",
        "returnDate": "2026-08-25"
      },
      "additionalInfo": {
        "occupation": "Marketing Manager",
        "employer": "Global Marketing Inc",
        "accommodations": "Hotel reservations confirmed",
        "previousVisits": true
      }
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Visa request processed successfully",
  "requestId": "req-1714689600000",
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "results": [
    {
      "travelerName": "Jane Smith",
      "destination": "Japan",
      "status": "success",
      "requestId": "req-1714689600000",
      "files": {
        "coverLetter": "/downloads/req-1714689600000/cover-letter-Jane-Smith-1714689600123.pdf",
        "itinerary": "/downloads/req-1714689600000/itinerary-Jane-Smith-1714689600456.pdf"
      },
      "travelerData": {
        "fullName": "Jane Smith",
        "destination": "Japan",
        "purpose": "Tourism",
        "departureDate": "2026-08-15",
        "returnDate": "2026-08-25"
      },
      "generatedAt": "2026-05-02T21:00:00.000Z"
    }
  ],
  "metadataUrl": "/downloads/req-1714689600000/metadata.json"
}
```

### Features

1. **Unique Request ID**: Generates `req-{timestamp}` format
2. **Request Folder**: Creates `public/downloads/{requestId}/` directory
3. **Orchestration**: Uses `orchestrateVisaDocs` service for AI generation
4. **Individual PDFs**: Uses `createIndividualPDF` for branded documents
5. **Metadata Storage**: Saves `metadata.json` with complete request details
6. **Error Handling**: Continues processing even if some travelers fail

### Folder Structure

After request, the structure looks like:
```
public/downloads/
└── req-1714689600000/
    ├── metadata.json
    ├── cover-letter-Jane-Smith-1714689600123.pdf
    ├── itinerary-Jane-Smith-1714689600456.pdf
    ├── cover-letter-John-Doe-1714689600789.pdf
    └── itinerary-John-Doe-1714689601012.pdf
```

### metadata.json Format

```json
{
  "requestId": "req-1714689600000",
  "createdAt": "2026-05-02T21:00:00.000Z",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "travelers": [
    {
      "name": "Jane Smith",
      "destination": "Japan",
      "status": "success",
      "files": {
        "coverLetter": "/downloads/req-1714689600000/cover-letter-Jane-Smith-1714689600123.pdf",
        "itinerary": "/downloads/req-1714689600000/itinerary-Jane-Smith-1714689600456.pdf"
      },
      "travelerData": {
        "fullName": "Jane Smith",
        "destination": "Japan",
        "purpose": "Tourism",
        "departureDate": "2026-08-15",
        "returnDate": "2026-08-25"
      },
      "error": null
    }
  ]
}
```

### Usage Example

```bash
curl -X POST http://localhost:3001/api/visa/request \
  -H "Content-Type: application/json" \
  -d '{
    "travelers": [
      {
        "personalInfo": { ... },
        "travelInfo": { ... },
        "additionalInfo": { ... }
      }
    ]
  }'
```

---

## GET /api/visa/dashboard

Retrieves complete history of all visa requests from the file system.

### Endpoint
```
GET /api/visa/dashboard
```

### Request
No request body required.

### Response
```json
{
  "success": true,
  "message": "Found 5 visa requests",
  "requests": [
    {
      "requestId": "req-1714689600000",
      "createdAt": "2026-05-02T21:00:00.000Z",
      "summary": {
        "total": 2,
        "successful": 2,
        "failed": 0
      },
      "travelers": [
        {
          "name": "Jane Smith",
          "destination": "Japan",
          "status": "success",
          "files": {
            "coverLetter": "/downloads/req-1714689600000/cover-letter-Jane-Smith-1714689600123.pdf",
            "itinerary": "/downloads/req-1714689600000/itinerary-Jane-Smith-1714689600456.pdf"
          },
          "travelerData": {
            "fullName": "Jane Smith",
            "destination": "Japan",
            "purpose": "Tourism",
            "departureDate": "2026-08-15",
            "returnDate": "2026-08-25"
          },
          "error": null
        }
      ],
      "pdfFiles": [
        "/downloads/req-1714689600000/cover-letter-Jane-Smith-1714689600123.pdf",
        "/downloads/req-1714689600000/itinerary-Jane-Smith-1714689600456.pdf"
      ],
      "metadataUrl": "/downloads/req-1714689600000/metadata.json"
    }
  ],
  "summary": {
    "totalRequests": 5,
    "totalTravelers": 10,
    "successfulGenerations": 18,
    "failedGenerations": 2
  },
  "fetchedAt": "2026-05-02T21:30:00.000Z"
}
```

### Features

1. **File System Scan**: Uses `fs.readdirSync` to read all request folders
2. **Metadata Parsing**: Uses `fs.readFileSync` to parse metadata.json files
3. **Statistics**: Aggregates total requests, travelers, successes, and failures
4. **Sorted Results**: Returns requests sorted by creation date (newest first)
5. **Error Resilience**: Continues even if some metadata files are corrupted
6. **PDF Listing**: Lists all PDF files in each request folder

### Usage Example

```bash
curl http://localhost:3001/api/visa/dashboard
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request was successful |
| `message` | string | Summary message |
| `requests` | array | Array of request objects |
| `requests[].requestId` | string | Unique request identifier |
| `requests[].createdAt` | string | ISO 8601 timestamp |
| `requests[].summary` | object | Request statistics |
| `requests[].travelers` | array | Array of traveler data |
| `requests[].pdfFiles` | array | URLs to all PDF files |
| `requests[].metadataUrl` | string | URL to metadata.json |
| `summary` | object | Overall statistics |
| `summary.totalRequests` | number | Total number of requests |
| `summary.totalTravelers` | number | Total number of travelers |
| `summary.successfulGenerations` | number | Successful document generations |
| `summary.failedGenerations` | number | Failed document generations |
| `fetchedAt` | string | When dashboard data was fetched |

### Error Handling

If a request folder exists but metadata.json is missing or corrupted:

```json
{
  "requestId": "req-1714689700000",
  "createdAt": null,
  "summary": { "total": 0, "successful": 0, "failed": 0 },
  "travelers": [],
  "pdfFiles": [
    "/downloads/req-1714689700000/some-file.pdf"
  ],
  "metadataUrl": null,
  "note": "No metadata found for this request"
}
```

---

## Testing the New Routes

### Test Script

Run the comprehensive test script:

```bash
cd backend
node test-request-dashboard.js
```

### Manual Testing

**1. Create a request:**
```bash
curl -X POST http://localhost:3001/api/visa/request \
  -H "Content-Type: application/json" \
  -d @test-data-batch.json
```

**2. View dashboard:**
```bash
curl http://localhost:3001/api/visa/dashboard | json_pp
```

**3. Access metadata:**
```bash
curl http://localhost:3001/downloads/req-1714689600000/metadata.json
```

**4. Download PDF:**
```bash
curl http://localhost:3001/downloads/req-1714689600000/cover-letter-Jane-Smith-1714689600123.pdf \
  --output cover-letter.pdf
```

---

## Integration with Frontend

### React Example - Create Request

```javascript
import axios from 'axios';

async function createVisaRequest(travelers) {
  try {
    const response = await axios.post('/api/visa/request', {
      travelers
    });
    
    console.log('Request ID:', response.data.requestId);
    console.log('Summary:', response.data.summary);
    
    return response.data;
  } catch (error) {
    console.error('Failed to create request:', error);
    throw error;
  }
}
```

### React Example - Fetch Dashboard

```javascript
import axios from 'axios';

async function fetchDashboard() {
  try {
    const response = await axios.get('/api/visa/dashboard');
    
    console.log('Total Requests:', response.data.summary.totalRequests);
    console.log('Recent Requests:', response.data.requests.slice(0, 5));
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    throw error;
  }
}
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await axios.get('/api/visa/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Visa Requests Dashboard</h1>
      <div className="summary">
        <p>Total Requests: {dashboardData.summary.totalRequests}</p>
        <p>Total Travelers: {dashboardData.summary.totalTravelers}</p>
        <p>Successful: {dashboardData.summary.successfulGenerations}</p>
      </div>
      
      <div className="requests">
        {dashboardData.requests.map(request => (
          <div key={request.requestId} className="request-card">
            <h3>{request.requestId}</h3>
            <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
            <p>Travelers: {request.travelers.length}</p>
            <div className="files">
              {request.pdfFiles.map(file => (
                <a key={file} href={file} target="_blank" rel="noopener noreferrer">
                  {file.split('/').pop()}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
```

---

## Performance Considerations

### POST /request
- **Parallel Processing**: Uses `Promise.all` for concurrent AI generation
- **Individual Folders**: Prevents file conflicts between requests
- **Metadata Caching**: Stores metadata for fast dashboard retrieval

### GET /dashboard
- **Synchronous File Operations**: Uses `fs.readdirSync` for simplicity
- **Lazy Loading**: Only reads metadata when needed
- **Sorting**: Sorts by timestamp for recent-first display

### Optimization Tips
1. **Pagination**: Add `?page=1&limit=10` for large datasets
2. **Filtering**: Add `?status=success` to filter results
3. **Caching**: Cache dashboard data with TTL for frequent access
4. **Cleanup**: Implement periodic cleanup of old request folders

---

## Security Considerations

1. **Input Validation**: Validates travelers array before processing
2. **Path Traversal**: Request IDs are timestamp-based, preventing path attacks
3. **File Access**: Only serves files from `public/downloads/` directory
4. **Error Messages**: Doesn't expose internal file paths in errors
5. **Rate Limiting**: Consider adding rate limiting for production

---

## Troubleshooting

### Issue: "No requests found"
**Solution**: Create a request first using POST /request

### Issue: "Failed to parse metadata"
**Solution**: Check if metadata.json is valid JSON, regenerate if corrupted

### Issue: "Request folder not created"
**Solution**: Check write permissions on `public/downloads/` directory

### Issue: "PDFs not accessible"
**Solution**: Verify Express static middleware is configured:
```javascript
app.use('/downloads', express.static('public/downloads'));
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Author**: Agentic VISA Assistant Team