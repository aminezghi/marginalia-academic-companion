import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, FileText, AlertCircle, UserPlus } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWithGoogle: () => void;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, displayName: string) => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInWithGoogle,
  onSignIn,
  onSignUp,
  defaultMode = 'login',
}) => {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync isSignUp with defaultMode when it changes
  useEffect(() => {
    setIsSignUp(defaultMode === 'signup');
  }, [defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp && !displayName) {
      setError('Please enter your name');
      return;
    }

    try {
      if (isSignUp) {
        await onSignUp(email, password, displayName);
      } else {
        await onSignIn(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const toggleMode = () => {
    playTactileClick();
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign In"
    >
      <div className="relative w-full max-w-md bg-[#F4F1EA] border border-[#141414]/20 shadow-2xl rounded-xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-[#EDEBE6] border-b border-[#141414]/15 px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#141414] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#1F3FB0]" />
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Option */}
        <div className="mx-6 mt-4">
          <button
            onClick={onSignInWithGoogle}
            className="w-full py-2.5 bg-white border border-[#141414]/20 rounded-lg flex items-center justify-center gap-2 text-sm font-serif hover:bg-[#F9F7F2] transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#1F3FB0]" />
            <span>Continue with Google</span>
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#141414]/15"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 text-[10px] text-[#77736B] bg-[#EDEBE6] font-mono uppercase tracking-wider">OR</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
                <span className="text-[#77736B]">Name</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
              <span className="text-[#77736B]">Email</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
              <span className="text-[#77736B]">Password</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#1F3FB0] text-white text-sm font-mono uppercase tracking-wider rounded-lg hover:bg-[#1656d6] transition-colors cursor-pointer"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mx-6 mb-4 flex justify-center">
          <button
            onClick={toggleMode}
            className="text-xs font-mono text-[#1F3FB0] hover:text-[#1656d6] cursor-pointer"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
