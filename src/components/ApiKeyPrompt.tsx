import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Key, ExternalLink, Copy, Check } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ApiKeyPromptProps {
  onDismiss: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onDismiss }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissPrompt();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const dismissPrompt = () => {
    playTactileClick();
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY=your_key_here').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F4F1EA] border border-[#141414]/20 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-12 h-12 bg-[#1F3FB0]/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#1F3FB0]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-medium text-[#141414] mb-2">
              AI Features Require API Key
            </h3>
            <p className="font-sans text-sm text-[#4A433B] mb-4 leading-relaxed">
              To use the AI Research Assistant and generate live literature syntheses, you need to configure a Gemini API key.
            </p>
            
            <div className="bg-white border border-[#141414]/15 rounded-lg p-4 mb-4">
              <div className="font-mono text-xs text-[#141414]/60 mb-2">Create your .env file in the deploy folder with:</div>
              <div className="font-mono text-sm bg-[#EDE8DD] p-2 rounded mb-3 break-all">
                GEMINI_API_KEY=your_gemini_api_key_here
              </div>
              <button
                onClick={copyInstructions}
                className="text-xs text-[#1F3FB0] hover:underline cursor-pointer flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy example</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-[#4A433B]/70 mb-4">
              <strong>Get your free API key:</strong>{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#1F3FB0] hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={dismissPrompt}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#4A433B] hover:text-[#141414] cursor-pointer"
              >
                Dismiss
              </button>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1F3FB0] text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-[#1656d6] cursor-pointer transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Get API Key</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
