import { Select, SelectItem, Button, RadioButtonGroup, RadioButton, NumberInput } from '@carbon/react';
import './Steps.css';

const TRANSPORT_OPTIONS = [
  'Flight',
  'Train',
  'Bus',
  'Car',
  'Mixed (Multiple modes)'
];

const PURPOSE_OPTIONS = [
  'Tourism',
  'Business',
  'Education',
  'Medical',
  'Family Visit',
  'Conference/Event',
  'Other'
];

const Step03TheHow = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const handleFlightPreferenceChange = (field, value) => {
    updateFormData({
      flightPreferences: {
        ...formData.flightPreferences,
        [field]: value
      }
    });
  };

  const isFlightSelected = formData.transport === 'Flight';

  return (
    <form onSubmit={handleSubmit} className="wizard-step">
      <h2 className="step-title">Step 03: The "How"</h2>
      
      <div className="form-row">
        <div className="form-field full-width">
          <Select
            id="transport"
            labelText="Transport"
            value={formData.transport}
            onChange={(e) => updateFormData({ transport: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose transport mode" />
            {TRANSPORT_OPTIONS.map(option => (
              <SelectItem key={option} value={option} text={option} />
            ))}
          </Select>
        </div>
      </div>

      {/* Flight Preferences Section - Only shown when Flight is selected */}
      {isFlightSelected && (
        <div className="flight-preferences-section">
          <h3 className="subsection-title">Flight Preferences</h3>
          
          <div className="form-row">
            <div className="form-field full-width">
              <RadioButtonGroup
                legendText="Optimization Preference"
                name="optimization"
                valueSelected={formData.flightPreferences.optimization}
                onChange={(value) => handleFlightPreferenceChange('optimization', value)}
              >
                <RadioButton
                  labelText="Cheapest"
                  value="cheapest"
                  id="optimization-cheapest"
                />
                <RadioButton
                  labelText="Fastest"
                  value="fastest"
                  id="optimization-fastest"
                />
                <RadioButton
                  labelText="Least Layovers"
                  value="least_layovers"
                  id="optimization-layovers"
                />
              </RadioButtonGroup>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field full-width">
              <NumberInput
                id="maxPrice"
                label="Maximum Price (USD) - Optional"
                helperText="Leave empty for no price limit"
                min={0}
                step={1}
                value={formData.flightPreferences.maxPrice}
                onChange={(e, { value }) => handleFlightPreferenceChange('maxPrice', value)}
                allowEmpty
                invalidText="Please enter a valid price"
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-field full-width">
          <Select
            id="purpose"
            labelText="Purpose"
            value={formData.purpose}
            onChange={(e) => updateFormData({ purpose: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose purpose" />
            {PURPOSE_OPTIONS.map(option => (
              <SelectItem key={option} value={option} text={option} />
            ))}
          </Select>
        </div>
      </div>

      <div className="button-group">
        <Button kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" kind="primary">
          Next: Personalize
        </Button>
      </div>
    </form>
  );
};

export default Step03TheHow;

// Made with Bob