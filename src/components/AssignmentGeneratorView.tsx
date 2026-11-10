import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestGenerateAssignment, requestRegenerateSection } from '../services/academicApi';
import { exportAssignmentDocx } from '../utils/docxExport';
import { exportSingleDocToExcel } from '../utils/excelExport';
import { saveAcademicDocument } from '../firebase/documents';
import { AssignmentDocument, AssignmentQuestion } from '../types/academic';
import {
  FileCheck2,
  Download,
  Save,
  RotateCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit3,
  CheckCircle,
  HelpCircle,
  BookOpen,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssignmentGeneratorViewProps {
  initialTopic?: string;
  loadedDoc?: AssignmentDocument | null;
  onSaved?: () => void;
}

export const AssignmentGeneratorView: React.FC<AssignmentGeneratorViewProps> = ({
  initialTopic = '',
  loadedDoc = null,
  onSaved,
}) => {
  const { user, profile } = useAuth();

  const [topicOrQuestions, setTopicOrQuestions] = useState(
    initialTopic ||
      'Design and Analysis of Algorithms: Dynamic Programming, Greedy Methods, and Graph Algorithms'
  );
  const [subjectName, setSubjectName] = useState(profile?.courseName || 'Design and Analysis of Algorithms');
  const [courseCode, setCourseCode] = useState(profile?.courseCode || 'CS401PC');
  const [studentName, setStudentName] = useState(profile?.displayName || 'Rishitha Latam');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '22951A0501');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [section, setSection] = useState(profile?.section || 'A');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [answerLength, setAnswerLength] = useState<'Short' | 'Medium' | 'Comprehensive'>('Comprehensive');
  const [assignmentNumber, setAssignmentNumber] = useState('AAT-I');

  const [assignmentDoc, setAssignmentDoc] = useState<AssignmentDocument | null>(loadedDoc);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !loadedDoc) {
      if (profile.displayName) setStudentName(profile.displayName);
      if (profile.rollNumber) setRollNumber(profile.rollNumber);
      if (profile.branch) setBranch(profile.branch);
      if (profile.section) setSection(profile.section);
      if (profile.courseCode) setCourseCode(profile.courseCode);
      if (profile.courseName) setSubjectName(profile.courseName);
    }
  }, [profile, loadedDoc]);

  useEffect(() => {
    if (loadedDoc) {
      setAssignmentDoc(loadedDoc);
      setSubjectName(loadedDoc.subjectName);
      setCourseCode(loadedDoc.courseCode);
    }
  }, [loadedDoc]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generated = await requestGenerateAssignment({
        topicOrQuestions,
        subjectName,
        courseCode,
        studentName,
        rollNumber,
        branch,
        section,
        numberOfQuestions,
        answerLength,
        assignmentNumber,
      });

      setAssignmentDoc(generated);
      setExpandedIndex(0);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

      if (user) {
        await saveAcademicDocument(user.uid, {
          id: generated.id,
          title: generated.title,
          toolType: 'aat_assignment',
          subjectName: generated.subjectName,
          courseCode: generated.courseCode,
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
    if (!assignmentDoc) return;
    try {
      await exportAssignmentDocx(assignmentDoc);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to download DOCX.');
    }
  };

  const handleSaveDocument = async () => {
    if (!assignmentDoc || !user) return;
    setSaving(true);
    try {
      await saveAcademicDocument(user.uid, {
        id: assignmentDoc.id,
        title: assignmentDoc.title,
        toolType: 'aat_assignment',
        subjectName: assignmentDoc.subjectName,
        courseCode: assignmentDoc.courseCode,
        content: assignmentDoc,
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

  const updateQuestion = (idx: number, updates: Partial<AssignmentQuestion>) => {
    if (!assignmentDoc) return;
    const questions = [...assignmentDoc.questions];
    questions[idx] = { ...questions[idx], ...updates };
    setAssignmentDoc({ ...assignmentDoc, questions });
  };

  const handleRegenerateAnswer = async (idx: number) => {
    if (!assignmentDoc) return;
    const q = assignmentDoc.questions[idx];
    setRegeneratingIdx(idx);

    try {
      const improved = await requestRegenerateSection({
        documentType: 'assignment_question',
        context: {
          documentTitle: assignmentDoc.title,
          sectionTitle: `Question ${q.questionNumber}: ${q.question}`,
          currentContent: q.answer,
          instructions:
            'Generate a thorough, high-scoring academic answer with subheadings, comparison tables, code or algorithms if relevant, conforming to IARE grading standards.',
        },
      });

      updateQuestion(idx, { answer: improved });
    } catch (err) {
      console.error('Regenerate answer failed:', err);
    } finally {
      setRegeneratingIdx(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              AAT Assignment Generator (10-Question Workflow)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate complete continuous internal assessment assignments mapped to Bloom’s Taxonomy and Course Outcomes.
          </p>
        </div>

        {assignmentDoc && (
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
                  id: assignmentDoc.id,
                  userId: user?.uid || '',
                  title: assignmentDoc.title,
                  toolType: 'aat_assignment',
                  subjectName: assignmentDoc.subjectName,
                  courseCode: assignmentDoc.courseCode,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  contentJson: JSON.stringify(assignmentDoc),
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
              title="Save Questions & Answers in Excel (.xlsx)"
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

      {!assignmentDoc ? (
        /* Form view */
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Subject / Topic Questions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={topicOrQuestions}
                  onChange={(e) => setTopicOrQuestions(e.target.value)}
                  placeholder="Enter unit topics or paste 10 question prompts..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Questions (Standard is 10)
                </label>
                <select
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={10}>10 Questions (Standard IARE AAT Workflow)</option>
                  <option value={5}>5 Questions (Short Assessment)</option>
                  <option value={15}>15 Questions (Exhaustive QB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Answer Depth & Length
                </label>
                <select
                  value={answerLength}
                  onChange={(e) => setAnswerLength(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Comprehensive">Comprehensive (Detailed with tables & steps)</option>
                  <option value="Medium">Medium (Balanced 250-350 words)</option>
                  <option value="Short">Concise (100-150 words)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Number
                </label>
                <input
                  type="text"
                  value={assignmentNumber}
                  onChange={(e) => setAssignmentNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Generating 10 High-Scoring Solutions with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete 10-Question Assignment</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Document Preview & Accordion */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {assignmentDoc.assignmentNumber} • {assignmentDoc.courseCode}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {assignmentDoc.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student: {assignmentDoc.studentName} ({assignmentDoc.rollNumber}) • Sec {assignmentDoc.section}
              </p>
            </div>
            <button
              onClick={() => setAssignmentDoc(null)}
              className="text-xs text-slate-500 hover:underline"
            >
              ← Edit Input Details
            </button>
          </div>

          <div className="space-y-3">
            {assignmentDoc.questions.map((q, idx) => {
              const isExpanded = expandedIndex === idx;
              const isEditing = editingIndex === idx;
              const isRegenerating = regeneratingIdx === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
                >
                  {/* Question Header Bar */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        Q{q.questionNumber}
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {q.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                            {q.bloomLevel || 'L3 - Apply'}
                          </span>
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
                            {q.courseOutcome || 'CO1'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Marks: {q.marks || 5}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Question Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Edit Question Statement
                          </label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                          />

                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Edit Answer Content
                          </label>
                          <textarea
                            rows={8}
                            value={q.answer}
                            onChange={(e) => updateQuestion(idx, { answer: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-sans"
                          />

                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                          >
                            Done Editing
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-academic text-sm">
                            {q.answer}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => setEditingIndex(idx)}
                              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Answer</span>
                            </button>

                            <button
                              onClick={() => handleRegenerateAnswer(idx)}
                              disabled={isRegenerating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                              <span>{isRegenerating ? 'Regenerating Solution...' : 'Regenerate This Answer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
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
