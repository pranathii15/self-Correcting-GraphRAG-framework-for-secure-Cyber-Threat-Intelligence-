import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  Shield,
  Layers,
  Search,
  ChevronRight,
  Database,
  Terminal,
  FileText
} from 'lucide-react';
import { GeometricLogo } from '../../components/common/GeometricLogo';
import { InvestigationThread } from '../../types/api';

interface OverviewViewProps {
  onStartInvestigation: (query: string, attachedReport?: string) => void;
  recentThreads: InvestigationThread[];
  onSelectThread: (threadId: string) => void;
  onOpenUpload: () => void;
  activeReportContext?: string | null;
  onClearReportContext?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onStartInvestigation,
  recentThreads,
  onSelectThread,
  onOpenUpload,
  activeReportContext,
  onClearReportContext,
}) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    { label: 'What is LockBit?', icon: Shield, query: 'What is LockBit?' },
    {
      label: 'LockBit & StealBit relation',
      icon: Layers,
      query: 'Explain the relationship between LockBit and StealBit.',
    },
    {
      label: 'Summarize LockBit tactics',
      icon: Terminal,
      query: 'Summarize the tactics associated with LockBit.',
    },
    {
      label: 'Find indicators in reports',
      icon: Search,
      query: 'Find indicators from my uploaded reports.',
    },
    {
      label: 'Analyze threat evidence',
      icon: FileText,
      query: 'Analyze the evidence related to this threat.',
    },
  ];

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (overrideQuery?: string) => {
    const text = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!text) return;
    onStartInvestigation(text, activeReportContext || undefined);
    setQuery('');
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden">
      {/* Subtle atmospheric ambient glow per spec Section 3 */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full bg-gradient-to-tr from-[#ECEBFF]/40 via-[#EAF3FF]/40 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-3xl flex flex-col items-center mx-auto my-auto text-center">
        {/* Central Geometric Brand Emblem */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7E8ED] shadow-xs flex items-center justify-center p-3 mb-4 transition-transform hover:scale-105 duration-200">
            <GeometricLogo size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#292C33] tracking-tight">
            Good morning, Analyst.
          </h1>
          <p className="text-sm text-[#737782] mt-1.5 max-w-md font-normal">
            Investigate threats with evidence, not assumptions.
          </p>
        </div>

        {/* Primary prompt question */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-medium text-[#292C33]">
            How can I help you investigate today?
          </h2>
        </div>

        {/* Active Attached Report Banner if set */}
        {activeReportContext && (
          <div className="w-full mb-3 flex items-center justify-between px-3.5 py-2 bg-[#ECEBFF]/80 border border-[#D9D7FF] rounded-xl text-xs text-[#625FEF]">
            <div className="flex items-center gap-2 truncate">
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Investigating in context of: <strong className="font-semibold">{activeReportContext}</strong>
              </span>
            </div>
            {onClearReportContext && (
              <button
                onClick={onClearReportContext}
                className="text-xs hover:underline text-[#625FEF] font-medium shrink-0 ml-2"
              >
                Clear context
              </button>
            )}
          </div>
        )}

        {/* Main Centered Investigation Composer */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-[#E7E8ED] shadow-sm hover:shadow-md transition-all p-2 sm:p-3 relative group focus-within:border-[#625FEF]/50 focus-within:ring-2 focus-within:ring-[#625FEF]/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenUpload}
              className="p-2.5 rounded-xl text-[#9A9DA6] hover:text-[#625FEF] hover:bg-[#F3F4F7] transition-colors shrink-0"
              title="Upload / attach CTI report"
              aria-label="Upload CTI report"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about a threat, malware, actor, technique, vulnerability, or indicator..."
              className="w-full resize-none py-2 text-sm text-[#292C33] placeholder-[#9A9DA6] bg-transparent focus:outline-none min-h-[44px] max-h-32"
            />

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!query.trim()}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                query.trim()
                  ? 'bg-[#625FEF] text-white hover:bg-[#524FE0] shadow-xs'
                  : 'bg-[#F3F4F7] text-[#9A9DA6] cursor-not-allowed'
              }`}
              title="Send investigation query (Enter)"
              aria-label="Submit query"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggested Prompt Buttons matching reference style */}
        <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2">
          {suggestedPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSubmit(item.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-[#F3F4F7] border border-[#E7E8ED] hover:border-[#D0D3DB] rounded-xl text-xs font-medium text-[#737782] hover:text-[#292C33] transition-all shadow-2xs group"
              >
                <Icon className="w-3.5 h-3.5 text-[#9A9DA6] group-hover:text-[#625FEF] transition-colors" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recent Investigations on Overview */}
        {recentThreads.length > 0 && (
          <div className="w-full mt-10 pt-6 border-t border-[#E7E8ED]/80 flex flex-col items-start text-left">
            <span className="text-[11px] font-semibold text-[#9A9DA6] uppercase tracking-wider mb-2.5">
              Recent Investigation Threads
            </span>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentThreads.slice(0, 4).map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onSelectThread(thread.id)}
                  className="flex items-center justify-between p-3 bg-white/70 hover:bg-white border border-[#E7E8ED] hover:border-[#625FEF]/30 rounded-xl transition-all group text-left shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#625FEF]/70 group-hover:scale-125 transition-transform" />
                    <span className="text-xs font-medium text-[#292C33] group-hover:text-[#625FEF] transition-colors truncate">
                      {thread.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9A9DA6] group-hover:text-[#625FEF] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle workspace footer info */}
      <div className="mt-8 text-center text-xs text-[#9A9DA6] font-normal">
        Evidence-grounded RAG · Vector retrieval via Qdrant · Self-correcting validation
      </div>
    </div>
  );
};
