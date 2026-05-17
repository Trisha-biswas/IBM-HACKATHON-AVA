# AGENTS.md - Agentic VISA Assistant System

This file provides guidance to AI agents (like Bob) when working with code in this repository.

## Project Overview

**Name**: Agentic VISA Assistant System  
**Purpose**: Help travelers generate visa documentation (cover letters and itineraries) using IBM watsonx.ai  
**Architecture**: Full-stack Node.js/Express backend + React frontend  
**AI Model**: meta-llama/llama-3-3-70b-instruct via IBM watsonx.ai  
**Authentication**: Single-user system, no user auth required (IBM Cloud IAM for watsonx.ai only)  
**Persistence**: No database - documents generated on-demand only

## Project Structure

```
agentic-visa-assistant/
├── backend/
│   ├── server.js                 # Express server (port 3001)
│   ├── routes/
│   │   └── visa.js              # POST /api/visa/* endpoints
│   ├── services/
│   │   ├── watsonxService.js    # watsonx.ai integration
│   │   └── fileService.js       # PDF generation with pdfkit
│   ├── config/
│   │   └── watsonx.js           # watsonx.ai config
│   ├── utils/
│   │   └── prompts.js           # AI prompt templates
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VisaForm.jsx     # Multi-step form (3 steps)
│   │   │   └── Dashboard.jsx    # Document display/download
│   │   ├── api/
│   │   │   └── visaApi.js       # Axios client for backend
│   │   ├── hooks/
│   │   │   └── useVisaForm.js   # Form state management
│   │   └── App.jsx
│   └── package.json
│
├── AGENTS.md                     # This file
├── PROJECT_PLAN.md              # Detailed architecture plan
└── README.md                    # Setup instructions
```

## Critical Architecture Decisions

### Backend Architecture
- **Port**: Backend runs on port 3001 (hardcoded, not configurable)
- **CORS**: Must allow `http://localhost:5173` (Vite default) for frontend
- **No Database**: All document generation is stateless - no persistence layer
- **PDF Streaming**: PDFs returned as buffers in HTTP response, not saved to disk
- **Error Format**: All errors use `{ error: string, details?: any }` structure

### watsonx.ai Integration
- **Model**: `meta-llama/llama-3-3-70b-instruct` (MUST use this exact model ID)
- **Authentication**: IBM Cloud IAM API key via environment variable `WATSONX_API_KEY`
- **Project ID**: Required in `WATSONX_PROJECT_ID` environment variable
- **Parameters**: 
  - `max_new_tokens: 1000` (for document length control)
  - `temperature: 0.7` (balanced creativity/consistency)
  - `top_p: 0.9` (nucleus sampling)
  - `repetition_penalty: 1.1` (avoid repetitive text)
- **Timeout**: 30 seconds for API calls (watsonx.ai can be slow)
- **Retry Logic**: No automatic retries - fail fast and return error to user

### PDF Generation
- **Library**: pdfkit (NOT puppeteer or other HTML-to-PDF tools)
- **Fonts**: Use built-in Helvetica and Times fonts only (no custom fonts)
- **Page Size**: Letter (8.5" x 11")
- **Margins**: 1 inch on all sides
- **Encoding**: UTF-8 for international character support
- **Output**: Return as Buffer, not file path (no disk writes)

### Frontend Architecture
- **Build Tool**: Vite (NOT Create React App)
- **Port**: Frontend runs on port 5173 (Vite default)
- **State Management**: React hooks only (no Redux/Zustand)
- **Form Steps**: Exactly 3 steps (Personal Info → Travel Details → Additional Info)
- **Validation**: Client-side validation before API calls (no server-side validation)
- **Document Storage**: Session-based array in Dashboard component (cleared on refresh)

## API Endpoints

### POST /api/visa/generate-cover-letter
Generates a formal visa cover letter.

**Request Body**:
```json
{
  "personalInfo": {
    "fullName": "string (required)",
    "nationality": "string (required)",
    "passportNumber": "string (required)",
    "dateOfBirth": "string (required, YYYY-MM-DD)"
  },
  "travelInfo": {
    "destination": "string (required)",
    "purpose": "string (required)",
    "duration": "number (required, days)",
    "departureDate": "string (required, YYYY-MM-DD)",
    "returnDate": "string (required, YYYY-MM-DD)"
  },
  "additionalInfo": {
    "occupation": "string (required)",
    "employer": "string (required)",
    "accommodations": "string (required)",
    "previousVisits": "boolean (optional)"
  }
}
```

**Response**: PDF buffer with `Content-Type: application/pdf`

### POST /api/visa/generate-itinerary
Generates a day-by-day travel itinerary.

**Request Body**: Same as above

**Response**: PDF buffer with `Content-Type: application/pdf`

### POST /api/visa/generate-complete-package
Generates both cover letter and itinerary as separate PDFs.

**Request Body**: Same as above

**Response**:
```json
{
  "coverLetter": "base64-encoded PDF",
  "itinerary": "base64-encoded PDF",
  "metadata": {
    "generatedAt": "ISO 8601 timestamp",
    "travelerName": "string",
    "destination": "string"
  }
}
```

## Environment Variables

### Backend (.env)
```env
PORT=3001                                    # Server port (do not change)
NODE_ENV=development                         # development | production
WATSONX_API_KEY=your_ibm_cloud_api_key      # IBM Cloud IAM API key (required)
WATSONX_PROJECT_ID=your_project_id          # watsonx.ai project ID (required)
WATSONX_URL=https://us-south.ml.cloud.ibm.com  # watsonx.ai endpoint
FRONTEND_URL=http://localhost:5173          # For CORS configuration
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001     # Backend URL (must match backend port)
```

**IMPORTANT**: Never commit `.env` files. Always use `.env.example` for templates.

## Prompt Engineering Guidelines

### Cover Letter Prompts
- **Tone**: Formal, professional, respectful
- **Length**: 300-500 words (enforced via `max_new_tokens`)
- **Structure**: Business letter format with clear sections
- **Content**: Must include purpose, financial capability, ties to home country
- **Addressee**: "Visa Officer" at the destination country's embassy

### Itinerary Prompts
- **Format**: Day-by-day breakdown with dates
- **Detail Level**: Specific activities, times, locations
- **Realism**: Visa-officer friendly (not overly ambitious)
- **Sections**: Date headers, bullet points for activities, accommodation details
- **Transportation**: Include travel between locations

**Template Location**: `backend/utils/prompts.js` contains all prompt templates

## Development Workflow

### Starting the Application
1. **Backend**: `cd backend && npm run dev` (uses nodemon)
2. **Frontend**: `cd frontend && npm run dev` (uses Vite)
3. Both must run simultaneously for full functionality

### Testing Endpoints
- Use Thunder Client, Postman, or curl
- Example curl for cover letter:
```bash
curl -X POST http://localhost:3001/api/visa/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d @test-data.json \
  --output cover-letter.pdf
```

### Common Issues

#### watsonx.ai API Errors
- **401 Unauthorized**: Check `WATSONX_API_KEY` is valid and not expired
- **404 Not Found**: Verify `WATSONX_PROJECT_ID` is correct
- **Timeout**: watsonx.ai can be slow; increase timeout if needed
- **Rate Limit**: IBM Cloud has rate limits; implement exponential backoff if needed

#### PDF Generation Errors
- **Font Not Found**: Only use Helvetica, Times, Courier (built-in fonts)
- **Memory Issues**: Large documents may cause memory issues; keep content under 1000 tokens
- **Encoding Issues**: Ensure UTF-8 encoding for international characters

#### CORS Errors
- **Frontend can't reach backend**: Check `FRONTEND_URL` in backend `.env`
- **Preflight failures**: Ensure CORS middleware is before routes in `server.js`

## Code Style Guidelines

### Backend
- Use `async/await` for all asynchronous operations (no callbacks)
- Use `try/catch` blocks for error handling
- Export functions as named exports (not default exports)
- Use descriptive variable names (e.g., `coverLetterText`, not `text`)
- Add JSDoc comments for all exported functions

### Frontend
- Use functional components with hooks (no class components)
- Use `const` for component definitions
- Destructure props in function parameters
- Use meaningful state variable names (e.g., `isGenerating`, not `loading`)
- Add PropTypes or TypeScript types for all components

### General
- Use 2 spaces for indentation (not tabs)
- Use single quotes for strings (except JSON)
- Add blank lines between logical sections
- Keep functions under 50 lines when possible
- Comment complex logic, not obvious code

## Testing Strategy

### Manual Testing Checklist
- [ ] Form validation works for all fields
- [ ] Multi-step navigation (Next/Previous) works
- [ ] Cover letter generates successfully
- [ ] Itinerary generates successfully
- [ ] Complete package generates both documents
- [ ] PDFs download correctly
- [ ] Error messages display for API failures
- [ ] Loading states show during generation

### Test Data
Use this sample data for testing:
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

## Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "pdfkit": "^0.13.0",
    "@ibm-cloud/watsonx-ai": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

## Security Considerations

### API Key Management
- **Never** commit `.env` files to version control
- **Never** expose `WATSONX_API_KEY` in frontend code
- **Always** use environment variables for sensitive data
- **Rotate** API keys regularly (every 90 days recommended)

### Input Validation
- Validate all user inputs on frontend before API calls
- Sanitize inputs to prevent injection attacks
- Limit string lengths to prevent buffer overflows
- Validate date formats (YYYY-MM-DD only)

### CORS Configuration
- Only allow specific frontend origin (not wildcard `*`)
- Use `credentials: true` if adding authentication later
- Restrict allowed methods to POST only for generation endpoints

## Performance Optimization

### Backend
- **Caching**: Consider caching watsonx.ai responses for identical inputs (future enhancement)
- **Streaming**: Stream PDFs directly to response (don't buffer in memory)
- **Timeouts**: Set reasonable timeouts (30s for watsonx.ai, 10s for PDF generation)
- **Rate Limiting**: Add rate limiting middleware if deploying publicly

### Frontend
- **Lazy Loading**: Load Dashboard component only when needed
- **Debouncing**: Debounce form validation to reduce re-renders
- **Memoization**: Use `useMemo` for expensive computations
- **Code Splitting**: Split routes if adding more pages

## Deployment Considerations

### Backend Deployment
- Set `NODE_ENV=production` in production environment
- Use process manager (PM2) for Node.js process management
- Configure reverse proxy (nginx) for SSL termination
- Set up logging (Winston or Bunyan) for production debugging

### Frontend Deployment
- Build with `npm run build` (creates `dist/` folder)
- Serve static files with nginx or CDN
- Configure environment variables for production API URL
- Enable gzip compression for faster loading

### Environment-Specific Configuration
- **Development**: Use localhost URLs, verbose logging
- **Staging**: Use staging watsonx.ai project, moderate logging
- **Production**: Use production watsonx.ai project, minimal logging

## Troubleshooting Guide

### "Cannot connect to backend"
1. Check backend is running on port 3001
2. Verify `VITE_API_BASE_URL` in frontend `.env`
3. Check CORS configuration in `server.js`
4. Inspect browser console for CORS errors

### "watsonx.ai API error"
1. Verify `WATSONX_API_KEY` is valid (test with curl)
2. Check `WATSONX_PROJECT_ID` is correct
3. Ensure IBM Cloud account has watsonx.ai access
4. Check IBM Cloud service status page

### "PDF generation failed"
1. Check pdfkit is installed (`npm list pdfkit`)
2. Verify content length is under 1000 tokens
3. Check for special characters causing encoding issues
4. Inspect server logs for detailed error messages

### "Form validation not working"
1. Check browser console for JavaScript errors
2. Verify validation logic in `VisaForm.jsx`
3. Test with simple inputs first
4. Check React DevTools for state updates

## Future Enhancements (Not Implemented)

These features are intentionally NOT included in the current version:
- Database integration for request history
- User authentication and multi-user support
- Document templates and customization
- Email delivery of generated documents
- Payment integration
- Multi-language support
- Admin dashboard
- Analytics and reporting

If implementing any of these, create a new plan and update this AGENTS.md file.

## Contact and Support

For questions about this project:
1. Review this AGENTS.md file first
2. Check PROJECT_PLAN.md for detailed architecture
3. Review README.md for setup instructions
4. Check IBM watsonx.ai documentation for API issues

## Version History

- **v1.0.0** (2026-05-02): Initial project structure and planning
  - Defined architecture with Node.js/Express backend and React frontend
  - Integrated IBM watsonx.ai with meta-llama/llama-3-3-70b-instruct
  - Implemented PDF generation with pdfkit
  - Created multi-step form and dashboard components
  - No database, single-user system, on-demand document generation

---

**Last Updated**: 2026-05-02  
**Maintained By**: Bob AI Assistant  
**Project Status**: Planning Phase Complete, Ready for Implementation