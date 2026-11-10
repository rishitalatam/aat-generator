import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingHeroView } from './components/LandingHeroView';
import { DashboardView } from './components/DashboardView';
import { PptGeneratorView } from './components/PptGeneratorView';
import { AssignmentGeneratorView } from './components/AssignmentGeneratorView';
import { ProjectReportGeneratorView } from './components/ProjectReportGeneratorView';
import { CaseStudyGeneratorView } from './components/CaseStudyGeneratorView';
import { DocumentsHistoryView } from './components/DocumentsHistoryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { FormatGuideView } from './components/FormatGuideView';
import { subscribeUserDocuments } from './firebase/documents';
import { SavedDocumentMeta } from './types/academic';
import { Menu, X } from 'lucide-react';

function MainAppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // States for transferring selected document or sample topic into generators
  const [activeSampleTopic, setActiveSampleTopic] = useState<string>('');
  const [activeLoadedDoc, setActiveLoadedDoc] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<SavedDocumentMeta[]>([]);

  // Subscribe to recent documents for dashboard preview
  useEffect(() => {
    if (!user) {
      setRecentDocs([]);
      return;
    }
    const unsub = subscribeUserDocuments(
      user.uid,
      (docs) => setRecentDocs(docs),
      (err) => console.warn('History subscription note:', err.message)
    );
    return () => unsub();
  }, [user]);

  const handleSelectTool = (toolId: string, sampleTopic?: string) => {
    setActiveSampleTopic(sampleTopic || '');
    setActiveLoadedDoc(null);
    setCurrentView(toolId);
  };

  const handleOpenDoc = (meta: SavedDocumentMeta) => {
    try {
      const content = JSON.parse(meta.contentJson);
      setActiveLoadedDoc(content);
      setActiveSampleTopic('');
      setCurrentView(meta.toolType);
    } catch (err) {
      console.error('Failed to parse doc:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg">
          I
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Loading IARE Smart Academic AI...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={(v) => setCurrentView(v)} />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Render Sidebar only when authenticated or in guest view */}
        {user ? (
          <>
            {/* Mobile Hamburger floating button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <Sidebar
              currentView={currentView}
              onNavigate={(v) => setCurrentView(v)}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Content view with left margin offset for sidebar on large screens */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 w-full max-w-full overflow-x-hidden">
              {currentView === 'dashboard' && (
                <DashboardView
                  onSelectTool={handleSelectTool}
                  recentDocs={recentDocs}
                  onOpenDoc={handleOpenDoc}
                />
              )}

              {currentView === 'aat_ppt' && (
                <PptGeneratorView
                  initialTopic={activeSampleTopic}
                  loadedDoc={activeLoadedDoc}
                  onSaved={() => {}}
                />
              )}

              {currentView === 'aat_assignment' && (
                <AssignmentGeneratorView
                  initialTopic={activeSampleTopic}
                  loadedDoc={activeLoadedDoc}
                  onSaved={() => {}}
                />
              )}

              {currentView === 'project_report' && (
                <ProjectReportGeneratorView
                  initialTopic={activeSampleTopic}
                  loadedDoc={activeLoadedDoc}
                  onSaved={() => {}}
                />
              )}

              {currentView === 'case_study' && (
                <CaseStudyGeneratorView
                  initialTopic={activeSampleTopic}
                  loadedDoc={activeLoadedDoc}
                  onSaved={() => {}}
                />
              )}

              {currentView === 'documents' && (
                <DocumentsHistoryView onOpenDocument={handleOpenDoc} />
              )}

              {currentView === 'profile' && <ProfileSettingsView />}

              {currentView === 'help' && <FormatGuideView />}
            </main>
          </>
        ) : (
          /* Unauthenticated Landing */
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full">
            <LandingHeroView onExploreGuest={() => setCurrentView('dashboard')} />
          </main>
        )}
      </div>

      {/* Global Academic Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Institute of Aeronautical Engineering (IARE). Autonomous Institute.
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Powered by Google Gemini AI & Firebase Firestore
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
