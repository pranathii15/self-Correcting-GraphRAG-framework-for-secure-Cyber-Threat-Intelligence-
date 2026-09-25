import React, { useState } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Calendar,
  Layers
} from 'lucide-react';
import { ThreatReport } from '../../types/api';

interface ThreatReportsViewProps {
  reports: ThreatReport[];
  onSelectReportToInvestigate: (filename: string) => void;
  onPreviewFileInWorkspace: (filename: string) => void;
}

export const ThreatReportsView: React.FC<ThreatReportsViewProps> = ({
  reports,
  onSelectReportToInvestigate,
  onPreviewFileInWorkspace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );

  const filteredReports = reports.filter(
    (rep) =>
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.threatActor && rep.threatActor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rep.malwareFamily && rep.malwareFamily.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#F7F8FA]">
      {/* Left List of Reports */}
      <div className="w-full md:w-[420px] lg:w-[460px] h-full border-r border-[#E7E8ED] bg-white flex flex-col justify-between shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E7E8ED] flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#292C33]">Threat Reports</h2>
            <p className="text-xs text-[#737782]">
              Explore indexed cybersecurity intelligence
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threat intelligence..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF]/50 transition-colors"
            />
          </div>
        </div>

        {/* Report items */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {filteredReports.map((report) => {
            const isSelected = activeReport?.id === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#ECEBFF]/60 border-[#625FEF]/40 shadow-2xs'
                    : 'bg-[#FAFAFC] hover:bg-white border-[#E7E8ED] hover:border-[#D0D3DB]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[#292C33] line-clamp-1">
                    {report.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E7E8ED] text-[#737782] shrink-0">
                    {report.type}
                  </span>
                </div>

                <p className="text-[11px] text-[#737782] line-clamp-2 leading-relaxed">
                  {report.summary}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#9A9DA6] pt-1 border-t border-[#F3F4F7]">
                  <span className="font-mono text-[#625FEF]">{report.filename}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{report.date}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC] text-[11px] text-[#9A9DA6] flex items-center justify-between">
          <span>{reports.length} verified intelligence reports</span>
          <span>Indexed CTI corpus</span>
        </div>
      </div>

      {/* Right Column: Detailed Report Inspection */}
      <div className="flex-1 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between bg-white">
        {activeReport ? (
          <div className="max-w-3xl flex flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#E7E8ED]">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#625FEF] uppercase tracking-wider">
                    {activeReport.malwareFamily || 'Malware Spotlight'}
                  </span>
                  <span className="text-xs text-[#9A9DA6]">·</span>
                  <span className="text-xs text-[#737782]">{activeReport.date}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#292C33]">
                  {activeReport.title}
                </h1>
                <span className="font-mono text-xs text-[#737782]">
                  Source file: {activeReport.filename}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreviewFileInWorkspace(activeReport.filename)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#F0F1F5] border border-[#E7E8ED] rounded-xl text-xs font-medium text-[#292C33] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#737782]" />
                  <span>Inspect in Files</span>
                </button>

                <button
                  onClick={() => onSelectReportToInvestigate(activeReport.filename)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Investigate Threat</span>
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#F7F8FA] rounded-xl p-4 border border-[#E7E8ED]">
              <h3 className="text-xs font-semibold text-[#292C33] uppercase tracking-wider mb-1.5">
                Executive Intelligence Summary
              </h3>
              <p className="text-xs text-[#4F5460] leading-relaxed">
                {activeReport.summary}
              </p>
            </div>

            {/* Structured Threat Content */}
            {activeReport.content && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-[#292C33] uppercase tracking-wider">
                  Document Content (JSON Format)
                </h3>
                <div className="p-4 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl overflow-x-auto">
                  <pre className="text-xs font-mono text-[#292C33] leading-relaxed whitespace-pre-wrap">
                    {activeReport.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-6 border-t border-[#E7E8ED] text-xs text-[#9A9DA6] flex items-center justify-between">
          <span>CyberGuard CTI Knowledge Base</span>
          <span>FastAPI ingestion ready</span>
        </div>
      </div>
    </div>
  );
};
