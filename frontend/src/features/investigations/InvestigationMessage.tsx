import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Database
} from 'lucide-react';
import { ThreadMessage } from '../../types/api';
import { GeometricLogo } from '../../components/common/GeometricLogo';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { SelfCorrectionBadge } from '../../components/common/SelfCorrectionBadge';

interface InvestigationMessageProps {
  message: ThreadMessage;
  onRetry?: () => void;
  onViewEvidence?: () => void;
}

export const InvestigationMessage: React.FC<InvestigationMessageProps> = ({
  message,
  onRetry,
  onViewEvidence,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // User Query Bubble / Row
  if (message.role === 'user') {
    return (
      <div className="w-full flex justify-end mb-6">
        <div className="max-w-2xl bg-white border border-[#E7E8ED] rounded-2xl p-4 shadow-2xs flex flex-col gap-1.5">

          {message.attachedReport && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#625FEF] bg-[#ECEBFF] px-2 py-0.5 rounded border border-[#D9D7FF] w-fit">
              <Database className="w-3 h-3" />
              <span>Report: {message.attachedReport}</span>
            </div>
          )}

          <p className="text-sm font-medium text-[#292C33] leading-relaxed select-text">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#9A9DA6] mt-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

        </div>
      </div>
    );
  }

  // Error Response
  if (message.isError) {
    return (
      <div className="w-full mb-8">
        <div className="bg-[#FFF6DF] border border-[#FCE8B3] rounded-2xl p-5 shadow-2xs flex flex-col gap-3">

          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D9A441] shrink-0 mt-0.5" />

            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-semibold text-[#8C6212] uppercase tracking-wider">
                Connection Notice
              </h4>

              <p className="text-xs text-[#5C400B] leading-relaxed">
                {message.errorMessage ||
                  'Unable to connect to CyberGuard AI. Make sure the FastAPI backend is running at http://127.0.0.1:8000.'}
              </p>
            </div>
          </div>

          {onRetry && (
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FCE8B3] hover:border-[#D9A441] rounded-lg text-xs font-medium text-[#8C6212] shadow-2xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Investigation</span>
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  const response = message.response;
  const reasoning = response?.reasoning;
  const retrieval = response?.retrieval;
  const timing = response?.timing;

  // Fallback & evidence status
  const isFallback = response?.used_fallback === true;
  const hasEvidence = response?.evidence_used === true;
  const noEvidence = response?.evidence_used === false;

  return (
    <div className="w-full mb-8 flex flex-col gap-4">

      {/* Assistant Header & Card */}
      <div className="bg-white border border-[#E7E8ED] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">

        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F3F4F7]">

          <div className="flex items-center gap-2.5">
            <GeometricLogo size={22} />

            <span className="text-xs font-semibold text-[#292C33] tracking-tight">
              CyberGuard AI
            </span>

            <span className="text-xs text-[#9A9DA6]">
              ·
            </span>

            <span className="text-[11px] text-[#737782]">
              Evidence-grounded response
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#9A9DA6]">

            {timing?.total_seconds !== undefined && (
              <span className="font-mono tabular-nums bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E7E8ED]">
                {timing.total_seconds.toFixed(2)}s
              </span>
            )}

            <span>
              {formatTime(message.timestamp)}
            </span>

          </div>
        </div>

        {/* Answer */}
        <div className="text-xs sm:text-sm text-[#292C33] leading-relaxed whitespace-pre-line select-text">
          {message.content}
        </div>

        {/* Evidence, Confidence & Self-Correction */}
        <div className="mt-2 pt-3 border-t border-[#F3F4F7] flex flex-wrap items-center justify-between gap-4">

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">

            {/* Confidence */}
            <ConfidenceBadge
              confidence={response?.confidence}
              reason={response?.confidence_reason}
              showReasonInline={false}
            />

            {/* Self-Correction */}
            <SelfCorrectionBadge
              retryCount={response?.retry_count ?? 0}
              correctionExhausted={
                response?.correction_exhausted ?? false
              }
            />

            {/* Fallback & Evidence */}
            <div className="flex items-center gap-2 text-xs">

              {isFallback && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FFF6DF] text-[#A6781E] border border-[#FCE8B3]">
                  Fallback mode
                </span>
              )}

              {hasEvidence && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#E8F6EF] text-[#248259] border border-[#D0EFE0] inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Evidence found</span>
                </span>
              )}

              {noEvidence && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FAFAFC] text-[#9A9DA6] border border-[#E7E8ED]">
                  No evidence retrieved
                </span>
              )}

            </div>
          </div>

          {/* Inspect Sources */}
          {onViewEvidence &&
            ((retrieval?.documents?.length ?? 0) > 0 ||
              (retrieval?.graph?.length ?? 0) > 0) && (

              <button
                onClick={onViewEvidence}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#ECEBFF] text-[#625FEF] border border-[#E7E8ED] hover:border-[#D9D7FF] rounded-lg text-xs font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />

                <span>
                  Inspect Sources ({retrieval?.documents?.length || 0})
                </span>
              </button>
            )}

        </div>

        {/* Confidence Reason / Assessment */}
        {response?.confidence_reason && (
          <div className="px-3 py-2 bg-[#F9F9FC] border border-[#E7E8ED] rounded-xl text-xs text-[#737782] flex items-start gap-2">

            <span className="font-medium text-[#292C33] shrink-0">
              Assessment:
            </span>

            <span className="italic">
              {response.confidence_reason}
            </span>

          </div>
        )}

        {/* Investigation Details */}
        <div className="mt-1 pt-2 border-t border-[#F3F4F7]">

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-[#737782] hover:text-[#292C33] font-medium transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#625FEF]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#9A9DA6]" />
            )}

            <span>
              Investigation details
            </span>

            <span className="text-[11px] text-[#9A9DA6] font-normal">
              (structured reasoning & retrieval telemetry)
            </span>
          </button>

          {showDetails && (
            <div className="mt-3 p-4 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl flex flex-col gap-4 text-xs animate-in fade-in duration-150">

              {/* Structured Reasoning Metadata */}
              {reasoning && (
                <div className="flex flex-col gap-2">

                  <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                    Structured Reasoning Metadata
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                    {reasoning.sufficient !== undefined && (
                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#9A9DA6] block">
                          Sufficient
                        </span>

                        <span className="font-semibold text-[#292C33]">
                          {reasoning.sufficient
                            ? 'Yes (Verified)'
                            : 'No'}
                        </span>

                      </div>
                    )}

                    {reasoning.coverage && (
                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#9A9DA6] block">
                          Coverage
                        </span>

                        <span className="font-semibold text-[#292C33] capitalize">
                          {reasoning.coverage}
                        </span>

                      </div>
                    )}

                    {reasoning.consistency && (
                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#9A9DA6] block">
                          Consistency
                        </span>

                        <span className="font-semibold text-[#292C33] capitalize">
                          {reasoning.consistency}
                        </span>

                      </div>
                    )}

                  </div>

                  {reasoning.reason && (
                    <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                      <span className="text-[10px] text-[#9A9DA6] block mb-0.5">
                        Reason
                      </span>

                      <p className="text-[#4F5460] leading-relaxed">
                        {reasoning.reason}
                      </p>

                    </div>
                  )}

                  {/* Missing Information */}
                  {reasoning.missing_information &&
                    reasoning.missing_information.length > 0 && (

                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#D9A441] font-semibold block mb-1">
                          Missing Information
                        </span>

                        <ul className="list-disc list-inside space-y-0.5 text-[#737782]">

                          {reasoning.missing_information.map(
                            (item, i) => (
                              <li key={i}>
                                {item}
                              </li>
                            )
                          )}

                        </ul>

                      </div>
                    )}

                  {/* Conflicts */}
                  {reasoning.conflicts &&
                    reasoning.conflicts.length > 0 && (

                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#D65A67] font-semibold block mb-1">
                          Conflicts Detected
                        </span>

                        <ul className="list-disc list-inside space-y-0.5 text-[#737782]">

                          {reasoning.conflicts.map(
                            (item, i) => (
                              <li key={i}>
                                {item}
                              </li>
                            )
                          )}

                        </ul>

                      </div>
                    )}

                  {/* Unsupported Claims */}
                  {reasoning.unsupported_claims &&
                    reasoning.unsupported_claims.length > 0 && (

                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#D65A67] font-semibold block mb-1">
                          Unsupported Claims
                        </span>

                        <ul className="list-disc list-inside space-y-0.5 text-[#737782]">

                          {reasoning.unsupported_claims.map(
                            (item, i) => (
                              <li key={i}>
                                {item}
                              </li>
                            )
                          )}

                        </ul>

                      </div>
                    )}

                </div>
              )}

              {/* Retrieval Details */}
              {retrieval && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#E7E8ED]">

                  <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                    Retrieval Context
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {retrieval.intent && (
                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#9A9DA6] block">
                          Classified Intent
                        </span>

                        <span className="font-mono text-[#292C33]">
                          {retrieval.intent}
                        </span>

                      </div>
                    )}

                    {retrieval.expanded_query && (
                      <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                        <span className="text-[10px] text-[#9A9DA6] block">
                          Expanded Query
                        </span>

                        <span className="text-[#292C33]">
                          {retrieval.expanded_query}
                        </span>

                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Timing Metadata */}
              {timing && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#E7E8ED]">

                  <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                    Performance Telemetry
                  </span>

                  <div className="grid grid-cols-3 gap-2">

                    <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                      <span className="text-[10px] text-[#9A9DA6] block">
                        Retrieval Time
                      </span>

                      <span className="font-mono tabular-nums text-[#292C33]">
                        {timing.retrieval_seconds !== undefined
                          ? `${timing.retrieval_seconds.toFixed(2)}s`
                          : '—'}
                      </span>

                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                      <span className="text-[10px] text-[#9A9DA6] block">
                        Generation Time
                      </span>

                      <span className="font-mono tabular-nums text-[#292C33]">
                        {timing.answer_generation_seconds !== undefined
                          ? `${timing.answer_generation_seconds.toFixed(2)}s`
                          : '—'}
                      </span>

                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-[#E7E8ED]">

                      <span className="text-[10px] text-[#9A9DA6] block">
                        Total Duration
                      </span>

                      <span className="font-mono tabular-nums text-[#292C33]">
                        {timing.total_seconds !== undefined
                          ? `${timing.total_seconds.toFixed(2)}s`
                          : '—'}
                      </span>

                    </div>

                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};