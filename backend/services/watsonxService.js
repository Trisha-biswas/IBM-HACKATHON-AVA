/**
 * IBM watsonx.ai Service - Multi-Agent Orchestrator
 * Handles authentication and orchestrates tool/function calling
 * Uses meta-llama/llama-3-3-70b-instruct with tool calling capabilities
 */

require('dotenv').config();
const {
  generateCoverLetterPrompt,
  generateItineraryPrompt,
  getOrchestratorSystemPrompt,
  generateSanitizationPrompt
} = require('../utils/prompts');
const flightService = require('./flightService');

// watsonx.ai configuration
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_URL = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const MODEL_ID = 'meta-llama/llama-3-3-70b-instruct';

// IAM token cache
let cachedToken = null;
let tokenExpiry = null;

// Tool definitions for function calling
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_flights',
      description: 'Search for available flights between origin and destination with optimization preferences. Use this when the user needs flight information or when transport mode is "flight".',
      parameters: {
        type: 'object',
        properties: {
          origin: {
            type: 'string',
            description: 'Origin country code (e.g., "IN" for India)'
          },
          destination: {
            type: 'string',
            description: 'Destination country code (e.g., "AT" for Austria)'
          },
          departureDate: {
            type: 'string',
            description: 'Departure date in DD/MM/YYYY format'
          },
          returnDate: {
            type: 'string',
            description: 'Return date in DD/MM/YYYY format'
          },
          optimization: {
            type: 'string',
            enum: ['cheapest', 'fastest', 'least_layover', 'balanced'],
            description: 'Flight optimization preference'
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum price in USD (optional)'
          }
        },
        required: ['origin', 'destination', 'departureDate', 'returnDate']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_itinerary_text',
      description: 'Generate a detailed travel itinerary text for visa application. Use this after flight information is available (if applicable) to create the final itinerary document.',
      parameters: {
        type: 'object',
        properties: {
          travelerName: {
            type: 'string',
            description: 'Name of the traveler'
          },
          destination: {
            type: 'string',
            description: 'Destination country'
          },
          purpose: {
            type: 'string',
            description: 'Purpose of travel'
          },
          startDate: {
            type: 'string',
            description: 'Trip start date in DD/MM/YYYY format'
          },
          endDate: {
            type: 'string',
            description: 'Trip end date in DD/MM/YYYY format'
          },
          flightDetails: {
            type: 'object',
            description: 'Flight details object (if available)',
            properties: {
              airline: { type: 'string' },
              flightNumber: { type: 'string' },
              departureTime: { type: 'string' },
              arrivalTime: { type: 'string' },
              duration: { type: 'number' },
              price: { type: 'number' }
            }
          },
          interests: {
            type: 'string',
            description: 'Traveler interests (comma-separated)'
          },
          budget: {
            type: 'string',
            description: 'Travel budget'
          }
        },
        required: ['travelerName', 'destination', 'purpose', 'startDate', 'endDate']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_cover_letter_text',
      description: 'Generate a formal cover letter text for visa application. Use this to create the cover letter document.',
      parameters: {
        type: 'object',
        properties: {
          travelerName: {
            type: 'string',
            description: 'Name of the traveler'
          },
          fromCountry: {
            type: 'string',
            description: 'Origin country'
          },
          toCountry: {
            type: 'string',
            description: 'Destination country'
          },
          purpose: {
            type: 'string',
            description: 'Purpose of travel'
          },
          startDate: {
            type: 'string',
            description: 'Trip start date in DD/MM/YYYY format'
          },
          endDate: {
            type: 'string',
            description: 'Trip end date in DD/MM/YYYY format'
          },
          sponsorType: {
            type: 'string',
            description: 'Sponsor type (self, employer, other)'
          },
          sponsorOrg: {
            type: 'string',
            description: 'Sponsor organization name'
          }
        },
        required: ['travelerName', 'fromCountry', 'toCountry', 'purpose', 'startDate', 'endDate', 'sponsorType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'sanitize_content',
      description: 'Clean and sanitize generated content by removing repetitions, duplicates, hashtags, and unwanted patterns. Use this before finalizing documents.',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The raw content to be sanitized'
          },
          documentType: {
            type: 'string',
            enum: ['cover_letter', 'itinerary'],
            description: 'Type of document being sanitized'
          }
        },
        required: ['content', 'documentType']
      }
    }
  }
];

/**
 * Get IBM Cloud IAM access token
 * @returns {Promise<string>} IAM access token
 */
async function getIAMToken() {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: WATSONX_API_KEY
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IAM token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Cache token and expiry time
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return cachedToken;
  } catch (error) {
    console.error('Error getting IAM token:', error);
    throw new Error(`Failed to authenticate with IBM Cloud: ${error.message}`);
  }
}

/**
 * Call watsonx.ai text generation API with tool support
 * @param {string} prompt - The prompt to send to the model
 * @param {Array} tools - Tool definitions for function calling
 * @param {Object} parameters - Model parameters
 * @returns {Promise<Object>} API response with generated text or tool calls
 */
async function callWatsonxWithTools(prompt, tools = [], parameters = {}) {
  try {
    const token = await getIAMToken();

    // Default parameters optimized for document generation
    const defaultParams = {
      max_new_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1
    };

    const modelParams = { ...defaultParams, ...parameters };

    // Prepare request body
    const requestBody = {
      model_id: MODEL_ID,
      input: prompt,
      parameters: modelParams,
      project_id: WATSONX_PROJECT_ID
    };

    // Add tools if provided (Note: watsonx.ai may not support native tool calling yet)
    // This is a forward-compatible implementation
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    const response = await fetch(`${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`watsonx.ai API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        text: data.results[0].generated_text.trim(),
        raw: data
      };
    } else {
      throw new Error('No text generated from watsonx.ai');
    }
  } catch (error) {
    console.error('Error calling watsonx.ai:', error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

/**
 * Execute a tool/function call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @returns {Promise<Object>} Tool execution result
 */
async function executeTool(toolName, args) {
  console.log(`\n🔧 Executing tool: ${toolName}`);
  console.log(`   Arguments:`, JSON.stringify(args, null, 2));

  try {
    switch (toolName) {
      case 'search_flights':
        const flights = await flightService.searchFlights(
          args.origin,
          args.destination,
          {
            departureDate: args.departureDate,
            returnDate: args.returnDate
          },
          {
            optimization: args.optimization || 'balanced',
            maxPrice: args.maxPrice
          }
        );
        
        // Return top 3 flights
        const topFlights = flights.slice(0, 3);
        console.log(`   ✓ Found ${flights.length} flights, returning top 3`);
        
        return {
          success: true,
          data: topFlights,
          summary: `Found ${flights.length} flights. Top options: ${topFlights.map(f => 
            `${f.airline} ${f.flightNumber} ($${f.price}, ${f.duration}h, ${f.layovers} layover${f.layovers !== 1 ? 's' : ''})`
          ).join('; ')}`
        };

      case 'generate_itinerary_text':
        // This is handled by the orchestrator, not as a separate tool call
        console.log(`   ℹ️  Itinerary generation handled by orchestrator`);
        return {
          success: true,
          data: args,
          summary: 'Itinerary parameters received'
        };

      case 'generate_cover_letter_text':
        // This is handled by the orchestrator, not as a separate tool call
        console.log(`   ℹ️  Cover letter generation handled by orchestrator`);
        return {
          success: true,
          data: args,
          summary: 'Cover letter parameters received'
        };

      case 'sanitize_content':
        console.log(`   🧹 Sanitizing ${args.documentType} content...`);
        const sanitizationPrompt = generateSanitizationPrompt(args.content, args.documentType);
        
        const sanitizedResult = await callWatsonxWithTools(sanitizationPrompt, [], {
          max_new_tokens: 2000,
          temperature: 0.3, // Lower temperature for more consistent cleaning
          top_p: 0.85,
          repetition_penalty: 1.2
        });
        
        console.log(`   ✓ Content sanitized successfully`);
        return {
          success: true,
          data: {
            cleanedContent: sanitizedResult.text,
            originalLength: args.content.length,
            cleanedLength: sanitizedResult.text.length
          },
          summary: `Sanitized ${args.documentType}: ${args.content.length} → ${sanitizedResult.text.length} characters`
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`   ✗ Tool execution failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse tool calls from LLM response
 * Since watsonx.ai may not have native tool calling, we parse from text
 * @param {string} text - Generated text from LLM
 * @returns {Array} Array of tool call objects
 */
function parseToolCalls(text) {
  const toolCalls = [];
  
  // Look for tool call patterns in the text
  // Pattern: TOOL_CALL: tool_name(arg1=value1, arg2=value2)
  const toolCallRegex = /TOOL_CALL:\s*(\w+)\((.*?)\)/g;
  let match;
  
  while ((match = toolCallRegex.exec(text)) !== null) {
    const toolName = match[1];
    const argsString = match[2];
    
    // Parse arguments
    const args = {};
    const argPairs = argsString.split(',').map(s => s.trim());
    
    for (const pair of argPairs) {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        // Remove quotes if present
        args[key] = value.replace(/^["']|["']$/g, '');
      }
    }
    
    toolCalls.push({ toolName, args });
  }
  
  return toolCalls;
}

/**
 * Orchestrate visa document generation with tool calling
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {Promise<Object>} Generated documents and flight data
 */
async function orchestrateWithTools(traveler, requestData) {
  console.log(`\n🤖 Starting orchestration for ${traveler.name}...`);
  
  const conversationHistory = [];
  let flightData = null;
  let coverLetterText = null;
  let itineraryText = null;
  
  try {
    // Step 1: Check if flight search is needed
    const needsFlightSearch = requestData.transport === 'flight' || 
                              requestData.transport === 'air' ||
                              !requestData.transport;
    
    if (needsFlightSearch && requestData.flightPreferences) {
      console.log(`\n📋 Flight search required`);
      
      // Search for flights
      const flightResult = await executeTool('search_flights', {
        origin: requestData.fromCountry,
        destination: requestData.toCountry,
        departureDate: requestData.startDate,
        returnDate: requestData.endDate,
        optimization: requestData.flightPreferences.optimization || 'balanced',
        maxPrice: requestData.flightPreferences.maxPrice
      });
      
      if (flightResult.success && flightResult.data.length > 0) {
        // Select the best flight (first one after optimization)
        flightData = flightResult.data[0];
        console.log(`\n✓ Selected flight: ${flightData.airline} ${flightData.flightNumber} ($${flightData.price})`);
      }
    }
    
    // Step 2: Generate cover letter
    console.log(`\n📝 Generating cover letter...`);
    const coverLetterPrompt = generateCoverLetterPrompt(traveler, requestData, flightData);
    const coverLetterResponse = await callWatsonxWithTools(coverLetterPrompt);
    let rawCoverLetter = coverLetterResponse.text;
    
    // Step 2.5: Sanitize cover letter
    console.log(`\n🧹 Sanitizing cover letter...`);
    const coverLetterSanitized = await executeTool('sanitize_content', {
      content: rawCoverLetter,
      documentType: 'cover_letter'
    });
    coverLetterText = coverLetterSanitized.success ? coverLetterSanitized.data.cleanedContent : rawCoverLetter;
    
    // Step 3: Generate itinerary with flight details
    console.log(`\n📅 Generating itinerary...`);
    const itineraryPrompt = generateItineraryPrompt(traveler, requestData, flightData);
    const itineraryResponse = await callWatsonxWithTools(itineraryPrompt);
    let rawItinerary = itineraryResponse.text;
    
    // Step 3.5: Sanitize itinerary
    console.log(`\n🧹 Sanitizing itinerary...`);
    const itinerarySanitized = await executeTool('sanitize_content', {
      content: rawItinerary,
      documentType: 'itinerary'
    });
    itineraryText = itinerarySanitized.success ? itinerarySanitized.data.cleanedContent : rawItinerary;
    
    console.log(`\n✅ Orchestration complete for ${traveler.name}`);
    
    return {
      travelerName: traveler.name,
      destination: requestData.toCountry,
      coverLetter: coverLetterText,
      itinerary: itineraryText,
      flightData: flightData,
      status: 'success',
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`\n❌ Orchestration failed for ${traveler.name}:`, error.message);
    throw error;
  }
}

/**
 * Generate cover letter for visa application (legacy method)
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {Promise<string>} Generated cover letter text
 */
async function generateCoverLetter(traveler, requestData) {
  try {
    console.log(`Generating cover letter for ${traveler.name}...`);
    
    const prompt = generateCoverLetterPrompt(traveler, requestData, null);
    const response = await callWatsonxWithTools(prompt);
    
    console.log('Cover letter generated successfully');
    return response.text;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

/**
 * Generate travel itinerary for visa application (legacy method)
 * @param {Object} traveler - Individual traveler data
 * @param {Object} requestData - Overall request data
 * @returns {Promise<string>} Generated itinerary text
 */
async function generateItinerary(traveler, requestData) {
  try {
    console.log(`Generating itinerary for ${traveler.name}...`);
    
    const prompt = generateItineraryPrompt(traveler, requestData, null);
    const response = await callWatsonxWithTools(prompt);
    
    console.log('Itinerary generated successfully');
    if (response.text.includes("Day 1") && response.text.split("Day 1").length > 1) {
      return response.text.split("Day 1")[0];
    } else {
      return response.text;
    }
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
}

/**
 * Orchestrate visa document generation for multiple travelers
 * Now uses tool calling orchestration
 * @param {Object} requestData - Complete request data with travelers array
 * @returns {Promise<Array<Object>>} Array of generated documents with metadata
 */
async function orchestrateVisaDocs(requestData) {
  const results = [];
  const travelers = requestData.travelers;

  for (const traveler of travelers) {
    try {
      console.log(`\n🔄 Processing documents for ${traveler.name}...`);
      
      // Use new orchestration with tools
      const result = await orchestrateWithTools(traveler, requestData);
      results.push(result);
      
      console.log(`✓ Documents generated for ${traveler.name}`);
    } catch (error) {
      console.error(`✗ Failed to generate documents for ${traveler.name}:`, error.message);
      
      results.push({
        travelerName: traveler.name,
        destination: requestData.toCountry,
        status: 'error',
        error: error.message,
        generatedAt: new Date().toISOString()
      });
    }
  }

  return results;
}

module.exports = {
  getIAMToken,
  callWatsonxWithTools,
  executeTool,
  orchestrateWithTools,
  generateCoverLetter,
  generateItinerary,
  orchestrateVisaDocs,
  TOOL_DEFINITIONS
};

// Made with Bob
