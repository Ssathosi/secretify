/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { AuthView, loadSavedAuth, clearAuth, type AuthUser, isValidClerkKey } from './components/AuthView';
import { LiveLeaderboardView } from './components/LiveLeaderboardView';
import { getRandomWordPair } from './utils/wordPacks';
import { BilingualText, ScallopLine } from './components/BrutalComponents';
import { sfx } from './utils/audio';
import { useMultiplayer } from './hooks/useMultiplayer';
import { useEconomy } from './hooks/useEconomy';
import {
  mapChatMessages,
  mapRoomPlayers,
  resolveOnlineScreen
} from './utils/multiplayerMappers';

type PlayMode = 'mock' | 'online';

// Smart initial screen detection: skip splash+onboarding if returning from OAuth or already logged in
function getInitialScreen(): string {
  // Returning from Clerk OAuth callback — go straight to login so Clerk can process the token
  if (window.location.hash.includes('sso-callback')) {
    return 'login';
  }
  // Already logged in — skip straight to home
  const saved = loadSavedAuth();
  if (saved) return 'home';
  // First-time visitor — show splash
  return 'splash';
}

export default function App() {
  // Global configuration
  const [language, setLanguage] = useState<'ID' | 'EN'>('ID');
  const [activeScreen, setActiveScreen] = useState<string>(getInitialScreen);
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

  // Authenticated user (null = guest)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Load saved session on first mount
  useEffect(() => {
    const saved = loadSavedAuth();
    if (saved) {
      setCurrentUser(saved.user);
      setPlayerName(saved.user.username);
      setPlayerAvatar(saved.user.avatar);
      // Skip onboarding for returning users
      setActiveScreen('home');
    }
  }, []);

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

  // Economy system — wallet & inventory
  const economy = useEconomy(currentUser);

  // Track game rewards to avoid duplicate coins
  const coinsRewardedRef = useRef<Set<string>>(new Set());

  // Award coins when game ends (winner screen)
  useEffect(() => {
    if (activeScreen === 'winner' || activeScreen === 'reality_winner') {
      const gameKey = `${activeScreen}-${Date.now()}`;
      if (!coinsRewardedRef.current.has(gameKey)) {
        coinsRewardedRef.current.add(gameKey);
        
        // Determine reward amount based on role and outcome
        let reward = 50; // base participation reward
        if (activeScreen === 'winner') {
          const myRole = isOnlinePlay
            ? multiplayer.currentPlayer?.role
            : playersList.find(p => p.id === '1')?.role;
          const winnerGroup = isOnlinePlay
            ? multiplayer.room.winnerRoleGroup
            : 'CIVILIANS'; // mock mode always shows civilian win
          
          if (myRole === winnerGroup) {
            reward = 100; // winner bonus
          }
        }
        
        economy.addCoinsReward(reward);
      }
    }
  }, [activeScreen]);

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

  // Handle DB auth success (register/login)
  const handleAuthSuccess = (user: AuthUser, _token: string) => {
    setCurrentUser(user);
    setPlayerName(user.username);
    setPlayerAvatar(user.avatar);
    setPlayersList((prev) =>
      prev.map((p) => (p.id === '1' ? { ...p, name: user.username, avatar: user.avatar } : p))
    );
    // Economy will auto-refresh when currentUser changes via useEconomy hook
    setActiveScreen('home');
  };

  const handleLogout = async () => {
    clearAuth();
    setCurrentUser(null);
    setActiveScreen('login');
    if (isValidClerkKey) {
      try {
        const clerk = (window as any).Clerk;
        if (clerk) {
          await clerk.signOut();
        }
      } catch (e) {
        console.error('Clerk signout error:', e);
      }
    }
  };

  const enterOnlineLobby = async (
    action: 'create' | 'join',
    joinCode?: string
  ) => {
    setPlayMode('online');
    multiplayer.clearError();
    try {
      if (action === 'create') {
        await multiplayer.createRoom(playerName, playerAvatar, currentUser?.id);
      } else if (joinCode) {
        await multiplayer.joinRoom(joinCode, playerName, playerAvatar, currentUser?.id);
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

  const handleLobbySettingsChange = useCallback((settings: {
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
  }, [playMode, multiplayer.isHost, multiplayer.updateSettings]);

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
        enabledSpecialRoles: specialRoles,
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
      {/* Full-width viewport layout */}
      <div className="max-w-[1440px] mx-auto min-h-dvh relative">

        {/* Main application container */}
        <div className="flex flex-col min-h-dvh overflow-x-hidden">


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
              <AuthView
                onAuthSuccess={handleAuthSuccess}
                onContinueAsGuest={() => setActiveScreen('home')}
                language={language}
              />
            )}

            {activeScreen === 'home' && (
              <HomeView
                playerName={playerName}
                avatar={playerAvatar}
                currentUser={currentUser}
                coins={economy.coins}
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
                onGoToLogin={() => setActiveScreen('login')}
                onClaimDailyReward={() => economy.addCoinsReward(150)}
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
                allVotedOrSkipped={isOnlinePlay ? multiplayer.room?.gameState === 'elimination' : false}
                onCastVote={handleCastVoteOnTarget}
                onSkipVote={() => {
                  if (me?.id) {
                    multiplayer.skipVote(me.id);
                  }
                }}
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
                currentUser={currentUser}
                ownedItemIds={economy.ownedItemIds}
                onUpdateNameAndAvatar={async (n, a) => {
                  if (currentUser) {
                    try {
                      const token = localStorage.getItem('secretify_token');
                      const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';
                      const res = await fetch(`${SERVER_URL}/api/user/update`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username: n, avatar: a })
                      });
                      const data = await res.json();
                      if (res.ok && data.user) {
                        // Only update state after API succeeds
                        setPlayerName(n);
                        setPlayerAvatar(a);
                        setCurrentUser(data.user);
                        localStorage.setItem('secretify_user', JSON.stringify(data.user));
                        return { success: true };
                      } else {
                        console.error('Failed to update database profile:', data.error);
                        return { success: false, error: data.error };
                      }
                    } catch (e: any) {
                      console.error('Failed to connect to profile update endpoint:', e);
                      return { success: false, error: e?.message || 'Network error' };
                    }
                  } else {
                    // Guest mode - just update local state
                    setPlayerName(n);
                    setPlayerAvatar(a);
                    return { success: true };
                  }
                }}
                onDeleteAccount={async () => {
                  if (currentUser) {
                    try {
                      const token = localStorage.getItem('secretify_token');
                      const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';
                      const res = await fetch(`${SERVER_URL}/api/user/delete`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      if (res.ok) {
                        console.log('Successfully deleted user from database.');
                      } else {
                        const data = await res.json();
                        console.error('Failed to delete user from database:', data.error);
                      }
                    } catch (e) {
                      console.error('Failed to connect to delete profile endpoint:', e);
                    }
                  }
                }}
                onLogout={handleLogout}
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
                coins={economy.coins}
                ownedItemIds={economy.ownedItemIds}
                onPurchase={economy.purchaseItem}
                onClose={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'leaders' && (
              <LiveLeaderboardView
                onBack={() => setActiveScreen('home')}
                language={language}
                currentUserId={currentUser?.id}
              />
            )}

            {activeScreen === 'history' && (
              <MatchHistoryView
                historyData={MOCK_MATCH_HISTORY}
                currentUser={currentUser}
                language={language}
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