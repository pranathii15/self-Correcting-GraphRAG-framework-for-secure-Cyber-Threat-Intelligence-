import React, { useState, useEffect } from 'react';
import { X, Server, ShieldCheck, Check, AlertCircle, RefreshCw, User, Terminal, Sparkles, LogOut } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth, DEFAULT_API_BASE } from '../../lib/api/client';
import { AuthUser } from '../../types/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  authUser,
  onLogout,
}) => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_BASE);
  const [isSaved, setIsSaved] = useState(false);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiBaseUrl());
      setIsSaved(false);
      handleTestConnection();
    }
  }, [isOpen]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTestingStatus('testing');
    setStatusMessage('Pinging backend endpoint...');
    const result = await checkBackendHealth();
    if (result.online) {
      setTestingStatus('online');
      setStatusMessage(result.message);
    } else {
      setTestingStatus('offline');
      setStatusMessage(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292C33]/20 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border border-[#E7E8ED] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E8ED] bg-[#FAFAFC]/60">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-[#625FEF]" />
            <h2 className="text-sm font-semibold text-[#292C33]">Settings & Workspace Environment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9A9DA6] hover:text-[#292C33] hover:bg-[#F3F4F7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 text-xs text-[#292C33]">
          {/* Profile Section */}
          <div className="flex flex-col gap-2 pb-4 border-b border-[#F3F4F7]">
            <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
              Profile & Session
            </span>
            <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-xl border border-[#E7E8ED]">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-full bg-[#ECEBFF] flex items-center justify-center text-[#625FEF] font-semibold text-sm shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium text-[#292C33] truncate">
                    {authUser?.full_name || authUser?.username || 'Cyber Analyst'}
                  </span>
                  <span className="text-[11px] text-[#737782] truncate">
                    {authUser?.email || 'Authenticated Analyst Session'}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FCEBED] border border-[#E7E8ED] hover:border-[#F8D2D7] text-xs font-medium text-[#B83E4C] rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Backend Connection */}
          <div className="flex flex-col gap-2 pb-4 border-b border-[#F3F4F7]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                API Base URL
              </span>
              <span className="text-[11px] text-[#9A9DA6]">FastAPI Service Endpoint</span>
            </div>
            <form onSubmit={handleSaveUrl} className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-3 py-2 bg-[#F7F8FA] border border-[#E7E8ED] rounded-xl text-xs font-mono text-[#292C33] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </form>
            <p className="text-[11px] text-[#737782] leading-relaxed">
              Default is <code className="font-mono bg-[#F3F4F7] px-1 py-0.5 rounded">http://127.0.0.1:8000</code>.
              Requests to <code className="font-mono bg-[#F3F4F7] px-1 py-0.5 rounded">/chat/</code> and{' '}
              <code className="font-mono bg-[#F3F4F7] px-1 py-0.5 rounded">/documents/upload</code> are sent to this address.
            </p>
          </div>

          {/* Backend Status Check */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                System Status
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingStatus === 'testing'}
                className="inline-flex items-center gap-1 text-[11px] text-[#625FEF] hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                testingStatus === 'online'
                  ? 'bg-[#E8F6EF] border-[#D0EFE0] text-[#248259]'
                  : testingStatus === 'offline'
                  ? 'bg-[#FFF6DF] border-[#FCE8B3] text-[#A6781E]'
                  : 'bg-[#F7F8FA] border-[#E7E8ED] text-[#737782]'
              }`}
            >
              {testingStatus === 'online' ? (
                <ShieldCheck className="w-4 h-4 text-[#3BAA78] shrink-0 mt-0.5" />
              ) : testingStatus === 'offline' ? (
                <AlertCircle className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
              ) : (
                <Terminal className="w-4 h-4 text-[#737782] shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs">
                  {testingStatus === 'online'
                    ? 'Backend Connected'
                    : testingStatus === 'offline'
                    ? 'FastAPI Server Standby / Offline'
                    : 'Checking connection...'}
                </span>
                <span className="text-[11px] opacity-90 leading-relaxed">
                  {statusMessage || 'Verifying local endpoint connectivity...'}
                </span>
                {testingStatus === 'offline' && (
                  <span className="text-[10px] text-[#737782] mt-1 italic">
                    Start your local FastAPI backend with: <code className="font-mono bg-white/70 px-1 py-0.5 rounded">uvicorn main:app --reload --port 8000</code>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Credentials Notice */}
          <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E7E8ED] text-[11px] text-[#737782] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#625FEF] shrink-0" />
            <span>
              CyberGuard AI executes all vector retrieval and graph reasoning securely through the designated FastAPI backend. No API secrets are exposed to the client.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAFAFC] border-t border-[#E7E8ED] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#292C33] hover:bg-[#1A1C20] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
