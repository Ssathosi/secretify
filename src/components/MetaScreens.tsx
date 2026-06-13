/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Trophy, Settings, History, Sparkles, User, Shield, Volume2, Music, Check, X, ArrowLeft, Coins, Eye, Star, Key, Smile, Package } from 'lucide-react';
import { ShopItem, LeaderboardUser, MatchHistory } from '../types';
import { BilingualText, BrutalButton, BrutalCard, PixelAvatar, BrutalBadge, PixelStars } from './BrutalComponents';
import { sfx } from '../utils/audio';
import { useUser, useClerk } from '@clerk/clerk-react';
import { isValidClerkKey } from './AuthView';

// 1. PROFILE AND AVATAR STUDIO
interface ProfileViewProps {
  playerName: string;
  avatar: string;
  currentUser?: { id: string | number; username: string; avatar: string; points: number; level: number; coins?: number } | null;
  ownedItemIds?: string[];
  onUpdateNameAndAvatar: (name: string, av: string) => Promise<{ success: boolean; error?: string }>;
  onLogout?: () => void;
  onDeleteAccount?: () => Promise<void>;
  onClose: () => void;
  language: 'ID' | 'EN';
}

const ClerkAccountDetails: React.FC<{
  language: 'ID' | 'EN';
  onDeleteAccount: () => Promise<void>;
  onLogout: () => void;
}> = ({ language, onDeleteAccount, onLogout }) => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      language === 'ID'
        ? 'Apakah Anda yakin ingin menghapus akun secara permanen? Semua data poin dan skor akan hilang.'
        : 'Are you sure you want to permanently delete your account? All points and scores will be lost.'
    );
    if (!confirmDelete) return;

    try {
      // Delete from DB FIRST while the Clerk token is still valid
      await onDeleteAccount();
      // Then delete the Clerk account (invalidates session)
      if (user) {
        try {
          await user.delete();
        } catch (clerkErr) {
          console.warn('Clerk user.delete() failed (may already be removed):', clerkErr);
        }
      }
      
      // Finally, reset UI and go back to login screen
      onLogout();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert(language === 'ID' ? 'Gagal menghapus akun.' : 'Failed to delete account.');
    }
  };

  // Find linked oauth accounts
  const providers = user?.externalAccounts.map(acc => acc.provider) || [];

  return (
    <div className="mt-4 p-4 bg-[#F0EDE6] rounded-xl border-2 border-black space-y-3 text-left">
      <h4 className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-wider">
        {language === 'ID' ? 'Akun Terhubung (Clerk)' : 'Linked Accounts (Clerk)'}
      </h4>
      
      <div className="space-y-1.5">
        {providers.length > 0 ? (
          providers.map((p) => (
            <div key={p} className="flex items-center gap-2 bg-white px-3 py-1.5 border border-black/35 rounded-lg text-xs font-mono font-bold uppercase">
              <span className="text-emerald-600 font-black">●</span> {p} Connected
            </div>
          ))
        ) : (
          <div className="text-xs font-mono text-slate-500">
            {language === 'ID' ? 'Masuk via Email/Password' : 'Logged in via Email/Password'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="w-full py-2 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-lg font-mono text-xs font-bold brutal-press cursor-pointer"
        >
          🔑 {language === 'ID' ? 'Kelola Akun & Koneksi' : 'Manage Account & Bindings'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-500 rounded-lg font-mono text-xs font-bold brutal-press cursor-pointer"
        >
          ⚠️ {language === 'ID' ? 'Hapus Akun Permanen' : 'Delete Account Permanently'}
        </button>
      </div>
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  playerName,
  avatar,
  currentUser,
  ownedItemIds = [],
  onUpdateNameAndAvatar,
  onLogout,
  onDeleteAccount,
  onClose,
  language
}) => {
  const [editingName, setEditingName] = useState(playerName);
  const [activeAvatar, setActiveAvatar] = useState(avatar);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const avatarsList = ['detective', 'cat', 'spy', 'villain', 'hacker', 'boy1', 'girl1', 'boy2', 'glasses-girl', 'monster'];

  // Map shop item IDs to avatar names for owned check
  const shopToAvatarMap: Record<string, string> = {
    'shop_det': 'detective',
    'shop_spy': 'spy',
    'shop_vil': 'villain',
    'shop_hack': 'hacker',
  };
  const shopAvatarNames = Object.values(shopToAvatarMap);
  const isAvatarLocked = (avName: string) => {
    if (!shopAvatarNames.includes(avName)) return false; // base avatars are free
    const itemId = Object.entries(shopToAvatarMap).find(([, v]) => v === avName)?.[0];
    return itemId ? !ownedItemIds.includes(itemId) : false;
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      setSaveError(language === 'ID' ? 'Nama tidak boleh kosong.' : 'Name cannot be empty.');
      setSaveSuccess(false);
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const result = await onUpdateNameAndAvatar(editingName.trim(), activeAvatar);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => onClose(), 900);
      } else {
        setSaveError(result.error || (language === 'ID' ? 'Gagal menyimpan profil.' : 'Failed to save profile.'));
      }
    } catch (err: any) {
      setSaveError(err?.message || (language === 'ID' ? 'Terjadi kesalahan.' : 'An error occurred.'));
    } finally {
      setSaving(false);
    }
  };

  const handleLocalDelete = async () => {
    const confirmDelete = window.confirm(
      language === 'ID'
        ? 'Apakah Anda yakin ingin menghapus akun secara permanen? Semua data poin dan skor akan hilang.'
        : 'Are you sure you want to permanently delete your account? All points and scores will be lost.'
    );
    if (confirmDelete && onDeleteAccount) {
      await onDeleteAccount();
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Top Header */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center">
        <button
          onClick={onClose}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← Kembali / Close
        </button>
        <BilingualText idText="STUDIO AVATAR & PROFIL" enText="AVATAR DEBATOR LAB" className="text-right uppercase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mb-6">
        {/* Left editor (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <BrutalCard bg="paper" className="p-6">
            <h3 className="font-mono text-xs font-bold uppercase text-slate-700 mb-4">
              EDIT IDENTITAS AGEN / PROXY SECURITY ALIAS
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-mono font-bold uppercase text-slate-800">
                  NAMA SAMARAN / ALIAS CODENAME
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength={18}
                    className="flex-1 border-3 border-black rounded-xl px-4 py-2 bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:ring-4 focus:ring-[#2EC4B6] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-3 text-xs font-mono font-bold uppercase text-slate-800">
                  COSMETIC SKINS & CHIPS AVAILABLE
                </label>

                <div className="grid grid-cols-5 gap-3 p-3 bg-[#F0EDE6] rounded-xl border-2 border-black">
                  {avatarsList.map((av) => {
                    const locked = isAvatarLocked(av);
                    return (
                      <button
                        key={av}
                        onClick={() => !locked && setActiveAvatar(av)}
                        disabled={locked}
                        className={`p-1 rounded-lg border-2 flex items-center justify-center transition-all relative ${
                          activeAvatar === av
                            ? 'bg-[#FFD23F] border-black brutal-shadow-sm scale-105 font-black'
                            : locked
                              ? 'bg-slate-200 border-black/20 opacity-50 cursor-not-allowed'
                              : 'bg-white border-black/35 hover:bg-black/5 cursor-pointer'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <PixelAvatar avatar={av} size="sm" className="w-full h-full border-none shadow-none" />
                        </div>
                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <span className="text-xs">🔒</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                  <X className="w-3.5 h-3.5 shrink-0" /> {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-lg px-3 py-2 text-xs text-green-700 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" /> {language === 'ID' ? 'Profil berhasil disimpan!' : 'Profile saved successfully!'}
                </div>
              )}
              <BrutalButton
                variant="teal"
                idLabel={saving ? 'Menyimpan...' : 'SIMPAN PERUBAHAN PROFILE'}
                enLabel={saving ? 'Saving...' : 'COMMIT PROTOCOL UPDATES'}
                onClick={handleUpdate}
                className="w-full disabled:opacity-50"
                disabled={saving}
                icon={<Check className="w-4 h-4" />}
              />
            </div>
          </BrutalCard>
        </div>

        {/* Right Stats (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <BrutalCard bg="paper" className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <PixelAvatar avatar={activeAvatar} size="xl" />
                <div className="absolute -bottom-2 -right-2 bg-[#DFFF00] text-black border-2 border-black font-mono font-black text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide">
                  LVL {currentUser ? currentUser.level : 1}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{editingName}</h3>
            <span className="text-xs font-mono text-slate-400 font-bold block uppercase mb-6">
              {currentUser ? 'SECRETIFY REGISTERED AGENT' : 'GUEST AGENT'}
            </span>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-[#F0EDE6] p-4 rounded-xl border-2 border-black">
              <div className="text-center p-2.5 bg-white border border-black/35 rounded-lg col-span-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">TOTAL POINTS (XP)</span>
                <span className="text-2xl font-black font-mono tracking-tight text-gray-900">
                  {currentUser ? currentUser.points.toLocaleString() : 0}
                </span>
              </div>
            </div>

            {currentUser && onLogout && (
              <button
                onClick={onLogout}
                className="w-full mt-2 border-2 border-red-500 text-red-500 bg-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                {language === 'ID' ? 'Keluar Akun (Log Out)' : 'Log Out'}
              </button>
            )}
            {!currentUser && onLogout && (
              <button
                onClick={onLogout}
                className="w-full mt-2 border-2 border-black bg-[#DFFF00] text-black font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#c4e000] cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
              >
                {language === 'ID' ? 'Masuk / Daftar Akun (Log In)' : 'Log In / Register'}
              </button>
            )}

            {currentUser && isValidClerkKey && onDeleteAccount && onLogout && (
              <ClerkAccountDetails language={language} onDeleteAccount={onDeleteAccount} onLogout={onLogout} />
            )}

            {currentUser && !isValidClerkKey && onDeleteAccount && (
              <button
                type="button"
                onClick={handleLocalDelete}
                className="w-full mt-2 border-2 border-red-500 text-red-500 bg-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 cursor-pointer brutal-press"
              >
                ⚠️ {language === 'ID' ? 'Hapus Akun Permanen' : 'Delete Account Permanently'}
              </button>
            )}

            <div className="p-3.5 bg-[#FF6B35]/10 border-2 border-[#FF6B35] rounded-xl text-left flex items-start gap-3">
              <Trophy className="w-5 h-5 shrink-0 text-[#FF6B35] mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-red-700 uppercase">TIER S: EXPERT DEBATOR</span>
                <span className="text-[10px] font-mono text-slate-500">Secured ranking in top 5% worldwide. Keep guessing correctly!</span>
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
};


// 2. COSMETIC TOKO (SHOP) WITH COMMITTED ACTIONS
interface ShopViewProps {
  shopItems: ShopItem[];
  language: 'ID' | 'EN';
  coins: number;
  ownedItemIds: string[];
  onPurchase: (item: ShopItem) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ shopItems, language, coins, ownedItemIds, onPurchase, onClose }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'character' | 'wordpack' | 'emoji'>('all');
  const [purchaseToast, setPurchaseToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredItems = shopItems.filter(
    (item) => filterTab === 'all' || item.category === filterTab
  );

  const showToast = (message: string, type: 'success' | 'error') => {
    setPurchaseToast({ message, type });
    setTimeout(() => setPurchaseToast(null), 3000);
  };

  const handlePurchase = async (item: ShopItem) => {
    if (ownedItemIds.includes(item.id)) {
      showToast(language === 'ID' ? 'Item sudah dimiliki!' : 'Already owned!', 'error');
      sfx.playWarning();
      return;
    }
    if (coins < item.cost) {
      showToast(language === 'ID' ? 'Koin tidak cukup!' : 'Not enough coins!', 'error');
      sfx.playWarning();
      return;
    }

    const result = await onPurchase(item);
    if (result.success) {
      sfx.playCoinChime();
      showToast(
        language === 'ID'
          ? `Berhasil membeli ${item.nameID}! 🎉`
          : `Successfully purchased ${item.nameEN}! 🎉`,
        'success'
      );
    } else {
      sfx.playWarning();
      showToast(result.error || 'Purchase failed.', 'error');
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Top action bar */}
      <div className="border-b-3 border-black pb-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
          >
            ← Kembali / close
          </button>
          <BilingualText idText="TOKO COSMETIC SECURED" enText="DIGITAL COSMETIC SHIPYARD" className="uppercase" />
        </div>

        {/* Currency Safe Block */}
        <div className="flex border-3 border-black bg-white rounded-xl brutal-shadow p-2 px-4 self-end items-center gap-3">
          <Coins className="w-5 h-5 text-amber-500 animate-spin" />
          <div>
            <span className="text-[8px] font-mono text-slate-400 uppercase font-extrabold block">DOMPET / WALLET</span>
            <span className="font-mono text-base font-black text-black">{coins} GC</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all', 'character', 'wordpack', 'emoji'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab as any)}
            className={`border-2 border-black rounded-lg px-3.5 py-1.5 font-mono text-[10.5px] font-bold uppercase transition brutal-press ${
              filterTab === tab
                ? 'bg-[#FFD23F] brutal-shadow-sm scale-102'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            {tab === 'all' && 'SEMUA ITEMS'}
            {tab === 'character' && <><User className="w-3.5 h-3.5 inline mr-1" />KARAKTER / SKINS</>}
            {tab === 'wordpack' && <><Key className="w-3.5 h-3.5 inline mr-1" />WORD PACKS</>}
            {tab === 'emoji' && <><Smile className="w-3.5 h-3.5 inline mr-1" />CHAT REAKSI / EMOJI</>}
          </button>
        ))}
      </div>

      {/* Purchase Toast Notification */}
      {purchaseToast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border-3 border-black font-mono text-xs font-bold brutal-shadow animate-bounce ${
          purchaseToast.type === 'success'
            ? 'bg-[#DFFF00] text-black'
            : 'bg-[#FF6B35] text-white'
        }`}>
          {purchaseToast.type === 'success' ? '✅' : '⚠️'} {purchaseToast.message}
        </div>
      )}

      {/* Main Shop Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 mb-6">
        {filteredItems.map((item) => {
          const isOwned = ownedItemIds.includes(item.id);
          const cannotAfford = coins < item.cost;
          return (
            <BrutalCard
              key={item.id}
              bg="paper"
              className={`p-5 flex flex-col justify-between border-3 border-black ${
                isOwned ? 'bg-zinc-50 border-gray-400' : ''
              }`}
            >
              <div>
                {/* Upper line: Rarity or Type tag & cost */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-mono bg-black text-white px-2 py-0.5 rounded uppercase font-black">
                    {item.rarity || item.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-xs">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-500" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5 1.1 2.5 2.5c0 2.5-5 2.5-5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    <span>{item.cost} GC</span>
                  </div>
                </div>

                {/* Portrait preview center */}
                <div className="flex items-center gap-4 mb-4">
                  {item.category === 'character' && item.avatarSvg ? (
                    <PixelAvatar avatar={item.avatarSvg} size="md" />
                  ) : item.category === 'emoji' ? (
                    <div className="w-14 h-14 border-3 border-black rounded-xl bg-slate-900 flex items-center justify-center text-3xl brutal-shadow-sm text-center">
                      {item.imgUrl}
                    </div>
                  ) : (
                    <div className="w-14 h-14 border-3 border-black rounded-xl bg-[#2EC4B6] flex items-center justify-center brutal-shadow-sm">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-base text-gray-950 font-display uppercase tracking-tight leading-none mb-1">
                      {language === 'ID' ? item.nameID : item.nameEN}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans font-medium line-clamp-2 leading-relaxed">
                      {language === 'ID' ? item.descriptionID : item.descriptionEN}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase button control */}
              <div>
                {isOwned ? (
                  <span className="flex items-center justify-center gap-1.5 w-full border border-emerald-400 bg-emerald-50 text-emerald-800 text-center font-mono font-bold text-xs rounded-xl py-2 px-3">
                    <Check className="w-3.5 h-3.5" />
                    MILIK ANDA / OWNED
                  </span>
                ) : (
                  <BrutalButton
                    variant={cannotAfford ? 'gray' : 'lime'}
                    idLabel="AMBIL / BELI"
                    enLabel="PAY SECURED COINS"
                    disabled={cannotAfford}
                    onClick={() => handlePurchase(item)}
                    className="w-full text-xs py-2"
                  />
                )}
              </div>
            </BrutalCard>
          );
        })}
      </div>
    </div>
  );
};


// 3. LEADERBOARDS RANKINGS
interface LeaderboardsViewProps {
  leaderboardUsers: LeaderboardUser[];
  language: 'ID' | 'EN';
  onClose: () => void;
}

export const LeaderboardsView: React.FC<LeaderboardsViewProps> = ({
  leaderboardUsers,
  language,
  onClose
}) => {
  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Top Header info */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center bg-white p-4 rounded-xl brutal-shadow">
        <button
          onClick={onClose}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← Kembali / Close
        </button>
        <BilingualText idText="PERINGKAT TERBAIK DUNIA" enText="GLOBAL DEBATOR SCOREBOARD" className="text-right uppercase" />
      </div>

      {/* Podium highlight box (For rank 1, 2, 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Silver Rank 2 */}
        <div className="border-3 border-black bg-white rounded-2xl p-5 text-center brutal-shadow relative md:order-1 order-2">
          <div className="absolute top-2 left-2 w-7 h-7 rounded-sm border-2 border-black bg-zinc-200 text-black font-mono font-black text-xs flex items-center justify-center shadow-[1px_1px_0_#000]">
            #2
          </div>
          <div className="flex justify-center mb-2">
            <PixelAvatar avatar="sci-fi" size="md" />
          </div>
          <h4 className="font-bold text-sm text-gray-900 leading-none mb-1">Agent_Frost</h4>
          <span className="text-[10px] font-mono text-slate-400 block mb-3">LVL 88</span>
          <span className="font-mono text-sm font-bold bg-[#F0EDE6] px-3 py-1 rounded-md border border-black/35 text-slate-800">
            128.450 XP
          </span>
        </div>

        {/* Gold Rank 1 */}
        <div className="border-3 border-black bg-[#FFD23F] rounded-2xl p-6 text-center brutal-shadow-lg relative scale-102 border-amber-600 md:order-2 order-1 md:-mt-3">
          <div className="absolute top-2 left-2 w-8 h-8 rounded-sm border-2 border-black bg-yellow-400 text-black font-mono font-black text-sm flex items-center justify-center brutal-shadow-sm">
            #1
          </div>
          <span className="absolute -top-3 right-4 transform rotate-12 bg-black text-[#DFFF00] font-mono text-[9px] font-black px-2 py-0.5 border border-black rounded shadow-[1px_1px_0_#000] flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="#FFD23F"><path d="M2 20h20v-2H2v2zm2-4h16l-2-8-4 4-4-6-4 6-4-4-2 8z"/></svg> CHAMPION
          </span>

          <div className="flex justify-center mb-2">
            <PixelAvatar avatar="ninja" size="lg" />
          </div>
          <h4 className="font-bold text-base text-gray-900 leading-none mb-1">SHADOW_MASTER</h4>
          <span className="text-[10px] font-mono text-amber-900 font-extrabold block mb-3">LVL 99</span>
          <span className="font-mono text-base font-extrabold bg-white px-4 py-1.5 rounded-lg border-2 border-black text-black">
            150.200 XP
          </span>
        </div>

        {/* Bronze Rank 3 */}
        <div className="border-3 border-black bg-white rounded-2xl p-5 text-center brutal-shadow relative md:order-3 order-3">
          <div className="absolute top-2 left-2 w-7 h-7 rounded-sm border-2 border-black bg-amber-700 text-white font-mono font-black text-xs flex items-center justify-center shadow-[1px_1px_0_#000]">
            #3
          </div>
          <div className="flex justify-center mb-2">
            <PixelAvatar avatar="girl2" size="md" />
          </div>
          <h4 className="font-bold text-sm text-gray-900 leading-none mb-1">Techno_Ghost</h4>
          <span className="text-[10px] font-mono text-slate-400 block mb-3">LVL 64</span>
          <span className="font-mono text-sm font-bold bg-[#F0EDE6] px-3 py-1 rounded-md border border-black/35 text-slate-800">
            98.100 XP
          </span>
        </div>
      </div>

      {/* Comprehensive list table for lower rank indices */}
      <div className="border-3 border-black rounded-2xl bg-white p-5 brutal-shadow flex-1">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-4 block">
          TABEL UTAMA PERINGKAT AGEN / GLOBAL LEADER MATRIX
        </span>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {leaderboardUsers.map((user) => (
            <div
              key={user.rank}
              className={`border-2 border-black rounded-xl p-3 flex items-center justify-between transition-all ${
                user.isYou
                  ? 'bg-[#DFFF00]/15 border-2 border-[#DFFF00] shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm text-black/60 w-6">
                  {user.rank}
                </span>

                <PixelAvatar avatar={user.avatarSvg} size="sm" className="w-10 h-10" />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-sans text-xs text-gray-950 block leading-tight">
                      {user.name}
                    </span>
                    {user.isYou && (
                      <span className="bg-black text-[7px] font-mono text-[#DFFF00] px-1 rounded uppercase font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold block mt-0.5 uppercase">
                    Level {user.level} • VIP MEMBER
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-black text-slate-800">
                {user.points.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// 4. HISTORICAL RECAP LOGS
interface MatchHistoryViewProps {
  historyData: MatchHistory[]; // Fallback mock
  currentUser?: { id: string | number; username: string; avatar: string; points: number; level: number } | null;
  language?: 'ID' | 'EN';
  onClose: () => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({ historyData, currentUser, language = 'ID', onClose }) => {
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!currentUser?.id) return;
    setLoading(true);
    const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';
    fetch(`${SERVER_URL}/api/users/${currentUser.id}/history`)
      .then((res) => res.json())
      .then((data) => setLiveHistory(data.history || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Use live history if logged in, otherwise use mock history
  const displayHistory = currentUser ? liveHistory : historyData;
  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Top row */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center bg-white p-4 rounded-xl brutal-shadow">
        <button
          onClick={onClose}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← Kembali / Close
        </button>
        <BilingualText idText="LOG RIWAYAT PERMAINAN" enText="SECURE ARCHIVED SESSIONS" className="text-right uppercase" />
      </div>

      {/* Match feed list boxes */}
      <div className="space-y-4 flex-1 mb-6">
        {loading && (
          <div className="text-center font-mono text-slate-400 text-sm p-4">Loading history...</div>
        )}
        {!loading && displayHistory.length === 0 && (
          <div className="text-center font-mono text-slate-400 text-sm p-4">
            {language === 'ID' ? 'Belum ada riwayat permainan.' : 'No match history yet.'}
          </div>
        )}
        {!loading && displayHistory.map((record, idx) => {
          const isWin = currentUser ? record.won === 1 : record.isWin;
          const role = currentUser ? record.role : record.role;
          const pointsEarned = currentUser ? record.points_gained : record.pointsEarned;
          const dateStr = currentUser ? new Date(record.played_at).toLocaleString() : record.date;
          const roomCode = currentUser ? record.room_code : record.mode; // map mode -> room_code visually

          return (
            <BrutalCard
              key={currentUser ? idx : record.id}
              bg="paper"
              className="p-5 flex flex-col md:flex-row justify-between md:items-center border-3 border-black gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shrink-0 brutal-shadow-sm ${
                    isWin ? 'bg-[#DFFF00]' : 'bg-[#FF6B35]'
                  }`}
                >
                  {isWin
                    ? <Check className="w-5 h-5 text-black" />
                    : <X className="w-5 h-5 text-white" />
                  }
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-black">
                      ROOM: {roomCode}
                    </span>
                    <span className="bg-[#F0EDE6] border border-black/35 text-[8.5px] font-mono font-bold px-1.5 rounded text-slate-600 uppercase">
                      {dateStr}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 mt-2 font-display uppercase">
                    ROLE: {role}
                    {record.special_role ? ` (${record.special_role})` : ''}
                  </h4>
                </div>
              </div>

              {/* Accrued reward point banner */}
              <div className="text-right flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-none border-black/10 pt-2.5 md:pt-0">
                <span className="text-[10px] font-sans text-slate-400 font-bold block uppercase md:mb-1">
                  SKORING / REWARDS
                </span>
                <span
                  className={`font-mono text-sm font-extrabold border-2 border-black px-2.5 py-1 rounded-lg ${
                    pointsEarned >= 0
                      ? 'bg-[#DFFF00] text-black shadow-[1.5px_1.5px_0_#000]'
                      : 'bg-[#FF6B35] text-white shadow-[1.5px_1.5px_0_#000]'
                  }`}
                >
                  {pointsEarned >= 0 ? `+${pointsEarned}` : pointsEarned} XP
                </span>
              </div>
            </BrutalCard>
          );
        })}
      </div>
    </div>
  );
};


// 5. SYSTEM SETTINGS CONTROL
interface SettingsViewProps {
  language: 'ID' | 'EN';
  onToggleLanguage: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onToggleLanguage,
  onClose
}) => {
  const [soundVol, setSoundVol] = useState(sfx.getSoundVolumePercent());
  const [bgmVol, setBgmVol] = useState(sfx.getBgmVolumePercent());
  const [checkedInvite, setCheckedInvite] = useState(true);

  const handleSoundChange = (val: number) => {
    setSoundVol(val);
    sfx.setSoundVolume(val);
    sfx.playClick();
  };

  const handleBgmChange = (val: number) => {
    setBgmVol(val);
    sfx.setBgmVolume(val);
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between">
      {/* Top Banner */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center">
        <button
          onClick={onClose}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← Kembali / Close
        </button>
        <BilingualText idText="PENGATURAN SYSTEM" enText="CLIENT SYSTEM CONFIG" className="text-right uppercase" />
      </div>

      <div className="max-w-[600px] mx-auto w-full bg-white border-3 border-black rounded-2xl brutal-shadow p-6 space-y-6 flex-1 mb-6">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-gray-950 mb-2 uppercase">
            {language === 'ID' ? 'PENGATURAN UTAMA' : 'PREFERENCES MATRIX'}
          </h2>
          <span className="text-[10px] text-slate-400 font-mono font-extrabold uppercase">SECRETIFY DEV CONTROL PLATFORM</span>
        </div>

        {/* Change Language widget block */}
        <div className="border-2 border-black rounded-xl p-4 bg-[#F0EDE6] space-y-3">
          <BilingualText idText="Bahasa Utama / Language" enText="BILINGUAL SUBTITLE TOGGLE" className="text-xs uppercase" />
          <div className="flex gap-2">
            <button
              onClick={() => { if (language !== 'ID') onToggleLanguage(); }}
              className={`flex-1 border-2 border-black rounded-lg py-2.5 text-center font-mono text-xs font-bold transition brutal-press ${
                language === 'ID' ? 'bg-[#DFFF00] brutal-shadow-sm' : 'bg-white'
              }`}
            >
              INDONESIAN (UTAMA)
            </button>
            <button
              onClick={() => { if (language !== 'EN') onToggleLanguage(); }}
              className={`flex-1 border-2 border-black rounded-lg py-2.5 text-center font-mono text-xs font-bold transition brutal-press ${
                language === 'EN' ? 'bg-[#DFFF00] brutal-shadow-sm' : 'bg-white'
              }`}
            >
              ENGLISH (SUBTITLES)
            </button>
          </div>
        </div>

        {/* Sliders for multimedia volume controls */}
          <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase">EFEK SUARA / GAME SOUND FX</span>
              <span className="text-xs font-mono font-bold">{soundVol}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={soundVol}
                onChange={(e) => handleSoundChange(Number(e.target.value))}
                className="w-full accent-[#FF6B35] h-2 bg-[#F0EDE6] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase font-bold">MUSIC LATAR / BACKBONE BGM</span>
              <span className="text-xs font-mono font-bold">{bgmVol}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVol}
                onChange={(e) => handleBgmChange(Number(e.target.value))}
                className="w-full accent-[#2EC4B6] h-2 bg-[#F0EDE6] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Checkbox inputs toggle */}
        <div className="border-t border-black/10 pt-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block text-gray-900 uppercase">Izinkan Undangan Ruangan</span>
            <span className="text-[10px] text-slate-500 font-mono">Allow peer game invites dynamically</span>
          </div>

          <button
            type="button"
            onClick={() => setCheckedInvite(!checkedInvite)}
            className={`w-6 h-6 border-2 border-black rounded transition-all flex items-center justify-center ${
              checkedInvite ? 'bg-[#DFFF00]' : 'bg-white'
            }`}
          >
            {checkedInvite && <Check className="w-4 h-4 text-black" />}
          </button>
        </div>

        {/* Flush secure parameters */}
        <div className="border-t border-black/10 pt-4 text-center">
          <p className="text-[10px] text-slate-400 font-mono mb-2">CLIENT_SECURE_HASH: SHA256-R7F4EE4</p>
          <button
            type="button"
            className="text-[10px] font-mono font-bold text-red-500 border border-red-300 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg"
            onClick={() => {
              sfx.playWarning();
              alert(language === 'ID' ? 'Memori Cache Dihapus! / Cache memory flushed.' : 'Secure memory cache cleared.');
            }}
          >
            BERSIHKAN CACHE SYSTEM / FLUSH STORAGE
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. SPECIAL ROLES GUIDE (PANDUAN PERAN) — Screen 21

// Exported lightweight catalog for role selection in Lobby & Reality Setup
export interface SpecialRoleMeta {
  id: string;
  nameID: string;
  nameEN: string;
  tier: 1 | 2;
  color: string;
  descShortID: string;
  descShortEN: string;
}

export const SPECIAL_ROLES_CATALOG: SpecialRoleMeta[] = [
  { id: 'clown',      nameID: 'Badut Bahagia',   nameEN: 'Happy Clown',       tier: 1, color: '#FF6B35', descShortID: 'Menang jika dieliminasi pertama',         descShortEN: 'Wins if eliminated first' },
  { id: 'boomerang',  nameID: 'Bumerang',         nameEN: 'Boomerang',         tier: 1, color: '#2EC4B6', descShortID: 'Suara berbalik ke para pemilih',           descShortEN: 'Votes returned to voters' },
  { id: 'justice',    nameID: 'Dewi Keadilan',    nameEN: 'Goddess of Justice',tier: 1, color: '#FFD23F', descShortID: 'Putuskan pemenang saat seri',               descShortEN: 'Breaks ties on elimination' },
  { id: 'ghost',      nameID: 'Hantu',            nameEN: 'Ghost',             tier: 1, color: '#9B5DE5', descShortID: 'Tetap bisa voting setelah mati',            descShortEN: 'Votes after elimination' },
  { id: 'lovers',     nameID: 'Lovers',           nameEN: 'Lovers',            tier: 1, color: '#EC4899', descShortID: 'Dua pemain terhubung secara rahasia',       descShortEN: 'Two players secretly linked' },
  { id: 'mrmeme',     nameID: 'Mr. Meme',         nameEN: 'Mr. Meme',          tier: 1, color: '#8B5CF6', descShortID: 'Paksa pemain beri clue diam (gestur)',       descShortEN: 'Forces silent gesture clues' },
  { id: 'falafel',    nameID: 'Penjual Falafel',  nameEN: 'Falafel Vendor',    tier: 1, color: '#10B981', descShortID: 'Dapat kekuatan acak setiap game',           descShortEN: 'Gets a random power each game' },
  { id: 'revenger',   nameID: 'Revenger',         nameEN: 'Revenger',          tier: 1, color: '#EF4444', descShortID: 'Bawa 1 pemain ikut tereliminasi',           descShortEN: 'Drags 1 player on elimination' },
  { id: 'duelists',   nameID: 'Duelists',         nameEN: 'Duelists',          tier: 1, color: '#F97316', descShortID: 'Duel rahasia antar 2 pemain',               descShortEN: 'Secret duel between 2 players' },
  { id: 'timekeeper', nameID: 'Timekeeper',       nameEN: 'Timekeeper',        tier: 2, color: '#3B82F6', descShortID: 'Ubah durasi ronde clue 1x per game',        descShortEN: 'Alter clue round timer 1x' },
  { id: 'shadow',     nameID: 'Shadow',           nameEN: 'Shadow',            tier: 2, color: '#475569', descShortID: 'Suara Anda bernilai dua (anonim)',           descShortEN: 'Double vote, stays anonymous' },
  { id: 'gambler',    nameID: 'Gambler',          nameEN: 'Gambler',           tier: 2, color: '#10B981', descShortID: 'Bertaruh poin pada target eliminasi',       descShortEN: 'Bet points on who gets eliminated' },
  { id: 'mirage',     nameID: 'Mirage',           nameEN: 'Mirage',            tier: 2, color: '#EC4899', descShortID: 'Tukar kata rahasia 1x per game',            descShortEN: 'Swap secret word 1x per game' },
  { id: 'whisperer',  nameID: 'Whisperer',        nameEN: 'Whisperer',         tier: 2, color: '#06B6D4', descShortID: 'Kirim pesan privat ke 1 pemain per ronde',  descShortEN: 'Send private msg to 1 player/round' },
  { id: 'joker',      nameID: 'Joker',            nameEN: 'Joker',             tier: 2, color: '#8B5CF6', descShortID: 'Menang bersama Mr. White jika dia menebak', descShortEN: 'Wins with Mr. White if he guesses' },
  { id: 'oracle',     nameID: 'Oracle',           nameEN: 'Oracle',            tier: 2, color: '#9333EA', descShortID: 'Intip peran rahasia 1 pemain lain',         descShortEN: 'Peek at another player\'s role 1x' },
  { id: 'vampire',    nameID: 'Vampir',           nameEN: 'Vampire',           tier: 2, color: '#DC2626', descShortID: 'Bungkam 1 pemain saat dieliminasi',         descShortEN: 'Silence 1 player on elimination' },
];

interface SpecialRoleItem {
  id: string;
  nameID: string;
  nameEN: string;
  tier: 1 | 2;
  strategyID: string;
  strategyEN: string;
  powerID: string;
  powerEN: string;
  iconSvg: React.ReactNode;
  color: string;
}

interface RoleGuideViewProps {
  language: 'ID' | 'EN';
  onClose: () => void;
}

export const RoleGuideView: React.FC<RoleGuideViewProps> = ({ language, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 1 | 2>('all');
  const [activeRoleID, setActiveRoleID] = useState<string>('clown');

  const specialRoles: SpecialRoleItem[] = [
    {
      id: 'clown',
      nameID: 'Badut Bahagia',
      nameEN: 'Happy Clown',
      tier: 1,
      powerID: 'Jika dieliminasi pertama, Anda otomatis memenangkan 4 poin bonus.',
      powerEN: 'If eliminated first, you automatically win 4 bonus points.',
      strategyID: 'Sengaja terlihat sedikit mencurigakan atau memberikan petunjuk yang agak membingungkan untuk memancing suara pemain lain di ronde pertama.',
      strategyEN: 'Intentionally act slightly suspicious or provide slightly confusing clues to attract other players\' votes in the first round.',
      color: '#FF6B35',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#FFE4E6" stroke="#000" strokeWidth="3" />
          <path d="M12 28 C8 20 20 12 22 22" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
          <path d="M52 28 C56 20 44 12 42 22" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
          <circle cx="32" cy="32" r="6" fill="#EF4444" stroke="#000" strokeWidth="2.5" />
          <rect x="20" y="22" width="6" height="6" fill="#000" rx="3" />
          <rect x="38" y="22" width="6" height="6" fill="#000" rx="3" />
          <path d="M20 42 Q32 50 44 42" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      )
    },
    {
      id: 'boomerang',
      nameID: 'Bumerang',
      nameEN: 'Boomerang',
      tier: 1,
      powerID: 'Saat menerima suara terbanyak, semua suara dari pemilih dikembalikan ke diri mereka sendiri.',
      powerEN: 'When receiving the most votes, all votes from voters are returned back to themselves.',
      strategyID: 'Provokasi pemain yang Anda curigai sebagai Undercover untuk memilih Anda, sehingga suara mereka berbalik menyerang mereka.',
      strategyEN: 'Provoke players you suspect are Undercover to vote for you, so their votes turn back to attack them.',
      color: '#2EC4B6',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M12 48 L28 16 L48 24 L36 32 L20 28 Z" fill="#2EC4B6" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <line x1="28" y1="16" x2="20" y2="28" stroke="#000" strokeWidth="3" />
          <circle cx="28" cy="16" r="3" fill="#FFD23F" stroke="#000" strokeWidth="1.5" />
          <circle cx="48" cy="24" r="3" fill="#FFD23F" stroke="#000" strokeWidth="1.5" />
          <path d="M22 36 A 12 12 0 0 1 40 40" stroke="#000" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      id: 'justice',
      nameID: 'Dewi Keadilan',
      nameEN: 'Goddess of Justice',
      tier: 1,
      powerID: 'Jika hasil suara seimbang, Anda yang memutuskan siapa yang akan tereliminasi (bahkan jika sudah mati).',
      powerEN: 'If the votes are tied, you decide who is eliminated (even if you are already dead).',
      strategyID: 'Jaga reputasi baik dan tetap objektif agar pemain lain mempercayai keputusan kritis Anda saat terjadi tie.',
      strategyEN: 'Maintain a good reputation and remain objective so other players trust your critical decisions in a tie.',
      color: '#FFD23F',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <line x1="32" y1="12" x2="32" y2="52" stroke="#000" strokeWidth="3" />
          <line x1="16" y1="20" x2="48" y2="20" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          <line x1="16" y1="20" x2="10" y2="36" stroke="#000" strokeWidth="2" />
          <line x1="16" y1="20" x2="22" y2="36" stroke="#000" strokeWidth="2" />
          <path d="M10 36 L22 36 Q16 42 10 36" fill="#FFD23F" stroke="#000" strokeWidth="2" />
          <line x1="48" y1="20" x2="42" y2="36" stroke="#000" strokeWidth="2" />
          <line x1="48" y1="20" x2="54" y2="36" stroke="#000" strokeWidth="2" />
          <path d="M42 36 L54 36 Q48 42 42 36" fill="#FFD23F" stroke="#000" strokeWidth="2" />
          <rect x="24" y="48" width="16" height="6" fill="#A8A29E" stroke="#000" strokeWidth="3" />
        </svg>
      )
    },
    {
      id: 'ghost',
      nameID: 'Hantu',
      nameEN: 'Ghost',
      tier: 1,
      powerID: 'Masih dapat memberikan suara voting meskipun Anda sudah dieliminasi.',
      powerEN: 'Can still cast votes even after you have been eliminated.',
      strategyID: 'Amati pergerakan kata dan clue dari "kubur" dengan tenang, gunakan suara Anda untuk membantu tim sipil menang.',
      strategyEN: 'Observe word patterns and clues calmly from the "grave", using your vote to help the civilians win.',
      color: '#9B5DE5',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M16 48 C16 20 48 20 48 48 C48 50 44 46 40 48 C36 50 34 46 32 48 C30 46 28 50 24 48 C20 46 16 50 16 48 Z" fill="#F3E8FF" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="26" cy="32" r="3" fill="#9B5DE5" />
          <circle cx="38" cy="32" r="3" fill="#9B5DE5" />
          <ellipse cx="32" cy="40" rx="3" ry="5" fill="#000" />
        </svg>
      )
    },
    {
      id: 'lovers',
      nameID: 'Lovers',
      nameEN: 'Lovers',
      tier: 1,
      powerID: 'Dua pemain terhubung secara rahasia. Jika salah satu mati, pasangannya ikut tereliminasi.',
      powerEN: 'Two players are secretly linked. If one is eliminated, their partner dies as well.',
      strategyID: 'Lindungi pasangan Anda secara tidak mencolok. Jangan terlihat terlalu membela atau dekat secara publik agar tidak tercium musuh.',
      strategyEN: 'Protect your partner inconspicuously. Avoid over-defending or acting too close in public to avoid raising suspicion.',
      color: '#EC4899',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M12 24 C12 14 26 14 28 22 C30 14 44 14 44 24 C44 36 28 46 28 46 C28 46 12 36 12 24 Z" fill="#F472B6" stroke="#000" strokeWidth="3" />
          <path d="M26 34 C26 26 36 26 38 31 C40 26 50 26 50 34 C50 42 38 48 38 48 C38 48 26 42 26 34 Z" fill="#EC4899" stroke="#000" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'mrmeme',
      nameID: 'Mr. Meme',
      nameEN: 'Mr. Meme',
      tier: 1,
      powerID: 'Setiap ronde, memaksa 1 pemain acak memberikan clue menggunakan gerakan fisik tanpa suara.',
      powerEN: 'Each round, forces 1 random player to give their clue using physical gestures without sound.',
      strategyID: 'Gunakan kemampuan ini pada pemain yang paling mencurigakan agar mereka kesulitan menyembunyikan kebohongan dalam bahasa tubuh.',
      strategyEN: 'Use this ability on the most suspicious player to make it harder for them to mask their lies in body language.',
      color: '#8B5CF6',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M14 20 C14 12 28 12 30 20 C30 32 14 32 14 20 Z" fill="#D8B4FE" stroke="#000" strokeWidth="2.5" />
          <path d="M34 24 C34 16 48 16 50 24 C50 36 34 36 34 24 Z" fill="#C084FC" stroke="#000" strokeWidth="2.5" />
          <rect x="22" y="24" width="4" height="2" fill="#000" />
          <rect x="42" y="28" width="4" height="2" fill="#000" />
          <path d="M18 26 Q22 28 26 26" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M38 32 Q42 30 46 32" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      )
    },
    {
      id: 'falafel',
      nameID: 'Penjual Falafel',
      nameEN: 'Falafel Vendor',
      tier: 1,
      powerID: 'Mendapatkan kekuatan acak baru (Shield, Reveal, Swap, dll.) di setiap permainan baru.',
      powerEN: 'Receives a brand new random power (Shield, Reveal, Swap, etc.) at the start of each new game.',
      strategyID: 'Cepat beradaptasi dengan kekuatan acak apa pun yang Anda dapatkan di awal ronde demi mengubah alur meja debat.',
      strategyEN: 'Quickly adapt to whichever random power you receive at the start of the round to swing the debate table.',
      color: '#10B981',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M12 40 L52 40 C52 48 12 48 12 40 Z" fill="#F59E0B" stroke="#000" strokeWidth="3" />
          <circle cx="22" cy="30" r="6" fill="#78350F" stroke="#000" strokeWidth="2.5" />
          <circle cx="34" cy="24" r="6" fill="#78350F" stroke="#000" strokeWidth="2.5" />
          <circle cx="44" cy="32" r="6" fill="#78350F" stroke="#000" strokeWidth="2.5" />
          <path d="M16 16 C20 8 44 8 48 16 Z" fill="#F3F4F6" stroke="#000" strokeWidth="3" />
        </svg>
      )
    },
    {
      id: 'revenger',
      nameID: 'Revenger',
      nameEN: 'Revenger',
      tier: 1,
      powerID: 'Saat dieliminasi, diperbolehkan langsung membawa 1 pemain lain ikut tereliminasi bersama.',
      powerEN: 'When eliminated, is allowed to immediately take 1 other player down to elimination with them.',
      strategyID: 'Pastikan Anda sudah mengunci target Undercover atau Mr. White yang paling potensial agar tembakan kematian Anda tidak meleset.',
      strategyEN: 'Ensure you have locked on the most potential Undercover or Mr. White target so your dying shot doesn\'t miss.',
      color: '#EF4444',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M16 12 L48 12 L44 38 Q32 52 20 38 Z" fill="#EF4444" stroke="#000" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M32 18 L34 26 L42 26 L36 31 L38 38 L32 33 L26 38 L28 31 L22 26 L30 26 Z" fill="#FFD23F" stroke="#000" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'duelists',
      nameID: 'Duelists',
      nameEN: 'Duelists',
      tier: 1,
      powerID: '2 pemain terikat duel rahasia. Yang mati duluan kehilangan 2 poin, yang menang dapat 2 poin.',
      powerEN: '2 players are bound in a secret duel. The first to be eliminated loses 2 points, the winner gets 2 points.',
      strategyID: 'Fokus untuk mendiskreditkan lawan duel Anda secara halus sembari mempertahankan kredibilitas diri Anda sendiri.',
      strategyEN: 'Focus on subtly discrediting your dueling opponent while fiercely maintaining your own credibility.',
      color: '#F97316',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M12 16 L22 16 L20 22 L14 22 Z" fill="#A8A29E" stroke="#000" strokeWidth="2" />
          <rect x="20" y="14" width="28" height="6" fill="#78716C" stroke="#000" strokeWidth="2.5" rx="1" />
          <line x1="28" y1="20" x2="24" y2="36" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="36" width="6" height="4" fill="#F97316" stroke="#000" strokeWidth="2" />
          <path d="M46 16 L52 22 M52 16 L46 22" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'timekeeper',
      nameID: 'Timekeeper',
      nameEN: 'Timekeeper',
      tier: 2,
      powerID: 'Bisa memperpanjang atau memperpendek sisa waktu clue round sebanyak 1x per game.',
      powerEN: 'Can extend or shorten the remaining clue round timer once per game.',
      strategyID: 'Perpanjang waktu saat tim sipil butuh koordinasi, atau potong waktu mendadak saat menduga penyamar kebingungan mencari kata.',
      strategyEN: 'Extend the timer when civilians need coordination, or abruptly cut it short when you suspect the undercover is struggling.',
      color: '#3B82F6',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <rect x="18" y="10" width="28" height="6" fill="#78716C" stroke="#000" strokeWidth="3" />
          <rect x="18" y="48" width="28" height="6" fill="#78716C" stroke="#000" strokeWidth="3" />
          <path d="M22 16 L42 16 L36 32 L42 48 L22 48 L28 32 Z" fill="#60A5FA" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="26,46 38,46 32,36" fill="#FFD23F" />
          <circle cx="32" cy="20" r="2" fill="#FFD23F" />
        </svg>
      )
    },
    {
      id: 'shadow',
      nameID: 'Shadow',
      nameEN: 'Shadow',
      tier: 2,
      powerID: 'Suara voting Anda bernilai ganda (2x) namun identitas Anda tetap disamarkan secara mutlak.',
      powerEN: 'Your vote counts double (2x) but your identity remains completely anonymous.',
      strategyID: 'Gunakan hak suara ganda Anda pada detik-detik terakhir pemungutan suara untuk membalikkan keadaan tanpa memicu kecurigaan.',
      strategyEN: 'Use your double vote at the last seconds of the voting phase to swing the result without drawing attention.',
      color: '#475569',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#0F172A" stroke="#000" strokeWidth="3" />
          <path d="M38 10 A 22 22 0 0 1 38 54 A 18 18 0 0 0 38 10 Z" fill="#F1F5F9" />
          <circle cx="24" cy="24" r="2" fill="#94A3B8" />
        </svg>
      )
    },
    {
      id: 'gambler',
      nameID: 'Gambler',
      nameEN: 'Gambler',
      tier: 2,
      powerID: 'Sebelum voting, bertaruh 1-3 poin pada target eliminasi. Benar = Poin x2, Salah = Poin hangus.',
      powerEN: 'Before voting, bet 1-3 points on the elimination target. Correct = Double points, Wrong = Lost points.',
      strategyID: 'Gunakan kekuatan taruhan ini saat Anda sudah 100% yakin mayoritas pemain di meja sepakat membuang terduga spionase.',
      strategyEN: 'Utilize this betting power only when you are 100% sure the majority has aligned to cast out the suspected spy.',
      color: '#10B981',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <rect x="14" y="14" width="36" height="36" rx="8" fill="#10B981" stroke="#000" strokeWidth="3.5" />
          <circle cx="23" cy="23" r="3.5" fill="#FFF" />
          <circle cx="41" cy="41" r="3.5" fill="#FFF" />
          <circle cx="32" cy="32" r="3.5" fill="#FFF" />
          <circle cx="23" cy="41" r="3.5" fill="#FFF" />
          <circle cx="41" cy="23" r="3.5" fill="#FFF" />
        </svg>
      )
    },
    {
      id: 'mirage',
      nameID: 'Mirage',
      nameEN: 'Mirage',
      tier: 2,
      powerID: '1x per game, bisa menukar kata rahasia Anda dengan kata milik Undercover/Mr. White secara acak.',
      powerEN: 'Once per game, can swap your secret word with one belonging to Undercover/Mr. White randomly.',
      strategyID: 'Saat Anda merasa terpojok karena clue Anda tidak sinkron dengan sipil lain, tukar kata Anda untuk menyamar.',
      strategyEN: 'When cornered due to your clues being out of sync with other civilians, swap your word to infiltrate.',
      color: '#EC4899',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M22 12 L42 12 Q48 32 32 52 Q16 32 22 12 Z" fill="#F472B6" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <path d="M25 15 L39 15 Q44 32 32 47 Q20 32 25 15 Z" fill="#60A5FA" opacity="0.6" />
          <line x1="32" y1="52" x2="32" y2="58" stroke="#000" strokeWidth="3.5" />
          <line x1="26" y1="58" x2="38" y2="58" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'whisperer',
      nameID: 'Whisperer',
      nameEN: 'Whisperer',
      tier: 2,
      powerID: 'Bisa mengirim pesan privat rahasia ke 1 pemain lain per ronde tanpa diketahui pemain lain.',
      powerEN: 'Can send a secret private message to 1 other player per round without others knowing.',
      strategyID: 'Gunakan ini untuk membangun koordinasi atau aliansi taktis secara rahasia dengan pemain yang sudah Anda yakini 100% Sipil.',
      strategyEN: 'Use this to establish tactical alliances or coordinate secretly with players you are 100% sure are Civilians.',
      color: '#06B6D4',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M14 26 C14 26 22 14 32 26 C42 14 50 26 50 26 C50 26 44 42 32 38 C20 42 14 26 14 26 Z" fill="#E0F2FE" stroke="#000" strokeWidth="3" />
          <path d="M32 26 L22 36 L18 34" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="32" y1="38" x2="32" y2="50" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'joker',
      nameID: 'Joker',
      nameEN: 'Joker',
      tier: 2,
      powerID: 'Jika Mr. White berhasil menebak kata sipil di akhir, Anda otomatis ikut menang bersama Mr. White.',
      powerEN: 'If Mr. White successfully guesses the civilian word at the end, you automatically win alongside them.',
      strategyID: 'Bantu Mr. White menyusup di meja diskusi dan berikan petunjuk yang memandu mereka menebak kata sipil dengan benar.',
      strategyEN: 'Help Mr. White infiltrate the discussions and leak hints that guide them toward guessing the civilian word correctly.',
      color: '#8B5CF6',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="12" width="32" height="40" rx="4" fill="#C084FC" stroke="#000" strokeWidth="3.5" />
          <polygon points="24,20 40,20 32,28" fill="#FFD23F" stroke="#000" strokeWidth="2" />
          <circle cx="32" cy="38" r="6" fill="#EF4444" stroke="#000" strokeWidth="2" />
          <circle cx="22" cy="46" r="2.5" fill="#FFF" />
          <circle cx="42" cy="46" r="2.5" fill="#FFF" />
        </svg>
      )
    },
    {
      id: 'oracle',
      nameID: 'Oracle',
      nameEN: 'Oracle',
      tier: 2,
      powerID: '1x per game, bisa memverifikasi dan melihat peran asli milik 1 pemain lain.',
      powerEN: 'Once per game, can verify and look at the real role of 1 other player.',
      strategyID: 'Gunakan kekuatan krusial ini saat diskusi memasuki fase buntu untuk memastikan siapa penyamar sesungguhnya di meja.',
      strategyEN: 'Deploy this crucial power when discussions hit a dead end to confirm who the actual undercover is at the table.',
      color: '#9333EA',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="26" r="16" fill="#C084FC" stroke="#000" strokeWidth="3" />
          <path d="M22 26 C22 26 28 32 32 32 C36 32 42 26 42 26" stroke="#9333EA" strokeWidth="2" fill="none" />
          <path d="M14 48 L50 48 L44 54 L20 54 Z" fill="#4B5563" stroke="#000" strokeWidth="3" />
          <line x1="32" y1="42" x2="32" y2="48" stroke="#000" strokeWidth="3.5" />
          <circle cx="32" cy="22" r="3" fill="#FFF" />
        </svg>
      )
    },
    {
      id: 'vampire',
      nameID: 'Vampir',
      nameEN: 'Vampire',
      tier: 2,
      powerID: 'Jika dieliminasi, diperbolehkan membungkam 1 pemain agar tidak bisa voting di ronde berikutnya.',
      powerEN: 'If eliminated, is allowed to silence 1 player, preventing them from casting a vote in the next round.',
      strategyID: 'Bungkam pemain yang paling vokal menganalisis pergerakan Anda sebagai hukuman atas eliminasi Anda.',
      strategyEN: 'Silence the player who is most vocal in analyzing your movements as a penalty for voting you out.',
      color: '#DC2626',
      iconSvg: (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M12 20 C12 20 20 28 32 20 C44 28 52 20 52 20 C52 42 32 50 32 50 C32 50 12 42 12 20 Z" fill="#991B1B" stroke="#000" strokeWidth="3" />
          <polygon points="24,24 28,24 26,30" fill="#FFF" />
          <polygon points="36,24 40,24 38,30" fill="#FFF" />
          <path d="M26 38 Q32 42 38 38" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      )
    }
  ];

  const filteredRoles = specialRoles.filter(
    (role) => selectedTier === 'all' || role.tier === selectedTier
  );

  const activeRole = specialRoles.find((r) => r.id === activeRoleID) || specialRoles[0];

  return (
    <div className="min-h-dvh bg-[#F7F4EE] py-6 px-4 max-w-[1280px] mx-auto w-full flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="border-b-3 border-black pb-4 mb-6 flex justify-between items-center">
        <button
          onClick={onClose}
          className="p-2 border-2 border-black rounded-lg bg-white font-bold brutal-shadow-sm brutal-press text-xs font-mono uppercase"
        >
          ← Kembali / Close
        </button>
        <BilingualText idText="DAFTAR & PANDUAN PERAN KHUSUS" enText="SPECIAL CLASSIFIED ROLES MATRIX" className="text-right uppercase" />
      </div>

      {/* Selector Tiers */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'all', idText: 'SEMUA PERAN', enText: 'ALL ROLES' },
          { id: 1, idText: 'TIER 1 (ORIGINAL)', enText: 'ORIGINAL CLASSIC' },
          { id: 2, idText: 'TIER 2 (SECRETIFY)', enText: 'SECRETIFY EXCLUSIVE' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTier(tab.id as any);
              sfx.playClick();
            }}
            className={`border-2 border-black rounded-lg px-3.5 py-1.5 font-mono text-[10.5px] font-bold uppercase transition brutal-press ${
              selectedTier === tab.id
                ? 'bg-[#9B5DE5] text-white brutal-shadow-sm scale-102'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <BilingualText
              idText={tab.idText}
              enText={tab.enText}
              inline
              className={selectedTier === tab.id ? 'text-white' : ''}
              enClassName={selectedTier === tab.id ? 'text-white/80' : 'text-slate-500'}
            />
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 mb-6">
        {/* Left Side: Roles Grid list (Col 6) */}
        <div className="lg:col-span-6 border-3 border-black bg-white rounded-2xl brutal-shadow p-5 flex flex-col text-black">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-4 block border-b border-black/10 pb-2">
            PILIH PERAN AGEN / ROLES RETAINMENT
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[420px] pr-1 flex-1">
            {filteredRoles.map((role) => {
              const isActive = role.id === activeRoleID;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setActiveRoleID(role.id);
                    sfx.playClick();
                  }}
                  className={`border-2 border-black rounded-xl p-3 flex flex-col items-center justify-between transition-all text-center brutal-press ${
                    isActive
                      ? 'bg-[#9B5DE5]/15 border-3 border-[#9B5DE5] shadow-[2px_2px_0px_#000] scale-102'
                      : 'bg-white hover:bg-slate-50 brutal-shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    {role.iconSvg}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-950 font-sans leading-tight">
                      {language === 'ID' ? role.nameID : role.nameEN}
                    </h5>
                    <span className="text-[8px] font-mono text-slate-400 font-extrabold uppercase mt-1 block">
                      Tier {role.tier}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Role Detail Panel (Col 6) */}
        <div className="lg:col-span-6">
          <BrutalCard bg="paper" className="h-full p-6 flex flex-col justify-between border-3 border-black">
            <div>
              {/* Header Title with Custom Icon */}
              <div className="flex items-center gap-4 border-b-2 border-black/15 pb-4 mb-4">
                <div className="w-16 h-16 shrink-0 border-2 border-black rounded-xl bg-slate-50 p-1 flex items-center justify-center brutal-shadow-sm">
                  {activeRole.iconSvg}
                </div>
                <div>
                  <div className="inline-block bg-[#9B5DE5] text-white text-[8px] font-mono px-2 py-0.5 rounded uppercase font-black tracking-widest">
                    TIER {activeRole.tier} ROLE
                  </div>
                  <h3 className="text-2xl font-black font-display text-black uppercase tracking-tight leading-none mt-1.5 font-bold">
                    {language === 'ID' ? activeRole.nameID : activeRole.nameEN}
                  </h3>
                </div>
              </div>

              {/* Power details */}
              <div className="space-y-4">
                <div className="p-4 bg-[#F0EDE6] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase block mb-1">
                    KEKUATAN KHUSUS / CHIP POWER
                  </span>
                  <p className="text-xs font-sans text-gray-900 leading-relaxed font-bold">
                    {language === 'ID' ? activeRole.powerID : activeRole.powerEN}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase block mb-1">
                    STRATEGI KELAS / AGENT TACTICS
                  </span>
                  <p className="text-xs font-sans text-slate-600 leading-relaxed font-semibold">
                    {language === 'ID' ? activeRole.strategyID : activeRole.strategyEN}
                  </p>
                </div>
              </div>
            </div>

            {/* Accented footer signature */}
            <div className="mt-6 border-t border-black/10 pt-4 text-[9px] font-mono text-slate-400 uppercase tracking-widest text-center">
              SECRETIFY MATRIX DIVISION • SECURITY CLEARANCE LEVEL S
            </div>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
};

