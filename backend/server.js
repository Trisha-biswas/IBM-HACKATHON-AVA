/**
 * Agentic VISA Assistant - Backend Server
 * Express server for visa document generation using IBM watsonx.ai
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const visaRoutes = require('./routes/visa');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure downloads directory exists
const DOWNLOADS_DIR = path.join(__dirname, 'public/downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  console.log('✓ Created downloads directory');
}

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public/downloads directory
app.use('/downloads', express.static(DOWNLOADS_DIR));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/visa', visaRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Agentic VISA Assistant API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/visa/health',
      generateCoverLetter: 'POST /api/visa/generate-cover-letter',
      generateItinerary: 'POST /api/visa/generate-itinerary',
      generateCompletePackage: 'POST /api/visa/generate-complete-package',
      orchestrateBatch: 'POST /api/visa/orchestrate-batch'
    },
    documentation: 'See AGENTS.md and PROJECT_PLAN.md for details'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/visa/health',
      'POST /api/visa/generate-cover-letter',
      'POST /api/visa/generate-itinerary',
      'POST /api/visa/generate-complete-package',
      'POST /api/visa/orchestrate-batch'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Agentic VISA Assistant - Backend Server               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ CORS enabled for: ${FRONTEND_URL}`);
  console.log(`✓ Downloads directory: ${DOWNLOADS_DIR}`);
  console.log(`✓ API Base URL: http://localhost:${PORT}/api/visa`);
  console.log('\n📚 Available Endpoints:');
  console.log('   GET  /                                    - API information');
  console.log('   GET  /health                              - Health check');
  console.log('   GET  /api/visa/health                     - Service health');
  console.log('   POST /api/visa/generate-cover-letter      - Generate cover letter');
  console.log('   POST /api/visa/generate-itinerary         - Generate itinerary');
  console.log('   POST /api/visa/generate-complete-package  - Generate complete package');
  console.log('   POST /api/visa/orchestrate-batch          - Batch processing');
  console.log('\n🔧 Configuration:');
  console.log(`   watsonx.ai URL: ${process.env.WATSONX_URL || 'Not configured'}`);
  console.log(`   watsonx.ai Project ID: ${process.env.WATSONX_PROJECT_ID ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   watsonx.ai API Key: ${process.env.WATSONX_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  
  if (!process.env.WATSONX_API_KEY || !process.env.WATSONX_PROJECT_ID) {
    console.log('\n⚠️  WARNING: watsonx.ai credentials not configured!');
    console.log('   Please set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env file');
  }
  
  console.log('\n🚀 Server ready to accept requests!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;

// Made with Bob
