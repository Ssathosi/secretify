/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Send, Check, Shield, HelpCircle, AlertTriangle, Play, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { Player, Clue, ChatMessage, RoleType } from '../types';
import { BilingualText, BrutalButton, BrutalCard, PixelAvatar, BrutalBadge, ScallopLine } from './BrutalComponents';
import { sfx } from '../utils/audio';

function useDebateCountdown(endsAt: number | null | undefined) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const endTime = endsAt && endsAt > 0 ? endsAt : null;
    if (!endTime) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return secondsLeft;
}

// 1. ROLE ASSIGN VIEW
interface RoleAssignViewProps {
  playerRole: RoleType;
  secretWord: string;
  onConfirm: () => void;
  language: 'ID' | 'EN';
}

export const RoleAssignView: React.FC<RoleAssignViewProps> = ({
  playerRole,
  secretWord,
  onConfirm,
  language
}) => {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    sfx.playRoleAssign();
  }, []);

  return (
    <div className="min-h-dvh bg-[#12182B] text-white flex flex-col justify-center px-4 py-8 max-w-[1280px] mx-auto w-full select-none">
      <div className="max-w-[500px] mx-auto w-full text-center">
        <h2 className="text-[#DFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-2">
          {language === 'ID' ? 'KARTU DAN MISI PERAN' : 'DECRYPTING ROLE CHIP'}
        </h2>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
          {language === 'ID' ? 'RAHASIA NEGARA' : 'CLASSIFIED DOSSIER'}
        </h1>

        {/* Mission envelope folder wrapper */}
        <div className="mb-8">
          <button
            onClick={() => setIsOpened(!isOpened)}
            className={`w-full text-left cursor-pointer transition-all duration-300 transform outline-none ${
              isOpened ? 'scale-105 rotate-1' : 'hover:-rotate-1 hover:scale-102'
            }`}
          >
            <BrutalCard
              bg={isOpened ? 'paper' : 'coral'}
              className="p-8 border-3 border-black text-black text-center min-h-[300px] flex flex-col justify-between relative overflow-hidden"
            >
              {isOpened ? (
                // Opened state
                <div className="space-y-6 my-auto">
                  <div className="inline-block bg-black text-white text-[10px] font-mono px-3 py-1 rounded uppercase tracking-wider font-extrabold mb-2">
                    {language === 'ID' ? 'DATA DEKRIPSI' : 'DECRYPTED DATA'}
                  </div>

                  <div className="flex justify-center mb-3">
                    <BrutalBadge type={playerRole} />
                  </div>

                  {playerRole !== 'MR_WHITE' ? (
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] font-bold block uppercase tracking-wider">
                        KATA RAHASIA ANDA / SECRET WORD
                      </span>
                      <h3 className="text-3xl font-black text-black font-display tracking-tight bg-[#FFD23F] border-2 border-black inline-block px-6 py-2.5 rounded-xl mt-2 brutal-shadow-sm select-all">
                        {secretWord}
                      </h3>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 border-2 border-black rounded-xl">
                      <span className="flex items-center gap-1 text-red-500 font-mono text-[11px] font-extrabold block uppercase tracking-wider mb-2">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
                        PERINGATAN / WARNING
                      </span>
                      <p className="text-slate-600 text-xs font-semibold font-sans">
                        {language === 'ID'
                          ? 'Anda tidak diberikan kata. Dengarkan clue sipil & tebak kata rahasia sivil!'
                          : 'You have no keyword. Spy on civilian clues to deduce their codeword.'}
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 font-sans font-medium px-4">
                    {language === 'ID'
                      ? 'Tutup mata Anda jika pemain lain berada didekat Anda! Tekan lagi untuk menyembunyikan.'
                      : 'Cover card from peers to maintain secrecy. Press again to refold envelope.'}
                  </p>
                </div>
              ) : (
                // Closed Envelope Dossier
                <div className="my-auto py-6 space-y-4">
                  <div className="w-16 h-16 border-3 border-black bg-white rounded-full flex items-center justify-center mx-auto brutal-shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight text-white leading-tight">
                    {language === 'ID' ? 'KLI K UNTUK DEKRIPSI' : 'ACTIVATE DECRYPTION'}
                  </h3>
                  <p className="text-xs text-white/90 font-sans max-w-xs mx-auto leading-relaxed">
                    {language === 'ID'
                      ? 'Aman dari intipan. Sentuh folder ini untuk memproses chip data Anda secara instan.'
                      : 'Cover from prying eyes. Press inside this card to unfold role mission details.'}
                  </p>
                </div>
              )}
            </BrutalCard>
          </button>
        </div>

        {/* Proceed CTA */}
        {isOpened && (
          <div className="animate-fade-in px-4">
            <BrutalButton
              variant="lime"
              size="lg"
              idLabel="MASUK PROTOKOL AGEN"
              enLabel="ENTER ACTIVE GAME FIELD"
              onClick={onConfirm}
              className="w-full text-sm py-3.5"
              icon={<Check className="w-4 h-4" />}
            />
          </div>
        )}
      </div>
    </div>
  );
};


// 2. WORD REVEAL (Anti-Peek Widget at top of actively running games)
export const WordRevealShield: React.FC<{
  secretWord: string;
  role: RoleType;
  language: 'ID' | 'EN';
}> = ({ secretWord, role, language }) => {
  const [peekState, setPeekState] = useState(false);

  return (
    <BrutalCard bg="paper" className="p-3 border-2 border-black rounded-xl brutal-shadow-sm flex items-center justify-between gap-4 max-w-[420px] mx-auto w-full bg-white select-none">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12M18.66 5.34l-2.12 2.12"/></svg>
        <div>
          <span className="text-[8px] text-slate-400 font-mono font-bold block uppercase leading-none mb-1">KATAMU / CODIFIER</span>
          {peekState ? (
            <span className="font-mono text-sm font-black text-black bg-[#FFD23F] px-2 py-0.5 rounded border border-black uppercase">
              {role === 'MR_WHITE' ? 'MR. WHITE (NO WORD)' : secretWord}
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-500 font-bold tracking-widest uppercase">
              •••••••••••••••••
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPeekState(!peekState)}
        className="p-1 px-2.5 bg-[#F0EDE6] border-2 border-black rounded-lg text-black hover:bg-slate-200 brutal-shadow-sm transition-all"
        title="Show/Hide Word"
      >
        {peekState ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </BrutalCard>
  );
};


// 3. CLUE SUBMISSION ROUND
interface ClueRoundViewProps {
  secretWord: string;
  role: RoleType;
  clues: Clue[];
  currentPlayerId?: string;
  waitingForOthers?: boolean;
  serverGameState?: string;
  clueCompleteEndsAt?: number | null;
  isHost?: boolean;
  onProceedToDiscussion?: () => void;
  onSubmitClue: (text: string) => void;
  language: 'ID' | 'EN';
}

export const ClueRoundView: React.FC<ClueRoundViewProps> = ({
  secretWord,
  role,
  clues,
  currentPlayerId,
  waitingForOthers = false,
  serverGameState,
  clueCompleteEndsAt = null,
  isHost = false,
  onProceedToDiscussion,
  onSubmitClue,
  language
}) => {
  const [clueInput, setClueInput] = useState('');
  const alreadySubmitted = currentPlayerId
    ? clues.some((c) => c.playerId === currentPlayerId)
    : false;
  const [clueHasBeenSent, setClueHasBeenSent] = useState(alreadySubmitted);
  const pauseSecondsLeft = useDebateCountdown(
    serverGameState === 'clue_complete' ? clueCompleteEndsAt : null
  );
  const canSubmitClue = serverGameState === 'clue_round' && !alreadySubmitted;

  useEffect(() => {
    if (alreadySubmitted) {
      setClueHasBeenSent(true);
    }
  }, [alreadySubmitted]);

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clueInput.trim()) {
      onSubmitClue(clueInput);
      setClueHasBeenSent(true);
      setClueInput('');
      sfx.playBubble();
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Upper Context Shield */}
      <div className="mb-6">
        <WordRevealShield secretWord={secretWord} role={role} language={language} />
      </div>

      {serverGameState === 'role_assignment' && (
        <div className="mb-4 p-3 rounded-xl border-2 border-black bg-[#FFD23F]/30 text-[10px] font-mono font-bold text-center uppercase">
          {language === 'ID'
            ? 'Menunggu semua pemain konfirmasi peran sebelum clue dibuka...'
            : 'Waiting for all players to confirm roles before clues unlock...'}
        </div>
      )}

      {waitingForOthers && serverGameState !== 'role_assignment' && (
        <div className="mb-4 p-3 rounded-xl border-2 border-black bg-[#FFD23F]/30 text-[10px] font-mono font-bold text-center uppercase">
          {language === 'ID'
            ? 'Anda sudah masuk ronde clue. Pemain lain masih membaca peran.'
            : 'You entered clue round. Other players are still reading roles.'}
        </div>
      )}

      {serverGameState === 'clue_complete' && (
        <div className="mb-4 p-4 rounded-xl border-2 border-black bg-[#2EC4B6]/20 space-y-3">
          <p className="text-[10px] font-mono font-bold text-center uppercase">
            {language === 'ID'
              ? `Semua clue terkumpul! Debat dimulai dalam ${pauseSecondsLeft ?? 5} detik...`
              : `All clues in! Debate starts in ${pauseSecondsLeft ?? 5}s...`}
          </p>
          {isHost && onProceedToDiscussion && (
            <BrutalButton
              variant="lime"
              size="md"
              idLabel="LANJUT SESI DEBAT"
              enLabel="START DEBATE NOW"
              onClick={onProceedToDiscussion}
              className="w-full text-xs"
            />
          )}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mb-6">
        {/* Left chat layout clues received */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex justify-between items-center bg-[#12182B] text-white p-4 rounded-xl border-2 border-black brutal-shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <BilingualText
                idText="RONDE CLUE / CLUE PROTOCOL"
                enText="RECEIVING LIVE SIGNAL"
                className="text-xs uppercase text-white"
                enClassName="text-slate-400"
              />
            </div>
            <span className="font-mono text-xs font-bold text-[#DFFF00]">STATION_LIVE</span>
          </div>

          {/* Scrolling clues card board */}
          <div className="border-3 border-black rounded-2xl bg-white p-5 brutal-shadow min-h-[300px] space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
              LOG PETUNJUK AGEN / TRANSMITTED SIGNS
            </span>

            {clues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <p className="text-xs font-mono">Belum ada petunjuk / No clues transmitted yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="flex gap-3 bg-[#F0EDE6] p-4 rounded-xl border-2 border-black brutal-shadow-sm items-start"
                  >
                    <PixelAvatar avatar={clue.avatar} size="sm" />
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 block leading-tight mb-1">
                        {clue.playerName}
                      </span>
                      <p className="text-xs font-sans text-slate-800 leading-relaxed font-semibold">
                        &ldquo;{language === 'ID' ? clue.clueTextID : clue.clueTextEN}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Card at bottom */}
      <div className="max-w-[600px] mx-auto w-full pb-4">
        {serverGameState === 'clue_complete' ? null : clueHasBeenSent || !canSubmitClue ? (
          <div className="bg-[#DFFF00]/10 border-2 border-[#DFFF00] text-black rounded-xl p-4 text-center brutal-shadow-sm font-mono text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            {serverGameState === 'role_assignment'
              ? (language === 'ID'
                  ? 'PERAN DIKONFIRMASI — TUNGGU PEMAIN LAIN.'
                  : 'ROLE CONFIRMED — WAITING FOR OTHERS.')
              : 'CLUE TERKIRIM! MENUNGGU ANTRIAN PERMAINAN BERIKUT / SIGNS SENT!'}
          </div>
        ) : (
          <BrutalCard bg="paper" className="p-5">
            <BilingualText
              idText="TULIS SATU KATA CLUE-MU / TRANSMIT SINGLE CLUE"
              enText="MUST NOT DIRECTLY INCLUDE THE SECRET CODE"
              className="text-xs uppercase mb-3 text-slate-700"
            />

            <form onSubmit={handleClueSubmit} className="flex gap-2">
              <input
                type="text"
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                maxLength={40}
                placeholder={language === 'ID' ? 'Ketik petunjuk / Type sign...' : 'Type clue...'}
                required
                className="flex-1 border-3 border-black rounded-xl px-4 py-3 bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FF6B35]"
              />
              <button
                type="submit"
                className="bg-[#FF6B35] text-white border-3 border-black font-mono font-extrabold text-xs px-5 rounded-xl brutal-shadow brutal-press flex items-center justify-center uppercase cursor-pointer"
              >
                KIRIM / SEND
              </button>
            </form>
          </BrutalCard>
        )}
      </div>
    </div>
  );
};


// 4. DISCUSSION / INTERACTIVE CHAT ROOM
interface DiscussionViewProps {
  secretWord: string;
  role: RoleType;
  players: Player[];
  currentPlayerId: string;
  isHost: boolean;
  isOnline?: boolean;
  chatMessages: ChatMessage[];
  discussionEndsAt?: number | null;
  debateDurationSec?: number;
  onSubmitMessage: (msg: string) => void;
  onProceedToVote: () => void;
  language: 'ID' | 'EN';
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  secretWord,
  role,
  players,
  currentPlayerId,
  isHost,
  isOnline = false,
  chatMessages,
  discussionEndsAt = null,
  debateDurationSec = 90,
  onSubmitMessage,
  onProceedToVote,
  language
}) => {
  const [msgInput, setMsgInput] = useState('');
  const [reactionFlood, setReactionFlood] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [fallbackEndsAt, setFallbackEndsAt] = useState<number | null>(null);

  useEffect(() => {
    if (discussionEndsAt && discussionEndsAt > 0) {
      setFallbackEndsAt(null);
      return;
    }
    setFallbackEndsAt(Date.now() + debateDurationSec * 1000);
  }, [discussionEndsAt, debateDurationSec]);

  const effectiveEndsAt = discussionEndsAt && discussionEndsAt > 0
    ? discussionEndsAt
    : fallbackEndsAt;

  const secondsLeft = useDebateCountdown(effectiveEndsAt);

  const [prevChatCount, setPrevChatCount] = useState(chatMessages.length);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > prevChatCount) {
      sfx.playBubble();
      setPrevChatCount(chatMessages.length);
    }
  }, [chatMessages.length, prevChatCount]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgInput.trim()) {
      onSubmitMessage(msgInput);
      setMsgInput('');
      sfx.playBubble();
    }
  };

  const handleTriggerReaction = (emoji: string) => {
    // Spawns a floating arcade reaction across the sandbox
    const id = Math.random().toString();
    const left = Math.floor(Math.random() * 80) + 10;
    setReactionFlood((prev) => [...prev, { id, emoji, left }]);

    // Play bubble pop sound
    sfx.playBubble();

    setTimeout(() => {
      setReactionFlood((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between overflow-hidden relative">
      {/* Floating Reaction Animation Loop sandbox */}
      {reactionFlood.map((r) => (
        <div
          key={r.id}
          className="absolute text-5xl animate-bounce pointer-events-none z-40 transition-all duration-1000 select-none"
          style={{
            left: `${r.left}%`,
            bottom: '100px',
            animation: 'floatEmoji 1.5s ease-out forwards'
          }}
        >
          {r.emoji}
        </div>
      ))}

      <style>{`
        @keyframes floatEmoji {
          0% { transform: translateY(0px) scale(0.5); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Persistent peek keyword */}
      <div className="mb-4 space-y-3">
        <WordRevealShield secretWord={secretWord} role={role} language={language} />
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#12182B] text-white border-2 border-black rounded-xl p-3 brutal-shadow-sm">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase block">
              {language === 'ID' ? 'Sisa waktu debat' : 'Debate time left'}
            </span>
            <span className="font-mono text-2xl font-black text-[#DFFF00] tabular-nums">
              {secondsLeft !== null
                ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                : `${Math.floor(debateDurationSec / 60)}:${String(debateDurationSec % 60).padStart(2, '0')}`}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 max-w-[200px] text-right leading-tight">
            {language === 'ID'
              ? 'Otomatis masuk voting saat 0:00'
              : 'Auto voting at 0:00'}
          </span>
        </div>
      </div>

      {/* Main chatroom setup */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Chat Feed */}
        <div className="lg:col-span-8 flex flex-col justify-between border-3 border-black bg-white rounded-2xl brutal-shadow p-5 min-h-[400px]">
          <div className="border-b border-black/10 pb-2 mb-3 flex justify-between items-center">
            <BilingualText idText="CHAT DEBAT DEBUT" enText="CRITICAL DISCUSSION PLATFORM" className="text-xs uppercase" />
            <span className="text-[10px] font-mono text-red-500 font-bold bg-red-100 border border-red-400 px-2 py-0.5 rounded-md uppercase">
              DEBATE_ACTIVE CH.4
            </span>
          </div>

          {/* Actual scrolling speech bubbles */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] mb-4 pr-1">
            {chatMessages.length === 0 && (
              <p className="text-xs font-mono text-slate-400 text-center py-8">
                {language === 'ID'
                  ? 'Belum ada pesan. Mulai debat!'
                  : 'No messages yet. Start the debate!'}
              </p>
            )}
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 items-end ${msg.isMe ? 'flex-row-reverse' : ''}`}
              >
                <PixelAvatar avatar={msg.avatar} size="sm" />
                <div
                  className={`border-2 border-black rounded-2xl p-3.5 max-w-[70%] brutal-shadow-sm ${
                    msg.isMe
                      ? 'bg-[#DFFF00] text-black rounded-br-none'
                      : 'bg-[#F0EDE6] text-black rounded-bl-none'
                  }`}
                >
                  <span className="font-mono text-[9px] font-extrabold text-black/55 block tracking-wide uppercase leading-none mb-1">
                    {msg.senderName}
                  </span>
                  <p className="text-xs font-sans font-semibold text-slate-800 leading-normal">
                    {language === 'ID' ? msg.messageID : msg.messageEN}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive React and send boxes */}
          <div className="space-y-3">
            {/* Reactions Ribbon presets */}
            <div className="flex items-center gap-1.5 border-t border-black/10 pt-2.5">
              <span className="text-[9px] font-mono text-slate-400 font-extrabold uppercase uppercase mr-1">
                TAP REACTION:
              </span>
              {['🔥', '💀', '🤔', '🤡', '🍕', '👑'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handleTriggerReaction(e)}
                  className="bg-[#F0EDE6] border-2 border-black hover:bg-slate-200 rounded-lg p-1.5 text-xs brutal-shadow-sm brutal-press cursor-pointer"
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                maxLength={80}
                placeholder={language === 'ID' ? 'Ketik tuduhan / bela diri...' : 'Accuse or defend yourself...'}
                className="flex-1 border-3 border-black rounded-xl px-4 py-3 bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-4 focus:ring-[#FF6B35]"
              />
              <button
                type="submit"
                className="bg-[#2EC4B6] text-black border-3 border-black p-3 rounded-xl brutal-shadow brutal-press flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Checklist active participants */}
        <div className="lg:col-span-4 border-3 border-black bg-white rounded-2xl brutal-shadow p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-mono text-xs font-bold uppercase text-slate-600 mb-4 border-b border-black/10 pb-2">
              STATUS HIDUP AGEN / STATUS AGENTS
            </h4>

            <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {players.map((player) => {
                const isYou = player.id === currentPlayerId;
                return (
                  <li
                    key={player.id}
                    className={`flex items-center justify-between border border-black/10 p-2 rounded-lg ${
                      player.isEliminated ? 'bg-red-100' : 'bg-emerald-50'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${player.isEliminated ? 'opacity-50' : ''}`}>
                      <PixelAvatar avatar={player.avatar} size="sm" />
                      <span className={`text-xs font-bold ${player.isEliminated ? 'line-through' : ''}`}>
                        {player.name}
                        {isYou ? (language === 'ID' ? ' (Anda)' : ' (You)') : ''}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono border px-1.5 py-0.5 rounded bg-white ${
                        player.isEliminated
                          ? 'text-red-500 border-red-300 font-bold line-through'
                          : 'text-emerald-600 border-emerald-300'
                      }`}
                    >
                      {player.isEliminated ? 'DEAD' : 'ALIVE'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {isHost && !isOnline ? (
            <div className="pt-6 space-y-2">
              <BrutalButton
                variant="coral"
                size="md"
                idLabel="LEWATI TIMER → VOTING"
                enLabel="SKIP TIMER → VOTING"
                onClick={onProceedToVote}
                className="w-full text-xs"
                icon={<AlertTriangle className="w-4 h-4 ml-1 animate-pulse" />}
              />
              <p className="text-[9px] font-mono text-slate-500 text-center">
                {language === 'ID'
                  ? 'Opsional: lewati sebelum timer habis'
                  : 'Optional: skip before timer ends'}
              </p>
            </div>
          ) : (
            <p className="pt-6 text-[10px] font-mono text-slate-500 text-center uppercase">
              {language === 'ID'
                ? (isOnline ? 'Tunggu hingga timer debat habis untuk voting.' : 'Menunggu timer debat atau host...')
                : (isOnline ? 'Wait for the debate timer to vote.' : 'Waiting for debate timer or host...')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


// 5. VOTING ROUND MAP PANEL
interface VotingRoundViewProps {
  players: Player[];
  currentPlayerId: string;
  hasVoted: boolean;
  myVotedForId?: string;
  secretWord: string;
  role: RoleType;
  isHost: boolean;
  allVotedOrSkipped?: boolean;
  onCastVote: (targetPlayerId: string) => void;
  onSkipVote: () => void;
  onConfirmVotesComplete: () => void;
  language: 'ID' | 'EN';
}

export const VotingRoundView: React.FC<VotingRoundViewProps> = ({
  players,
  currentPlayerId,
  hasVoted,
  myVotedForId,
  secretWord,
  role,
  isHost,
  allVotedOrSkipped = false,
  onCastVote,
  onSkipVote,
  onConfirmVotesComplete,
  language
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
    myVotedForId ?? null
  );
  const livingPlayers = players.filter((p) => !p.isEliminated);
  const hasSkipped = myVotedForId === 'SKIP';
  const lockedVote = hasVoted || !!myVotedForId;

  // Count how many living players have voted or skipped
  const votedCount = livingPlayers.filter(p => p.votedForId !== undefined).length;
  const totalLiving = livingPlayers.length;

  useEffect(() => {
    if (myVotedForId && myVotedForId !== 'SKIP') {
      setSelectedPlayerId(myVotedForId);
    }
  }, [myVotedForId]);

  const handleVoteSubmit = (id: string) => {
    if (lockedVote) return;
    sfx.playClick();
    setSelectedPlayerId(id);
    onCastVote(id);
  };

  const handleSkipVote = () => {
    if (lockedVote) return;
    sfx.playClick();
    onSkipVote();
  };

  // Determine the selected target display name
  const selectedDisplayName = selectedPlayerId && selectedPlayerId !== 'SKIP'
    ? players.find((p) => p.id === selectedPlayerId)?.name
    : null;

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      {/* Upper Anti Peek header */}
      <div className="mb-4">
        <WordRevealShield secretWord={secretWord} role={role} language={language} />
      </div>

      {/* Voting Progress Bar */}
      <div className="mb-4 p-3 rounded-xl border-2 border-black bg-[#12182B] space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            {language === 'ID' ? 'Progress Voting' : 'Voting Progress'}
          </span>
          <span className="text-xs font-mono font-bold text-[#DFFF00]">
            {votedCount}/{totalLiving}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#DFFF00] transition-all duration-500 ease-out"
            style={{ width: `${(votedCount / totalLiving) * 100}%` }}
          />
        </div>
        <p className="text-[9px] font-mono text-slate-500 text-center">
          {language === 'ID'
            ? `Menunggu ${totalLiving - votedCount} pemain lagi untuk vote atau skip`
            : `Waiting for ${totalLiving - votedCount} more player(s) to vote or skip`}
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Players clickable targets */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#12182B] text-white p-4 rounded-xl border-2 border-black brutal-shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <BilingualText
                idText="SIAPA PENYAMARNYA? / ELIMINATION VOTE"
                enText="SELECT HOSTILE THREAT AGENT"
                className="text-xs uppercase text-white"
                enClassName="text-slate-400"
              />
            </div>
            <span className="font-mono text-xs font-bold text-red-500">POLLING_SECURE</span>
          </div>

          {lockedVote && !hasSkipped && (
            <div className="p-3 rounded-xl border-2 border-[#DFFF00] bg-[#DFFF00]/20 text-[10px] font-mono font-bold text-center uppercase">
              {language === 'ID'
                ? 'Suara Anda terkunci. Satu suara per ronde.'
                : 'Your vote is locked. One vote per round.'}
            </div>
          )}

          {hasSkipped && (
            <div className="p-3 rounded-xl border-2 border-slate-400 bg-slate-100 text-[10px] font-mono font-bold text-center uppercase text-slate-600">
              {language === 'ID'
                ? 'Anda memilih untuk skip voting ronde ini.'
                : 'You chose to skip voting this round.'}
            </div>
          )}

          {/* Interactive Player Grid with Radio checkings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {livingPlayers.map((player) => {
              const isSelected = selectedPlayerId === player.id && player.id !== 'SKIP';
              const isMe = player.id === currentPlayerId;
              const playerHasVoted = player.votedForId !== undefined;
              return (
                <button
                  key={player.id}
                  disabled={isMe || lockedVote}
                  onClick={() => handleVoteSubmit(player.id)}
                  className={`border-3 border-black rounded-xl p-4 text-center relative transition brutal-press ${
                    isMe || hasVoted
                      ? 'opacity-40 cursor-not-allowed bg-slate-100'
                      : 'bg-white hover:bg-slate-50 cursor-pointer'
                  } ${
                    isSelected ? 'bg-[#FFD23F] brutal-shadow border-[#FF6B35]' : 'brutal-shadow'
                  }`}
                >
                  {/* Select indicator tick tag */}
                  {isSelected && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#FF6B35] text-white border border-black text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase brutal-shadow-sm flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Targeted Voted
                    </span>
                  )}

                  {isMe && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase">
                      YOU (CANT VOTE SELF)
                    </span>
                  )}

                  {/* Show voted/skipped status badge */}
                  {playerHasVoted && !isMe && (
                    <span className="absolute top-2 right-2 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-300 uppercase">
                      {player.votedForId === 'SKIP' ? 'SKIP' : 'VOTED'}
                    </span>
                  )}

                  <div className="flex justify-center mb-2 mt-1">
                    <PixelAvatar avatar={player.avatar} size="md" />
                  </div>

                  <h3 className="font-bold text-sm text-gray-950 font-sans leading-none">{player.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">LVL {player.level}</span>

                  <div className="mt-3 text-[10px] font-bold font-mono text-red-600 bg-red-50 py-1 border border-red-100 rounded">
                    Suara masuk: {player.votesReceived}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Skip Vote Button */}
          {!lockedVote && (
            <button
              onClick={handleSkipVote}
              className="w-full border-2 border-dashed border-slate-400 rounded-xl p-3 text-center text-slate-500 font-mono text-xs font-bold uppercase hover:border-slate-600 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {language === 'ID'
                ? '⏭️ SKIP VOTING (Tidak memilih siapapun)'
                : '⏭️ SKIP VOTING (Don\'t vote for anyone)'}
            </button>
          )}
        </div>

        {/* Orbit control dashboard status detail */}
        <div className="lg:col-span-4 border-3 border-black bg-white rounded-2xl brutal-shadow p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-slate-600 uppercase border-b border-black/10 pb-2">
              SELEKSI DEBAT & ELIMINASI
            </h4>

            <div className="p-4 bg-[#F0EDE6] rounded-xl border-2 border-black space-y-2">
              <span className="text-[10.5px] font-mono text-slate-600 block leading-tight font-extrabold uppercase">
                VOTE MEMILIH / CHOSEN TARGET:
              </span>
              {hasSkipped ? (
                <div className="flex items-center gap-3 bg-slate-100 p-2.5 rounded-lg border border-slate-400">
                  <span className="text-lg">⏭️</span>
                  <div>
                    <span className="text-xs font-bold block leading-none text-slate-600">
                      {language === 'ID' ? 'Skip Voting' : 'Skipped'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">NO VOTE CAST</span>
                  </div>
                </div>
              ) : selectedDisplayName ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-black/35">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
                  <div>
                    <span className="text-xs font-bold block leading-none">
                      {selectedDisplayName}
                    </span>
                    <span className="text-[9px] font-mono text-red-500 mt-1 block">ELIMINATE CONFIRMED</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-mono font-bold text-slate-400 block p-2">
                  Belum memilih / Click any card above to target.
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              {language === 'ID'
                ? 'Suara terbanyak akan langsung dieliminasi. Pastikan obrolan cluemu akurat!'
                : 'Player with highest votes is eliminated immediately. Choose carefully!'}
            </p>
          </div>

          {allVotedOrSkipped ? (
            <div className="pt-6">
              {isHost ? (
                <BrutalButton
                  variant="lime"
                  size="lg"
                  idLabel="KONFIRMASI HASIL HUKUMAN"
                  enLabel="EVALUATE AND ELIMINATE"
                  onClick={onConfirmVotesComplete}
                  className="w-full text-xs"
                  icon={<RefreshCw className="w-4 h-4 ml-1" />}
                />
              ) : (
                <div className="p-3 rounded-xl border-2 border-[#DFFF00] bg-[#DFFF00]/20 text-[10px] font-mono font-bold text-center uppercase">
                  {language === 'ID'
                    ? '✅ Semua suara masuk! Menunggu host konfirmasi eliminasi...'
                    : '✅ All votes in! Waiting for host to confirm elimination...'}
                </div>
              )}
            </div>
          ) : (
            <div className="pt-6">
              <p className="text-[10px] font-mono text-slate-500 text-center uppercase">
                {language === 'ID'
                  ? `Menunggu ${totalLiving - votedCount} pemain lagi memberikan suara...`
                  : `Waiting for ${totalLiving - votedCount} more player(s) to vote...`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// 6. WINNER AND SCOREBOARD SCENE
interface MatchWinnerViewProps {
  winnerRoleType: 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE';
  players: Player[];
  secretWordCivilian: string;
  secretWordUndercover: string;
  onPlayAgain: () => void;
  language: 'ID' | 'EN';
}

export const MatchWinnerView: React.FC<MatchWinnerViewProps> = ({
  winnerRoleType,
  players,
  secretWordCivilian,
  secretWordUndercover,
  onPlayAgain,
  language
}) => {
  useEffect(() => {
    sfx.playVictory();
  }, []);

  return (
    <div className="min-h-dvh bg-[#12182B] text-white flex flex-col justify-center px-4 py-8 max-w-[1280px] mx-auto w-full select-none">
      {/* Visual celebration block */}
      <div className="max-w-[650px] mx-auto w-full text-center space-y-8">
        <div>
          {winnerRoleType === 'CIVILIANS' && (
            <div className="space-y-3">
              <div className="w-24 h-24 rounded-full border-3 border-black bg-[#DFFF00] flex items-center justify-center mx-auto brutal-shadow transform rotate-3">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mt-4">
                SIPIL MENANG!
              </h1>
              <span className="font-mono text-xs text-[#2EC4B6] font-bold block uppercase tracking-widest mt-1">
                CIVILIANS DEFEATED ALL SPIES
              </span>
            </div>
          )}

          {winnerRoleType === 'UNDERCOVERS' && (
            <div className="space-y-3">
              <div className="w-24 h-24 rounded-full border-3 border-black bg-[#FF6B35] flex items-center justify-center mx-auto brutal-shadow transform -rotate-3">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M3 7h2m16 0h-2M7 3l1 2m8-2-1 2M7 21l1-2m8 2-1-2"/>
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mt-4">
                PENYAMAR MENANG!
              </h1>
              <span className="font-mono text-xs text-coral-accent font-bold block uppercase tracking-widest mt-1">
                UNDERCOVERS PENETRATED THE INTEL
              </span>
            </div>
          )}

          {winnerRoleType === 'MR_WHITE' && (
            <div className="space-y-3">
              <div className="w-24 h-24 rounded-full border-3 border-black bg-[#FFD23F] flex items-center justify-center mx-auto brutal-shadow transform rotate-6">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mt-4">
                MR. WHITE MENANG!
              </h1>
              <span className="font-mono text-xs text-sunflower font-bold block uppercase tracking-widest mt-1">
                MR. WHITE DEDUCED THE CODENAME SUCCESSFULLY
              </span>
            </div>
          )}
        </div>

        {/* Word reveal scorecard block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BrutalCard bg="paper" className="p-4 border-2 border-black text-black">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              KATA SIPIL / CIV MERGE
            </span>
            <span className="text-xl font-bold font-display uppercase block text-gray-900 bg-[#DFFF00] px-3 py-1 border border-black rounded inline-block">
              {secretWordCivilian}
            </span>
          </BrutalCard>

          <BrutalCard bg="paper" className="p-4 border-2 border-black text-black">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
              KATA PENYAMAR / UNDER MERGE
            </span>
            <span className="text-xl font-bold font-display uppercase block text-white bg-[#FF6B35] px-3 py-1 border border-black rounded inline-block">
              {secretWordUndercover}
            </span>
          </BrutalCard>
        </div>

        {/* Scoreboard block of points */}
        <BrutalCard bg="paper" className="p-5 border-3 border-black text-black text-left">
          <h3 className="font-mono text-xs font-bold text-slate-400 uppercase mb-3">
            REKAP POIN PERTANDINGAN / MATCH RECAP
          </h3>

          <div className="divide-y border-t border-b border-black divide-b-3 divide-black font-sans text-xs">
            {players.slice(0, 4).map((p) => {
              const gained = winnerRoleType === 'CIVILIANS' && p.role === 'SIVIL' ? 120 : 40;
              return (
                <div key={p.id} className="py-2.5 flex justify-between items-center bg-white/50 px-2">
                  <div className="flex items-center gap-2">
                    <PixelAvatar avatar={p.avatar} size="sm" />
                    <div>
                      <span className="font-bold block text-gray-900 leading-tight">{p.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 block">ROLE: {p.role}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-mono font-bold text-emerald-600 block">+{gained} XP</span>
                    <span className="font-mono font-bold text-amber-600 block">+{Math.floor(gained / 2)} Coins (koin)</span>
                    <span className="font-mono font-bold text-purple-600 block">Streak: +10 Coins</span>
                    <span className="text-[8px] font-mono text-slate-400 block">TOTAL: {p.points + gained} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </BrutalCard>

        {/* Play again button */}
        <div className="pt-4 max-w-sm mx-auto">
          <BrutalButton
            variant="lime"
            size="lg"
            idLabel="MAIN LAGI / LOBBY"
            enLabel="RE-SIMULATE ANOTHER DEBATE"
            onClick={onPlayAgain}
            className="w-full text-base"
            icon={<RefreshCw className="w-4 h-4 ml-1" />}
          />
        </div>
      </div>
    </div>
  );
};
