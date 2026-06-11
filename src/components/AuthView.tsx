/**
 * AuthView.tsx — Secretify Login & Register Screen
 * Routes to Clerk auth UI or local database fallback depending on configuration.
 */

import React, { useState, Suspense } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { PixelAvatar } from './BrutalComponents';

const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';
const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';
export const isValidClerkKey =
  PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_');

export interface AuthUser {
  id: string;
  username: string;
  avatar: string;
  points: number;
  level: number;
  coins?: number;
}

const AVATAR_PRESETS = [
  'detective', 'cat', 'boy1', 'girl1', 'ninja', 'robot',
  'alien', 'pirate', 'wizard', 'vampire', 'zombie', 'ghost'
];

export interface AuthViewProps {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onContinueAsGuest: () => void;
  language: 'ID' | 'EN';
}

// Lazy-load the Clerk component so it only imports when Clerk is configured.
// This ensures useAuth/useUser are never called outside <ClerkProvider>.
const LazyClerkAuthSection = isValidClerkKey
  ? React.lazy(() =>
      import('./ClerkAuthSection').then((m) => ({ default: m.ClerkAuthSection }))
    )
  : null;

// ── Local database auth fallback ──
const LocalAuthForm: React.FC<AuthViewProps> = ({ onAuthSuccess, onContinueAsGuest, language }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('detective');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: Record<string, string> = { username: username.trim(), password };
      if (mode === 'register') body.avatar = selectedAvatar;

      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Terjadi kesalahan.'); return; }
      if (mode === 'register') {
        setSuccess(language === 'ID' ? 'Akun berhasil dibuat! Silakan login.' : 'Account created! Please log in.');
        setMode('login');
        setPassword('');
      } else {
        localStorage.setItem('secretify_token', data.token);
        localStorage.setItem('secretify_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch {
      setError(language === 'ID' ? 'Tidak dapat terhubung ke server.' : 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#12182B] flex items-center justify-center px-4 py-8 select-none">
      <div className="w-full max-w-[420px] space-y-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#DFFF00] border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_#FF6B35] rotate-3">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            {mode === 'login'
              ? (language === 'ID' ? 'Masuk ke Akun' : 'Log Into Account')
              : (language === 'ID' ? 'Buat Akun Baru' : 'Create New Account')}
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-mono">
            {language === 'ID' ? 'Simpan progres & poin kamu' : 'Save your progress & points'}
          </p>
        </div>

        <div className="flex border-3 border-black rounded-xl overflow-hidden bg-[#1E2A3A]">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all ${mode === 'login' ? 'bg-[#DFFF00] text-black' : 'text-slate-400 hover:text-white'}`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
            {language === 'ID' ? 'Masuk' : 'Login'}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all ${mode === 'register' ? 'bg-[#DFFF00] text-black' : 'text-slate-400 hover:text-white'}`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
            {language === 'ID' ? 'Daftar' : 'Register'}
          </button>
        </div>

        <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#DFFF00] space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-2">
                {language === 'ID' ? 'Pilih Avatar' : 'Choose Avatar'}
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {AVATAR_PRESETS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`rounded-lg border-2 p-0.5 transition-all ${selectedAvatar === av ? 'border-black bg-[#DFFF00] shadow-[2px_2px_0px_#000] scale-105' : 'border-black/20 hover:border-black'}`}
                  >
                    <PixelAvatar avatar={av} size="xs" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                {language === 'ID' ? 'Nama Pengguna' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={20}
                placeholder="detective_andi"
                className="w-full border-2 border-black rounded-lg px-3 py-2.5 font-mono font-bold text-sm bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-2 border-black rounded-lg px-3 py-2.5 pr-10 font-mono font-bold text-sm bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-lg px-3 py-2 text-xs text-green-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-[#DFFF00] border-2 border-black rounded-xl font-mono font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#DFFF00] hover:shadow-[2px_2px_0px_#DFFF00] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? '🔓 Log In' : '🚀 Register'}
            </button>
          </form>
        </div>

        <div className="text-center space-y-2">
          <button
            onClick={onContinueAsGuest}
            className="text-slate-400 hover:text-white text-xs font-mono underline block mx-auto"
          >
            {language === 'ID' ? 'Lanjut sebagai Tamu (tanpa simpan poin)' : 'Continue as Guest (no points saved)'}
          </button>
          
          <button
            type="button"
            id="dev-bypass-btn"
            onClick={() => {
              const mockUser = {
                id: 'local_test_user_id_12345',
                username: 'Test_Local_Agent',
                avatar: 'ninja',
                points: 1200,
                level: 4
              };
              const token = 'mock_local_jwt_token_for_e2e_tests';
              localStorage.setItem('secretify_token', token);
              localStorage.setItem('secretify_user', JSON.stringify(mockUser));
              onAuthSuccess(mockUser, token);
            }}
            className="mt-1 px-4 py-2 border-2 border-dashed border-red-500 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
          >
            🚧 DEV BYPASS LOGIN 🚧
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main exported AuthView ──
export const AuthView: React.FC<AuthViewProps> = (props) => {
  if (isValidClerkKey && LazyClerkAuthSection) {
    return (
      <Suspense fallback={
        <div className="min-h-dvh bg-[#12182B] flex items-center justify-center">
          <div className="text-[#DFFF00] font-mono font-black animate-pulse">Loading...</div>
        </div>
      }>
        <LazyClerkAuthSection {...props} />
      </Suspense>
    );
  }

  return <LocalAuthForm {...props} />;
};

// ── Helpers ──
export function loadSavedAuth(): { user: AuthUser; token: string } | null {
  try {
    const token = localStorage.getItem('secretify_token');
    const raw = localStorage.getItem('secretify_user');
    if (!token || !raw) return null;
    return { user: JSON.parse(raw) as AuthUser, token };
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('secretify_token');
  localStorage.removeItem('secretify_user');
}
