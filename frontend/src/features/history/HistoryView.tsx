import React, { useState } from 'react';
import {
  History,
  Search,
  MessageSquareText,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { InvestigationThread } from '../../types/api';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';

interface HistoryViewProps {
  threads: InvestigationThread[];
  onSelectThread: (threadId: string) => void;
  onClearHistory?: () => void;
  onNewInvestigation: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  threads,
  onSelectThread,
  onClearHistory,
  onNewInvestigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F7F8FA] p-6 sm:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E7E8ED]">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#625FEF]" />
              <h1 className="text-lg font-semibold text-[#292C33]">
                Investigation History
              </h1>
            </div>
            <p className="text-xs text-[#737782] mt-0.5">
              Browser-persisted threat investigation sessions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {threads.length > 0 && onClearHistory && (
              <button
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#737782] hover:text-[#D65A67] hover:bg-[#FCEBED] border border-[#E7E8ED] rounded-xl transition-colors"
                title="Clear local history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}

            <button
              onClick={onNewInvestigation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Investigation</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9A9DA6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past investigations by question or content..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF]/50 shadow-2xs transition-colors"
          />
        </div>

        {/* Thread List */}
        <div className="flex flex-col gap-2.5">
          {filteredThreads.length === 0 ? (
            <div className="py-16 text-center text-[#9A9DA6] bg-white rounded-2xl border border-[#E7E8ED] p-8 flex flex-col items-center">
              <History className="w-10 h-10 text-[#D0D3DB] mb-3" />
              <h3 className="text-sm font-semibold text-[#292C33]">
                No investigation sessions found
              </h3>
              <p className="text-xs text-[#9A9DA6] mt-1 max-w-sm">
                {searchQuery
                  ? `No previous threads match "${searchQuery}".`
                  : 'Start an investigation from the Overview workspace to build session history.'}
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const lastUpdated = new Date(thread.updatedAt || thread.createdAt);
              const messageCount = thread.messages.length;

              return (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread.id)}
                  className="bg-white hover:bg-[#FAFAFC] border border-[#E7E8ED] hover:border-[#625FEF]/40 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-[#ECEBFF] flex items-center justify-center text-[#625FEF] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <MessageSquareText className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col truncate">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#292C33] group-hover:text-[#625FEF] transition-colors truncate">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#737782] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#9A9DA6]" />
                          <span>{lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span>·</span>
                        <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Confidence Metadata */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F7]">
                    {thread.confidence && (
                      <ConfidenceBadge confidence={thread.confidence} />
                    )}

                    {thread.evidenceUsed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#248259] bg-[#E8F6EF] px-2.5 py-0.5 rounded border border-[#D0EFE0]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Evidence found</span>
                      </span>
                    )}

                    <div className="p-1 rounded-lg text-[#9A9DA6] group-hover:text-[#625FEF] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center text-xs text-[#9A9DA6] pt-4">
          Threads stored locally in browser session storage
        </div>
      </div>
    </div>
  );
};
