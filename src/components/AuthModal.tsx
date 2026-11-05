import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, FileText, AlertCircle, UserPlus, ArrowLeft, Unlock, Key } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest?: () => void;
  onSignInWithGoogle: () => Promise<void>;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, displayName: string) => void;
  onForgotPassword: (email: string) => Promise<void>;
  onVerifyResetCode: (code: string) => Promise<string>;
  onConfirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  defaultMode?: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  resetCode?: string;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onContinueAsGuest,
  onSignInWithGoogle,
  onSignIn,
  onSignUp,
  onForgotPassword,
  onVerifyResetCode,
  onConfirmPasswordReset,
  defaultMode = 'login',
  resetCode,
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState(resetCode || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const isDesktopApp = Boolean(window.marginaliaDesktop?.isDesktop);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await onSignInWithGoogle();
    } catch (failure) {
      const code = typeof failure === 'object' && failure !== null && 'code' in failure
        ? String(failure.code)
        : '';
      if (code.includes('operation-not-allowed')) {
        setError('Google sign-in is not enabled for this Firebase project. Enable Google as a provider in Firebase Authentication settings.');
      } else if (code.includes('unauthorized-domain')) {
        setError('This app domain is not authorized for Google sign-in in Firebase Authentication settings.');
      } else if (code.includes('popup-blocked')) {
        setError('The Google sign-in window was blocked. Allow pop-ups and try again.');
      } else if (code.includes('popup-closed')) {
        setError('Google sign-in was closed before it finished.');
      } else {
        setError(failure instanceof Error ? failure.message : 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync mode with defaultMode when it changes
  useEffect(() => {
    const handleRedirectError = (event: Event) => {
      const failure = (event as CustomEvent<unknown>).detail;
      const code = typeof failure === 'object' && failure !== null && 'code' in failure
        ? String(failure.code)
        : '';
      if (code.includes('unauthorized-domain')) {
        setError('Google sign-in is not enabled for this site domain yet.');
      } else if (code.includes('network-request-failed')) {
        setError('Google sign-in could not reach Firebase. Check your connection and try again.');
      } else {
        setError(failure instanceof Error ? failure.message : 'Google sign-in could not be completed.');
      }
    };
    window.addEventListener('marginalia:google-auth-error', handleRedirectError);
    return () => window.removeEventListener('marginalia:google-auth-error', handleRedirectError);
  }, []);

  useEffect(() => {
    if (defaultMode === 'reset-password' && resetCode) {
      setMode('reset-password');
      setResetCodeInput(resetCode);
    } else if (defaultMode === 'forgot-password') {
      setMode('forgot-password');
    } else {
      setMode(defaultMode);
    }
  }, [defaultMode, resetCode]);

  // Verify reset code when mode changes to reset-password
  useEffect(() => {
    if (mode === 'reset-password' && resetCodeInput && !codeVerified) {
      verifyCode();
    }
  }, [resetCodeInput, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please fill in all required fields');
        return;
      }
      setLoading(true);
      try {
        await onSignIn(email, password);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signup') {
      if (!email || !password || !displayName) {
        setError('Please fill in all required fields');
        return;
      }
      setLoading(true);
      try {
        await onSignUp(email, password, displayName);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Sign up failed');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot-password') {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      setLoading(true);
      try {
        await onForgotPassword(email);
        setSuccess('If an account exists with that email, a password reset link has been sent.');
        setEmail('');
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'reset-password') {
      if (!password || !confirmPassword) {
        setError('Please fill in both password fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!resetCodeInput) {
        setError('Invalid or missing reset code');
        return;
      }
      setLoading(true);
      try {
        await onConfirmPasswordReset(resetCodeInput, password);
        setSuccess('Password has been reset successfully. Redirecting to sign in...');
        setTimeout(() => {
          setMode('login');
          setError(null);
          setSuccess(null);
          setPassword('');
          setConfirmPassword('');
          setResetCodeInput('');
          setCodeVerified(false);
          setVerifiedEmail('');
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  };

  const verifyCode = async () => {
    if (!resetCodeInput) return;
    try {
      const email = await onVerifyResetCode(resetCodeInput);
      setVerifiedEmail(email);
      setCodeVerified(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setCodeVerified(false);
    }
  };

  const toggleMode = () => {
    playTactileClick();
    if (mode === 'login') {
      setMode('signup');
    } else if (mode === 'signup') {
      setMode('login');
    } else if (mode === 'forgot-password') {
      setMode('login');
    } else if (mode === 'reset-password') {
      setMode('login');
    }
    setError(null);
    setSuccess(null);
  };

  const goToForgotPassword = () => {
    playTactileClick();
    setMode('forgot-password');
    setError(null);
    setSuccess(null);
  };

  const goBack = () => {
    playTactileClick();
    setMode('login');
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setResetCodeInput('');
    setCodeVerified(false);
    setVerifiedEmail('');
  };

  if (!isOpen) return null;

  // Determine header content based on mode
  const getHeaderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <Mail className="w-5 h-5 text-[#1F3FB0]" />
            <span>Sign In</span>
          </>
        );
      case 'signup':
        return (
          <>
            <UserPlus className="w-5 h-5 text-[#1F3FB0]" />
            <span>Create Account</span>
          </>
        );
      case 'forgot-password':
        return (
          <>
            <Unlock className="w-5 h-5 text-[#1F3FB0]" />
            <span>Reset Password</span>
          </>
        );
      case 'reset-password':
        return (
          <>
            <Key className="w-5 h-5 text-[#1F3FB0]" />
            <span>New Password</span>
          </>
        );
    }
  };

  // Determine toggle button text
  const getToggleText = () => {
    switch (mode) {
      case 'login':
        return "Don't have an account? Sign Up";
      case 'signup':
        return 'Already have an account? Sign In';
      case 'forgot-password':
        return 'Back to Sign In';
      case 'reset-password':
        return 'Back to Sign In';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signup' ? 'Sign Up' : mode === 'forgot-password' ? 'Reset Password' : mode === 'reset-password' ? 'Set New Password' : 'Sign In'}
    >
      <div className="relative w-full max-w-md bg-[#F4F1EA] border border-[#141414]/20 shadow-2xl rounded-xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-[#EDEBE6] border-b border-[#141414]/15 px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#141414] flex items-center gap-2">
            {getHeaderContent()}
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

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
            <FileText className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Google Sign In Option - only for login and signup */}
        {(mode === 'login' || mode === 'signup') && !isDesktopApp && (
          <div className="mx-6 mt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
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
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {/* Display Name - only for signup */}
          {mode === 'signup' && (
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

          {/* Email - for login, signup, forgot-password */}
          {(mode === 'login' || mode === 'signup' || mode === 'forgot-password') && (
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
                  placeholder={mode === 'forgot-password' ? 'you@example.com' : 'you@example.com'}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Password - for login, signup */}
          {(mode === 'login' || mode === 'signup') && (
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
          )}

          {/* Reset Code - for reset-password (display only if verified) */}
          {mode === 'reset-password' && codeVerified && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Reset code verified for <strong>{verifiedEmail}</strong>
            </div>
          )}

          {/* New Password - for reset-password */}
          {mode === 'reset-password' && (
            <>
              <div>
                <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
                  <span className="text-[#77736B]">New Password</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (min 6 characters)"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
                  <span className="text-[#77736B]">Confirm New Password</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#77736B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-[#1F3FB0] focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1F3FB0] text-white text-sm font-mono uppercase tracking-wider rounded-lg hover:bg-[#1656d6] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Link' : 'Reset Password'}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up / Forgot Password */}
        <div className="mx-6 mb-4 flex justify-center">
          <button
            onClick={mode === 'forgot-password' || mode === 'reset-password' ? goBack : toggleMode}
            className="text-xs font-mono text-[#1F3FB0] hover:text-[#1656d6] cursor-pointer"
          >
            {getToggleText()}
          </button>
        </div>

        {/* Forgot password link - only in login mode */}
        {mode === 'login' && (
          <div className="mx-6 mb-4 flex justify-center">
            <button
              onClick={goToForgotPassword}
              className="text-xs font-mono text-[#1F3FB0] hover:text-[#1656d6] cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {mode === 'login' && onContinueAsGuest && (
          <div className="mx-6 mb-6 flex flex-col items-center gap-2 border-t border-[#141414]/10 pt-4">
            <span className="text-[11px] font-mono text-[#77736B]">No account needed to try Marginalia.</span>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full py-2 border border-[#141414]/25 bg-white text-[#141414] text-xs font-mono uppercase tracking-wider hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
