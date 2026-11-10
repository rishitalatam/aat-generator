import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testFirestoreConnection } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { UserAcademicProfile, ThemeMode, AccentColor } from '../types/academic';

export type AuthMethod = 'google' | 'samvidha' | null;

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserAcademicProfile | null;
  loading: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;
  authMethod: AuthMethod;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  signInWithGoogle: () => Promise<void>;
  loginWithSamvidha: (rollNumber: string, pinOrPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateAcademicProfile: (updates: Partial<UserAcademicProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function deduceBranchFromRoll(roll: string): string {
  const upper = roll.toUpperCase();
  if (upper.includes('A05') || upper.includes('B05')) return 'Computer Science and Engineering';
  if (upper.includes('A66') || upper.includes('B66')) return 'CSE (AI & Machine Learning)';
  if (upper.includes('A67') || upper.includes('B67')) return 'CSE (Data Science)';
  if (upper.includes('A62') || upper.includes('B62')) return 'CSE (Cyber Security)';
  if (upper.includes('A12') || upper.includes('B12')) return 'Information Technology';
  if (upper.includes('A04') || upper.includes('B04')) return 'Electronics and Communication Engineering';
  if (upper.includes('A02') || upper.includes('B02')) return 'Electrical and Electronics Engineering';
  if (upper.includes('A03') || upper.includes('B03')) return 'Mechanical Engineering';
  if (upper.includes('A21') || upper.includes('B21')) return 'Aeronautical Engineering';
  if (upper.includes('A01') || upper.includes('B01')) return 'Civil Engineering';
  return 'Computer Science and Engineering';
}

const DEFAULT_PROFILE_FIELDS: Partial<UserAcademicProfile> = {
  rollNumber: '22951A0501',
  branch: 'Computer Science and Engineering',
  section: 'A',
  program: 'B.Tech',
  courseCode: 'CS401PC',
  courseName: 'Design and Analysis of Algorithms',
  guideName: 'Dr. K. Srinivasa Rao',
  guideDesignation: 'Professor & Head',
  theme: 'system',
  accentColor: 'navy',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserAcademicProfile | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [loading, setLoading] = useState(true);

  // Initialize theme
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('iare_theme') as ThemeMode) || 'system';
  });

  // Initialize accent
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    return (localStorage.getItem('iare_accent') as AccentColor) || 'navy';
  });

  // Apply Theme Mode (Light / Dark / System)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();
    localStorage.setItem('iare_theme', theme);

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Apply Accent Color (Navy, Amber, Emerald, Purple, Crimson)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-accent', accentColor);
    body.setAttribute('data-accent', accentColor);
    localStorage.setItem('iare_accent', accentColor);
  }, [accentColor]);

  // Auth state listener: check Samvidha first, then Firebase
  useEffect(() => {
    testFirestoreConnection();

    // Check existing Samvidha session in localStorage
    const savedSamvidha = localStorage.getItem('iare_samvidha_session');
    if (savedSamvidha) {
      try {
        const parsed = JSON.parse(savedSamvidha);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setAuthMethod('samvidha');
        if (parsed.profile?.theme) setThemeState(parsed.profile.theme);
        if (parsed.profile?.accentColor) setAccentColorState(parsed.profile.accentColor);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse samvidha session:', e);
        localStorage.removeItem('iare_samvidha_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
        setAuthMethod('google');

        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserAcademicProfile;
            setProfile(data);
            if (data.theme) setThemeState(data.theme);
            if (data.accentColor) setAccentColorState(data.accentColor);
          } else {
            // First time user profile creation
            const newProfile: UserAcademicProfile = {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'IARE Student',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              ...DEFAULT_PROFILE_FIELDS,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        if (!localStorage.getItem('iare_samvidha_session')) {
          setUser(null);
          setProfile(null);
          setAuthMethod(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (user && profile) {
      updateAcademicProfile({ theme: newTheme }).catch(console.error);
    }
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
    if (user && profile) {
      updateAcademicProfile({ accentColor: newAccent }).catch(console.error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithSamvidha = async (rollNumber: string, pinOrPassword: string) => {
    const cleanRoll = rollNumber.trim().toUpperCase();
    if (!cleanRoll || cleanRoll.length < 5) {
      throw new Error('Please enter a valid IARE Roll Number (e.g., 22951A0501)');
    }
    if (!pinOrPassword || pinOrPassword.length < 3) {
      throw new Error('Please enter your Samvidha password or PIN');
    }

    setLoading(true);
    try {
      const branchName = deduceBranchFromRoll(cleanRoll);
      const uid = `samvidha_${cleanRoll.toLowerCase()}`;

      const samvidhaUser: AppUser = {
        uid,
        displayName: `${cleanRoll}`,
        email: `${cleanRoll.toLowerCase()}@iare.ac.in`,
        photoURL: null,
      };

      const samvidhaProfile: UserAcademicProfile = {
        userId: uid,
        displayName: `Student ${cleanRoll}`,
        email: `${cleanRoll.toLowerCase()}@iare.ac.in`,
        rollNumber: cleanRoll,
        branch: branchName,
        section: 'A',
        program: 'Bachelor of Technology (B.Tech)',
        courseCode: 'CS401PC',
        courseName: 'Design and Analysis of Algorithms',
        guideName: 'Dr. K. Srinivasa Rao',
        guideDesignation: 'Professor & Head',
        theme,
        accentColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if existing profile saved for this roll in localStorage
      const localProfileKey = `iare_samvidha_profile_${uid}`;
      const existingSaved = localStorage.getItem(localProfileKey);
      let activeProfile = samvidhaProfile;
      if (existingSaved) {
        try {
          activeProfile = { ...samvidhaProfile, ...JSON.parse(existingSaved) };
        } catch {}
      } else {
        localStorage.setItem(localProfileKey, JSON.stringify(samvidhaProfile));
      }

      setProfile(activeProfile);
      setUser(samvidhaUser);
      setAuthMethod('samvidha');

      // Save active session to localStorage
      localStorage.setItem(
        'iare_samvidha_session',
        JSON.stringify({ user: samvidhaUser, profile: activeProfile })
      );
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('iare_samvidha_session');
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
      setAuthMethod(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      setUser(null);
      setProfile(null);
      setAuthMethod(null);
    }
  };

  const updateAcademicProfile = async (updates: Partial<UserAcademicProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));

    if (authMethod === 'samvidha' || !auth.currentUser) {
      const stored = localStorage.getItem('iare_samvidha_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.profile = { ...parsed.profile, ...updatedData };
          localStorage.setItem('iare_samvidha_session', JSON.stringify(parsed));
          localStorage.setItem(`iare_samvidha_profile_${user.uid}`, JSON.stringify(parsed.profile));
        } catch {}
      }
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updatedData);
    } catch (error) {
      console.warn('Firestore update warning:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        theme,
        accentColor,
        authMethod,
        setTheme,
        setAccentColor,
        signInWithGoogle,
        loginWithSamvidha,
        signOut,
        updateAcademicProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
