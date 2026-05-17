import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressIndicator, ProgressStep } from '@carbon/react';
import Step01Basics from './Step01Basics';
import Step02Travelers from './Step02Travelers';
import Step03TheHow from './Step03TheHow';
import Step04Personalize from './Step04Personalize';
import AIGenerationStep from './AIGenerationStep';
import ReviewAndSave from './ReviewAndSave';
import './ItineraryWizard.css';

const ItineraryWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedData, setGeneratedData] = useState(null);
  
  // Single formData object to manage state across all steps
  const [formData, setFormData] = useState({
    // Step 01: Basics
    fromCountry: '',
    toCountry: '',
    startDate: '',
    endDate: '',
    budget: '',
    
    // Step 02: Travelers
    numberOfTravelers: 1,
    travelers: [
      {
        name: '',
        sponsorType: 'Self-Sponsored',
        sponsorDetails: ''
      }
    ],
    
    // Step 03: The How
    transport: '',
    purpose: '',
    flightPreferences: {
      optimization: 'cheapest',
      maxPrice: ''
    },
    
    // Step 04: Personalize
    interests: [],
    specialRequests: ''
  });

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Trigger AI Generation (after Step 04: Personalize)
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep !== 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerationComplete = (data) => {
    setGeneratedData(data);
    setCurrentStep(5); // Move to Review & Save
  };

  const handleGenerationError = () => {
    setCurrentStep(0); // Go back to first step
  };

  const handleFinish = () => {
    navigate('/packages');
  };

  const getProgressStep = () => {
    if (currentStep <= 3) return 0; // Intake (steps 0-3)
    if (currentStep === 4) return 1; // AI Generation (step 4)
    return 2; // Review & Save (step 5)
  };

  return (
    <div className="itinerary-wizard">
      {/* Progress Indicator */}
      <ProgressIndicator currentIndex={getProgressStep()} spaceEqually>
        <ProgressStep
          label="Intake"
          description="Collect travel details"
          complete={currentStep > 3}
          current={currentStep <= 3}
        />
        <ProgressStep
          label="AI Generation"
          description="Creating itinerary"
          complete={currentStep > 4}
          current={currentStep === 4}
        />
        <ProgressStep
          label="Review & Save"
          description="Review and save"
          current={currentStep === 5}
        />
      </ProgressIndicator>

      {/* Step Content */}
      <div className="wizard-content">
        {currentStep === 0 && (
          <Step01Basics
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 1 && (
          <Step02Travelers
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 2 && (
          <Step03TheHow
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <Step04Personalize
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <AIGenerationStep
            formData={formData}
            onComplete={handleGenerationComplete}
            onError={handleGenerationError}
          />
        )}

        {currentStep === 5 && generatedData && (
          <ReviewAndSave
            generatedData={generatedData}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};

export default ItineraryWizard;

// Made with Bob