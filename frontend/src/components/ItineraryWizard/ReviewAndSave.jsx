import { Button, Accordion, AccordionItem, Tag, Tile } from '@carbon/react';
import { Document, Download, Plane, Time } from '@carbon/icons-react';
import ReactMarkdown from 'react-markdown';
import './Steps.css';

const ReviewAndSave = ({ generatedData, onFinish }) => {
  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(`http://localhost:3001${fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      // Extract the actual date-time part (after the duplicate date prefix)
      const parts = dateTimeString.split('T');
      if (parts.length > 1) {
        const timePart = parts[1].replace('Z', '');
        const datePart = timePart.split(' ')[0];
        const actualTime = timePart.split(' ')[1];
        
        const date = new Date(datePart + 'T' + actualTime);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return dateTimeString;
    } catch (error) {
      return dateTimeString;
    }
  };

  return (
    <div className="wizard-step review-step">
      <h2 className="step-title">Itinerary Generation Complete</h2>

      {/* Optimized Flight Options */}
      {generatedData.flightOptions && generatedData.flightOptions.length > 0 && (
        <section className="review-section">
          <h3 className="section-title">
            <Plane size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Optimized Flight Options
          </h3>
          
          <div className="flights-grid">
            {generatedData.flightOptions.map((flight, index) => (
              <Tile key={index} className="flight-tile">
                <div className="flight-tile-header">
                  <h4 className="flight-airline">{flight.airline}</h4>
                  <Tag type="blue">{flight.flightNumber}</Tag>
                </div>
                
                <div className="flight-tile-details">
                  <div className="flight-detail-row">
                    <span className="flight-detail-label">Price:</span>
                    <span className="flight-detail-value flight-price">
                      ${flight.price} {flight.currency || 'USD'}
                    </span>
                  </div>
                  
                  <div className="flight-detail-row">
                    <span className="flight-detail-label">Duration:</span>
                    <span className="flight-detail-value">{flight.duration}</span>
                  </div>
                  
                  <div className="flight-detail-row">
                    <span className="flight-detail-label">Layovers:</span>
                    <span className="flight-detail-value">{flight.layovers}</span>
                  </div>
                  
                  {flight.layoverAirports && flight.layoverAirports.length > 0 && (
                    <div className="flight-layover-section">
                      <span className="flight-layover-label">Via:</span>
                      <div className="flight-layover-tags">
                        {flight.layoverAirports.map((airport, idx) => (
                          <Tag key={idx} type="gray" size="sm">
                            {airport}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flight-times-section">
                    <div className="flight-time-row">
                      <Time size={16} className="flight-time-icon" />
                      <div className="flight-time-details">
                        <span className="flight-time-label">Departure:</span>
                        <span className="flight-time-value">
                          {formatDateTime(flight.departureTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flight-time-row">
                      <Time size={16} className="flight-time-icon" />
                      <div className="flight-time-details">
                        <span className="flight-time-label">Arrival:</span>
                        <span className="flight-time-value">
                          {formatDateTime(flight.arrivalTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flight-tile-actions">
                  <Button
                    kind="primary"
                    size="sm"
                    as="a"
                    href={flight.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Now
                  </Button>
                </div>
              </Tile>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Travel Plans */}
      <section className="review-section">
        <h3 className="section-title">Personalized Travel Plans</h3>
        
        {generatedData.itineraries && (
          <Accordion>
            {Object.entries(generatedData.itineraries).map(([travelerName, itinerary]) => (
              <AccordionItem
                key={travelerName}
                title={`Itinerary for ${travelerName}`}
              >
                <div className="itinerary-content">
                  <ReactMarkdown>{itinerary}</ReactMarkdown>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Save to Dashboard Button */}
      <div className="save-button-container">
        <Button kind="primary" onClick={onFinish}>
          Save to Dashboard
        </Button>
      </div>

      {/* Visa Documents */}
      <section className="review-section">
        <h3 className="section-title">Visa Documents</h3>
        
        {generatedData.requestId && (
          <div className="request-id-tag">
            <Tag type="blue">VISA-{generatedData.requestId}</Tag>
          </div>
        )}

        <div className="documents-grid">
          {generatedData.files && generatedData.files.map((file, index) => {
            const fileName = file.split('/').pop();
            const cleanFileName = fileName.replace(/^(cover-letter-|itinerary-)/, '').replace(/\.pdf$/, '');
            
            return (
              <Tile key={index} className="document-tile">
                <div className="document-tile-content">
                  <div className="document-tile-info">
                    <Document size={24} className="document-tile-icon" />
                    <span className="document-tile-name">{cleanFileName}</span>
                  </div>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Download}
                    iconDescription="Download"
                    hasIconOnly
                    onClick={() => handleDownload(file)}
                  />
                </div>
              </Tile>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ReviewAndSave;

// Made with Bob