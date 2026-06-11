/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, calculateLevel, calcPointsGained } from './db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secretify_jwt_secret_key_2026';

const app = express();

// Allow requests from the Vite dev server and production origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://secretify-game.vercel.app',
  process.env.APP_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
const httpServer = createServer(app);

// Configure Socket.io with CORS to allow connections from Vite dev server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ── REST Endpoints ──────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Active rooms
app.get('/api/rooms', (req, res) => {
  res.json({ 
    activeRooms: Object.keys(activeRooms).length,
    totalPlayers: Object.values(activeRooms).reduce((sum, room) => sum + room.players.length, 0)
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, avatar } = req.body as { username: string; password: string; avatar?: string };
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username minimal 3 karakter.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }
    const { data: existing, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle();
    if (findError) throw findError;
    if (existing) {
      return res.status(409).json({ error: 'Username sudah dipakai.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: username.trim(),
        password_hash: hash,
        avatar: avatar || 'detective',
        points: 0,
        level: 1,
        coins: 500
      })
      .select('id')
      .single();
    if (insertError) throw insertError;
    const token = jwt.sign({ id: newUser.id, username: username.trim() }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({
      token,
      user: { id: newUser.id, username: username.trim(), avatar: avatar || 'detective', points: 0, level: 1, coins: 500 }
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username?.trim() || !password) {
      return res.status(400).json({ error: 'Username dan password diperlukan.' });
    }
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, password_hash, avatar, points, level, coins')
      .eq('username', username.trim())
      .maybeSingle();
    if (findError) throw findError;
    if (!user) return res.status(401).json({ error: 'Username tidak ditemukan.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password salah.' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({
      token,
      user: { id: user.id, username: user.username, avatar: user.avatar, points: user.points, level: user.level, coins: user.coins ?? 500 }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Global Leaderboard — top 20 by points
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, username, avatar, points, level')
      .order('points', { ascending: false })
      .limit(20);
    if (error) throw error;
    return res.json({ leaderboard: rows || [] });
  } catch (err) {
    console.error('[Leaderboard Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Match history for a user
app.get('/api/users/:id/history', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('match_participants')
      .select(`
        role,
        special_role,
        points_gained,
        won,
        matches (
          room_code,
          winner_group,
          played_at
        )
      `)
      .eq('user_id', req.params.id)
      .order('id', { ascending: false })
      .limit(30);

    if (error) throw error;

    const history = (rows || []).map((row: any) => {
      const match = row.matches;
      return {
        room_code: match?.room_code || '',
        winner_group: match?.winner_group || '',
        played_at: match?.played_at || '',
        role: row.role,
        special_role: row.special_role,
        points_gained: row.points_gained,
        won: row.won ? 1 : 0
      };
    });

    return res.json({ history });
  } catch (err) {
    console.error('[History Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Sync Clerk Authenticated User to Supabase
app.post('/api/auth/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Sync] Missing or malformed Authorization header');
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }
    const token = authHeader.split(' ')[1];

    // Verify Clerk token
    let clerkUserId: string = '';
    const isBypass = token === 'mock_jwt_token_for_e2e_tests';
    if (isBypass) {
      clerkUserId = 'clerk_test_user_id_12345';
      console.log('[Sync] Bypass mode activated, using test user ID');
    }

    try {
      const { createClerkClient, verifyToken } = await import('@clerk/backend');
      const clerkSecret = process.env.CLERK_SECRET_KEY || '';
      const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';

      if (!isBypass) {
        const decoded = await verifyToken(token, {
          secretKey: clerkSecret,
          ...(publishableKey ? { publishableKey } : {})
        });
        clerkUserId = decoded.sub;
        console.log('[Sync] Token verified, user:', clerkUserId);
      }

      const { username, avatar } = req.body as { username?: string; avatar?: string };

      // Check if user already exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id, username, avatar, points, level')
        .eq('id', clerkUserId)
        .maybeSingle();

      if (selectError) {
        console.error('[Sync] Supabase SELECT error:', selectError);
        throw selectError;
      }

      if (existingUser) {
        console.log('[Sync] Existing user found, returning:', existingUser.username);
        return res.json({ user: existingUser, isNew: false });
      }

      // User does NOT exist in database yet
      // 1. If avatar is not provided, they are in the initial check from the frontend.
      // Do not write to the database yet; just return a profile template.
      if (!avatar) {
        let defaultUsername = username?.trim() || '';
        if (!defaultUsername) {
          try {
            const clerk = createClerkClient({ secretKey: clerkSecret });
            const clerkUser = await clerk.users.getUser(clerkUserId);
            defaultUsername =
              clerkUser.username ||
              clerkUser.firstName ||
              `agent_${clerkUserId.substring(5, 10)}`;
          } catch (clerkErr) {
            console.warn('[Sync] Could not fetch Clerk user details:', clerkErr);
            defaultUsername = `agent_${clerkUserId.substring(5, 10)}`;
          }
        }

        // Ensure unique username template
        const { data: duplicateUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', defaultUsername)
          .maybeSingle();

        if (duplicateUser) {
          defaultUsername = `${defaultUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        }

        console.log('[Sync] New user detected, returning profile setup template:', defaultUsername);
        return res.json({
          user: {
            id: clerkUserId,
            username: defaultUsername,
            avatar: 'detective',
            points: 0,
            level: 1,
            coins: 500
          },
          isNew: true
        });
      }

      // 2. If avatar is provided, they submitted the profile setup form.
      // Insert them into the database with their chosen username and avatar.
      let finalUsername = username?.trim() || '';
      if (!finalUsername) {
        finalUsername = `agent_${clerkUserId.substring(5, 10)}`;
      }

      // Ensure unique username
      const { data: duplicateUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', finalUsername)
        .maybeSingle();

      if (duplicateUser) {
        finalUsername = `${finalUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      console.log('[Sync] Creating new user in database:', finalUsername);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: clerkUserId,
          username: finalUsername,
          avatar: avatar,
          points: 0,
          level: 1,
          coins: 500
        })
        .select('id, username, avatar, points, level, coins')
        .single();

      if (insertError) {
        console.error('[Sync] Supabase INSERT error:', JSON.stringify(insertError));
        throw insertError;
      }

      console.log('[Sync] New user created successfully:', newUser.username);
      return res.json({ user: newUser, isNew: true });

    } catch (tokenErr: any) {
      // If it's a Supabase error re-throw it, otherwise it's a token error
      if (tokenErr?.code || tokenErr?.message?.includes('supabase') || tokenErr?.details) {
        throw tokenErr;
      }
      console.error('[Sync] Token verification failed:', tokenErr?.message || tokenErr);
      return res.status(401).json({ error: 'Token verification failed. Check CLERK_SECRET_KEY.' });
    }

  } catch (err: any) {
    console.error('[Sync Error]', err?.message || err);
    const isRlsError = err?.message?.includes('row-level security') || err?.code === '42501';
    if (isRlsError) {
      return res.status(500).json({
        error: 'Supabase RLS is blocking the insert. Use the Service Role key in SUPABASE_KEY, or disable RLS on the users table.'
      });
    }
    return res.status(500).json({ error: err?.message || 'Auth sync failed.' });
  }
});


// Update user profile (username and/or avatar)
app.post('/api/user/update', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }
    const token = authHeader.split(' ')[1];
    const { username, avatar } = req.body as { username?: string; avatar?: string };

    let userId: string | number | null = null;
    let isClerk = false;

    // 1. Try Clerk verification first if configured
    const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';
    const isValidClerkKey = publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');

    if (token === 'mock_jwt_token_for_e2e_tests') {
      userId = 'clerk_test_user_id_12345';
      isClerk = true;
      console.log('[Profile Update] Bypass token accepted for user:', userId);
    } else if (isValidClerkKey) {
      try {
        const { verifyToken } = await import('@clerk/backend');
        const clerkSecret = process.env.CLERK_SECRET_KEY || '';
        const decoded = await verifyToken(token, {
          secretKey: clerkSecret,
        });
        userId = decoded.sub;
        isClerk = true;
        console.log('[Profile Update] Clerk token verified for user:', userId);
      } catch (clerkErr) {
        // Fall back to local JWT
      }
    }

    // 2. Try local JWT verification if not Clerk
    if (!isClerk) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number; username: string };
        userId = decoded.id;
        console.log('[Profile Update] JWT verified for user:', userId);
      } catch (jwtErr) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updates: any = {};
    if (username?.trim()) {
      const trimmed = username.trim();
      if (trimmed.length < 3) {
        return res.status(400).json({ error: 'Username minimal 3 karakter.' });
      }

      // Check if username is taken by another user
      const { data: duplicate } = await supabase
        .from('users')
        .select('id')
        .eq('username', trimmed)
        .neq('id', userId)
        .maybeSingle();

      if (duplicate) {
        return res.status(409).json({ error: 'Username sudah digunakan oleh pemain lain.' });
      }
      updates.username = trimmed;
    }

    if (avatar) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang dirubah.' });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, username, avatar, points, level')
      .single();

    if (updateError) {
      console.error('[Profile Update] Supabase UPDATE error:', updateError);
      return res.status(500).json({ error: 'Gagal memperbarui database.' });
    }

    console.log('[Profile Update] Successfully updated user:', updatedUser.username);
    return res.json({ user: updatedUser });

  } catch (err: any) {
    console.error('[Profile Update Route Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


// Delete user profile and data from database
app.post('/api/user/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }
    const token = authHeader.split(' ')[1];

    let userId: string | number | null = null;
    let isClerk = false;

    // 1. Try Clerk verification first if configured
    const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';
    const isValidClerkKey = publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');

    if (token === 'mock_jwt_token_for_e2e_tests') {
      userId = 'clerk_test_user_id_12345';
      isClerk = true;
      console.log('[Profile Delete] Bypass token accepted for user:', userId);
    } else if (isValidClerkKey) {
      try {
        const { verifyToken } = await import('@clerk/backend');
        const clerkSecret = process.env.CLERK_SECRET_KEY || '';
        const decoded = await verifyToken(token, {
          secretKey: clerkSecret,
        });
        userId = decoded.sub;
        isClerk = true;
      } catch (clerkErr) {
        // Fall back to local JWT
      }
    }

    // 2. Try local JWT verification if not Clerk
    if (!isClerk) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number; username: string };
        userId = decoded.id;
      } catch (jwtErr) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    console.log(`[Profile Delete] Deleting user ${userId} from database...`);

    // Delete user from Supabase
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('[Profile Delete] Supabase DELETE error:', deleteError);
      return res.status(500).json({ error: 'Gagal menghapus user dari database.' });
    }

    console.log(`[Profile Delete] Successfully deleted user ${userId}`);
    return res.json({ success: true });

  } catch (err: any) {
    console.error('[Profile Delete Route Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


// ── Economy System Endpoints ───────────────────────────────────────────────

// Helper: Verify auth token and return userId
async function verifyAuthToken(token: string): Promise<{ userId: string | null; isClerk: boolean }> {
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';
  const isValidClerkKey = publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');

  if (token === 'mock_jwt_token_for_e2e_tests' || token === 'mock_local_jwt_token_for_e2e_tests') {
    return { userId: 'local_test_user_id_12345', isClerk: true };
  }

  if (isValidClerkKey) {
    try {
      const { verifyToken } = await import('@clerk/backend');
      const clerkSecret = process.env.CLERK_SECRET_KEY || '';
      const decoded = await verifyToken(token, { secretKey: clerkSecret });
      return { userId: decoded.sub, isClerk: true };
    } catch {
      // Fall through to local JWT
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number; username: string };
    return { userId: String(decoded.id), isClerk: false };
  } catch {
    return { userId: null, isClerk: false };
  }
}

// Get wallet balance
app.get('/api/economy/wallet/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('coins')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    return res.json({ coins: user?.coins ?? 500 });
  } catch (err) {
    console.error('[Wallet Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Get user inventory
app.get('/api/economy/inventory/:id', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('user_inventory')
      .select('item_id, purchased_at')
      .eq('user_id', req.params.id)
      .order('purchased_at', { ascending: false });
    if (error) throw error;
    return res.json({ inventory: (items || []).map((row: any) => row.item_id) });
  } catch (err) {
    console.error('[Inventory Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Purchase an item
app.post('/api/economy/purchase', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }
    const token = authHeader.split(' ')[1];
    const { userId } = await verifyAuthToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { itemId, cost } = req.body as { itemId: string; cost: number };
    if (!itemId || !cost || cost <= 0) {
      return res.status(400).json({ error: 'Invalid item or cost.' });
    }

    // Check current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();
    if (userError) throw userError;

    const currentCoins = user?.coins ?? 500;
    if (currentCoins < cost) {
      return res.status(400).json({ error: 'Koin tidak cukup. / Not enough coins.' });
    }

    // Check if already owned
    const { data: existing } = await supabase
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'Item sudah dimiliki. / Already owned.' });
    }

    // Deduct coins
    const newBalance = currentCoins - cost;
    const { error: deductError } = await supabase
      .from('users')
      .update({ coins: newBalance })
      .eq('id', userId);
    if (deductError) throw deductError;

    // Add to inventory
    const { error: invError } = await supabase
      .from('user_inventory')
      .insert({ user_id: userId, item_id: itemId });
    if (invError) throw invError;

    console.log(`[Purchase] User ${userId} bought ${itemId} for ${cost} GC. New balance: ${newBalance}`);
    return res.json({ success: true, coins: newBalance, itemId });
  } catch (err) {
    console.error('[Purchase Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Add coins (reward after game)
app.post('/api/economy/add-coins', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }
    const token = authHeader.split(' ')[1];
    const { userId } = await verifyAuthToken(token);
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { amount } = req.body as { amount: number };
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();
    if (userError) throw userError;

    const currentCoins = user?.coins ?? 500;
    const newBalance = currentCoins + amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: newBalance })
      .eq('id', userId);
    if (updateError) throw updateError;

    return res.json({ success: true, coins: newBalance });
  } catch (err) {
    console.error('[Add Coins Error]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


// In-Memory Database for Active Lobbies
interface ServerPlayer {
  id: string;
  socketId: string;
  dbUserId?: string;   // Linked DB user ID (undefined = guest)
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
  winnerRoleGroup?: 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE' | 'CLOWN';
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
  socket.on('create-room', (hostData: { name: string; avatar: string; dbUserId?: string }) => {
    const code = generateRoomCode();
    const newRoom: Room = {
      code,
      players: [
        {
          id: '1',
          socketId: socket.id,
          dbUserId: hostData.dbUserId,
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
  socket.on('join-room', (data: { roomCode: string; name: string; avatar: string; dbUserId?: string }) => {
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
      dbUserId: data.dbUserId,
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

    // Check if all living players have voted or skipped
    checkVotingComplete(room);
  });

  // Event: Skip Vote (player chooses not to vote)
  socket.on('skip-vote', (data: {
    roomCode: string;
    voterPlayerId?: string;
  }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState !== 'voting') return;

    const voter = data.voterPlayerId
      ? getPlayerForSocket(room, socket.id, data.voterPlayerId)
      : room.players.find((p) => p.socketId === socket.id) ?? null;

    if (!voter) return;
    const isGhost = voter.specialRole === 'ghost';
    if (voter.isEliminated && !isGhost) return;
    if (voter.votedForId) return; // already voted/skipped this round

    voter.votedForId = 'SKIP'; // Mark as skipped
    console.log(`[Skip Vote] ${voter.name} skipped voting in Room ${data.roomCode}`);

    broadcastRoom(data.roomCode, room);
    checkVotingComplete(room);
  });

  // Helper: Check if all living players have voted or skipped
  // When all done, auto-transitions to elimination phase
  function checkVotingComplete(room: Room) {
    const livingPlayers = room.players.filter(p => !p.isEliminated);
    const allVotedOrSkipped = livingPlayers.every(p => p.votedForId !== undefined);

    if (allVotedOrSkipped) {
      console.log(`[Voting Complete] All players voted/skipped in Room ${room.code}, moving to elimination...`);
      // Transition to elimination phase — host must confirm
      room.gameState = 'elimination';
      broadcastRoom(room.code, room);
    }
  }

  // Event: Confirm elimination (resolves special role effects then checks win)
  socket.on('confirm-elimination', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    // Only allow when all players have voted/skipped (gameState = 'elimination')
    if (room.gameState !== 'elimination') {
      socket.emit('error-msg', {
        messageID: 'Tunggu semua pemain memberikan suara atau skip terlebih dahulu.',
        messageEN: 'Wait for all players to vote or skip first.'
      });
      return;
    }

    // Only host can confirm elimination
    const host = room.players.find((p) => p.isHost && p.socketId === socket.id);
    if (!host) {
      socket.emit('error-msg', {
        messageID: 'Hanya host yang dapat mengonfirmasi eliminasi.',
        messageEN: 'Only the host can confirm elimination.'
      });
      return;
    }

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
      room.gameState = 'winner';
      room.winnerRoleGroup = 'CIVILIANS';
    } else if (ucs.length >= civs.length) {
      room.gameState = 'winner';
      room.winnerRoleGroup = 'UNDERCOVERS';
    } else if (whites.length >= civs.length && ucs.length === 0) {
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

    // ── Persist match result if game ended ────────────────────────────────
    if (room.gameState === 'winner' && room.winnerRoleGroup) {
      persistMatchResult(data.roomCode, room).catch((e) =>
        console.error('[DB] Failed to persist match:', e)
      );
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

// ── Persist Match to Supabase ────────────────────────────────────────────────
async function persistMatchResult(roomCode: string, room: Room) {
  try {
    const winnerGroup = room.winnerRoleGroup!;

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({ room_code: roomCode, winner_group: winnerGroup })
      .select('id')
      .single();
    if (matchError) throw matchError;
    const matchId = match.id;

    for (const player of room.players) {
      const role = player.role || 'SIVIL';
      const isWinner =
        (winnerGroup === 'CIVILIANS' && role === 'SIVIL') ||
        (winnerGroup === 'UNDERCOVERS' && role === 'UNDERCOVER') ||
        (winnerGroup === 'MR_WHITE' && role === 'MR_WHITE') ||
        (winnerGroup === 'CLOWN' && player.specialRole === 'clown');

      const pts = calcPointsGained(role, winnerGroup, isWinner);

      const { error: participantError } = await supabase
        .from('match_participants')
        .insert({
          match_id: matchId,
          user_id: player.dbUserId || null,
          guest_name: player.dbUserId ? null : player.name,
          role,
          special_role: player.specialRole || null,
          points_gained: pts,
          won: isWinner
        });
      if (participantError) throw participantError;

      // Update user points and level if they have a DB account
      if (player.dbUserId) {
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('points')
          .eq('id', player.dbUserId)
          .single();
        
        if (userError) {
          console.error(`[DB] Error fetching user points for ID ${player.dbUserId}:`, userError);
          continue;
        }

        const currentPoints = userRecord.points || 0;
        const newPoints = currentPoints + pts;
        const newLevel = calculateLevel(newPoints);

        const { error: updateError } = await supabase
          .from('users')
          .update({ points: newPoints, level: newLevel })
          .eq('id', player.dbUserId);

        if (updateError) {
          console.error(`[DB] Error updating user ${player.dbUserId} stats:`, updateError);
        }
      }
    }

    console.log(`[DB] Match ${matchId} saved for room ${roomCode} — Winner: ${winnerGroup}`);
  } catch (err) {
    console.error('[DB] persistMatchResult error:', err);
  }
}

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(` SECRETIFY SECURED BACKEND SERVER STARTED`);
  console.log(` Express & Socket.io listening on port ${PORT}`);
  console.log(`==========================================\n`);
});
