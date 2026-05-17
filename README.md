# Agentic VISA Assistant System

An intelligent visa documentation assistant powered by IBM watsonx.ai that helps travelers generate professional cover letters and detailed travel itineraries for visa applications.

## 🌟 Features

- **AI-Powered Document Generation**: Uses IBM watsonx.ai's meta-llama/llama-3-3-70b-instruct model
- **Professional Cover Letters**: Generates formal, embassy-ready visa application letters
- **Detailed Itineraries**: Creates day-by-day travel plans with activities and accommodations
- **Multi-Step Form**: Intuitive 3-step form for collecting traveler information
- **PDF Export**: Downloads documents as professionally formatted PDFs
- **Real-Time Generation**: On-demand document creation without database storage
- **Single-User System**: Simple setup with no authentication required

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  React Frontend │ ◄─────► │ Express Backend  │
│   (Port 5173)   │  HTTP   │   (Port 3001)    │
└─────────────────┘         └──────────────────┘
                                     │
                            ┌────────┴────────┐
                            ▼                 ▼
                    ┌──────────────┐  ┌──────────┐
                    │ watsonx.ai   │  │  PDFKit  │
                    │   API        │  │          │
                    └──────────────┘  └──────────┘
```

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **IBM Cloud Account**: With watsonx.ai access
- **IBM Cloud API Key**: For watsonx.ai authentication
- **watsonx.ai Project ID**: From your IBM Cloud project

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agentic-visa-assistant
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your IBM Cloud credentials
# WATSONX_API_KEY=your_ibm_cloud_api_key
# WATSONX_PROJECT_ID=your_project_id
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Verify VITE_API_BASE_URL=http://localhost:3001
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

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

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Obtaining IBM Cloud Credentials

1. **Create IBM Cloud Account**: Sign up at [cloud.ibm.com](https://cloud.ibm.com)
2. **Access watsonx.ai**: Navigate to watsonx.ai service
3. **Create Project**: Set up a new watsonx.ai project
4. **Get Project ID**: Copy the project ID from project settings
5. **Generate API Key**: 
   - Go to IBM Cloud dashboard
   - Navigate to "Manage" → "Access (IAM)" → "API keys"
   - Click "Create an IBM Cloud API key"
   - Copy and save the API key securely

## 📖 Usage Guide

### Step 1: Personal Information
- Enter your full name
- Select your nationality
- Provide passport number
- Enter date of birth

### Step 2: Travel Details
- Select destination country
- Specify purpose of visit (Tourism, Business, Education, etc.)
- Enter departure and return dates
- Specify duration of stay

### Step 3: Additional Information
- Provide occupation
- Enter employer name
- Describe accommodation arrangements
- Indicate if you've visited the destination before

### Step 4: Generate Documents
- Review your information
- Choose document type:
  - Cover Letter only
  - Itinerary only
  - Complete Package (both documents)
- Download generated PDFs

## 🛠️ Development

### Project Structure

```
agentic-visa-assistant/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── routes/
│   │   └── visa.js           # API endpoints
│   ├── services/
│   │   ├── watsonxService.js # watsonx.ai integration
│   │   └── fileService.js    # PDF generation
│   ├── config/
│   │   └── watsonx.js        # watsonx.ai configuration
│   ├── utils/
│   │   └── prompts.js        # AI prompt templates
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VisaForm.jsx  # Multi-step form
│   │   │   └── Dashboard.jsx # Document display
│   │   ├── api/
│   │   │   └── visaApi.js    # Backend API client
│   │   ├── hooks/
│   │   │   └── useVisaForm.js # Form state hook
│   │   └── App.jsx
│   └── package.json
│
├── AGENTS.md                  # AI agent context
├── PROJECT_PLAN.md           # Detailed architecture
└── README.md                 # This file
```

### Available Scripts

#### Backend Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

#### Frontend Scripts
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### API Endpoints

#### POST /api/visa/generate-cover-letter
Generates a formal visa cover letter.

**Request:**
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

**Response:** PDF file (application/pdf)

#### POST /api/visa/generate-itinerary
Generates a detailed travel itinerary.

**Request:** Same as above  
**Response:** PDF file (application/pdf)

#### POST /api/visa/generate-complete-package
Generates both cover letter and itinerary.

**Request:** Same as above  
**Response:**
```json
{
  "coverLetter": "base64-encoded PDF",
  "itinerary": "base64-encoded PDF",
  "metadata": {
    "generatedAt": "2026-05-02T21:00:00.000Z",
    "travelerName": "John Doe",
    "destination": "France"
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Form Validation**
   - Try submitting empty fields
   - Enter invalid dates
   - Test navigation between steps

2. **Document Generation**
   - Generate cover letter only
   - Generate itinerary only
   - Generate complete package
   - Verify PDF downloads

3. **Error Handling**
   - Test with invalid API credentials
   - Test with network disconnection
   - Verify error messages display correctly

### Test Data

Use this sample data for testing:

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
    "accommodations": "Hotel reservations confirmed for entire stay",
    "previousVisits": true
  }
}
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Server won't start
```bash
# Check if port 3001 is already in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Kill the process or change PORT in .env
```

**Problem**: watsonx.ai API errors
```bash
# Verify API key is valid
curl -X GET "https://iam.cloud.ibm.com/identity/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_API_KEY"

# Check project ID is correct in IBM Cloud console
```

**Problem**: PDF generation fails
- Ensure pdfkit is installed: `npm list pdfkit`
- Check for special characters in input data
- Verify content length is reasonable (< 1000 tokens)

### Frontend Issues

**Problem**: Cannot connect to backend
```bash
# Verify backend is running
curl http://localhost:3001/api/health

# Check VITE_API_BASE_URL in frontend/.env
# Ensure CORS is configured correctly in backend
```

**Problem**: Form validation not working
- Open browser DevTools console
- Check for JavaScript errors
- Verify React DevTools shows correct state

**Problem**: PDFs not downloading
- Check browser's download settings
- Verify Content-Type header is application/pdf
- Check browser console for errors

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate API keys** regularly (every 90 days)
3. **Use HTTPS** in production environments
4. **Validate all user inputs** before processing
5. **Implement rate limiting** for public deployments
6. **Monitor API usage** to detect anomalies
7. **Keep dependencies updated** for security patches

## 📦 Dependencies

### Backend
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `axios` - HTTP client for watsonx.ai
- `pdfkit` - PDF generation
- `@ibm-cloud/watsonx-ai` - IBM watsonx.ai SDK

### Frontend
- `react` - UI library
- `react-dom` - React DOM rendering
- `axios` - HTTP client
- `vite` - Build tool

## 🚢 Deployment

### Backend Deployment (Example: Heroku)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set WATSONX_API_KEY=your_key
heroku config:set WATSONX_PROJECT_ID=your_project_id
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://your-backend-url.herokuapp.com
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For questions or issues:
1. Check the [AGENTS.md](AGENTS.md) file for technical details
2. Review [PROJECT_PLAN.md](PROJECT_PLAN.md) for architecture
3. Open an issue on GitHub
4. Contact the maintainers

## 🙏 Acknowledgments

- IBM watsonx.ai for AI capabilities
- Meta for the Llama 3.3 70B model
- PDFKit for PDF generation
- React and Vite communities

## 📊 Project Status

- ✅ Planning Phase Complete
- 🚧 Implementation Phase (Ready to Start)
- ⏳ Testing Phase (Pending)
- ⏳ Deployment Phase (Pending)

---

**Built with ❤️ using IBM watsonx.ai**

**Last Updated**: 2026-05-02  
**Version**: 1.0.0