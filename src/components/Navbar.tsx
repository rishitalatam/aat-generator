import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IareLogo } from './IareLogo';
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  LogOut,
  User as UserIcon,
  Sparkles,
  BookOpen,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { AccentColor, ThemeMode } from '../types/academic';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, profile, theme, accentColor, authMethod, setTheme, setAccentColor, signOut } = useAuth();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const colors: { id: AccentColor; name: string; bg: string; border: string }[] = [
    { id: 'amber', name: 'Amber Gold (IARE)', bg: 'bg-amber-500', border: 'border-amber-500' },
    { id: 'navy', name: 'IARE Navy', bg: 'bg-[#0B3B60]', border: 'border-blue-800' },
    { id: 'emerald', name: 'Emerald Scholar', bg: 'bg-emerald-600', border: 'border-emerald-600' },
    { id: 'purple', name: 'Royal Purple', bg: 'bg-purple-600', border: 'border-purple-600' },
    { id: 'crimson', name: 'Crimson Tech', bg: 'bg-rose-600', border: 'border-rose-600' },
  ];

  const cycleTheme = () => {
    const sequence: ThemeMode[] = ['light', 'dark', 'system'];
    const nextIdx = (sequence.indexOf(theme) + 1) % sequence.length;
    setTheme(sequence[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2"
        >
          <IareLogo size="md" />
        </div>

        {/* Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 3.8 Flash • Online</span>
          </div>

          {/* Accent Color Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Change Accent Color (Amber, Navy, Emerald, Purple, Crimson)"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Palette className="w-4 h-4 text-accent" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent ring-1 ring-black/20" />
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 mt-2 w-52 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowColorPicker(false)}
              >
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                  Select Accent Color
                </div>
                <div className="space-y-1 mt-1">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setAccentColor(c.id);
                        setShowColorPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        accentColor === c.id
                          ? 'bg-accent-light text-accent font-bold ring-1 ring-accent'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0 ring-2 ring-white/50`} />
                        <span>{c.name}</span>
                      </div>
                      {accentColor === c.id && <span className="text-[10px] font-mono">Active</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button (Light / Dark / System) */}
          <button
            onClick={cycleTheme}
            title={`Current theme: ${theme.toUpperCase()}. Click to switch between Light, Dark, and System mode.`}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Laptop className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">System</span>
              </>
            )}
          </button>

          {/* User Profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Student'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-accent"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                    {user.displayName || profile?.displayName || 'Student'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {authMethod === 'samvidha' ? 'Samvidha' : 'Google'} • {profile?.rollNumber || 'IARE'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      {authMethod === 'samvidha' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Samvidha Authenticated
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                          Google Authenticated
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user.displayName || profile?.displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1.5 inline-block text-[11px] font-mono bg-accent-light text-accent px-2 py-0.5 rounded border border-accent">
                      Roll: {profile?.rollNumber || 'Not set'} • Sec {profile?.section || 'A'}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                    >
                      <UserIcon className="w-4 h-4 text-accent" />
                      Academic Profile & Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('documents');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      My Documents & History (Excel)
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
