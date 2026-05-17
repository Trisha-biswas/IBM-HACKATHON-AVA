/**
 * Request Transformer Utility
 * Transforms the new simplified request format to the internal format
 */

/**
 * Transform new request format to internal format
 * @param {Object} newFormat - New simplified request format
 * @returns {Array} Array of traveler objects in internal format
 */
function transformRequest(newFormat) {
  const {
    fromCountry,
    toCountry,
    startDate,
    endDate,
    budget,
    numTravelers,
    travelers,
    transport,
    purpose,
    interests,
    specialRequests
  } = newFormat;

  // Calculate duration in days
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Get country names from codes
  const fromCountryName = getCountryName(fromCountry);
  const toCountryName = getCountryName(toCountry);

  // Format interests as string
  const interestsString = interests && interests.length > 0
    ? interests.map(i => i.label).join(', ')
    : 'General sightseeing';

  // Transform each traveler
  return travelers.map(traveler => ({
    personalInfo: {
      fullName: traveler.name,
      nationality: fromCountryName,
      passportNumber: generatePlaceholderPassport(fromCountry),
      dateOfBirth: '1990-01-01' // Placeholder - can be added to input if needed
    },
    travelInfo: {
      destination: toCountryName,
      purpose: purpose || 'Tourism',
      duration: duration,
      departureDate: formatDate(startDate),
      returnDate: formatDate(endDate),
      transport: transport || 'flight',
      budget: budget,
      interests: interestsString
    },
    additionalInfo: {
      occupation: 'Professional', // Placeholder
      employer: traveler.sponsorOrg || 'Self-employed',
      sponsorType: traveler.sponsorType || 'self',
      accommodations: 'Hotel bookings to be confirmed',
      previousVisits: false,
      specialRequests: specialRequests || 'None'
    }
  }));
}

/**
 * Parse date string in DD/MM/YYYY format
 * @param {string} dateStr - Date string
 * @returns {Date} Date object
 */
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Format date to YYYY-MM-DD
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
function formatDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Get country name from country code
 * @param {string} code - Country code (e.g., 'IN', 'AT')
 * @returns {string} Country name
 */
function getCountryName(code) {
  const countryMap = {
    'IN': 'India',
    'AT': 'Austria',
    'US': 'United States',
    'GB': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'CN': 'China',
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'AE': 'United Arab Emirates',
    'CH': 'Switzerland',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'TR': 'Turkey',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'CL': 'Chile',
    'KR': 'South Korea',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam'
  };

  return countryMap[code.toUpperCase()] || code;
}

/**
 * Generate placeholder passport number
 * @param {string} countryCode - Country code
 * @returns {string} Placeholder passport number
 */
function generatePlaceholderPassport(countryCode) {
  const randomNum = Math.floor(Math.random() * 1000000000);
  return `${countryCode.toUpperCase()}${randomNum.toString().padStart(9, '0')}`;
}

/**
 * Validate new request format
 * @param {Object} request - Request object
 * @returns {Object} Validation result { valid: boolean, errors: array }
 */
function validateRequest(request) {
  const errors = [];

  // Required fields
  if (!request.fromCountry) errors.push('fromCountry is required');
  if (!request.toCountry) errors.push('toCountry is required');
  if (!request.startDate) errors.push('startDate is required');
  if (!request.endDate) errors.push('endDate is required');
  if (!request.numTravelers) errors.push('numTravelers is required');
  if (!request.travelers || !Array.isArray(request.travelers)) {
    errors.push('travelers must be an array');
  } else if (request.travelers.length !== request.numTravelers) {
    errors.push(`travelers array length (${request.travelers.length}) must match numTravelers (${request.numTravelers})`);
  }

  // Validate travelers
  if (request.travelers && Array.isArray(request.travelers)) {
    request.travelers.forEach((traveler, index) => {
      if (!traveler.name) errors.push(`travelers[${index}].name is required`);
      if (!traveler.sponsorType) errors.push(`travelers[${index}].sponsorType is required`);
    });
  }

  // Validate dates
  if (request.startDate && request.endDate) {
    try {
      const start = parseDate(request.startDate);
      const end = parseDate(request.endDate);
      if (end <= start) {
        errors.push('endDate must be after startDate');
      }
    } catch (error) {
      errors.push('Invalid date format. Use DD/MM/YYYY');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  transformRequest,
  validateRequest,
  parseDate,
  formatDate,
  getCountryName
};

// Made with Bob
