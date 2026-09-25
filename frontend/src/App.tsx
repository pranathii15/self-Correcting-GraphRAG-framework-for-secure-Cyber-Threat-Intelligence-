import React, { useState, useEffect } from 'react';
import {
  getStoredThreads,
  saveStoredThreads,
  INITIAL_REPORTS,
} from './lib/storage';
import { InvestigationThread, BackendDocument, ThreatReport, UploadedFileRecord, AuthUser } from './types/api';
import { getAuthToken, getStoredAuthUser, clearAuthSession } from './lib/api/auth';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { SettingsModal } from './components/layout/SettingsModal';
import { UploadModal } from './features/files/UploadModal';
import { OverviewView } from './features/overview/OverviewView';
import { InvestigationWorkspace } from './features/investigations/InvestigationWorkspace';
import { FilesWorkspace } from './features/files/FilesWorkspace';
import { ThreatReportsView } from './features/reports/ThreatReportsView';
import { KnowledgeGraphView } from './features/graph/KnowledgeGraphView';
import { HistoryView } from './features/history/HistoryView';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getAuthToken());
  });
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return getStoredAuthUser();
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [threads, setThreads] = useState<InvestigationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [backendDocuments, setBackendDocuments] = useState<BackendDocument[]>([]);
  const [filesRefreshTrigger, setFilesRefreshTrigger] = useState(0);
  const [reports] = useState<ThreatReport[]>(INITIAL_REPORTS);
  const [activeReportContext, setActiveReportContext] = useState<string | null>(null);

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedFileIdForFilesView, setSelectedFileIdForFilesView] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize storage on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      setAuthUser(getStoredAuthUser());
    } else {
      setIsAuthenticated(false);
      setAuthUser(null);
    }

    const loadedThreads = getStoredThreads();
    setThreads(loadedThreads);
    if (loadedThreads.length > 0) {
      setActiveThreadId(loadedThreads[0].id);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthUser(getStoredAuthUser());
    setCurrentTab('overview');
    showToast('Signed in successfully.');
  };

  const handleRegisterSuccess = (requiresSeparateLogin: boolean) => {
    if (requiresSeparateLogin) {
      setAuthView('login');
      showToast('Registration successful! Please sign in.');
    } else {
      setIsAuthenticated(true);
      setAuthUser(getStoredAuthUser());
      setCurrentTab('overview');
      showToast('Account created and signed in.');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setAuthUser(null);
    setAuthView('login');
    setIsSettingsOpen(false);
    showToast('Signed out of CyberGuard AI.');
  };

  // Sync threads to storage
  const handleUpdateThread = (updatedThread: InvestigationThread) => {
    setThreads((prev) => {
      const exists = prev.some((t) => t.id === updatedThread.id);
      const newThreads = exists
        ? prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
        : [updatedThread, ...prev];
      saveStoredThreads(newThreads);
      return newThreads;
    });
    setActiveThreadId(updatedThread.id);
  };

  const handleStartNewInvestigation = (initialQuery?: string, attachedReport?: string) => {
    const newId = `thread-${Date.now()}`;
    const newThread: InvestigationThread = {
      id: newId,
      title: initialQuery ? initialQuery.slice(0, 48) : 'New Investigation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: initialQuery
        ? [
            {
              id: `msg-u-${Date.now()}`,
              role: 'user',
              content: initialQuery,
              timestamp: new Date().toISOString(),
              attachedReport: attachedReport || undefined,
            },
          ]
        : [],
    };

    handleUpdateThread(newThread);
    setActiveThreadId(newId);
    setCurrentTab('investigation');

    if (initialQuery) {
      setTimeout(() => {
        const workspace = document.querySelector('textarea');
        if (workspace) workspace.focus();
      }, 100);
    }
  };

  const handleUploadSuccess = () => {
    setFilesRefreshTrigger((prev) => prev + 1);
    showToast('Report uploaded and indexed successfully.');
  };

  const handleUseFileInInvestigation = (filename: string) => {
    setActiveReportContext(filename);
    setCurrentTab('investigation');
    showToast(`Using report context: ${filename}`);
  };

  const handlePreviewFileInWorkspace = (filename: string) => {
    setSelectedFileIdForFilesView(filename);
    setCurrentTab('files');
  };

  const handleShareWorkspace = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Workspace URL copied to clipboard.');
    } else {
      showToast('Threat intelligence workspace active.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  // Convert real backend documents for CommandPalette
  const commandPaletteFiles: UploadedFileRecord[] = backendDocuments.map((doc) => ({
    id: doc.stored_filename || doc.original_filename,
    filename: doc.original_filename || doc.stored_filename,
    size: doc.size,
    type: doc.file_type,
    uploadedAt: new Date().toISOString(),
    status: 'Indexed',
    isLocalOnly: false,
    stored_filename: doc.stored_filename,
    chunks: doc.chunks,
    embeddings: doc.embeddings,
  }));

  // If not authenticated, render Login or Registration screen
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8FA] text-[#292C33] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#292C33] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#625FEF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop / Collapsible Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          recentThreads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={(id) => {
            setActiveThreadId(id);
            setCurrentTab('investigation');
          }}
          onNewInvestigation={() => handleStartNewInvestigation()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          authUser={authUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              recentThreads={threads}
              activeThreadId={activeThreadId}
              onSelectThread={(id) => {
                setActiveThreadId(id);
                setCurrentTab('investigation');
                setIsMobileSidebarOpen(false);
              }}
              onNewInvestigation={() => {
                handleStartNewInvestigation();
                setIsMobileSidebarOpen(false);
              }}
              onOpenCommandPalette={() => {
                setIsMobileSidebarOpen(false);
                setIsCommandPaletteOpen(true);
              }}
              onOpenSettings={() => {
                setIsMobileSidebarOpen(false);
                setIsSettingsOpen(true);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              authUser={authUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNewInvestigation={() => handleStartNewInvestigation()}
          onShareWorkspace={handleShareWorkspace}
          activeReportContext={activeReportContext}
          onClearReportContext={() => setActiveReportContext(null)}
        />

        {/* View Routing */}
        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'overview' && (
            <OverviewView
              onStartInvestigation={(query, report) => {
                handleStartNewInvestigation(query, report);
              }}
              recentThreads={threads}
              onSelectThread={(id) => {
                setActiveThreadId(id);
                setCurrentTab('investigation');
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
              activeReportContext={activeReportContext}
              onClearReportContext={() => setActiveReportContext(null)}
            />
          )}

          {currentTab === 'investigation' && (
            <InvestigationWorkspace
              activeThread={activeThread}
              onUpdateThread={handleUpdateThread}
              onNewThread={(query, report) => handleStartNewInvestigation(query, report)}
              attachedReport={activeReportContext}
              onClearAttachedReport={() => setActiveReportContext(null)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectDocumentForPreview={handlePreviewFileInWorkspace}
            />
          )}

          {currentTab === 'reports' && (
            <ThreatReportsView
              reports={reports}
              onSelectReportToInvestigate={(filename) => {
                handleUseFileInInvestigation(filename);
              }}
              onPreviewFileInWorkspace={handlePreviewFileInWorkspace}
            />
          )}

          {currentTab === 'files' && (
            <FilesWorkspace
              onOpenUploadModal={() => setIsUploadOpen(true)}
              onUseInInvestigation={handleUseFileInInvestigation}
              selectedFileId={selectedFileIdForFilesView}
              onSelectFileId={setSelectedFileIdForFilesView}
              refreshTrigger={filesRefreshTrigger}
              onDocumentsLoaded={(docs) => setBackendDocuments(docs)}
            />
          )}

          {currentTab === 'graph' && (
            <KnowledgeGraphView
              liveEvidence={
                activeThread?.messages
                  .slice()
                  .reverse()
                  .find((m) => m.role === 'assistant' && !m.isError)?.response?.retrieval?.graph
              }
              onInvestigateEntity={(query) => {
                handleStartNewInvestigation(query);
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              threads={threads}
              onSelectThread={(id) => {
                setActiveThreadId(id);
                setCurrentTab('investigation');
              }}
              onClearHistory={() => {
                saveStoredThreads([]);
                setThreads([]);
                showToast('Investigation history cleared.');
              }}
              onNewInvestigation={() => handleStartNewInvestigation()}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        threads={threads}
        reports={reports}
        files={commandPaletteFiles}
        onSelectThread={(id) => setActiveThreadId(id)}
        onSelectReport={(reportId) => {
          const rep = reports.find((r) => r.id === reportId);
          if (rep) handlePreviewFileInWorkspace(rep.filename);
        }}
        onSelectFile={(fileId) => {
          setSelectedFileIdForFilesView(fileId);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        authUser={authUser}
        onLogout={handleLogout}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
