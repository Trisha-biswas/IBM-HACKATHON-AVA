import { useEffect, useState, useRef } from 'react';
import { Loading, InlineNotification } from '@carbon/react';
import axios from 'axios';
import './Steps.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/visa`
  : 'http://localhost:3001/api/visa';

const AIGenerationStep = ({ formData, onComplete, onError }) => {
  const [error, setError] = useState(null);
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    // Prevent multiple calls using useRef (persists across re-renders and StrictMode remounts)
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const generateItinerary = async () => {
      try {
        // Format dates to MM/DD/YYYY
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };

        // Get country codes (simplified - you may want to add a proper mapping)
        const getCountryCode = (country) => {
          const codes = {
            'India': 'IN',
            'United States': 'US',
            'United Kingdom': 'GB',
            'Canada': 'CA',
            'Australia': 'AU',
            'Germany': 'DE',
            'France': 'FR',
            'Italy': 'IT',
            'Spain': 'ES',
            'Japan': 'JP',
            'China': 'CN',
            'Brazil': 'BR',
            'Mexico': 'MX',
            'South Korea': 'KR',
            'Netherlands': 'NL',
            'Switzerland': 'CH',
            'Austria': 'AT',
            'Belgium': 'BE',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Denmark': 'DK',
            'Finland': 'FI',
            'Ireland': 'IE',
            'Portugal': 'PT',
            'Greece': 'GR',
            'Poland': 'PL',
            'Czech Republic': 'CZ',
            'Hungary': 'HU'
          };
          return codes[country] || country.substring(0, 2).toUpperCase();
        };

        // Transform formData to match exact backend schema
        const requestData = {
          fromCountry: getCountryCode(formData.fromCountry),
          toCountry: getCountryCode(formData.toCountry),
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          budget: formData.budget,
          numTravelers: formData.numberOfTravelers,
          travelers: formData.travelers.map(traveler => ({
            name: traveler.name,
            sponsorType: traveler.sponsorType === 'Self-Sponsored' ? 'self' :
                        traveler.sponsorType === 'Company / Employer' ? 'company' :
                        'sponsored',
            sponsorOrg: traveler.sponsorDetails || traveler.sponsorType
          })),
          transport: formData.transport.toLowerCase(),
          purpose: formData.purpose.toLowerCase(),
          interests: formData.interests.map((interest, index) => ({
            id: index + 1,
            label: interest.text
          })),
          specialRequests: formData.specialRequests,
          flightPreferences: formData.flightPreferences
        };

        console.log('Sending request:', JSON.stringify(requestData, null, 2));

        const response = await axios.post(
          `${API_BASE_URL}/generate-complete-package`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Success - pass data to parent
        onComplete(response.data);
      } catch (err) {
        console.error('Error generating itinerary:', err);
        setError(err.response?.data?.error || 'Failed to generate itinerary. Please try again.');
        hasCalledAPI.current = false; // Reset on error to allow retry
      }
    };

    generateItinerary();
  }, []); // Empty dependency array - only run once on mount

  if (error) {
    return (
      <div className="wizard-step ai-generation-step">
        <InlineNotification
          kind="error"
          title="Generation Failed"
          subtitle={error}
          onCloseButtonClick={onError}
        />
      </div>
    );
  }

  return (
    <div className="wizard-step ai-generation-step">
      <div className="loading-container">
        <Loading
          description="Loading"
          withOverlay={false}
        />
        <p className="loading-text">Watsonx is crafting your personalized itinerary...</p>
      </div>
    </div>
  );
};

export default AIGenerationStep;

// Made with Bob