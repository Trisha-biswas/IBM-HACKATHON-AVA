# Agentic VISA Assistant - Directory Structure

This document provides a detailed breakdown of the project's directory structure with file-by-file descriptions.

## Complete Directory Tree

```
agentic-visa-assistant/
│
├── backend/                          # Node.js/Express backend application
│   ├── server.js                     # Main Express server entry point
│   │
│   ├── routes/                       # API route handlers
│   │   └── visa.js                   # Visa document generation endpoints
│   │
│   ├── services/                     # Business logic services
│   │   ├── watsonxService.js         # IBM watsonx.ai API integration
│   │   └── fileService.js            # PDF generation with pdfkit
│   │
│   ├── config/                       # Configuration files
│   │   └── watsonx.js                # watsonx.ai client configuration
│   │
│   ├── utils/                        # Utility functions
│   │   └── prompts.js                # AI prompt templates for documents
│   │
│   ├── .env                          # Environment variables (gitignored)
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules for backend
│   ├── package.json                  # Backend dependencies and scripts
│   └── package-lock.json             # Locked dependency versions
│
├── frontend/                         # React frontend application
│   ├── public/                       # Static assets
│   │   └── vite.svg                  # Vite logo (default)
│   │
│   ├── src/                          # Source code
│   │   ├── components/               # React components
│   │   │   ├── VisaForm.jsx          # Multi-step form component
│   │   │   └── Dashboard.jsx         # Document display component
│   │   │
│   │   ├── api/                      # API client layer
│   │   │   └── visaApi.js            # Axios-based backend API client
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useVisaForm.js        # Form state management hook
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   └── validation.js         # Form validation helpers
│   │   │
│   │   ├── styles/                   # CSS/styling files
│   │   │   ├── App.css               # Main app styles
│   │   │   ├── VisaForm.css          # Form component styles
│   │   │   └── Dashboard.css         # Dashboard component styles
│   │   │
│   │   ├── App.jsx                   # Root React component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── .env                          # Environment variables (gitignored)
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules for frontend
│   ├── package.json                  # Frontend dependencies and scripts
│   └── package-lock.json             # Locked dependency versions
│
├── .gitignore                        # Root-level git ignore rules
├── AGENTS.md                         # AI agent context and guidelines
├── PROJECT_PLAN.md                   # Detailed architecture plan
├── DIRECTORY_STRUCTURE.md            # This file
├── README.md                         # Setup and usage instructions
└── LICENSE                           # Project license (optional)
```

## File Descriptions

### Backend Files

#### `backend/server.js`
**Purpose**: Express server initialization and configuration  
**Key Responsibilities**:
- Initialize Express application
- Configure middleware (CORS, JSON parser, etc.)
- Mount API routes
- Set up error handling middleware
- Start server on port 3001

**Key Code Sections**:
```javascript
// Express setup
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/visa', visaRoutes);

// Error handling
app.use(errorHandler);

// Server start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### `backend/routes/visa.js`
**Purpose**: Define API endpoints for visa document generation  
**Endpoints**:
- `POST /api/visa/generate-cover-letter` - Generate cover letter PDF
- `POST /api/visa/generate-itinerary` - Generate itinerary PDF
- `POST /api/visa/generate-complete-package` - Generate both documents

**Request Flow**:
1. Receive user data from frontend
2. Validate request body
3. Call watsonxService to generate text
4. Call fileService to create PDF
5. Return PDF buffer or base64-encoded data

#### `backend/services/watsonxService.js`
**Purpose**: Integrate with IBM watsonx.ai API  
**Key Functions**:
- `generateCoverLetter(userData)` - Generate cover letter text
- `generateItinerary(travelData)` - Generate itinerary text
- `callWatsonxAPI(prompt, parameters)` - Core API interaction

**watsonx.ai Parameters**:
```javascript
{
  model_id: 'meta-llama/llama-3-3-70b-instruct',
  parameters: {
    max_new_tokens: 1000,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1
  }
}
```

#### `backend/services/fileService.js`
**Purpose**: Generate PDF documents using pdfkit  
**Key Functions**:
- `generatePDF(content, metadata)` - Create PDF from text
- `formatCoverLetter(text)` - Apply cover letter formatting
- `formatItinerary(text)` - Apply itinerary formatting
- `addHeader(doc, title)` - Add document header
- `addFooter(doc, pageNumber)` - Add page footer

**PDF Configuration**:
```javascript
{
  size: 'LETTER',
  margins: { top: 72, bottom: 72, left: 72, right: 72 },
  font: 'Helvetica',
  fontSize: 12
}
```

#### `backend/config/watsonx.js`
**Purpose**: Configure watsonx.ai client  
**Configuration**:
- API endpoint URL
- Authentication credentials
- Project ID
- Default parameters
- Timeout settings

#### `backend/utils/prompts.js`
**Purpose**: Store AI prompt templates  
**Templates**:
- Cover letter system prompt
- Cover letter user prompt template
- Itinerary system prompt
- Itinerary user prompt template

**Template Structure**:
```javascript
module.exports = {
  coverLetterPrompt: (userData) => `...`,
  itineraryPrompt: (travelData) => `...`
};
```

#### `backend/.env.example`
**Purpose**: Template for environment variables  
**Contents**:
```env
PORT=3001
NODE_ENV=development
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
FRONTEND_URL=http://localhost:5173
```

#### `backend/package.json`
**Purpose**: Backend dependencies and scripts  
**Key Dependencies**:
- express: ^4.18.2
- cors: ^2.8.5
- dotenv: ^16.3.1
- axios: ^1.6.0
- pdfkit: ^0.13.0
- @ibm-cloud/watsonx-ai: ^1.0.0

**Scripts**:
```json
{
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### Frontend Files

#### `frontend/src/App.jsx`
**Purpose**: Root React component  
**Key Responsibilities**:
- Manage application-level state
- Route between VisaForm and Dashboard
- Handle document generation results
- Display loading and error states

**State Structure**:
```javascript
{
  currentView: 'form' | 'dashboard',
  generatedDocuments: [],
  isGenerating: false,
  error: null
}
```

#### `frontend/src/components/VisaForm.jsx`
**Purpose**: Multi-step form for collecting user data  
**Steps**:
1. Personal Information (name, nationality, passport, DOB)
2. Travel Details (destination, purpose, dates, duration)
3. Additional Information (occupation, employer, accommodations)

**Key Features**:
- Step navigation (Next, Previous, Submit)
- Per-step validation
- Progress indicator
- Form data persistence
- Error display

**State Management**:
```javascript
{
  currentStep: 1,
  formData: {
    personalInfo: {},
    travelInfo: {},
    additionalInfo: {}
  },
  errors: {},
  touched: {}
}
```

#### `frontend/src/components/Dashboard.jsx`
**Purpose**: Display and manage generated documents  
**Key Features**:
- List of generated documents
- Document metadata display
- Download buttons for PDFs
- Generation status indicators
- Error messages

**Document Display**:
```javascript
{
  id: string,
  type: 'cover-letter' | 'itinerary' | 'complete-package',
  generatedAt: timestamp,
  travelerName: string,
  destination: string,
  status: 'success' | 'error',
  downloadUrl: string
}
```

#### `frontend/src/api/visaApi.js`
**Purpose**: Centralized API client for backend communication  
**Key Functions**:
- `generateCoverLetter(formData)` - POST to cover letter endpoint
- `generateItinerary(formData)` - POST to itinerary endpoint
- `generateCompletePackage(formData)` - POST to complete package endpoint

**Axios Configuration**:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});
```

#### `frontend/src/hooks/useVisaForm.js`
**Purpose**: Custom hook for form state management  
**Exported Functions**:
- `useVisaForm()` - Main hook
- Returns: `{ formData, errors, handleChange, handleSubmit, nextStep, prevStep }`

**Validation Logic**:
- Required field validation
- Date format validation
- Passport number format validation
- Duration calculation validation

#### `frontend/src/utils/validation.js`
**Purpose**: Form validation utility functions  
**Key Functions**:
- `validatePersonalInfo(data)` - Validate step 1
- `validateTravelInfo(data)` - Validate step 2
- `validateAdditionalInfo(data)` - Validate step 3
- `validateDateFormat(date)` - Validate YYYY-MM-DD format
- `validatePassportNumber(number)` - Validate passport format

#### `frontend/vite.config.js`
**Purpose**: Vite build tool configuration  
**Configuration**:
```javascript
export default {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

#### `frontend/.env.example`
**Purpose**: Template for frontend environment variables  
**Contents**:
```env
VITE_API_BASE_URL=http://localhost:3001
```

#### `frontend/package.json`
**Purpose**: Frontend dependencies and scripts  
**Key Dependencies**:
- react: ^18.2.0
- react-dom: ^18.2.0
- axios: ^1.6.0

**Dev Dependencies**:
- vite: ^5.0.0
- @vitejs/plugin-react: ^4.2.0

**Scripts**:
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Implementation Order

### Phase 1: Backend Foundation (4-6 hours)
1. Create `backend/` directory structure
2. Initialize npm project: `npm init -y`
3. Install dependencies
4. Create `server.js` with basic Express setup
5. Create `.env.example` and `.env` files
6. Test server startup

### Phase 2: Backend Services (4-6 hours)
7. Implement `config/watsonx.js`
8. Create `utils/prompts.js` with templates
9. Implement `services/watsonxService.js`
10. Implement `services/fileService.js`
11. Create `routes/visa.js` with all endpoints
12. Test endpoints with Postman/curl

### Phase 3: Frontend Foundation (3-4 hours)
13. Create `frontend/` directory structure
14. Initialize Vite project: `npm create vite@latest`
15. Install dependencies
16. Create `App.jsx` with basic routing
17. Create `.env.example` and `.env` files
18. Test frontend startup

### Phase 4: Frontend Components (4-6 hours)
19. Implement `api/visaApi.js`
20. Create `hooks/useVisaForm.js`
21. Create `utils/validation.js`
22. Implement `components/VisaForm.jsx`
23. Implement `components/Dashboard.jsx`
24. Add styling (CSS files)

### Phase 5: Integration & Testing (3-4 hours)
25. Connect frontend to backend
26. Test complete document generation flow
27. Test error scenarios
28. Optimize prompts for better output
29. Add loading states and feedback

### Phase 6: Documentation & Polish (2-3 hours)
30. Add inline code comments
31. Test deployment process
32. Create demo video/screenshots
33. Final testing and bug fixes

## Git Ignore Rules

### Root `.gitignore`
```
# Environment variables
.env
.env.local

# Dependencies
node_modules/

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### Backend-specific `.gitignore`
```
# Environment
.env

# Dependencies
node_modules/

# Logs
logs/
*.log
```

### Frontend-specific `.gitignore`
```
# Environment
.env
.env.local

# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Vite
.vite/
```

## File Size Estimates

| File | Estimated Lines | Complexity |
|------|----------------|------------|
| `backend/server.js` | 50-80 | Low |
| `backend/routes/visa.js` | 100-150 | Medium |
| `backend/services/watsonxService.js` | 150-200 | High |
| `backend/services/fileService.js` | 200-250 | High |
| `backend/config/watsonx.js` | 30-50 | Low |
| `backend/utils/prompts.js` | 100-150 | Medium |
| `frontend/src/App.jsx` | 100-150 | Medium |
| `frontend/src/components/VisaForm.jsx` | 300-400 | High |
| `frontend/src/components/Dashboard.jsx` | 150-200 | Medium |
| `frontend/src/api/visaApi.js` | 80-120 | Medium |
| `frontend/src/hooks/useVisaForm.js` | 150-200 | High |
| `frontend/src/utils/validation.js` | 100-150 | Medium |

## Total Project Size Estimate
- **Backend**: ~800-1,000 lines of code
- **Frontend**: ~1,200-1,500 lines of code
- **Total**: ~2,000-2,500 lines of code
- **Estimated Development Time**: 15-20 hours

---

**Last Updated**: 2026-05-02  
**Maintained By**: Bob AI Assistant