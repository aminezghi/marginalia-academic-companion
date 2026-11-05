import React, { useState } from 'react';
import { X, Download, Trash2, AlertTriangle, Check, UserX, FileJson, ExternalLink } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onExportData,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'delete'>('export');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await onExportData();
      setSuccess('Your data has been exported and downloaded.');
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setError('Please confirm you want to delete your account');
      return;
    }
    if (!deletePassword) {
      setError('Please enter your password to confirm');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await onDeleteAccount(deletePassword);
      setSuccess('Account deleted successfully. Redirecting...');
      // The AuthContext will handle logout and cleanup
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Account deletion failed');
    } finally {
      setLoading(false);
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
      aria-label="Account Settings"
    >
      <div className="relative w-full max-w-md bg-[#F4F1EA] border border-[#141414]/20 shadow-2xl rounded-xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-[#EDEBE6] border-b border-[#141414]/15 px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#141414] flex items-center gap-2">
            <UserX className="w-5 h-5 text-[#1F3FB0]" />
            <span>Account Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#4A433B] hover:text-[#141414] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#141414]/15">
          <nav className="flex" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'export'}
              onClick={() => { playTactileClick(); setActiveTab('export'); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 px-4 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'export'
                  ? 'border-[#1F3FB0] text-[#1F3FB0]'
                  : 'border-transparent text-[#77736B] hover:text-[#4A433B]'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export Data
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'delete'}
              onClick={() => { playTactileClick(); setActiveTab('delete'); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 px-4 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'delete'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-[#77736B] hover:text-red-600'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete Account
            </button>
          </nav>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <FileJson className="w-12 h-12 text-[#1F3FB0] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-semibold text-[#141414] mb-2">Export Your Data</h4>
              <p className="text-sm text-[#4A433B] leading-relaxed">
                Download a complete backup of your research library including papers, collections, notes, highlights, reading progress, goals, activities, and PDF metadata.
              </p>
            </div>

            <div className="bg-white border border-[#141414]/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Profile & Settings</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Research Papers & Metadata</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Collections & Volumes</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Notes, Highlights & Bookmarks</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Reading Progress & Sessions</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">Goals & Activity Log</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A433B]">PDF File References</span>
                <span className="text-green-600 font-mono">Included</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-2.5 bg-[#1F3FB0] text-white text-sm font-mono uppercase tracking-wider rounded-lg hover:bg-[#1656d6] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {loading ? 'Preparing Export...' : 'Download Data Export (JSON)'}
            </button>

            <p className="text-xs text-[#77736B] text-center">
              Export includes JSON metadata. PDF files must be downloaded separately from the reader.
            </p>
          </div>
        )}

        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h4 className="font-serif text-lg font-semibold text-red-700 mb-2">Delete Your Account</h4>
              <p className="text-sm text-[#4A433B] leading-relaxed">
                This action is <strong>permanent and irreversible</strong>. All your data will be deleted including:
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Research papers and all metadata</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Collections, volumes, and organization</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Notes, highlights, and bookmarks</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Reading progress and history</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Goals and activity logs</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Uploaded PDF files</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Authentication account</span>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-mono text-[#4A433B] mb-1.5">
                <span className="text-[#77736B]">Enter your password to confirm</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-3 py-2 bg-white border border-[#141414]/20 rounded-lg text-sm font-serif focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-red-600 border-red-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-red-700 font-mono">
                I understand this will permanently delete my account and all data
              </span>
            </label>

            <button
              onClick={handleDelete}
              disabled={loading || !deleteConfirm || !deletePassword}
              className="w-full py-2.5 bg-red-600 text-white text-sm font-mono uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting Account...' : 'Permanently Delete Account'}
            </button>

            <p className="text-xs text-[#77736B] text-center">
              Consider exporting your data first using the Export tab above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
