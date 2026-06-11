/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io, Socket } from 'socket.io-client';
import { Player, RoleType, Clue, ChatMessage } from '../types';

export interface ServerRoom {
  code: string;
  players: Player[];
  maxPlayers: number;
  rounds: number;
  specialRolesEnabled: boolean;
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
  clueCompleteEndsAt?: number | null;
  winnerRoleGroup?: 'CIVILIANS' | 'UNDERCOVERS' | 'MR_WHITE';
}

class SocketManager {
  private socket: Socket | null = null;
  private serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  /**
   * Initialize socket connection.
   * Reuses the existing socket if one already exists to avoid
   * destroying listeners that were attached by useMultiplayer.
   */
  connect(): Socket {
    // If a socket already exists, reuse it.
    // Socket.io handles reconnection automatically.
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error(
        '[Socket] Cannot reach server at',
        this.serverUrl,
        '— run `npm run server` in a second terminal.',
        error.message
      );
    });

    return this.socket;
  }

  /**
   * Disconnect socket and clear the reference so a fresh
   * socket is created on the next connect() call.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Create room as host
   */
  createRoom(hostData: { name: string; avatar: string; dbUserId?: string }): Promise<ServerRoom> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('create-room', hostData);
      this.socket.once('room-created', (room: ServerRoom) => {
        resolve(room);
      });

      setTimeout(() => reject(new Error('Create room timeout')), 10000);
    });
  }

  /**
   * Join existing room
   */
  joinRoom(data: {
    roomCode: string;
    name: string;
    avatar: string;
    dbUserId?: string;
  }): Promise<ServerRoom> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join-room', data);

      // Listen for room update after join
      const handleRoomUpdate = (room: ServerRoom) => {
        this.socket?.off('room-updated', handleRoomUpdate);
        resolve(room);
      };

      this.socket.on('room-updated', handleRoomUpdate);

      // Listen for errors
      const handleError = (error: any) => {
        this.socket?.off('error-msg', handleError);
        reject(new Error(error.messageEN || 'Failed to join room'));
      };

      this.socket.once('error-msg', handleError);

      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Join room timeout')), 10000);
    });
  }

  /**
   * Toggle player ready status
   */
  toggleReady(roomCode: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit('toggle-ready', { roomCode, playerId });
  }

  /**
   * Update lobby settings
   */
  updateSettings(data: {
    roomCode: string;
    maxPlayers: number;
    rounds: number;
    specialRoles: boolean;
    enabledSpecialRoles?: string[];
    voiceChat: boolean;
    gameMode: string;
    wordPack: string;
    debateDurationSec: number;
  }): void {
    if (!this.socket) return;
    this.socket.emit('update-settings', data);
  }

  /**
   * Host starts the game
   */
  startGame(
    roomCode: string,
    settings: {
      rounds: number;
      wordPack: string;
      debateDurationSec: number;
      specialRoles: boolean;
      enabledSpecialRoles?: string[];
      voiceChat: boolean;
      gameMode: string;
    }
  ): void {
    if (!this.socket) return;
    this.socket.emit('start-game', { roomCode, ...settings });
  }

  confirmRole(roomCode: string, playerId: string): void {
    if (!this.socket) return;
    this.socket.emit('confirm-role', { roomCode, playerId });
  }

  /**
   * Submit clue during clue round
   */
  submitClue(roomCode: string, playerId: string, clueText: string): void {
    if (!this.socket) return;
    this.socket.emit('submit-clue', { roomCode, playerId, clueText });
  }

  /**
   * Send discussion message
   */
  sendMessage(roomCode: string, senderId: string, message: string): void {
    if (!this.socket) return;
    this.socket.emit('send-message', { roomCode, senderId, message });
  }

  /**
   * Proceed from discussion to voting
   */
  proceedToDiscussion(roomCode: string): void {
    if (!this.socket) return;
    this.socket.emit('proceed-to-discussion', { roomCode });
  }

  triggerVoting(roomCode: string): void {
    if (!this.socket) return;
    this.socket.emit('trigger-voting', { roomCode });
  }

  /**
   * Cast vote on target player
   */
  castVote(roomCode: string, voterPlayerId: string, targetPlayerId: string): void {
    if (!this.socket) return;
    this.socket.emit('cast-vote', { roomCode, voterPlayerId, targetPlayerId });
  }

  /**
   * Confirm elimination and proceed
   */
  confirmElimination(roomCode: string): void {
    if (!this.socket) return;
    this.socket.emit('confirm-elimination', { roomCode });
  }

  /**
   * Mr. White guess word
   */
  mrWhiteGuess(roomCode: string, wordGuess: string): void {
    if (!this.socket) return;
    this.socket.emit('mr-white-guess', { roomCode, wordGuess });
  }

  /**
   * Play again - return to lobby
   */
  playAgain(roomCode: string): void {
    if (!this.socket) return;
    this.socket.emit('play-again', { roomCode });
  }

  /**
   * Listen to room updates
   */
  onRoomUpdated(callback: (room: ServerRoom) => void): void {
    if (!this.socket) return;
    this.socket.on('room-updated', callback);
  }

  /**
   * Listen to game start
   */
  onGameStarted(callback: (room: ServerRoom) => void): void {
    if (!this.socket) return;
    this.socket.on('game-started', callback);
  }

  /**
   * Remove listener
   */
  off(event: string, callback?: any): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }
}

export const socketManager = new SocketManager();
