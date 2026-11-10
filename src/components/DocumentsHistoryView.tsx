import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeUserDocuments, deleteUserDocument } from '../firebase/documents';
import { SavedDocumentMeta, ToolType } from '../types/academic';
import { exportProjectReportDocx, exportAssignmentDocx, exportCaseStudyDocx } from '../utils/docxExport';
import { exportPptx } from '../utils/pptxExport';
import { exportDocumentsDatabaseToExcel, exportSingleDocToExcel } from '../utils/excelExport';
import {
  History,
  Search,
  Trash2,
  Download,
  ExternalLink,
  Presentation,
  FileCheck2,
  FileText,
  Briefcase,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DocumentsHistoryViewProps {
  onOpenDocument: (meta: SavedDocumentMeta) => void;
}

export const DocumentsHistoryView: React.FC<DocumentsHistoryViewProps> = ({ onOpenDocument }) => {
  const { user, profile } = useAuth();
  const [docs, setDocs] = useState<SavedDocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeUserDocuments(
      user.uid,
      (data) => {
        setDocs(data);
        setLoading(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Are you sure you want to delete this document from your history?')) return;

    setDeletingId(docId);
    try {
      await deleteUserDocument(user.uid, docId);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDirectDownload = async (e: React.MouseEvent, meta: SavedDocumentMeta) => {
    e.stopPropagation();
    try {
      const content = JSON.parse(meta.contentJson);
      if (meta.toolType === 'aat_ppt') {
        await exportPptx(content);
      } else if (meta.toolType === 'aat_assignment') {
        await exportAssignmentDocx(content);
      } else if (meta.toolType === 'project_report') {
        await exportProjectReportDocx(content);
      } else if (meta.toolType === 'case_study') {
        await exportCaseStudyDocx(content);
      }
    } catch (err) {
      console.error('Direct download error:', err);
      alert('Unable to export document file.');
    }
  };

  const handleDownloadExcel = (e: React.MouseEvent, meta: SavedDocumentMeta) => {
    e.stopPropagation();
    exportSingleDocToExcel(meta);
  };

  const handleExportFullDatabaseExcel = () => {
    exportDocumentsDatabaseToExcel(docs, profile);
  };

  const filteredDocs = docs.filter((d) => {
    const matchesType = filterType === 'all' || d.toolType === filterType;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.subjectName && d.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.courseCode && d.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getToolIcon = (toolType: ToolType) => {
    switch (toolType) {
      case 'aat_ppt':
        return <Presentation className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'aat_assignment':
        return <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'project_report':
        return <FileText className="w-4 h-4 text-accent" />;
      case 'case_study':
        return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-accent-light text-accent">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              My Saved Documents & Database
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access previous deliverables, re-open in interactive editor, or save database directly into Excel sheets.
          </p>
        </div>

        {/* Save in Excel Sheets button */}
        <button
          onClick={handleExportFullDatabaseExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Save Database in Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, subject, or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-accent outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'aat_ppt', label: 'AAT PPT' },
            { id: 'aat_assignment', label: 'Assignments' },
            { id: 'project_report', label: 'Reports' },
            { id: 'case_study', label: 'Case Studies' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your academic database...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No saved documents found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No documents match your search criteria. Try a different term or clear filters.'
              : 'Generate an AAT PPT, Assignment, or Project Report to see it archived here and saved to Excel.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDocument(item)}
              className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:border-accent"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getToolIcon(item.toolType)}
                    <span className="uppercase font-mono">
                      {item.toolType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.subjectName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {item.subjectName} {item.courseCode ? `(${item.courseCode})` : ''}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-accent font-semibold group-hover:underline flex items-center gap-1">
                  <span>Open Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDownloadExcel(e, item)}
                    title="Export to Excel (.xlsx)"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDirectDownload(e, item)}
                    title="Download Primary DOCX / PPTX"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    title="Delete Document"
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
