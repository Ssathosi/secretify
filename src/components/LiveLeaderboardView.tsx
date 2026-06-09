/**
 * LiveLeaderboardView.tsx — Secretify Global Leaderboard
 * Fetches real player rankings from the backend DB and renders a Neubrutalism podium.
 */

import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ChevronLeft } from 'lucide-react';
import { PixelAvatar } from './BrutalComponents';

const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';

interface LeaderboardEntry {
  id: string | number;
  username: string;
  avatar: string;
  points: number;
  level: number;
}

interface LiveLeaderboardViewProps {
  onBack: () => void;
  language: 'ID' | 'EN';
  currentUserId?: string | number;
}

const RANK_COLORS = ['#FFD23F', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export const LiveLeaderboardView: React.FC<LiveLeaderboardViewProps> = ({ onBack, language, currentUserId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${SERVER_URL}/api/leaderboard`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setEntries(data.leaderboard || []);
      setLastUpdated(new Date());
    } catch {
      setError(language === 'ID' ? 'Gagal memuat peringkat.' : 'Failed to load rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-dvh bg-[#12182B] text-white px-4 py-8 max-w-[700px] mx-auto w-full select-none">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-mono font-bold uppercase mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {language === 'ID' ? 'Kembali' : 'Back'}
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative mx-auto w-20 h-20 bg-[#FFD23F] border-4 border-black rounded-2xl flex items-center justify-center rotate-3 shadow-[6px_6px_0px_#FF6B35] mb-4">
          <Trophy className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
          {language === 'ID' ? 'PAPAN PERINGKAT' : 'GLOBAL LEADERBOARD'}
        </h1>
        <span className="font-mono text-xs text-[#DFFF00] uppercase tracking-widest block mt-1">
          {language === 'ID' ? 'TOP AGEN SECRETIFY DUNIA' : 'TOP SECRETIFY AGENTS WORLDWIDE'}
        </span>
        {lastUpdated && (
          <span className="text-slate-500 text-[10px] font-mono block mt-1">
            {language === 'ID' ? 'Diperbarui' : 'Updated'}: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Refresh */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {language === 'ID' ? 'Refresh' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="text-center text-red-400 font-mono text-sm py-8">{error}</div>
      )}

      {loading && !entries.length && (
        <div className="text-center text-slate-400 font-mono text-sm py-12 animate-pulse">
          {language === 'ID' ? 'Memuat peringkat...' : 'Loading rankings...'}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center text-slate-400 font-mono text-sm py-12">
          {language === 'ID' ? 'Belum ada pemain terdaftar.' : 'No registered players yet.'}
        </div>
      )}

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd */}
          {top3[1] && (
            <div className="flex flex-col items-center gap-1 pb-4">
              <span className="text-2xl">{RANK_EMOJIS[1]}</span>
              <PixelAvatar avatar={top3[1].avatar} size="sm" />
              <span className="font-bold text-xs text-white truncate max-w-[70px]">{top3[1].username}</span>
              <span className="font-mono text-[10px] text-slate-400">{top3[1].points.toLocaleString()} pts</span>
              <div className="w-16 h-16 rounded-t-lg border-2 border-black flex items-end justify-center pb-1" style={{ backgroundColor: RANK_COLORS[1] }}>
                <span className="text-black font-black text-xl">2</span>
              </div>
            </div>
          )}
          {/* 1st */}
          {top3[0] && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl animate-bounce">{RANK_EMOJIS[0]}</span>
              <div className="relative">
                <PixelAvatar avatar={top3[0].avatar} size="md" />
                {currentUserId === top3[0].id && (
                  <span className="absolute -top-1 -right-1 bg-[#DFFF00] text-black text-[8px] font-black px-1 rounded border border-black">YOU</span>
                )}
              </div>
              <span className="font-black text-sm text-white truncate max-w-[80px]">{top3[0].username}</span>
              <span className="font-mono text-xs text-[#FFD23F] font-bold">{top3[0].points.toLocaleString()} pts</span>
              <div className="w-20 h-24 rounded-t-lg border-2 border-black flex items-end justify-center pb-1" style={{ backgroundColor: RANK_COLORS[0] }}>
                <span className="text-black font-black text-2xl">1</span>
              </div>
            </div>
          )}
          {/* 3rd */}
          {top3[2] && (
            <div className="flex flex-col items-center gap-1 pb-8">
              <span className="text-2xl">{RANK_EMOJIS[2]}</span>
              <PixelAvatar avatar={top3[2].avatar} size="sm" />
              <span className="font-bold text-xs text-white truncate max-w-[70px]">{top3[2].username}</span>
              <span className="font-mono text-[10px] text-slate-400">{top3[2].points.toLocaleString()} pts</span>
              <div className="w-16 h-10 rounded-t-lg border-2 border-black flex items-end justify-center pb-1" style={{ backgroundColor: RANK_COLORS[2] }}>
                <span className="text-black font-black text-xl">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranks 4-20 */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((entry, i) => {
            const rank = i + 4;
            const isMe = currentUserId === entry.id;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 border-2 rounded-xl p-3 transition-all ${
                  isMe
                    ? 'border-[#DFFF00] bg-[#DFFF00]/10'
                    : 'border-slate-800 bg-[#1A2235] hover:border-slate-600'
                }`}
              >
                <span className="font-mono font-black text-slate-500 text-sm w-6 text-right">{rank}.</span>
                <PixelAvatar avatar={entry.avatar} size="xs" />
                <div className="flex-1 min-w-0">
                  <span className={`font-bold text-sm truncate block ${isMe ? 'text-[#DFFF00]' : 'text-white'}`}>
                    {entry.username} {isMe && <span className="text-[9px] font-mono text-[#DFFF00] border border-[#DFFF00] px-1 rounded">YOU</span>}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">LVL {entry.level}</span>
                </div>
                <span className="font-mono font-black text-sm text-slate-300">{entry.points.toLocaleString()} pts</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
};
