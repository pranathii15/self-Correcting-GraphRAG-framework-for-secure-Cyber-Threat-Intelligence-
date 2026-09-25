import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Shield,
  X,
  Layers
} from 'lucide-react';
import { RetrievalDocument, GraphEvidence } from '../../types/api';

interface EvidenceInspectorProps {
  documents?: RetrievalDocument[];
  graph?: GraphEvidence[];
  isOpen: boolean;
  onClose?: () => void;
  onSelectDocumentForPreview?: (filename: string) => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  documents = [],
  graph = [],
  isOpen,
  onClose,
  onSelectDocumentForPreview,
}) => {
  const [expandedDocIds, setExpandedDocIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedDocIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasEvidence = documents.length > 0 || graph.length > 0;

  return (
    <aside className="w-full md:w-[320px] lg:w-[360px] h-full bg-[#FFFFFF]/95 backdrop-blur-md border-l border-[#E7E8ED] flex flex-col justify-between shrink-0 overflow-hidden z-20">
      {/* Header */}
      <div className="p-4 border-b border-[#E7E8ED] bg-[#FAFAFC]/60 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#625FEF]" />
            <h3 className="text-xs font-semibold text-[#292C33] uppercase tracking-wider">
              Evidence
            </h3>
          </div>
          <span className="text-[11px] text-[#737782] mt-0.5">
            Sources used for this investigation
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9A9DA6] hover:text-[#292C33] hover:bg-[#F3F4F7] transition-colors"
            aria-label="Close evidence panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body: Documents and Graph Evidence */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
        {!hasEvidence ? (
          <div className="py-12 text-center text-[#9A9DA6] flex flex-col items-center">
            <FileText className="w-8 h-8 text-[#D0D3DB] mb-2" />
            <p className="font-medium text-[#737782]">No evidence retrieved</p>
            <p className="text-[11px] max-w-[220px] mt-1 text-[#9A9DA6]">
              When queries are processed, verified CTI sources and graph relationships will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Retrieved Documents Section */}
            {documents.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                    Retrieved Documents ({documents.length})
                  </span>
                  <span className="text-[10px] text-[#9A9DA6]">Vector Grounding</span>
                </div>

                <div className="flex flex-col gap-2">
                  {documents.map((doc, idx) => {
                    const docId = doc.id || `doc-${idx}`;
                    const isExpanded = !!expandedDocIds[docId];
                    const filename = doc.filename || doc.source || 'CTI Document';

                    return (
                      <div
                        key={docId}
                        className="bg-[#FAFAFC] hover:bg-white border border-[#E7E8ED] hover:border-[#D0D3DB] rounded-xl p-3 transition-all shadow-2xs flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-[#625FEF] shrink-0 mt-0.5" />
                            <div className="flex flex-col truncate">
                              <span className="font-medium text-[#292C33] truncate" title={filename}>
                                {filename}
                              </span>
                              {doc.source && doc.source !== filename && (
                                <span className="text-[10px] text-[#9A9DA6] truncate">
                                  {doc.source}
                                </span>
                              )}
                            </div>
                          </div>

                          {onSelectDocumentForPreview && (
                            <button
                              onClick={() => onSelectDocumentForPreview(filename)}
                              className="text-[#9A9DA6] hover:text-[#625FEF] p-0.5"
                              title="Inspect file in Files view"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Excerpt */}
                        {(doc.excerpt || doc.content) && (
                          <div className="bg-white p-2.5 rounded-lg border border-[#F0F1F5] text-[11px] text-[#4F5460] leading-relaxed">
                            <p className={isExpanded ? '' : 'line-clamp-3'}>
                              "{doc.excerpt || doc.content}"
                            </p>
                            {(doc.excerpt || doc.content) && (
                              <button
                                onClick={() => toggleExpand(docId)}
                                className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#625FEF] hover:underline"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" /> Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" /> Expand excerpt
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Metadata tags if actually provided by backend */}
                        {doc.score !== undefined && (
                          <div className="flex items-center justify-between text-[10px] text-[#9A9DA6] pt-1 border-t border-[#F3F4F7]">
                            <span>Relevance score</span>
                            <span className="font-mono tabular-nums text-[#292C33]">
                              {(doc.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Graph Evidence Section */}
            {graph.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-2 border-t border-[#F3F4F7]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#7B78F2]" />
                    <span>Graph Evidence ({graph.length})</span>
                  </span>
                  <span className="text-[10px] text-[#9A9DA6]">Ontology</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {graph.map((edge, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#F9F9FC] rounded-xl border border-[#E7E8ED] flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-[#292C33] truncate max-w-[90px]">
                        {edge.source || 'Entity'}
                      </span>
                      <span className="text-[10px] text-[#625FEF] font-mono px-1.5 py-0.5 bg-[#ECEBFF] rounded border border-[#D9D7FF]/60 truncate max-w-[90px]">
                        — {edge.relation || edge.type || 'relates to'} →
                      </span>
                      <span className="font-semibold text-[#292C33] truncate max-w-[90px]">
                        {edge.target || 'Target'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC] text-[10px] text-[#9A9DA6] flex items-center justify-between">
        <span>Verified CTI Sources</span>
        <span>GraphRAG & Vector Retrieval</span>
      </div>
    </aside>
  );
};
