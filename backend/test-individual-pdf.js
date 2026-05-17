/**
 * Test script for createIndividualPDF function
 * Demonstrates creating PDFs in unique request folders
 */

require('dotenv').config();
const { createIndividualPDF } = require('./services/fileService');
const { v4: uuidv4 } = require('crypto');

// Sample document content
const sampleCoverLetter = `Dear Visa Officer,

I am writing to apply for a tourist visa to visit Japan from August 15, 2026, to August 25, 2026. I am a Marketing Manager at Global Marketing Inc., and I am planning this trip to explore Japanese culture and visit historical sites.

I have made all necessary arrangements for my stay, including hotel reservations at Tokyo Hilton for the entire duration of my visit. I have sufficient financial resources to cover all expenses during my trip and have strong ties to my home country, Canada, where I maintain steady employment and family connections.

I assure you that I will comply with all visa regulations and return to Canada before the visa expiration date. I have attached my complete travel itinerary and supporting documents for your review.

Thank you for considering my application.

Sincerely,
Jane Smith`;

const sampleItinerary = `TRAVEL ITINERARY

Day 1 - August 15, 2026
- Arrival at Tokyo Narita International Airport (Morning)
- Check-in at Tokyo Hilton
- Afternoon: Rest and local area exploration
- Evening: Welcome dinner at hotel restaurant

Day 2 - August 16, 2026
- Morning: Visit Senso-ji Temple in Asakusa
- Afternoon: Explore Tokyo Skytree
- Evening: Traditional Japanese dinner in Shibuya

Day 3 - August 17, 2026
- Full day tour of Mount Fuji
- Visit Hakone hot springs
- Return to Tokyo in evening

Day 4 - August 18, 2026
- Morning: Imperial Palace tour
- Afternoon: Shopping in Ginza district
- Evening: Kabuki theater performance

Day 5 - August 19, 2026
- Day trip to Nikko
- Visit Toshogu Shrine
- Explore natural scenery

Day 6 - August 20, 2026
- Morning: Tsukiji Outer Market
- Afternoon: Meiji Shrine and Harajuku
- Evening: Dinner in Roppongi

Day 7 - August 21, 2026
- Day trip to Kamakura
- Visit Great Buddha
- Beach time at Yuigahama

Day 8 - August 22, 2026
- Morning: Tokyo National Museum
- Afternoon: Ueno Park
- Evening: Farewell dinner

Day 9 - August 23, 2026
- Morning: Last-minute shopping
- Afternoon: Pack and prepare for departure

Day 10 - August 24, 2026
- Check-out from hotel
- Departure from Tokyo Narita International Airport`;

async function testCreateIndividualPDF() {
  try {
    console.log('\n🧪 Testing createIndividualPDF function...\n');

    // Generate a unique request ID (in real app, this would come from the request)
    const requestId = `req-${Date.now()}`;
    const travelerName = 'Jane Smith';

    console.log(`📋 Request ID: ${requestId}`);
    console.log(`👤 Traveler: ${travelerName}\n`);

    // Test 1: Create cover letter PDF
    console.log('📄 Creating cover letter PDF...');
    const coverLetterUrl = await createIndividualPDF(
      requestId,
      travelerName,
      'cover-letter',
      sampleCoverLetter
    );
    console.log(`✅ Cover letter created: ${coverLetterUrl}\n`);

    // Test 2: Create itinerary PDF
    console.log('📄 Creating itinerary PDF...');
    const itineraryUrl = await createIndividualPDF(
      requestId,
      travelerName,
      'itinerary',
      sampleItinerary
    );
    console.log(`✅ Itinerary created: ${itineraryUrl}\n`);

    // Test 3: Create another request with different ID
    const requestId2 = `req-${Date.now() + 1000}`;
    const travelerName2 = 'John Doe';

    console.log(`📋 Request ID: ${requestId2}`);
    console.log(`👤 Traveler: ${travelerName2}\n`);

    console.log('📄 Creating cover letter PDF for second traveler...');
    const coverLetterUrl2 = await createIndividualPDF(
      requestId2,
      travelerName2,
      'cover-letter',
      sampleCoverLetter.replace('Jane Smith', 'John Doe')
    );
    console.log(`✅ Cover letter created: ${coverLetterUrl2}\n`);

    console.log('✨ All tests completed successfully!\n');
    console.log('📁 Check the following directories:');
    console.log(`   - public/downloads/${requestId}/`);
    console.log(`   - public/downloads/${requestId2}/\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCreateIndividualPDF();

// Made with Bob
