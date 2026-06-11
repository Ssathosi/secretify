/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, User, HelpCircle, Shield, Trash2, Plus, Play, RefreshCw, 
  Check, ArrowRight, Eye, EyeOff, Clock, AlertTriangle, Trophy, Star, Volume2, Landmark,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Player, RoleType } from '../types';
import { BilingualText, BrutalButton, BrutalCard, PixelAvatar, BrutalBadge, ScallopLine } from './BrutalComponents';
import { sfx } from '../utils/audio';
import { getRandomWordPair } from '../utils/wordPacks';
import { SPECIAL_ROLES_CATALOG, SpecialRoleMeta } from './MetaScreens';

const AVATAR_PRESETS = ['detective', 'cat', 'spy', 'villain', 'hacker', 'boy1', 'girl1', 'boy2', 'glasses-girl', 'monster'];

// ==========================================
// 1. SETUP / LOBBY SCREEN FOR REALITY MODE
// ==========================================
interface RealitySetupProps {
  language: 'ID' | 'EN';
  onStartGame: (players: Player[], wordPack: string, rounds: number, undercoverCount: number, includeMrWhite: boolean, enabledSpecialRoles: string[]) => void;
  onBack: () => void;
}

export const RealitySetupView: React.FC<RealitySetupProps> = ({ language, onStartGame, onBack }) => {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPack, setSelectedPack] = useState('pack_food');
  const [roundsCount, setRoundsCount] = useState(3);
  const [undercovers, setUndercovers] = useState(1);
  const [mrWhite, setMrWhite] = useState(false);
  const [enabledSpecialRoles, setEnabledSpecialRoles] = useState<string[]>([]);
  const [rolesExpanded, setRolesExpanded] = useState(false);
  const [rolesTierFilter, setRolesTierFilter] = useState<'all' | 1 | 2>('all');

  const packs = [
    { id: 'pack_food', idLabel: 'Makanan Indonesia / ID Food', enLabel: 'Indonesian Foods' },
    { id: 'pack_cuisine', idLabel: 'Kuliner Dunia / Global Cuisine', enLabel: 'World Cuisine' },
    { id: 'pack_space', idLabel: 'Luar Angkasa / Outer Space', enLabel: 'Sci-Fi Cosmos' }
  ];

  // Auto-cap rules based on player length
  useEffect(() => {
    const maxUndercovers = Math.max(1, Math.floor(playerNames.length / 3));
    if (undercovers > maxUndercovers) {
      setUndercovers(maxUndercovers);
    }
    // Prevent Mr. White in 3 players
    if (playerNames.length < 4 && mrWhite) {
      setMrWhite(false);
    }
  }, [playerNames.length]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && playerNames.length < 12) {
      const trimmed = newPlayerName.trim().substring(0, 16);
      if (playerNames.includes(trimmed)) {
        sfx.playWarning();
        alert(language === 'ID' ? 'Nama sudah terpakai!' : 'Name is already taken!');
        return;
      }
      setPlayerNames([...playerNames, trimmed]);
      
      // Select random unused avatar or next preset
      const unusedAvatar = AVATAR_PRESETS[playerNames.length % AVATAR_PRESETS.length];
      setAvatars([...avatars, unusedAvatar]);
      setNewPlayerName('');
      sfx.playClick();
    } else if (playerNames.length >= 12) {
      sfx.playWarning();
      alert(language === 'ID' ? 'Maksimum 12 pemain!' : 'Maximum 12 players reached!');
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= 3) {
      sfx.playWarning();
      alert(language === 'ID' ? 'Minimal 3 pemain dibutuhkan!' : 'At least 3 players are required!');
      return;
    }
    const updatedNames = [...playerNames];
    const updatedAvatars = [...avatars];
    updatedNames.splice(index, 1);
    updatedAvatars.splice(index, 1);
    setPlayerNames(updatedNames);
    setAvatars(updatedAvatars);
    sfx.playClick();
  };

  const cycleAvatar = (index: number) => {
    const nextIndex = (AVATAR_PRESETS.indexOf(avatars[index]) + 1) % AVATAR_PRESETS.length;
    const updated = [...avatars];
    updated[index] = AVATAR_PRESETS[nextIndex];
    setAvatars(updated);
    sfx.playClick();
  };

  const toggleRole = (id: string) => {
    setEnabledSpecialRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const filteredCatalog = SPECIAL_ROLES_CATALOG.filter(
    (r) => rolesTierFilter === 'all' || r.tier === rolesTierFilter
  );

  const handleLaunchMode = () => {
    // Generate actual Players roster structures
    const finalPlayers: Player[] = playerNames.map((name, idx) => ({
      id: `${idx + 1}`,
      name,
      avatar: avatars[idx],
      level: 10 + Math.floor(Math.random() * 5),
      points: 1000,
      isReady: true,
      isHost: idx === 0,
      isEliminated: false,
      votesReceived: 0
    }));

    onStartGame(finalPlayers, selectedPack, roundsCount, undercovers, mrWhite, enabledSpecialRoles);
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      {/* Upper Navigation Bar */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center bg-white p-4 rounded-xl brutal-shadow">
        <button
          onClick={onBack}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← {language === 'ID' ? 'KEMBALI' : 'BACK'}
        </button>
        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 bg-[#FF6B35] text-white font-black text-xs font-mono rounded brutal-shadow-sm">
            REALITY
          </span>
          <span className="hidden sm:inline text-xs font-mono text-slate-500 uppercase font-bold">MODE SATU DEVICEMU / SINGLE DEVICE MODE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow mb-6">
        {/* Left Column: Input Player Names (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <BrutalCard bg="paper" className="p-6">
            <BilingualText 
              idText="DAFTARKAN ANGGOTA GRUP" 
              enText="DEFINE PARTY ROSTER" 
              className="text-sm font-bold uppercase mb-4 text-[#FF6B35]"
            />

            {/* Input Name Form */}
            <form onSubmit={handleAddPlayer} className="flex gap-2.5 mb-6">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                maxLength={20}
                placeholder={language === 'ID' ? "Contoh: Budi, Siti..." : "Enter name here..."}
                className="flex-1 border-3 border-black rounded-xl px-4 py-2 bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none placeholder:text-gray-400 text-sm"
              />
              <BrutalButton
                variant="lime"
                type="submit"
                idLabel="PEMAIN"
                enLabel="ADD"
                className="px-5 text-xs"
                icon={<Plus className="w-3.5 h-3.5" />}
              />
            </form>

            {/* Players List Roster Grid */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {playerNames.map((name, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between border-2 border-black bg-white rounded-xl p-2.5 brutal-shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {/* Interactive Avatar button */}
                    <button 
                      onClick={() => cycleAvatar(idx)}
                      className="relative hover:scale-105 active:scale-95 transition"
                      title="Klik untuk ganti karakter / Cycle Avatar"
                    >
                      <PixelAvatar avatar={avatars[idx]} size="sm" />
                      <span className="absolute -bottom-1 -right-1 bg-black text-lime-400 border border-black rounded-sm text-[6px] px-1 py-[0.5px] scale-90 font-mono">CYCLE</span>
                    </button>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500">PEMAIN {idx + 1}</span>
                      <p className="font-bold text-gray-900 text-sm font-sans">{name}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemovePlayer(idx)}
                    className="p-2 border-2 border-transparent hover:border-black rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </BrutalCard>
        </div>

        {/* Right Column: Game Setup / Pack Selection (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <BrutalCard bg="paper" className="p-6">
            <BilingualText 
              idText="PENGATURAN MODE" 
              enText="GAME CONFIGURATION" 
              className="text-sm font-bold uppercase mb-4 text-[#2EC4B6]"
            />

            <div className="space-y-4">
              {/* Select Word Pack */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                  PAKET KATA MISTERI / SECURED PACK
                </label>
                <select
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="w-full border-3 border-black bg-white rounded-xl px-3 py-2.5 font-mono font-bold text-xs shadow-[2px_2px_0px_#000] focus:outline-none"
                >
                  {packs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {language === 'ID' ? p.idLabel : p.enLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Rounds */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                  RONDE MAIN / MATCH ROUNDS ({roundsCount})
                </label>
                <div className="flex gap-2">
                  {[2, 3, 5, 8].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRoundsCount(r); sfx.playClick(); }}
                      className={`flex-1 py-2 border-2 border-black font-mono font-extrabold text-xs rounded-lg brutal-press ${
                        roundsCount === r ? 'bg-[#FFD23F] font-black brutal-shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {r} {language === 'ID' ? 'Ronde' : 'Rds'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Undercovers Count */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700">
                    JUMLAH PENYAMAR / UNDERCOVERS
                  </label>
                  <span className="font-mono text-xs font-bold text-[#FF6B35]">{undercovers} Spy</span>
                </div>
                <div className="flex gap-2">
                  {/* Cap intelligently based on player amount */}
                  {[1, 2].map((u) => {
                    const maxCap = Math.max(1, Math.floor(playerNames.length / 3));
                    const isAllowed = u <= maxCap;
                    return (
                      <button
                        key={u}
                        disabled={!isAllowed}
                        onClick={() => { setUndercovers(u); sfx.playClick(); }}
                        className={`flex-1 py-1.5 border-2 border-black font-mono font-bold text-xs rounded-lg transition disabled:opacity-30 disabled:pointer-events-none brutal-press ${
                          undercovers === u ? 'bg-[#2EC4B6] text-black font-black brutal-shadow-sm' : 'bg-white text-slate-600'
                        }`}
                      >
                        {u} Penyamar
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Include Mr. White */}
              <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-slate-800 flex items-center gap-1.5">
                    Aktifkan Mr. White?
                    <span className="text-[10px] bg-black text-amber-300 font-extrabold px-1 rounded">SPESIAL</span>
                  </span>
                  <p className="text-[9px] text-slate-500 leading-normal max-w-[200px]">
                    {language === 'ID' 
                      ? 'Mr. White tidak punya kata rahasia & menebak kata Sipil.'
                      : 'Mr. White gets NO word & guesses civilian word.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={playerNames.length < 4}
                  onClick={() => { setMrWhite(!mrWhite); sfx.playClick(); }}
                  className={`w-14 h-8 border-2 border-black rounded-xl p-1 flex items-center transition-colors shadow-[2px_2px_0px_#000] ${
                    mrWhite ? 'bg-[#DFFF00]' : 'bg-slate-300'
                  } ${playerNames.length < 4 ? 'opacity-30' : ''}`}
                >
                  <div className={`w-5 h-5 bg-white border border-black rounded-lg transition-transform ${
                    mrWhite ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Special Roles Selector */}
              <div className="pt-2 border-t border-black/10 space-y-2">
                <button
                  type="button"
                  onClick={() => setRolesExpanded(!rolesExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-slate-800">
                      PERAN SPESIAL / SPECIAL ROLES
                    </span>
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
                          onClick={() => setRolesTierFilter(tier)}
                          className={`flex-1 py-1 border-2 border-black font-mono font-bold text-[9px] rounded-md transition brutal-press ${
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
                    <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto pr-1">
                      {filteredCatalog.map((role: SpecialRoleMeta) => {
                        const isOn = enabledSpecialRoles.includes(role.id);
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => toggleRole(role.id)}
                            className={`w-full flex items-center gap-2 border-2 rounded-lg px-2.5 py-1.5 text-left transition brutal-press ${
                              isOn
                                ? 'border-black brutal-shadow-sm'
                                : 'border-black/30 bg-white/80 hover:border-black/60'
                            }`}
                            style={isOn ? { backgroundColor: role.color + '22', borderColor: role.color } : {}}
                          >
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
                        onClick={() => setEnabledSpecialRoles(SPECIAL_ROLES_CATALOG.map(r => r.id))}
                        className="flex-1 text-[9px] font-mono font-bold border-2 border-black bg-white py-1 rounded-lg hover:bg-slate-50 brutal-press"
                      >
                        PILIH SEMUA / ALL
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnabledSpecialRoles([])}
                        className="flex-1 text-[9px] font-mono font-bold border-2 border-black bg-white py-1 rounded-lg hover:bg-slate-50 brutal-press"
                      >
                        HAPUS / CLEAR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto w-full pb-4 space-y-2">
        {playerNames.length < 3 && (
          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-mono font-bold text-[#FF6B35] border-2 border-[#FF6B35] bg-[#FF6B35]/10 rounded-xl py-2 px-4">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
            {language === 'ID'
              ? `Tambah ${3 - playerNames.length} pemain lagi untuk memulai (min. 3)`
              : `Add ${3 - playerNames.length} more player${3 - playerNames.length > 1 ? 's' : ''} to start (min. 3)`}
          </p>
        )}
        <BrutalButton
          variant={playerNames.length >= 3 ? 'lime' : 'gray'}
          size="lg"
          idLabel="BAGIKAN PERAN (MULAI)"
          enLabel="DISTRIBUTE ROLES (START)"
          onClick={handleLaunchMode}
          disabled={playerNames.length < 3}
          className={`w-full text-base py-4 ${playerNames.length >= 3 ? 'animate-bounce' : ''}`}
          icon={<Play className={`w-5 h-5 ${playerNames.length >= 3 ? 'fill-black text-black' : 'fill-slate-400 text-slate-400'}`} />}
        />
      </div>
    </div>
  );
};


// ==========================================
// 2. SEED & REVEAL ROLE / CARD FLIP REVEALER
// ==========================================
interface RealityRevealProps {
  language: 'ID' | 'EN';
  players: Player[];
  civilianWord: string;
  undercoverWord: string;
  onAllRevealed: () => void;
}

export const RealityRoleRevealView: React.FC<RealityRevealProps> = ({
  language,
  players,
  civilianWord,
  undercoverWord,
  onAllRevealed
}) => {
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [peekingWord, setPeekingWord] = useState(false);

  const startPeek = (player: Player) => {
    setActivePlayer(player);
    setPeekingWord(false);
    sfx.playClick();
  };

  const toggleRevealPeek = () => {
    setPeekingWord(!peekingWord);
    sfx.playClick();
  };

  const confirmMemorize = () => {
    if (activePlayer) {
      if (!revealedIds.includes(activePlayer.id)) {
        setRevealedIds([...revealedIds, activePlayer.id]);
      }
      setActivePlayer(null);
      sfx.playClick();
    }
  };

  const allDone = revealedIds.length === players.length;

  return (
    <div className="min-h-dvh bg-[#12182B] text-white py-8 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none relative overflow-hidden">
      <div className="max-w-[500px] mx-auto w-full text-center mb-6">
        <span className="inline-block bg-[#FF6B35] text-white border border-[#FF6B35] text-[10px] font-mono px-3 py-1 rounded-sm uppercase mb-3 font-extrabold tracking-wider">
          PEMBERIAN PERAN / SECURITY ENCRYPTOR
        </span>
        <h2 className="text-3xl font-black font-display tracking-tight leading-none uppercase text-white">
          GILIRAN BIARKAN RAHASIA!
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          {language === 'ID' 
            ? 'Pilih namamu secara bergiliran. Ketuk untuk melihat kata rahasiamu tanpa terlihat teman di sampingmu!'
            : 'Pass the device turn-by-turn. Tap your card to secretly view your secure word!'}
        </p>
      </div>

      {/* Grid of Players Card to be clicked */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-[800px] mx-auto w-full my-auto">
        {players.map((player) => {
          const isRevealed = revealedIds.includes(player.id);
          return (
            <button
              key={player.id}
              disabled={isRevealed && !allDone}
              onClick={() => startPeek(player)}
              className={`border-3 border-black rounded-xl p-4 text-center transition-all brutal-shadow relative cursor-pointer brutal-press ${
                isRevealed 
                  ? 'bg-slate-800 text-slate-500 pointer-events-none opacity-40' 
                  : 'bg-white text-stone-900 shadow-[4px_4px_0px_#FFD23F]'
              }`}
            >
              {isRevealed && (
                <span className="absolute -top-2 right-2 bg-emerald-500 text-white border border-black font-mono text-[8px] px-1.5 rounded font-black">
                  ✓ SELESAI
                </span>
              )}

              <div className="flex justify-center mb-2">
                <PixelAvatar avatar={player.avatar} size="md" />
              </div>

              <h4 className="font-bold text-sm leading-tight line-clamp-1">{player.name}</h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1 block">
                {isRevealed ? 'REVEALED' : 'TAP TO VIEW'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Peek Overlay Filter (Blind fold screen) */}
      <AnimatePresence>
        {activePlayer && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#12182B] flex flex-col justify-center items-center px-4"
          >
            <div className="max-w-[450px] w-full text-center flex flex-col justify-center items-center">
              {!peekingWord ? (
                <div className="space-y-4">
                  <div className="transform rotate-3 flex justify-center">
                    <PixelAvatar avatar={activePlayer.avatar} size="lg" />
                  </div>

                  <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight">
                    {activePlayer.name}, {language === 'ID' ? 'APAKAH ANDA SIAP?' : 'ARE YOU READY?'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {language === 'ID'
                      ? 'Pastikan tidak ada orang lain di dekatmu yang mengintip boks rahasia ini sekarang!'
                      : 'Ensure friends are looking away before expanding your secure credentials!'}
                  </p>

                  <BrutalButton
                    variant="lime"
                    size="lg"
                    idLabel={language === 'ID' ? 'LIHAT PERAN SAYA' : 'REVEAL MY ROLE'}
                    enLabel="REVEAL SECURE CARD"
                    onClick={toggleRevealPeek}
                    className="w-full text-base py-3"
                    icon={<Eye className="w-5 h-5" />}
                  />
                </div>
              ) : (
                <div className="w-full px-2">
                  <BrutalCard bg="paper" className="p-4 border-3 border-black text-stone-900 shadow-[6px_6px_0px_#DFFF00]">
                    <div className="text-center space-y-3">
                      {/* Mini identification bar */}
                      <div className="flex items-center justify-center gap-2 bg-[#F0EDE6] p-1.5 rounded-lg border border-black/10">
                        <PixelAvatar avatar={activePlayer.avatar} size="xs" />
                        <span className="font-mono text-zinc-700 text-xs font-black uppercase">
                          {language === 'ID' ? 'PEMILIK:' : 'PLAYER:'} <strong className="text-slate-900 font-extrabold">{activePlayer.name}</strong>
                        </span>
                      </div>

                      <div>
                        <span className="bg-black text-white px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded font-extrabold">
                          {language === 'ID' ? 'Kredensial Peran' : 'Secure Role'}
                        </span>
                      </div>

                      <h4 className="text-center font-display font-black text-stone-900 text-lg uppercase tracking-tight -mt-1">
                        {activePlayer.role === 'SIVIL' && (language === 'ID' ? 'WARGA SIPIL / CIVILIAN' : 'CIVILIAN')}
                        {activePlayer.role === 'UNDERCOVER' && (language === 'ID' ? 'PENYAMAR / UNDERCOVER' : 'UNDERCOVER')}
                        {activePlayer.role === 'MR_WHITE' && 'MR. WHITE'}
                      </h4>

                      {/* Word display */}
                      <div className="border-2 border-dashed border-black/20 rounded-xl bg-[#FFFBF0] py-3 mx-auto max-w-[260px]">
                        <span className="font-mono text-zinc-400 text-[8px] block font-bold uppercase tracking-widest mb-0.5">
                          KATA RAHASIA / CODEWORD
                        </span>
                        <p className="text-2xl font-black text-[#FF6B35] tracking-tight leading-none">
                          {activePlayer.role === 'MR_WHITE' ? '???' : activePlayer.word}
                        </p>
                      </div>

                      {/* Tutorial text for role */}
                      <p className="text-[10px] text-slate-600 leading-normal max-w-sm mx-auto font-sans font-medium bg-[#F0EDE6] p-2.5 rounded-lg border border-black/10">
                        {activePlayer.role === 'SIVIL' && (
                          language === 'ID'
                            ? 'Dapatkan kata Sipil yang sama dengan rekanmu. Tugasmu: diskusikan petunjuk sehalus mungkin, temukan Penyamar!'
                            : 'Discuss subtle descriptions. Do not make words too obvious to Mr. White, detect spies!'
                        )}
                        {activePlayer.role === 'UNDERCOVER' && (
                          language === 'ID'
                            ? 'Kata kuncimu sedikit berbeda dengan Sipil! Samarkan dirimu, berikan petunjuk membingungkan agar Sipil terkecoh.'
                            : 'Your word is slightly altered from civilians! Frame ambiguous clues to merge and evade elimination.'
                        )}
                        {activePlayer.role === 'MR_WHITE' && (
                          language === 'ID'
                            ? 'Anda TIDAK memiliki kata apa pun! Dengarkan petunjuk Sipil, berpura-puralah tahu kata mereka, jangan sampai dituduh!'
                            : 'You have NO word. Mimic and match civilian phrases instantly. Guess their exact word code on death to WIN!'
                        )}
                      </p>

                      {/* Special Role Card */}
                      {activePlayer.specialRole && (() => {
                        const roleMeta = SPECIAL_ROLES_CATALOG.find(r => r.id === activePlayer.specialRole);
                        if (!roleMeta) return null;
                        return (
                          <div
                            className="w-full rounded-xl border-2 border-black p-3 text-left space-y-1"
                            style={{ backgroundColor: roleMeta.color + '22', borderColor: roleMeta.color }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-sm border border-black/40 shrink-0"
                                style={{ backgroundColor: roleMeta.color }}
                              />
                              <span className="font-mono font-black text-[10px] text-stone-900 uppercase tracking-wide">
                                PERAN SPESIAL: {language === 'ID' ? roleMeta.nameID : roleMeta.nameEN}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-700 font-sans leading-snug">
                              {language === 'ID' ? roleMeta.descShortID : roleMeta.descShortEN}
                            </p>
                          </div>
                        );
                      })()}

                      <BrutalButton
                        variant="sunflower"
                        size="md"
                        idLabel={language === 'ID' ? 'SAYA SUDAH INGAT (SEMBUNYIKAN)' : 'SAYA SUDAH INGAT'}
                        enLabel="I HAVE MEMORIZED (HIDE NOW)"
                        onClick={confirmMemorize}
                        className="w-full text-xs py-2"
                        icon={<EyeOff className="w-4 h-4" />}
                      />
                    </div>
                  </BrutalCard>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[480px] mx-auto w-full pb-4">
        {allDone ? (
          <BrutalButton
            variant="lime"
            size="lg"
            idLabel="LANJUT KE DISKUSI"
            enLabel="PROCEED TO DISCUSSION"
            onClick={onAllRevealed}
            className="w-full text-base py-4 animate-pulse"
            icon={<ArrowRight className="w-5 h-5" />}
          />
        ) : (
          <p className="text-center font-mono text-xs text-slate-500 uppercase font-black">
            {language === 'ID' 
              ? `${revealedIds.length}/${players.length} Pemain Sudah Membaca Peran` 
              : `${revealedIds.length}/${players.length} Players Have Read Secrets`}
          </p>
        )}
      </div>
    </div>
  );
};


// ==========================================
// 3. REALITY DEBATE SCREEN / DISCUSSION
// ==========================================
interface RealityDebateProps {
  language: 'ID' | 'EN';
  players: Player[];
  round: number;
  onProceedToVote: () => void;
}

export const RealityDebateView: React.FC<RealityDebateProps> = ({
  language,
  players,
  round,
  onProceedToVote
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [firstSpeaker, setFirstSpeaker] = useState<string>('');

  const livingPlayers = players.filter((p) => !p.isEliminated);

  // Set randomized starter once
  useEffect(() => {
    if (livingPlayers.length > 0 && !firstSpeaker) {
      const idx = Math.floor(Math.random() * livingPlayers.length);
      setFirstSpeaker(livingPlayers[idx].name);
    }
  }, [livingPlayers, firstSpeaker]);

  // Clock countdown logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sfx.playWarning();
            setIsTimerRunning(false);
            return 0;
          }
          // Tick sound effect on last 5 seconds
          if (prev <= 6) {
            sfx.playClick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center bg-white p-4 rounded-xl brutal-shadow">
        <div>
          <span className="font-mono text-[10px] font-black text-slate-400 block tracking-widest">
            SKENARIO AKTIF / DEBATE TRACKER
          </span>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-gray-900">
            {language === 'ID' ? `RONDE ${round}` : `ROUND ${round}`} / DISKUSI FISIK
          </h2>
        </div>
        <div className="bg-[#DFFF00] text-stone-900 border-2 border-black font-mono font-black text-xs px-3 py-1.5 rounded-lg brutal-shadow-sm rotate-2">
          {language === 'ID' ? 'MATIKAN INTERNET' : 'OFFLINE REALITY'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow mb-6">
        {/* Left Section: Active Clock & Guidance (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <BrutalCard bg="paper" className="p-6 text-center space-y-6 flex-grow flex flex-col justify-center">
            <div>
              <span className="bg-black text-[9px] font-mono font-black text-[#DFFF00] px-2.5 py-1 rounded uppercase">
                PENGATUR WAKTU CLUE / REAL TIME CHRONO
              </span>
            </div>

            {/* Micro Timer Display */}
            <div className="space-y-2">
              <div className="text-6xl font-extrabold font-mono text-zinc-950 tracking-tighter">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { setIsTimerRunning(!isTimerRunning); sfx.playClick(); }}
                  className={`px-4 py-1.5 border-2 border-black font-mono font-extrabold text-xs rounded-lg brutal-press ${
                    isTimerRunning ? 'bg-red-200 text-red-800' : 'bg-lime-200 text-lime-900'
                  }`}
                >
                  {isTimerRunning ? (language === 'ID' ? 'PAUSE' : 'PAUSE') : (language === 'ID' ? 'MULAI' : 'START')}
                </button>
                <button
                  onClick={() => { setTimeLeft(60); setIsTimerRunning(false); sfx.playClick(); }}
                  className="px-4 py-1.5 border-2 border-black bg-white hover:bg-slate-50 font-mono font-extrabold text-xs rounded-lg brutal-press"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-orange-50 border-2 border-black rounded-2xl p-4 text-left space-y-2 relative shadow-[4px_4px_0px_#000]">
              <span className="absolute -top-2.5 left-4 bg-orange-400 text-white font-mono text-[8px] font-black px-2 py-0.5 rounded border border-black uppercase">
                INSTRUKSI GABUNGAN
              </span>
              <p className="text-xs text-slate-700 leading-normal font-medium font-sans">
                {language === 'ID'
                  ? 'Sebutkan SATU KATA deskripsi secara lisan di dunia nyata. Jangan terlalu gamblang agar Mr. White tidak bisa menebak kata Sipil!'
                  : 'Speak exactly ONE descriptive word aloud physically. Do not make codewords too plain, prevent Mr. White from snatching the victory!'}
              </p>
              {firstSpeaker && (
                <div className="pt-2 border-t border-black/10 flex items-center gap-2 text-stone-900 font-mono text-xs font-bold bg-[#DFFF00]/10 p-1 rounded">
                  <span className="text-[#FF6B35]">➔</span>
                  <span>Pembicara Pertama: <strong className="text-[#FF6B35] font-black">{firstSpeaker}</strong></span>
                </div>
              )}
            </div>
          </BrutalCard>
        </div>

        {/* Right Section: Alive players matrix (Col 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <BrutalCard bg="paper" className="p-6 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-black/10 pb-2 mb-3">
                <BilingualText 
                  idText="KELAYAKAN DAFTAR AKTIF" 
                  enText="ACTIVE LIVING CONTESTANTS" 
                  className="text-xs font-bold uppercase text-slate-500"
                />
                <span className="font-mono text-xs font-extrabold text-[#2EC4B6]">
                  {livingPlayers.length}/{players.length} ALIVE
                </span>
              </div>

              {/* Contestants Grid preview layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {livingPlayers.map((player) => (
                  <div 
                    key={player.id}
                    className="border-2 border-black bg-white rounded-xl p-3 text-center brutal-shadow-sm"
                  >
                    <div className="flex justify-center mb-1">
                      <PixelAvatar avatar={player.avatar} size="xs" />
                    </div>
                    <span className="font-extrabold text-xs text-gray-900 leading-tight block truncate">
                      {player.name}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-600 font-black tracking-wide uppercase">
                      ● SURVIVED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-yellow-50 border-2 border-black rounded-xl p-3 flex gap-3 items-center text-left">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-900 font-sans leading-normal font-semibold">
                  Jika semua orang di dunia nyata telah memberikan deskripsinya masing-masing secara fisik, klik tombol di bawah untuk masuk ke panel Voting!
                </p>
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto w-full pb-4">
        <BrutalButton
          variant="lime"
          size="lg"
          idLabel="MASUK KE BILIK SUARA / VOTE"
          enLabel="PROCEED TO BALLOT BOX"
          onClick={onProceedToVote}
          className="w-full text-base py-4 animate-pulse border-3 border-black"
          icon={<Users className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};


// ==========================================
// 4. REALITY VOTING VIEW / BALLOT SCREEN
// ==========================================
interface RealityVotingProps {
  language: 'ID' | 'EN';
  players: Player[];
  onFinishVoting: (votingTallies: Record<string, number>) => void;
}

export const RealityVotingView: React.FC<RealityVotingProps> = ({
  language,
  players,
  onFinishVoting
}) => {
  const [voteMode, setVoteMode] = useState<'secret' | 'quick'>('secret');
  
  // For Secret Mode
  const livingPlayers = players.filter((p) => !p.isEliminated);
  // Ghost players (eliminated with ghost special role) can still vote
  const ghostVoters = players.filter((p) => p.isEliminated && p.specialRole === 'ghost');
  // All valid voters = living + ghosts
  const allVoters = [...livingPlayers, ...ghostVoters];
  const [voterIndex, setVoterIndex] = useState(0);
  const [isVoterBlindOpen, setIsVoterBlindOpen] = useState(true);
  const [secretVotes, setSecretVotes] = useState<Record<string, string>>({}); // { voterId: votedTargetId }

  // For Quick Mode
  const [quickEliminatedId, setQuickEliminatedId] = useState('');

  const currentVoter = allVoters[voterIndex];

  const handleCastSecretVote = (targetId: string) => {
    setSecretVotes({
      ...secretVotes,
      [currentVoter.id]: targetId
    });
    sfx.playClick();
  };

  const handleNextVoter = () => {
    if (voterIndex < allVoters.length - 1) {
      setVoterIndex(voterIndex + 1);
      setIsVoterBlindOpen(true);
      sfx.playClick();
    } else {
      // Calculate tallies
      const tallies: Record<string, number> = {};
      players.forEach((p) => { tallies[p.id] = 0; });
      
      Object.values(secretVotes).forEach((votedId) => {
        const idStr = String(votedId);
        if (tallies[idStr] !== undefined) {
          tallies[idStr]++;
        } else {
          tallies[idStr] = 1;
        }
      });

      onFinishVoting(tallies);
    }
  };

  const handleConfirmQuickVote = () => {
    if (!quickEliminatedId) {
      sfx.playWarning();
      return;
    }
    // Artificial tallies with 100 votes on targeted player to guarantee elimination
    const tallies: Record<string, number> = {};
    players.forEach((p) => {
      tallies[p.id] = p.id === quickEliminatedId ? 99 : 0;
    });
    onFinishVoting(tallies);
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      <div className="border-b-3 border-black pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 rounded-xl brutal-shadow gap-4">
        <div>
          <span className="font-mono text-[10px] font-black text-slate-400 block tracking-widest">
            PANEL VOTING MANDIRI / SECURED DISMISSAL
          </span>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-stone-900">
            BILIK SUARA SATU PERANGKAT
          </h2>
        </div>

        {/* Voting Mode Tab selectors */}
        <div className="flex border-2 border-black rounded-lg overflow-hidden bg-[#F0EDE6] brutal-shadow-sm max-w-[320px]">
          <button
            onClick={() => { setVoteMode('secret'); sfx.playClick(); }}
            className={`flex-1 py-1 px-3 font-mono font-extrabold text-[10px] uppercase transition ${
              voteMode === 'secret' ? 'bg-[#FF6B35] text-white' : 'bg-white text-slate-600'
            }`}
          >
            📋 Gilir & Rahasia
          </button>
          <button
            onClick={() => { setVoteMode('quick'); sfx.playClick(); }}
            className={`flex-1 py-1 px-3 font-mono font-extrabold text-[10px] uppercase transition ${
              voteMode === 'quick' ? 'bg-[#2EC4B6] text-black' : 'bg-white text-slate-600'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline mr-1" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg> Musyawarah Cepat
          </button>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center my-6">
        <div className="max-w-[650px] w-full">
          {/* A. SECRET VOTE OPTION */}
          {voteMode === 'secret' && (
            <AnimatePresence mode="wait">
              {isVoterBlindOpen ? (
                <motion.div 
                  key="blind"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <BrutalCard bg="paper" className="p-8 text-center space-y-6 shadow-[6px_6px_0px_#FF6B35]">
                    <div className="transform rotate-3">
                      <PixelAvatar avatar={currentVoter.avatar} size="xl" />
                    </div>

                    <h3 className="text-2xl font-black font-display text-stone-950 uppercase">
                      GILIRAN: {currentVoter.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                      {language === 'ID'
                        ? 'Harap berikan perangkat ini kepada Pemain bersangkutan. Pastikan tidak ada orang lain di dekatmu yang bisa melihat layarmu!'
                        : 'Please hand over the device to this player. Make sure no one else is looking to keep votes strictly secret.'}
                    </p>

                    <BrutalButton
                      variant="lime"
                      size="lg"
                      idLabel="SAYA SIAP BERIKAN VOTE"
                      enLabel="I AM READY, OPEN BALLOT"
                      onClick={() => { setIsVoterBlindOpen(false); sfx.playClick(); }}
                      className="w-full text-sm"
                      icon={<Eye className="w-5 h-5" />}
                    />
                  </BrutalCard>
                </motion.div>
              ) : (
                <motion.div 
                  key="ballot"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <BrutalCard bg="paper" className="p-6 space-y-5 shadow-[4px_4px_0px_#000]">
                    <div className="border-b border-black/10 pb-2 text-center">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        PEMILIH AKTIF / SECRET BALLOT LIST
                      </span>
                      <h3 className="font-extrabold text-stone-900 font-sans text-sm mt-1">
                        Halo <span className="text-red-500 font-black">{currentVoter.name}</span>, pilih satu target eliminasi menurutmu:
                      </h3>
                    </div>

                    {/* Choose living targets */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {livingPlayers.map((player) => {
                        // Cannot vote for yourself
                        if (player.id === currentVoter.id) return null;
                        const isSelected = secretVotes[currentVoter.id] === player.id;
                        return (
                          <button
                            key={player.id}
                            onClick={() => handleCastSecretVote(player.id)}
                            className={`border-2 border-black rounded-xl p-3 text-center transition scale-button ${
                              isSelected 
                                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000] scale-105 font-black' 
                                : 'bg-white text-stone-800 hover:bg-slate-50 font-semibold'
                            }`}
                          >
                            <div className="flex justify-center mb-1">
                              <PixelAvatar avatar={player.avatar} size="xs" />
                            </div>
                            <span className="text-xs truncate block">{player.name}</span>
                            <span className="text-[8px] font-mono uppercase block text-slate-400 mt-1">
                              {isSelected ? '✓ SELECTED' : 'VOTE TARGET'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Next voter / finish button */}
                    <div className="pt-4 border-t border-black/10">
                      <BrutalButton
                        variant="teal"
                        size="md"
                        disabled={!secretVotes[currentVoter.id]}
                        idLabel={voterIndex < allVoters.length - 1 ? "LANJUT KE PEMILIH BERIKUTNYA" : "SELESAIKAN SUARA & REVEAL"}
                        enLabel={voterIndex < allVoters.length - 1 ? "LOCK VOTE & PASS DEVICE" : "COMPLETE BALLOT & REVEAL"}
                        onClick={handleNextVoter}
                        className="w-full text-xs py-3"
                        icon={<ArrowRight className="w-4 h-4 ml-1" />}
                      />
                    </div>
                  </BrutalCard>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* B. QUICK ELIMINATION OPTION */}
          {voteMode === 'quick' && (
            <BrutalCard bg="paper" className="p-6 space-y-5 shadow-[6px_6px_0px_#2EC4B6]">
              <div className="text-center space-y-2 mb-2">
                <div>
                  <span className="bg-black text-[9px] font-mono text-[#2EC4B6] px-2.5 py-1 rounded uppercase font-black">
                    MUSYAWARAH DEWAN / CONSENSUS BOARD
                  </span>
                </div>
                <h3 className="text-lg font-bold font-sans text-stone-900 leading-tight">
                  Tunjuk Pemain yang Dieliminasi Bersama
                </h3>
                <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
                  {language === 'ID'
                    ? 'Diskusikan & lakukan pemungutan suara dengan angkat tangan di dunia nyata secara bebas. Setelah sepakat, klik nama target di bawah untuk mengeliminasinya secara mutlak!'
                    : 'Debate and vote manually inperson. Once a consensus target is determined, assertively select them below!'}
                </p>
              </div>

              {/* Grid of Living players */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {livingPlayers.map((player) => {
                  const isSelected = quickEliminatedId === player.id;
                  return (
                    <button
                      key={player.id}
                      onClick={() => { setQuickEliminatedId(player.id); sfx.playClick(); }}
                      className={`border-2 border-black rounded-xl p-3.5 text-center transition-all brutal-shadow-sm ${
                        isSelected 
                          ? 'bg-red-500 text-white font-black scale-105' 
                          : 'bg-white hover:bg-slate-50 text-stone-800 font-semibold'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <PixelAvatar avatar={player.avatar} size="xs" />
                      </div>
                      <span className="text-xs block truncate">{player.name}</span>
                      <span className="text-[8px] font-mono uppercase block text-slate-400 mt-1">
                        {isSelected ? '✓ TARGET_ELIM' : 'SELECT TARGET'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-black/10">
                <BrutalButton
                  variant="lime"
                  size="lg"
                  disabled={!quickEliminatedId}
                  idLabel="KONFIRMASI ELIMINASI SEKARANG"
                  enLabel="CONFIRM ELIMINATION NOW"
                  onClick={handleConfirmQuickVote}
                  className="w-full text-xs"
                  icon={<Check className="w-4 h-4 ml-1" />}
                />
              </div>
            </BrutalCard>
          )}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 5. ELIMINATION & REVEAL SCREEN + MR WHITE GUESS
// ==========================================
interface RealityEliminationProps {
  language: 'ID' | 'EN';
  players: Player[];
  eliminatedPlayer: Player;
  civilianWord: string;
  votingTallies: Record<string, number>;
  onGuessResult: (mrWhiteWonDirectly: boolean) => void;
  onProceedNextRound: () => void;
}

export const RealityEliminationView: React.FC<RealityEliminationProps> = ({
  language,
  players,
  eliminatedPlayer,
  civilianWord,
  votingTallies,
  onGuessResult,
  onProceedNextRound
}) => {
  const [mrWhiteWordInput, setMrWhiteWordInput] = useState('');
  const [didMrWhiteGuess, setDidMrWhiteGuess] = useState(false);
  const [guessOutcomeText, setGuessOutcomeText] = useState<{ id: string; en: string } | null>(null);

  const isMrWhite = eliminatedPlayer.role === 'MR_WHITE';

  const handleMrWhiteWordGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (mrWhiteWordInput.trim()) {
      const isCorrect = mrWhiteWordInput.trim().toUpperCase() === civilianWord.toUpperCase();
      setDidMrWhiteGuess(true);
      
      if (isCorrect) {
        setGuessOutcomeText({
          id: "Tebakan TEPAT! Mr. White berhasil mencuri kemenangan karena menebak kata Sipil dengan benar!",
          en: "ACCURATE GUESS! Mr. White guessed the Civilian Word and won instantly!"
        });
        sfx.playVictory();
        setTimeout(() => {
          onGuessResult(true); // Mr. White wins instantly
        }, 3000);
      } else {
        setGuessOutcomeText({
          id: `Tebakan SALAH! Kata yang diketik adalah "${mrWhiteWordInput}", sedangkan kata Sipil asli adalah "${civilianWord}". Mr. White gagal membalas dendam!`,
          en: `INCORRECT GUESS! Word was "${mrWhiteWordInput}" while actual word is "${civilianWord}". Mr White fails to hijack!`
        });
        sfx.playElimination();
      }
    }
  };

  return (
    <div className="min-h-dvh bg-[#12182B] text-white py-8 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      <div className="max-w-[500px] mx-auto w-full text-center">
        <span className="inline-block bg-[#FF6B35] text-white border border-[#FF6B35] text-[10px] font-mono px-3 py-1 rounded-sm uppercase mb-3 font-extrabold tracking-wider">
          KEPUTUSAN DEWAN / SUMMARY LAUNCHPAD
        </span>
        <h2 className="text-3xl font-black font-display tracking-tight leading-none uppercase text-white mb-2">
          HASIL ELIMINASI
        </h2>
      </div>

      <div className="max-w-[550px] mx-auto w-full my-auto space-y-6">
        {/* Tally Box */}
        <BrutalCard bg="paper" className="p-4 border-2 border-black text-stone-900">
          <span className="font-mono text-[9px] font-bold text-slate-400 uppercase block mb-2 border-b border-black/5 pb-1">
            AKUMULASI SUARA / TAB SHEET SUMMARY
          </span>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
            {players.filter(p => !p.isEliminated || p.id === eliminatedPlayer.id).map((p) => {
              const votes = votingTallies[p.id] || 0;
              return (
                <div key={p.id} className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <PixelAvatar avatar={p.avatar} size="xs" />
                    <span className={p.id === eliminatedPlayer.id ? 'font-black text-red-600 line-through' : 'text-slate-800'}>
                      {p.name}
                    </span>
                  </div>
                  <span className="font-mono text-stone-500 font-bold bg-[#F0EDE6] px-2 py-0.5 rounded-md border border-black/5">
                    {votes} {votes > 1 ? 'Votes' : 'Vote'}
                  </span>
                </div>
              );
            })}
          </div>
        </BrutalCard>

        {/* Big Eliminated focus card */}
        <BrutalCard bg="paper" className="p-6 border-3 border-black text-stone-900 border-r-8 border-b-8 shadow-[6px_6px_0px_#FF6B35] relative">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <PixelAvatar avatar={eliminatedPlayer.avatar} size="xl" />
              <div className="absolute -bottom-1 -right-1 bg-red-600 border border-black text-[9px] text-white font-mono px-1 rounded font-black uppercase">
                VOTED OUT
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-black font-display text-red-600 uppercase tracking-tight leading-none">
                {eliminatedPlayer.name}
              </h3>
              <span className="font-mono text-slate-500 text-[10px] font-bold block mt-1">DIELIMINASI DARI GAME / DELETED FROM ACTIVE LIST</span>
            </div>

            {/* Reveal specs */}
            <div className="w-full bg-[#F0EDE6] border-2 border-black rounded-xl p-4 text-center">
              <span className="font-mono text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
                KARTU IDENTITAS ASLI / TRUE CREDENTIALS
              </span>
              <p className="font-mono font-black text-sm uppercase text-gray-800 mb-2">
                PERAN: {eliminatedPlayer.role === 'SIVIL' && (language === 'ID' ? 'WARGA SIPIL' : 'CIVILIAN')}
                {eliminatedPlayer.role === 'UNDERCOVER' && (language === 'ID' ? 'PENYAMAR / SPY' : 'UNDERCOVER')}
                {eliminatedPlayer.role === 'MR_WHITE' && 'MR. WHITE'}
              </p>
              <div className="inline-block bg-orange-100 border border-orange-300 text-[#FF6B35] font-mono text-xs font-black px-4 py-1.5 rounded-sm">
                KATA KUNCI: {eliminatedPlayer.role === 'MR_WHITE' ? 'TIDAK PUNYA / NONE' : eliminatedPlayer.word}
              </div>
            </div>

            {/* C. SPECIAL MR WHITE LAST GUESS INTERFACE */}
            {isMrWhite && !didMrWhiteGuess && (
              <div className="w-full border-2 border-dashed border-red-500 bg-red-50 rounded-xl p-4 space-y-4 mt-2">
                <div className="flex gap-2 items-start justify-center">
                  <Shield className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="text-left select-none">
                    <h4 className="font-bold text-xs text-red-600 uppercase font-sans">MISTERI MR. WHITE! TEBAK KATA</h4>
                    <p className="text-[10px] text-red-900 font-sans leading-normal">
                      Mr. White telah tersingkir namun memiliki satu hak khusus: tebak kata rahasia yang dipegang Sipil saat ini! Jika benar, Mr. White menang seketika!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleMrWhiteWordGuess} className="space-y-3">
                  <input
                    type="text"
                    value={mrWhiteWordInput}
                    onChange={(e) => setMrWhiteWordInput(e.target.value)}
                    required
                    placeholder={language === 'ID' ? "Contoh: RENDANG..." : "Enter word code guess..."}
                    className="w-full border-2 border-black rounded-lg px-3 py-2 bg-white font-mono font-bold text-xs uppercase text-center"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-red-600 text-white font-mono font-black text-xs uppercase border-2 border-black rounded-lg hover:bg-red-700 brutal-shadow-sm brutal-press cursor-pointer"
                  >
                    KIRIM TEBAKAN MAUT
                  </button>
                </form>
              </div>
            )}

            {guessOutcomeText && (
              <div className="w-full bg-[#DFFF00]/10 border border-[#DFFF05] rounded-xl p-3 text-xs leading-relaxed font-sans font-semibold text-stone-900">
                {language === 'ID' ? guessOutcomeText.id : guessOutcomeText.en}
              </div>
            )}
          </div>
        </BrutalCard>
      </div>

      <div className="max-w-[480px] mx-auto w-full pb-4">
        {/* Next button (Only if eliminated is not Mr White, OR Mr White has already guessed and missed) */}
        {(!isMrWhite || (isMrWhite && didMrWhiteGuess && mrWhiteWordInput.trim().toUpperCase() !== civilianWord.toUpperCase())) && (
          <BrutalButton
            variant="lime"
            size="lg"
            idLabel="BERIKUTNYA / EVALUASI"
            enLabel="PROCEED / SCORE CHECK"
            onClick={onProceedNextRound}
            className="w-full text-base py-4"
            icon={<ArrowRight className="w-5 h-5" />}
          />
        )}
      </div>
    </div>
  );
};


// ==========================================
// 6. FINAL VICTORY BOARD / RESULTS
// ==========================================
interface RealityWinnerProps {
  language: 'ID' | 'EN';
  winnerRoleGroup: 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE';
  players: Player[];
  civilianWord: string;
  undercoverWord: string;
  onPlayAgain: () => void;
}

export const RealityWinnerView: React.FC<RealityWinnerProps> = ({
  language,
  winnerRoleGroup,
  players,
  civilianWord,
  undercoverWord,
  onPlayAgain
}) => {
  useEffect(() => {
    sfx.playVictory();
  }, []);

  return (
    <div className="min-h-dvh bg-[#12182B] text-white py-12 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      {/* Sparkles visuals */}
      <div className="text-center max-w-[500px] mx-auto w-full">
        <div className="relative mb-6 mx-auto w-20 h-20 bg-[#DFFF00] text-black rounded-2xl border-3 border-black flex items-center justify-center rotate-6 brutal-shadow">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <span className="inline-block bg-black border border-slate-700 text-[#DFFF00] font-mono text-[10px] px-3 py-1 font-bold rounded uppercase mb-2">
          KOMPETISI BERAKHIR / SECURITY DISCLOSURE
        </span>

        {/* Display Winner Title */}
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
          {winnerRoleGroup === 'CIVILIANS' && (language === 'ID' ? 'SIPIL MENANG!' : 'CIVILIANS WIN!')}
          {winnerRoleGroup === 'UNDERCOVERS' && (language === 'ID' ? 'PENYAMAR MENANG!' : 'UNDERCOVERS WIN!')}
          {winnerRoleGroup === 'MR_WHITE' && 'MR. WHITE MENANG!'}
        </h1>

        <p className="text-xs text-slate-400 leading-normal mt-3 px-4">
          {winnerRoleGroup === 'CIVILIANS' && (
            language === 'ID' 
              ? 'Warga Sipil sukses menyisir & mengeliminasi seluruh penyusup berkat koordinasi deskripsi yang brilian!'
              : 'The Citizens successfully weeded out all spies with rigorous and highly coordinated clues!'
          )}
          {winnerRoleGroup === 'UNDERCOVERS' && (
            language === 'ID' 
              ? 'Sipil terkecoh! Para Penyamar berhasil merangkak menginfiltrasi ke dalam dewan tanpa terdeteksi!'
              : 'Pure evasion! The Undercovers seamlessly infiltrated and outnumbered the Civilian majority!'
          )}
          {winnerRoleGroup === 'MR_WHITE' && (
            language === 'ID' 
              ? 'Pencurian kemenangan! Mr. White berhasil menguji kebenaran dugaannya & menebak kata kunci Sipil dengan jitu!'
              : 'Unbeatable hijack! Mr. White correctly deduced the civilian codeword and snatched the match victory!'
          )}
        </p>

        {/* Word specs panel */}
        <div className="flex gap-3 justify-center mt-6">
          <div className="bg-slate-900 border border-slate-800 p-2 text-center rounded-lg min-w-[150px]">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Kata Sipil</span>
            <span className="text-[#DFFF00] font-mono font-black text-sm">{civilianWord}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-2 text-center rounded-lg min-w-[150px]">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Kata Penyamar</span>
            <span className="text-[#FF6B35] font-mono font-black text-sm">{undercoverWord}</span>
          </div>
        </div>
      </div>

      {/* Roster list breakdown */}
      <div className="max-w-[600px] mx-auto w-full border-3 border-black bg-white text-stone-900 rounded-2xl p-6 shadow-[6px_6px_0px_#FFD23F] my-8 space-y-4">
        <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase block border-b border-black/10 pb-1 mb-2">
          DAFTAR PERAN SEMUA ANGGOTA / COMPLETE PARTY SUMMARY
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {players.map((p) => {
            let badgeType: 'READY' | 'NOT_READY' | 'ALIVE' | 'ELIMINATED' = p.isEliminated ? 'ELIMINATED' : 'ALIVE';
            const isWinner = 
              (winnerRoleGroup === 'CIVILIANS' && p.role === 'SIVIL') ||
              (winnerRoleGroup === 'UNDERCOVERS' && p.role === 'UNDERCOVER') ||
              (winnerRoleGroup === 'MR_WHITE' && p.role === 'MR_WHITE');
            const gained = isWinner ? 120 : 30;

            return (
              <div 
                key={p.id}
                className={`border-2 border-black bg-[#F0EDE6] rounded-xl p-2.5 flex items-center justify-between ${
                  isWinner ? 'bg-amber-100 border-[#FFD23F]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <PixelAvatar avatar={p.avatar} size="xs" />
                    {isWinner && (
                      <span className="absolute -top-1.5 -right-1.5 animate-pulse">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow" fill="#FFD23F" stroke="black" strokeWidth="1"><path d="M2 20h20v-2H2v2zm2-4h16l-2-8-4 4-4-6-4 6-4-4-2 8z"/></svg>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs truncate max-w-[110px] leading-tight flex items-center gap-1">
                      <span>{p.name}</span>
                    </h4>
                    <span className="text-[8px] font-mono text-slate-500 font-bold block uppercase tracking-wide">
                      {p.role === 'SIVIL' && 'SIPIL / CIVIL'}
                      {p.role === 'UNDERCOVER' && 'PENYAMAR'}
                      {p.role === 'MR_WHITE' && 'MR. WHITE'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 select-none">
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 border border-black rounded uppercase ${
                    p.isEliminated ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {p.isEliminated ? 'DEAD' : 'ALIVE'}
                  </span>
                  
                  {/* Rewards Breakdown */}
                  <div className="text-right font-mono text-[9px] mt-1 space-y-0.5">
                    <span className="text-emerald-600 block font-bold">+{gained} XP</span>
                    <span className="text-amber-600 block font-bold">+{Math.floor(gained / 2)} Coins (koin)</span>
                    <span className="text-purple-600 block font-bold">Streak: +10 Coins</span>
                  </div>

                  <span className="text-[7px] font-mono text-slate-400 font-bold tracking-wide">
                    {p.role === 'MR_WHITE' ? '???' : p.word}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[480px] mx-auto w-full pb-4">
        <BrutalButton
          variant="lime"
          size="lg"
          idLabel="BERMAIN LAGI"
          enLabel="PLAY MATCH AGAIN"
          onClick={onPlayAgain}
          className="w-full text-base py-4 shadow-[4px_4px_0px_#000]"
          icon={<RefreshCw className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};
