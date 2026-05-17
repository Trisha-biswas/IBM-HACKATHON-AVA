/**
 * Test Multi-Agent Orchestration with Flight Search
 * Tests the new agentic architecture with tool calling
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/visa';

// Test data with flight preferences
const testRequest = {
  fromCountry: 'IN',
  toCountry: 'AT',
  startDate: '15/07/2026',
  endDate: '29/07/2026',
  numTravelers: 2,
  purpose: 'Tourism and Cultural Exploration',
  budget: 'moderate',
  transport: 'flight',
  interests: [
    { value: 'culture', label: 'Cultural Sites' },
    { value: 'food', label: 'Local Cuisine' },
    { value: 'nature', label: 'Nature & Hiking' }
  ],
  specialRequests: 'Interested in visiting Vienna Opera House and Salzburg',
  flightPreferences: {
    optimization: 'cheapest',
    maxPrice: 700
  },
  travelers: [
    {
      name: 'Rajesh Kumar',
      sponsorType: 'self',
      sponsorOrg: 'Self-employed'
    },
    {
      name: 'Priya Sharma',
      sponsorType: 'employer',
      sponsorOrg: 'Tech Solutions India Pvt Ltd'
    }
  ]
};

// Test scenarios
const testScenarios = [
  {
    name: 'Cheapest Flight Option',
    data: {
      ...testRequest,
      flightPreferences: {
        optimization: 'cheapest',
        maxPrice: 700
      }
    }
  },
  {
    name: 'Fastest Flight Option',
    data: {
      ...testRequest,
      flightPreferences: {
        optimization: 'fastest',
        maxPrice: 800
      }
    }
  },
  {
    name: 'Least Layover Option',
    data: {
      ...testRequest,
      flightPreferences: {
        optimization: 'least_layover',
        maxPrice: 750
      }
    }
  },
  {
    name: 'Balanced Option (No Max Price)',
    data: {
      ...testRequest,
      flightPreferences: {
        optimization: 'balanced'
      }
    }
  }
];

/**
 * Test the /request endpoint with multi-agent orchestration
 */
async function testMultiAgentOrchestration(scenario) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${scenario.name}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    console.log('📤 Sending request to /api/visa/request...');
    console.log(`   Optimization: ${scenario.data.flightPreferences.optimization}`);
    console.log(`   Max Price: ${scenario.data.flightPreferences.maxPrice || 'No limit'}`);
    console.log(`   Travelers: ${scenario.data.travelers.length}`);

    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/request`, scenario.data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minutes timeout for AI generation
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Request completed in ${duration}s`);
    console.log(`   Request ID: ${response.data.requestId}`);
    console.log(`   Summary: ${response.data.summary.successful}/${response.data.summary.total} successful`);

    // Display flight options
    if (response.data.flightOptions && response.data.flightOptions.length > 0) {
      console.log(`\n✈️  Flight Options Selected:`);
      response.data.flightOptions.forEach(option => {
        console.log(`\n   Traveler: ${option.travelerName}`);
        console.log(`   Airline: ${option.flight.airline}`);
        console.log(`   Flight: ${option.flight.flightNumber}`);
        console.log(`   Price: $${option.flight.price}`);
        console.log(`   Duration: ${option.flight.duration} hours`);
        console.log(`   Layovers: ${option.flight.layovers}`);
        console.log(`   Departure: ${option.flight.departureTime}`);
        console.log(`   Arrival: ${option.flight.arrivalTime}`);
      });
    } else {
      console.log(`\n⚠️  No flight options returned (transport mode may not be flight)`);
    }

    // Display generated files
    console.log(`\n📄 Generated Files:`);
    response.data.results.forEach(result => {
      if (result.status === 'success') {
        console.log(`\n   ${result.travelerName}:`);
        console.log(`   - Cover Letter: ${result.files.coverLetter}`);
        console.log(`   - Itinerary: ${result.files.itinerary}`);
      } else {
        console.log(`\n   ${result.travelerName}: ❌ ${result.error}`);
      }
    });

    console.log(`\n📊 Metadata: ${response.data.metadataUrl}`);

    return {
      success: true,
      requestId: response.data.requestId,
      flightOptions: response.data.flightOptions,
      duration
    };

  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test the /generate-complete-package endpoint
 */
async function testCompletePackage(scenario) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing Complete Package: ${scenario.name}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    console.log('📤 Sending request to /api/visa/generate-complete-package...');

    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/generate-complete-package`, scenario.data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Package generated in ${duration}s`);
    console.log(`   Request ID: ${response.data.requestId}`);

    // Display flight options
    if (response.data.flightOptions && response.data.flightOptions.length > 0) {
      console.log(`\n✈️  Flight Options:`);
      response.data.flightOptions.forEach(option => {
        console.log(`   ${option.travelerName}: ${option.flight.airline} ${option.flight.flightNumber} ($${option.flight.price})`);
      });
    }

    console.log(`\n📄 Files: ${response.data.files.length} PDFs generated`);

    return {
      success: true,
      requestId: response.data.requestId,
      duration
    };

  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 Starting Multi-Agent Orchestration Tests');
  console.log('=' .repeat(80));
  console.log('Testing the new agentic architecture with flight search and tool calling');
  console.log('=' .repeat(80));

  const results = [];

  // Test each scenario
  for (const scenario of testScenarios) {
    const result = await testMultiAgentOrchestration(scenario);
    results.push({ scenario: scenario.name, ...result });
    
    // Wait a bit between tests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Test complete package endpoint with one scenario
  console.log('\n\n📦 Testing Complete Package Endpoint...');
  const packageResult = await testCompletePackage(testScenarios[0]);
  results.push({ scenario: 'Complete Package', ...packageResult });

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}s)` : '';
    console.log(`${index + 1}. ${status} ${result.scenario}${duration}`);
    if (result.flightOptions && result.flightOptions.length > 0) {
      console.log(`   Flights: ${result.flightOptions.length} selected`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🏁 Testing Complete');
  console.log('='.repeat(80) + '\n');
}

// Run tests if executed directly
if (require.main === module) {
  console.log('\n⚠️  Make sure the backend server is running on http://localhost:3001');
  console.log('⚠️  Ensure WATSONX_API_KEY and WATSONX_PROJECT_ID are set in .env\n');

  setTimeout(() => {
    runAllTests().catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
  }, 1000);
}

module.exports = {
  testMultiAgentOrchestration,
  testCompletePackage,
  runAllTests
};

// Made with Bob