import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, X, FileText } from 'lucide-react';

interface InvestigationComposerProps {
  onSendMessage: (query: string, attachedReport?: string) => void;
  isLoading: boolean;
  attachedReport?: string | null;
  onClearAttachedReport?: () => void;
  onOpenUpload: () => void;
}

export const InvestigationComposer: React.FC<InvestigationComposerProps> = ({
  onSendMessage,
  isLoading,
  attachedReport,
  onClearAttachedReport,
  onOpenUpload,
}) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed, attachedReport || undefined);
    setQuery('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      {/* Attached report context banner */}
      {attachedReport && (
        <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-[#ECEBFF] border border-[#D9D7FF] rounded-xl text-xs text-[#625FEF] animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Using report: <strong className="font-semibold">{attachedReport}</strong>
            </span>
          </div>
          {onClearAttachedReport && (
            <button
              onClick={onClearAttachedReport}
              className="p-1 hover:bg-[#D9D7FF]/50 rounded text-[#625FEF] transition-colors ml-2"
              title="Remove attached report"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E7E8ED] shadow-sm hover:shadow-md transition-all p-2 flex items-center gap-2 focus-within:border-[#625FEF]/50 focus-within:ring-2 focus-within:ring-[#625FEF]/10">
        <button
          type="button"
          onClick={onOpenUpload}
          className="p-2 rounded-xl text-[#9A9DA6] hover:text-[#625FEF] hover:bg-[#F3F4F7] transition-colors shrink-0"
          title="Attach or upload CTI report"
          aria-label="Attach CTI report"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a threat-intelligence question (e.g., 'What is LockBit?' or 'Explain StealBit relation')..."
          className="flex-1 py-1.5 text-xs sm:text-sm text-[#292C33] placeholder-[#9A9DA6] bg-transparent resize-none focus:outline-none min-h-[38px] max-h-28"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${
            query.trim() && !isLoading
              ? 'bg-[#625FEF] text-white hover:bg-[#524FE0] shadow-xs'
              : 'bg-[#F3F4F7] text-[#9A9DA6] cursor-not-allowed'
          }`}
          title="Send query (Enter)"
          aria-label="Send query"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#9A9DA6] px-2 pt-1.5">
        <span>Enter to submit · Shift+Enter for newline</span>
        <span>Self-correcting CTI retrieval</span>
      </div>
    </div>
  );
};
