import React, { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, Key, X } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ApiKeyPromptProps {
  onDismiss: () => void;
  onConfigured: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onDismiss, onConfigured }) => {
  const [hasKey, setHasKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isDesktop = Boolean(window.marginaliaDesktop?.isDesktop);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onDismiss();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSaving, onDismiss]);

  const saveKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!window.marginaliaDesktop) {
      setError('Secure key entry is available in the installed desktop app. For browser development, set GEMINI_API_KEY in .env and restart the server.');
      return;
    }
    if (apiKey.trim().length < 8) {
      setError('Enter your Gemini API key to continue.');
      return;
    }

    setIsSaving(true);
    try {
      await window.marginaliaDesktop.saveGeminiApiKey(apiKey.trim());
      setApiKey('');
      playTactileClick();
      onConfigured();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The key could not be saved securely.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
        className="w-full max-w-lg border border-[#141414]/20 bg-[#F4F1EA] p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1F3FB0]/10 text-[#1F3FB0]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1F3FB0]">Optional AI workspace</p>
                <h2 id="api-key-title" className="mt-1 font-serif text-2xl text-[#141414]">Do you have a Gemini API key?</h2>
              </div>
              <button type="button" aria-label="Close API key setup" onClick={onDismiss} className="rounded p-1 text-[#4A433B] hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#4A433B]">
              Add a key to unlock AI questions and literature synthesis. Without one, AI stays locked; reading, importing, notes, and the rest of Marginalia remain available.
            </p>
            <p className="mt-3 border-l-2 border-[#1F3FB0]/40 pl-3 text-xs leading-5 text-[#4A433B]/80">
              When you use AI, your question and the selected paper metadata and abstracts are sent to Google Gemini using your key.
            </p>

            {isDesktop ? (
              <div className="mt-5">
                {!hasKey ? (
                  <button type="button" onClick={() => setHasKey(true)} className="flex w-full items-center justify-center gap-2 bg-[#1F3FB0] px-4 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#18338f]">
                    <Key className="h-4 w-4" />
                    Yes, I have an API key
                  </button>
                ) : (
                  <form onSubmit={saveKey}>
                    <label htmlFor="gemini-api-key" className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#4A433B]">Gemini API key</label>
                    <input
                      id="gemini-api-key"
                      type="password"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      required
                      minLength={8}
                      maxLength={512}
                      className="w-full border border-[#141414]/25 bg-white px-3 py-3 font-mono text-sm text-[#141414] outline-none focus:border-[#1F3FB0] focus:ring-2 focus:ring-[#1F3FB0]/20"
                      placeholder="Paste key from Google AI Studio"
                    />
                    <button type="submit" disabled={isSaving} className="mt-3 w-full bg-[#1F3FB0] px-4 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#18338f] disabled:cursor-wait disabled:opacity-60">
                      {isSaving ? 'Saving securely…' : 'Save key and unlock AI'}
                    </button>
                  </form>
                )}
                <p className="mt-2 text-[11px] leading-5 text-[#4A433B]/70">The installed Windows app stores this key encrypted with Windows secure storage. It is not saved in your library or browser storage.</p>
              </div>
            ) : (
              <div className="mt-5 rounded border border-[#141414]/10 bg-white p-4 text-sm leading-6 text-[#4A433B]">
                Browser development mode reads `GEMINI_API_KEY` from the local `.env` file. Set it there and restart the development server to unlock AI.
              </div>
            )}

            {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#1F3FB0] hover:underline">
                Get a key from Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
              <button type="button" onClick={() => { playTactileClick(); onDismiss(); }} className="px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-[#4A433B] hover:text-[#141414]">
                No key — keep AI locked
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
