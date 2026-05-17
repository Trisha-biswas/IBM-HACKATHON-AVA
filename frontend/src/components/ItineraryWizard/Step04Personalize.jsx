import React from 'react';
import { MultiSelect, TextArea, Button } from '@carbon/react';
import './Steps.css';

const INTEREST_OPTIONS = [
  { id: 'culture', text: 'Culture & History' },
  { id: 'food', text: 'Food & Cuisine' },
  { id: 'adventure', text: 'Adventure & Sports' },
  { id: 'nature', text: 'Nature & Wildlife' },
  { id: 'shopping', text: 'Shopping' },
  { id: 'nightlife', text: 'Nightlife & Entertainment' },
  { id: 'art', text: 'Art & Museums' },
  { id: 'architecture', text: 'Architecture' },
  { id: 'beaches', text: 'Beaches & Relaxation' },
  { id: 'photography', text: 'Photography' },
  { id: 'wellness', text: 'Wellness & Spa' },
  { id: 'festivals', text: 'Festivals & Events' }
];

const Step04Personalize = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="wizard-step">
      <h2 className="step-title">Step 04: Personalize</h2>
      
      <div className="form-row">
        <div className="form-field full-width">
          <MultiSelect
            id="interests"
            titleText="Interests"
            label="Select interests"
            items={INTEREST_OPTIONS}
            itemToString={(item) => (item ? item.text : '')}
            selectedItems={formData.interests}
            onChange={({ selectedItems }) => updateFormData({ interests: selectedItems })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field full-width">
          <TextArea
            id="specialRequests"
            labelText="Special Requests"
            placeholder="Any special requests or requirements for your trip?"
            value={formData.specialRequests}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            rows={6}
          />
        </div>
      </div>

      <div className="button-group">
        <Button kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" kind="primary">
          Generate Package
        </Button>
      </div>
    </form>
  );
};

export default Step04Personalize;

// Made with Bob