import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '../../lib/api/files';
import { DocumentUploadResponse } from '../../types/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<DocumentUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
    setStatusMessage('');
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setStatusMessage('Uploading and processing report with CTI vector pipeline...');

    try {
      const response = await uploadDocument(selectedFile);
      setUploadResult(response);
      setStatus('success');
      setStatusMessage(response.message || 'Report indexed and vectorized successfully.');

      // Automatically refresh file history
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => {
        onClose();
        setStatus('idle');
        setSelectedFile(null);
        setUploadResult(null);
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setStatus('error');
      setStatusMessage(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292C33]/20 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border border-[#E7E8ED] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E8ED] bg-[#FAFAFC]/60">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-[#625FEF]" />
            <h3 className="text-sm font-semibold text-[#292C33]">Upload CTI Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9A9DA6] hover:text-[#292C33] hover:bg-[#F3F4F7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop Area */}
        <div className="p-6 flex flex-col gap-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#625FEF] bg-[#ECEBFF]/30'
                : 'border-[#E7E8ED] hover:border-[#625FEF]/50 bg-[#FAFAFC]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx,.json,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#ECEBFF] flex items-center justify-center text-[#625FEF] mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#292C33]">
              Drop a report here, or <span className="text-[#625FEF]">browse files</span>
            </p>
            <p className="text-xs text-[#9A9DA6] mt-1">
              Supported formats: PDF, TXT, DOCX, JSON
            </p>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-[#F7F8FA] border border-[#E7E8ED] rounded-xl text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-[#625FEF] shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="font-medium text-[#292C33] truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-[#9A9DA6]">
                    {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Document'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setStatus('idle');
                  setStatusMessage('');
                }}
                disabled={status === 'uploading'}
                className="text-[#9A9DA6] hover:text-[#D65A67] p-1 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Status Message */}
          {status !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                status === 'success'
                  ? 'bg-[#E8F6EF] border-[#D0EFE0] text-[#248259]'
                  : status === 'error'
                  ? 'bg-[#FCEBED] border-[#F8D2D7] text-[#B83E4C]'
                  : 'bg-[#ECEBFF] border-[#D9D7FF] text-[#625FEF]'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'uploading' ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3BAA78] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#D65A67] shrink-0" />
                )}
                <span className="font-medium">{statusMessage}</span>
              </div>

              {/* Upload Result Metadata */}
              {uploadResult?.document && (
                <div className="mt-1 pt-1.5 border-t border-current/20 flex flex-wrap gap-2 text-[10px] opacity-90 font-mono">
                  {uploadResult.document.file_type && (
                    <span className="uppercase">{uploadResult.document.file_type}</span>
                  )}
                  {uploadResult.document.chunks !== undefined && (
                    <span>· {uploadResult.document.chunks} chunks</span>
                  )}
                  {uploadResult.document.embeddings !== undefined && (
                    <span>· {uploadResult.document.embeddings} embeddings</span>
                  )}
                  {uploadResult.document.characters !== undefined && (
                    <span>· {uploadResult.document.characters} characters</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-[11px] text-[#737782] leading-relaxed">
            Uploaded reports are sent directly to <code className="font-mono bg-[#F3F4F7] px-1 py-0.5 rounded">POST /documents/upload</code> for parsing, chunking, and embedding generation in Qdrant.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAFAFC] border-t border-[#E7E8ED] flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={status === 'uploading'}
            className="px-3.5 py-1.5 border border-[#E7E8ED] hover:bg-white text-xs font-medium text-[#737782] rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === 'uploading'}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFile && status !== 'uploading'
                ? 'bg-[#625FEF] hover:bg-[#524FE0]'
                : 'bg-[#D0D3DB] cursor-not-allowed'
            }`}
          >
            {status === 'uploading' && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Upload & Index</span>
          </button>
        </div>
      </div>
    </div>
  );
};
