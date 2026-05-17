import React, { useEffect } from 'react';
import { NumberInput, TextInput, Select, SelectItem, Button } from '@carbon/react';
import './Steps.css';

const Step02Travelers = ({ formData, updateFormData, onNext, onBack }) => {
  // Update travelers array when numberOfTravelers changes
  useEffect(() => {
    const currentCount = formData.travelers.length;
    const newCount = formData.numberOfTravelers;
    
    if (newCount > currentCount) {
      // Add new travelers
      const newTravelers = [...formData.travelers];
      for (let i = currentCount; i < newCount; i++) {
        newTravelers.push({
          name: '',
          sponsorType: 'Self-Sponsored',
          sponsorDetails: ''
        });
      }
      updateFormData({ travelers: newTravelers });
    } else if (newCount < currentCount) {
      // Remove travelers
      updateFormData({ travelers: formData.travelers.slice(0, newCount) });
    }
  }, [formData.numberOfTravelers]);

  const handleTravelerChange = (index, field, value) => {
    const updatedTravelers = [...formData.travelers];
    updatedTravelers[index] = {
      ...updatedTravelers[index],
      [field]: value
    };
    updateFormData({ travelers: updatedTravelers });
  };

  const getSponsorOptions = (currentIndex) => {
    const options = [
      { value: 'Self-Sponsored', text: 'Self-Sponsored' },
      { value: 'Company / Employer', text: 'Company / Employer' }
    ];
    
    // Add other travelers as sponsor options, but prevent circular dependencies
    formData.travelers.forEach((traveler, index) => {
      if (index !== currentIndex && traveler.name) {
        // Check if the other traveler is sponsored by the current traveler
        const otherTravelerSponsoredByCurrent = traveler.sponsorType === `Sponsored by Traveler ${currentIndex + 1}`;
        
        // Only add as option if there's no circular dependency
        if (!otherTravelerSponsoredByCurrent) {
          options.push({
            value: `Sponsored by Traveler ${index + 1}`,
            text: `Sponsored by Traveler ${index + 1}`
          });
        }
      }
    });
    
    return options;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="wizard-step">
      <h2 className="step-title">Step 02: Traveler Details</h2>
      
      <div className="form-row">
        <div className="form-field full-width">
          <NumberInput
            id="numberOfTravelers"
            label="Number of Travelers"
            min={1}
            max={10}
            value={formData.numberOfTravelers}
            onChange={(e, { value }) => updateFormData({ numberOfTravelers: value })}
            required
          />
        </div>
      </div>

      {formData.travelers.map((traveler, index) => (
        <div key={index} className="traveler-section">
          <h3 className="traveler-title">Traveler {index + 1}</h3>
          
          <div className="form-row">
            <div className="form-field full-width">
              <TextInput
                id={`traveler-name-${index}`}
                labelText="Full Name"
                placeholder="Enter full name"
                value={traveler.name}
                onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field full-width">
              <Select
                id={`traveler-sponsor-${index}`}
                labelText="Who is paying?"
                value={traveler.sponsorType}
                onChange={(e) => handleTravelerChange(index, 'sponsorType', e.target.value)}
                required
              >
                {getSponsorOptions(index).map(option => (
                  <SelectItem key={option.value} value={option.value} text={option.text} />
                ))}
              </Select>
            </div>
          </div>

          {traveler.sponsorType === 'Company / Employer' && (
            <div className="form-row">
              <div className="form-field full-width">
                <TextInput
                  id={`traveler-sponsor-details-${index}`}
                  labelText="Sponsor Org/Details"
                  placeholder="Enter sponsor organization or details"
                  value={traveler.sponsorDetails}
                  onChange={(e) => handleTravelerChange(index, 'sponsorDetails', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="button-group">
        <Button kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" kind="primary">
          Next: The "How"
        </Button>
      </div>
    </form>
  );
};

export default Step02Travelers;

// Made with Bob