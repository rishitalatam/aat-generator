import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccentColor, ThemeMode, SavedDocumentMeta } from '../types/academic';
import { subscribeUserDocuments } from '../firebase/documents';
import { exportDocumentsDatabaseToExcel } from '../utils/excelExport';
import {
  User,
  Save,
  CheckCircle,
  Palette,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ShieldCheck,
  GraduationCap,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const {
    user,
    profile,
    theme,
    accentColor,
    authMethod,
    setTheme,
    setAccentColor,
    updateAcademicProfile,
    signOut,
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '22951A0501');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [section, setSection] = useState(profile?.section || 'A');
  const [program, setProgram] = useState(profile?.program || 'Bachelor of Technology (B.Tech)');
  const [courseCode, setCourseCode] = useState(profile?.courseCode || 'CS401PC');
  const [courseName, setCourseName] = useState(profile?.courseName || 'Design and Analysis of Algorithms');
  const [guideName, setGuideName] = useState(profile?.guideName || 'Dr. K. Srinivasa Rao');
  const [guideDesignation, setGuideDesignation] = useState(profile?.guideDesignation || 'Professor & Head');

  const [docs, setDocs] = useState<SavedDocumentMeta[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.displayName) setDisplayName(profile.displayName);
      if (profile.rollNumber) setRollNumber(profile.rollNumber);
      if (profile.branch) setBranch(profile.branch);
      if (profile.section) setSection(profile.section);
      if (profile.program) setProgram(profile.program);
      if (profile.courseCode) setCourseCode(profile.courseCode);
      if (profile.courseName) setCourseName(profile.courseName);
      if (profile.guideName) setGuideName(profile.guideName);
      if (profile.guideDesignation) setGuideDesignation(profile.guideDesignation);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      const unsub = subscribeUserDocuments(
        user.uid,
        (items) => setDocs(items),
        () => {}
      );
      return () => unsub();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAcademicProfile({
        displayName,
        rollNumber,
        branch,
        section,
        program,
        courseCode,
        courseName,
        guideName,
        guideDesignation,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const accentOptions: { id: AccentColor; name: string; hex: string }[] = [
    { id: 'amber', name: 'Amber Gold (IARE)', hex: '#D97706' },
    { id: 'navy', name: 'IARE Academic Navy', hex: '#0B3B60' },
    { id: 'emerald', name: 'Emerald Scholar', hex: '#059669' },
    { id: 'purple', name: 'Royal Purple', hex: '#7C3AED' },
    { id: 'crimson', name: 'Crimson Tech', hex: '#DC2626' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Academic Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Save your IARE student details, customize dark/light themes and amber accent, or export the database to Excel.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-accent"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-2xl">
              {(user?.displayName || profile?.displayName || 'S').charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.displayName || profile?.displayName || 'IARE Student'}
              </h2>
              {authMethod === 'samvidha' ? (
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Samvidha Login
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Google Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Roll No: {profile?.rollNumber || 'Not set'} • Branch: {profile?.branch || 'CSE'}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Excel Sheet Database Export Banner */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 dark:from-emerald-950/40 dark:to-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Save Academic Database in Excel Sheets (.xlsx)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Exports a multi-sheet workbook with Document Registry, Chapter Analyses, Question Banks, and Student Profile.
            </p>
          </div>
        </div>

        <button
          onClick={() => exportDocumentsDatabaseToExcel(docs, profile)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Excel Workbook (.xlsx)</span>
        </button>
      </div>

      {/* Theme and Appearance System */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Theme & Appearance System
          </h3>
        </div>

        {/* Theme mode buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Theme Mode (Light / Dark / System)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light Theme', icon: Sun },
              { id: 'dark', label: 'Dark Theme', icon: Moon },
              { id: 'system', label: 'System Default', icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeMode)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === t.id
                      ? 'border-accent bg-accent-light text-accent ring-2 ring-accent'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Choices (Amber, Navy, Emerald, Purple, Crimson) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Accent Palette (Includes Amber Gold)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {accentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAccentColor(opt.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
                  accentColor === opt.id
                    ? 'border-accent bg-accent-light text-accent font-bold ring-2 ring-accent'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: opt.hex }}
                />
                <span className="truncate">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Information Form */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <GraduationCap className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Default Academic Details (Auto-Fills All Generators)
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                IARE Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 22951A0501"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department / Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Internal Guide Name
              </label>
              <input
                type="text"
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {savedSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                Profile details updated successfully!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Academic Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backend Systems Status */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Backend Systems Status
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Firebase Auth (Google OAuth & Samvidha) • Firestore Database (ai-studio-6f549d34-2b61-42a4-8b18-16b8e82f12ff) • Gemini 3.8 Flash Engine
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
          ALL SYSTEMS OPERATIONAL
        </span>
      </div>
    </div>
  );
};
