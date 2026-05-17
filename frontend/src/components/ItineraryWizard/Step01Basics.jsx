import { Select, SelectItem, DatePicker, DatePickerInput, TextInput, Button } from '@carbon/react';
import './Steps.css';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
  'Germany', 'France', 'Italy', 'Spain', 'Japan', 'China', 'Brazil',
  'Mexico', 'South Korea', 'Netherlands', 'Switzerland', 'Austria',
  'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary'
];

const Step01Basics = ({ formData, updateFormData, onNext }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Get today's date to disable past dates in MM/DD/YYYY format
  const today = new Date();
  const formattedToday = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

  // Calculate minimum end date (day after start date or today)
  let minEndDate = formattedToday;
  if (formData.startDate) {
    const startDate = new Date(formData.startDate);
    // Add one day to start date
    startDate.setDate(startDate.getDate() + 1);
    minEndDate = `${String(startDate.getMonth() + 1).padStart(2, '0')}/${String(startDate.getDate()).padStart(2, '0')}/${startDate.getFullYear()}`;
  }

  return (
    <form onSubmit={handleSubmit} className="wizard-step">
      <h2 className="step-title">Step 01: The Basics</h2>
      
      <div className="form-row">
        <div className="form-field half-width">
          <Select
            id="fromCountry"
            labelText="From Country"
            value={formData.fromCountry}
            onChange={(e) => updateFormData({ fromCountry: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose a country" />
            {COUNTRIES.map(country => (
              <SelectItem key={country} value={country} text={country} />
            ))}
          </Select>
        </div>
        
        <div className="form-field half-width">
          <Select
            id="toCountry"
            labelText="To Country"
            value={formData.toCountry}
            onChange={(e) => updateFormData({ toCountry: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose a country" />
            {COUNTRIES.map(country => (
              <SelectItem key={country} value={country} text={country} />
            ))}
          </Select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field half-width">
          <DatePicker
            datePickerType="single"
            value={formData.startDate}
            onChange={(dates) => updateFormData({ startDate: dates[0] })}
            minDate={formattedToday}
          >
            <DatePickerInput
              id="startDate"
              placeholder="mm/dd/yyyy"
              labelText="Start Date"
              required
            />
          </DatePicker>
        </div>
        
        <div className="form-field half-width">
          <DatePicker
            datePickerType="single"
            value={formData.endDate}
            onChange={(dates) => updateFormData({ endDate: dates[0] })}
            minDate={minEndDate}
          >
            <DatePickerInput
              id="endDate"
              placeholder="mm/dd/yyyy"
              labelText="End Date"
              required
            />
          </DatePicker>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field full-width">
          <TextInput
            id="budget"
            labelText="Total Budget (USD)"
            placeholder="Enter budget amount"
            value={formData.budget}
            onChange={(e) => updateFormData({ budget: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="button-group">
        <Button type="submit" kind="primary">
          Next: The "Who"
        </Button>
      </div>
    </form>
  );
};

export default Step01Basics;

// Made with Bob