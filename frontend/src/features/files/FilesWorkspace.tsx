import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderClosed,
  FileText,
  Search,
  UploadCloud,
  Download,
  Sparkles,
  FileCode,
  AlertCircle,
  RefreshCw,
  Loader2,
  HardDrive,
  FileSpreadsheet
} from 'lucide-react';
import { BackendDocument } from '../../types/api';
import { getDocuments, getDocumentPreview, downloadDocument } from '../../lib/api/files';

interface FilesWorkspaceProps {
  onOpenUploadModal: () => void;
  onUseInInvestigation: (filename: string) => void;
  selectedFileId?: string | null;
  onSelectFileId?: (id: string | null) => void;
  refreshTrigger?: number;
  onDocumentsLoaded?: (documents: BackendDocument[]) => void;
}

export const FilesWorkspace: React.FC<FilesWorkspaceProps> = ({
  onOpenUploadModal,
  onUseInInvestigation,
  selectedFileId: controlledSelectedId,
  onSelectFileId,
  refreshTrigger = 0,
  onDocumentsLoaded,
}) => {
  const [documents, setDocuments] = useState<BackendDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'PDF' | 'TXT' | 'DOCX' | 'JSON'>('All');

  // Preview state
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Fetch real document list from GET /documents/
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getDocuments();
      setDocuments(data);
      if (onDocumentsLoaded) {
        onDocumentsLoaded(data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [onDocumentsLoaded]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshTrigger]);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const setSelectedId = (id: string | null) => {
    if (onSelectFileId) {
      onSelectFileId(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  // Find currently selected document
  const selectedDoc = documents.find(
    (d) =>
      d.stored_filename === selectedId ||
      d.original_filename === selectedId
  ) || (documents.length > 0 && !selectedId ? documents[0] : null);

  // Sync internal selected ID if null and documents exist
  useEffect(() => {
    if (!selectedId && documents.length > 0) {
      setSelectedId(documents[0].stored_filename || documents[0].original_filename);
    }
  }, [documents, selectedId]);

  // Check if a document supports text/json preview
  const isTxtOrJson = (doc: BackendDocument): boolean => {
    const type = (doc.file_type || '').toLowerCase();
    const name = (doc.original_filename || doc.stored_filename || '').toLowerCase();
    return (
      type.includes('json') ||
      type.includes('txt') ||
      type.includes('text') ||
      name.endsWith('.json') ||
      name.endsWith('.txt')
    );
  };

  // Fetch preview when selectedDoc changes
  useEffect(() => {
    if (!selectedDoc) {
      setPreviewContent(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    if (!isTxtOrJson(selectedDoc)) {
      setPreviewContent(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    let isMounted = true;
    const fetchPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      setPreviewContent(null);

      const targetFilename = selectedDoc.stored_filename || selectedDoc.original_filename;
      try {
        const text = await getDocumentPreview(targetFilename);
        if (isMounted) {
          // If JSON, attempt pretty print
          try {
            const parsed = JSON.parse(text);
            setPreviewContent(JSON.stringify(parsed, null, 2));
          } catch {
            setPreviewContent(text);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPreviewError(err instanceof Error ? err.message : 'Unable to load preview');
        }
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [selectedDoc]);

  // Handle Download using GET /documents/{filename}/download
  const handleDownload = async () => {
    if (!selectedDoc) return;
    setIsDownloading(true);
    setDownloadError(null);

    const targetFilename = selectedDoc.stored_filename || selectedDoc.original_filename;
    try {
      await downloadDocument(targetFilename, selectedDoc.original_filename);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const name = (doc.original_filename || doc.stored_filename || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'All') return true;
    const type = (doc.file_type || '').toLowerCase();
    if (filterType === 'JSON') return type.includes('json') || name.endsWith('.json');
    if (filterType === 'PDF') return type.includes('pdf') || name.endsWith('.pdf');
    if (filterType === 'TXT') return type.includes('txt') || type.includes('text') || name.endsWith('.txt');
    if (filterType === 'DOCX') return type.includes('docx') || type.includes('word') || name.endsWith('.docx');
    return true;
  });

  const formatSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#F7F8FA]">
      {/* Left Column: Files List & Filters */}
      <div className="w-full md:w-[380px] lg:w-[420px] h-full border-r border-[#E7E8ED] bg-white flex flex-col justify-between shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7E8ED] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#292C33]">Files</h2>
              <p className="text-xs text-[#737782]">
                Your uploaded threat intelligence reports
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={loadDocuments}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-[#737782] hover:text-[#292C33] hover:bg-[#F3F4F7] transition-colors"
                title="Refresh documents"
                aria-label="Refresh documents"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#625FEF]' : ''}`} />
              </button>
              <button
                onClick={onOpenUploadModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#625FEF] hover:bg-[#524FE0] text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Upload report</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded files..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF]/50 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {(['All', 'PDF', 'TXT', 'DOCX', 'JSON'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === tab
                    ? 'bg-[#ECEBFF] text-[#625FEF]'
                    : 'text-[#737782] hover:bg-[#F3F4F7] hover:text-[#292C33]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Files List with Loading, Error & Empty States */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {isLoading && documents.length === 0 ? (
            <div className="py-16 text-center text-[#737782] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#625FEF]" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[#292C33]">Loading documents...</span>
                <span className="text-[11px] text-[#9A9DA6]">Connecting to GET /documents/</span>
              </div>
            </div>
          ) : fetchError ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCEBED] flex items-center justify-center text-[#D65A67]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-semibold text-[#292C33]">Unable to load documents</h4>
                <p className="text-[11px] text-[#737782] max-w-xs leading-relaxed">{fetchError}</p>
              </div>
              <button
                onClick={loadDocuments}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E7E8ED] hover:border-[#625FEF] text-xs font-medium text-[#292C33] rounded-xl shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-16 text-center text-[#9A9DA6] flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F7] flex items-center justify-center text-[#9A9DA6] mb-1">
                <FolderClosed className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-semibold text-[#292C33]">No documents found</h4>
              <p className="text-[11px] max-w-[220px] text-[#737782] leading-relaxed">
                {searchQuery
                  ? `No uploaded files match "${searchQuery}".`
                  : 'Upload a CTI report (PDF, TXT, DOCX, JSON) to start vector indexing.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onOpenUploadModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#625FEF] text-white rounded-xl text-xs font-medium hover:bg-[#524FE0] shadow-xs transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Upload report</span>
                </button>
              )}
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const docKey = doc.stored_filename || doc.original_filename;
              const isSelected =
                selectedDoc?.stored_filename === doc.stored_filename ||
                selectedDoc?.original_filename === doc.original_filename;

              const isJson = (doc.file_type || '').toLowerCase().includes('json') || (doc.original_filename || '').endsWith('.json');
              const isWord = (doc.file_type || '').toLowerCase().includes('docx') || (doc.original_filename || '').endsWith('.docx');

              return (
                <button
                  key={docKey}
                  onClick={() => setSelectedId(docKey)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#ECEBFF]/60 border-[#625FEF]/40 shadow-2xs'
                      : 'bg-[#FAFAFC] hover:bg-white border-[#E7E8ED] hover:border-[#D0D3DB]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 truncate">
                    {isJson ? (
                      <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#625FEF]' : 'text-[#737782]'}`} />
                    ) : isWord ? (
                      <FileSpreadsheet className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#625FEF]' : 'text-[#737782]'}`} />
                    ) : (
                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#625FEF]' : 'text-[#737782]'}`} />
                    )}
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium text-[#292C33] truncate">
                        {doc.original_filename || doc.stored_filename}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[#9A9DA6] mt-0.5">
                        <span className="font-mono">{formatSize(doc.size)}</span>
                        <span>·</span>
                        <span className="uppercase font-medium text-[#737782]">{doc.file_type || 'DOC'}</span>
                        {doc.chunks !== undefined && (
                          <>
                            <span>·</span>
                            <span>{doc.chunks} chunks</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium px-2 py-0.5 rounded border shrink-0 bg-[#E8F6EF] text-[#248259] border-[#D0EFE0]">
                    Indexed
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC] text-[11px] text-[#9A9DA6] flex items-center justify-between">
          <span>{documents.length} verified backend reports</span>
          <span className="font-mono text-[10px]">GET /documents/</span>
        </div>
      </div>

      {/* Right Column: File Preview & Metadata Inspector */}
      <div className="flex-1 h-full overflow-hidden flex flex-col justify-between bg-white">
        {selectedDoc ? (
          <>
            {/* Preview Header */}
            <div className="p-5 border-b border-[#E7E8ED] bg-[#FAFAFC]/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-[#ECEBFF] flex items-center justify-center text-[#625FEF] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <h3 className="text-sm font-semibold text-[#292C33] truncate">
                    {selectedDoc.original_filename || selectedDoc.stored_filename}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#737782] mt-0.5">
                    <span className="font-mono font-medium">{formatSize(selectedDoc.size)}</span>
                    <span>·</span>
                    <span className="uppercase font-semibold text-[#625FEF]">{selectedDoc.file_type || 'Document'}</span>
                    {selectedDoc.chunks !== undefined && (
                      <>
                        <span>·</span>
                        <span>{selectedDoc.chunks} chunks</span>
                      </>
                    )}
                    {selectedDoc.embeddings !== undefined && (
                      <>
                        <span>·</span>
                        <span>{selectedDoc.embeddings} embeddings</span>
                      </>
                    )}
                    {selectedDoc.characters !== undefined && (
                      <>
                        <span>·</span>
                        <span>{selectedDoc.characters} characters</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F7F8FA] border border-[#E7E8ED] text-xs font-medium text-[#292C33] rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                  title="Download file from backend"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#625FEF] animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-[#737782]" />
                  )}
                  <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                </button>

                <button
                  onClick={() => onUseInInvestigation(selectedDoc.original_filename || selectedDoc.stored_filename)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#625FEF] hover:bg-[#524FE0] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use in Investigation</span>
                </button>
              </div>
            </div>

            {/* Download Error Banner */}
            {downloadError && (
              <div className="px-5 py-2.5 bg-[#FCEBED] border-b border-[#F8D2D7] text-xs text-[#B83E4C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Preview Document Viewer */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FAFAFC]">
              {/* PDF and DOCX: Clean "Preview unavailable" state with Download button */}
              {!isTxtOrJson(selectedDoc) ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-[#737782] p-8 border border-dashed border-[#E7E8ED] rounded-2xl bg-white">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3F4F7] flex items-center justify-center text-[#737782] mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#292C33]">
                    Preview unavailable for this file type.
                  </h4>
                  <p className="text-xs text-[#737782] mt-1 mb-5 max-w-md leading-relaxed">
                    Browser-readable preview is supported for TXT and JSON files. For {selectedDoc.file_type?.toUpperCase() || 'this format'} files, please download the original document to view complete contents.
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download file</span>
                  </button>
                </div>
              ) : isPreviewLoading ? (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-[#737782] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#625FEF]" />
                  <span className="text-xs font-medium text-[#292C33]">Loading preview...</span>
                  <span className="text-[11px] text-[#9A9DA6] font-mono">
                    GET /documents/{selectedDoc.stored_filename || selectedDoc.original_filename}/preview
                  </span>
                </div>
              ) : previewError ? (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E7E8ED] rounded-2xl bg-white gap-3">
                  <AlertCircle className="w-8 h-8 text-[#D9A441]" />
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-semibold text-[#292C33]">Preview unavailable</h4>
                    <p className="text-[11px] text-[#737782] max-w-sm">{previewError}</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F7F8FA] border border-[#E7E8ED] rounded-lg text-xs font-medium text-[#292C33]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file instead</span>
                  </button>
                </div>
              ) : previewContent !== null ? (
                <div className="bg-white rounded-xl border border-[#E7E8ED] p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3F4F7] text-xs text-[#9A9DA6]">
                    <span className="font-medium text-[#737782]">Content Reader</span>
                    <span className="font-mono text-[11px]">{previewContent.length.toLocaleString()} characters</span>
                  </div>
                  <pre className="text-xs font-mono text-[#292C33] leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-[#ECEBFF]">
                    {previewContent}
                  </pre>
                </div>
              ) : (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-[#737782]">
                  <HardDrive className="w-8 h-8 text-[#D0D3DB] mb-2" />
                  <p className="text-xs text-[#9A9DA6]">No preview content returned</p>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC] text-[11px] text-[#9A9DA6] flex items-center justify-between">
              <span>Status: Stored & Indexed in Vector Corpus</span>
              <span className="font-mono text-[10px]">FastAPI Document Service</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#737782]">
            <FolderClosed className="w-10 h-10 text-[#D0D3DB] mb-2" />
            <h3 className="text-sm font-semibold text-[#292C33]">No file selected</h3>
            <p className="text-xs text-[#9A9DA6] mt-1 max-w-xs">
              Select a CTI report on the left to preview its content or use it in an investigation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
