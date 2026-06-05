/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Plus, ArrowRight, Copy, Users, HelpCircle, Volume2, Shield, Gift, Clipboard, RefreshCw, X, Check, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Player, ShopItem } from '../types';
import { BilingualText, BrutalButton, BrutalCard, PixelAvatar, BrutalBadge, ScallopLine } from './BrutalComponents';
import { SPECIAL_ROLES_CATALOG, SpecialRoleMeta } from './MetaScreens';

// SPLASH SCREEN
interface SplashViewProps {
  onNext: () => void;
  language: 'ID' | 'EN';
  toggleLanguage: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onNext, language, toggleLanguage }) => {
  const [loadingProgress, setLoadingProgress] = useState(35);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-[#12182B] text-white select-none overflow-hidden relative">
      {/* Decorative Stars */}
      <div className="absolute top-10 left-10 text-white/10 text-l font-mono"><svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg></div>
      <div className="absolute top-1/3 right-10 text-white/5 text-xl font-mono"><svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg></div>
      <div className="absolute bottom-1/4 left-1/4 text-white/10 text-2xl"><svg viewBox="0 0 24 24" className="w-4 h-4 inline" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg></div>

      {/* Floating Header */}
      <div className="p-6 flex justify-between items-center z-10">
        <div className="font-mono text-[#DFFF00] font-bold text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-black">
          v1.0.0
        </div>
        <button
          onClick={toggleLanguage}
          className="bg-white text-black text-xs font-mono font-bold px-3 py-1.5 rounded-lg border-2 border-black hover:bg-[#F0EDE6] brutal-shadow"
        >
          {language === 'ID' ? 'IDN ' : 'ENG '}<ArrowRight className="w-3.5 h-3.5 inline" />{language === 'ID' ? ' ENG' : ' IDN'}
        </button>
      </div>

      {/* Display Card Frame */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 max-w-[500px] mx-auto w-full">
        <div className="relative mb-8 w-28 h-28 transform rotate-6 border-[3px] border-black bg-[#DFFF00] flex items-center justify-center brutal-shadow">
          <span className="font-mono text-5xl font-extrabold text-black">?</span>
          <div className="absolute bottom-[2px] right-[2px] bg-black text-white text-[9px] px-1 font-mono font-bold">
            SEC
          </div>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tighter text-white uppercase text-center mb-1 select-none">
          SECRETIFY
        </h1>

        <div className="h-1 w-20 bg-[#DFFF00] mb-8" />

        {/* Loading segment */}
        <div className="w-full bg-slate-900 border-3 border-black p-5 rounded-2xl brutal-shadow mb-8 text-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:10px_10px]">
          <BilingualText
            idText="Memuat game..."
            enText="Loading assets & assets..."
            className="items-center text-sm font-semibold mb-3 text-white"
            enClassName="text-slate-400"
          />

          {/* Progress bar */}
          <div className="w-full h-6 bg-white border-2 border-black rounded-lg overflow-hidden relative brutal-shadow-sm">
            <div
              className="h-full bg-[#DFFF00] transition-all duration-300 border-r-2 border-black"
              style={{ width: `${loadingProgress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-black font-extrabold">
              {loadingProgress}%
            </span>
          </div>
        </div>

        <BrutalButton
          variant="lime"
          size="lg"
          idLabel="LANJUT / MENDAFTAR"
          enLabel="CLICK TO CONTINUE"
          onClick={onNext}
          className="w-full max-w-xs animate-bounce"
          icon={<Play className="w-4 h-4 fill-black text-black" />}
        />
      </div>

      {/* Scallop transition at bottom */}
      <div className="absolute bottom-0 left-0 w-full rotate-180">
        <ScallopLine color="#F7F4EE" />
      </div>
    </div>
  );
};


// ONBOARDING SCREEN
interface OnboardingViewProps {
  onComplete: () => void;
  language: 'ID' | 'EN';
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, language }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      titleID: 'Selamat Datang di Secretify',
      titleEN: 'Welcome to Secretify',
      descID: 'Game deduksi sosial paling menegangkan untuk kamu dan teman-temanmu secara langsung atau online.',
      descEN: 'The ultimate thrilling social deduction game for you and your friends, in person or online.',
      color: '#2EC4B6', // Teal
      icon: <Users className="w-12 h-12 text-black" />,
      tagID: 'PERTAHANAN SOSIAL',
      tagEN: 'SOCIAL PARTY'
    },
    {
      titleID: 'Sipil vs Penyamar',
      titleEN: 'Civilian vs Undercover',
      descID: 'Dapatkan kata rahasiamu, diskusikan petunjuk seputar katamu, tapi waspada agar rahasiamu tidak bocor!',
      descEN: 'Get your secret codeword, discuss clues around it, but stay alert to keep your secret role hidden!',
      color: '#FF6B35', // Coral
      icon: <HelpCircle className="w-12 h-12 text-black" />,
      tagID: 'DEBAT KATA',
      tagEN: 'WORD UNION'
    },
    {
      titleID: 'Mr. White sang Misteri',
      titleEN: 'The Mysterious Mr. White',
      descID: 'Mr. White tidak punya kata sama sekali! Gunakan obrolan sivil untuk menebak apa kata kuncinya.',
      descEN: 'Mr. White gets absolutely no words! Infiltrate civilian chatter to deduce the secret word.',
      color: '#FFD23F', // Sunflower
      icon: <Shield className="w-12 h-12 text-black" />,
      tagID: 'PENYAMARAN MUTLAK',
      tagEN: 'SECRET STRATEGY'
    },
    {
      titleID: 'Ayo Mulai Bermain!',
      titleEN: "Let's Get Started!",
      descID: 'Pilih nama samaranmu, buat atau gabung ke ruangan, dan mulailah bersenang-senang!',
      descEN: 'Choose your agent alias, create or enter a custom room code, and claim your victory!',
      color: '#DFFF00', // Lime
      icon: <Sparkles className="w-12 h-12 text-black" />,
      tagID: 'KEMENANGAN TELAK',
      tagEN: 'CHALLENGE MODE'
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const current = slides[step];

  return (
    <div className="min-h-dvh bg-[#F7F4EE] flex flex-col px-4 py-6 select-none max-w-[1280px] mx-auto w-full justify-between">
      {/* Upper header action */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs text-slate-500 font-bold tracking-wide uppercase">
          Langkah / Step {step + 1} dari / of {slides.length}
        </span>
        <button
          onClick={onComplete}
          className="font-mono text-xs font-bold uppercase transition bg-white/70 hover:bg-black/5 rounded-lg px-3 py-1.5 border border-black/40 text-black"
        >
          {language === 'ID' ? 'LEWATI / Skip' : 'SKIP'} <ArrowRight className="w-3.5 h-3.5 inline" />
        </button>
      </div>

      {/* Main card */}
      <div className="my-auto py-8 max-w-[600px] mx-auto w-full">
        <BrutalCard bg="paper" className="p-8 border-3 border-black">
          {/* Header Colored box */}
          <div
            className="w-20 h-20 rounded-2xl border-3 border-black flex items-center justify-center brutal-shadow mb-6 mx-auto transform -rotate-3"
            style={{ backgroundColor: current.color }}
          >
            {current.icon}
          </div>

          <div className="text-center mb-6">
            <div className="inline-block bg-black text-white text-[10px] font-mono px-3 py-1 rounded-sm uppercase mb-4 tracking-wider font-extrabold">
              {language === 'ID' ? current.tagID : current.tagEN}
            </div>

            <h2 className="text-3xl font-extrabold text-black tracking-tight mb-3">
              {language === 'ID' ? current.titleID : current.titleEN}
            </h2>

            <p className="text-slate-600 font-sans text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              {language === 'ID' ? current.descID : current.descEN}
            </p>
          </div>

          {/* Dots navigation indicator */}
          <div className="flex gap-2.5 justify-center mb-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-4.5 rounded-sm border-2 border-black transition-all ${
                  i === step ? 'w-10 bg-[#FFD23F] brutal-shadow-sm' : 'w-4.5 bg-white'
                }`}
              />
            ))}
          </div>
        </BrutalCard>
      </div>

      {/* Persistent Proceed CTA */}
      <div className="max-w-[400px] mx-auto w-full pb-4">
        <BrutalButton
          variant={step === slides.length - 1 ? 'lime' : 'teal'}
          size="lg"
          idLabel={step === slides.length - 1 ? 'MULAI SEKARANG' : 'BERIKUTNYA'}
          enLabel={step === slides.length - 1 ? 'START IMMEDIATELY' : 'NEXT SLIDE'}
          onClick={handleNext}
          className="w-full"
          icon={<ArrowRight className="w-4 h-4 ml-1" />}
        />
      </div>
    </div>
  );
};


// LOGIN SCREEN — PRD Screen 03
// Autentikasi pemain: Google / Apple / Guest sign-in
interface LoginViewProps {
  onLogin: (name: string, avatar: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [guestStep, setGuestStep] = useState<'choose' | 'setup'>('choose');
  const [guestName, setGuestName] = useState('');
  const [guestAvatar, setGuestAvatar] = useState('detective');
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | 'guest' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const avatarPresets = ['detective', 'cat', 'spy', 'villain', 'hacker', 'boy1', 'girl1', 'boy2', 'glasses-girl', 'monster'];

  // Simulate OAuth loading then proceed
  const handleOAuth = (provider: 'google' | 'apple') => {
    setErrorMsg('');
    setIsLoading(provider);
    setTimeout(() => {
      setIsLoading(null);
      const name = provider === 'google' ? 'Agen_Google' : 'Agen_Apple';
      onLogin(name, 'detective');
    }, 1800);
  };

  const handleGuestContinue = () => {
    setErrorMsg('');
    if (!guestName.trim()) {
      setErrorMsg('Nama tidak boleh kosong / Name cannot be empty.');
      return;
    }
    setIsLoading('guest');
    setTimeout(() => {
      setIsLoading(null);
      onLogin(guestName.trim(), guestAvatar);
    }, 800);
  };

  const particles = [
    { top: '8%', left: '6%', size: 10, color: '#2EC4B6', rotate: 12 },
    { top: '15%', right: '8%', size: 14, color: '#FFD23F', rotate: -8 },
    { top: '72%', left: '4%', size: 8, color: '#FF6B35', rotate: 20 },
    { top: '80%', right: '6%', size: 12, color: '#DFFF00', rotate: -15 },
    { top: '45%', left: '2%', size: 6, color: '#9B5DE5', rotate: 5 },
    { top: '35%', right: '3%', size: 9, color: '#2EC4B6', rotate: -22 },
  ];

  return (
    <div className="min-h-dvh bg-[#F7F4EE] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden max-w-[1280px] mx-auto w-full">

      {/* Floating decorative particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="hidden lg:block absolute border-3 border-black rounded-lg brutal-shadow-sm"
          style={{
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            width: p.size * 4,
            height: p.size * 4,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      {/* Decorative doodle cards — desktop only */}
      <div className="hidden lg:block absolute top-12 left-16 w-28 border-3 border-black/15 p-3 rounded-xl rotate-6 bg-white/60 brutal-shadow-sm">
        <div className="w-8 h-8 bg-[#FF6B35] rounded border-2 border-black mb-2" />
        <div className="text-[9px] font-mono font-bold text-black/30 uppercase">AGENT_XP88</div>
        <div className="text-[8px] font-mono text-black/20">TRUST NO ONE</div>
      </div>
      <div className="hidden lg:block absolute bottom-16 right-16 w-28 border-3 border-black/15 p-3 rounded-xl -rotate-6 bg-white/60 brutal-shadow-sm">
        <div className="w-8 h-8 bg-[#DFFF00] rounded border-2 border-black mb-2" />
        <div className="text-[9px] font-mono font-bold text-black/30 uppercase">AGENT_BOS</div>
        <div className="text-[8px] font-mono text-black/20">REVEAL SECRET</div>
      </div>
      <div className="hidden lg:block absolute top-1/2 left-8 -translate-y-1/2 w-24 border-3 border-black/10 p-3 rounded-xl rotate-3 bg-white/50">
        <div className="text-2xl mb-1"><svg viewBox="0 0 24 24" className="w-8 h-8 mb-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8a3 3 0 0 1 3 3"/></svg></div>
        <div className="text-[8px] font-mono font-bold text-black/25 uppercase">UNDERCOVER</div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] relative z-10">

        {/* Logo + Tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#FFD23F] border-3 border-black rounded-xl flex items-center justify-center font-mono font-black text-2xl brutal-shadow rotate-3">
              S
            </div>
            <h1 className="text-4xl font-black tracking-tight text-black uppercase font-display">
              SECRETIFY
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-semibold italic leading-relaxed">
            "Trust No One. Reveal the Secret."
          </p>
        </div>

        {guestStep === 'choose' ? (
          <BrutalCard bg="paper" className="p-7 space-y-4">

            {/* Header */}
            <div className="text-center border-b-2 border-black/10 pb-4">
              <BilingualText
                idText="MASUK KE SECRETIFY"
                enText="SIGN IN TO CONTINUE"
                className="text-center items-center text-lg uppercase"
              />
            </div>

            {/* Error snackbar */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-2.5 text-red-700 text-xs font-mono font-bold">
                <X className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Google Sign-In */}
            <button
              onClick={() => handleOAuth('google')}
              disabled={isLoading !== null}
              className="w-full flex items-center gap-4 bg-white border-3 border-black rounded-xl px-5 py-4 brutal-shadow brutal-press hover:bg-slate-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading === 'google' ? (
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <div className="text-left flex-1">
                <span className="block font-bold text-sm text-gray-900 font-sans">
                  {isLoading === 'google' ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
                </span>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">
                  Continue with Google
                </span>
              </div>
              {isLoading !== 'google' && <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>

            {/* Apple Sign-In */}
            <button
              onClick={() => handleOAuth('apple')}
              disabled={isLoading !== null}
              className="w-full flex items-center gap-4 bg-black border-3 border-black rounded-xl px-5 py-4 brutal-shadow brutal-press hover:bg-gray-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading === 'apple' ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              <div className="text-left flex-1">
                <span className="block font-bold text-sm text-white font-sans">
                  {isLoading === 'apple' ? 'Menghubungkan...' : 'Lanjutkan dengan Apple'}
                </span>
                <span className="block text-[10px] font-mono text-white/50 uppercase">
                  Continue with Apple
                </span>
              </div>
              {isLoading !== 'apple' && <ArrowRight className="w-4 h-4 text-white/40 shrink-0" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-[2px] bg-black/10" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">atau / or</span>
              <div className="flex-1 h-[2px] bg-black/10" />
            </div>

            {/* Guest Play */}
            <button
              onClick={() => { setGuestStep('setup'); setErrorMsg(''); }}
              disabled={isLoading !== null}
              className="w-full flex items-center gap-4 bg-[#F0EDE6] border-3 border-black rounded-xl px-5 py-4 brutal-shadow brutal-press hover:bg-[#e8e4dc] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="text-left flex-1">
                <span className="block font-bold text-sm text-gray-900 font-sans">Main sebagai Tamu</span>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Play as Guest — no account needed</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Terms */}
            <p className="text-center text-[10px] text-slate-400 font-sans leading-relaxed pt-1">
              Dengan masuk, kamu menyetujui{' '}
              <button className="underline font-semibold text-slate-600 hover:text-black">Syarat & Ketentuan</button>
              {' '}dan{' '}
              <button className="underline font-semibold text-slate-600 hover:text-black">Kebijakan Privasi</button>
              {' '}kami.
              <br />
              <span className="text-[9px]">By signing in, you agree to our Terms & Privacy Policy.</span>
            </p>
          </BrutalCard>

        ) : (
          /* Guest Setup Step */
          <BrutalCard bg="paper" className="p-7 space-y-5">

            {/* Back + header */}
            <div className="flex items-center gap-3 border-b-2 border-black/10 pb-4">
              <button
                onClick={() => { setGuestStep('choose'); setErrorMsg(''); }}
                className="p-1.5 border-2 border-black rounded-lg bg-[#F0EDE6] brutal-shadow-sm brutal-press text-xs font-mono font-bold"
              >
                ←
              </button>
              <BilingualText
                idText="SETUP PROFIL TAMU"
                enText="GUEST PROFILE SETUP"
                className="text-sm uppercase"
              />
            </div>

            {/* Error snackbar */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-2.5 text-red-700 text-xs font-mono font-bold">
                <X className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Name input */}
            <div>
              <label className="block mb-2 text-[11px] font-mono font-bold uppercase text-slate-700">
                NAMA SAMARAN / AGENT ALIAS
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => { setGuestName(e.target.value); setErrorMsg(''); }}
                maxLength={18}
                placeholder="Masukkan nama... / Enter name..."
                autoFocus
                className="w-full border-3 border-black rounded-xl px-4 py-3 bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FFD23F] placeholder:text-gray-400 text-sm"
              />
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block mb-3 text-[11px] font-mono font-bold uppercase text-slate-700">
                PILIH AVATAR / CHOOSE CHARACTER
              </label>

              {/* Live preview */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <PixelAvatar avatar={guestAvatar} size="xl" />
                  <span className="absolute -bottom-2 -right-2 bg-black text-[#DFFF00] font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase border border-[#DFFF00] brutal-shadow-sm">
                    PREVIEW
                  </span>
                </div>
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-5 gap-2 p-2 bg-[#F0EDE6] border-2 border-black/15 rounded-xl">
                {avatarPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGuestAvatar(preset)}
                    className={`p-1 rounded-lg border-2 flex items-center justify-center transition-all ${
                      guestAvatar === preset
                        ? 'bg-[#FFD23F] border-black brutal-shadow-sm scale-105'
                        : 'bg-white border-black/30 hover:bg-black/5'
                    }`}
                  >
                    <div className="w-10 h-10 overflow-hidden rounded-md select-none">
                      <PixelAvatar avatar={preset} size="sm" className="w-full h-full border-none shadow-none" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest notice */}
            <div className="flex items-start gap-2.5 bg-[#FFD23F]/20 border-2 border-[#FFD23F] rounded-xl px-4 py-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-[#FFD23F]" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
                <strong className="text-black">Mode Tamu:</strong> Progres tidak tersimpan permanen. Hubungkan akun nanti untuk menyimpan data.
                <br /><span className="text-slate-400">Guest mode: progress won't be saved. Link an account later to keep your stats.</span>
              </p>
            </div>

            {/* Submit */}
            <BrutalButton
              variant="lime"
              size="lg"
              idLabel={isLoading === 'guest' ? 'MEMUAT...' : 'MASUK SEBAGAI TAMU'}
              enLabel={isLoading === 'guest' ? 'Loading...' : 'Play as Guest — Enter Game'}
              onClick={handleGuestContinue}
              disabled={isLoading !== null}
              className="w-full"
              icon={isLoading === 'guest'
                ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <ArrowRight className="w-4 h-4" />
              }
            />
          </BrutalCard>
        )}
      </div>
    </div>
  );
};
// GAME RULES OVERLAY MODAL
interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ID' | 'EN';
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute flat background overlay */}
      <div className="absolute inset-0 bg-[#12182B] opacity-85" onClick={onClose} />

      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
        <BrutalCard bg="paper" className="p-8 border-3 border-black text-black">
          {/* Header Row */}
          <div className="flex justify-between items-center border-b-3 border-black pb-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {language === 'ID' ? 'PERATURAN PERMAINAN' : 'GAME RULES'}
              </h2>
              <span className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">
                PANEL PETUNJUK RESMI / SYSTEM DOCUMENTATION V2
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-2.5 bg-red-100 text-red-600 font-bold border-2 border-black rounded-lg hover:bg-red-200 brutal-shadow-sm transition"
            >
              ✕
            </button>
          </div>

          {/* Section: Roles */}
          <div className="mb-8">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-700 bg-[#F0EDE6] px-3 py-1.5 border border-black inline-block mb-4 rounded-sm flex items-center gap-1">
              <Users className="w-4 h-4 inline mr-1" /> PERAN PEMAIN / PLAYER ROLES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Civic Role */}
              <BrutalCard bg="paper" className="p-4 border-2 border-black">
                <div className="flex items-center gap-3 mb-3 border-b border-black/10 pb-2">
                  <div className="w-10 h-10 aspect-square shrink-0">
                    <PixelAvatar avatar="boy2" size="sm" />
                  </div>
                  <BilingualText idText="SIPIL" enText="CIVILIAN" className="text-sm uppercase" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {language === 'ID'
                    ? 'Semua Sipil mendapatkan kata rahasia yang sama. Cari tahu siapa Penyamar di antara kalian!'
                    : 'All Civilians get the same secret codeword. Discuss cues to sniff out the Undercover spies!'}
                </p>
                <div className="mt-4 bg-[#DFFF00]/10 border border-[#DFFF05] px-2 py-1 rounded text-[10px] font-bold font-mono text-center">
                  STRICTLY IDENTICAL WORDS
                </div>
              </BrutalCard>

              {/* Undercover Role */}
              <BrutalCard bg="paper" className="p-4 border-2 border-black">
                <div className="flex items-center gap-3 mb-3 border-b border-black/10 pb-2">
                  <div className="w-10 h-10 aspect-square shrink-0">
                    <PixelAvatar avatar="spy" size="sm" />
                  </div>
                  <BilingualText idText="PENYAMAR" enText="UNDERCOVER" className="text-sm uppercase" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {language === 'ID'
                    ? 'Anda mendapatkan kata yang sedikit berbeda. Menyamarlah dan jangan sampai ketahuan!'
                    : 'You receive a slightly different but related word. Blurt clever descriptions and stay hidden!'}
                </p>
                <div className="mt-4 bg-[#FF6B35]/10 border border-[#FF6B35] px-2 py-1 rounded text-[10px] font-bold font-mono text-center text-red-700">
                  SLIGHTLY DIFFERENT WORD
                </div>
              </BrutalCard>

              {/* Mr. White Role */}
              <BrutalCard bg="paper" className="p-4 border-2 border-black">
                <div className="flex items-center gap-3 mb-3 border-b border-black/10 pb-2">
                  <div className="w-10 h-10 aspect-square shrink-0 flex items-center justify-center border-2 border-black bg-slate-900 rounded-md">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <BilingualText idText="MR. WHITE" enText="MR. WHITE" className="text-sm uppercase" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {language === 'ID'
                    ? 'Anda tidak mendapatkan kata apa pun. Tebak kata rahasia Sipil untuk memenangkan permainan!'
                    : 'You recieve no word at all. Listen carefully to civilian clues, try to guess their codeword to win!'}
                </p>
                <div className="mt-4 bg-[#FFD23F]/20 border border-black px-2 py-1 rounded text-[10px] font-bold font-mono text-center">
                  NO WORD GIVEN AT ALL
                </div>
              </BrutalCard>
            </div>
          </div>

          {/* Section: Game flow */}
          <div className="mb-8 p-5 bg-[#F0EDE6] rounded-2xl border-3 border-black">
            <h3 className="text-sm font-mono font-bold uppercase text-slate-800 mb-4">
              ALUR PERMAINAN / GAME FLOW
            </h3>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div className="flex-1 bg-white p-3.5 rounded-xl border-2 border-black max-w-[240px] w-full brutal-shadow-sm">
                <div className="inline-block bg-[#DFFF00] text-black font-mono text-xs font-extrabold px-1.5 py-0.5 rounded border border-black mb-1.5">
                  1
                </div>
                <BilingualText idText="DESKRIPSI" enText="DESCRIBE" className="text-xs uppercase mb-1" />
                <p className="text-[10px] text-slate-500 font-sans">
                  Sebutkan satu kata deskripsi untuk kata rahasia Anda.
                </p>
              </div>

              <div className="text-xl font-bold flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="flex-1 bg-white p-3.5 rounded-xl border-2 border-black max-w-[240px] w-full brutal-shadow-sm">
                <div className="inline-block bg-[#2EC4B6] text-black font-mono text-xs font-extrabold px-1.5 py-0.5 rounded border border-black mb-1.5">
                  2
                </div>
                <BilingualText idText="DISKUSI" enText="DISCUSS" className="text-xs uppercase mb-1" />
                <p className="text-[10px] text-slate-500 font-sans">
                  Diskusikan siapa yang terlihat mencurigakan di obrolan chat.
                </p>
              </div>

              <div className="text-xl font-bold flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="flex-1 bg-white p-3.5 rounded-xl border-2 border-black max-w-[240px] w-full brutal-shadow-sm">
                <div className="inline-block bg-[#FF6B35] text-white font-mono text-xs font-extrabold px-1.5 py-0.5 rounded border border-black mb-1.5">
                  3
                </div>
                <BilingualText idText="VOTING" enText="VOTE" className="text-xs uppercase mb-1" />
                <p className="text-[10px] text-slate-500 font-sans">
                  Pilih satu orang untuk dieliminasi dari permainan.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom closing CTA */}
          <div className="text-center pt-2">
            <BrutalButton
              variant="lime"
              size="lg"
              idLabel="SAYA PAHAM / MENGERTI"
              enLabel="UNDERSTOOD / LET'S GO"
              onClick={onClose}
              className="px-10"
              icon={<Check className="w-4 h-4 ml-1" />}
            />
          </div>
        </BrutalCard>
      </div>
    </div>
  );
};


// HOME VIEW INTERFACE
interface HomeViewProps {
  playerName: string;
  avatar: string;
  onQuickPlay: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onOpenRealitySetup: () => void;
  onOpenRules: () => void;
  onOpenLeaders: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenRoleGuide: () => void;
  language: 'ID' | 'EN';
}

export const HomeView: React.FC<HomeViewProps> = ({
  playerName,
  avatar,
  onQuickPlay,
  onCreateRoom,
  onJoinRoom,
  onOpenRealitySetup,
  onOpenRules,
  onOpenLeaders,
  onOpenShop,
  onOpenProfile,
  onOpenSettings,
  onOpenRoleGuide,
  language
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [claimStatus, setClaimStatus] = useState<'unclaimed' | 'claimed'>('unclaimed');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim().length >= 4) {
      onJoinRoom(roomCodeInput.toUpperCase());
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Upper Navigation Bar */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center bg-white p-4 rounded-xl brutal-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFD23F] border-2 border-black rounded flex items-center justify-center font-mono font-extrabold text-xl brutal-shadow-sm rotate-3">
            S
          </div>
          <BilingualText idText="SECRETIFY" enText="DEDUCTION HUB" className="text-base uppercase" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRoleGuide}
            className="p-2 border-2 border-black rounded-lg bg-[#9B5DE5] text-white font-bold brutal-shadow-sm brutal-press cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-white" />
            <span className="hidden md:inline text-xs font-mono">ROLES</span>
          </button>
          <button
            onClick={onOpenRules}
            className="p-2 border-2 border-black rounded-lg bg-[#FFD23F] font-bold brutal-shadow-sm brutal-press cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-mono">RULES</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 border-2 border-black rounded-lg bg-[#2EC4B6] font-bold brutal-shadow-sm brutal-press cursor-pointer flex items-center gap-1.5"
          >
            <span className="hidden md:inline text-xs font-mono">SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mb-6">
        {/* Left Column: Player Card & Events (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Card */}
          <BrutalCard bg="paper" className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <PixelAvatar avatar={avatar} size="lg" />
                <div className="absolute -bottom-1 -right-1 bg-amber-400 border border-black text-[9px] font-mono px-1 rounded font-bold">
                  PRO
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black font-display text-gray-900 leading-tight">
                    {playerName}
                  </h3>
                  <button
                    onClick={onOpenProfile}
                    className="text-xs font-mono text-slate-500 font-bold border-b border-black mb-1 hover:text-black"
                  >
                    DETAIL / VIEW <ArrowRight className="w-3.5 h-3.5 inline" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="bg-[#DFFF00] text-black border-2 border-black px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase">
                    Level 12
                  </div>
                  <div className="bg-[#2EC4B6] text-black border-2 border-black px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase">
                    2.450 pts
                  </div>
                </div>
              </div>
            </div>
          </BrutalCard>

          {/* Event Banner */}
          <BrutalCard bg="paper" className="relative p-0 overflow-hidden group">
            {/* Split Top Bar Gradient */}
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] h-12 p-3 flex justify-between items-center border-b-3 border-black">
              <div className="bg-black text-white px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm">
                EVENT TERBATAS / LIMITED
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-black tracking-tight leading-none text-black mb-2 uppercase">
                MINGGU MISTERI / MYSTERY WEEK
              </h2>
              <p className="text-xs text-slate-600 font-sans leading-relaxed mb-4">
                Mainkan mode spesial diskusikan kata terenkripsi & dapatkan hadiah pixel eksklusif dari toko Secretify!
              </p>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase">
                  ACTIVE UNTIL: June 5
                </span>
                <button
                  onClick={onOpenShop}
                  className="font-bold border-b border-black text-xs hover:text-[#FF6B35]"
                >
                  {language === 'ID' ? 'LIHAT DETAIL / VIEW' : 'VIEW DETAILS'} <ArrowRight className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            </div>
          </BrutalCard>
        </div>

        {/* Right Column: Actions (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Play & Create Room buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quick Play */}
            <button
              onClick={onQuickPlay}
              className="border-3 border-black rounded-2xl bg-[#DFFF00] text-black p-5 text-left brutal-shadow brutal-press hover:bg-[#c9e600] cursor-pointer flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-start w-full">
                <span className="p-2 border-2 border-black rounded-lg bg-white flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </span>
                <span className="font-mono text-xs font-bold uppercase text-black/60">ONLINE</span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-none mb-1">
                  MAIN CEPAT
                </h3>
                <p className="text-[11px] font-sans font-semibold text-black/70 uppercase">
                  Quick room / buat & tunggu teman
                </p>
              </div>
            </button>

            {/* Create Room */}
            <button
              onClick={onCreateRoom}
              className="border-3 border-black rounded-2xl bg-[#2EC4B6] text-black p-5 text-left brutal-shadow brutal-press hover:bg-[#25ab9e] cursor-pointer flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-start w-full">
                <span className="p-2 border-2 border-black rounded-lg bg-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="font-mono text-xs font-bold uppercase text-black/60">MULTIPLAYER</span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-none mb-1">
                  BUAT RUANGAN
                </h3>
                <p className="text-[11px] font-sans font-semibold text-black/70 uppercase">
                  create room / private party
                </p>
              </div>
            </button>
          </div>

          {/* REALITY OFFLINE PLAY CTA */}
          <button
            onClick={onOpenRealitySetup}
            className="w-full border-3 border-black rounded-2xl bg-[#FF6B35] text-white p-5 text-left brutal-shadow brutal-press hover:bg-[#e05420] cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="p-3 border-2 border-black rounded-xl bg-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight leading-none mb-1 text-white">
                  MODE REALITAS (Satu HP)
                </h3>
                <p className="text-[11px] font-sans font-semibold text-white/80 uppercase">
                  Play local offline on 1 device with your friends!
                </p>
              </div>
            </div>
            <div className="hidden sm:flex p-2 bg-black text-[#DFFF00] font-mono text-[10px] font-extrabold uppercase rounded border border-[#DFFF00]">
              REALITYMODE
            </div>
          </button>

          {/* Join Room Form */}
          <BrutalCard bg="paper" className="p-6">
            <BilingualText
              idText="GABUNG / Join Room"
              enText="INPUT PRIVATE SECURITY CHIP"
              className="text-xs uppercase mb-3"
            />

            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Masukkan Kode / Enter code..."
                className="flex-1 border-3 border-black rounded-xl px-4 py-3 bg-[#F0EDE6] font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FFD23F] placeholder:text-slate-400 text-center uppercase tracking-widest text-lg"
              />
              <BrutalButton
                variant="sunflower"
                type="submit"
                idLabel="GABUNG"
                enLabel="JOIN NOW"
                className="px-6"
                disabled={roomCodeInput.trim().length < 4}
              />
            </form>
          </BrutalCard>

          {/* Daily reward module */}
          <div className="relative">
            {/* Slanted "Klaim!" sticker */}
            <div className="absolute -top-3.5 left-8 transform -rotate-12 bg-[#FF6B35] text-white border-2 border-black font-mono text-[10px] font-black px-2 py-0.5 rounded-sm brutal-shadow-sm uppercase z-10 animate-bounce">
              {claimStatus === 'unclaimed' ? 'Klaim! / Claim!' : 'Sudah Diklaim!'}
            </div>

            <BrutalCard
              bg={claimStatus === 'unclaimed' ? 'paper' : 'sand'}
              className="p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 border-2 border-black rounded-xl bg-[#FFD23F] brutal-shadow-sm">
                  <Gift className="w-6 h-6 text-black" />
                </div>
                <div>
                  <BilingualText idText="Hadiah Harian" enText="Daily gift" className="text-xs uppercase" />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {claimStatus === 'unclaimed' ? '+150 Poin / points ready' : 'Claimed +150 points successfully'}
                  </span>
                </div>
              </div>

              {claimStatus === 'unclaimed' ? (
                <button
                  onClick={() => setClaimStatus('claimed')}
                  className="bg-[#DFFF00] text-black border-2 border-black font-mono font-extrabold text-[11px] px-3.5 py-2.5 rounded-lg brutal-shadow-sm brutal-press cursor-pointer uppercase"
                >
                  AMBIL / TAKE
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 border border-slate-300 px-3 py-1.5 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> CLAIMED
                </span>
              )}
            </BrutalCard>
          </div>
        </div>
      </div>

      {/* Global Status Footer */}
      <div className="flex border-t-3 border-black/10 pt-4 justify-between items-center mt-auto text-slate-500">
        <span className="text-[10px] font-mono tracking-wider">SECRETIFY PROTOCOL v.06</span>
        <div className="flex gap-4">
          <button onClick={onOpenLeaders} className="text-xs font-mono font-bold hover:text-[#2EC4B6]">Peringkat / Rank</button>
          <button onClick={onOpenShop} className="text-xs font-mono font-bold hover:text-[#2EC4B6]">Toko / Shop</button>
        </div>
      </div>
    </div>
  );
};


// LOBBY VIEW INTERFACE
interface LobbyViewProps {
  roomCode: string;
  players: Player[];
  currentPlayerId?: string;
  isHost?: boolean;
  isOnline?: boolean;
  connectionError?: string | null;
  isConnecting?: boolean;
  onStartGame: (
    rounds: number,
    packID: string,
    enabledSpecialRoles: string[],
    debateDurationSec: number,
    gameMode: string
  ) => void;
  roomSettings?: {
    rounds: number;
    wordPack: string;
    debateDurationSec: number;
    gameMode: string;
    specialRolesEnabled: boolean;
  };
  onSettingsChange?: (settings: {
    maxPlayers: number;
    rounds: number;
    specialRoles: boolean;
    voiceChat: boolean;
    gameMode: string;
    wordPack: string;
    debateDurationSec: number;
  }) => void;
  onLeave: () => void;
  onAddBot: () => void;
  onTogglePlayerReady: (id: string) => void;
  language: 'ID' | 'EN';
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  players,
  currentPlayerId,
  isHost = true,
  isOnline = false,
  connectionError,
  isConnecting = false,
  onStartGame,
  roomSettings,
  onSettingsChange,
  onLeave,
  onAddBot,
  onTogglePlayerReady,
  language
}) => {
  const [rounds, setRounds] = useState(5);
  const [debateDurationSec, setDebateDurationSec] = useState(90);
  const [wordPack, setWordPack] = useState('pack_food');
  const [mode, setMode] = useState<'Classic' | 'Speed' | 'Chaos' | 'Silent'>('Classic');
  const [enabledSpecialRoles, setEnabledSpecialRoles] = useState<string[]>([]);
  const [rolesExpanded, setRolesExpanded] = useState(false);
  const [rolesTierFilter, setRolesTierFilter] = useState<'all' | 1 | 2>('all');

  const settingsLocked = isOnline && !isHost;

  const packs = [
    { id: 'pack_food', idLabel: 'Makanan Indonesia / ID Food', enLabel: 'Indonesian Foods' },
    { id: 'pack_cuisine', idLabel: 'Kuliner Dunia / Global Cuisine', enLabel: 'World Cuisine' },
    { id: 'pack_space', idLabel: 'Luar Angkasa / Outer Space', enLabel: 'Sci-Fi Cosmos' }
  ];

  const toggleRole = (id: string) => {
    if (settingsLocked) return;
    setEnabledSpecialRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const filteredCatalog = SPECIAL_ROLES_CATALOG.filter(
    (r) => rolesTierFilter === 'all' || r.tier === rolesTierFilter
  );

  const handleStart = () => {
    onStartGame(rounds, wordPack, enabledSpecialRoles, debateDurationSec, mode);
  };

  const MIN_PLAYERS = 3;
  const allReady = players.length > 0 && players.every((p) => p.isReady);
  const canStartOnline = players.length >= MIN_PLAYERS && allReady;
  const canStart = isOnline ? canStartOnline && isHost : true;

  // Guests mirror host settings from server
  useEffect(() => {
    if (!isOnline || !roomSettings || isHost) return;
    setRounds(roomSettings.rounds);
    setWordPack(roomSettings.wordPack);
    setDebateDurationSec(roomSettings.debateDurationSec);
    setMode(roomSettings.gameMode as typeof mode);
  }, [roomSettings, isOnline, isHost]);

  useEffect(() => {
    if (!isOnline || !isHost || !onSettingsChange) return;
    onSettingsChange({
      maxPlayers: 8,
      rounds,
      specialRoles: enabledSpecialRoles.length > 0,
      voiceChat: false,
      gameMode: mode,
      wordPack,
      debateDurationSec
    });
  }, [rounds, wordPack, mode, enabledSpecialRoles, debateDurationSec, isOnline, isHost, onSettingsChange]);

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {(connectionError || isConnecting) && (
        <div
          className={`mb-4 p-3 rounded-xl border-2 border-black text-xs font-mono font-bold ${
            connectionError ? 'bg-red-100 text-red-800' : 'bg-[#DFFF00]/30 text-black'
          }`}
        >
          {connectionError ||
            (language === 'ID' ? 'Menghubungkan ke server...' : 'Connecting to server...')}
        </div>
      )}

      {isOnline && (
        <div className="mb-4 p-3 rounded-xl border-2 border-black bg-[#2EC4B6]/20 text-[10px] font-mono font-bold uppercase">
          {language === 'ID'
            ? 'Mode online aktif — undang teman dengan kode ruangan.'
            : 'Online mode — share room code with friends.'}
        </div>
      )}

      {/* Header Room Information */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b-3 border-black pb-4 mb-6">
        <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={onLeave}
            className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
          >
            ← Keluar / Leave
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <BilingualText idText="Menunggu pemain... / Waiting for players" enText={`${players.length}/8 connections`} className="text-sm" />
            </div>
          </div>
        </div>

        {/* Room Code block */}
        <div className="md:col-span-4 flex justify-end">
          <div className="flex border-3 border-black bg-white rounded-xl brutal-shadow p-2 w-full max-w-[240px] items-center justify-between">
            <div className="px-2">
              <span className="text-[10px] font-sans text-slate-500 font-extrabold uppercase block">RUANGAN / ROOM</span>
              <span className="font-mono font-black text-xl tracking-wider text-black">#{roomCode}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`#${roomCode}`);
              }}
              className="p-2 bg-[#2EC4B6] border-2 border-black rounded-lg brutal-shadow-sm brutal-press cursor-pointer"
              title="Copy room code"
            >
              <Copy className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Players (Col 8), Right Settings (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mb-6">
        {/* Players connected grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-xs font-bold uppercase text-slate-700">
              ROSTER PEMAIN / PLAYER ROSTER ({players.length}/8)
            </h3>
            {!isOnline && (
              <button
                onClick={onAddBot}
                disabled={players.length >= 8}
                className="text-xs bg-white border-2 border-black hover:bg-slate-100 rounded-lg px-2.5 py-1.5 font-mono font-bold brutal-shadow-sm brutal-press disabled:opacity-50"
              >
                + BOT SIMULASI / ADD PLAYER
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {players.concat(Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => null as any)).map((player: Player | null, idx) => {
              if (player) {
                const isYou = currentPlayerId
                  ? player.id === currentPlayerId
                  : player.id === '1';
                const CardTag = isYou ? 'button' : 'div';
                return (
                  <CardTag
                    key={player.id}
                    {...(isYou
                      ? {
                          type: 'button' as const,
                          onClick: () => onTogglePlayerReady(player.id)
                        }
                      : {})}
                    className={`border-3 border-black bg-white rounded-xl p-3.5 text-center brutal-shadow relative transform select-none w-full ${
                      isYou
                        ? 'group hover:-rotate-1 cursor-pointer brutal-press'
                        : 'opacity-95 cursor-default'
                    }`}
                  >
                    {/* Host badge */}
                    {player.isHost && (
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#FFD23F] text-black border border-black text-[8px] font-mono font-bold px-1.5 rounded-sm uppercase">
                        Host
                      </span>
                    )}

                    {/* Self designation */}
                    {isYou && (
                      <span className="absolute -top-2 right-2 bg-[#DFFF00] text-black border border-black text-[7px] font-mono font-bold px-1.5 rounded-sm uppercase">
                        YOU
                      </span>
                    )}

                    <div className="flex justify-center mb-2 mt-1">
                      <PixelAvatar avatar={player.avatar} size="md" />
                    </div>

                    <h4 className="font-bold text-slate-900 line-clamp-1 text-sm font-sans">
                      {player.name}
                    </h4>

                    <span className="text-[10px] font-mono text-slate-400 block mb-2 font-semibold">
                      LVL {player.level}
                    </span>

                    {/* Ready status sticker */}
                    <div className="flex justify-center mt-1">
                      <BrutalBadge type={player.isReady ? 'READY' : 'NOT_READY'} />
                    </div>
                  </CardTag>
                );
              } else {
                return (
                  <div
                    key={`empty_${idx}`}
                    className="border-3 border-dashed border-black/25 bg-white/30 rounded-xl p-5 flex flex-col items-center justify-center h-[135px]"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center text-slate-400 text-lg">
                      +
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">KOSONG / EMPTY</span>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Column Right: Match custom Settings panels */}
        <div className="lg:col-span-4 rounded-2xl border-3 border-black bg-white brutal-shadow p-5">
          <div className="flex items-center gap-2 border-b border-black/10 pb-3 mb-4">
            <Volume2 className="w-4 h-4 text-slate-600" />
            <BilingualText idText="Pengaturan / Settings" enText="ROOM CUSTOMIZER" className="text-xs uppercase" />
          </div>

          {settingsLocked && (
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-4 p-2 bg-slate-100 border border-black/20 rounded-lg">
              {language === 'ID'
                ? 'Hanya host yang dapat mengubah pengaturan ruangan.'
                : 'Only the host can change room settings.'}
            </p>
          )}

          <div className="space-y-6">
            {/* Rounds selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-extrabold uppercase text-slate-800">
                JUMLAH RONDE / NUMBER OF ROUNDS
              </label>
              <div className="flex items-center border-3 border-black rounded-xl overflow-hidden bg-[#F0EDE6] brutal-shadow-sm">
                <button
                  type="button"
                  disabled={settingsLocked}
                  onClick={() => setRounds(Math.max(1, rounds - 1))}
                  className="w-12 h-12 bg-white text-black font-black hover:bg-slate-100 border-r-3 border-black brutal-press outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  －
                </button>
                <span className="flex-1 text-center font-mono font-bold text-lg text-black bg-white py-2">
                  {rounds}
                </span>
                <button
                  type="button"
                  disabled={settingsLocked}
                  onClick={() => setRounds(Math.min(10, rounds + 1))}
                  className="w-12 h-12 bg-white text-black font-black hover:bg-slate-100 border-l-3 border-black brutal-press outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ＋
                </button>
              </div>
            </div>

            {/* Debate timer */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-extrabold uppercase text-slate-800">
                WAKTU DEBAT / DEBATE TIMER
              </label>
              <select
                value={debateDurationSec}
                onChange={(e) => setDebateDurationSec(Number(e.target.value))}
                disabled={settingsLocked}
                className="w-full border-3 border-black bg-white rounded-xl px-4 py-3 font-mono font-bold text-xs shadow-[2px_2px_0px_#000] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value={60}>60 detik / 60 sec</option>
                <option value={90}>90 detik / 90 sec</option>
                <option value={120}>2 menit / 2 min</option>
                <option value={180}>3 menit / 3 min</option>
                <option value={240}>4 menit / 4 min</option>
              </select>
              <p className="text-[9px] font-mono text-slate-500 leading-relaxed">
                {language === 'ID'
                  ? 'Timer otomatis ke voting saat habis. Host bisa lewati lebih awal.'
                  : 'Auto-advances to voting when time ends. Host may skip early.'}
              </p>
            </div>

            {/* Word pack dropdown */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-extrabold uppercase text-slate-800">
                PAKET KATA / WORD PACK
              </label>
              <select
                value={wordPack}
                onChange={(e) => setWordPack(e.target.value)}
                disabled={settingsLocked}
                className="w-full border-3 border-black bg-white rounded-xl px-4 py-3 font-mono font-bold text-xs shadow-[2px_2px_0px_#000] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {packs.map((p) => (
                  <option key={p.id} value={p.id} className="font-mono text-xs">
                    {p.idLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Roles selector */}
            <div className="space-y-2 pt-2 border-t border-black/10">
              <button
                type="button"
                disabled={settingsLocked}
                onClick={() => !settingsLocked && setRolesExpanded(!rolesExpanded)}
                className="w-full flex items-center justify-between disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-mono font-extrabold uppercase text-slate-800 cursor-pointer">
                    PERAN SPESIAL / SPECIAL ROLES
                  </label>
                  {enabledSpecialRoles.length > 0 && (
                    <span className="bg-[#9B5DE5] text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black">
                      {enabledSpecialRoles.length}
                    </span>
                  )}
                </div>
                {rolesExpanded
                  ? <ChevronUp className="w-4 h-4 text-slate-500" />
                  : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {rolesExpanded && (
                <div className="space-y-2">
                  {/* Tier filter chips */}
                  <div className="flex gap-1.5">
                    {(['all', 1, 2] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        disabled={settingsLocked}
                        onClick={() => setRolesTierFilter(tier)}
                        className={`flex-1 py-1 border-2 border-black font-mono font-bold text-[9px] rounded-md transition brutal-press disabled:opacity-50 ${
                          rolesTierFilter === tier
                            ? 'bg-[#12182B] text-[#DFFF00]'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tier === 'all' ? 'SEMUA' : `TIER ${tier}`}
                      </button>
                    ))}
                  </div>

                  {/* Role pill toggles */}
                  <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto pr-1">
                    {filteredCatalog.map((role: SpecialRoleMeta) => {
                      const isOn = enabledSpecialRoles.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          disabled={settingsLocked}
                          className={`w-full flex items-center gap-2 border-2 rounded-lg px-2.5 py-1.5 text-left transition brutal-press disabled:opacity-50 disabled:cursor-not-allowed ${
                            isOn
                              ? 'border-black brutal-shadow-sm'
                              : 'border-black/30 bg-white/80 hover:border-black/60'
                          }`}
                          style={isOn ? { backgroundColor: role.color + '22', borderColor: role.color } : {}}
                        >
                          {/* Color dot */}
                          <span
                            className="w-3 h-3 rounded-sm border border-black/40 shrink-0"
                            style={{ backgroundColor: role.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono font-black text-[10px] text-stone-900 leading-none block truncate">
                              {language === 'ID' ? role.nameID : role.nameEN}
                            </span>
                            <span className="font-sans text-[8px] text-slate-500 leading-none block truncate">
                              {language === 'ID' ? role.descShortID : role.descShortEN}
                            </span>
                          </div>
                          <span
                            className={`w-5 h-5 border-2 border-black rounded flex items-center justify-center shrink-0 ${
                              isOn ? 'bg-[#DFFF00]' : 'bg-white'
                            }`}
                          >
                            {isOn && <Check className="w-3 h-3 text-black" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={settingsLocked}
                      onClick={() => setEnabledSpecialRoles(SPECIAL_ROLES_CATALOG.map(r => r.id))}
                      className="flex-1 text-[9px] font-mono font-bold border-2 border-black bg-white py-1 rounded-lg hover:bg-slate-50 brutal-press disabled:opacity-50"
                    >
                      PILIH SEMUA / ALL
                    </button>
                    <button
                      type="button"
                      disabled={settingsLocked}
                      onClick={() => setEnabledSpecialRoles([])}
                      className="flex-1 text-[9px] font-mono font-bold border-2 border-black bg-white py-1 rounded-lg hover:bg-slate-50 brutal-press disabled:opacity-50"
                    >
                      HAPUS / CLEAR
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Game mode presets */}
            <div className="space-y-2 pb-2">
              <label className="block text-[11px] font-mono font-extrabold uppercase text-slate-800">
                MODE PERMAINAN / GAME MODES
              </label>

              <div className="grid grid-cols-2 gap-2">
                {['Classic', 'Speed', 'Chaos', 'Silent'].map((m) => {
                  const isActive = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={settingsLocked}
                      onClick={() => setMode(m as any)}
                      className={`border-2 border-black rounded-lg p-2 text-center transition brutal-press disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive ? 'bg-[#DFFF00] brutal-shadow-sm font-black' : 'bg-white font-medium hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[11px] font-sans font-bold leading-none">{m}</span>
                      <span className="text-[8px] font-mono text-slate-500 lowercase leading-tight">
                        {m === 'Classic' && 'Standard play'}
                        {m === 'Speed' && 'Double speed'}
                        {m === 'Chaos' && 'Random roles'}
                        {m === 'Silent' && 'No proxy chat'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="max-w-[480px] mx-auto w-full pb-4 space-y-2">
        {isOnline && !isHost && (
          <p className="text-center text-[10px] font-mono text-slate-500 uppercase">
            {language === 'ID'
              ? 'Hanya host yang dapat memulai permainan.'
              : 'Only the host can start the game.'}
          </p>
        )}
        {isOnline && isHost && players.length < MIN_PLAYERS && (
          <p className="text-center text-[10px] font-mono text-amber-700 uppercase">
            {language === 'ID'
              ? `Minimal ${MIN_PLAYERS} pemain untuk mulai.`
              : `Need at least ${MIN_PLAYERS} players to start.`}
          </p>
        )}
        {isOnline && isHost && players.length >= MIN_PLAYERS && !allReady && (
          <p className="text-center text-[10px] font-mono text-amber-700 uppercase">
            {language === 'ID'
              ? 'Semua pemain harus siap (ready).'
              : 'All players must be ready.'}
          </p>
        )}
        <BrutalButton
          variant="lime"
          size="lg"
          idLabel="MULAI PERMAINAN"
          enLabel="START DEBATING GAME"
          onClick={handleStart}
          className="w-full text-base py-4"
          disabled={!canStart}
          icon={<Play className="w-5 h-5 fill-black text-black" />}
        />
      </div>
    </div>
  );
};

