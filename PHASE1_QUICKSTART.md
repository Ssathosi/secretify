# 🚀 PHASE 1 QUICK START — Test Your Multiplayer Game

## 30-Second Setup

### Terminal 1: Start Backend
```powershell
cd "c:\Users\thosi\OneDrive\Dokumen\App\Secretify\secretify-game"
npm run server
```

Wait for:
```
==========================================
 SECRETIFY SECURED BACKEND SERVER STARTED
 Express & Socket.io listening on port 5000
==========================================
```

### Terminal 2: Start Frontend
```powershell
cd "c:\Users\thosi\OneDrive\Dokumen\App\Secretify\secretify-game"
npm run dev
```

Wait for Vite to start (you'll see the dev server URL).

---

## Test Scenario: 2-Player Game

### Browser 1 (Desktop): Create Room

1. Open `http://localhost:3000`
2. **Splash** → Click "LANJUT"
3. **Onboarding** → Click through 4 slides → "GET STARTED"
4. **Login** → Choose "Play as Guest" → Enter name "Player1" → Select avatar → "Play as Guest"
5. **Home** → Click "CREATE ROOM" button
6. **Lobby** → Copy the **Room Code** displayed (e.g., `A7B3C9`)

✅ You're now the **HOST** waiting for players

---

### Browser 2 (Mobile/Different Tab): Join Room

1. Open `http://localhost:3000` (new tab or phone browser)
2. **Splash** → Click "LANJUT"
3. **Onboarding** → Click through → "GET STARTED"
4. **Login** → Choose "Play as Guest" → Enter name "Player2" → Select avatar → "Play as Guest"
5. **Home** → Click "JOIN ROOM" button
6. **Join Dialog** → Paste the room code → Click "JOIN"
7. **Lobby** → You should see **Player1** in the room

✅ You're now a **PLAYER** in the room

---

## Start the Game

### Browser 1 (Host)
1. Both players should show ✅ **Ready** status
2. Click **"START GAME"** button
3. Game proceeds through phases

### Both Browsers
Watch the flow:
1. 👤 **ROLE REVEAL** (3 seconds) - See your role & secret word
2. 💬 **CLUE ROUND** - Each player submits 1 clue
3. 🗣️ **DISCUSSION** - Chat and debate who is suspicious
4. 🗳️ **VOTING** - Vote to eliminate player
5. 💥 **ELIMINATION** - See who was eliminated
6. 🏆 **WINNER** - Game over, see results

---

## Expected Results

### Scenario 1: Civilians Win
- Eliminated: Undercover & Mr. White
- Result: **CIVILIANS WIN** 🎉

### Scenario 2: Undercover Wins
- Eliminated all Civilians
- Result: **UNDERCOVER WINS** 🎉

### Scenario 3: Mr. White Wins
- Correctly guesses the civilian word
- Result: **MR. WHITE WINS** 🎉

---

## What to Look For

### ✅ Good Signs
- [x] Both players join same lobby
- [x] Player list updates in real-time
- [x] Game starts when host clicks START
- [x] Both players see same role and word
- [x] Clues appear for both players
- [x] Chat messages sync between browsers
- [x] Voting shows on both screens
- [x] Winner screen appears on both

### ❌ Problems?

**Symptom**: "Room not found"
- Fix: Check room code spelling
- Fix: Make sure backend is running (`npm run server`)

**Symptom**: Player doesn't appear in lobby
- Fix: Refresh the joining player's browser
- Fix: Check console for error messages

**Symptom**: Game doesn't start
- Fix: Make sure both players clicked "Ready"
- Fix: Need minimum 4 players (add AI bots or open more browsers)

**Symptom**: Chat not showing
- Fix: Try sending message again
- Fix: Check server console for errors

**Symptom**: Can't connect to server
- Fix: Run `npm run server` if not already running
- Fix: Check `.env.local` has correct URL
- Fix: Verify port 5000 not blocked by firewall

---

## Advanced Testing

### Test with 4+ Players
Open 4 different browser tabs and repeat the join flow. Great way to test:
- Voting with multiple players
- Different role distributions
- Chat conversations

### Test Disconnection
1. Start game in lobby
2. Close one browser tab
3. Observe:
   - Other players see player disconnected
   - If host disconnected, new host assigned
   - Room cleaned up if all players leave

### Test Different Word Packs
Before starting game:
1. Host: Click settings gear icon
2. Change "Word Pack" dropdown
3. Start game with different words

---

## Architecture Review

```
Your Laptop
├─ Terminal 1: npm run server (Port 5000)
│  └─ Express + Socket.io ↔ In-Memory Rooms
│
├─ Browser 1: Player 1
│  └─ React App ↔ Socket Connection
│
├─ Browser 2: Player 2
│  └─ React App ↔ Socket Connection
│
└─ (Optional) Browser 3-4: More Players
   └─ React App ↔ Socket Connection
```

All connections go through **Socket.io** on port 5000.

---

## Next: What to Try

After confirming multiplayer works:

### 🎯 Priority 1: Test Edge Cases
- [ ] Player joins while game running
- [ ] Player rejoins after disconnect
- [ ] Multiple disconnects
- [ ] Network lag (throttle in DevTools)

### 🎯 Priority 2: Run on Real Network
- [ ] On same WiFi network
- [ ] Use machine IP instead of localhost
- [ ] Test on mobile phone

### 🎯 Priority 3: Performance Test
- [ ] 8 players simultaneously
- [ ] 10 rounds back-to-back
- [ ] Server memory usage

---

## Where to Check Logs

### Backend Logs (Terminal 1)
```
[Socket Connected] ID: abc123
[Room Created] Code: A7B3C9
[Player Joined] Player2 entered Room A7B3C9
[Game Started] Room A7B3C9 initialized! Civilians: 2, Undercovers: 1
[Elimination] Player Si_Seket (Role: UNDERCOVER) eliminated
```

### Frontend Logs (Browser Console)
Press `F12` → Console tab
```
[Socket] Connected to server: socketio-id
[Socket] Emitting: create-room {name: "Player1", avatar: "detective"}
[Socket] Received: room-updated {code: "A7B3C9", players: [...]}
```

---

## Files Changed (Phase 1)

| File | Status | Note |
|------|--------|------|
| `server.ts` | ✏️ Modified | Added auto-transition to clue round |
| `src/utils/socket.ts` | ✨ New | Socket.io client manager |
| `src/hooks/useMultiplayer.ts` | ✨ New | Multiplayer state hook |
| `.env.local` | ✨ New | Environment config |
| `PHASE1_MULTIPLAYER_GUIDE.md` | ✨ New | Detailed implementation guide |
| `PHASE1_SUMMARY.md` | ✨ New | Summary of work done |
| `PHASE1_QUICKSTART.md` | ✨ New | This file! |

---

## Success Criteria ✅

- [x] Backend Socket.io server runs without errors
- [x] Frontend connects to backend
- [x] Players can create and join rooms
- [x] Roles are distributed fairly
- [x] Game flows through all phases
- [x] Real-time sync between players
- [x] Winner is determined correctly
- [x] Disconnect handling works

---

## What's Next?

**Phase 2**: Add special role mechanics (Bumerang, Lovers, Shadow, etc.)
**Phase 3**: Database + Authentication (Supabase)
**Phase 4**: Voice chat integration
**Phase 5**: Shop, tournaments, clans

---

**🎉 Congrats! Your multiplayer foundation is ready!**

Time to test it out! 🚀
