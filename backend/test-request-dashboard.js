/**
 * Test script for POST /request and GET /dashboard routes
 * Demonstrates the complete workflow of creating requests and viewing dashboard
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/visa';

// Sample traveler data
const sampleTravelers = [
  {
    personalInfo: {
      fullName: 'Jane Smith',
      nationality: 'Canada',
      passportNumber: 'CA987654321',
      dateOfBirth: '1985-03-20'
    },
    travelInfo: {
      destination: 'Japan',
      purpose: 'Tourism',
      duration: 10,
      departureDate: '2026-08-15',
      returnDate: '2026-08-25'
    },
    additionalInfo: {
      occupation: 'Marketing Manager',
      employer: 'Global Marketing Inc',
      accommodations: 'Hotel reservations confirmed for entire stay',
      previousVisits: true
    }
  },
  {
    personalInfo: {
      fullName: 'John Doe',
      nationality: 'United States',
      passportNumber: 'US123456789',
      dateOfBirth: '1990-01-15'
    },
    travelInfo: {
      destination: 'France',
      purpose: 'Business',
      duration: 7,
      departureDate: '2026-09-01',
      returnDate: '2026-09-08'
    },
    additionalInfo: {
      occupation: 'Software Engineer',
      employer: 'Tech Corp',
      accommodations: 'Business hotel booking confirmed',
      previousVisits: false
    }
  }
];

/**
 * Test POST /api/visa/request endpoint
 */
async function testRequestEndpoint() {
  console.log('\n🧪 Testing POST /api/visa/request endpoint...\n');

  try {
    console.log('📤 Sending request with 2 travelers...');
    
    const response = await axios.post(`${API_BASE_URL}/request`, {
      travelers: sampleTravelers
    });

    console.log('\n✅ Request successful!');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data.requestId;

  } catch (error) {
    console.error('\n❌ Request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Test GET /api/visa/dashboard endpoint
 */
async function testDashboardEndpoint() {
  console.log('\n🧪 Testing GET /api/visa/dashboard endpoint...\n');

  try {
    console.log('📥 Fetching dashboard data...');
    
    const response = await axios.get(`${API_BASE_URL}/dashboard`);

    console.log('\n✅ Dashboard data retrieved!');
    console.log('\n📊 Summary:');
    console.log(`   Total Requests: ${response.data.summary.totalRequests}`);
    console.log(`   Total Travelers: ${response.data.summary.totalTravelers}`);
    console.log(`   Successful: ${response.data.summary.successfulGenerations}`);
    console.log(`   Failed: ${response.data.summary.failedGenerations}`);

    console.log('\n📁 Recent Requests:');
    response.data.requests.slice(0, 3).forEach((req, index) => {
      console.log(`\n   ${index + 1}. Request ID: ${req.requestId}`);
      console.log(`      Created: ${req.createdAt || 'Unknown'}`);
      console.log(`      Travelers: ${req.travelers.length}`);
      console.log(`      PDF Files: ${req.pdfFiles.length}`);
    });

    console.log('\n📄 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Dashboard request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Test health check endpoint
 */
async function testHealthCheck() {
  console.log('\n🧪 Testing health check...\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is healthy');
    console.log('   Status:', response.data.status);
    console.log('   Service:', response.data.service);
    return true;
  } catch (error) {
    console.error('❌ Server is not responding');
    console.error('   Make sure the server is running on port 3001');
    console.error('   Run: cd backend && npm run dev');
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Testing POST /request and GET /dashboard Routes       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Step 1: Check if server is running
    const isHealthy = await testHealthCheck();
    if (!isHealthy) {
      console.log('\n⚠️  Please start the backend server first!');
      process.exit(1);
    }

    // Step 2: Test POST /request endpoint
    console.log('\n' + '='.repeat(60));
    console.log('STEP 1: Create a new visa request');
    console.log('='.repeat(60));
    
    const requestId = await testRequestEndpoint();
    
    console.log(`\n✨ Request created successfully!`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Check folder: backend/public/downloads/${requestId}/`);

    // Wait a moment for files to be written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Test GET /dashboard endpoint
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Fetch dashboard data');
    console.log('='.repeat(60));
    
    await testDashboardEndpoint();

    // Success message
    console.log('\n' + '='.repeat(60));
    console.log('✨ All tests completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📁 Generated files location:');
    console.log('   backend/public/downloads/');
    console.log('\n🌐 Access via browser:');
    console.log(`   http://localhost:3001/downloads/${requestId}/metadata.json`);
    console.log('\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Tests failed!');
    console.error('='.repeat(60));
    console.error('\nError details:', error.message);
    console.error('\n⚠️  Troubleshooting:');
    console.error('   1. Make sure backend server is running: npm run dev');
    console.error('   2. Check .env file has valid IBM Cloud credentials');
    console.error('   3. Verify watsonx.ai API is accessible');
    console.error('   4. Check server logs for detailed error messages\n');
    process.exit(1);
  }
}

// Run the tests
runTests();

// Made with Bob
