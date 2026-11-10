import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IareLogo } from './IareLogo';
import {
  Sparkles,
  Presentation,
  FileCheck2,
  FileText,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  KeyRound,
  RotateCw,
  AlertCircle,
} from 'lucide-react';

interface LandingHeroViewProps {
  onExploreGuest?: () => void;
}

export const LandingHeroView: React.FC<LandingHeroViewProps> = ({ onExploreGuest }) => {
  const { signInWithGoogle, loginWithSamvidha, loading } = useAuth();

  const [activeLoginTab, setActiveLoginTab] = useState<'samvidha' | 'google'>('samvidha');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [samvidhaError, setSamvidhaError] = useState<string | null>(null);
  const [samvidhaLoading, setSamvidhaLoading] = useState(false);

  const handleSamvidhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSamvidhaError(null);
    setSamvidhaLoading(true);

    try {
      await loginWithSamvidha(rollNumber, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSamvidhaError(msg);
    } finally {
      setSamvidhaLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <IareLogo size="xl" showText={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-light border border-accent text-xs font-semibold text-accent">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>IARE Autonomous • Academic AI Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          IARE SMART <span className="text-accent">ACADEMIC AI</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Your All-in-One AI Academic Assistant. Log in with your <strong>IARE Samvidha Roll Number</strong> or Google account to generate AAT PPTs, assignments, and CEP project reports.
        </p>
      </div>

      {/* Dual Login Card */}
      <div className="max-w-md mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Login Method Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveLoginTab('samvidha')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeLoginTab === 'samvidha'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>Samvidha Portal</span>
          </button>

          <button
            onClick={() => setActiveLoginTab('google')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeLoginTab === 'google'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        <div className="p-6">
          {activeLoginTab === 'samvidha' ? (
            <form onSubmit={handleSamvidhaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IARE Roll Number
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22951A0501"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Samvidha Password / PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password or PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {samvidhaError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{samvidhaError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={samvidhaLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {samvidhaLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Signing in via Samvidha...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In via Samvidha</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log in directly using your authorized Google Account. Seamless authentication with Google Sign-in popup.
              </p>

              <button
                onClick={() => signInWithGoogle()}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {onExploreGuest && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={onExploreGuest}
                className="text-xs text-slate-500 hover:text-accent font-semibold"
              >
                Explore Dashboard in Demo Mode →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security assurances */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          Zero plain-text passwords stored
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          IARE Samvidha Roll No & Google OAuth
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
          Direct DOCX, PPTX & Excel Downloads
        </span>
      </div>

      {/* Feature showcase grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Presentation,
            title: 'AAT PPT Generator',
            desc: 'Slide-wise structured presentations with IARE title card, notes, and PPTX download.',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/60',
          },
          {
            icon: FileCheck2,
            title: '10-Question AAT',
            desc: 'Continuous internal assessment workflow mapped to Bloom’s Taxonomy and Course Outcomes.',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          },
          {
            icon: FileText,
            title: 'CEP Project Report',
            desc: 'Authoritative 15-25 page project report: self-assessment, prelims, 5 chapters, and IEEE citations.',
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/60',
          },
          {
            icon: Briefcase,
            title: 'Case Study Generator',
            desc: 'Rigorous engineering problem analysis, comparative solution matrix, and roadmap.',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/60',
          },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
