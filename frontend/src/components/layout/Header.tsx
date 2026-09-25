import React from 'react';
import { Menu, Share2, Sparkles, Database } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onToggleSidebarMobile: () => void;
  onNewInvestigation: () => void;
  onShareWorkspace?: () => void;
  activeReportContext?: string | null;
  onClearReportContext?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleSidebarMobile,
  onNewInvestigation,
  onShareWorkspace,
  activeReportContext,
  onClearReportContext,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Overview';
      case 'investigation':
        return 'AI Investigation';
      case 'reports':
        return 'Threat Reports';
      case 'files':
        return 'Files Workspace';
      case 'graph':
        return 'Knowledge Graph';
      case 'history':
        return 'Investigation History';
    }
  };

  return (
    <header className="h-14 border-b border-[#E7E8ED] bg-white/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden p-1.5 rounded-lg text-[#737782] hover:bg-[#F3F4F7] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-[#292C33] tracking-tight">
            {getTabTitle()}
          </h1>
        </div>

        {/* If report context is active */}
        {activeReportContext && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#ECEBFF] border border-[#D9D7FF] rounded-lg text-xs text-[#625FEF]">
            <Database className="w-3 h-3" />
            <span className="font-medium truncate max-w-[200px]">
              Active: {activeReportContext}
            </span>
            {onClearReportContext && (
              <button
                onClick={onClearReportContext}
                className="ml-1 text-[#625FEF] hover:text-[#4B48D9] font-bold"
                title="Detach report"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewInvestigation}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F8FA] hover:bg-[#F0F1F5] border border-[#E7E8ED] rounded-lg text-xs font-medium text-[#292C33] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#625FEF]" />
          <span>New Query</span>
        </button>

        {onShareWorkspace && (
          <button
            onClick={onShareWorkspace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F7F8FA] border border-[#E7E8ED] rounded-lg text-xs font-medium text-[#737782] hover:text-[#292C33] transition-colors shadow-2xs"
            title="Share current investigation"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
      </div>
    </header>
  );
};
