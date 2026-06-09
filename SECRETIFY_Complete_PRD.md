# SECRETIFY — Product Requirements Document (PRD)

**Game Party Social Deduction | Web Application (PWA)**  
**Version:** 1.1  
**Platform:** Mobile & Desktop (Responsive Viewport)  
**Theme:** Neubrutalism UI (Bilingual ID/EN Support)

---

## 1. VISION & HIGHLIGHTS

**Secretify** is a web-based social deduction party game that bridges classic mechanics (Civilian vs. Undercover vs. Mr. White) with advanced special roles, a retro-modern **Neubrutalism UI** design system, and multi-mode support. Built for instant browser accessibility without installation, players can create, share, and jump into sessions seamlessly.

> *"Every word is a clue. Every clue is a trap. Trust no one. Reveal the Secret."*

### Key Highlights
- **Zero Install, Play Instantly:** Runs entirely on modern web browsers (PWA supported).
- **Flexible Playstyles:** Offers three distinct gameplay modes to fit any gathering (Mock Simulator, Online Multiplayer, and single-device Reality Pass-and-Play).
- **Premium Neubrutalism UI:** Eye-catching design featuring thick borders, hard retro drop-shadows, pastel blocks, bilingual mappers, and custom SVG pixel avatars.
- **Rich Role Dynamics:** Integrates standard roles alongside 15+ specialized Tier 1 & Tier 2 roles to introduce tactical depth and turn-based surprises.

---

## 2. TARGET AUDIENCE & PERFORMANCE TARGETS

| Metric | Target Specification |
|:---|:---|
| **Player Count** | 3 - 12 players per session |
| **Session Length** | 5 - 15 minutes per match |
| **Age Group** | 12+ (Social deduction enthusiast, party-goers, content creators) |
| **Supported Devices** | All modern web browsers (Mobile primary viewport, Desktop responsive side-by-side viewports) |
| **Language Support** | Instant bilingual toggle between Indonesian (ID) and English (EN) |

---

## 3. CORE GAMEPLAY MODES

Secretify implements three core methods of playing:

### A. Mock Simulator Mode (Offline Solo/Sandbox)
- **Purpose:** Sandbox play to preview UI components, test screen transitions, and run mock battles.
- **Implementation:** Simulated bots generate random clues, answer chat accusations, vote, and get eliminated automatically. Features a floating debug panel on desktop for instant screen switching.

### B. Online Multiplayer Mode (Real-Time Synchronized)
- **Purpose:** Connect friends remotely across different screens.
- **Implementation:** Powered by Socket.io and Supabase. Rooms are identified via code links (e.g., `#A7B3C9`). Real-time state synchronizers match the server's lobby settings, clue collections, voting arrays, and elimination outcomes to all player UI contexts simultaneously.

### C. Reality Mode (Local Pass-and-Play)
- **Purpose:** Physical gatherings, parties, and single-device ice breakers.
- **Implementation:** No internet required for gameplay once loaded. Features a physical turn-based step:
  1. **Define Roster:** Enter player names and assign characters.
  2. **Role Reveal:** Pass the phone to each player. They tap the screen to view their secure word and special roles under a blurred privacy shield, then tap to hide before passing.
  3. **Debate:** A physical debate round backed by a built-in retro clue countdown timer.
  4. **Voting & Resolution:** Players confirm votes directly on the device. Special role triggers (Clown, Boomerang, Lovers, Revenger) are automatically calculated and processed.

---

## 4. ROLE SYSTEM & WIN CONDITIONS

### Basic Roles

| Role | Codeword Status | Objective | Winning Criteria |
|:---|:---|:---|:---|
| **Civilian (Sivil)** | Receives Word A (Correct) | Deduce who the Undercovers & Mr. Whites are. | All Undercovers and Mr. Whites are eliminated. |
| **Undercover (Penyamar)** | Receives Word B (Slightly altered) | Merge with Civilians, avoid detection. | Number of active Undercovers $\ge$ active Civilians. |
| **Mr. White** | Receives `???` (No Word) | Mimic civilian descriptions and guess the Civilian word. | Guesses the Civilian word correctly on elimination OR outnumbers Civilians. |

### Special Roles (Configurable Toggles)

Special roles add an extra layer of strategy. A random pool or selected list can be activated:

#### Tier 1 — Classic deduction variants
- **Clown (Badut Bahagia) 🤡:** Wins immediately if voted out and eliminated in Round 1.
- **Boomerang (Bumerang) 🪃:** When targeted with the highest votes, the votes bounce back, transferring the elimination target to their voters.
- **Lovers (Kekasih) 💕:** Two players are linked. If one is eliminated, the other dies instantly of heartbreak.
- **Revenger (Pembalas) 🦸:** When eliminated, they automatically drag the player they voted for down to elimination with them.
- **Ghost (Hantu) 👻:** Can still vote or contribute messages after elimination.
- **Shadow (Bayangan) 🌑:** Casts double weight votes while keeping their voting lines hidden.

#### Tier 2 — Adaptive Abilities ( Falafel Merchant Pool)
- **Falafel Merchant (Penjual Falafel) 🧆:** Receives a random perk each game:
  - *Shield:* Immune to voting for 1 round.
  - *Reveal:* View the word of a target player.
  - *Swap Vote:* Swap the votes of 2 players.
  - *Extra Life:* Survives their first voting elimination.
  - *Silence:* Silences 1 player during the clue round.

---

## 5. VISUAL ARCHITECTURE & DESIGN SYSTEM (NEUBRUTALISM)

Secretify breaks away from generic modern designs by utilizing an aggressive, high-contrast **Neubrutalism UI** design system.

### Color Tokens
- **Lime Green (`#DFFF00`):** Success states, primary buttons, Civilian accents.
- **Teal Blue (`#2EC4B6`):** Secondary UI components, info badges, neutral settings.
- **Coral Orange (`#FF6B35`):** Primary warning buttons, active timers, Undercover accents.
- **Sunflower Yellow (`#FFD23F`):** Star ratings, key cards, Mr. White accents.
- **Grape Purple (`#9B5DE5`):** Special role highlights, premium badges.
- **Base Canvas (`#F0EDE6` or `#F7F4EE`):** Paper-like warm retro backgrounds.
- **Shadows:** Hard `#000000` borders and drop-shadows (`brutal-shadow`, `brutal-press`).

### Visual Elements
- **Borders:** Bold `3px border-black` boundaries around all cards, buttons, and inputs.
- **Scallop Lines (`ScallopLine`):** SVG path-rendered retro paper scallops giving an authentic ticket-rip texture between header panels.
- **Typography:** Display titles rendered in bold geometric sans-serif fonts, paired with monospace fonts (`Roboto Mono` / custom fonts) for number statistics and timers.
- **Pixel Art Avatars:** High-fidelity custom SVG illustrations including `Detective Budi`, `The Spy`, `The Villain`, `The Hacker`, `Cute Monster`, `Cat`, `Ninja`, and anime presets (`Felix`, `Anya`).

---

## 6. SYSTEM SCREEN FLOW & ARCHITECTURE

The application is structured into modular UI components that display on the main board:

### A. Pre-Game Phase
1. **Splash Screen (`SplashView`):** Welcoming animated entry displaying the retro logo, a dynamic progress bar, and user interaction triggers to start background music loops (`sfx.startBgmLoop`).
2. **Onboarding Screen (`OnboardingView`):** A step-by-step introduction of the game rules, role variations, and visual animations.
3. **Authentication Screen (`AuthView` & `ClerkAuthSection`):** Support for both quick guest sign-ins and secured identity logins via Clerk credentials or database-backed authentication.
4. **Home Screen (`HomeView`):** The primary hub. Displays user profile level stats, match history records, the shop catalog, and the primary quick-play game launch buttons.
5. **Lobby (`LobbyView`):** Match setup panel. Synced hosts can set maximum players, round limits, toggle special roles, and pick word packs. In simulator mode, players can add mock bot instances.

### B. Active Match Phase (Mock & Online Multiplayer)
6. **Role Assignment Screen (`RoleAssignView`):** Cards shuffle and flip on Y-axis to reveal the assigned role, codeword, and gameplay hint.
7. **Word Reveal Overlay (`WordReveal`):** Heavy screen blur overlay to prevent shoulder-sniping of passwords, requiring a tap-and-hold to view.
8. **Clue Round Screen (`ClueRoundView`):** Dynamic message board where active speakers take turns typing descriptions, showing voice waves, or using action buttons.
9. **Discussion Screen (`DiscussionView`):** Chat dashboard featuring pinned clue cards, timeline timelines, and instant emoji reaction pads.
10. **Voting Round Screen (`VotingRoundView`):** Circular nodes arrangement representing active players. Voting generates colorful Bezier curves representing lines of accusation directed from voters to targets.
11. **Elimination Screen:** Dramatic screen shake, red flashes, and roles/codeword reveal animations.

### C. Reality Mode Screens (`RealityModeScreens`)
12. **Reality Setup:** Configure offline lobbies by adding local players with custom names and selectable preset avatars.
13. **Reality Role Reveal:** Secured pass-and-play step. Player cards hide roles behind individual "Reveal My Role" popups.
14. **Reality Debate:** Countdown stopwatch, starter speaker selector, and offline reference guide.
15. **Reality Voting:** Local ballot counting screen where players select targets sequentially.
16. **Reality Elimination:** Highlights the voted player, reveals their role, and triggers Lovers, Clown, or Revenger checks.
17. **Reality Winner:** Celebrates the winning team with retro medals and XP metrics.

---

## 7. MONETIZATION & IN-GAME ECONOMY

### Economy Cycle
- **Coins (🪙):** Earned through gameplay, daily login streaks, and optional ad check-ins. Spent on common cosmetics and base word packs.
- **Gems (💎):** Acquired via in-app purchases (IAP) or premium season passes. Spent on legendary character skins and instant premium unlocks.

### IAP Options
- **Season Pass:** 8-week reward track containing premium avatar accessories, extra XP multipliers, and early role access.
- **Word Packs:** Specialized themed codeword bundles (e.g., Global Cuisine, Sci-Fi Cosmos, Pop Culture).
- **Ad-Free License:** One-time purchase to remove interstitial ads from match intervals.

---

## 8. STACK & IMPLEMENTATION DETAILS

### Frontend
- **Framework:** React 18 + Vite (Tailwind CSS for neubrutalism styling variables).
- **State Engine:** Zustand (providing persistent offline storage for profiles, game settings, and auth keys).
- **Effects & Motion:** Framer Motion (`AnimatePresence` and spring-based Y-axis card flip animations).
- **Icons:** Lucide-React.
- **Audio Engine:** Handcrafted synth audio wrappers for play clicks, victory chords, warnings, and background tracks (`sfx`).

### Backend
- **Session Broker:** Express.js + Socket.io running on Node.js to manage lobby structures and room synchronization.
- **Database / Auth:** Clerk authentication combined with Supabase for user records, statistics, and leaderboard tracking.
- **Deployment:** Vercel (Frontend Client) & Render/Heroku (Websocket Server).

---

*"Trust No One. Reveal the Secret."*
