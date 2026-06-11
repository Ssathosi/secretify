/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socketManager, ServerRoom } from '../utils/socket';
import { Player } from '../types';

export interface UseMultiplayerReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  roomCode: string | null;
  room: ServerRoom | null;
  isHost: boolean;
  currentPlayer: Player | null;
  localPlayerId: string | null;

  connect: () => void;
  disconnect: () => void;
  createRoom: (name: string, avatar: string, dbUserId?: string) => Promise<void>;
  joinRoom: (roomCode: string, name: string, avatar: string, dbUserId?: string) => Promise<void>;
  toggleReady: (playerId: string) => void;
  updateSettings: (settings: {
    maxPlayers: number;
    rounds: number;
    specialRoles: boolean;
    enabledSpecialRoles?: string[];
    voiceChat: boolean;
    gameMode: string;
    wordPack: string;
    debateDurationSec: number;
  }) => void;
  startGame: (settings: {
    rounds: number;
    wordPack: string;
    debateDurationSec: number;
    specialRoles: boolean;
    enabledSpecialRoles?: string[];
    voiceChat: boolean;
    gameMode: string;
  }) => void;
  confirmRole: (playerId: string) => void;
  submitClue: (playerId: string, clueText: string) => void;
  sendMessage: (playerId: string, message: string) => void;
  proceedToDiscussion: () => void;
  triggerVoting: () => void;
  castVote: (voterPlayerId: string, targetPlayerId: string) => void;
  confirmElimination: () => void;
  mrWhiteGuess: (wordGuess: string) => void;
  playAgain: () => void;
  clearError: () => void;
}

function pickCurrentPlayer(
  room: ServerRoom,
  localPlayerId: string | null
): Player | null {
  if (!localPlayerId) return null;
  const p = room.players.find((pl) => pl.id === localPlayerId);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    level: p.level ?? 1,
    points: p.points ?? 0,
    isReady: p.isReady,
    isHost: p.isHost,
    role: p.role,
    word: p.word,
    isEliminated: p.isEliminated,
    votesReceived: p.votesReceived,
    votedForId: p.votedForId,
    hasConfirmedRole: p.hasConfirmedRole ?? false
  };
}

export const useMultiplayer = (): UseMultiplayerReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<ServerRoom | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const localPlayerIdRef = useRef<string | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  const applyRoomUpdate = useCallback((updatedRoom: ServerRoom) => {
    setRoomCode(updatedRoom.code);
    setRoom(updatedRoom);
    const pid = localPlayerIdRef.current;
    setIsHost(updatedRoom.players.some((p) => p.id === pid && p.isHost));
    setCurrentPlayer(pickCurrentPlayer(updatedRoom, pid));
  }, []);

  const setLocalPlayer = useCallback((id: string | null) => {
    localPlayerIdRef.current = id;
    setLocalPlayerId(id);
  }, []);

  const connect = useCallback(() => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const socket = socketManager.connect();

      const onConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      const onDisconnect = () => {
        setIsConnected(false);
      };

      const onErrorMsg = (error: { messageID?: string; messageEN?: string }) => {
        setConnectionError(error.messageEN || error.messageID || 'Server error');
      };

      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error-msg', onErrorMsg);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('error-msg', onErrorMsg);

      if (socket.connected) {
        onConnect();
      }
    } catch (error) {
      setConnectionError((error as Error).message);
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setRoomCode(null);
    setRoom(null);
    setIsHost(false);
    setCurrentPlayer(null);
    localPlayerIdRef.current = null;
  }, []);

  const ensureConnected = useCallback(async () => {
    if (socketManager.isConnected()) {
      setIsConnected(true);
      return;
    }
    connect();
    await new Promise<void>((resolve, reject) => {
      const socket = socketManager.connect();
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
      if (socket.connected) {
        clearTimeout(timeout);
        setIsConnected(true);
        resolve();
        return;
      }
      socket.once('connect', () => {
        clearTimeout(timeout);
        setIsConnected(true);
        resolve();
      });
      socket.once('connect_error', () => {
        clearTimeout(timeout);
        reject(
          new Error(
            'Tidak bisa terhubung ke server. Jalankan backend: npm run server (port 5000).'
          )
        );
      });
    });
  }, [connect]);

  const handleCreateRoom = useCallback(
    async (name: string, avatar: string, dbUserId?: string) => {
      try {
        setConnectionError(null);
        await ensureConnected();
        const newRoom = await socketManager.createRoom({ name, avatar, dbUserId });
        setLocalPlayer(newRoom.players[0]?.id ?? null);
        setRoomCode(newRoom.code);
        setRoom(newRoom);
        setIsHost(true);
        setCurrentPlayer(
          pickCurrentPlayer(newRoom, localPlayerIdRef.current)
        );
      } catch (error) {
        setConnectionError((error as Error).message);
        throw error;
      }
    },
    [ensureConnected, setLocalPlayer]
  );

  const handleJoinRoom = useCallback(
    async (code: string, name: string, avatar: string, dbUserId?: string) => {
      try {
        setConnectionError(null);
        await ensureConnected();
        const joinedRoom = await socketManager.joinRoom({
          roomCode: code,
          name,
          avatar,
          dbUserId
        });
        const me = joinedRoom.players.find((p) => p.name === name);
        setLocalPlayer(me?.id ?? null);
        setRoomCode(joinedRoom.code);
        setRoom(joinedRoom);
        setIsHost(me?.isHost ?? false);
        setCurrentPlayer(
          pickCurrentPlayer(joinedRoom, localPlayerIdRef.current)
        );
      } catch (error) {
        setConnectionError((error as Error).message);
        throw error;
      }
    },
    [ensureConnected, setLocalPlayer]
  );

  // Register room update listeners immediately when room is created/joined
  useEffect(() => {
    if (!roomCode) return;

    const handleRoomUpdate = (updatedRoom: ServerRoom) => {
      applyRoomUpdate(updatedRoom);
    };

    const handleGameStarted = (updatedRoom: ServerRoom) => {
      applyRoomUpdate(updatedRoom);
    };

    const handleErrorMsg = (error: {
      messageID?: string;
      messageEN?: string;
    }) => {
      setConnectionError(error.messageEN || error.messageID || 'Server error');
    };

    socketManager.onRoomUpdated(handleRoomUpdate);
    socketManager.onGameStarted(handleGameStarted);
    const socket = socketManager.connect();
    socket.on('error-msg', handleErrorMsg);

    return () => {
      socketManager.off('room-updated', handleRoomUpdate);
      socketManager.off('game-started', handleGameStarted);
      socket.off('error-msg', handleErrorMsg);
    };
  }, [roomCode, applyRoomUpdate]);

  const toggleReady = useCallback(
    (playerId: string) => {
      if (!roomCode) return;
      socketManager.toggleReady(roomCode, playerId);
    },
    [roomCode]
  );

  const updateSettings = useCallback(
    (settings: {
      maxPlayers: number;
      rounds: number;
      specialRoles: boolean;
      enabledSpecialRoles?: string[];
      voiceChat: boolean;
      gameMode: string;
      wordPack: string;
      debateDurationSec: number;
    }) => {
      if (!roomCode) return;
      socketManager.updateSettings({ roomCode, ...settings });
    },
    [roomCode]
  );

  const startGame = useCallback(
    (settings: {
      rounds: number;
      wordPack: string;
      debateDurationSec: number;
      specialRoles: boolean;
      enabledSpecialRoles?: string[];
      voiceChat: boolean;
      gameMode: string;
    }) => {
      if (!roomCode) return;
      socketManager.startGame(roomCode, settings);
    },
    [roomCode]
  );

  const confirmRole = useCallback(
    (playerId: string) => {
      if (!roomCode) return;
      socketManager.confirmRole(roomCode.toUpperCase(), playerId);
    },
    [roomCode]
  );

  const submitClue = useCallback(
    (playerId: string, clueText: string) => {
      if (!roomCode) return;
      socketManager.submitClue(roomCode, playerId, clueText);
    },
    [roomCode]
  );

  const sendMessage = useCallback(
    (playerId: string, message: string) => {
      if (!roomCode) return;
      socketManager.sendMessage(roomCode, playerId, message);
    },
    [roomCode]
  );

  const proceedToDiscussion = useCallback(() => {
    if (!roomCode) return;
    socketManager.proceedToDiscussion(roomCode);
  }, [roomCode]);

  const triggerVoting = useCallback(() => {
    if (!roomCode) return;
    socketManager.triggerVoting(roomCode);
  }, [roomCode]);

  const castVote = useCallback(
    (voterPlayerId: string, targetPlayerId: string) => {
      if (!roomCode) return;
      socketManager.castVote(roomCode, voterPlayerId, targetPlayerId);
    },
    [roomCode]
  );

  const confirmElimination = useCallback(() => {
    if (!roomCode) return;
    socketManager.confirmElimination(roomCode);
  }, [roomCode]);

  const mrWhiteGuess = useCallback(
    (wordGuess: string) => {
      if (!roomCode) return;
      socketManager.mrWhiteGuess(roomCode, wordGuess);
    },
    [roomCode]
  );

  const playAgain = useCallback(() => {
    if (!roomCode) return;
    socketManager.playAgain(roomCode);
  }, [roomCode]);

  const clearError = useCallback(() => setConnectionError(null), []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    roomCode,
    room,
    isHost,
    currentPlayer,
    localPlayerId,
    connect,
    disconnect,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    toggleReady,
    updateSettings,
    startGame,
    confirmRole,
    submitClue,
    sendMessage,
    proceedToDiscussion,
    triggerVoting,
    castVote,
    confirmElimination,
    mrWhiteGuess,
    playAgain,
    clearError
  };
};
