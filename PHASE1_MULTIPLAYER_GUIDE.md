# Secretify Multiplayer Integration Guide — Phase 1 Implementation

## Overview
This document explains the Socket.io multiplayer integration added for Secretify in Phase 1. The system supports both **offline local gameplay** (Reality Mode) and **online multiplayer** through Socket.io.

## Architecture

### Backend (server.ts)
- **Express + Socket.io** server handling real-time communication
- **In-memory room management** with active lobbies and game state
- **Role distribution** with balanced civilian/undercover/Mr.White assignment
- **Game flow state machine**: `waiting → role_assignment → clue_round → discussion → voting → elimination → winner`

### Frontend
- **useMultiplayer Hook** (`src/hooks/useMultiplayer.ts`) - State management for multiplayer rooms
- **Socket Manager** (`src/utils/socket.ts`) - Event handlers and socket connections
- **Environment Config** (`.env.local`) - Server URL configuration

## Quick Start

### 1. Start the Backend Server
```bash
cd c:\Users\thosi\OneDrive\Dokumen\App\Secretify\secretify-game
npm run server
```

Expected output:
```
==========================================
 SECRETIFY SECURED BACKEND SERVER STARTED
 Express & Socket.io listening on port 5000
==========================================
```

### 2. Start the Frontend Dev Server (in another terminal)
```bash
cd c:\Users\thosi\OneDrive\Dokumen\App\Secretify\secretify-game
npm run dev
```

### 3. Test Multiplayer Flow

#### Create Room (Host)
1. Navigate to Home screen
2. Tap "CREATE ROOM" button
3. Host creates room and gets room code (e.g., `A7B3C9`)
4. Room automatically connects to backend

#### Join Room (Player)
1. Open another browser tab/window (different player)
2. Tap "JOIN ROOM" button  
3. Enter room code from host
4. Player joins room

#### Start Game
1. Host toggles settings (max players, rounds, word pack, etc.)
2. All players tap "Ready" button
3. Host taps "START GAME"
4. Game flows: Role Reveal → Clue Round → Discussion → Voting → Elimination

## File Structure

```
src/
├── utils/
│   ├── socket.ts              # Socket.io client manager
│   ├── audio.ts               # (existing) sound effects
│   └── wordPacks.ts           # (existing) word pair pools
├── hooks/
│   └── useMultiplayer.ts       # Custom hook for multiplayer state
├── components/
│   ├── PreGameScreens.tsx      # (to be updated) lobby with multiplayer
│   └── GameFlowScreens.tsx     # (to be updated) game screens
├── types.ts                    # Type definitions
└── App.tsx                     # (to be updated) main app router
.env.local                      # Environment variables
server.ts                       # Backend Socket.io server
```

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{name, avatar}` | Host creates new room |
| `join-room` | `{roomCode, name, avatar}` | Player joins existing room |
| `toggle-ready` | `{roomCode, playerId}` | Player toggles ready status |
| `update-settings` | `{roomCode, maxPlayers, rounds, specialRoles, voiceChat, gameMode, wordPack}` | Host updates lobby settings |
| `start-game` | `{roomCode}` | Host starts game (role assignment begins) |
| `submit-clue` | `{roomCode, playerId, clueText}` | Player submits clue during clue round |
| `send-message` | `{roomCode, senderId, message}` | Player sends discussion message |
| `trigger-voting` | `{roomCode}` | Host moves from discussion to voting |
| `cast-vote` | `{roomCode, targetPlayerId}` | Player votes on target player |
| `confirm-elimination` | `{roomCode}` | Confirm elimination and determine winner or proceed |
| `mr-white-guess` | `{roomCode, wordGuess}` | Mr.White attempts word guess |
| `play-again` | `{roomCode}` | Return to lobby for next round |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `ServerRoom` | Room successfully created (sent to creator) |
| `room-updated` | `ServerRoom` | Any room state change (sent to all in room) |
| `game-started` | `ServerRoom` | Game started with roles assigned (sent to all) |
| `error-msg` | `{messageID, messageEN}` | Error occurred (e.g., room not found, room full) |

## Game Flow

```
┌─────────────────────────────────────────────────────────┐
│                    WAITING LOBBY                         │
│  Players join, host sets settings, everyone readies up   │
└──────────────────────┬──────────────────────────────────┘
                       │ Host clicks START
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  ROLE ASSIGNMENT                         │
│  Roles distributed: Civilians, Undercover, Mr.White      │
│  Each player sees their word (except Mr.White)           │
└──────────────────────┬──────────────────────────────────┘
                       │ 3 second delay (animation)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                   CLUE ROUND                             │
│  Each player gives one clue describing their word        │
│  Undercover & Mr.White try to blend in                   │
└──────────────────────┬──────────────────────────────────┘
                       │ All living players submit clues
                       ↓
┌─────────────────────────────────────────────────────────┐
│                   DISCUSSION                             │
│  Players discuss clues and debate who is suspicious      │
│  Text chat enabled for suspicions & accusations          │
└──────────────────────┬──────────────────────────────────┘
                       │ Host triggers voting
                       ↓
┌─────────────────────────────────────────────────────────┐
│                    VOTING                                │
│  Each player votes to eliminate one other player         │
│  Cannot vote for themselves                              │
└──────────────────────┬──────────────────────────────────┘
                       │ All votes cast
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  ELIMINATION                             │
│  Player with most votes is eliminated                    │
│  If Mr.White: gets one chance to guess civilian word     │
│  If correct: Mr.White wins; If wrong: continues game     │
└──────────────────────┬──────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │             │
        Winner? │             │ Continue?
              YES             NO
                │             │
                ↓             ↓
         WINNER SCREEN   CLUE ROUND (next)
              │             │
              └──────┬──────┘
                     │
            PLAY AGAIN → WAITING

Win Conditions:
- CIVILIANS WIN: All Undercover & Mr.White eliminated
- UNDERCOVER WIN: Undercover count = Civilian count (alive)
- MR_WHITE WIN: Correctly guesses civilian word when eliminated
```

## Testing Checklist

### ✅ Connection & Rooms
- [ ] Server starts without errors on port 5000
- [ ] Frontend connects to server
- [ ] Host can create room and receive room code
- [ ] Player can join room with valid code
- [ ] Error message shows for invalid room code
- [ ] Error message shows for full room

### ✅ Lobby
- [ ] Players list updates in real-time
- [ ] Ready status toggles for each player
- [ ] Host can update settings (maxPlayers, rounds, wordPack)
- [ ] All players see setting updates
- [ ] Start button disabled until min 4 players and all ready

### ✅ Game Flow
- [ ] Game starts when host clicks START
- [ ] Roles distributed correctly
- [ ] Each player sees their role & word
- [ ] Transitions to clue round after role reveal
- [ ] Clues appear as players submit them
- [ ] Discussion chat works in real-time
- [ ] Voting interface shows all living players
- [ ] Vote count tallies correctly
- [ ] Elimination determines winner or continues round

### ✅ Special Cases
- [ ] Mr.White gets word "???" instead of real word
- [ ] Mr.White can guess word when eliminated
- [ ] Correct guess: Mr.White wins
- [ ] Incorrect guess: Game continues
- [ ] Player disconnect: Reassigns host if needed
- [ ] Empty room: Server removes room after last player leaves

## Current Limitations (Phase 1)

- ❌ Special roles not yet implemented (Bumerang, Lovers, Shadow, etc.)
- ❌ Voice chat not integrated
- ❌ No database/persistence (in-memory only)
- ❌ No authentication system
- ❌ No payment/shop system
- ❌ No replay/recording system
- ⚠️ Voting is simple majority (no special voting mechanics yet)

## Next Steps (Phase 2+)

1. **Integrate Special Roles** - Add 15+ unique role abilities
2. **Database Integration** - Persist user data, match history to Supabase
3. **Authentication** - Google/Apple/Discord login via Supabase Auth
4. **Voice Chat** - Daily.co SDK integration
5. **PWA Features** - Offline support, install prompt
6. **Tournaments & Events** - Event system with rewards
7. **Clans** - Clan creation and clan wars

## Debugging

### Server Logs
Watch the terminal running `npm run server` for:
- `[Socket Connected]` - player joins
- `[Room Created]` - room created
- `[Player Joined]` - player joins room
- `[Game Started]` - game begins
- `[Elimination]` - player eliminated
- `[Room Destroyed]` - room cleaned up

### Network Issues
If players can't connect:
1. Check `.env.local` has `VITE_SERVER_URL=http://localhost:5000`
2. Ensure server and frontend are on same network
3. Check firewall allows port 5000
4. Try with `http://0.0.0.0:5000` for different networks

### Game State Issues
If game stuck:
1. Check browser console for errors
2. Verify server logs for messages
3. Try refreshing page to reconnect
4. Check if room has minimum 4 players for game to start

---

**Phase 1 Status**: ✅ Core multiplayer foundation complete - Ready for testing!
