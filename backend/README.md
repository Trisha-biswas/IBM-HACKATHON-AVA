# Agentic VISA Assistant - Backend

Backend API server for the Agentic VISA Assistant System, powered by IBM watsonx.ai.

## Features

- **IBM watsonx.ai Integration**: Uses meta-llama/llama-3-3-70b-instruct for document generation
- **PDF Generation**: Creates professional PDFs using pdfkit
- **ZIP Packaging**: Bundles documents using archiver
- **RESTful API**: Express-based API with comprehensive endpoints
- **Static File Serving**: Serves generated PDFs for download
- **Batch Processing**: Supports multiple traveler document generation

## Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- IBM Cloud account with watsonx.ai access
- IBM Cloud API Key
- watsonx.ai Project ID

## Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your IBM Cloud credentials
```

## Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# IBM watsonx.ai Configuration
WATSONX_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 (or the port specified in .env).

## API Endpoints

### Health Check
```
GET /health
GET /api/visa/health
```

### Generate Cover Letter
```
POST /api/visa/generate-cover-letter
Content-Type: application/json

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

### Generate Itinerary
```
POST /api/visa/generate-itinerary
Content-Type: application/json

(Same request body as cover letter)
```

### Generate Complete Package
```
POST /api/visa/generate-complete-package
Content-Type: application/json

(Same request body as cover letter)

Returns: Cover letter PDF, Itinerary PDF, and ZIP package
```

### Batch Processing
```
POST /api/visa/orchestrate-batch
Content-Type: application/json

{
  "travelers": [
    {
      "personalInfo": { ... },
      "travelInfo": { ... },
      "additionalInfo": { ... }
    },
    // ... more travelers
  ]
}
```

## Project Structure

```
backend/
├── server.js                 # Express server entry point
├── routes/
│   └── visa.js              # API route handlers
├── services/
│   ├── watsonxService.js    # watsonx.ai integration
│   └── fileService.js       # PDF generation
├── utils/
│   └── prompts.js           # AI prompt templates
├── public/
│   └── downloads/           # Generated PDF storage
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
└── package.json             # Dependencies and scripts
```

## Key Functions

### createIndividualPDF
Creates a PDF in a unique request-specific folder with custom branding.

```javascript
const { createIndividualPDF } = require('./services/fileService');

// Create a PDF for a specific request
const pdfUrl = await createIndividualPDF(
  'req-12345',              // requestId - unique identifier
  'Jane Smith',             // travelerName
  'cover-letter',           // documentType ('cover-letter' or 'itinerary')
  'Document content...',    // content - the text to include
  'public/downloads'        // baseDir (optional)
);

// Returns: '/downloads/req-12345/cover-letter-Jane-Smith-1714689600000.pdf'
```

**Features:**
- Creates unique folder per request ID
- Custom header: "Agentic Visa Consultant"
- Includes traveler name in header
- Professional formatting with branded colors
- Returns URL path for direct download
- Uses fs.createWriteStream for efficient file writing

**Test the function:**
```bash
node test-individual-pdf.js
```

## Dependencies

### Production
- `express`: Web framework
- `cors`: CORS middleware
- `dotenv`: Environment variable management
- `pdfkit`: PDF generation
- `archiver`: ZIP file creation
- `@ibm-cloud/watsonx-ai`: IBM watsonx.ai SDK

### Development
- `nodemon`: Auto-reload during development

## Testing

### Test with curl

**Generate Cover Letter:**
```bash
curl -X POST http://localhost:3001/api/visa/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

### Test Data

Create a `test-data.json` file:
```json
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
```

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify all dependencies are installed: `npm install`
- Check .env file exists and has correct values

### watsonx.ai API errors
- Verify WATSONX_API_KEY is valid
- Check WATSONX_PROJECT_ID is correct
- Ensure IBM Cloud account has watsonx.ai access
- Check IBM Cloud service status

### PDF generation fails
- Ensure pdfkit is installed: `npm list pdfkit`
- Check public/downloads directory exists and is writable
- Verify content length is reasonable (< 1000 tokens)

### CORS errors
- Verify FRONTEND_URL in .env matches frontend URL
- Check CORS middleware is configured correctly
- Ensure frontend is running on the specified URL

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Server port |
| NODE_ENV | No | development | Environment mode |
| WATSONX_API_KEY | Yes | - | IBM Cloud API key |
| WATSONX_PROJECT_ID | Yes | - | watsonx.ai project ID |
| WATSONX_URL | No | https://us-south.ml.cloud.ibm.com | watsonx.ai endpoint |
| FRONTEND_URL | No | http://localhost:5173 | Frontend URL for CORS |

## Security Notes

- Never commit .env files to version control
- Rotate API keys regularly (every 90 days)
- Use HTTPS in production
- Implement rate limiting for public deployments
- Validate all user inputs
- Monitor API usage for anomalies

## Performance

- IAM tokens are cached for efficiency
- Parallel document generation for batch processing
- Streaming PDF generation to reduce memory usage
- Configurable timeouts for watsonx.ai calls

## License

MIT

## Support

For issues or questions:
1. Check AGENTS.md for technical details
2. Review PROJECT_PLAN.md for architecture
3. Check logs for error messages
4. Verify IBM Cloud credentials

---

**Built with IBM watsonx.ai**