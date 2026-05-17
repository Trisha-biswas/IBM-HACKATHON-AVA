/**
 * Test script for GET /api/visa/dashboard endpoint
 * Tests the dashboard functionality that reads request history
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/visa';

async function testDashboard() {
  console.log('\n🧪 Testing Dashboard Endpoint\n');
  console.log('=' .repeat(60));

  try {
    console.log('\n📊 Test: Fetching dashboard data...');
    console.log(`📤 Sending GET request to ${API_BASE_URL}/dashboard\n`);

    const response = await axios.get(`${API_BASE_URL}/dashboard`);

    console.log('✅ Dashboard Response:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n📈 Summary:');
    console.log(`   Total Requests: ${response.data.summary.totalRequests}`);
    console.log(`   Total Travelers: ${response.data.summary.totalTravelers}`);
    console.log(`   Successful: ${response.data.summary.successfulGenerations}`);
    console.log(`   Failed: ${response.data.summary.failedGenerations}`);

    if (response.data.requests.length > 0) {
      console.log('\n📋 Recent Requests:');
      response.data.requests.slice(0, 3).forEach((req, index) => {
        console.log(`\n   ${index + 1}. Request ID: ${req.requestId}`);
        console.log(`      Created: ${req.createdAt}`);
        console.log(`      Travelers: ${req.travelers.length}`);
        console.log(`      PDF Files: ${req.pdfFiles.length}`);
        if (req.pdfFiles.length > 0) {
          console.log(`      Files:`);
          req.pdfFiles.forEach(file => {
            console.log(`        - ${file}`);
          });
        }
      });
    }

    console.log('\n✅ Dashboard test completed successfully!\n');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Cannot connect to server');
      console.error('   Make sure the backend server is running:');
      console.error('   cd backend && npm run dev\n');
    } else if (error.response) {
      console.error('\n❌ Server Error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}\n`);
    } else {
      console.error('\n❌ Error:', error.message, '\n');
    }
    process.exit(1);
  }
}

// Run the test
testDashboard();

// Made with Bob
