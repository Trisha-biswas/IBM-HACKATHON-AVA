/**
 * Visa Document Generation Routes
 * Handles API endpoints for generating cover letters and itineraries
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const watsonxService = require('../services/watsonxService');
const fileService = require('../services/fileService');

// Directory for storing generated files
// Use /tmp for Vercel serverless functions (writable), fallback to local for development
const DOWNLOADS_DIR = process.env.VERCEL
  ? '/tmp/downloads'
  : path.join(__dirname, '../public/downloads');

const fs = require('fs');

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// In-memory storage for Vercel (since /tmp is ephemeral)
// This will be lost on function cold starts, but better than nothing
const requestsCache = new Map();

/**
 * POST /api/visa/generate-cover-letter
 * Generate a cover letter PDF for visa application
 * Accepts new simplified format
 */
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const requestData = req.body;

    // Validate required fields for new format
    if (!requestData.travelers || !Array.isArray(requestData.travelers) || requestData.travelers.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'travelers must be a non-empty array'
      });
    }

    if (!requestData.fromCountry || !requestData.toCountry) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'fromCountry and toCountry are required'
      });
    }

    if (!requestData.startDate || !requestData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'startDate and endDate are required'
      });
    }

    // Use first traveler for single document generation
    const traveler = requestData.travelers[0];

    // Generate cover letter text using watsonx.ai
    const coverLetterText = await watsonxService.generateCoverLetter(traveler, requestData);

    // Generate PDF
    const pdfPath = await fileService.generateCoverLetterPDF(
      coverLetterText,
      {
        fullName: traveler.name,
        destination: requestData.toCountry
      },
      DOWNLOADS_DIR
    );

    // Get filename for download URL
    const fileName = path.basename(pdfPath);

    res.json({
      success: true,
      message: 'Cover letter generated successfully',
      downloadUrl: `/downloads/${fileName}`,
      fileName: fileName,
      travelerName: traveler.name,
      destination: requestData.toCountry,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      error: 'Failed to generate cover letter',
      details: error.message
    });
  }
});

/**
 * POST /api/visa/generate-itinerary
 * Generate a travel itinerary PDF for visa application
 * Accepts new simplified format
 */
router.post('/generate-itinerary', async (req, res) => {
  try {
    const requestData = req.body;

    // Validate required fields for new format
    if (!requestData.travelers || !Array.isArray(requestData.travelers) || requestData.travelers.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'travelers must be a non-empty array'
      });
    }

    if (!requestData.fromCountry || !requestData.toCountry) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'fromCountry and toCountry are required'
      });
    }

    if (!requestData.startDate || !requestData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'startDate and endDate are required'
      });
    }

    // Use first traveler for single document generation
    const traveler = requestData.travelers[0];

    // Generate itinerary text using watsonx.ai
    const itineraryText = await watsonxService.generateItinerary(traveler, requestData);

    // Generate PDF
    const pdfPath = await fileService.generateItineraryPDF(
      itineraryText,
      {
        fullName: traveler.name,
        destination: requestData.toCountry
      },
      DOWNLOADS_DIR
    );

    // Get filename for download URL
    const fileName = path.basename(pdfPath);

    res.json({
      success: true,
      message: 'Itinerary generated successfully',
      downloadUrl: `/downloads/${fileName}`,
      fileName: fileName,
      travelerName: traveler.name,
      destination: requestData.toCountry,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      details: error.message
    });
  }
});

/**
 * POST /api/visa/generate-complete-package
 * Generate documents for all travelers in request-specific folder with metadata
 * Accepts new simplified format with flightPreferences
 * Returns flight options in response
 */
router.post('/generate-complete-package', async (req, res) => {
  const fs = require('fs');
  
  try {
    const requestData = req.body;

    // Validate required fields for new format
    if (!requestData.travelers || !Array.isArray(requestData.travelers) || requestData.travelers.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'travelers must be a non-empty array'
      });
    }

    if (!requestData.fromCountry || !requestData.toCountry) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'fromCountry and toCountry are required'
      });
    }

    if (!requestData.startDate || !requestData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'startDate and endDate are required'
      });
    }

    console.log(`\n📋 Received visa request with Multi-Agent Orchestration`);
    console.log(`   From: ${requestData.fromCountry} → To: ${requestData.toCountry}`);
    console.log(`   Dates: ${requestData.startDate} to ${requestData.endDate}`);
    console.log(`   Travelers: ${requestData.numTravelers || requestData.travelers.length}`);
    console.log(`   Purpose: ${requestData.purpose || 'Not specified'}`);
    console.log(`   Budget: ${requestData.budget || 'Not specified'}`);
    if (requestData.interests && requestData.interests.length > 0) {
      console.log(`   Interests: ${requestData.interests.map(i => i.label).join(', ')}`);
    }
    if (requestData.flightPreferences) {
      console.log(`   Flight Optimization: ${requestData.flightPreferences.optimization || 'balanced'}`);
      console.log(`   Max Price: ${requestData.flightPreferences.maxPrice ? `$${requestData.flightPreferences.maxPrice}` : 'No limit'}`);
    }

    // Generate unique request ID
    const requestId = `req-${Date.now()}`;
    const requestFolder = path.join(DOWNLOADS_DIR, requestId);

    // Create request folder
    if (!fs.existsSync(requestFolder)) {
      fs.mkdirSync(requestFolder, { recursive: true });
    }

    console.log(`\n📋 Processing request: ${requestId}`);
    console.log(`👥 Number of travelers: ${requestData.travelers.length}`);

    // Orchestrate document generation for all travelers (now with flight search)
    const results = await watsonxService.orchestrateVisaDocs(requestData);

    // Collect flight options from results and transform to frontend format
    const flightOptions = [];
    const flightMap = new Map(); // To deduplicate flights
    
    results.forEach((result, index) => {
      if (result.flightData) {
        const flight = result.flightData;
        const flightId = `fl-${flight.airline.substring(0, 2).toLowerCase()}-${flight.flightNumber.replace(/\s+/g, '')}`;
        
        // Only add unique flights (same flight for multiple travelers)
        if (!flightMap.has(flightId)) {
          // Parse departure and arrival times to ISO format
          const departureISO = `${requestData.startDate.split('/').reverse().join('-')}T${flight.departureTime}:00Z`;
          const arrivalISO = `${requestData.startDate.split('/').reverse().join('-')}T${flight.arrivalTime}:00Z`;
          
          // Format duration as "Xh Ym"
          const hours = Math.floor(flight.duration);
          const minutes = Math.round((flight.duration - hours) * 60);
          const durationFormatted = `${hours}h ${minutes}m`;
          
          // Get layover airports
          const layoverAirports = flight.layoverCity
            ? flight.layoverCity.split(',').map(city => city.trim())
            : [];
          
          flightMap.set(flightId, {
            id: flightId,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            price: flight.price,
            currency: 'USD',
            duration: durationFormatted,
            layovers: flight.layovers || 0,
            layoverAirports: layoverAirports,
            departureTime: departureISO,
            arrivalTime: arrivalISO,
            bookingUrl: flight.bookingUrl
          });
        }
      }
    });
    
    // Convert map to array
    flightOptions.push(...flightMap.values());

    // Generate PDFs - for Vercel, return base64 data instead of file URLs
    const processedResults = await Promise.all(
      results.map(async (result, index) => {
        if (result.status === 'success') {
          try {
            const traveler = requestData.travelers[index];
            
            // Generate cover letter PDF to file
            const coverLetterPath = await fileService.createIndividualPDF(
              requestId,
              result.travelerName,
              'cover-letter',
              result.coverLetter,
              DOWNLOADS_DIR
            );

            // Generate itinerary PDF to file
            const itineraryPath = await fileService.createIndividualPDF(
              requestId,
              result.travelerName,
              'itinerary',
              result.itinerary,
              DOWNLOADS_DIR
            );

            // For Vercel: Read files and convert to base64
            let coverLetterData, itineraryData;
            if (process.env.VERCEL) {
              // Read the actual file paths (not URLs)
              const coverLetterFullPath = path.join(DOWNLOADS_DIR, requestId, path.basename(coverLetterPath));
              const itineraryFullPath = path.join(DOWNLOADS_DIR, requestId, path.basename(itineraryPath));
              
              coverLetterData = fs.readFileSync(coverLetterFullPath).toString('base64');
              itineraryData = fs.readFileSync(itineraryFullPath).toString('base64');
            }

            return {
              name: result.travelerName,
              destination: requestData.toCountry,
              status: 'success',
              files: process.env.VERCEL ? {
                coverLetter: {
                  data: coverLetterData,
                  filename: `cover-letter-${result.travelerName.replace(/\s+/g, '-')}.pdf`,
                  type: 'base64'
                },
                itinerary: {
                  data: itineraryData,
                  filename: `itinerary-${result.travelerName.replace(/\s+/g, '-')}.pdf`,
                  type: 'base64'
                }
              } : {
                coverLetter: coverLetterPath,
                itinerary: itineraryPath
              },
              travelerData: {
                name: traveler.name,
                destination: requestData.toCountry,
                purpose: requestData.purpose,
                departureDate: requestData.startDate,
                returnDate: requestData.endDate,
                sponsorType: traveler.sponsorType,
                sponsorOrg: traveler.sponsorOrg
              },
              error: null
            };
          } catch (error) {
            console.error(`Error generating PDFs for ${result.travelerName}:`, error);
            return {
              name: result.travelerName,
              destination: requestData.toCountry,
              status: 'error',
              files: null,
              travelerData: null,
              error: `PDF generation failed: ${error.message}`
            };
          }
        }
        return {
          name: result.travelerName,
          destination: requestData.toCountry,
          status: 'error',
          files: null,
          travelerData: null,
          error: result.error
        };
      })
    );

    // Calculate summary
    const summary = {
      total: processedResults.length,
      successful: processedResults.filter(r => r.status === 'success').length,
      failed: processedResults.filter(r => r.status === 'error').length
    };

    // Create metadata.json
    const metadata = {
      requestId,
      createdAt: new Date().toISOString(),
      summary,
      travelers: processedResults
    };

    const metadataPath = path.join(requestFolder, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Store in cache for Vercel (since /tmp is ephemeral)
    if (process.env.VERCEL) {
      requestsCache.set(requestId, metadata);
    }

    console.log(`\n✅ Request completed: ${requestId}`);
    console.log(`   Successful: ${summary.successful}/${summary.total}`);
    console.log(`   Failed: ${summary.failed}/${summary.total}`);

    // Collect all file URLs
    const allFiles = processedResults
      .filter(r => r.files)
      .flatMap(r => [r.files.coverLetter, r.files.itinerary]);

    // Collect itineraries for response
    const itineraries = {};
    results.forEach((result, index) => {
      if (result.status === 'success') {
        itineraries[result.travelerName] = result.itinerary;
      }
    });

    res.json({
      success: true,
      message: 'Complete visa package generated successfully',
      requestId,
      files: allFiles,
      itineraries,
      flightOptions: flightOptions.length > 0 ? flightOptions : undefined,
      metadata: {
        generatedAt: metadata.createdAt,
        summary,
        travelers: processedResults.map(r => ({
          name: r.name,
          status: r.status,
          files: r.files
        })),
        flightPreferences: requestData.flightPreferences || null
      }
    });

  } catch (error) {
    console.error('Error generating complete package:', error);
    res.status(500).json({
      error: 'Failed to generate complete package',
      details: error.message
    });
  }
});

/**
 * POST /api/visa/orchestrate-batch
 * Generate documents for multiple travelers
 * Accepts new simplified format
 */
router.post('/orchestrate-batch', async (req, res) => {
  try {
    const requestData = req.body;

    // Validate required fields for new format
    if (!requestData.travelers || !Array.isArray(requestData.travelers) || requestData.travelers.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'travelers must be a non-empty array'
      });
    }

    if (!requestData.fromCountry || !requestData.toCountry) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'fromCountry and toCountry are required'
      });
    }

    if (!requestData.startDate || !requestData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'startDate and endDate are required'
      });
    }

    // Orchestrate document generation for all travelers
    const results = await watsonxService.orchestrateVisaDocs(requestData);

    // Generate PDFs for successful results
    const processedResults = await Promise.all(
      results.map(async (result) => {
        if (result.status === 'success') {
          try {
            const packageResult = await fileService.generateCompletePackage(
              {
                coverLetter: result.coverLetter,
                itinerary: result.itinerary
              },
              {
                fullName: result.travelerName,
                destination: requestData.toCountry
              },
              DOWNLOADS_DIR
            );

            return {
              ...result,
              files: {
                coverLetter: `/downloads/${path.basename(packageResult.coverLetterPath)}`,
                itinerary: `/downloads/${path.basename(packageResult.itineraryPath)}`,
                package: `/downloads/${path.basename(packageResult.zipPath)}`
              }
            };
          } catch (error) {
            return {
              ...result,
              status: 'error',
              error: `PDF generation failed: ${error.message}`
            };
          }
        }
        return result;
      })
    );

    // Calculate summary
    const summary = {
      total: processedResults.length,
      successful: processedResults.filter(r => r.status === 'success').length,
      failed: processedResults.filter(r => r.status === 'error').length
    };

    res.json({
      success: true,
      message: 'Batch processing completed',
      summary,
      results: processedResults
    });

  } catch (error) {
    console.error('Error in batch orchestration:', error);
    res.status(500).json({
      error: 'Failed to process batch',
      details: error.message
    });
  }
});

/**
 * POST /api/visa/request
 * Trigger orchestrateVisaDocs service for visa document generation
 * Creates request-specific folders with metadata
 * Accepts direct request format without transformation
 * Supports Multi-Agent Orchestration with flight search
 */
router.post('/request', async (req, res) => {
  const fs = require('fs');
  
  try {
    const requestData = req.body;

    // Basic validation
    if (!requestData.travelers || !Array.isArray(requestData.travelers) || requestData.travelers.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'travelers must be a non-empty array'
      });
    }

    if (!requestData.fromCountry || !requestData.toCountry) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'fromCountry and toCountry are required'
      });
    }

    if (!requestData.startDate || !requestData.endDate) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'startDate and endDate are required'
      });
    }
    
    console.log(`\n📋 Received visa request with Multi-Agent Orchestration`);
    console.log(`   From: ${requestData.fromCountry} → To: ${requestData.toCountry}`);
    console.log(`   Dates: ${requestData.startDate} to ${requestData.endDate}`);
    console.log(`   Travelers: ${requestData.numTravelers || requestData.travelers.length}`);
    console.log(`   Purpose: ${requestData.purpose || 'Not specified'}`);
    console.log(`   Budget: ${requestData.budget || 'Not specified'}`);
    if (requestData.interests && requestData.interests.length > 0) {
      console.log(`   Interests: ${requestData.interests.map(i => i.label).join(', ')}`);
    }
    if (requestData.flightPreferences) {
      console.log(`   Flight Optimization: ${requestData.flightPreferences.optimization || 'balanced'}`);
      console.log(`   Max Price: ${requestData.flightPreferences.maxPrice ? `$${requestData.flightPreferences.maxPrice}` : 'No limit'}`);
    }

    // Generate unique request ID
    const requestId = `req-${Date.now()}`;
    const requestFolder = path.join(DOWNLOADS_DIR, requestId);

    // Create request folder
    if (!fs.existsSync(requestFolder)) {
      fs.mkdirSync(requestFolder, { recursive: true });
    }

    console.log(`\n📋 Processing request: ${requestId}`);
    console.log(`👥 Number of travelers: ${requestData.travelers.length}`);

    // Orchestrate document generation for all travelers (now with flight search)
    const results = await watsonxService.orchestrateVisaDocs(requestData);

    // Collect flight options from results and transform to frontend format
    const flightOptions = [];
    const flightMap = new Map(); // To deduplicate flights
    
    results.forEach((result, index) => {
      if (result.flightData) {
        const flight = result.flightData;
        const flightId = `fl-${flight.airline.substring(0, 2).toLowerCase()}-${flight.flightNumber.replace(/\s+/g, '')}`;
        
        // Only add unique flights (same flight for multiple travelers)
        if (!flightMap.has(flightId)) {
          // Parse departure and arrival times to ISO format
          const departureISO = `${requestData.startDate.split('/').reverse().join('-')}T${flight.departureTime}:00Z`;
          const arrivalISO = `${requestData.startDate.split('/').reverse().join('-')}T${flight.arrivalTime}:00Z`;
          
          // Format duration as "Xh Ym"
          const hours = Math.floor(flight.duration);
          const minutes = Math.round((flight.duration - hours) * 60);
          const durationFormatted = `${hours}h ${minutes}m`;
          
          // Get layover airports
          const layoverAirports = flight.layoverCity
            ? flight.layoverCity.split(',').map(city => city.trim().substring(0, 3).toUpperCase())
            : [];
          
          flightMap.set(flightId, {
            id: flightId,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            price: flight.price,
            currency: 'USD',
            duration: durationFormatted,
            layovers: flight.layovers || 0,
            layoverAirports: layoverAirports,
            departureTime: departureISO,
            arrivalTime: arrivalISO,
            bookingUrl: flight.bookingUrl
          });
        }
      }
    });
    
    // Convert map to array
    flightOptions.push(...flightMap.values());

    // Generate PDFs using createIndividualPDF for each successful result
    const processedResults = await Promise.all(
      results.map(async (result, index) => {
        if (result.status === 'success') {
          try {
            const traveler = requestData.travelers[index];
            
            // Generate cover letter PDF
            const coverLetterUrl = await fileService.createIndividualPDF(
              requestId,
              result.travelerName,
              'cover-letter',
              result.coverLetter,
              DOWNLOADS_DIR
            );

            // Generate itinerary PDF
            const itineraryUrl = await fileService.createIndividualPDF(
              requestId,
              result.travelerName,
              'itinerary',
              result.itinerary,
              DOWNLOADS_DIR
            );

            return {
              ...result,
              requestId,
              files: {
                coverLetter: coverLetterUrl,
                itinerary: itineraryUrl
              },
              travelerData: {
                name: traveler.name,
                destination: requestData.toCountry,
                purpose: requestData.purpose,
                departureDate: requestData.startDate,
                returnDate: requestData.endDate,
                sponsorType: traveler.sponsorType,
                sponsorOrg: traveler.sponsorOrg
              }
            };
          } catch (error) {
            console.error(`Error generating PDFs for ${result.travelerName}:`, error);
            return {
              ...result,
              status: 'error',
              error: `PDF generation failed: ${error.message}`
            };
          }
        }
        return result;
      })
    );

    // Calculate summary
    const summary = {
      total: processedResults.length,
      successful: processedResults.filter(r => r.status === 'success').length,
      failed: processedResults.filter(r => r.status === 'error').length
    };

    // Create metadata.json for this request
    const metadata = {
      requestId,
      createdAt: new Date().toISOString(),
      summary,
      travelers: processedResults.map(r => ({
        name: r.travelerName,
        destination: r.destination,
        status: r.status,
        files: r.files || null,
        travelerData: r.travelerData || null,
        error: r.error || null
      }))
    };

    // Save metadata to request folder
    const metadataPath = path.join(requestFolder, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Request ${requestId} completed`);
    console.log(`   Successful: ${summary.successful}/${summary.total}`);
    if (flightOptions.length > 0) {
      console.log(`   Flights selected: ${flightOptions.length}`);
    }
    console.log(`   Metadata saved: ${metadataPath}\n`);

    res.json({
      success: true,
      message: 'Visa request processed successfully',
      requestId,
      summary,
      results: processedResults,
      flightOptions: flightOptions.length > 0 ? flightOptions : undefined,
      metadataUrl: `/downloads/${requestId}/metadata.json`
    });

  } catch (error) {
    console.error('Error processing visa request:', error);
    res.status(500).json({
      error: 'Failed to process visa request',
      details: error.message
    });
  }
});

/**
 * GET /api/visa/dashboard
 * Read public/downloads directory and return history of all visa requests
 * Parses metadata.json from each request folder
 */
router.get('/dashboard', (req, res) => {
  const fs = require('fs');
  
  try {
    console.log('\n📊 Fetching dashboard data...');

    // For Vercel: use in-memory cache
    if (process.env.VERCEL) {
      const requests = [];
      let totalTravelers = 0;
      let successfulGenerations = 0;
      let failedGenerations = 0;

      // Convert cache to array
      for (const [requestId, metadata] of requestsCache.entries()) {
        totalTravelers += metadata.travelers.length;
        successfulGenerations += metadata.summary.successful;
        failedGenerations += metadata.summary.failed;

        requests.push({
          requestId: metadata.requestId,
          createdAt: metadata.createdAt,
          summary: metadata.summary,
          travelers: metadata.travelers,
          pdfFiles: [], // PDFs are returned as base64, not stored
          metadataUrl: null
        });
      }

      // Sort by creation date (newest first)
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({
        success: true,
        message: `Found ${requests.length} visa requests (in-memory cache)`,
        requests,
        summary: {
          totalRequests: requests.length,
          totalTravelers,
          successfulGenerations,
          failedGenerations
        },
        fetchedAt: new Date().toISOString(),
        note: 'Data stored in memory - will be cleared on function restart'
      });
    }

    // For local development: read from filesystem
    // Check if downloads directory exists
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      return res.json({
        success: true,
        message: 'No requests found',
        requests: [],
        summary: {
          totalRequests: 0,
          totalTravelers: 0,
          successfulGenerations: 0,
          failedGenerations: 0
        }
      });
    }

    // Read all directories in downloads folder
    const entries = fs.readdirSync(DOWNLOADS_DIR, { withFileTypes: true });
    const requestFolders = entries.filter(entry => entry.isDirectory() && entry.name.startsWith('req-'));

    console.log(`   Found ${requestFolders.length} request folders`);

    // Parse metadata from each request folder
    const requests = [];
    let totalTravelers = 0;
    let successfulGenerations = 0;
    let failedGenerations = 0;

    for (const folder of requestFolders) {
      const requestId = folder.name;
      const metadataPath = path.join(DOWNLOADS_DIR, requestId, 'metadata.json');

      try {
        // Check if metadata.json exists
        if (fs.existsSync(metadataPath)) {
          const metadataContent = fs.readFileSync(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);

          // Count statistics
          totalTravelers += metadata.travelers.length;
          successfulGenerations += metadata.summary.successful;
          failedGenerations += metadata.summary.failed;

          // Get list of PDF files in the folder
          const folderPath = path.join(DOWNLOADS_DIR, requestId);
          const files = fs.readdirSync(folderPath);
          const pdfFiles = files.filter(f => f.endsWith('.pdf'));

          requests.push({
            requestId: metadata.requestId,
            createdAt: metadata.createdAt,
            summary: metadata.summary,
            travelers: metadata.travelers,
            pdfFiles: pdfFiles.map(f => `/downloads/${requestId}/${f}`),
            metadataUrl: `/downloads/${requestId}/metadata.json`
          });
        } else {
          // Folder exists but no metadata - list files anyway
          const folderPath = path.join(DOWNLOADS_DIR, requestId);
          const files = fs.readdirSync(folderPath);
          const pdfFiles = files.filter(f => f.endsWith('.pdf'));

          requests.push({
            requestId,
            createdAt: null,
            summary: { total: 0, successful: 0, failed: 0 },
            travelers: [],
            pdfFiles: pdfFiles.map(f => `/downloads/${requestId}/${f}`),
            metadataUrl: null,
            note: 'No metadata found for this request'
          });
        }
      } catch (error) {
        console.error(`Error reading metadata for ${requestId}:`, error.message);
        // Include folder in results even if metadata parsing fails
        requests.push({
          requestId,
          createdAt: null,
          summary: { total: 0, successful: 0, failed: 0 },
          travelers: [],
          pdfFiles: [],
          metadataUrl: null,
          error: `Failed to parse metadata: ${error.message}`
        });
      }
    }

    // Sort requests by creation date (newest first)
    requests.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const dashboardData = {
      success: true,
      message: `Found ${requests.length} visa requests`,
      requests,
      summary: {
        totalRequests: requests.length,
        totalTravelers,
        successfulGenerations,
        failedGenerations
      },
      fetchedAt: new Date().toISOString()
    };

    console.log(`   Total requests: ${requests.length}`);
    console.log(`   Total travelers: ${totalTravelers}`);
    console.log(`   Successful: ${successfulGenerations}`);
    console.log(`   Failed: ${failedGenerations}\n`);

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

/**
 * GET /api/visa/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Agentic VISA Assistant API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

// Made with Bob
