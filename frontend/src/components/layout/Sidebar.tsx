import React from 'react';
import {
  Compass,
  MessageSquareText,
  FileText,
  FolderClosed,
  Share2,
  History,
  Search,
  Settings as SettingsIcon,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  User,
  Plus,
  LogOut
} from 'lucide-react';
import { GeometricLogo } from '../common/GeometricLogo';
import { InvestigationThread, AuthUser } from '../../types/api';

export type NavTab = 'overview' | 'investigation' | 'reports' | 'files' | 'graph' | 'history';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  recentThreads: InvestigationThread[];
  activeThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onNewInvestigation: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  recentThreads,
  activeThreadId,
  onSelectThread,
  onNewInvestigation,
  onOpenCommandPalette,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
  authUser,
  onLogout,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Compass },
    { id: 'investigation' as NavTab, label: 'AI Investigation', icon: MessageSquareText },
    { id: 'reports' as NavTab, label: 'Threat Reports', icon: FileText },
    { id: 'files' as NavTab, label: 'Files', icon: FolderClosed },
    { id: 'graph' as NavTab, label: 'Knowledge Graph', icon: Share2 },
    { id: 'history' as NavTab, label: 'Investigation History', icon: History },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-16 h-screen bg-[#FFFFFF]/85 backdrop-blur-md border-r border-[#E7E8ED] flex flex-col items-center py-4 justify-between shrink-0 transition-all duration-200 z-30">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F7] text-[#737782] transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <GeometricLogo size={28} />
          </button>

          <button
            onClick={onNewInvestigation}
            className="w-10 h-10 rounded-xl bg-[#625FEF] text-white flex items-center justify-center hover:bg-[#524FE0] shadow-sm transition-all"
            title="New Investigation"
            aria-label="New Investigation"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="w-10 h-10 rounded-lg hover:bg-[#F3F4F7] text-[#737782] flex items-center justify-center transition-colors"
            title="Search workspace (⌘K)"
            aria-label="Search workspace"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="w-8 h-px bg-[#E7E8ED]" />

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#ECEBFF] text-[#625FEF]'
                      : 'text-[#737782] hover:bg-[#F3F4F7] hover:text-[#292C33]'
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-lg hover:bg-[#FCEBED] text-[#9A9DA6] hover:text-[#B83E4C] flex items-center justify-center transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-lg hover:bg-[#F3F4F7] text-[#737782] flex items-center justify-center transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F7] text-[#737782] transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[300px] h-screen bg-[#FFFFFF]/90 backdrop-blur-md border-r border-[#E7E8ED] flex flex-col justify-between shrink-0 select-none z-30 transition-all duration-200">
      {/* Top section: Brand & Search */}
      <div className="p-4 flex flex-col gap-4">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('overview')}
          >
            <GeometricLogo size={28} />
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] tracking-tight text-[#292C33] group-hover:text-[#625FEF] transition-colors">
                CyberGuard AI
              </span>
            </div>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-[#F3F4F7] text-[#9A9DA6] hover:text-[#737782] transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search workspace button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full px-3 py-2 bg-[#F7F8FA] hover:bg-[#F3F4F7] border border-[#E7E8ED] rounded-xl text-xs text-[#737782] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#9A9DA6] group-hover:text-[#625FEF] transition-colors" />
            <span>Search workspace...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E7E8ED] rounded text-[#9A9DA6] shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Primary New Investigation action */}
        <button
          onClick={onNewInvestigation}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#625FEF] hover:bg-[#5350DF] text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation</span>
        </button>

        {/* Main navigation */}
        <nav className="flex flex-col gap-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#ECEBFF] text-[#292C33]'
                    : 'text-[#737782] hover:bg-[#F7F8FA] hover:text-[#292C33]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#625FEF]' : 'text-[#9A9DA6]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#625FEF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Recent investigations list */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[11px] font-medium text-[#9A9DA6] tracking-wider uppercase">
              Recent Investigations
            </span>
            <button
              onClick={() => onSelectTab('history')}
              className="text-[#9A9DA6] hover:text-[#625FEF] transition-colors p-0.5"
              title="View all history"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto pr-1">
            {recentThreads.length === 0 ? (
              <span className="px-3 py-2 text-xs text-[#9A9DA6] italic">
                No recent investigations
              </span>
            ) : (
              recentThreads.slice(0, 6).map((thread) => {
                const isCurrent =
                  currentTab === 'investigation' && activeThreadId === thread.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      onSelectThread(thread.id);
                      onSelectTab('investigation');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors truncate ${
                      isCurrent
                        ? 'bg-[#ECEBFF]/70 text-[#625FEF] font-medium'
                        : 'text-[#737782] hover:bg-[#F7F8FA] hover:text-[#292C33]'
                    }`}
                    title={thread.title}
                  >
                    <span className="text-[#9A9DA6] shrink-0 text-[10px]">↗</span>
                    <span className="truncate">{thread.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Settings & Profile */}
      <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC]/60 flex flex-col gap-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#737782] hover:bg-[#F3F4F7] hover:text-[#292C33] transition-colors"
        >
          <SettingsIcon className="w-3.5 h-3.5 text-[#9A9DA6]" />
          <span>Settings</span>
        </button>

        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-[#E7E8ED] shadow-2xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-[#ECEBFF] flex items-center justify-center text-[#625FEF] font-semibold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-[#292C33] leading-none truncate" title={authUser?.email || 'Cyber Analyst'}>
                {authUser?.full_name || authUser?.username || 'Cyber Analyst'}
              </span>
              <span className="text-[10px] text-[#3BAA78] leading-tight flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3BAA78]" />
                Workspace active
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1 rounded text-[#9A9DA6] hover:text-[#B83E4C] hover:bg-[#FCEBED] transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
