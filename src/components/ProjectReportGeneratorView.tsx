import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestGenerateProjectReport, requestRegenerateSection } from '../services/academicApi';
import { exportProjectReportDocx } from '../utils/docxExport';
import { exportSingleDocToExcel } from '../utils/excelExport';
import { saveAcademicDocument } from '../firebase/documents';
import { ProjectReportDocument, ReportChapter, ReportSection } from '../types/academic';
import {
  FileText,
  Download,
  Save,
  RotateCw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Award,
  Layers,
  Edit2,
  Check,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectReportGeneratorViewProps {
  initialTopic?: string;
  loadedDoc?: ProjectReportDocument | null;
  onSaved?: () => void;
}

export const ProjectReportGeneratorView: React.FC<ProjectReportGeneratorViewProps> = ({
  initialTopic = '',
  loadedDoc = null,
  onSaved,
}) => {
  const { user, profile } = useAuth();

  // Inputs
  const [projectTitle, setProjectTitle] = useState(
    initialTopic ||
      'Smart Water Management System Using IoT Sensors and Cloud Edge Computing'
  );
  const [reportType, setReportType] = useState<'cep' | 'course_project' | 'mini_project'>('cep');
  const [studentName, setStudentName] = useState(profile?.displayName || 'Rishitha Latam');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '22951A0501');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [section, setSection] = useState(profile?.section || 'A');
  const [program, setProgram] = useState(profile?.program || 'Bachelor of Technology (B.Tech)');
  const [courseName, setCourseName] = useState(profile?.courseName || 'Design and Analysis of Algorithms');
  const [courseCode, setCourseCode] = useState(profile?.courseCode || 'CS401PC');
  const [guideName, setGuideName] = useState(profile?.guideName || 'Dr. K. Srinivasa Rao');
  const [guideDesignation, setGuideDesignation] = useState(profile?.guideDesignation || 'Professor & Head');
  const [department, setDepartment] = useState('Department of Computer Science and Engineering');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [date, setDate] = useState('March 2026');
  const [projectDescription, setProjectDescription] = useState(
    'An automated, intelligent water distribution and leakage monitoring platform integrating ultrasonic flow meters, edge-deployed machine learning models for anomaly detection, and cloud telemetry for resource optimization in urban infrastructure.'
  );
  const [technologiesUsed, setTechnologiesUsed] = useState(
    'ESP32 IoT Microcontrollers, Ultrasonic Sensors, Python Edge AI, React Dashboard, Firebase Firestore'
  );

  // Document state
  const [reportDoc, setReportDoc] = useState<ProjectReportDocument | null>(loadedDoc);
  const [activeTab, setActiveTab] = useState<'cover' | 'assessment' | 'prelims' | 'chapters' | 'references'>('chapters');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !loadedDoc) {
      if (profile.displayName) setStudentName(profile.displayName);
      if (profile.rollNumber) setRollNumber(profile.rollNumber);
      if (profile.branch) setBranch(profile.branch);
      if (profile.section) setSection(profile.section);
      if (profile.courseCode) setCourseCode(profile.courseCode);
      if (profile.courseName) setCourseName(profile.courseName);
      if (profile.guideName) setGuideName(profile.guideName);
      if (profile.guideDesignation) setGuideDesignation(profile.guideDesignation);
    }
  }, [profile, loadedDoc]);

  useEffect(() => {
    if (loadedDoc) {
      setReportDoc(loadedDoc);
      setProjectTitle(loadedDoc.title);
      setReportType(loadedDoc.reportType);
      setCourseName(loadedDoc.courseName);
      setCourseCode(loadedDoc.courseCode);
    }
  }, [loadedDoc]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generated = await requestGenerateProjectReport({
        projectTitle,
        studentName,
        rollNumber,
        branch,
        section,
        program,
        courseName,
        courseCode,
        guideName,
        guideDesignation,
        department,
        academicYear,
        date,
        projectDescription,
        technologiesUsed,
        reportType,
      });

      setReportDoc(generated);
      setActiveTab('chapters');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      if (user) {
        await saveAcademicDocument(user.uid, {
          id: generated.id,
          title: generated.title,
          toolType: 'project_report',
          subjectName: generated.courseName,
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
    if (!reportDoc) return;
    try {
      await exportProjectReportDocx(reportDoc);
    } catch (err) {
      console.error('Export report error:', err);
      alert('Failed to generate DOCX file.');
    }
  };

  const handleSaveDocument = async () => {
    if (!reportDoc || !user) return;
    setSaving(true);
    try {
      await saveAcademicDocument(user.uid, {
        id: reportDoc.id,
        title: reportDoc.title,
        toolType: 'project_report',
        subjectName: reportDoc.courseName,
        courseCode: reportDoc.courseCode,
        content: reportDoc,
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

  const updateSectionContent = (
    chapIdx: number,
    secIdx: number,
    updates: Partial<ReportSection>
  ) => {
    if (!reportDoc) return;
    const chapters = [...reportDoc.chapters];
    const targetChap = chapters[chapIdx];
    const sections = [...targetChap.sections];
    sections[secIdx] = { ...sections[secIdx], ...updates };
    chapters[chapIdx] = { ...targetChap, sections };
    setReportDoc({ ...reportDoc, chapters });
  };

  const handleRegenerateSubsection = async (chapIdx: number, secIdx: number) => {
    if (!reportDoc) return;
    const chap = reportDoc.chapters[chapIdx];
    const sec = chap.sections[secIdx];
    const key = `${chapIdx}-${secIdx}`;
    setRegeneratingKey(key);

    try {
      const regenerated = await requestRegenerateSection({
        documentType: 'report_section',
        context: {
          documentTitle: reportDoc.title,
          sectionTitle: `${sec.sectionNumber} ${sec.title}`,
          currentContent: sec.content,
          instructions:
            'Expand with deep engineering analysis, technical equations or algorithms, and academic depth conforming to 15-25 page IARE project standards.',
        },
      });

      updateSectionContent(chapIdx, secIdx, { content: regenerated });
    } catch (err) {
      console.error('Regenerate section failed:', err);
    } finally {
      setRegeneratingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              IARE Project Report Generator (CEP Standard)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative 15–25 page IARE format: Self-Assessment, Prelims, Chapters 1–5, and IEEE References.
          </p>
        </div>

        {reportDoc && (
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
                  id: reportDoc.id,
                  userId: user?.uid || '',
                  title: reportDoc.title,
                  toolType: 'project_report',
                  subjectName: reportDoc.courseName,
                  courseCode: reportDoc.courseCode,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  contentJson: JSON.stringify(reportDoc),
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
              title="Save in Excel Sheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official .DOCX</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <strong>Generation Error:</strong> {error}
        </div>
      )}

      {!reportDoc ? (
        /* Form view */
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Smart Water Management System Using IoT Sensors and Cloud Edge Computing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Report Type *
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value="cep">Complex Engineering Problem (CEP)</option>
                  <option value="course_project">Course Academic Project Report</option>
                  <option value="mini_project">Mini-Project / Capstone Report</option>
                </select>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  placeholder="e.g. 22951A0501"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch *
                </label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section *
                </label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Name & Code *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Course Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="Code"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Guide Name *
                </label>
                <input
                  type="text"
                  required
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guide Designation
                </label>
                <input
                  type="text"
                  value={guideDesignation}
                  onChange={(e) => setGuideDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Description / Problem Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technologies / Tools Used
                </label>
                <input
                  type="text"
                  value={technologiesUsed}
                  onChange={(e) => setTechnologiesUsed(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, Edge ML, Firebase"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Generating Full 15-25 Page IARE Project Report with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete IARE Project Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Report Interactive Paginated Tabs */
        <div className="space-y-4">
          {/* Top navigation tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: 'cover', label: '1. Cover & Title' },
              { id: 'assessment', label: '2. Self-Assessment Form' },
              { id: 'prelims', label: '3. Prelims & Abstract' },
              { id: 'chapters', label: '4. Chapters 1 to 5' },
              { id: 'references', label: '5. References' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}

            <button
              onClick={() => setReportDoc(null)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ← Edit Details
            </button>
          </div>

          {/* TAB 1: COVER PAGE PREVIEW */}
          {activeTab === 'cover' && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm font-academic text-center space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B3B60] dark:text-blue-400">
                  INSTITUTE OF AERONAUTICAL ENGINEERING
                </h2>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">(Autonomous)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dundigal, Hyderabad - 500043, Telangana
                  <br />
                  NAAC 'A+' Grade | Accredited by NBA | Affiliated to JNTUH
                </p>
              </div>

              <div className="py-6 border-y border-slate-100 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  {reportDoc.reportType === 'cep' ? 'A REPORT ON COMPLEX ENGINEERING PROBLEM' : 'PROJECT REPORT'}
                </p>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase leading-snug">
                  {reportDoc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  Submitted in partial fulfillment of the requirements for the award of the degree of
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {reportDoc.program} in {reportDoc.branch}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-left pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Submitted By:</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{reportDoc.studentName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Roll: {reportDoc.rollNumber}</p>
                  <p className="text-xs text-slate-500">Section: {reportDoc.section}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Under the Guidance of:</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{reportDoc.guideName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{reportDoc.guideDesignation}</p>
                  <p className="text-xs text-slate-500">{reportDoc.department}</p>
                </div>
              </div>

              <div className="pt-8 text-xs font-bold text-slate-500">
                ACADEMIC YEAR: {reportDoc.academicYear}
              </div>
            </div>
          )}

          {/* TAB 2: SELF-ASSESSMENT FORM */}
          {activeTab === 'assessment' && reportDoc.selfAssessment && (
            <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  COMPLEX PROBLEM-SOLVING SELF-ASSESSMENT FORM
                </h2>
                <p className="text-xs text-slate-500">
                  Mapping of engineering attributes, POs, and PSOs for {reportDoc.title}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Problem Complexity Justification
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-academic text-sm">
                  {reportDoc.selfAssessment.problemComplexityJustification}
                </p>
              </div>

              {/* PO Mapping Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Program Outcomes (PO) Correlation Matrix
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">Program Outcome (PO)</th>
                        <th className="p-3">Correlation</th>
                        <th className="p-3">Justification / Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportDoc.selfAssessment.poMapping.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.po}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                              {item.correlation}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-academic">{item.justification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRELIMINARY PAGES */}
          {activeTab === 'prelims' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Declaration Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm font-academic space-y-3">
                <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                  DECLARATION
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                  {reportDoc.declaration}
                </p>
                <div className="pt-4 text-xs font-sans text-right text-slate-600 dark:text-slate-400">
                  {reportDoc.studentName} ({reportDoc.rollNumber})
                </div>
              </div>

              {/* Certificate Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm font-academic space-y-3">
                <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                  CERTIFICATE
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                  {reportDoc.certificate}
                </p>
                <div className="pt-4 flex justify-between text-xs font-sans text-slate-600 dark:text-slate-400">
                  <span>Internal Guide: {reportDoc.guideName}</span>
                  <span>Head of the Department</span>
                </div>
              </div>

              {/* Abstract Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm font-academic space-y-3">
                <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                  ABSTRACT
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  {reportDoc.abstract}
                </p>
                <p className="text-xs font-sans font-bold text-slate-500 pt-2">
                  Keywords: {reportDoc.technologies.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CHAPTERS 1 TO 5 */}
          {activeTab === 'chapters' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chapter Sidebar */}
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Chapters
                </div>
                {reportDoc.chapters.map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                      activeChapterIndex === idx
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase">
                      Chapter {chap.chapterNumber}
                    </div>
                    <div className="truncate mt-0.5">{chap.chapterTitle}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-1">
                      {chap.sections.length} Subsections
                    </div>
                  </button>
                ))}
              </div>

              {/* Chapter Sections Reader & Editor */}
              <div className="lg:col-span-8 space-y-6">
                {reportDoc.chapters[activeChapterIndex] && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                        Chapter {reportDoc.chapters[activeChapterIndex].chapterNumber}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase mt-1">
                        {reportDoc.chapters[activeChapterIndex].chapterTitle}
                      </h2>
                    </div>

                    {reportDoc.chapters[activeChapterIndex].sections.map((sec, secIdx) => {
                      const key = `${activeChapterIndex}-${secIdx}`;
                      const isEditing = editingSectionKey === key;
                      const isRegenerating = regeneratingKey === key;

                      return (
                        <div
                          key={secIdx}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {sec.sectionNumber} {sec.title}
                            </h3>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingSectionKey(isEditing ? null : key)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>{isEditing ? 'View' : 'Edit'}</span>
                              </button>

                              <button
                                onClick={() => handleRegenerateSubsection(activeChapterIndex, secIdx)}
                                disabled={isRegenerating}
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1 font-semibold"
                              >
                                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                                <span>{isRegenerating ? 'Expanding...' : 'Regenerate Section'}</span>
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <textarea
                              rows={8}
                              value={sec.content}
                              onChange={(e) =>
                                updateSectionContent(activeChapterIndex, secIdx, {
                                  content: e.target.value,
                                })
                              }
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
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REFERENCES */}
          {activeTab === 'references' && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4 font-academic">
              <h3 className="text-base font-bold text-center text-slate-900 dark:text-white uppercase mb-4">
                REFERENCES (IEEE Format)
              </h3>
              <div className="space-y-3">
                {reportDoc.references.map((ref, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-bold shrink-0">[{idx + 1}]</span>
                    <span>{ref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
