import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Presentation,
  FileCheck2,
  FileText,
  Briefcase,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { SavedDocumentMeta } from '../types/academic';
import { exportDocumentsDatabaseToExcel } from '../utils/excelExport';

interface DashboardViewProps {
  onSelectTool: (tool: string, sampleTopic?: string) => void;
  recentDocs: SavedDocumentMeta[];
  onOpenDoc: (doc: SavedDocumentMeta) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTool,
  recentDocs,
  onOpenDoc,
}) => {
  const { user, profile } = useAuth();

  const tools = [
    {
      id: 'aat_ppt',
      title: 'AAT PPT Generator',
      category: 'Presentation',
      icon: Presentation,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Editable PPTX',
      description:
        'Generate complete slide decks with IARE title cover, technical architecture, results, and speaker notes.',
      inputs: ['Topic & Course Code', 'Student Details', 'Slide Count (5-15)', 'Theme Style'],
      sampleTopic: 'Autonomous Drone Navigation using Deep Reinforcement Learning',
    },
    {
      id: 'aat_assignment',
      title: 'AAT Assignment Generator',
      category: 'Internal Assessment',
      icon: FileCheck2,
      color: 'from-emerald-600 to-teal-600',
      tag: '10 Qs OBE DOCX',
      description:
        'Full 10-Question IARE assignment workflow mapped to Bloom’s Taxonomy levels (L1-L5) and Course Outcomes.',
      inputs: ['Subject & Course Code', 'Topic / Question List', 'Answer Length (Short/Med/Comp)', 'OBE Format'],
      sampleTopic: 'Design and Analysis of Algorithms: Dynamic Programming and Divide-and-Conquer',
    },
    {
      id: 'project_report',
      title: 'Project Report Generator',
      category: 'Authoritative CEP',
      icon: FileText,
      color: 'from-[#0B3B60] to-blue-700',
      tag: 'IARE Standard DOCX',
      badge: 'Flagship Tool',
      description:
        'Official 15–25 page IARE Project / CEP report with Self-Assessment form, preliminary pages, 5 chapters, and IEEE citations.',
      inputs: ['Project Title & Abstract', 'Guide Name & Designation', 'Branch & Section', 'Report Type (CEP/Course)'],
      sampleTopic: 'Smart Water Management System Using IoT Sensors and Cloud Edge Computing',
    },
    {
      id: 'case_study',
      title: 'Case Study Generator',
      category: 'Research Analysis',
      icon: Briefcase,
      color: 'from-purple-600 to-violet-700',
      tag: 'Academic DOCX',
      description:
        'In-depth engineering problem analysis with root cause diagnosis, comparative solution matrix, and roadmap.',
      inputs: ['Problem Scenario', 'Word Count (1000-2500)', 'Student Details', 'Academic References'],
      sampleTopic: 'Scalability Bottlenecks in UPI Banking Infrastructure During Peak Traffic',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B3B60] via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 opacity-10 hidden md:block">
          <Award className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Institute of Aeronautical Engineering • AI Academic Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.displayName || profile?.displayName || 'Student'}!
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select one of the four academic generation modules below. Create AAT PPTs, 10-Question assignments,
            and comprehensive IARE-formatted CEP project reports ready for submission.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Official IARE Format Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Editable DOCX & PPTX Downloads
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Secured with Firebase Firestore
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Quick Test: Smart Water Management System */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Sample Recommended Test
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Smart Water Management System Using IoT & Cloud Edge
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              One-click benchmark test for 15-25 page IARE CEP Project Report format.
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            onSelectTool(
              'project_report',
              'Smart Water Management System Using IoT Sensors and Cloud Edge Computing'
            )
          }
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all hover:gap-3"
        >
          <span>Launch Benchmark Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Academic Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Academic AI Generators
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an academic tool to start generating course deliverables
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {tool.category}
                          </span>
                          {tool.badge && (
                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {tool.tag}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Input Requirements Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Required Inputs:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.inputs.map((inp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectTool(tool.id, tool.sampleTopic)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline text-left"
                  >
                    Load Sample Topic
                  </button>

                  <button
                    onClick={() => onSelectTool(tool.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white transition-all group-hover:scale-[1.02]"
                  >
                    <span>Generate Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Generated Documents & Quick Access */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recently Generated Documents
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {recentDocs.length > 0 && (
              <button
                onClick={() => exportDocumentsDatabaseToExcel(recentDocs, profile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                title="Save Entire Academic Database into Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Save in Excel (.xlsx)</span>
              </button>
            )}
            <span className="text-xs text-slate-400">
              {recentDocs.length} {recentDocs.length === 1 ? 'document' : 'documents'} saved
            </span>
          </div>
        </div>

        {recentDocs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs">No documents generated yet.</p>
            <p className="text-[11px] text-slate-500">
              Generate an AAT PPT, Assignment, or Project Report above. It will be saved securely to your account.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentDocs.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => onOpenDoc(doc)}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {doc.toolType.replace('_', ' ').toUpperCase()} • {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDoc(doc);
                  }}
                  className="shrink-0 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  <span>Open & Export</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
