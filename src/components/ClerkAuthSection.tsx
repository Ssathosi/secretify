/**
 * ClerkAuthSection.tsx — Clerk-specific auth UI
 * This component uses useAuth/useUser from @clerk/clerk-react.
 * It must ONLY be rendered when wrapped inside <ClerkProvider>.
 * It is lazy-loaded by AuthView.tsx only when a valid Clerk key is configured.
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { PixelAvatar } from './BrutalComponents';
import { useAuth, useUser, SignIn, SignUp } from '@clerk/clerk-react';
import type { AuthUser } from './AuthView';

const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';

const AVATAR_PRESETS = [
  'detective', 'cat', 'boy1', 'girl1', 'ninja', 'robot',
  'alien', 'pirate', 'wizard', 'vampire', 'zombie', 'ghost'
];

interface ClerkAuthSectionProps {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onContinueAsGuest: () => void;
  language: 'ID' | 'EN';
}

// Context to expose fresh Clerk token getter to parent components
interface ClerkContextValue {
  getFreshToken: () => Promise<string | null>;
  isClerkUser: boolean;
}

export const ClerkContext = React.createContext<ClerkContextValue | null>(null);

export const useClerkContext = () => React.useContext(ClerkContext);

export const ClerkAuthSection: React.FC<ClerkAuthSectionProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
  language
}) => {
  const { getToken, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showSyncPicker, setShowSyncPicker] = useState(false);
  const [syncUsername, setSyncUsername] = useState('');
  const [syncAvatar, setSyncAvatar] = useState('detective');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard against React Strict Mode double-invoke and multiple sign-in events
  const syncCalledRef = useRef(false);

  // Keep the Clerk token in localStorage fresh (Clerk JWTs expire quickly)
  useEffect(() => {
    if (!isSignedIn || !getToken) return;
    let cancelled = false;
    const refresh = async () => {
      const freshToken = await getToken();
      if (!cancelled && freshToken) {
        localStorage.setItem('secretify_token', freshToken);
      }
    };
    // Refresh immediately and then every 45 seconds (tokens last ~60s)
    refresh();
    const interval = setInterval(refresh, 45_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isSignedIn, getToken]);

  // Trigger sync once the user is signed in via Clerk
  useEffect(() => {
    if (isSignedIn && clerkUser && !syncCalledRef.current) {
      syncCalledRef.current = true;
      checkOrCreateSync();
    }
    // Reset guard if user signs out
    if (!isSignedIn) {
      syncCalledRef.current = false;
    }
  }, [isSignedIn, clerkUser]);

  const checkOrCreateSync = async (chosenAvatar?: string, chosenUsername?: string) => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('No Clerk token');

      const res = await fetch(`${SERVER_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: chosenUsername || clerkUser?.username || clerkUser?.firstName || '',
          avatar: chosenAvatar || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');

      if (data.user) {
        // Only show the avatar picker for BRAND NEW users (isNew === true)
        // Returning users go straight to the main menu
        if (data.isNew && !chosenAvatar) {
          setSyncUsername(data.user.username || '');
          setSyncAvatar(data.user.avatar || 'detective');
          setShowSyncPicker(true);
          setLoading(false);
          return;
        }

        localStorage.setItem('secretify_token', token);
        localStorage.setItem('secretify_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, token);
      }
    } catch (err: any) {
      console.error('[Clerk Sync Error]', err);
      // Reset guard so user can try again
      syncCalledRef.current = false;
      setError(err?.message || (language === 'ID'
        ? 'Gagal menyinkronkan akun dengan game.'
        : 'Failed to sync your account with the game.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncUsername.trim()) return;
    checkOrCreateSync(syncAvatar, syncUsername.trim());
  };

  const clerkAppearance = {
    variables: {
      colorPrimary: '#DFFF00',
      colorBackground: '#1E2A3A',
      colorText: '#ffffff',
      colorTextSecondary: '#94a3b8',
      colorInputBackground: '#12182B',
      colorInputText: '#ffffff',
      colorBorder: '#000000',
    },
    elements: {
      card: 'border-3 border-black shadow-[6px_6px_0px_#DFFF00] rounded-2xl bg-[#1E2A3A]',
      headerTitle: 'font-black uppercase tracking-tight text-white',
      headerSubtitle: 'text-slate-400 text-xs font-mono',
      formButtonPrimary:
        'bg-black text-[#DFFF00] border-2 border-black font-black uppercase shadow-[4px_4px_0px_#DFFF00] hover:shadow-[2px_2px_0px_#DFFF00] transition-all cursor-pointer',
      footerActionLink: 'text-[#DFFF00] hover:text-[#c4e000] font-bold',
      formFieldInput:
        'border-2 border-black rounded-lg bg-[#12182B] text-white focus:ring-2 focus:ring-[#DFFF00]',
      dividerText: 'text-slate-400 font-mono text-xs',
    },
  };

  // Expose fresh token getter for API calls
  const contextValue: ClerkContextValue = {
    getFreshToken: getToken,
    isClerkUser: true,
  };

  // ── Loading overlay while syncing ──
  if (loading) {
    return (
      <ClerkContext.Provider value={contextValue}>
        <div className="min-h-dvh bg-[#12182B] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#DFFF00] border-4 border-black rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-[4px_4px_0px_#FF6B35]">
              <span className="text-3xl">🔐</span>
            </div>
            <p className="text-[#DFFF00] font-mono font-black text-sm uppercase tracking-wider animate-pulse">
              {language === 'ID' ? 'Menyinkronkan akun...' : 'Syncing your account...'}
            </p>
          </div>
        </div>
      </ClerkContext.Provider>
    );
  }

  // ── Screen: Avatar & Username picker (first-time users only) ──
  if (showSyncPicker) {
    return (
      <ClerkContext.Provider value={contextValue}>
        <div className="min-h-dvh bg-[#12182B] flex items-center justify-center px-4 py-8 select-none">
          <div className="w-full max-w-[420px] space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#DFFF00] border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_#FF6B35]">
                <span className="text-4xl">🎭</span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {language === 'ID' ? 'Pilih Profil Game' : 'Pick Game Profile'}
              </h1>
              <p className="text-slate-400 text-xs mt-2 font-mono">
                {language === 'ID'
                  ? 'Tentukan nama detektif & avatar kamu!'
                  : 'Define your detective name and avatar!'}
              </p>
            </div>

            <form
              onSubmit={handleSyncSubmit}
              className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#DFFF00] space-y-4"
            >
              <div>
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-2">
                  {language === 'ID' ? 'Pilih Avatar' : 'Choose Avatar'}
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSyncAvatar(av)}
                      className={`rounded-lg border-2 p-0.5 transition-all ${
                        syncAvatar === av
                          ? 'border-black bg-[#DFFF00] shadow-[2px_2px_0px_#000] scale-105'
                          : 'border-black/20 hover:border-black'
                      }`}
                    >
                      <PixelAvatar avatar={av} size="xs" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                  {language === 'ID' ? 'Nama Tampilan Game' : 'In-game Name'}
                </label>
                <input
                  type="text"
                  value={syncUsername}
                  onChange={(e) => setSyncUsername(e.target.value)}
                  required
                  maxLength={20}
                  placeholder="detektif_hebat"
                  className="w-full border-2 border-black rounded-lg px-3 py-2.5 font-mono font-bold text-sm bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-[#DFFF00] border-2 border-black rounded-xl font-mono font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#DFFF00] hover:shadow-[2px_2px_0px_#DFFF00] transition-all cursor-pointer disabled:opacity-50"
              >
                {language === 'ID' ? '🚀 Mulai Petualangan!' : '🚀 Start Adventure!'}
              </button>
            </form>
          </div>
        </div>
      </ClerkContext.Provider>
    );
  }

  // ── Screen: Clerk Sign In / Sign Up ──
  return (
    <ClerkContext.Provider value={contextValue}>
      <div className="min-h-dvh bg-[#12182B] flex items-center justify-center px-4 py-8 select-none">
        <div className="w-full max-w-[420px] space-y-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-[#DFFF00] border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-[4px_4px_0px_#FF6B35]">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
              Secretify Secured Auth
            </h1>
          </div>

          {mode === 'login' ? (
            <>
              <SignIn appearance={clerkAppearance} routing="hash" />
              <div className="text-center mt-3">
                <button
                  onClick={() => setMode('register')}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  {language === 'ID' ? 'Belum punya akun? Daftar' : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          ) : (
            <>
              <SignUp appearance={clerkAppearance} routing="hash" />
              <div className="text-center mt-3">
                <button
                  onClick={() => setMode('login')}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  {language === 'ID' ? 'Sudah punya akun? Masuk' : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-950/50 border-2 border-red-800 rounded-lg px-3 py-2 text-xs text-red-400 font-semibold font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="text-center pt-2">
            <button
              onClick={onContinueAsGuest}
              className="text-slate-400 hover:text-white text-xs font-mono underline block mx-auto"
            >
              {language === 'ID' ? 'Lanjut sebagai Tamu' : 'Continue as Guest'}
            </button>
          </div>
        </div>
      </div>
    </ClerkContext.Provider>
  );
};
