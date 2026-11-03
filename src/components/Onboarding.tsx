import React, { useState, useEffect } from 'react';
import { X, Check, Palette, Globe, Save } from 'lucide-react';
import { playTactileClick } from '../utils/sound';
import { ResearcherProfile } from '../types/research';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingProps {
  onComplete: (profile: ResearcherProfile) => void;
  onSkip: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Marginalia',
      description: 'Your personal academic knowledge companion for organizing and synthesizing research.',
      completed: true,
    },
    {
      id: 'profile',
      title: 'Create Your Profile',
      description: 'Set up your researcher profile and interests.',
      completed: false,
    },
    {
      id: 'interests',
      title: 'Select Research Interests',
      description: 'Choose your research areas to organize your library.',
      completed: false,
    },
    {
      id: 'complete',
      title: 'Ready to Go!',
      description: 'Start exploring your research library.',
      completed: true,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<ResearcherProfile>(() => ({
    id: 'profile-primary',
    name: '',
    title: '',
    program: '',
    primaryAffiliation: '',
    secondaryAffiliations: [],
    academicBackground: [],
    researchPillars: [],
    currentEnvironment: [],
    previousExperience: [],
    technicalExpertise: [],
    verifiedLinks: [],
  }));

  const nextStep = () => {
    playTactileClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profile);
    }
  };

  const prevStep = () => {
    playTactileClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfile = (field: keyof ResearcherProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-5xl text-[#1F3FB0] mb-4">📚</div>
          <h2 className="text-2xl font-bold text-[#141414] mb-2">Marginalia</h2>
          <p className="text-[#6B6B6B] mb-8">Your personal academic knowledge companion</p>
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-[#1F3FB0] text-white px-6 py-3 rounded text-sm font-medium hover:bg-[#1656d6] transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto p-8">
            <h3 className="text-xl font-bold text-[#141414] mb-6">Profile Setup</h3>
            
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-[#4A433B] mb-2">
                Name<span className="text-red-500"> *</span>
              </label>
              <input
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                className="w-full border border-[#D1C8BC] rounded-md px-4 py-3 focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                placeholder="Your name"
              />
              
              <label className="block text-sm font-medium text-[#4A433B] mb-2">
                Title / Role
              </label>
              <input
                value={profile.title}
                onChange={(e) => updateProfile('title', e.target.value)}
                className="w-full border border-[#D1C8BC] rounded-md px-4 py-3 focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                placeholder="e.g., PhD Candidate, Researcher"
              />
              
              <label className="block text-sm font-medium text-[#4A433B] mb-2">
                Primary Affiliation
              </label>
              <input
                value={profile.primaryAffiliation}
                onChange={(e) => updateProfile('primaryAffiliation', e.target.value)}
                className="w-full border border-[#D1C8BC] rounded-md px-4 py-3 focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                placeholder="e.g., University of Parma"
              />
              
              <label className="block text-sm font-medium text-[#4A433B] mb-2">
                Program / Department
              </label>
              <input
                value={profile.program}
                onChange={(e) => updateProfile('program', e.target.value)}
                className="w-full border border-[#D1C8BC] rounded-md px-4 py-3 focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                placeholder="e.g., PhD in Computer Science"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm text-[#6B6B6B] rounded hover:bg-gray-100 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={nextStep}
                className="bg-[#1F3FB0] text-white px-6 py-3 rounded text-sm font-medium hover:bg-[#1656d6] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto p-8">
            <h3 className="text-xl font-bold text-[#141414] mb-6">Research Interests</h3>
            
            <p className="text-[#6B6B6B] mb-6">Select your primary research areas:</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Food Systems', 'Big Data', 'Behavioural Nudging', 'Immersive VR', 'Sustainability', 'Consumer Behaviour', 'Digital Innovation', 'Biodiversity'].map((interest) => (
                <div
                  key={interest}
                  onClick={() => {
                    playTactileClick();
                    const existing = profile.researchPillars.find(p => p.title === interest);
                    if (existing) {
                      updateProfile('researchPillars', profile.researchPillars.filter(p => p.title !== interest));
                    } else {
                      updateProfile('researchPillars', [...profile.researchPillars, { 
                        title: interest, 
                        description: `Research focus on ${interest.toLowerCase()}` 
                      }]);
                    }
                  }}
                  className={`border border-[#D1C8BC] rounded-md p-3 cursor-pointer hover:bg-[#F5F1EA] transition-colors ${profile.researchPillars.some(p => p.title === interest) ? 'bg-[#1F3FB0] text-white' : ''}`}>
                  <span className="font-medium">{interest}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm text-[#6B6B6B] rounded hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-[#1F3FB0] text-white px-6 py-3 rounded text-sm font-medium hover:bg-[#1656d6] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-4xl text-[#1F3FB0] mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#141414] mb-2">Welcome to Marginalia!</h2>
          <p className="text-[#6B6B6B] mb-8">Your profile has been set up. Start exploring your research library.</p>
          <button
            onClick={() => onComplete(profile)}
            className="bg-[#1F3FB0] text-white px-6 py-3 rounded text-sm font-medium hover:bg-[#1656d6] transition-colors"
          >
            Continue to Library
          </button>
        </div>
      </div>
    );
  }

  return null;
};
