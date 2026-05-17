/**
 * Test script for new request format
 * Tests the transformation and API with the simplified input format
 */

require('dotenv').config();
const axios = require('axios');
const { transformRequest, validateRequest } = require('./utils/requestTransformer');

const API_BASE_URL = 'http://localhost:3001/api/visa';

// Sample request in new format
const newFormatRequest = {
  fromCountry: 'IN',
  toCountry: 'AT',
  startDate: '01/05/2026',
  endDate: '07/05/2026',
  budget: '20,000',
  numTravelers: 2,
  travelers: [
    {
      name: 'Suvu',
      sponsorType: 'employer',
      sponsorOrg: 'Google'
    },
    {
      name: 'Trisha',
      sponsorType: 'employer',
      sponsorOrg: 'IBM'
    }
  ],
  transport: 'flight',
  purpose: 'tourism',
  interests: [
    {
      id: 1,
      label: 'Art'
    },
    {
      id: 2,
      label: 'History'
    }
  ],
  specialRequests: 'Would like to visit museums and historical sites. Prefer vegetarian food options.'
};

/**
 * Test 1: Validate request format
 */
function testValidation() {
  console.log('\n🧪 Test 1: Validating new request format...\n');

  const validation = validateRequest(newFormatRequest);
  
  if (validation.valid) {
    console.log('✅ Validation passed!');
    console.log('   All required fields are present and valid\n');
    return true;
  } else {
    console.log('❌ Validation failed!');
    console.log('   Errors:', validation.errors);
    return false;
  }
}

/**
 * Test 2: Transform request format
 */
function testTransformation() {
  console.log('\n🧪 Test 2: Transforming request format...\n');

  try {
    const transformed = transformRequest(newFormatRequest);
    
    console.log('✅ Transformation successful!');
    console.log(`   Generated ${transformed.length} traveler objects\n`);
    
    console.log('📋 Transformed Data Preview:');
    transformed.forEach((traveler, index) => {
      console.log(`\n   Traveler ${index + 1}:`);
      console.log(`   - Name: ${traveler.personalInfo.fullName}`);
      console.log(`   - From: ${traveler.personalInfo.nationality}`);
      console.log(`   - To: ${traveler.travelInfo.destination}`);
      console.log(`   - Duration: ${traveler.travelInfo.duration} days`);
      console.log(`   - Purpose: ${traveler.travelInfo.purpose}`);
      console.log(`   - Sponsor: ${traveler.additionalInfo.employer} (${traveler.additionalInfo.sponsorType})`);
      console.log(`   - Interests: ${traveler.travelInfo.interests}`);
      console.log(`   - Budget: ${traveler.travelInfo.budget}`);
      console.log(`   - Transport: ${traveler.travelInfo.transport}`);
    });
    
    console.log('\n📄 Full Transformed Object:');
    console.log(JSON.stringify(transformed[0], null, 2));
    
    return transformed;
  } catch (error) {
    console.log('❌ Transformation failed!');
    console.log('   Error:', error.message);
    return null;
  }
}

/**
 * Test 3: Send request to API
 */
async function testAPIRequest() {
  console.log('\n🧪 Test 3: Sending request to API...\n');

  try {
    console.log('📤 Sending POST request to /api/visa/request...');
    
    const response = await axios.post(`${API_BASE_URL}/request`, newFormatRequest);

    console.log('\n✅ API request successful!');
    console.log('\n📋 Response Summary:');
    console.log(`   Request ID: ${response.data.requestId}`);
    console.log(`   Total Travelers: ${response.data.summary.total}`);
    console.log(`   Successful: ${response.data.summary.successful}`);
    console.log(`   Failed: ${response.data.summary.failed}`);
    
    console.log('\n📁 Generated Files:');
    response.data.results.forEach((result, index) => {
      console.log(`\n   Traveler ${index + 1}: ${result.travelerName}`);
      if (result.status === 'success') {
        console.log(`   ✓ Cover Letter: ${result.files.coverLetter}`);
        console.log(`   ✓ Itinerary: ${result.files.itinerary}`);
      } else {
        console.log(`   ✗ Error: ${result.error}`);
      }
    });
    
    console.log(`\n📊 Metadata: ${response.data.metadataUrl}`);
    
    return response.data.requestId;

  } catch (error) {
    console.error('\n❌ API request failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    return null;
  }
}

/**
 * Test 4: Verify dashboard shows the request
 */
async function testDashboard(requestId) {
  console.log('\n🧪 Test 4: Verifying dashboard data...\n');

  try {
    console.log('📥 Fetching dashboard data...');
    
    const response = await axios.get(`${API_BASE_URL}/dashboard`);

    console.log('\n✅ Dashboard data retrieved!');
    console.log('\n📊 Dashboard Summary:');
    console.log(`   Total Requests: ${response.data.summary.totalRequests}`);
    console.log(`   Total Travelers: ${response.data.summary.totalTravelers}`);
    console.log(`   Successful: ${response.data.summary.successfulGenerations}`);
    console.log(`   Failed: ${response.data.summary.failedGenerations}`);
    
    // Find our request
    const ourRequest = response.data.requests.find(r => r.requestId === requestId);
    
    if (ourRequest) {
      console.log(`\n✓ Found our request: ${requestId}`);
      console.log(`   Created: ${ourRequest.createdAt}`);
      console.log(`   Travelers: ${ourRequest.travelers.length}`);
      console.log(`   PDF Files: ${ourRequest.pdfFiles.length}`);
    } else {
      console.log(`\n⚠️  Request ${requestId} not found in dashboard`);
    }

  } catch (error) {
    console.error('\n❌ Dashboard request failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Testing New Request Format Implementation             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Test 1: Validation
  console.log('\n' + '='.repeat(60));
  const isValid = testValidation();
  if (!isValid) {
    console.log('\n❌ Validation failed. Stopping tests.');
    process.exit(1);
  }

  // Test 2: Transformation
  console.log('\n' + '='.repeat(60));
  const transformed = testTransformation();
  if (!transformed) {
    console.log('\n❌ Transformation failed. Stopping tests.');
    process.exit(1);
  }

  // Check if server is running
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Checking if server is running...');
  try {
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running on port 3001\n');
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log('   Please start the server: cd backend && npm run dev');
    console.log('   Then run this test again.\n');
    process.exit(1);
  }

  // Test 3: API Request
  console.log('\n' + '='.repeat(60));
  const requestId = await testAPIRequest();
  if (!requestId) {
    console.log('\n❌ API request failed. Check server logs.');
    process.exit(1);
  }

  // Wait a moment for files to be written
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Dashboard
  console.log('\n' + '='.repeat(60));
  await testDashboard(requestId);

  // Success!
  console.log('\n' + '='.repeat(60));
  console.log('✨ All tests completed successfully!');
  console.log('='.repeat(60));
  console.log('\n📁 Check generated files:');
  console.log(`   backend/public/downloads/${requestId}/`);
  console.log('\n🌐 Access via browser:');
  console.log(`   http://localhost:3001/downloads/${requestId}/metadata.json`);
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});

// Made with Bob
