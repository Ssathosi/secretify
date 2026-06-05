/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io with CORS to allow connections from Vite dev server
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allows easy testing across localhost and local networks
    methods: ['GET', 'POST']
  }
});

// Basic HTTP Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API: Get active rooms count
app.get('/api/rooms', (req, res) => {
  res.json({ 
    activeRooms: Object.keys(activeRooms).length,
    totalPlayers: Object.values(activeRooms).reduce((sum, room) => sum + room.players.length, 0)
  });
});

// In-Memory Database for Active Lobbies
interface ServerPlayer {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  hasConfirmedRole: boolean;
  role?: 'SIVIL' | 'UNDERCOVER' | 'MR_WHITE' | 'SPECIAL';
  word?: string;
  isEliminated: boolean;
  votesReceived: number;
  votedForId?: string;
  points: number;
  level: number;
  specialRole?: string; // 'clown' | 'boomerang' | 'shadow' | 'ghost' | 'lovers' | 'revenger'
  loversPartnerId?: string;
}

interface Clue {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  clueTextID: string;
  clueTextEN: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  messageID: string;
  messageEN: string;
  avatar: string;
}

interface Room {
  code: string;
  players: ServerPlayer[];
  maxPlayers: number;
  rounds: number;
  specialRolesEnabled: boolean;
  enabledSpecialRoles: string[];
  voiceChatEnabled: boolean;
  gameMode: string;
  wordPack: string;
  gameState:
    | 'waiting'
    | 'role_assignment'
    | 'clue_round'
    | 'clue_complete'
    | 'discussion'
    | 'voting'
    | 'elimination'
    | 'winner';
  currentRound: number;
  clues: Clue[];
  chatMessages: ChatMessage[];
  civilianWord: string;
  undercoverWord: string;
  debateDurationSec: number;
  discussionEndsAt: number | null;
  clueCompleteEndsAt: number | null;
  winnerRoleGroup?: 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE';
}

const activeRooms: Record<string, Room> = {};
const debateTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const clueCompleteTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const MIN_PLAYERS = 3;
const DEFAULT_DEBATE_SEC = 90;
const CLUE_TO_DISCUSSION_DELAY_MS = 5000;

function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

function getRoom(code: string): Room | undefined {
  return activeRooms[normalizeRoomCode(code)];
}

function getPlayerForSocket(
  room: Room,
  socketId: string,
  playerId: string
): ServerPlayer | null {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  if (player.socketId !== socketId) {
    const oldSocket = io.sockets.sockets.get(player.socketId);
    if (!oldSocket?.connected) {
      player.socketId = socketId;
    } else {
      return null;
    }
  }
  return player;
}

function broadcastRoom(code: string, room: Room) {
  const normalized = normalizeRoomCode(code);
  io.to(normalized).emit('room-updated', JSON.parse(JSON.stringify(room)));
}

function clearDiscussionTimer(code: string) {
  if (debateTimers[code]) {
    clearTimeout(debateTimers[code]);
    delete debateTimers[code];
  }
}

function clearClueCompleteTimer(code: string) {
  if (clueCompleteTimers[code]) {
    clearTimeout(clueCompleteTimers[code]);
    delete clueCompleteTimers[code];
  }
}

function beginDiscussion(code: string) {
  const room = activeRooms[code];
  if (!room || room.gameState !== 'clue_complete') return;

  clearClueCompleteTimer(code);
  room.clueCompleteEndsAt = null;
  room.gameState = 'discussion';
  startDiscussionTimer(code);
}

function scheduleDiscussionAfterClues(code: string) {
  clearClueCompleteTimer(code);
  clueCompleteTimers[code] = setTimeout(() => {
    beginDiscussion(code);
  }, CLUE_TO_DISCUSSION_DELAY_MS);
}

function transitionRoomToVoting(code: string) {
  const room = activeRooms[code];
  if (!room || room.gameState !== 'discussion') return;

  clearDiscussionTimer(code);
  room.discussionEndsAt = null;
  room.gameState = 'voting';
  room.players = room.players.map((p) => ({
    ...p,
    votesReceived: 0,
    votedForId: undefined
  }));
  broadcastRoom(code, room);
}

function startDiscussionTimer(code: string) {
  const room = activeRooms[code];
  if (!room) return;

  clearDiscussionTimer(code);
  const durationMs =
    Math.max(30, room.debateDurationSec ?? DEFAULT_DEBATE_SEC) * 1000;
  room.discussionEndsAt = Date.now() + durationMs;

  debateTimers[code] = setTimeout(() => {
    transitionRoomToVoting(code);
  }, durationMs);

  broadcastRoom(code, room);
}

// Hardcoded Word Packs for robust offline role assignment sync
const WORD_PAIRS_POOL: Record<string, Array<{ civilian: string; undercover: string }>> = {
  pack_food: [
    { civilian: 'PIZZA', undercover: 'MARTABAK' },
    { civilian: 'RENDANG', undercover: 'GULAI' },
    { civilian: 'KOPI', undercover: 'SUSU' },
    { civilian: 'BURGER', undercover: 'SANDWICH' },
    { civilian: 'RAMEN', undercover: 'BAKSO' }
  ],
  pack_space: [
    { civilian: 'ASTRONOT', undercover: 'KOSMONOT' },
    { civilian: 'PLANET', undercover: 'METEOR' },
    { civilian: 'GALAKSI', undercover: 'NEBULA' },
    { civilian: 'ROKET', undercover: 'SATELIT' }
  ],
  pack_general: [
    { civilian: 'GITAR', undercover: 'BIOLA' },
    { civilian: 'SEPATU', undercover: 'SANDAL' },
    { civilian: 'BUNGA', undercover: 'DAUN' },
    { civilian: 'LAPTOP', undercover: 'TABLET' }
  ]
};

function getRandomWordPair(packId: string) {
  const pool = WORD_PAIRS_POOL[packId] || WORD_PAIRS_POOL.pack_food;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Generate a random 6-character uppercase room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (activeRooms[code]); // Ensure uniqueness
  return code;
}

// Socket Connection Handler
io.on('connection', (socket: Socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Event: Host Creates a Room
  socket.on('create-room', (hostData: { name: string; avatar: string }) => {
    const code = generateRoomCode();
    const newRoom: Room = {
      code,
      players: [
        {
          id: '1', // Host is player 1
          socketId: socket.id,
          name: hostData.name,
          avatar: hostData.avatar,
          isReady: true,
          isHost: true,
          hasConfirmedRole: false,
          isEliminated: false,
          votesReceived: 0,
          points: 2450,
          level: 12
        }
      ],
      maxPlayers: 8,
      rounds: 5,
      specialRolesEnabled: false,
      enabledSpecialRoles: [],
      voiceChatEnabled: false,
      gameMode: 'Classic',
      wordPack: 'pack_food',
      gameState: 'waiting',
      currentRound: 1,
      clues: [],
      chatMessages: [],
      civilianWord: '',
      undercoverWord: '',
      debateDurationSec: DEFAULT_DEBATE_SEC,
      discussionEndsAt: null,
      clueCompleteEndsAt: null
    };

    activeRooms[code] = newRoom;
    socket.join(code);

    console.log(`[Room Created] Code: ${code} by ${hostData.name}`);
    socket.emit('room-created', newRoom);
  });

  // Event: Player Joins a Room
  socket.on('join-room', (data: { roomCode: string; name: string; avatar: string }) => {
    const code = data.roomCode.toUpperCase();
    const room = activeRooms[code];

    if (!room) {
      socket.emit('error-msg', { messageID: 'Ruangan tidak ditemukan / Room not found.', messageEN: 'Room not found.' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error-msg', { messageID: 'Ruangan penuh / Room is full.', messageEN: 'Room is full.' });
      return;
    }

    const newPlayer: ServerPlayer = {
      id: (room.players.length + 1).toString(),
      socketId: socket.id,
      name: data.name,
      avatar: data.avatar,
      isReady: false,
      isHost: false,
      hasConfirmedRole: false,
      isEliminated: false,
      votesReceived: 0,
      points: 1000,
      level: 1
    };

    room.players.push(newPlayer);
    socket.join(code);

    console.log(`[Player Joined] ${data.name} entered Room ${code}`);
    broadcastRoom(code, room);
  });

  // Event: Change Player Ready Status
  socket.on('toggle-ready', (data: { roomCode: string; playerId: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const player = getPlayerForSocket(room, socket.id, data.playerId);
    if (!player) {
      socket.emit('error-msg', {
        messageID: 'Hanya bisa mengubah status ready sendiri.',
        messageEN: 'You can only toggle your own ready status.'
      });
      return;
    }

    player.isReady = !player.isReady;
    broadcastRoom(data.roomCode, room);
  });

  // Event: Update Lobby Settings
  socket.on('update-settings', (data: {
    roomCode: string;
    maxPlayers: number;
    rounds: number;
    specialRoles: boolean;
    enabledSpecialRoles?: string[];
    voiceChat: boolean;
    gameMode: string;
    wordPack: string;
    debateDurationSec: number;
  }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState !== 'waiting') return;

    const host = room.players.find((p) => p.isHost && p.socketId === socket.id);
    if (!host) return;

    room.maxPlayers = data.maxPlayers;
    room.rounds = data.rounds;
    room.specialRolesEnabled = data.specialRoles;
    if (data.enabledSpecialRoles !== undefined) {
      room.enabledSpecialRoles = data.enabledSpecialRoles;
    }
    room.voiceChatEnabled = data.voiceChat;
    room.gameMode = data.gameMode;
    room.wordPack = data.wordPack;
    room.debateDurationSec = Math.min(300, Math.max(30, data.debateDurationSec));

    broadcastRoom(data.roomCode, room);
  });

  // Event: Host Starts Game
  socket.on('start-game', (data: {
    roomCode: string;
    rounds?: number;
    wordPack?: string;
    debateDurationSec?: number;
    specialRoles?: boolean;
    enabledSpecialRoles?: string[];
    voiceChat?: boolean;
    gameMode?: string;
  }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const host = room.players.find((p) => p.isHost && p.socketId === socket.id);
    if (!host) {
      socket.emit('error-msg', {
        messageID: 'Hanya host yang dapat memulai permainan.',
        messageEN: 'Only the host can start the game.'
      });
      return;
    }

    if (room.players.length < MIN_PLAYERS) {
      socket.emit('error-msg', {
        messageID: `Minimal ${MIN_PLAYERS} pemain untuk memulai.`,
        messageEN: `Minimum ${MIN_PLAYERS} players required to start.`
      });
      return;
    }

    if (!room.players.every((p) => p.isReady)) {
      socket.emit('error-msg', {
        messageID: 'Semua pemain harus siap (ready).',
        messageEN: 'All players must be ready.'
      });
      return;
    }

    if (data.rounds !== undefined) room.rounds = data.rounds;
    if (data.wordPack !== undefined) room.wordPack = data.wordPack;
    if (data.gameMode !== undefined) room.gameMode = data.gameMode;
    if (data.specialRoles !== undefined) room.specialRolesEnabled = data.specialRoles;
    if (data.enabledSpecialRoles !== undefined) room.enabledSpecialRoles = data.enabledSpecialRoles;
    if (data.voiceChat !== undefined) room.voiceChatEnabled = data.voiceChat;
    if (data.debateDurationSec !== undefined) {
      room.debateDurationSec = Math.min(
        300,
        Math.max(30, data.debateDurationSec)
      );
    }

    // Retrieve randomized words
    const pair = getRandomWordPair(room.wordPack);
    room.civilianWord = pair.civilian;
    room.undercoverWord = pair.undercover;
    room.gameState = 'role_assignment';
    room.clues = [];
    room.chatMessages = [];

    // Distribute Roles
    const playersCount = room.players.length;
    // Calculate undercover size: 1 undercover for < 6 players, 2 for 6+
    const ucCount = playersCount >= 6 ? 2 : 1;
    const includeMrWhite = playersCount >= 4; // Mr. White joins if at least 4 players
    const whiteCount = includeMrWhite ? 1 : 0;
    const civCount = playersCount - ucCount - whiteCount;

    const rolesPool: Array<'SIVIL' | 'UNDERCOVER' | 'MR_WHITE'> = [];
    for (let i = 0; i < civCount; i++) rolesPool.push('SIVIL');
    for (let i = 0; i < ucCount; i++) rolesPool.push('UNDERCOVER');
    for (let i = 0; i < whiteCount; i++) rolesPool.push('MR_WHITE');

    // Shuffle roles
    const shuffledRoles = [...rolesPool].sort(() => Math.random() - 0.5);

    // Prepare special role pool (shuffle a copy of enabled roles)
    const enabledSpecials = room.enabledSpecialRoles.length > 0 ? [...room.enabledSpecialRoles] : [];
    const shuffledSpecials = [...enabledSpecials].sort(() => Math.random() - 0.5);
    // Assign at most one special role per player, using a queue
    let specialQueue = [...shuffledSpecials];

    room.players = room.players.map((p, index) => {
      const assignedRole = shuffledRoles[index] || 'SIVIL';
      let word = room.civilianWord;
      if (assignedRole === 'UNDERCOVER') word = room.undercoverWord;
      else if (assignedRole === 'MR_WHITE') word = '???';

      // Assign a special role from the queue (one per player, optional)
      const specialRole = specialQueue.length > 0 ? specialQueue.shift() : undefined;

      return {
        ...p,
        role: assignedRole,
        word,
        hasConfirmedRole: false,
        isEliminated: false,
        votesReceived: 0,
        votedForId: undefined,
        specialRole: specialRole ?? undefined,
        loversPartnerId: undefined
      };
    });

    // Wire up Lovers partner links if both players have the 'lovers' role
    const loversPlayers = room.players.filter(p => p.specialRole === 'lovers');
    if (loversPlayers.length >= 2) {
      // Link first two lovers together
      loversPlayers[0].loversPartnerId = loversPlayers[1].id;
      loversPlayers[1].loversPartnerId = loversPlayers[0].id;
    }

    console.log(`[Game Started] Room ${data.roomCode} initialized! Civilians: ${civCount}, Undercovers: ${ucCount}, Specials: ${room.players.filter(p => p.specialRole).map(p => p.specialRole).join(', ')}`);
    const roomSnapshot = JSON.parse(JSON.stringify(room));
    const roomKey = normalizeRoomCode(data.roomCode);
    io.to(roomKey).emit('game-started', roomSnapshot);
    broadcastRoom(roomKey, room);
  });

  // Event: Player confirms role reveal (per-player progression)
  socket.on('confirm-role', (data: { roomCode: string; playerId: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) {
      socket.emit('error-msg', {
        messageID: 'Ruangan tidak ditemukan.',
        messageEN: 'Room not found.'
      });
      return;
    }
    if (room.gameState !== 'role_assignment') {
      socket.emit('error-msg', {
        messageID: 'Konfirmasi peran hanya saat fase penugasan peran.',
        messageEN: 'Role confirm is only allowed during role assignment.'
      });
      return;
    }

    const player = getPlayerForSocket(room, socket.id, data.playerId);
    if (!player) {
      socket.emit('error-msg', {
        messageID: 'Tidak bisa mengonfirmasi peran. Coba muat ulang halaman.',
        messageEN: 'Could not confirm role. Try refreshing the page.'
      });
      return;
    }

    if (player.hasConfirmedRole) {
      broadcastRoom(data.roomCode, room);
      return;
    }

    player.hasConfirmedRole = true;

    const allConfirmed = room.players.every((p) => p.hasConfirmedRole);
    if (allConfirmed) {
      room.gameState = 'clue_round';
    }

    broadcastRoom(data.roomCode, room);
  });

  // Event: Submit Clue description
  socket.on('submit-clue', (data: { roomCode: string; playerId: string; clueText: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const player = getPlayerForSocket(room, socket.id, data.playerId);
    if (!player || player.isEliminated) return;

    if (!player.hasConfirmedRole) return;

    if (room.gameState !== 'clue_round') {
      return;
    }

    if (room.clues.some((c) => c.playerId === data.playerId)) return;

    const newClue: Clue = {
      id: Math.random().toString(),
      playerId: data.playerId,
      playerName: player.name,
      avatar: player.avatar,
      clueTextID: data.clueText,
      clueTextEN: data.clueText
    };
    room.clues.push(newClue);

    const livingPlayers = room.players.filter((p) => !p.isEliminated);
    const submittedIds = new Set(room.clues.map((c) => c.playerId));

    if (livingPlayers.every((p) => submittedIds.has(p.id))) {
      room.gameState = 'clue_complete';
      room.clueCompleteEndsAt = Date.now() + CLUE_TO_DISCUSSION_DELAY_MS;
      broadcastRoom(data.roomCode, room);
      scheduleDiscussionAfterClues(data.roomCode);
      return;
    }

    broadcastRoom(data.roomCode, room);
  });

  // Event: Host skips clue-complete pause → start debate
  socket.on('proceed-to-discussion', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState !== 'clue_complete') return;

    const host = room.players.find((p) => p.isHost && p.socketId === socket.id);
    if (!host) {
      socket.emit('error-msg', {
        messageID: 'Hanya host yang dapat melanjutkan ke debat.',
        messageEN: 'Only the host can proceed to debate.'
      });
      return;
    }

    beginDiscussion(data.roomCode);
  });

  // Event: Send discussion message
  socket.on('send-message', (data: { roomCode: string; senderId: string; message: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    if (room.gameState !== 'discussion') return;

    const player = getPlayerForSocket(room, socket.id, data.senderId);
    if (!player || player.isEliminated) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      senderId: data.senderId,
      senderName: player.name,
      avatar: player.avatar,
      messageID: data.message,
      messageEN: data.message
    };
    room.chatMessages.push(newMessage);
    broadcastRoom(data.roomCode, room);
  });

  // Event: trigger-voting (disabled — timer now drives transition automatically)
  // Hosts can no longer skip the debate timer early. The server timer in
  // startDiscussionTimer() will call transitionRoomToVoting() when time expires.
  socket.on('trigger-voting', (_data: { roomCode: string }) => {
    // Intentionally ignored — voting is triggered automatically by the debate timer.
    socket.emit('error-msg', {
      messageID: 'Lompat voting tidak diperbolehkan. Tunggu timer habis.',
      messageEN: 'Skipping to voting is not allowed. Wait for the debate timer.'
    });
  });

  // Event: Cast Vote on target player (one vote per living player; Ghost can vote after death)
  socket.on('cast-vote', (data: {
    roomCode: string;
    voterPlayerId?: string;
    targetPlayerId: string;
  }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState !== 'voting') return;

    const voter = data.voterPlayerId
      ? getPlayerForSocket(room, socket.id, data.voterPlayerId)
      : room.players.find((p) => p.socketId === socket.id) ?? null;

    if (!voter) return;
    // Ghost (eliminated) CAN vote; all others cannot vote if eliminated
    const isGhost = voter.specialRole === 'ghost';
    if (voter.isEliminated && !isGhost) return;
    if (voter.votedForId) return; // already voted this round

    if (voter.id === data.targetPlayerId) return;

    const target = room.players.find((p) => p.id === data.targetPlayerId);
    if (!target || target.isEliminated) return;

    voter.votedForId = data.targetPlayerId;
    // Shadow: counts as 2 votes
    const voteWeight = voter.specialRole === 'shadow' ? 2 : 1;
    target.votesReceived += voteWeight;

    console.log(
      `[Vote] ${voter.name}${voter.specialRole ? ` (${voter.specialRole})` : ''} voted for ${target.name} (+${voteWeight}) in Room ${data.roomCode}`
    );

    broadcastRoom(data.roomCode, room);
  });

  // Event: Confirm elimination (resolves special role effects then checks win)
  socket.on('confirm-elimination', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const living = room.players.filter((p) => !p.isEliminated);
    if (living.length === 0) return;

    // ── Step 1: Find the highest-voted player ──────────────────────────────
    let target = living[0];
    let tie = false;
    for (let i = 1; i < living.length; i++) {
      if (living[i].votesReceived > target.votesReceived) {
        target = living[i];
        tie = false;
      } else if (living[i].votesReceived === target.votesReceived && target.votesReceived > 0) {
        tie = true;
      }
    }
    if (tie) {
      const tiedPlayers = living.filter((p) => p.votesReceived === target.votesReceived);
      target = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
    }

    // ── Step 2: Boomerang — if target is Boomerang, redirect votes to voters ─
    if (target.specialRole === 'boomerang') {
      console.log(`[Boomerang] ${target.name}'s votes bounce back to voters!`);
      // Reset all vote counts
      room.players = room.players.map(p => ({ ...p, votesReceived: 0 }));
      // Find everyone who voted for the boomerang and eliminate the one with most bounce-back votes
      const votersOfBoomerang = room.players.filter(p => p.votedForId === target.id && !p.isEliminated);
      votersOfBoomerang.forEach(voter => {
        const voterInRoom = room.players.find(p => p.id === voter.id);
        if (voterInRoom) voterInRoom.votesReceived += 1;
      });
      // Re-find highest voted among voters (new target)
      const newLiving = room.players.filter(p => !p.isEliminated);
      let newTarget = newLiving[0];
      for (const p of newLiving) {
        if (p.votesReceived > newTarget.votesReceived) newTarget = p;
      }
      // Only redirect if someone actually voted for boomerang
      if (votersOfBoomerang.length > 0) {
        target = newTarget;
        console.log(`[Boomerang] Redirected — new target: ${target.name}`);
      }
    }

    // ── Step 3: Eliminate the resolved target ─────────────────────────────
    const eliminatedIds: string[] = [target.id];
    room.players = room.players.map(p =>
      p.id === target.id ? { ...p, isEliminated: true } : p
    );
    console.log(`[Elimination] ${target.name} (Role: ${target.role}${target.specialRole ? ', Special: ' + target.specialRole : ''}) eliminated in Room ${data.roomCode}`);

    // ── Step 4: Happy Clown — wins if eliminated in Round 1 ───────────────
    if (target.specialRole === 'clown' && room.currentRound === 1) {
      console.log(`[Clown] ${target.name} was eliminated in Round 1 — Clown wins!`);
      room.gameState = 'winner';
      room.winnerRoleGroup = 'CIVILIANS'; // Clown bonus — treat as civilian win or special
      broadcastRoom(data.roomCode, room);
      return;
    }

    // ── Step 5: Revenger — drags down their last voted target ─────────────
    if (target.specialRole === 'revenger' && target.votedForId) {
      const revengeTarget = room.players.find(p => p.id === target.votedForId && !p.isEliminated);
      if (revengeTarget) {
        revengeTarget.isEliminated = true;
        eliminatedIds.push(revengeTarget.id);
        console.log(`[Revenger] ${target.name} drags down ${revengeTarget.name}!`);
      }
    }

    // ── Step 6: Lovers — partner dies with the eliminated player ──────────
    for (const elimId of [...eliminatedIds]) {
      const elimPlayer = room.players.find(p => p.id === elimId);
      if (elimPlayer?.specialRole === 'lovers' && elimPlayer.loversPartnerId) {
        const partner = room.players.find(p => p.id === elimPlayer.loversPartnerId && !p.isEliminated);
        if (partner) {
          partner.isEliminated = true;
          eliminatedIds.push(partner.id);
          console.log(`[Lovers] ${partner.name} dies with their partner ${elimPlayer.name}!`);
        }
      }
    }

    // ── Step 7: Check Win Conditions ──────────────────────────────────────
    const active = room.players.filter((p) => !p.isEliminated);
    const civs = active.filter((p) => p.role === 'SIVIL');
    const ucs = active.filter((p) => p.role === 'UNDERCOVER');
    const whites = active.filter((p) => p.role === 'MR_WHITE');

    if (ucs.length === 0 && whites.length === 0) {
      // Civilians win — all enemy roles eliminated
      room.gameState = 'winner';
      room.winnerRoleGroup = 'CIVILIANS';
    } else if (ucs.length >= civs.length) {
      // Undercovers win — they outnumber or match civilians
      room.gameState = 'winner';
      room.winnerRoleGroup = 'UNDERCOVERS';
    } else if (whites.length >= civs.length && ucs.length === 0) {
      // Mr. White wins — all undercovers gone and whites >= civs
      room.gameState = 'winner';
      room.winnerRoleGroup = 'MR_WHITE';
    } else {
      clearDiscussionTimer(data.roomCode);
      clearClueCompleteTimer(data.roomCode);
      room.discussionEndsAt = null;
      room.clueCompleteEndsAt = null;
      room.currentRound += 1;
      room.clues = [];
      room.chatMessages = [];
      room.players = room.players.map((p) => ({
        ...p,
        hasConfirmedRole: false,
        votedForId: undefined,
        votesReceived: 0
      }));
      room.gameState = 'clue_round';
    }

    broadcastRoom(data.roomCode, room);
  });

  // Event: Mr. White Guess word attempt
  socket.on('mr-white-guess', (data: { roomCode: string; wordGuess: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const isCorrect = data.wordGuess.toUpperCase() === room.civilianWord.toUpperCase();
    if (isCorrect) {
      room.gameState = 'winner';
      room.winnerRoleGroup = 'MR_WHITE';
    } else {
      // Mr. White guessed wrong. Check if game is over
      const active = room.players.filter((p) => !p.isEliminated);
      const ucs = active.filter((p) => p.role === 'UNDERCOVER');
      const whites = active.filter((p) => p.role === 'MR_WHITE');

      if (ucs.length === 0 && whites.length === 0) {
        room.gameState = 'winner';
        room.winnerRoleGroup = 'CIVILIANS';
      } else {
        clearDiscussionTimer(data.roomCode);
        room.discussionEndsAt = null;
        room.currentRound += 1;
        room.clues = [];
        room.chatMessages = [];
        room.players = room.players.map((p) => ({
          ...p,
          hasConfirmedRole: false,
          votedForId: undefined,
          votesReceived: 0
        }));
        room.gameState = 'clue_round';
      }
    }

    broadcastRoom(data.roomCode, room);
  });

  // Event: Return back to Lobby Waiting state
  socket.on('play-again', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (room) {
      room.gameState = 'waiting';
      room.currentRound = 1;
      clearDiscussionTimer(data.roomCode);
      clearClueCompleteTimer(data.roomCode);
      room.clues = [];
      room.chatMessages = [];
      room.discussionEndsAt = null;
      room.clueCompleteEndsAt = null;
      room.winnerRoleGroup = undefined;
      room.players = room.players.map((p) => ({
        ...p,
        isReady: p.isHost, // Host is ready by default
        hasConfirmedRole: false,
        role: undefined,
        word: undefined,
        isEliminated: false,
        votesReceived: 0,
        votedForId: undefined,
        specialRole: undefined,
        loversPartnerId: undefined
      }));

      broadcastRoom(data.roomCode, room);
    }
  });

  // Event: Peer Disconnects
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);

    // Scan rooms to remove player
    for (const code in activeRooms) {
      const room = activeRooms[code];
      const playerIdx = room.players.findIndex((p) => p.socketId === socket.id);

      if (playerIdx !== -1) {
        const removedPlayer = room.players[playerIdx];
        room.players.splice(playerIdx, 1);

        console.log(`[Player Left] ${removedPlayer.name} disconnected from Room ${code}`);

        if (room.players.length === 0) {
          clearDiscussionTimer(code);
          clearClueCompleteTimer(code);
          delete activeRooms[code];
          console.log(`[Room Destroyed] Room ${code} is empty`);
        } else {
          // If host left, re-assign host to first player
          if (removedPlayer.isHost) {
            room.players[0].isHost = true;
            room.players[0].isReady = true;
            console.log(`[New Host Assigned] ${room.players[0].name} in Room ${code}`);
          }
          broadcastRoom(code, room);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(` SECRETIFY SECURED BACKEND SERVER STARTED`);
  console.log(` Express & Socket.io listening on port ${PORT}`);
  console.log(`==========================================\n`);
});
