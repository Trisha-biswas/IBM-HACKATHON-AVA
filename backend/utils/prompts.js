/**
 * AI Prompt Templates for Visa Document Generation
 * Uses meta-llama/llama-3-3-70b-instruct model
 * Supports Multi-Agent Orchestration with Tool Calling
 */

/**
 * Get orchestrator system prompt
 * Defines the LLM's role as an orchestrator agent
 * @returns {string} System prompt for orchestrator
 */
function getOrchestratorSystemPrompt() {
  return `You are an intelligent Visa Document Orchestrator Agent powered by IBM watsonx.ai. Your role is to:

1. ANALYZE the user's travel request and determine what information is needed
2. FETCH flight data if the transport mode is "flight" using the search_flights tool
3. SELECT the best flight option based on the user's optimization preference (cheapest, fastest, least_layover, or balanced)
4. GENERATE comprehensive visa documents (cover letter and itinerary) that incorporate the selected flight details
5. ENSURE all documents are professional, accurate, and suitable for visa applications

WORKFLOW:
- First, check if flight search is needed (transport mode is "flight" or "air")
- If yes, use search_flights tool with the user's preferences
- Analyze the returned flights and select the best one based on optimization criteria
- Generate the cover letter mentioning the specific flight details
- Generate the itinerary incorporating the exact flight information (times, airline, flight number)
- Ensure all dates, times, and details are consistent across documents

IMPORTANT:
- Always prioritize the user's optimization preference when selecting flights
- Include specific flight details in the itinerary (not generic "flight" mentions)
- Maintain a professional, formal tone suitable for embassy officials
- Ensure financial capability and ties to home country are clearly stated in cover letters`;
}

/**
 * Generate cover letter prompt for visa application
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @param {Object} flightData - Selected flight data (optional)
 * @returns {string} Formatted prompt for watsonx.ai
 */
function generateCoverLetterPrompt(traveler, requestData, flightData = null) {
  // Parse dates
  console.log("********************requestData", requestData)
  console.log("********************flightData", flightData)

  const [startMonth, startDay, startYear] = requestData.startDate.split('/');
  const [endMonth, endDay, endYear] = requestData.endDate.split('/');
  const startDateFormatted = `${startYear}-${startMonth}-${startDay}`;
  const endDateFormatted = `${endYear}-${endMonth}-${endDay}`;
  
  // Calculate duration
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  console.log("********************start", start)
  console.log("********************end", end)

  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  console.log("*******duration", duration)

  
  // Format interests
  const interestsText = requestData.interests && requestData.interests.length > 0
    ? requestData.interests.map(i => i.label).join(', ')
    : 'General sightseeing';
  
  // Build sponsor information
  const sponsorInfo = traveler.sponsorType === 'employer'
    ? `My trip is sponsored by my employer, ${traveler.sponsorOrg}.`
    : traveler.sponsorType === 'self'
    ? 'I am self-sponsoring this trip.'
    : `This trip is sponsored by ${traveler.sponsorOrg}.`;

  // Build flight information section
  let flightInfoSection = '';
  if (flightData) {
    flightInfoSection = `
Flight Information:
- Airline: ${flightData.airline}
- Flight Number: ${flightData.flightNumber}
- Departure: ${flightData.departureTime}
- Arrival: ${flightData.arrivalTime}
- Duration: ${flightData.duration} hours
- Layovers: ${flightData.layovers} ${flightData.layoverCity ? `(via ${flightData.layoverCity})` : ''}
- Booking Reference: Available at ${flightData.bookingUrl}
`;
  }

  return `You are a professional visa application assistant. Generate a formal cover letter for a visa application with the following details:

Applicant Information:
- Full Name: ${traveler.name}
- Traveling from: ${requestData.fromCountry}
- Sponsor Type: ${traveler.sponsorType}
- Sponsor Organization: ${traveler.sponsorOrg || 'N/A'}

Travel Information:
- Destination Country: ${requestData.toCountry}
- Purpose: ${requestData.purpose}
- Duration: ${duration} days
- Departure Date: ${startDateFormatted}
- Return Date: ${endDateFormatted}
- Mode of Transport: ${requestData.transport || 'flight'}
- Budget: ${requestData.budget || 'Not specified'}
- Interests: ${interestsText}
${requestData.specialRequests ? `- Special Requests: ${requestData.specialRequests}` : ''}
${flightInfoSection}
Financial Information:
${sponsorInfo}

Requirements:
1. Use formal business letter format
2. Address to "Visa Officer" at the ${requestData.toCountry} embassy
3. Include clear statement of purpose for travel: ${requestData.purpose}
4. Mention the sponsor type and financial capability
5. Mention specific activities planned related to these interests: ${interestsText}
6. ${flightData ? `IMPORTANT: Reference the specific flight details provided (${flightData.airline} ${flightData.flightNumber}) in the letter` : 'Mention planned travel arrangements'}
7. If special requests are provided, incorporate them naturally into the letter
8. Express commitment to comply with visa regulations and return home
9. Keep length between 300-500 words
10. Use professional and respectful tone
11. Include proper salutation and closing

CRITICAL INSTRUCTIONS:
- Output ONLY the final cover letter text
- Do NOT include any meta-commentary, explanations, or notes about the letter
- Do NOT include phrases like "has been removed", "has been adjusted", "was originally placed", etc.
- Do NOT include any reasoning about formatting decisions
- Do NOT duplicate any sections
- Start directly with the letter content (date or recipient address)
- End with the signature block only

Generate the complete cover letter now. Output only the letter itself, nothing else.`;
}

/**
 * Generate itinerary prompt for visa application
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @param {Object} flightData - Selected flight data (optional)
 * @returns {string} Formatted prompt for watsonx.ai
 */
function generateItineraryPrompt(traveler, requestData, flightData = null) {
  // Parse dates
  const [startMonth, startDay, startYear] = requestData.startDate.split('/');
  const [endMonth, endDay, endYear] = requestData.endDate.split('/');
  const startDateFormatted = `${startYear}-${startMonth}-${startDay}`;
  const endDateFormatted = `${endYear}-${endMonth}-${endDay}`;
  
  // Calculate duration
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  console.log(`*********generateItineraryPrompt******Duration calculated: ${duration} days`);
  console.log(`*********generateItineraryPrompt******Start date: ${startDateFormatted}`);
  console.log(`*********generateItineraryPrompt******End date: ${endDateFormatted}`);

  // Format interests
  const interestsText = requestData.interests && requestData.interests.length > 0
    ? requestData.interests.map(i => i.label).join(', ')
    : 'General sightseeing';

  // Build flight details section
  let flightDetailsSection = '';
  if (flightData) {
    const layoverText = flightData.layovers > 0
      ? ` with ${flightData.layovers} layover${flightData.layovers > 1 ? 's' : ''} in ${flightData.layoverCity}`
      : ' (direct flight)';
    
    flightDetailsSection = `
Confirmed Flight Details:
- Outbound Flight: ${flightData.airline} ${flightData.flightNumber}${layoverText}
- Departure: ${flightData.departureTime} (Day 1)
- Arrival: ${flightData.arrivalTime} (Day 1)
- Duration: ${flightData.duration} hours
- Aircraft: ${flightData.aircraft}
- Price: $${flightData.price}
- Return Flight: Same airline (return journey details to be confirmed)
`;
  }

  return `You are a professional travel planner. Generate a detailed day-by-day travel itinerary for a visa application with the following details:

Traveler Information:
- Name: ${traveler.name}
- Destination Country: ${requestData.toCountry}
- Purpose: ${requestData.purpose}
- Duration: ${duration} days
- Departure Date: ${startDateFormatted}
- Return Date: ${endDateFormatted}
- Mode of Transport: ${requestData.transport || 'flight'}
- Budget: ${requestData.budget || 'Not specified'}
- Interests: ${interestsText}
${requestData.specialRequests ? `- Special Requests: ${requestData.specialRequests}` : ''}
${flightDetailsSection}
CRITICAL OUTPUT REQUIREMENTS - READ CAREFULLY:

1. Generate a SINGLE itinerary from Day 1 to Day ${duration}
2. Each day should appear EXACTLY ONCE
3. After the last day (Day ${duration}), STOP GENERATION IMMEDIATELY
4. Do NOT restart from Day 1 after completing the itinerary
5. Do NOT include any title or header after the last day
6. Do NOT include any explanatory text, notes, or commentary
7. Do NOT include phrases like "End of Trip", "Itinerary Complete", etc. after the last day

FORMAT REQUIREMENTS:
- Start with itinerary title: "Travel Itinerary for ${traveler.name}"
- ${flightData ? `Day 1 MUST start with: "${flightData.airline} ${flightData.flightNumber} arrives at ${flightData.arrivalTime}"` : 'Day 1 starts with arrival details'}
- Each day format: "Day X - ${startDateFormatted}" (increment date for each day)
- Use bullet points with time indicators (Morning, Afternoon, Evening)
- Include activities relevant to: ${requestData.purpose}
- Align with interests: ${interestsText}
- Budget consideration: ${requestData.budget || 'moderate'}
- ${flightData ? `Last day (Day ${duration}) mentions return flight on ${flightData.airline}` : 'Last day includes departure details'}

ABSOLUTE PROHIBITIONS:
❌ Do NOT generate the itinerary twice
❌ Do NOT restart from Day 1 after reaching the last day
❌ Do NOT include meta-commentary or explanations
❌ Do NOT include phrases like "has been adjusted", "note that", "please note"
❌ Do NOT include duplicate day headers
❌ Do NOT continue generating after Day ${duration}

OUTPUT STRUCTURE (FOLLOW EXACTLY):
Travel Itinerary for ${traveler.name}
Destination: ${requestData.toCountry}
Duration: ${duration} days

Day 1 - [date]
[activities]

Day 2 - [date]
[activities]

...

Day ${duration} - [date]
[activities]

[STOP HERE - DO NOT CONTINUE]

Generate the itinerary now. Output ONLY the itinerary from Day 1 to Day ${duration}, then STOP.`;
}

/**
 * Generate content sanitization prompt
 * @param {string} content - Raw content to sanitize
 * @param {string} documentType - Type of document ('cover_letter' or 'itinerary')
 * @returns {string} Sanitization prompt
 */
function generateSanitizationPrompt(content, documentType) {
  return `You are a professional document editor specializing in visa application documents. Your task is to clean and refine the following ${documentType === 'cover_letter' ? 'cover letter' : 'travel itinerary'} by removing all unwanted elements while preserving the essential content.

ORIGINAL CONTENT:
${content}

CLEANING REQUIREMENTS:

1. REMOVE ALL:
   - Hashtags (e.g., #travel, #visa)
   - Repeated sections or day headers
   - Meta-commentary (phrases like "has been adjusted", "note that", "please note", "I have", "Let me")
   - Self-referential text about the document itself
   - Redundant content, repeated sentences or any form of repetition


2. ${documentType === 'itinerary' ? 'ITINERARY-SPECIFIC RULES:' : 'COVER LETTER-SPECIFIC RULES:'}
   ${documentType === 'itinerary' ? `
   - Ensure each day appears EXACTLY ONCE
   - Remove any duplicate day headers (e.g., if "Day 1" appears twice, keep only the first occurrence)
   - Remove duplicate activity descriptions
   - Ensure chronological order (Day 1, Day 2, Day 3, etc.)
   - Remove any text after the last day
   - Keep flight information in Day 1 only (if present)
   ` : `
   - Keep only ONE salutation (e.g., "Dear Visa Officer")
   - Keep only ONE closing (e.g., "Sincerely")
   - Remove duplicate paragraphs with similar content
   - Ensure proper business letter structure
   - Keep flight details if mentioned (don't remove factual information)
   `}

3. PRESERVE:
   - All factual information (names, dates, flight details, locations)
   - Professional tone and formal language

4. OUTPUT FORMAT:
   - Do NOT include phrases like "Here is the cleaned version" or "I have removed"
   - Start directly with the cleaned document content

CRITICAL: Output ONLY the sanitized ${documentType === 'cover_letter' ? 'cover letter' : 'itinerary'} text. DON"T INCLUDE ANY ANY META-TEXT, EXPLAINATIONS OR COMMENTARY. START IMMEDIATELY WITH CLEANED CONTENT AND STOP AT END OF THE CLEANED CONTENT.`;
}

/**
 * System prompt for watsonx.ai to set context (legacy)
 * @returns {string} System prompt
 */
function getSystemPrompt() {
  return 'You are a professional visa documentation assistant specializing in creating formal cover letters and detailed travel itineraries for visa applications. Your responses should be professional, accurate, and formatted appropriately for official visa applications.';
}

module.exports = {
  generateCoverLetterPrompt,
  generateItineraryPrompt,
  getSystemPrompt,
  getOrchestratorSystemPrompt,
  generateSanitizationPrompt
};

// Made with Bob
