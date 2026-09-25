import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, MessageSquareText, FileText, FolderClosed, Share2, History, ArrowRight, CornerDownLeft } from 'lucide-react';
import { InvestigationThread, ThreatReport, UploadedFileRecord } from '../../types/api';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  threads: InvestigationThread[];
  reports: ThreatReport[];
  files: UploadedFileRecord[];
  onSelectThread: (threadId: string) => void;
  onSelectReport: (reportId: string) => void;
  onSelectFile: (fileId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  threads,
  reports,
  files,
  onSelectThread,
  onSelectReport,
  onSelectFile,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredThreads = threads.filter(
    (t) => t.title.toLowerCase().includes(q) || t.messages.some((m) => m.content.toLowerCase().includes(q))
  );

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.filename.toLowerCase().includes(q) ||
      (r.threatActor && r.threatActor.toLowerCase().includes(q)) ||
      (r.malwareFamily && r.malwareFamily.toLowerCase().includes(q))
  );

  const filteredFiles = files.filter((f) => f.filename.toLowerCase().includes(q));

  const illustrativeEntities = [
    { name: 'LockBit', type: 'Malware Family', desc: 'Ransomware-as-a-service operational umbrella' },
    { name: 'StealBit', type: 'Exfiltration Tool', desc: 'Custom tool for double-extortion exfiltration' },
    { name: 'VMware ESXi', type: 'Platform Target', desc: 'Hypervisor targeted by LockBit Linux encryptors' },
    { name: 'Affiliates', type: 'Threat Actor Role', desc: 'External operators deploying payloads' },
  ].filter((e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#292C33]/20 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-[#E7E8ED] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7E8ED] bg-[#FAFAFC]/50">
          <Search className="w-5 h-5 text-[#625FEF]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investigations, reports, files, or entities..."
            className="flex-1 bg-transparent text-sm text-[#292C33] placeholder-[#9A9DA6] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white border border-[#E7E8ED] rounded text-[#737782] shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 flex flex-col gap-4 text-xs divide-y divide-[#F3F4F7]">
          {/* Quick Navigation Commands */}
          {!q && (
            <div className="flex flex-col gap-1 pb-3">
              <span className="text-[11px] font-medium text-[#9A9DA6] px-2 py-1 uppercase tracking-wider">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { tab: 'overview' as NavTab, label: 'Overview Workspace', icon: Compass },
                  { tab: 'investigation' as NavTab, label: 'AI Investigation', icon: MessageSquareText },
                  { tab: 'reports' as NavTab, label: 'Threat Reports', icon: FileText },
                  { tab: 'files' as NavTab, label: 'Files Workspace', icon: FolderClosed },
                  { tab: 'graph' as NavTab, label: 'Knowledge Graph', icon: Share2 },
                  { tab: 'history' as NavTab, label: 'Investigation History', icon: History },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onSelectTab(item.tab);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg text-left text-[#292C33] hover:bg-[#ECEBFF]/60 hover:text-[#625FEF] transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-[#737782]" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Investigations Group */}
          {filteredThreads.length > 0 && (
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-[11px] font-medium text-[#9A9DA6] px-2 py-1 uppercase tracking-wider">
                Investigations ({filteredThreads.length})
              </span>
              {filteredThreads.slice(0, 5).map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    onSelectThread(thread.id);
                    onSelectTab('investigation');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#F7F8FA] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquareText className="w-4 h-4 text-[#625FEF] shrink-0" />
                    <span className="text-[#292C33] font-medium group-hover:text-[#625FEF] transition-colors truncate">
                      {thread.title}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9A9DA6] group-hover:text-[#625FEF] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Threat Reports Group */}
          {filteredReports.length > 0 && (
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-[11px] font-medium text-[#9A9DA6] px-2 py-1 uppercase tracking-wider">
                Threat Intelligence Reports ({filteredReports.length})
              </span>
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    onSelectReport(report.id);
                    onSelectTab('reports');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#F7F8FA] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[#3BAA78] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[#292C33] font-medium group-hover:text-[#625FEF] truncate">
                        {report.title}
                      </span>
                      <span className="text-[11px] text-[#9A9DA6] truncate">
                        {report.filename} · {report.threatActor || 'CTI Document'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9A9DA6] group-hover:text-[#625FEF] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Uploaded Files Group */}
          {filteredFiles.length > 0 && (
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-[11px] font-medium text-[#9A9DA6] px-2 py-1 uppercase tracking-wider">
                Uploaded Files ({filteredFiles.length})
              </span>
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file.id);
                    onSelectTab('files');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#F7F8FA] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FolderClosed className="w-4 h-4 text-[#D9A441] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[#292C33] font-medium truncate">{file.filename}</span>
                      <span className="text-[11px] text-[#9A9DA6]">
                        {(file.size / 1024).toFixed(1)} KB · {file.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9A9DA6] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Graph Entities Group */}
          {illustrativeEntities.length > 0 && (
            <div className="flex flex-col gap-1 pt-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-medium text-[#9A9DA6] uppercase tracking-wider">
                  Graph Entities ({illustrativeEntities.length})
                </span>
                <span className="text-[10px] text-[#9A9DA6] italic">Illustrative ontology</span>
              </div>
              {illustrativeEntities.map((entity) => (
                <button
                  key={entity.name}
                  onClick={() => {
                    onSelectTab('graph');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-[#F7F8FA] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Share2 className="w-4 h-4 text-[#7B78F2] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[#292C33] font-medium group-hover:text-[#625FEF] truncate">
                        {entity.name}
                      </span>
                      <span className="text-[11px] text-[#9A9DA6] truncate">
                        {entity.type} · {entity.desc}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9A9DA6] group-hover:text-[#625FEF] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {q &&
            filteredThreads.length === 0 &&
            filteredReports.length === 0 &&
            filteredFiles.length === 0 &&
            illustrativeEntities.length === 0 && (
              <div className="py-8 text-center text-[#9A9DA6]">
                <p>No results found for "{query}"</p>
                <p className="text-[11px] mt-1">Try searching for LockBit, StealBit, ransomware, or report filenames.</p>
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#FAFAFC] border-t border-[#E7E8ED] flex items-center justify-between text-[11px] text-[#9A9DA6]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> to select
            </span>
            <span>·</span>
            <span>ESC to close</span>
          </div>
          <span>CyberGuard Intelligence Hub</span>
        </div>
      </div>
    </div>
  );
};
