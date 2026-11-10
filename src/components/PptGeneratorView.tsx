import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestGeneratePpt, requestRegenerateSection } from '../services/academicApi';
import { exportPptx } from '../utils/pptxExport';
import { exportSingleDocToExcel } from '../utils/excelExport';
import { saveAcademicDocument } from '../firebase/documents';
import { PPTDocument, SlideItem } from '../types/academic';
import {
  Presentation,
  Download,
  Save,
  RotateCw,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PptGeneratorViewProps {
  initialTopic?: string;
  loadedDoc?: PPTDocument | null;
  onSaved?: () => void;
}

export const PptGeneratorView: React.FC<PptGeneratorViewProps> = ({
  initialTopic = '',
  loadedDoc = null,
  onSaved,
}) => {
  const { user, profile } = useAuth();

  // Form states
  const [topic, setTopic] = useState(initialTopic || 'Autonomous Drone Navigation Using Deep RL');
  const [subjectName, setSubjectName] = useState(profile?.courseName || 'Artificial Intelligence');
  const [courseCode, setCourseCode] = useState(profile?.courseCode || 'AI302PC');
  const [studentName, setStudentName] = useState(profile?.displayName || 'Rishitha Latam');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '22951A0501');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [section, setSection] = useState(profile?.section || 'A');
  const [numberOfSlides, setNumberOfSlides] = useState(8);
  const [presentationType, setPresentationType] = useState('Technical Seminar AAT');
  const [themeStyle, setThemeStyle] = useState<'academic_navy' | 'modern_dark' | 'emerald_clean' | 'crimson_formal'>('academic_navy');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generated document state
  const [pptDoc, setPptDoc] = useState<PPTDocument | null>(loadedDoc);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync profile defaults
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
      setPptDoc(loadedDoc);
      setTopic(loadedDoc.title);
      setSubjectName(loadedDoc.subjectName);
      setCourseCode(loadedDoc.courseCode);
      setThemeStyle(loadedDoc.themeStyle || 'academic_navy');
    }
  }, [loadedDoc]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generated = await requestGeneratePpt({
        topic,
        subjectName,
        courseCode,
        studentName,
        rollNumber,
        branch,
        section,
        numberOfSlides,
        presentationType,
        additionalInstructions,
        themeStyle,
      });

      setPptDoc(generated);
      setActiveSlideIndex(0);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

      // Auto save to Firestore
      if (user) {
        await saveAcademicDocument(user.uid, {
          id: generated.id,
          title: generated.title,
          toolType: 'aat_ppt',
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

  const handleDownloadPptx = async () => {
    if (!pptDoc) return;
    try {
      await exportPptx(pptDoc);
    } catch (err) {
      console.error('PPTX export error:', err);
      alert('Failed to download PPTX. Please check console.');
    }
  };

  const handleSaveDocument = async () => {
    if (!pptDoc || !user) return;
    setSaving(true);
    try {
      await saveAcademicDocument(user.uid, {
        id: pptDoc.id,
        title: pptDoc.title,
        toolType: 'aat_ppt',
        subjectName: pptDoc.subjectName,
        courseCode: pptDoc.courseCode,
        content: pptDoc,
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

  const currentSlide: SlideItem | undefined = pptDoc?.slides[activeSlideIndex];

  const updateCurrentSlide = (updates: Partial<SlideItem>) => {
    if (!pptDoc || !currentSlide) return;
    const newSlides = [...pptDoc.slides];
    newSlides[activeSlideIndex] = { ...currentSlide, ...updates };
    setPptDoc({ ...pptDoc, slides: newSlides });
  };

  const handleRegenerateCurrentSlide = async () => {
    if (!pptDoc || !currentSlide) return;
    setRegenerating(true);
    try {
      const newContent = await requestRegenerateSection({
        documentType: 'ppt_slide',
        context: {
          documentTitle: pptDoc.title,
          sectionTitle: currentSlide.title,
          currentContent: currentSlide.bullets.join('\n'),
          instructions: 'Generate 4-5 high impact bullet points and key takeaway for this slide.',
        },
      });

      const bullets = newContent
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter((l) => l.length > 5);

      updateCurrentSlide({ bullets: bullets.length ? bullets : currentSlide.bullets });
    } catch (err) {
      console.error('Regenerate slide failed:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddSlide = () => {
    if (!pptDoc) return;
    const newSlide: SlideItem = {
      slideNumber: pptDoc.slides.length + 1,
      title: 'New Slide Topic',
      bullets: ['Key point 1 regarding technical analysis', 'Key point 2 regarding system architecture'],
      keyTakeaway: 'Summary takeaway for the audience',
      notes: 'Presenter speaking notes',
      layoutType: 'content',
    };
    setPptDoc({ ...pptDoc, slides: [...pptDoc.slides, newSlide] });
    setActiveSlideIndex(pptDoc.slides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (!pptDoc || pptDoc.slides.length <= 1) return;
    const newSlides = pptDoc.slides.filter((_, i) => i !== idx);
    setPptDoc({ ...pptDoc, slides: newSlides });
    if (activeSlideIndex >= newSlides.length) {
      setActiveSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Presentation className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              AAT PPT Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate authentic IARE Alternative Assessment Task (AAT) PowerPoint slide decks with full notes.
          </p>
        </div>

        {pptDoc && (
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
                  id: pptDoc.id,
                  userId: user?.uid || '',
                  title: pptDoc.title,
                  toolType: 'aat_ppt',
                  subjectName: pptDoc.subjectName,
                  courseCode: pptDoc.courseCode,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  contentJson: JSON.stringify(pptDoc),
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
              title="Save Slide Data in Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleDownloadPptx}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download .PPTX</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          <strong>Generation Error:</strong> {error}
        </div>
      )}

      {/* Main Content Area */}
      {!pptDoc ? (
        /* Input Form */
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Presentation Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Autonomous Drone Navigation using Deep Reinforcement Learning"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  placeholder="e.g. AI302PC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Slides (5 - 15)
                </label>
                <input
                  type="number"
                  min={5}
                  max={15}
                  value={numberOfSlides}
                  onChange={(e) => setNumberOfSlides(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Presentation Theme Style
                </label>
                <select
                  value={themeStyle}
                  onChange={(e) => setThemeStyle(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="academic_navy">IARE Official Academic Navy</option>
                  <option value="modern_dark">Modern Dark Tech</option>
                  <option value="emerald_clean">Emerald Scholar Clean</option>
                  <option value="crimson_formal">Crimson Formal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Focus on algorithmic complexity, comparison benchmarks, and live drone obstacle avoidance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Generating Complete Presentation Deck with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AAT Presentation Deck</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Slide Deck Interactive Preview & Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Thumbnail Strip */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Slides ({pptDoc.slides.length})
              </span>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pptDoc.slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    activeSlideIndex === idx
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>Slide {idx + 1}</span>
                    {pptDoc.slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {s.bullets[0] || 'No content'}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPptDoc(null)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white text-center"
            >
              ← Back to Generator Form
            </button>
          </div>

          {/* Right: Slide Stage & Inline Editor */}
          <div className="lg:col-span-9 space-y-4">
            {currentSlide && (
              <div className="space-y-4">
                {/* Slide Canvas / Visual Preview */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-[#0B3B60] text-white">
                  {/* Slide Canvas Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-300">
                        IARE • {pptDoc.courseCode} • Alternative Assessment Task
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                        {currentSlide.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                      {activeSlideIndex + 1} / {pptDoc.slides.length}
                    </span>
                  </div>

                  {/* Slide Canvas Bullets */}
                  <div className="py-4 space-y-2.5">
                    {currentSlide.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <span className="text-sm sm:text-base text-slate-200 leading-relaxed">
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Slide Canvas Footer */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                    <span>
                      {pptDoc.studentName} ({pptDoc.rollNumber}) • Sec {pptDoc.section}
                    </span>
                    {currentSlide.keyTakeaway && (
                      <span className="text-blue-300 font-medium truncate max-w-xs">
                        Takeaway: {currentSlide.keyTakeaway}
                      </span>
                    )}
                  </div>
                </div>

                {/* Slide Navigation Controls */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Slide {activeSlideIndex + 1} of {pptDoc.slides.length}
                    </span>
                    <button
                      onClick={() =>
                        setActiveSlideIndex((prev) => Math.min(pptDoc.slides.length - 1, prev + 1))
                      }
                      disabled={activeSlideIndex === pptDoc.slides.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleRegenerateCurrentSlide}
                    disabled={regenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                    <span>{regenerating ? 'Regenerating...' : 'Regenerate This Slide'}</span>
                  </button>
                </div>

                {/* Inline Slide Editor */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Edit Slide Content
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      value={currentSlide.title}
                      onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Bullet Points (one per line)
                    </label>
                    <textarea
                      rows={5}
                      value={currentSlide.bullets.join('\n')}
                      onChange={(e) =>
                        updateCurrentSlide({
                          bullets: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Speaker Notes (attached to slide in PPTX)
                    </label>
                    <textarea
                      rows={2}
                      value={currentSlide.notes || ''}
                      onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
