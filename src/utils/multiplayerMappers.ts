/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerRoom } from './socket';
import { Player, ChatMessage, RoleType } from '../types';

export function serverPlayerToPlayer(
  p: ServerRoom['players'][number]
): Player {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    level: p.level ?? 1,
    points: p.points ?? 0,
    isReady: p.isReady,
    isHost: p.isHost,
    role: p.role as RoleType | undefined,
    word: p.word,
    isEliminated: p.isEliminated,
    votesReceived: p.votesReceived,
    votedForId: p.votedForId,
    hasConfirmedRole: p.hasConfirmedRole ?? false
  };
}

export function mapRoomPlayers(room: ServerRoom): Player[] {
  return room.players.map(serverPlayerToPlayer);
}

export function mapChatMessages(
  room: ServerRoom,
  currentPlayerId: string | null
): ChatMessage[] {
  return room.chatMessages.map((msg) => ({
    ...msg,
    isMe: currentPlayerId
      ? (msg.senderId ?? '') === currentPlayerId
      : false
  }));
}

/** Per-player screen during role reveal; global state for other phases */
export function resolveOnlineScreen(
  room: ServerRoom,
  currentPlayerId: string | null
): string {
  if (!currentPlayerId) {
    return gameStateToScreen(room.gameState);
  }

  const me = room.players.find((p) => p.id === currentPlayerId);
  const confirmed = me?.hasConfirmedRole === true;

  // Must open role & confirm before any clue UI
  if (me && !confirmed) {
    if (
      room.gameState === 'role_assignment' ||
      room.gameState === 'clue_round' ||
      room.gameState === 'clue_complete'
    ) {
      return 'role_assign';
    }
  }

  // Confirmed early: preview clue screen while others still on role
  if (room.gameState === 'role_assignment' && confirmed) {
    return 'clue_round';
  }

  if (room.gameState === 'clue_complete') {
    return 'clue_round';
  }

  return gameStateToScreen(room.gameState);
}

export const MIN_ONLINE_PLAYERS = 3;

export function gameStateToScreen(
  gameState: ServerRoom['gameState']
): string {
  switch (gameState) {
    case 'waiting':
      return 'lobby';
    case 'role_assignment':
      return 'role_assign';
    case 'clue_round':
    case 'clue_complete':
      return 'clue_round';
    case 'discussion':
      return 'discussion';
    case 'voting':
    case 'elimination':
      return 'voting';
    case 'winner':
      return 'winner';
    default:
      return 'lobby';
  }
}
