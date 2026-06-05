/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Clipboard, HelpCircle, Heart, Star, Layers, CheckSquare, Sparkles, AlertCircle, Laptop, Landmark, ShieldAlert } from 'lucide-react';
import { Player, RoleType, Clue, ChatMessage, MOCK_PLAYERS, MOCK_CLUES, MOCK_CHAT_MESSAGES, MOCK_MATCH_HISTORY, MOCK_SHOP_ITEMS, MOCK_LEADER_USERS } from './types';
import { SplashView, OnboardingView, LoginView, GameRulesModal, HomeView, LobbyView } from './components/PreGameScreens';
import { RoleAssignView, ClueRoundView, DiscussionView, VotingRoundView, MatchWinnerView } from './components/GameFlowScreens';
import { ProfileView, ShopView, LeaderboardsView, MatchHistoryView, SettingsView, RoleGuideView } from './components/MetaScreens';
import { 
  RealitySetupView, 
  RealityRoleRevealView, 
  RealityDebateView, 
  RealityVotingView, 
  RealityEliminationView, 
  RealityWinnerView 
} from './components/RealityModeScreens';
import { getRandomWordPair } from './utils/wordPacks';
import { BilingualText, ScallopLine } from './components/BrutalComponents';
import { sfx } from './utils/audio';
import { useMultiplayer } from './hooks/useMultiplayer';
import {
  mapChatMessages,
  mapRoomPlayers,
  resolveOnlineScreen
} from './utils/multiplayerMappers';

type PlayMode = 'mock' | 'online';

export default function App() {
  // Global configuration
  const [language, setLanguage] = useState<'ID' | 'EN'>('ID');
  const [activeScreen, setActiveScreen] = useState<string>('splash');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Auto-start BGM loop on first user interaction to satisfy browser security restriction
  useEffect(() => {
    const handleFirstInteraction = () => {
      sfx.startBgmLoop();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // User identity
  const [playerName, setPlayerName] = useState('Detektif Budi');
  const [playerAvatar, setPlayerAvatar] = useState('detective');

  // Interactive Match state managers
  const [playersList, setPlayersList] = useState<Player[]>(MOCK_PLAYERS);
  const [cluesList, setCluesList] = useState<Clue[]>(MOCK_CLUES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [roundsCount, setRoundsCount] = useState(5);
  const [selectedWordPack, setSelectedWordPack] = useState('pack_food');
  const [enabledSpecialRoles, setEnabledSpecialRoles] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<PlayMode>('mock');

  const multiplayer = useMultiplayer();

  // Reality Mode local states
  const [realityPlayers, setRealityPlayers] = useState<Player[]>([]);
  const [realityWordPack, setRealityWordPack] = useState('pack_food');
  const [realityRoundsMax, setRealityRoundsMax] = useState(3);
  const [realityRound, setRealityRound] = useState(1);
  const [realityCivilianWord, setRealityCivilianWord] = useState('');
  const [realityUndercoverWord, setRealityUndercoverWord] = useState('');
  const [realityVotingTallies, setRealityVotingTallies] = useState<Record<string, number>>({});
  const [realityEliminatedPlayer, setRealityEliminatedPlayer] = useState<Player | null>(null);
  const [realityWinnerRoleGroup, setRealityWinnerRoleGroup] = useState<'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE' | null>(null);

  // Trigger Language toggle
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ID' ? 'EN' : 'ID'));
  };

  // 1. Pre-Game setup helpers
  const handleNextFromSplash = () => {
    setActiveScreen('onboarding');
  };

  const handleCompleteOnboarding = () => {
    setActiveScreen('login');
  };

  const handleUserLogin = (name: string, avatar: string) => {
    setPlayerName(name);
    setPlayerAvatar(avatar);

    // Synchronize player 1 (user) with roster list
    setPlayersList((prev) =>
      prev.map((p) => (p.id === '1' ? { ...p, name, avatar } : p))
    );
    setActiveScreen('home');
  };

  const enterOnlineLobby = async (
    action: 'create' | 'join',
    joinCode?: string
  ) => {
    setPlayMode('online');
    multiplayer.clearError();
    try {
      if (action === 'create') {
        await multiplayer.createRoom(playerName, playerAvatar);
      } else if (joinCode) {
        await multiplayer.joinRoom(joinCode, playerName, playerAvatar);
      }
      setActiveScreen('lobby');
    } catch {
      setPlayMode('mock');
    }
  };

  const handleQuickPlay = () => {
    void enterOnlineLobby('create');
  };

  const handleCreateRoom = () => {
    void enterOnlineLobby('create');
  };

  const handleJoinPrivateRoom = (code: string) => {
    void enterOnlineLobby('join', code);
  };

  // Sync game screens & room data when playing online
  const onlinePlayerId =
    multiplayer.currentPlayer?.id ??
    multiplayer.localPlayerId ??
    multiplayer.room?.players.find((p) => p.name === playerName)?.id ??
    null;
  const myHasConfirmedRole =
    onlinePlayerId != null
      ? multiplayer.room?.players.find((p) => p.id === onlinePlayerId)
          ?.hasConfirmedRole === true
      : false;

  useEffect(() => {
    if (playMode !== 'online' || !multiplayer.room) return;

    const playerId = onlinePlayerId;
    const screen = resolveOnlineScreen(multiplayer.room, playerId);
    setActiveScreen(screen);

    setCluesList(multiplayer.room.clues);
    setChatMessages(mapChatMessages(multiplayer.room, playerId));
    setPlayersList(mapRoomPlayers(multiplayer.room));
  }, [
    playMode,
    multiplayer.room,
    onlinePlayerId,
    myHasConfirmedRole,
    multiplayer.room?.gameState
  ]);

  // Interactive dynamic bot addition in Lobby
  const handleAddNewBot = () => {
    if (playersList.length < 8) {
      const namesList = ['Cyber_Ghost', 'Sipil_Ayam', 'Detective_Rafi', 'Agen_Kucing', 'Seket_Lover'];
      const avatarList = ['monster', 'ninja', 'boy2', 'girl1', 'spy'];
      const chosenName = namesList[Math.floor(Math.random() * namesList.length)] + '_' + Math.floor(Math.random() * 90 + 10);
      const chosenAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

      const newBot: Player = {
        id: (playersList.length + 1).toString(),
        name: chosenName,
        avatar: chosenAvatar,
        level: Math.floor(Math.random() * 15 + 1),
        points: Math.floor(Math.random() * 1000 + 500),
        isReady: Math.random() > 0.3,
        isHost: false,
        isEliminated: false,
        votesReceived: 0
      };
      setPlayersList([...playersList, newBot]);
    }
  };

  const handleTogglePlayerReadyStatus = (id: string) => {
    if (playMode === 'online') {
      if (multiplayer.currentPlayer?.id !== id) return;
      multiplayer.toggleReady(id);
      return;
    }
    setPlayersList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isReady: !p.isReady } : p))
    );
  };

  const handleLobbySettingsChange = (settings: {
    maxPlayers: number;
    rounds: number;
    specialRoles: boolean;
    voiceChat: boolean;
    gameMode: string;
    wordPack: string;
    debateDurationSec: number;
  }) => {
    if (playMode === 'online' && multiplayer.isHost) {
      multiplayer.updateSettings(settings);
    }
  };

  // Launch and auto-seed roles
  const handleStartActiveGame = (
    rounds: number,
    packID: string,
    specialRoles: string[],
    debateDurationSec: number,
    gameMode: string
  ) => {
    setRoundsCount(rounds);
    setSelectedWordPack(packID);
    setEnabledSpecialRoles(specialRoles);

    if (playMode === 'online') {
      multiplayer.startGame({
        rounds,
        wordPack: packID,
        debateDurationSec,
        specialRoles: specialRoles.length > 0,
        voiceChat: false,
        gameMode
      });
      return;
    }

    // Distribute roles: Budi is Sivil, 2 undercovers, rest civilians
    const updated = playersList.map((p) => {
      if (p.id === '1') {
        return { ...p, role: 'SIVIL' as const, word: 'PIZZA', votesReceived: 0, isEliminated: false };
      } else if (p.id === '2') {
        return { ...p, role: 'UNDERCOVER' as const, word: 'MARTABAK', votesReceived: 0, isEliminated: false };
      } else if (p.id === '4') {
        return { ...p, role: 'UNDERCOVER' as const, word: 'MARTABAK', votesReceived: 0, isEliminated: false };
      } else if (p.id === '6') {
        return { ...p, role: 'MR_WHITE' as const, word: '???', votesReceived: 0, isEliminated: false };
      } else {
        return { ...p, role: 'SIVIL' as const, word: 'PIZZA', votesReceived: 0, isEliminated: false };
      }
    });

    setPlayersList(updated);
    setActiveScreen('role_assign');
  };

  // 2. Gameplay active loop action handlers
  const handleConfirmRoleAssign = () => {
    if (playMode === 'online') {
      const playerId =
        multiplayer.currentPlayer?.id ??
        multiplayer.localPlayerId ??
        multiplayer.room?.players.find((p) => p.name === playerName)?.id;
      if (playerId) {
        multiplayer.confirmRole(playerId);
        setActiveScreen('clue_round');
      }
      return;
    }
    setActiveScreen('clue_round');
  };

  const handleUserSubmittedClue = (text: string) => {
    if (playMode === 'online' && multiplayer.currentPlayer) {
      multiplayer.submitClue(multiplayer.currentPlayer.id, text);
      return;
    }
    const myClue: Clue = {
      id: 'c_me',
      playerName: playerName,
      avatar: playerAvatar,
      clueTextID: text,
      clueTextEN: text
    };
    setCluesList([myClue, ...cluesList]);
  };

  const handleProceedToDiscussionChat = () => {
    setActiveScreen('discussion');
  };

  const handleUserAccusedMessage = (msg: string) => {
    if (playMode === 'online' && multiplayer.currentPlayer) {
      multiplayer.sendMessage(multiplayer.currentPlayer.id, msg);
      return;
    }

    const newChat: ChatMessage = {
      id: Math.random().toString(),
      senderName: playerName,
      avatar: playerAvatar,
      messageID: msg,
      messageEN: msg,
      isMe: true
    };

    setChatMessages((prev) => [...prev, newChat]);

    setTimeout(() => {
      const bots = playersList.filter((p) => p.id !== '1' && !p.isEliminated);
      if (bots.length > 0) {
        const responder = bots[Math.floor(Math.random() * bots.length)];
        const repliesID = [
          'Haha setuju, mari periksa Felix atau Budi!',
          'Wah, pembelaan yang cukup bagus tapi mencurigakan.',
          'Aku masih memantau Si_Paling_Seket...',
          'Kalian semua terlihat seperti Undercover bagiku!'
        ];
        const repliesEN = [
          'Haha true, let us inspect Felix or Budi!',
          'Humm, decent defense but quite suspicious.',
          'I am still keeping an eye on Si_Paling_Seket...',
          'You guys all look like Undercover players to me!'
        ];
        const rIdx = Math.floor(Math.random() * repliesID.length);

        const botReply: ChatMessage = {
          id: Math.random().toString(),
          senderName: responder.name,
          avatar: responder.avatar,
          messageID: repliesID[rIdx],
          messageEN: repliesEN[rIdx],
          isMe: false
        };
        setChatMessages((prev) => [...prev, botReply]);
      }
    }, 1500);
  };

  const handleTriggerDiscussionToVoting = () => {
    if (playMode === 'online') {
      multiplayer.triggerVoting();
      return;
    }
    setActiveScreen('voting');
  };

  const handleCastVoteOnTarget = (targetPlayerId: string) => {
    if (playMode === 'online' && multiplayer.currentPlayer) {
      if (multiplayer.currentPlayer.votedForId) return;
      multiplayer.castVote(multiplayer.currentPlayer.id, targetPlayerId);
      return;
    }
    const me = playersList.find((p) => p.id === '1');
    if (me?.votedForId) return;
    setPlayersList((prev) =>
      prev.map((p) => {
        if (p.id === '1') return { ...p, votedForId: targetPlayerId };
        if (p.id === targetPlayerId) return { ...p, votesReceived: p.votesReceived + 1 };
        return p;
      })
    );
  };

  const handleConfirmVotesAndEliminate = () => {
    if (playMode === 'online') {
      multiplayer.confirmElimination();
      return;
    }
    // Find highest-voted living player
    const living = playersList.filter((p) => !p.isEliminated);
    let target = living[0];
    for (let i = 1; i < living.length; i++) {
      if (living[i].votesReceived > target.votesReceived) {
        target = living[i];
      }
    }

    // Flag target as eliminated
    setPlayersList((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, isEliminated: true } : p))
    );

    sfx.playElimination();

    // Announce winner scoreboard directly for simulation
    setActiveScreen('winner');
  };

  const handleLeaveRoom = () => {
    if (playMode === 'online') {
      multiplayer.disconnect();
      setPlayMode('mock');
    }
    setPlayersList(MOCK_PLAYERS);
    setCluesList(MOCK_CLUES);
    setChatMessages(MOCK_CHAT_MESSAGES);
    setActiveScreen('home');
  };

  const handleReenterLobby = () => {
    if (playMode === 'online') {
      multiplayer.playAgain();
      return;
    }
    setPlayersList(MOCK_PLAYERS);
    setCluesList(MOCK_CLUES);
    setChatMessages(MOCK_CHAT_MESSAGES);
    setActiveScreen('lobby');
  };

  // Reality Mode Local Gameplay Actions
  const handleStartRealityGame = (
    players: Player[],
    wordPack: string,
    rounds: number,
    undercoverCount: number,
    includeMrWhite: boolean,
    specialRoles: string[] = []
  ) => {
    setEnabledSpecialRoles(specialRoles);
    const wordPair = getRandomWordPair(wordPack);
    setRealityCivilianWord(wordPair.civilian);
    setRealityUndercoverWord(wordPair.undercover);
    setRealityWordPack(wordPack);
    setRealityRoundsMax(rounds);
    setRealityRound(1);
    setRealityWinnerRoleGroup(null);
    setRealityEliminatedPlayer(null);

    // Build role array
    const roles: RoleType[] = [];
    const whiteCount = (includeMrWhite && players.length >= 4) ? 1 : 0;
    const ucCount = undercoverCount;
    const civCount = players.length - whiteCount - ucCount;

    for (let i = 0; i < civCount; i++) roles.push('SIVIL');
    for (let i = 0; i < ucCount; i++) roles.push('UNDERCOVER');
    for (let i = 0; i < whiteCount; i++) roles.push('MR_WHITE');

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    // Prepare shuffled special roles queue
    const shuffledSpecials = [...specialRoles].sort(() => Math.random() - 0.5);
    let specialQueue = [...shuffledSpecials];

    const assignedPlayers = players.map((p, idx) => {
      const assignedRole = shuffledRoles[idx];
      let word = '';
      if (assignedRole === 'SIVIL') word = wordPair.civilian;
      else if (assignedRole === 'UNDERCOVER') word = wordPair.undercover;
      else if (assignedRole === 'MR_WHITE') word = '???';

      const specialRole = specialQueue.length > 0 ? specialQueue.shift() : undefined;

      return {
        ...p,
        role: assignedRole,
        word,
        isEliminated: false,
        votedForId: undefined,
        votesReceived: 0,
        specialRole: specialRole ?? undefined,
        loversPartnerId: undefined as string | undefined
      };
    });

    // Wire Lovers partner links
    const loversPlayers = assignedPlayers.filter(p => p.specialRole === 'lovers');
    if (loversPlayers.length >= 2) {
      loversPlayers[0].loversPartnerId = loversPlayers[1].id;
      loversPlayers[1].loversPartnerId = loversPlayers[0].id;
    }

    setRealityPlayers(assignedPlayers);
    setActiveScreen('reality_reveal');
  };

  const handleRealityAllRevealed = () => {
    setActiveScreen('reality_debate');
  };

  const handleRealityProceedToVote = () => {
    setActiveScreen('reality_voting');
  };

  const handleRealityFinishVoting = (tallies: Record<string, number>) => {
    setRealityVotingTallies(tallies);

    const living = realityPlayers.filter(p => !p.isEliminated);

    // --- Step 1: Find highest-voted player ---
    let highestVotedPlayer = living[0];
    let maxVotes = tallies[highestVotedPlayer?.id] || 0;
    let tieHappened = false;

    for (let i = 1; i < living.length; i++) {
      const v = tallies[living[i].id] || 0;
      if (v > maxVotes) {
        highestVotedPlayer = living[i];
        maxVotes = v;
        tieHappened = false;
      } else if (v === maxVotes && v > 0) {
        tieHappened = true;
      }
    }
    if (tieHappened) {
      const tied = living.filter(p => (tallies[p.id] || 0) === maxVotes);
      highestVotedPlayer = tied[Math.floor(Math.random() * tied.length)];
    }

    // --- Step 2: Boomerang redirect ---
    if (highestVotedPlayer.specialRole === 'boomerang') {
      // Voters of the boomerang each get 1 bounce-back vote
      const bounceVotes: Record<string, number> = {};
      realityPlayers.forEach(p => { bounceVotes[p.id] = 0; });
      realityPlayers.forEach(p => {
        if (p.votedForId === highestVotedPlayer.id && !p.isEliminated) {
          bounceVotes[p.id] = (bounceVotes[p.id] || 0) + 1;
        }
      });
      // Find new highest from boomerang voters
      const votersOfBoomerang = living.filter(p => p.votedForId === highestVotedPlayer.id);
      if (votersOfBoomerang.length > 0) {
        let newTarget = votersOfBoomerang[0];
        let maxBounce = bounceVotes[newTarget.id] || 0;
        votersOfBoomerang.forEach(p => {
          if ((bounceVotes[p.id] || 0) > maxBounce) {
            newTarget = p;
            maxBounce = bounceVotes[p.id];
          }
        });
        highestVotedPlayer = newTarget;
      }
    }

    // --- Step 3: Eliminate the resolved target ---
    let updatedPlayers = realityPlayers.map(p =>
      p.id === highestVotedPlayer.id ? { ...p, isEliminated: true } : p
    );
    const eliminatedIds: string[] = [highestVotedPlayer.id];
    const eliminatedPlayer = { ...highestVotedPlayer, isEliminated: true };

    // --- Step 4: Clown — wins if eliminated in Round 1 ---
    if (highestVotedPlayer.specialRole === 'clown' && realityRound === 1) {
      setRealityPlayers(updatedPlayers);
      setRealityEliminatedPlayer(eliminatedPlayer);
      sfx.playVictory();
      setRealityWinnerRoleGroup('CIVILIANS'); // Clown special win
      setActiveScreen('reality_winner');
      return;
    }

    // --- Step 5: Revenger — drags down their voted target ---
    if (highestVotedPlayer.specialRole === 'revenger' && highestVotedPlayer.votedForId) {
      updatedPlayers = updatedPlayers.map(p =>
        p.id === highestVotedPlayer.votedForId && !p.isEliminated
          ? { ...p, isEliminated: true }
          : p
      );
      const revenged = updatedPlayers.find(p => p.id === highestVotedPlayer.votedForId);
      if (revenged) eliminatedIds.push(revenged.id);
    }

    // --- Step 6: Lovers — partner dies too ---
    for (const elimId of [...eliminatedIds]) {
      const elimP = updatedPlayers.find(p => p.id === elimId);
      if (elimP?.specialRole === 'lovers' && elimP.loversPartnerId) {
        updatedPlayers = updatedPlayers.map(p =>
          p.id === elimP.loversPartnerId && !p.isEliminated
            ? { ...p, isEliminated: true }
            : p
        );
        const partner = updatedPlayers.find(p => p.id === elimP.loversPartnerId);
        if (partner) eliminatedIds.push(partner.id);
      }
    }

    setRealityPlayers(updatedPlayers);
    setRealityEliminatedPlayer(eliminatedPlayer);

    sfx.playElimination();
    setActiveScreen('reality_elimination');
  };

  const checkRealityWinConditions = (currentPlayersList: Player[]) => {
    const active = currentPlayersList.filter(p => !p.isEliminated);
    const civs = active.filter(p => p.role === 'SIVIL');
    const ucs = active.filter(p => p.role === 'UNDERCOVER');
    const whites = active.filter(p => p.role === 'MR_WHITE');

    // Civilians win — all enemies eliminated
    if (ucs.length === 0 && whites.length === 0) {
      setRealityWinnerRoleGroup('CIVILIANS');
      setActiveScreen('reality_winner');
      return true;
    }

    // Undercovers win — they outnumber or match remaining civilians
    if (ucs.length >= civs.length) {
      setRealityWinnerRoleGroup('UNDERCOVERS');
      setActiveScreen('reality_winner');
      return true;
    }

    // Mr. White wins — all undercovers gone and whites >= civs
    if (whites.length >= civs.length && ucs.length === 0) {
      setRealityWinnerRoleGroup('MR_WHITE');
      setActiveScreen('reality_winner');
      return true;
    }

    return false;
  };

  const handleRealityProceedNextRound = () => {
    const isOver = checkRealityWinConditions(realityPlayers);
    if (isOver) {
      return;
    }

    if (realityRound >= realityRoundsMax) {
      // Round limit reached — surviving Undercovers/Mr. Whites win (they survived long enough)
      const active = realityPlayers.filter(p => !p.isEliminated);
      const ucs = active.filter(p => p.role === 'UNDERCOVER');
      const whites = active.filter(p => p.role === 'MR_WHITE');
      if (ucs.length > 0) {
        setRealityWinnerRoleGroup('UNDERCOVERS');
      } else if (whites.length > 0) {
        setRealityWinnerRoleGroup('MR_WHITE');
      } else {
        setRealityWinnerRoleGroup('CIVILIANS');
      }
      setActiveScreen('reality_winner');
    } else {
      setRealityRound(realityRound + 1);
      setActiveScreen('reality_debate');
    }
  };

  const handleRealityMrWhiteGuessResult = (mrWhiteWonDirectly: boolean) => {
    if (mrWhiteWonDirectly) {
      setRealityWinnerRoleGroup('MR_WHITE');
      setActiveScreen('reality_winner');
    } else {
      handleRealityProceedNextRound();
    }
  };

  const isOnlinePlay = playMode === 'online' && multiplayer.room;
  const displayPlayers = isOnlinePlay
    ? mapRoomPlayers(multiplayer.room)
    : playersList;
  const displayRoomCode = isOnlinePlay
    ? (multiplayer.roomCode ?? '------')
    : 'A7B3C9';
  const me = isOnlinePlay
    ? (multiplayer.currentPlayer ??
      displayPlayers.find(
        (p) =>
          p.id === onlinePlayerId ||
          (onlinePlayerId == null && p.name === playerName)
      ) ??
      null)
    : displayPlayers.find((p) => p.id === '1') ?? null;
  const displayClues = isOnlinePlay ? multiplayer.room.clues : cluesList;
  const displayChat = isOnlinePlay
    ? mapChatMessages(multiplayer.room, me?.id ?? null)
    : chatMessages;
  const myRole = (me?.role ?? 'SIVIL') as RoleType;
  const myWord = me?.word ?? '???';
  const winnerType = (
    isOnlinePlay
      ? multiplayer.room.winnerRoleGroup ?? 'CIVILIANS'
      : 'CIVILIANS'
  ) as 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE';
  const civWord = isOnlinePlay ? multiplayer.room.civilianWord : 'PIZZA';
  const ucWord = isOnlinePlay ? multiplayer.room.undercoverWord : 'MARTABAK';

  return (
    <div className="min-h-dvh bg-[#F0EDE6] antialiased select-none font-sans text-stone-900">
      {/* 2-Column Dashboard viewport layout satisfying desktop rules */}
      <div className="grid grid-cols-1 xl:grid-cols-12 max-w-[1440px] mx-auto min-h-dvh relative">

        {/* Column LEFT: The floating Interactive Switcher / Simulator board */}
        <div className="xl:col-span-3 bg-[#12182B] text-white p-6 border-b-3 xl:border-b-0 xl:border-r-3 border-black flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="p-1 px-2.5 bg-[#DFFF00] text-black font-black text-xs font-mono rounded brutal-shadow-sm rotate-3">
                SEC
              </span>
              <div>
                <h2 className="font-mono text-[10px] font-black text-[#DFFF00] tracking-widest leading-none uppercase">
                  SIMULATOR TOOLKIT
                </h2>
                <h3 className="font-bold text-xs uppercase text-slate-300 mt-1">Design Playground</h3>
              </div>
            </div>

            {/* Helper tips */}
            <div className="bg-slate-900 p-4 border border-slate-700 rounded-xl text-[11px] font-medium leading-relaxed font-sans text-slate-300 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:10px_10px]">
              <span className="absolute -top-2 left-4 bg-[#FF6B35] text-white font-mono text-[8px] px-1.5 rounded border border-black font-extrabold uppercase">
                INFO
              </span>
              <p>
                {language === 'ID'
                  ? 'Gunakan pengalih di bawah untuk melewati alur pendaftaran secara instan dan melihat semua model visual 100% identik!'
                  : 'Use switcher controls below to jump screens instantly and inspect individual design mockups!'}
              </p>
            </div>

            {/* List links */}
            <div className="space-y-4">
              <span className="text-[9px] font-mono font-bold uppercase text-[#FF6B35] tracking-wider block">
                PILIH PREVIEW / SELECT MOCK SCREEN:
              </span>

              {/* Group 1: Pre-game */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block tracking-wide">
                  PHASE A: PRE-GAME
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveScreen('splash')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'splash'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1. Splash View
                  </button>
                  <button
                    onClick={() => setActiveScreen('onboarding')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'onboarding'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    2. Onboarding
                  </button>
                  <button
                    onClick={() => setActiveScreen('login')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'login'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    3. Profile Setup
                  </button>
                  <button
                    onClick={() => setActiveScreen('home')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'home'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    4. Home Hub
                  </button>
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      setPlayersList(MOCK_PLAYERS);
                      setCluesList(MOCK_CLUES);
                      setChatMessages(MOCK_CHAT_MESSAGES);
                      setActiveScreen('lobby');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'lobby'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    5. Room Lobby
                  </button>
                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>6. Rules Pop</span>
                    <span>⚡</span>
                  </button>
                </div>
              </div>

              {/* Group 2: Game Flow */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block tracking-wide">
                  PHASE B: ACTIVE GAME LOOP
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      handleStartActiveGame(5, 'pack_food', [], 90, 'Classic');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'role_assign'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    7. Role Folder
                  </button>
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      setPlayersList(MOCK_PLAYERS);
                      setCluesList(MOCK_CLUES);
                      setActiveScreen('clue_round');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'clue_round'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    8. Clue Round
                  </button>
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      setPlayersList(MOCK_PLAYERS);
                      setChatMessages(MOCK_CHAT_MESSAGES);
                      setActiveScreen('discussion');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'discussion'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    9. Debate Chat
                  </button>
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      setPlayersList(MOCK_PLAYERS);
                      setActiveScreen('voting');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'voting'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    10. Orbit Vote
                  </button>
                  <button
                    onClick={() => {
                      setPlayMode('mock');
                      setPlayersList(MOCK_PLAYERS);
                      setActiveScreen('winner');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'winner'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    11. Scoreboard
                  </button>
                </div>
              </div>

              {/* Group 3: Secondary Meta tabs */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block tracking-wide">
                  PHASE C: UTILITY PANELS
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveScreen('profile')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'profile'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    12. Avatar Lab
                  </button>
                  <button
                    onClick={() => setActiveScreen('shop')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'shop'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    13. Trade Store
                  </button>
                  <button
                    onClick={() => setActiveScreen('leaders')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'leaders'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    14. Rank Leader
                  </button>
                  <button
                    onClick={() => setActiveScreen('history')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'history'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    15. Match history
                  </button>
                  <button
                    onClick={() => setActiveScreen('settings')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'settings'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    16. System Pref
                  </button>
                  <button
                    onClick={() => setActiveScreen('role_guide')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'role_guide'
                        ? 'bg-[#DFFF00] text-black border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    16b. Role Guide
                  </button>
                </div>
              </div>

              {/* Group 4: Reality Mode */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono font-bold uppercase text-[#FF6B35] block tracking-wide">
                  PHASE D: REALITY OFFLINE
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveScreen('reality_setup')}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_setup'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    17. Setup
                  </button>
                  <button
                    onClick={() => {
                      // Autoseed 4 players
                      handleStartRealityGame([
                        { id: '1', name: 'Andi', avatar: 'detective', level: 10, points: 1000, isReady: true, isHost: true, isEliminated: false, votesReceived: 0 },
                        { id: '2', name: 'Siti', avatar: 'cat', level: 12, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0 },
                        { id: '3', name: 'Budi', avatar: 'boy1', level: 14, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0 },
                        { id: '4', name: 'Rian', avatar: 'girl1', level: 9, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0 }
                      ], 'pack_food', 3, 1, false);
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_reveal'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    18. Reveal Roles
                  </button>
                  <button
                    onClick={() => {
                      const testPlayers = [
                        { id: '1', name: 'Andi', avatar: 'detective', level: 10, points: 1000, isReady: true, isHost: true, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '2', name: 'Siti', avatar: 'cat', level: 12, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'UNDERCOVER' as const, word: 'GULAI' },
                        { id: '3', name: 'Budi', avatar: 'boy1', level: 14, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '4', name: 'Rian', avatar: 'girl1', level: 9, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' }
                      ];
                      setRealityPlayers(testPlayers);
                      setRealityCivilianWord('RENDANG');
                      setRealityUndercoverWord('GULAI');
                      setRealityRound(1);
                      setActiveScreen('reality_debate');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_debate'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    19. Debate
                  </button>
                  <button
                    onClick={() => {
                      const testPlayers = [
                        { id: '1', name: 'Andi', avatar: 'detective', level: 10, points: 1000, isReady: true, isHost: true, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '2', name: 'Siti', avatar: 'cat', level: 12, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'UNDERCOVER' as const, word: 'GULAI' },
                        { id: '3', name: 'Budi', avatar: 'boy1', level: 14, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '4', name: 'Rian', avatar: 'girl1', level: 9, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' }
                      ];
                      setRealityPlayers(testPlayers);
                      setRealityCivilianWord('RENDANG');
                      setRealityUndercoverWord('GULAI');
                      setActiveScreen('reality_voting');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_voting'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    20. Ballot
                  </button>
                  <button
                    onClick={() => {
                      const testPlayers = [
                        { id: '1', name: 'Andi', avatar: 'detective', level: 10, points: 1000, isReady: true, isHost: true, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '2', name: 'Siti', avatar: 'cat', level: 12, points: 1000, isReady: true, isHost: false, isEliminated: true, votesReceived: 2, role: 'UNDERCOVER' as const, word: 'GULAI' },
                        { id: '3', name: 'Budi', avatar: 'boy1', level: 14, points: 1000, isReady: true, isHost: false, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' }
                      ];
                      setRealityPlayers(testPlayers);
                      setRealityEliminatedPlayer(testPlayers[1]);
                      setRealityCivilianWord('RENDANG');
                      setRealityUndercoverWord('GULAI');
                      setRealityVotingTallies({ '2': 3 });
                      setActiveScreen('reality_elimination');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_elimination'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    21. Elim
                  </button>
                  <button
                    onClick={() => {
                      const testPlayers = [
                        { id: '1', name: 'Andi', avatar: 'detective', level: 10, points: 1000, isReady: true, isHost: true, isEliminated: false, votesReceived: 0, role: 'SIVIL' as const, word: 'RENDANG' },
                        { id: '2', name: 'Siti', avatar: 'cat', level: 12, points: 1000, isReady: true, isHost: false, isEliminated: true, votesReceived: 2, role: 'UNDERCOVER' as const, word: 'GULAI' }
                      ];
                      setRealityPlayers(testPlayers);
                      setRealityWinnerRoleGroup('CIVILIANS');
                      setRealityCivilianWord('RENDANG');
                      setRealityUndercoverWord('GULAI');
                      setActiveScreen('reality_winner');
                    }}
                    className={`text-[10px] font-mono text-left px-2.5 py-1.5 rounded transition font-bold border ${
                      activeScreen === 'reality_winner'
                        ? 'bg-[#FF6B35] text-white border-black font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    22. Over
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer branding */}
          <div className="pt-4 border-t border-white/10 text-slate-400 font-mono text-[9px] text-center">
            Secretify Redesign Lab © 21st Cent
          </div>
        </div>

        {/* Column RIGHT: The actual simulated application container frame */}
        <div className="xl:col-span-9 flex flex-col justify-between overflow-x-hidden">
          {/* Main client application view router mapping */}
          <div className="flex-1 w-full relative">
            {activeScreen === 'splash' && (
              <SplashView
                onNext={handleNextFromSplash}
                language={language}
                toggleLanguage={toggleLanguage}
              />
            )}

            {activeScreen === 'onboarding' && (
              <OnboardingView
                onComplete={handleCompleteOnboarding}
                language={language}
              />
            )}

            {activeScreen === 'login' && (
              <LoginView onLogin={handleUserLogin} />
            )}

            {activeScreen === 'home' && (
              <HomeView
                playerName={playerName}
                avatar={playerAvatar}
                onQuickPlay={handleQuickPlay}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinPrivateRoom}
                onOpenRealitySetup={() => setActiveScreen('reality_setup')}
                onOpenRules={() => setIsRulesOpen(true)}
                onOpenLeaders={() => setActiveScreen('leaders')}
                onOpenShop={() => setActiveScreen('shop')}
                onOpenProfile={() => setActiveScreen('profile')}
                onOpenSettings={() => setActiveScreen('settings')}
                onOpenRoleGuide={() => setActiveScreen('role_guide')}
                language={language}
              />
            )}

            {activeScreen === 'lobby' && (
              <LobbyView
                roomCode={displayRoomCode}
                players={displayPlayers}
                currentPlayerId={me?.id}
                isHost={isOnlinePlay ? multiplayer.isHost : true}
                isOnline={!!isOnlinePlay}
                connectionError={multiplayer.connectionError}
                isConnecting={multiplayer.isConnecting}
                roomSettings={
                  isOnlinePlay
                    ? {
                        rounds: multiplayer.room.rounds,
                        wordPack: multiplayer.room.wordPack,
                        debateDurationSec: multiplayer.room.debateDurationSec ?? 90,
                        gameMode: multiplayer.room.gameMode,
                        specialRolesEnabled: multiplayer.room.specialRolesEnabled
                      }
                    : undefined
                }
                onStartGame={handleStartActiveGame}
                onSettingsChange={handleLobbySettingsChange}
                onLeave={handleLeaveRoom}
                onAddBot={handleAddNewBot}
                onTogglePlayerReady={handleTogglePlayerReadyStatus}
                language={language}
              />
            )}

            {activeScreen === 'role_assign' && (
              <RoleAssignView
                playerRole={myRole}
                secretWord={myWord}
                onConfirm={handleConfirmRoleAssign}
                language={language}
              />
            )}

            {activeScreen === 'clue_round' && (
              <ClueRoundView
                secretWord={myWord}
                role={myRole}
                clues={displayClues}
                currentPlayerId={me?.id}
                serverGameState={isOnlinePlay ? multiplayer.room.gameState : undefined}
                clueCompleteEndsAt={
                  isOnlinePlay ? multiplayer.room.clueCompleteEndsAt ?? null : null
                }
                isHost={isOnlinePlay ? multiplayer.isHost : true}
                onProceedToDiscussion={
                  isOnlinePlay ? () => multiplayer.proceedToDiscussion() : undefined
                }
                waitingForOthers={
                  isOnlinePlay &&
                  multiplayer.room.gameState === 'role_assignment'
                }
                onSubmitClue={handleUserSubmittedClue}
                language={language}
              />
            )}

            {activeScreen === 'discussion' && (
              <DiscussionView
                secretWord={myWord}
                role={myRole}
                players={displayPlayers}
                currentPlayerId={me?.id ?? ''}
                isHost={isOnlinePlay ? multiplayer.isHost : true}
                isOnline={!!isOnlinePlay}
                chatMessages={displayChat}
                discussionEndsAt={
                  isOnlinePlay ? multiplayer.room.discussionEndsAt ?? null : null
                }
                debateDurationSec={
                  isOnlinePlay
                    ? multiplayer.room.debateDurationSec ?? 90
                    : 90
                }
                onSubmitMessage={handleUserAccusedMessage}
                onProceedToVote={handleTriggerDiscussionToVoting}
                language={language}
              />
            )}

            {activeScreen === 'voting' && (
              <VotingRoundView
                players={displayPlayers}
                currentPlayerId={me?.id ?? ''}
                hasVoted={!!me?.votedForId}
                myVotedForId={me?.votedForId}
                secretWord={myWord}
                role={myRole}
                isHost={isOnlinePlay ? multiplayer.isHost : true}
                onCastVote={handleCastVoteOnTarget}
                onConfirmVotesComplete={handleConfirmVotesAndEliminate}
                language={language}
              />
            )}

            {activeScreen === 'winner' && (
              <MatchWinnerView
                winnerRoleType={winnerType}
                players={displayPlayers}
                secretWordCivilian={civWord}
                secretWordUndercover={ucWord}
                onPlayAgain={handleReenterLobby}
                language={language}
              />
            )}

            {/* Reality Mode Local Screen Router Mapping */}
            {activeScreen === 'reality_setup' && (
              <RealitySetupView
                onStartGame={handleStartRealityGame}
                onBack={() => setActiveScreen('home')}
                language={language}
              />
            )}

            {activeScreen === 'reality_reveal' && (
              <RealityRoleRevealView
                players={realityPlayers}
                onAllRevealed={handleRealityAllRevealed}
                language={language}
              />
            )}

            {activeScreen === 'reality_debate' && (
              <RealityDebateView
                players={realityPlayers}
                round={realityRound}
                onProceedToVote={handleRealityProceedToVote}
                language={language}
              />
            )}

            {activeScreen === 'reality_voting' && (
              <RealityVotingView
                players={realityPlayers}
                onFinishVoting={handleRealityFinishVoting}
                language={language}
              />
            )}

            {activeScreen === 'reality_elimination' && (
              <RealityEliminationView
                language={language}
                players={realityPlayers}
                eliminatedPlayer={realityEliminatedPlayer!}
                civilianWord={realityCivilianWord}
                votingTallies={realityVotingTallies}
                onGuessResult={handleRealityMrWhiteGuessResult}
                onProceedNextRound={handleRealityProceedNextRound}
              />
            )}

            {activeScreen === 'reality_winner' && (
              <RealityWinnerView
                language={language}
                winnerRoleGroup={realityWinnerRoleGroup!}
                players={realityPlayers}
                civilianWord={realityCivilianWord}
                undercoverWord={realityUndercoverWord}
                onPlayAgain={() => setActiveScreen('reality_setup')}
              />
            )}

            {activeScreen === 'profile' && (
              <ProfileView
                playerName={playerName}
                avatar={playerAvatar}
                onUpdateNameAndAvatar={(n, a) => {
                  setPlayerName(n);
                  setPlayerAvatar(a);
                  setActiveScreen('home');
                }}
                onClose={() => setActiveScreen('home')}
                language={language}
              />
            )}

            {activeScreen === 'role_guide' && (
              <RoleGuideView
                onClose={() => setActiveScreen('home')}
                language={language}
              />
            )}

            {activeScreen === 'shop' && (
              <ShopView
                shopItems={MOCK_SHOP_ITEMS}
                language={language}
                onClose={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'leaders' && (
              <LeaderboardsView
                leaderboardUsers={MOCK_LEADER_USERS}
                language={language}
                onClose={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'history' && (
              <MatchHistoryView
                historyData={MOCK_MATCH_HISTORY}
                onClose={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'settings' && (
              <SettingsView
                language={language}
                onToggleLanguage={toggleLanguage}
                onClose={() => setActiveScreen('home')}
              />
            )}
          </div>
        </div>

      </div>

      {/* Renders global modal rules overlay explicitly */}
      <GameRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={language}
      />
    </div>
  );
}