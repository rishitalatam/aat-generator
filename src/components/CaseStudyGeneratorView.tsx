import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestGenerateCaseStudy, requestRegenerateSection } from '../services/academicApi';
import { exportCaseStudyDocx } from '../utils/docxExport';
import { exportSingleDocToExcel } from '../utils/excelExport';
import { saveAcademicDocument } from '../firebase/documents';
import { CaseStudyDocument, CaseStudySection } from '../types/academic';
import {
  Briefcase,
  Download,
  Save,
  RotateCw,
  Sparkles,
  CheckCircle,
  Edit2,
  BookOpen,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CaseStudyGeneratorViewProps {
  initialTopic?: string;
  loadedDoc?: CaseStudyDocument | null;
  onSaved?: () => void;
}

export const CaseStudyGeneratorView: React.FC<CaseStudyGeneratorViewProps> = ({
  initialTopic = '',
  loadedDoc = null,
  onSaved,
}) => {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState(
    initialTopic ||
      'Scalability Bottlenecks in Unified Payments Interface (UPI) During High-Concurrency Flash Events'
  );
  const [subject, setSubject] = useState(profile?.courseName || 'Distributed Systems & Cloud Computing');
  const [studentName, setStudentName] = useState(profile?.displayName || 'Rishitha Latam');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '22951A0501');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [section, setSection] = useState(profile?.section || 'A');
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [problemDescription, setProblemDescription] = useState(
    'Analyzing distributed banking network failures during sudden million-request surges, evaluating optimistic concurrency control, load-balancing bottlenecks, and implementing redis-backed queue mitigation strategies.'
  );

  const [studyDoc, setStudyDoc] = useState<CaseStudyDocument | null>(loadedDoc);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !loadedDoc) {
      if (profile.displayName) setStudentName(profile.displayName);
      if (profile.rollNumber) setRollNumber(profile.rollNumber);
      if (profile.branch) setBranch(profile.branch);
      if (profile.section) setSection(profile.section);
      if (profile.courseName) setSubject(profile.courseName);
    }
  }, [profile, loadedDoc]);

  useEffect(() => {
    if (loadedDoc) {
      setStudyDoc(loadedDoc);
      setTitle(loadedDoc.title);
      setSubject(loadedDoc.subject);
    }
  }, [loadedDoc]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generated = await requestGenerateCaseStudy({
        title,
        subject,
        problemDescription,
        studentName,
        rollNumber,
        branch,
        section,
        targetWordCount,
      });

      setStudyDoc(generated);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

      if (user) {
        await saveAcademicDocument(user.uid, {
          id: generated.id,
          title: generated.title,
          toolType: 'case_study',
          subjectName: generated.subject,
          content: generated,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!studyDoc) return;
    try {
      await exportCaseStudyDocx(studyDoc);
    } catch (err) {
      console.error('Export case study error:', err);
      alert('Failed to download DOCX.');
    }
  };

  const handleSaveDocument = async () => {
    if (!studyDoc || !user) return;
    setSaving(true);
    try {
      await saveAcademicDocument(user.uid, {
        id: studyDoc.id,
        title: studyDoc.title,
        toolType: 'case_study',
        subjectName: studyDoc.subject,
        content: studyDoc,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (secId: string, updates: Partial<CaseStudySection>) => {
    if (!studyDoc) return;
    const sections = studyDoc.sections.map((s) => (s.id === secId ? { ...s, ...updates } : s));
    setStudyDoc({ ...studyDoc, sections });
  };

  const handleRegenerateSection = async (sec: CaseStudySection) => {
    if (!studyDoc) return;
    setRegeneratingId(sec.id);

    try {
      const improved = await requestRegenerateSection({
        documentType: 'casestudy_section',
        context: {
          documentTitle: studyDoc.title,
          sectionTitle: sec.title,
          currentContent: sec.content,
          instructions:
            'Generate a thorough, evidence-based engineering case study section with technical metrics and academic insights.',
        },
      });

      updateSection(sec.id, { content: improved });
    } catch (err) {
      console.error('Regenerate section failed:', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Case Study Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce rigorous technical engineering case analyses with root cause diagnoses and comparative matrices.
          </p>
        </div>

        {studyDoc && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDocument}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              {saveSuccess ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Progress'}</span>
            </button>

            <button
              onClick={() =>
                exportSingleDocToExcel({
                  id: studyDoc.id,
                  userId: user?.uid || '',
                  title: studyDoc.title,
                  toolType: 'case_study',
                  subjectName: studyDoc.subject,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  contentJson: JSON.stringify(studyDoc),
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
              title="Save Case Study in Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download .DOCX</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <strong>Generation Error:</strong> {error}
        </div>
      )}

      {!studyDoc ? (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Case Study Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Word Count
                </label>
                <select
                  value={targetWordCount}
                  onChange={(e) => setTargetWordCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value={1000}>1,000 Words (Standard Case Analysis)</option>
                  <option value={1500}>1,500 Words (In-Depth Technical Case)</option>
                  <option value={2500}>2,500 Words (Comprehensive Research Case)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Description / Scenario Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Academic Case Study with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Case Study</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                {studyDoc.subject}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {studyDoc.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Author: {studyDoc.studentName} ({studyDoc.rollNumber}, Sec {studyDoc.section}) • ~{studyDoc.targetWordCount} Words
              </p>
            </div>
            <button
              onClick={() => setStudyDoc(null)}
              className="text-xs text-slate-500 hover:underline"
            >
              ← Edit Case Details
            </button>
          </div>

          <div className="space-y-4">
            {studyDoc.sections.map((sec) => {
              const isEditing = editingId === sec.id;
              const isRegenerating = regeneratingId === sec.id;

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sec.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(isEditing ? null : sec.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'View' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleRegenerateSection(sec)}
                        disabled={isRegenerating}
                        className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs flex items-center gap-1 font-semibold"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>{isRegenerating ? 'Rewriting...' : 'Regenerate Section'}</span>
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={7}
                      value={sec.content}
                      onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-sans"
                    />
                  ) : (
                    <div className="font-academic text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-line">
                      {sec.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
