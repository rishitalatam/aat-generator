import React from 'react';
import {
  LayoutDashboard,
  Presentation,
  FileCheck2,
  FileText,
  Briefcase,
  History,
  UserCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Academic Dashboard',
      icon: LayoutDashboard,
      badge: 'Hub',
    },
    {
      id: 'aat_ppt',
      label: 'AAT PPT Generator',
      icon: Presentation,
      badge: 'PPTX',
    },
    {
      id: 'aat_assignment',
      label: 'AAT Assignment Generator',
      icon: FileCheck2,
      badge: '10 Qs',
    },
    {
      id: 'project_report',
      label: 'Project Report Generator',
      icon: FileText,
      badge: 'CEP/IARE',
      highlight: true,
    },
    {
      id: 'case_study',
      label: 'Case Study Generator',
      icon: Briefcase,
      badge: 'DOCX',
    },
    {
      id: 'documents',
      label: 'My Saved Documents',
      icon: History,
    },
    {
      id: 'profile',
      label: 'Academic Profile',
      icon: UserCheck,
    },
    {
      id: 'help',
      label: 'IARE Format Guide',
      icon: HelpCircle,
    },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Section: Academic Tools */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Academic Tools
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-accent'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.highlight
                            ? 'bg-accent-light text-accent font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              IARE Standards
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">
              v2.5
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Outputs official DOCX & PPTX compliant with IARE examination guidelines.
          </p>
          <a
            href="https://cheat-code-iare-2.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
          >
            <span>Reference Workflow</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
};
