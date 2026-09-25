import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import {
  InvestigationThread,
  ThreadMessage,
  ChatResponse,
  RetrievalDocument,
  GraphEvidence
} from '../../types/api';
import { sendChatMessage } from '../../lib/api/client';
import { InvestigationMessage } from './InvestigationMessage';
import { InvestigationComposer } from './InvestigationComposer';
import { EvidenceInspector } from './EvidenceInspector';

interface InvestigationWorkspaceProps {
  activeThread: InvestigationThread | null;
  onUpdateThread: (thread: InvestigationThread) => void;
  onNewThread: (initialQuery?: string, attachedReport?: string) => void;
  attachedReport?: string | null;
  onClearAttachedReport?: () => void;
  onOpenUpload: () => void;
  onSelectDocumentForPreview?: (filename: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  activeThread,
  onUpdateThread,
  onNewThread,
  attachedReport,
  onClearAttachedReport,
  onOpenUpload,
  onSelectDocumentForPreview,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Investigating...');
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isLoading]);

  // Loading animation stages
  useEffect(() => {
    if (!isLoading) return;
    const stages = [
      'Investigating threat intelligence...',
      'Retrieving vector evidence from Qdrant...',
      'Validating evidence & checking confidence...',
      'Synthesizing grounded analysis...',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % stages.length;
      setLoadingStage(stages[index]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Current active documents & graph from the latest assistant message
  const latestAssistantMessage = activeThread?.messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant' && !m.isError);

  const currentDocs: RetrievalDocument[] =
    latestAssistantMessage?.response?.retrieval?.documents || [];
  const currentGraph: GraphEvidence[] =
    latestAssistantMessage?.response?.retrieval?.graph || [];

  const handleSendMessage = async (queryText: string, reportContext?: string) => {
    const threadToUse =
      activeThread || {
        id: `thread-${Date.now()}`,
        title: queryText.slice(0, 48),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

    const userMessage: ThreadMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
      attachedReport: reportContext,
    };

    const updatedWithUser: InvestigationThread = {
      ...threadToUse,
      title: threadToUse.messages.length === 0 ? queryText.slice(0, 48) : threadToUse.title,
      updatedAt: new Date().toISOString(),
      messages: [...threadToUse.messages, userMessage],
    };

    onUpdateThread(updatedWithUser);
    setIsLoading(true);
    setLoadingStage('Investigating threat intelligence...');

    try {
      // Build actual prompt sent to backend
      const fullQuery = reportContext
        ? `[Attached Report: ${reportContext}] ${queryText}`
        : queryText;

      const response: ChatResponse = await sendChatMessage({ query: fullQuery });

      const assistantMessage: ThreadMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        response,
      };

      const finalThread: InvestigationThread = {
        ...updatedWithUser,
        updatedAt: new Date().toISOString(),
        confidence: response.confidence,
        evidenceUsed: response.evidence_used,
        retryCount: response.retry_count,
        messages: [...updatedWithUser.messages, assistantMessage],
      };

      onUpdateThread(finalThread);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred during investigation.';

      const errorAssistantMessage: ThreadMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isError: true,
        errorMessage,
      };

      const threadWithError: InvestigationThread = {
        ...updatedWithUser,
        updatedAt: new Date().toISOString(),
        messages: [...updatedWithUser.messages, errorAssistantMessage],
      };

      onUpdateThread(threadWithError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    if (!activeThread) return;
    const lastUserMsg = activeThread.messages
      .slice()
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachedReport);
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-row overflow-hidden relative">
      {/* Central Conversation Workspace */}
      <div className="flex-1 flex flex-col justify-between h-full overflow-hidden bg-[#F7F8FA]">
        {/* Investigation Sub-Header */}
        <div className="px-6 py-3 border-b border-[#E7E8ED] bg-white/50 backdrop-blur-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#292C33]">
                {activeThread?.title || 'New Investigation'}
              </h2>
              <span className="text-[11px] text-[#737782]">
                Evidence-grounded threat intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isEvidenceOpen
                  ? 'bg-[#ECEBFF] text-[#625FEF] border-[#D9D7FF]'
                  : 'bg-white text-[#737782] border-[#E7E8ED] hover:bg-[#F7F8FA]'
              }`}
              title="Toggle Evidence panel"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Evidence {currentDocs.length > 0 ? `(${currentDocs.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl w-full mx-auto">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-[#737782]">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7E8ED] flex items-center justify-center text-[#625FEF] mb-3 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#292C33]">
                Start your threat investigation
              </h3>
              <p className="text-xs text-[#9A9DA6] max-w-sm mt-1 mb-6">
                Inquire about actors, techniques, IOCs, or ransomware behavior. Responses are grounded in verified evidence.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                <button
                  onClick={() => handleSendMessage('What is LockBit?')}
                  className="px-3 py-1.5 bg-white border border-[#E7E8ED] hover:border-[#625FEF]/50 rounded-xl text-xs text-[#292C33] shadow-2xs transition-colors"
                >
                  "What is LockBit?"
                </button>
                <button
                  onClick={() => handleSendMessage('Explain the relationship between LockBit and StealBit.')}
                  className="px-3 py-1.5 bg-white border border-[#E7E8ED] hover:border-[#625FEF]/50 rounded-xl text-xs text-[#292C33] shadow-2xs transition-colors"
                >
                  "LockBit & StealBit relation"
                </button>
                <button
                  onClick={() => handleSendMessage('Summarize the tactics associated with LockBit.')}
                  className="px-3 py-1.5 bg-white border border-[#E7E8ED] hover:border-[#625FEF]/50 rounded-xl text-xs text-[#292C33] shadow-2xs transition-colors"
                >
                  "Summarize LockBit tactics"
                </button>
              </div>
            </div>
          ) : (
            activeThread.messages.map((message) => (
              <InvestigationMessage
                key={message.id}
                message={message}
                onRetry={handleRetryLast}
                onViewEvidence={() => setIsEvidenceOpen(true)}
              />
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="w-full mb-8">
              <div className="bg-white/90 backdrop-blur-md border border-[#E7E8ED] rounded-2xl p-5 shadow-xs flex items-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-[#625FEF] animate-spin shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-[#292C33]">
                    {loadingStage}
                  </span>
                  <span className="text-[10px] text-[#9A9DA6]">
                    Performing Qdrant vector retrieval & self-correcting validation...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <InvestigationComposer
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          attachedReport={attachedReport}
          onClearAttachedReport={onClearAttachedReport}
          onOpenUpload={onOpenUpload}
        />
      </div>

      {/* Right-Hand Evidence Inspector */}
      {isEvidenceOpen && (
        <EvidenceInspector
          documents={currentDocs}
          graph={currentGraph}
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          onSelectDocumentForPreview={onSelectDocumentForPreview}
        />
      )}
    </div>
  );
};
