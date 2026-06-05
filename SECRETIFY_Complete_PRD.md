# SECRETIFY — Product Requirements Document

**Game Party Social Deduction | Web App (PWA)**  
**Versi:** 1.0  
**Tanggal:** 29 Mei 2026  
**Platform:** Desktop/Mobile

---

## VISI

Secretify adalah game party social deduction berbasis web yang menggabungkan mekanik klasik (Civilian vs Undercover vs Mr. White) dengan **15+ peran khusus** yang memiliki kekuatan unik. Dirancang untuk menjadi ice breaker terbaik yang bisa dimainkan di browser tanpa install, cukup kirim link ke teman.

> *"Every word is a clue. Every clue is a trap. Trust no one. Reveal the Secret."*

---

## TARGET AUDIENCE

| Kriteria | Detail |
|----------|--------|
| **Usia** | 12+ |
| **Jumlah Pemain** | 4-12 per sesi |
| **Durasi** | 5-15 menit per ronde |
| **Mode** | Online multiplayer & Offline (pass-and-play) |
| **Konteks** | Hangout virtual, kumpul keluarga, ice breaker, live streaming |

---

## MEKANIK DASAR

### Alur Permainan Per Ronde

```
LOBBY → ROLE ASSIGNMENT → WORD REVEAL → CLUE ROUND 
→ DISCUSSION → VOTING → ELIMINATION → CHECK WIN 
→ (Loop ke Clue Round atau End)
```

### Peran Dasar

| Peran | Jumlah | Tujuan | Kata Rahasia |
|-------|--------|--------|--------------|
| **Civilian** | Mayoritas | Temukan Undercover & Mr. White | Kata A (benar) |
| **Undercover** | 1-2 | Bertahan hidup, tebak kata Civilian | Kata B (mirip) |
| **Mr. White** | 0-1 | Tebak kata Civilian saat dieliminasi | Tidak ada kata |

### Kondisi Menang

| Tim | Kondisi |
|-----|---------|
| **Civilian** | Semua Undercover & Mr. White dieliminasi |
| **Undercover** | Jumlah Undercover (hidup) = Jumlah Civilian (hidup) |
| **Mr. White** | Berhasil menebak kata Civilian saat dieliminasi |

### Sistem Poin

| Aksi | Poin |
|------|------|
| Menang sebagai Civilian | +10 pts |
| Menang sebagai Undercover | +15 pts |
| Menang sebagai Mr. White | +20 pts |
| Voting benar | +3 pts |
| Bertahan sampai akhir (Undercover) | +5 pts |
| Bonus peran khusus | Variabel |

---

## 🃏 PERAN KHUSUS (Special Roles)

### Tier 1 — Dari Game Undercover Original

| Peran | Ikon | Kekuatan | Syarat Pemain | Strategi |
|-------|------|----------|---------------|----------|
| **Badut Bahagia** | 🤡 | Jika **dieliminasi pertama**, menang 4 poin bonus | 4+ | Sengaja terlihat mencurigakan untuk diusir pertama |
| **Bumerang** | 🪃 | Saat menerima suara terbanyak, suara yang menentangnya **kembali ke pemilih** | 4+ | Provokasi pemain untuk voting dirimu |
| **Dewi Keadilan** | ⚖️ | Jika suara **seimbang**, dia memutuskan siapa tereliminasi (bahkan jika sudah mati) | 4+ | Jaga reputasi baik agar pemain percaya keputusanmu |
| **Hantu** | 👻 | Masih bisa **memberikan suara** meski sudah dieliminasi | 4+ | Amati dari "kubur", voting dengan informasi mati |
| **Lovers** | 💕 | 2 pemain terhubung. Jika satu dieliminasi, yang lain **ikut tereliminasi** | 5+ | Lindungi pasanganmu, jangan terlalu dekat secara publik |
| **Mr. Meme** | 🎭 | Setiap ronde, 1 pemain random harus menggambarkan kata dengan **gerakan tanpa suara** | 4+ | Gunakan gerakan ekspresif, hindari kata-kata |
| **Penjual Falafel** | 🧆 | Dapat **kemampuan acak** setiap permainan baru (dipilih dari pool kekuatan) | 4+ | Adaptasi cepat dengan kekuatan yang didapat |
| **Revenger** | 🦸 | Saat dieliminasi, bisa **membawa 1 orang lain ikut tereliminasi** | 5+ | Identifikasi musuh besar sebelum mati |
| **Duelists** | 🤠 | 2 pemain dalam duel rahasia. Yang pertama dieliminasi **-2 poin**, yang lain **+2 poin** | 5+ | Hindari diusir sebelum lawan duelmu |

### Tier 2 — Secretify Original (Baru)

| Peran | Ikon | Kekuatan | Syarat | Strategi |
|-------|------|----------|--------|----------|
| **Timekeeper** | ⏳ | Bisa **memperpanjang atau mempersingkat** waktu clue round 1x per ronde | 4+ | Perpanjang jika butuh waktu, persingkat jika lawan kehabisan waktu |
| **Shadow** | 🌑 | Saat voting, suaranya **dihitung double** tapi identitasnya tetap rahasia | 5+ | Voting strategis untuk menggoyangkan hasil |
| **Gambler** | 🎲 | Sebelum voting, bisa **bertaruh 1-3 poin** pada siapa yang akan dieliminasi. Benar = poin x2, salah = hilang | 4+ | Taruh pada target yang paling mungkin diusir |
| **Mirage** | 🪞 | 1x per game, bisa **menukar kata rahasianya** dengan kata Undercover/Mr. White | 5+ | Tukar saat curiga akan dieliminasi |
| **Whisperer** | 🕊️ | Bisa kirim **pesan rahasia** ke 1 pemain lain per ronde (tanpa diketahui publik) | 4+ | Bangun aliansi rahasia |
| **Joker** | 🃏 | Jika Mr. White berhasil menebak kata, Joker **menang bersama Mr. White** | 5+ | Bantu Mr. White tanpa ketahuan Civilian |
| **Oracle** | 🔮 | 1x per game, bisa **lihat peran 1 pemain** | 5+ | Gunakan untuk konfirmasi curigaan |
| **Vampire** | 🧛 | Jika dieliminasi, bisa **"gigit" 1 pemain** — pemain itu tidak bisa voting di ronde berikutnya | 5+ | Gigit pemain yang paling aktif menduga |

### Pool Kemampuan Acak (Penjual Falafel)

Penjual Falafel mendapat 1 dari kemampuan berikut secara acak setiap game:

1. **Shield** — Immune dari voting 1x
2. **Reveal** — Lihat kata 1 pemain lain
3. **Swap Vote** — Tukar suara 2 pemain
4. **Extra Life** — Jika dieliminasi, hidup kembali 1x
5. **Silence** — Bisu 1 pemain di clue round
6. **Double Points** — Poin x2 untuk ronde ini

---

## 🎨 DESAIN UI/UX — "Neon Mystery"

### Philosophy

- **Dark mode primary** dengan accent neon yang berbeda per tim
- **Glassmorphism & Neumorphism** untuk card dan modal
- **Smooth animations** (60fps target)
- **Particle effects** saat voting, menang, dan eliminasi

### Color Palette

| Elemen | Warna | Hex | Penggunaan |
|--------|-------|-----|------------|
| Background | Deep Navy | #0F0F23 | Screen background |
| Card Surface | Glass Dark | #1A1A2E (80% opacity) | Cards, panels |
| Accent Civilian | Cyan Neon | #00F0FF | Civilian UI elements |
| Accent Undercover | Crimson Neon | #FF0055 | Undercover UI elements |
| Accent Mr. White | Gold Neon | #FFD700 | Mr. White UI elements |
| Accent Special | Purple Neon | #B026FF | Special roles, shop |
| Text Primary | White | #FFFFFF | Headings, important text |
| Text Secondary | Soft Gray | #A0A0B0 | Descriptions, hints |
| Success | Neon Green | #00FF88 | Ready, correct, win |
| Danger | Neon Red | #FF0044 | Elimination, wrong |

### Typography

| Usage | Font | Weight | Size |
|-------|------|--------|------|
| Logo / Title | Montserrat | Bold | 24-32px |
| Headings | Poppins | SemiBold | 18-22px |
| Body | Inter | Regular | 14-16px |
| Captions / Hints | Inter | Light | 10-12px |
| Numbers / Stats | Roboto Mono | Medium | 16-20px |

---

## 📱 SCREEN BREAKDOWN (20 Screens)

### Pre-Game

| # | Screen | Fungsi Utama |
|---|--------|-------------|
| 01 | **Splash** | Loading + first impression, particle glow, logo animation |
| 02 | **Onboarding** | 4 slide tutorial cara main |
| 03 | **Login** | Google/Apple/Guest sign-in |

### Main Hub

| # | Screen | Fungsi Utama |
|---|--------|-------------|
| 04 | **Home** | Profile card, Quick Play, Create Room, Join Room |
| 05 | **Profile** | Stats radar chart, achievement grid, recent games |
| 06 | **Avatar Studio** | 300+ item kustomisasi (Hair, Face, Outfit, Acc, Bg) |
| 07 | **Shop** | Featured carousel, item grid, Season Pass, currency |
| 08 | **Leaderboard** | Global/Regional/Friends/Clan dengan podium Top 3 |
| 09 | **Settings** | Account, Game, Audio, Notifications, Support |

### Game Flow

| # | Screen | Fungsi Utama |
|---|--------|-------------|
| 10 | **Lobby** | Room code, player slots (2x4 grid), settings panel |
| 11 | **Role Assignment** | Card shuffle animation → 3D flip → glow reveal peran |
| 12 | **Word Reveal** | Privacy blur overlay, kata rahasia dengan typewriter effect |
| 13 | **Clue Round** | Chat bubbles, voice wave, timer bar, Mr. Meme acting mode |
| 14 | **Discussion** | Player list horizontal, pinned clue summary |
| 15 | **Voting** | Circular player layout, vote trails (Bezier curves), countdown |
| 16 | **Elimination** | Screen shake + red flash + particle burst + role reveal |
| 17 | **Win Screen** | Confetti rain, crown drop, score board, play again/share |

### Social & Events

| # | Screen | Fungsi Utama |
|---|--------|-------------|
| 18 | **Tournament/Event** | Active event banner, bracket view, rewards track |
| 19 | **Replay/Highlights** | Video thumbnails, playback dengan synced overlay |
| 20 | **Guild/Clan** | Clan banner, member list, clan wars, contribute points |

---

## 🛠️ TECH STACK (Web App)

### Frontend

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | React 18 + Vite | Ecosystem besar, performa bagus, HMR cepat |
| **Animation UI** | Framer Motion | Animasi declarative, gesture support, layout animations |
| **Game Canvas** | PixiJS | Optimized untuk game 2D di browser, particle system |
| **State Management** | Zustand | Lightweight, no boilerplate, persist support |
| **Styling** | Tailwind CSS + CSS Modules | Utility-first, dark mode support, custom design tokens |
| **PWA** | Workbox | Service worker, offline cache, install prompt |

### Backend

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Runtime** | Node.js + Express | Same language full-stack, ecosystem mature |
| **Real-time** | Socket.io | Fallback dari WebSocket ke polling, room management |
| **Session/Presence** | Redis | Fast in-memory store untuk room state, player presence |
| **Database** | Supabase (PostgreSQL + Realtime) | Auth built-in, row-level security, realtime subscriptions |
| **Auth** | Supabase Auth | Social login (Google, Apple, Discord), JWT |
| **Voice Chat** | Daily.co SDK atau 100ms SDK | WebRTC wrapper, noise suppression, low latency |
| **Payment** | Xendit (ID) / Stripe (Global) | Web payment gateway, support local methods |
| **File Storage** | Supabase Storage | Avatar images, replay videos |

# 📱 SECRETIFY — UI/UX SCREEN CONTEXT DOCUMENT

**Versi:** 1.0 | **Tanggal:** 29 Mei 2026 | **Platform:** Android (Primary), iOS

---

## SCREEN 01 — SPLASH SCREEN

### Tujuan
Memberikan first impression yang kuat dan memuat asset game sebelum masuk ke home.

### Elemen UI
| Elemen | Detail |
|--------|--------|
| **Background** | Deep Navy (#0F0F23) dengan subtle animated gradient |
| **Logo** | "SECRETIFY" text logo dengan neon glow effect (Cyan #00F0FF) |
| **Particles** | Small glowing dots floating upward, random sizes |
| **Loading Bar** | Horizontal neon bar di bawah logo, warna Cyan |
| **Version Text** | "v1.0.0" di pojok kanan bawah, warna #555 |

### Animasi
- **0.0s-0.5s:** Screen fade in dari black
- **0.5s-1.5s:** Logo scale dari 0.8 → 1.0 dengan bounce easing
- **1.5s-2.5s:** Glow pulse pada logo (opacity 0.5 → 1.0 → 0.5)
- **2.5s-3.5s:** Loading bar fill dari 0% → 100%
- **3.5s-4.0s:** Fade out ke Login/Home

### Interaksi
- Tap anywhere: skip animation (langsung ke Home jika sudah login)
- Auto-transition ke Home setelah load selesai

### State
| State | Kondisi |
|-------|---------|
| **First Launch** → Onboarding Screen |
| **Logged In** → Home Screen |
| **Not Logged In** → Login Screen |

---

## SCREEN 02 — ONBOARDING SCREEN

### Tujuan
Mengenalkan cara main game dalam 3-4 slide singkat.

### Elemen UI
| Elemen | Detail |
|--------|--------|
| **Background** | Deep Navy dengan gradient accent berbeda per slide |
| **Illustration** | Full-screen cartoon illustration per slide |
| **Title** | Bold white text, 24px |
| **Description** | Secondary gray text, 14px, max 2 baris |
| **Pagination Dots** | 4 dots di bawah, active dot = Cyan neon |
| **Next Button** | "NEXT →" / "GET STARTED" (slide terakhir) |
| **Skip Link** | "Skip" di pojok kanan atas |

### Konten Slide
| Slide | Title | Description | Accent Color |
|-------|-------|-------------|--------------|
| 1 | "Welcome to Secretify" | "The ultimate party game of deception and deduction" | Cyan |
| 2 | "Get Your Word" | "Civilians get the real word. Undercover gets a similar one. Mr. White gets nothing." | Crimson |
| 3 | "Give Clues" | "Describe your word without saying it directly. Watch out for the Undercover!" | Purple |
| 4 | "Vote & Eliminate" | "Discuss, vote, and eliminate the suspicious players. Trust no one!" | Gold |

### Animasi
- Slide transition: horizontal scroll dengan parallax effect
- Illustration: subtle float animation (up-down 10px, 3s loop)
- Text: fade in + slide up (200ms stagger)

### Interaksi
- Swipe left/right untuk navigasi slide
- Tap "NEXT" untuk next slide
- Tap "Skip" atau "GET STARTED" → Login Screen

---

## SCREEN 03 — LOGIN SCREEN

### Tujuan
Autentikasi pemain dengan opsi yang cepat dan mudah.

### Elemen UI
| Elemen | Detail |
|--------|--------|
| **Background** | Deep Navy dengan subtle particle effect |
| **Logo** | Secretify logo di atas, ukuran medium |
| **Tagline** | "Trust No One. Reveal the Secret." — italic, gray |
| **Google Sign-In** | Tombol besar dengan icon Google, background white, text dark |
| **Apple Sign-In** | Tombol besar dengan icon Apple, background black, text white |
| **Guest Play** | Tombol outline Cyan, "Play as Guest" |
| **Terms Text** | "By signing in, you agree to our Terms & Privacy Policy" — 10px, gray, clickable |

### Animasi
- Logo: fade in + scale (0.9 → 1.0)
- Tombol: staggered slide up (100ms delay antar tombol)
- Particle: continuous floating

### Interaksi
- Tap Google/Apple → OAuth flow → Loading → Home
- Tap Guest → Generate random username → Home (with "Link Account" banner)
- Tap Terms → WebView Terms & Privacy

### Error State
- Network error: Snackbar merah di bawah, "No connection. Please try again."
- Auth failed: Snackbar merah, "Login failed. Please try again."

---

## SCREEN 04 — HOME SCREEN

### Tujuan
Central hub untuk semua aktivitas pemain — main, kustomisasi, shop, settings.

### Elemen UI

#### Header Section (Top 25%)
| Elemen | Detail |
|--------|--------|
| **Profile Card** | Glassmorphism card (#1A1A2E, 80% opacity), rounded 16px |
| **Avatar** | Circle 60px, frame sesuai level/rank |
| **Username** | Bold white, 16px |
| **Level & Points** | "Level 12 • 2,450 pts" — gray, 12px |
| **Edit Icon** | Pencil icon di pojok kanan card |
| **Notification Bell** | Icon di pojok kanan atas, badge merah jika ada notif |

#### Main Actions (Middle 50%)
| Elemen | Detail |
|--------|--------|
| **Quick Play Button** | Full width, height 56px, background Cyan (#00F0FF), text dark bold, icon lightning |
| **Create Room Button** | Full width, height 56px, background Purple (#B026FF), text white bold, icon gamepad |
| **Join Room Button** | Full width, height 56px, outline Cyan, text Cyan, icon link |
| **Room Code Input** | Inline dengan Join Room, placeholder "Enter room code..." |

#### Bottom Navigation (Bottom 12%)
| Tab | Icon | Active State |
|-----|------|--------------|
| Home | 🏠 | Cyan color, icon filled |
| Rank | 🏆 | Gray, icon outline |
| Shop | 🎒 | Gray, icon outline |
| Settings | ⚙️ | Gray, icon outline |

#### Floating Elements
| Elemen | Detail |
|--------|--------|
| **Daily Reward Badge** | Floating bubble di pojok kanan, "Claim!" dengan glow |
| **Event Banner** | Horizontal scrollable banner di atas main actions (jika ada event) |

### Animasi
- Profile card: slide down dari atas (300ms)
- Buttons: staggered slide up (150ms delay)
- Daily reward: pulse glow animation (2s loop)
- Event banner: auto-scroll horizontal (5s interval)

### Interaksi
- Tap Profile Card → Profile Screen
- Tap Quick Play → Matchmaking → Lobby
- Tap Create Room → Lobby (as Host)
- Tap Join Room → Join dengan room code → Lobby
- Swipe bottom nav → Navigate ke tab lain
- Pull down → Refresh data

---

## SCREEN 05 — LOBBY SCREEN

### Tujuan
Ruang tunggu sebelum game dimulai. Host mengatur setting, pemain join dan ready.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Room Code** | "ROOM #A7B3C9" — bold white, 18px, copy icon di samping |
| **Player Count** | "Waiting for players... 4/8" — gray, 12px |
| **Share Button** | Icon share di pojok kanan atas |

#### Player Slots (Grid 2x4)
| Elemen | Detail |
|--------|--------|
| **Slot Card** | Rounded 12px, background #1A1A2E, border 2px |
| **Empty Slot** | Border gray (#333), icon "+" di tengah |
| **Filled Slot** | Border sesuai warna pemain, avatar circle 48px, nama, status ready |
| **Host Badge** | Crown icon di pojok kanan avatar pemain host |
| **Ready Badge** | Checkmark hijau di pojok kanan bawah card |

#### Settings Panel (Bottom, expandable)
| Setting | Kontrol |
|---------|---------|
| Max Players | Stepper: 4-12 |
| Number of Rounds | Stepper: 3-5 |
| Special Roles | Toggle ON/OFF |
| Voice Chat | Toggle ON/OFF |
| Game Mode | Dropdown: Classic/Speed/Silent/Blind/Chaos |
| Word Pack | Dropdown: Default/Premium/Custom |

#### Action Buttons
| Tombol | Detail |
|--------|--------|
| **Start Game** | Background Cyan, disabled jika <4 pemain atau belum semua ready |
| **Leave Room** | Text merah, outline tipis |

### Animasi
- Player join: card pop in + glow effect
- Player ready: checkmark scale bounce
- Settings expand: slide up dengan fade
- Start button: pulse glow saat enabled

### Interaksi
- Tap empty slot → Invite friend / Share room code
- Tap player card → View profile (popup)
- Tap ready button → Toggle ready status
- Host tap setting → Edit setting (real-time sync ke semua pemain)
- Host tap Start → Transition ke Role Assignment
- Swipe down settings panel → Collapse

### State
| State | Visual |
|-------|--------|
| **Waiting** | Timer tidak ada, "Waiting..." text |
| **Ready** | Semua pemain ready, Start button enabled |
| **Starting** | Countdown 3-2-1, screen shake + zoom in |

---

## SCREEN 06 — ROLE ASSIGNMENT SCREEN

### Tujuan
Dramatisasi pemberian peran kepada setiap pemain. Momen paling penting sebelum game dimulai.

### Elemen UI

#### Background
| Elemen | Detail |
|--------|--------|
| **Base** | Deep Navy dengan radial gradient dari tengah |
| **Glow** | Circle besar di belakang card, warna sesuai peran, opacity 15% |

#### Role Card (Center)
| Elemen | Detail |
|--------|--------|
| **Card** | Rounded 24px, background #1A1A2E, border 3px sesuai warna peran |
| **Shadow** | Multiple offset shadows dengan warna peran, blur 20px |
| **Role Icon** | Circle 80px, background gradient peran, icon karakter di tengah |
| **Role Name** | Bold, 24px, warna peran |
| **Description** | "Your word: "PIANO"" — white, 16px |
| **Hint Text** | "Blend in. Don't get caught." — gray italic, 12px |
| **Corner Stars** | 4 bintang kecil di pojok card, warna peran, opacity 50% |

#### Peran Warna Mapping
| Peran | Warna Border & Glow | Warna Teks |
|-------|---------------------|------------|
| Civilian | Cyan (#00F0FF) | Cyan |
| Undercover | Crimson (#FF0055) | Crimson |
| Mr. White | Gold (#FFD700) | Gold |
| Special Role | Purple (#B026FF) | Purple |

### Animasi (Sequence)
1. **0.0s-1.0s:** Cards shuffle animation — 3 cards bergerak cepat di tengah layar
2. **1.0s-1.5s:** Cards stop, 1 card di tengah scale up
3. **1.5s-2.0s:** Card flip 3D (Y-axis rotation 0° → 180° → 360°)
4. **2.0s-2.5s:** Glow pulse — background circle expand + fade
5. **2.5s-3.5s:** Text type-in effect untuk role name
6. **3.5s-4.0s:** Word reveal dengan blur-to-sharp transition
7. **4.0s-5.0s:** "TAP TO CONTINUE" fade in di bawah

### Interaksi
- Tap card → Continue ke Word Reveal (jika belum)
- Auto-advance setelah 5 detik jika tidak di-tap
- Swipe up → Skip animation (langsung ke Clue Round)

### Sound
- Card shuffle: card flipping sound
- Reveal: dramatic chord + whoosh
- Glow pulse: subtle ambient hum

---

## SCREEN 07 — WORD REVEAL SCREEN

### Tujuan
Menampilkan kata rahasia kepada pemain dengan privasi tinggi (anti shoulder-surfing).

### Elemen UI

#### Privacy Overlay
| Elemen | Detail |
|--------|--------|
| **Blur Background** | Heavy blur (20px) pada semua elemen UI lain |
| **Dim Overlay** | Black 60% opacity di luar area kata |
| **Peek Warning** | "⚠️ Cover your screen!" — text kecil di atas |

#### Word Display (Center)
| Elemen | Detail |
|--------|--------|
| **Category Label** | "CATEGORY: MUSICAL INSTRUMENT" — small caps, gray, 12px |
| **Word** | "PIANO" — bold, 48px, white, center |
| **Subtext** | "Remember this word. Don't say it directly!" — gray, 14px |
| **Timer** | "Revealing for 5s..." — countdown bar Cyan |

#### Mr. White Variant
| Elemen | Detail |
|--------|--------|
| **Word** | "???" — dengan question mark animation |
| **Subtext** | "You are Mr. White. You have NO word. Guess the Civilian's word!" |
| **Hint** | "Listen carefully to other players' clues." |

### Animasi
- Word: typewriter effect (huruf muncul satu per satu)
- Background blur: fade in (300ms)
- Timer bar: shrink dari 100% → 0% (5 detik)
- Auto-hide: word fade out + blur remove → transition ke Clue Round

### Interaksi
- Tap anywhere → Hold to keep word visible (Mr. White: hold to see hint)
- Release → Word hidden, blur kembali
- Timer habis → Auto transition

---

## SCREEN 08 — CLUE ROUND SCREEN

### Tujuan
Pemain memberikan petunjuk tentang kata rahasia mereka secara bergantian.

### Elemen UI

#### Top Bar
| Elemen | Detail |
|--------|--------|
| **Timer Bar** | Horizontal bar penuh lebar, background #1A1A2E, fill Cyan |
| **Round Info** | "Round 2 of 3 • 45s remaining" — gray, 12px, center |
| **Current Speaker** | Avatar kecil + nama pemain yang sedang bicara, border Cyan glow |

#### Chat Area (Scrollable)
| Elemen | Detail |
|--------|--------|
| **Bubble** | Rounded 16px, background #1A1A2E, border 1.5px sesuai warna pemain |
| **Avatar** | Circle 32px di kiri bubble |
| **Name** | Bold, warna pemain, 12px |
| **Message** | White, 14px |
| **Timestamp** | Gray, 10px, pojok kanan bawah bubble |
| **Voice Wave** | Animated waveform saat pemain bicara (voice mode) |

#### Input Area (Bottom)
| Elemen | Detail |
|--------|--------|
| **Text Input** | Rounded 24px, background #1A1A2E, border Cyan, placeholder "Type your clue..." |
| **Send Button** | Icon paper plane, Cyan, di dalam input field |
| **Voice Button** | Icon microphone, di kanan input. Tap & hold untuk record |
| **Emote Button** | Icon smiley, di kiri input. Tap untuk quick emote panel |

#### Mr. Meme Mode Overlay
| Elemen | Detail |
|--------|--------|
| **Banner** | "🎭 MR. MEME MODE — Act it out! No talking!" — Purple banner di atas |
| **Camera Preview** | Small window (jika mode video aktif) |
| **Timer** | Extra 10 detik untuk acting |

### Animasi
- New message: bubble slide up + fade in (200ms)
- Voice wave: real-time amplitude animation
- Timer bar: smooth shrink (1s updates)
- Speaker change: avatar glow transition

### Interaksi
- Type clue → Tap send / Enter
- Hold voice button → Record voice → Release to send
- Tap emote button → Emote panel slide up → Tap emote to send
- Swipe chat → Scroll history
- Mr. Meme: camera on, gesture recognition (optional)

### State
| State | Visual |
|-------|--------|
| **Your Turn** | Input enabled, border Cyan glow, "Your turn!" text |
| **Others' Turn** | Input disabled, grayed out, "Waiting for others..." |
| **Time's Up** | Input disabled, auto-send jika ada text |

---

## SCREEN 09 — DISCUSSION SCREEN

### Tujuan
Pemain mendiskusikan dan mendebatkan clue yang sudah diberikan sebelum voting.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Title** | "DISCUSSION TIME" — bold, Crimson, 18px |
| **Subtitle** | "Who is the Undercover?" — gray, 12px |
| **Timer** | Countdown circle, 60 detik, warna Crimson |

#### Player List (Horizontal Scroll)
| Elemen | Detail |
|--------|--------|
| **Player Card** | Vertical card, avatar 56px, nama di bawah, status indicator |
| **Status** | Green dot = online/speaking, Red dot = eliminated, Gray = muted |
| **Vote Button** | Small "VOTE" button di bawah card (disabled sampai voting phase) |

#### Chat Area
| Elemen | Detail |
|--------|--------|
| **Same as Clue Round** | Bubbles dengan warna pemain |
| **Pinned Message** | Clue summary di atas ("Clues so far: Musical instrument, Black & white keys, Used in concerts") |

#### Bottom Actions
| Tombol | Detail |
|--------|--------|
| **Start Voting** | Background Crimson, "START VOTING →". Host only, muncul setelah 30s |
| **Quick Emote** | Row of 5 emote icons di atas keyboard |

### Animasi
- Player cards: horizontal scroll dengan snap
- Timer: circle SVG stroke animation
- "Start Voting" button: pulse glow saat available

### Interaksi
- Tap player card → Highlight + show quick profile
- Swipe player list → Scroll
- Tap "Start Voting" → Transition ke Voting Screen
- Auto-transition ke Voting setelah timer habis

---

## SCREEN 10 — VOTING SCREEN

### Tujuan
Pemain voting untuk mengeliminasi pemain yang dicurigai.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Title** | "VOTING TIME" — bold, Crimson, 20px |
| **Subtitle** | "Tap a player to vote" — gray, 12px |
| **Timer** | "15s" — bold, center, countdown circle Crimson |

#### Player Layout (Circular)
| Elemen | Detail |
|--------|--------|
| **Center** | Countdown timer circle, background #1A1A2E, border Crimson |
| **Player Nodes** | 6-12 pemain di lingkaran sekitar center, jarak equal |
| **Node** | Avatar circle 48px, border warna pemain, nama di bawah |
| **Vote Badge** | Circle kecil di pojok kanan atas avatar, background merah, jumlah suara |
| **Vote Lines** | Neon trail dari voter ke target (Bezier curve, warna voter) |

#### Vote Confirmation (After Tap)
| Elemen | Detail |
|--------|--------|
| **Confirmation Modal** | "Vote for [PlayerName]?" — glassmorphism card |
| **Yes Button** | Background Crimson, "CONFIRM" |
| **No Button** | Outline gray, "CANCEL" |

#### Bottom Info
| Elemen | Detail |
|--------|--------|
| **Your Vote** | "You voted for: [Name]" — text kecil |
| **Votes Cast** | "5/8 votes cast" — progress bar |

### Animasi
- **Vote cast:** Particle trail dari voter ke target (500ms, Bezier curve)
- **Vote badge:** Scale bounce saat bertambah
- **Timer:** Tick animation setiap detik
- **All votes in:** Screen flash putih → Transition ke Elimination

### Interaksi
- Tap player node → Confirmation modal
- Tap confirm → Vote locked, cannot change
- Tap cancel → Kembali ke layout
- Timer habis → Auto-vote random (jika belum voting)

### Special Role Effects
| Peran | Effect |
|-------|--------|
| **Shadow** | Vote trail lebih tebal (double vote visual) |
| **Hantu** | Vote trail transparan (sudah mati) |
| **Bumerang** | Saat terkena vote terbanyak, trail balik ke voter |
| **Dewi Keadilan** | Tie breaker animation — scales glow purple |

---

## SCREEN 11 — ELIMINATION SCREEN

### Tujuan
Dramatisasi pengeliminasi pemain. Momen climax setiap ronde.

### Elemen UI

#### Background
| Elemen | Detail |
|--------|--------|
| **Base** | Deep Navy |
| **Effect** | Red flash (300ms) → Fade to normal |
| **Particles** | Burst outward dari center — 30+ particles, warna random neon |

#### Eliminated Player (Center)
| Elemen | Detail |
|--------|--------|
| **Avatar** | Scale 1.5x, grayscale filter, shake animation |
| **Name** | "[PlayerName] ELIMINATED" — bold, Crimson, 24px |
| **Role Reveal** | "Was: UNDERCOVER" — warna peran, 18px |
| **Word Reveal** | "Their word: PIANO" — gray, 14px (opsional, untuk transparansi) |

#### Surviving Players (Bottom)
| Elemen | Detail |
|--------|--------|
| **Row** | Avatar kecil surviving players, border hijau |
| **Count** | "7 players remaining" |

#### Special Role Effects
| Peran | Effect |
|-------|--------|
| **Revenger** | "REVENGE ACTIVATED!" — modal muncul, pilih target |
| **Lovers** | "LOVERS FALL!" — kedua avatar di-eliminate bersama |
| **Badut Bahagia** | "BADUT BONUS! +4 pts" — gold confetti |

### Animasi (Sequence)
1. **0.0s-0.3s:** Screen shake + red flash
2. **0.3s-0.8s:** Particle burst outward dari center
3. **0.8s-1.5s:** Eliminated avatar scale up + grayscale
4. **1.5s-2.0s:** Role reveal — text flip animation
5. **2.0s-3.0s:** Special role effects (jika ada)
6. **3.0s-4.0s:** Surviving players slide in dari bawah
7. **4.0s-5.0s:** "TAP TO CONTINUE" fade in

### Sound
- Elimination: dramatic boom + glass shatter
- Role reveal: suspense chord
- Revenge: thunder sound

### Interaksi
- Tap anywhere → Continue
- Auto-advance setelah 5 detik

---

## SCREEN 12 — WIN SCREEN

### Tujuan
Merayakan kemenangan tim dengan visual yang memuaskan dan reward summary.

### Elemen UI

#### Background
| Elemen | Detail |
|--------|--------|
| **Base** | Deep Navy |
| **Effect** | Confetti particle — 100+ particles jatuh dari atas, warna tim pemenang |
| **Glow** | Radial gradient dari center, warna tim pemenang, opacity 20% |

#### Winner Announcement (Top 30%)
| Elemen | Detail |
|--------|--------|
| **Crown** | Icon crown besar, Gold, di atas teks |
| **Title** | "CIVILIANS WIN!" / "UNDERCOVER WINS!" / "MR. WHITE WINS!" — bold, warna tim, 28px |
| **Subtitle** | "The secret has been revealed!" — gray, 14px |

#### Score Board (Middle 50%)
| Elemen | Detail |
|--------|--------|
| **Card** | Glassmorphism, rounded 16px, border Gold |
| **Header** | "🏆 FINAL SCORES" — Gold, 14px |
| **Row** | Rank + Avatar + Name + Role + Points |
| **Highlight** | Baris pemenang dengan background gradient tipis |

| Rank | Visual |
|------|--------|
| 🥇 1st | Gold text, crown icon, glow effect |
| 🥈 2nd | Silver text, medal icon |
| 🥉 3rd | Bronze text, medal icon |
| 4+ | White text, number |

#### Bottom Actions
| Tombol | Detail |
|--------|--------|
| **Play Again** | Background Cyan, "PLAY AGAIN" |
| **Share Result** | Outline Purple, icon share, "SHARE" |
| **Back to Home** | Text gray, "BACK TO HOME" |

### Animasi (Sequence)
1. **0.0s-0.5s:** Confetti rain starts
2. **0.5s-1.0s:** Crown drop dari atas + bounce
3. **1.0s-1.5s:** Winner text scale in + glow pulse
4. **1.5s-3.0s:** Score board slide up, rows staggered (150ms delay)
5. **3.0s-4.0s:** Buttons fade in

### Interaksi
- Tap "Play Again" → Lobby baru dengan pemain yang sama
- Tap "Share" → Share sheet (screenshot + text)
- Tap "Back to Home" → Home Screen
- Swipe up score board → Expand detail stats

---

## SCREEN 13 — PROFILE SCREEN

### Tujuan
Menampilkan statistik, achievement, dan inventory pemain.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Background** | Gradient dari warna peran favorit |
| **Avatar** | Circle 100px, border 3px Gold, frame sesuai level |
| **Username** | Bold, 20px, white |
| **Level Badge** | "LV.12" — rounded pill, background Cyan, text dark |
| **Edit Button** | Icon pencil, pojok kanan atas |

#### Stats Section
| Elemen | Detail |
|--------|--------|
| **Radar Chart** | 5 axis: Wins, Clues Given, Voting Accuracy, Survival, Social |
| **Numbers** | Games Played, Win Rate %, Total Points, Best Streak |
| **Cards** | 4 stat cards horizontal: Wins, Losses, Win Rate, Points |

#### Achievement Grid
| Elemen | Detail |
|--------|--------|
| **Grid** | 3x4 grid, icon achievement |
| **Locked** | Grayscale, lock icon |
| **Unlocked** | Full color, sparkle animation |
| **Progress** | "7/10" di pojok kanan bawah |

#### Recent Games
| Elemen | Detail |
|--------|--------|
| **List** | Scrollable vertical |
| **Row** | Date, mode, result (win/loss), role, points |

### Animasi
- Radar chart: draw animation (1s)
- Stat numbers: count up animation
- Achievement: staggered fade in, sparkle saat hover
- Recent games: slide in dari kanan

### Interaksi
- Tap achievement → Detail popup dengan deskripsi
- Tap recent game → Replay detail
- Tap edit → Edit Profile Screen
- Swipe down → Back

---

## SCREEN 14 — AVATAR STUDIO SCREEN

### Tujuan
Kustomisasi karakter pemain dengan ratusan item.

### Elemen UI

#### Preview Area (Left 40%)
| Elemen | Detail |
|--------|--------|
| **Background** | Gradient Cyan-Purple, rounded 24px |
| **Avatar** | Full character preview, scale besar |
| **Name** | Username di bawah avatar |
| **Level** | "Level 12" di bawah nama |
| **Rotate Button** | Icon rotate, pojok kanan bawah preview |

#### Category Tabs (Top Right)
| Tab | Warna | Icon |
|-----|-------|------|
| Hair | #FF0055 | Scissors |
| Face | #00F0FF | Smiley |
| Outfit | #B026FF | Shirt |
| Accessories | #FFD700 | Glasses |
| Background | #00FF88 | Image |

#### Item Grid (Bottom Right)
| Elemen | Detail |
|--------|--------|
| **Grid** | 4x3 grid, square cards |
| **Item** | Icon item, border gray |
| **Selected** | Border Cyan, glow |
| **Locked** | Overlay gelap, lock icon, harga di bawah |
| **Equipped** | Checkmark hijau di pojok kanan atas |

#### Currency Display (Bottom)
| Elemen | Detail |
|--------|--------|
| **Gems** | 💎 450 — Cyan, bold |
| **Coins** | 🪙 2,100 — Gold, bold |
| **Buy Button** | "+" button di samping masing-masing |

### Animasi
- Avatar: real-time update saat item dipilih
- Item select: border glow + scale 1.05
- Category switch: horizontal slide
- Equip: checkmark pop in + sparkle

### Interaksi
- Tap category tab → Switch item grid
- Tap item → Preview on avatar
- Tap locked item → Purchase modal (Gems/Coins)
- Tap equipped item → Unequip
- Swipe avatar → Rotate 360°
- Pinch → Zoom preview

---

## SCREEN 15 — SHOP SCREEN

### Tujuan
Menjual item kosmetik, currency, dan season pass.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Title** | "SHOP" — bold, Gold, 24px |
| **Currency** | Gems & Coins di pojok kanan atas |
| **Tabs** | Featured, Items, Packs, Currency, Pass |

#### Featured Section (Top 40%)
| Elemen | Detail |
|--------|--------|
| **Banner** | Full width carousel, auto-scroll 5s |
| **Item** | Large card dengan gambar, nama, harga, "BUY" button |
| **Limited Badge** | "⏰ LIMITED TIME" — merah, pojok kiri atas |
| **Discount Badge** | "-30%" — hijau, pojok kanan atas |

#### Item Grid (Bottom 60%)
| Elemen | Detail |
|--------|--------|
| **Grid** | 2x3 horizontal scrollable rows |
| **Card** | Gambar item, nama, harga, rarity indicator (Common/Rare/Epic/Legendary) |
| **Rarity Colors** | Common=#A0A0B0, Rare=#00F0FF, Epic=#B026FF, Legendary=#FFD700 |

#### Season Pass Card (Fixed Bottom)
| Elemen | Detail |
|--------|--------|
| **Card** | Gradient Gold, rounded 16px |
| **Title** | "SEASON 1 PASS" |
| **Benefits** | "+50 Exclusive Items • +2x XP • Early Access" |
| **Price** | "Rp 35.000" — bold, white |
| **Buy Button** | "BUY PASS" — background white, text Gold |

### Animasi
- Banner: auto-scroll dengan parallax
- Item hover: scale 1.05 + glow
- Purchase: coin/gem count down animation
- New item: sparkle + "NEW" badge pop

### Interaksi
- Swipe banner → Manual scroll
- Tap item → Detail modal dengan preview 360°
- Tap "BUY" → Purchase confirmation → Success animation
- Tap "BUY PASS" → IAP flow

---

## SCREEN 16 — LEADERBOARD SCREEN

### Tujuan
Menampilkan peringkat pemain global, regional, dan teman.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Title** | "🏆 LEADERBOARD" — bold, Gold, 20px |
| **Tabs** | Global | Regional | Friends | Clan |
| **Season** | Dropdown "Season 1" di pojok kanan |

#### Top 3 Podium (Top 30%)
| Elemen | Detail |
|--------|--------|
| **2nd Place** | Kiri, podium medium, Silver border, avatar 64px |
| **1st Place** | Tengah, podium tinggi, Gold border, avatar 80px, crown |
| **3rd Place** | Kanan, podium rendah, Bronze border, avatar 56px |
| **Names & Points** | Di bawah masing-masing podium |

#### Rank List (Bottom 70%)
| Elemen | Detail |
|--------|--------|
| **Row** | Rank number + Avatar + Name + Points + Trend (↑↓→) |
| **Highlight** | Baris pemain sendiri dengan background Cyan gelap |
| **Your Rank** | "Your Rank: #42" — sticky di atas list |

### Animasi
- Podium: staggered slide up (1st dulu, then 2nd, 3rd)
- List: fade in dengan stagger
- Trend arrow: bounce animation

### Interaksi
- Tap tab → Switch leaderboard
- Tap player row → Profile popup
- Swipe list → Scroll
- Pull down → Refresh

---

## SCREEN 17 — SETTINGS SCREEN

### Tujuan
Mengatur preferensi game, akun, dan sistem.

### Elemen UI

#### Sections

**Account**
| Setting | Kontrol |
|---------|---------|
| Username | Text field + edit icon |
| Email | Display only |
| Link Account | Button "Link Google/Apple" |
| Log Out | Text merah |

**Game**
| Setting | Kontrol |
|---------|---------|
| Language | Dropdown: Indonesia, English, dll |
| Word Pack | Dropdown |
| Default Mode | Dropdown |
| Hints | Toggle ON/OFF |

**Audio**
| Setting | Kontrol |
|---------|---------|
| Music Volume | Slider 0-100 |
| SFX Volume | Slider 0-100 |
| Voice Chat Volume | Slider 0-100 |
| Voice Chat | Toggle ON/OFF |

**Notifications**
| Setting | Kontrol |
|---------|---------|
| Daily Reminder | Toggle |
| Friend Activity | Toggle |
| Event Notifications | Toggle |

**Support**
| Setting | Kontrol |
|---------|---------|
| Help Center | Arrow → |
| Report Bug | Arrow → |
| Terms of Service | Arrow → |
| Privacy Policy | Arrow → |
| Delete Account | Text merah |

### Animasi
- Section expand: slide down + fade
- Toggle: smooth switch dengan glow
- Slider: real-time fill animation

### Interaksi
- Tap setting → Expand/collapse section
- Toggle switch → Immediate save
- Slider drag → Real-time preview
- Tap link → WebView / External browser

---

## SCREEN 18 — TOURNAMENT / EVENT SCREEN

### Tujuan
Menampilkan event dan turnamen aktif dengan hadiah menarik.

### Elemen UI

#### Active Event Banner (Top 30%)
| Elemen | Detail |
|--------|--------|
| **Background** | Gradient event theme (e.g., Valentine = Pink-Red) |
| **Event Name** | "💕 VALENTINE CHAOS" — bold, 24px |
| **Description** | "Special Lovers mode! Double points for couples!" |
| **Timer** | Countdown "Ends in: 2d 14h 33m" |
| **Join Button** | Background event color, "JOIN EVENT" |

#### Tournament Bracket (Middle 40%)
| Elemen | Detail |
|--------|--------|
| **Bracket** | Visual bracket tree |
| **Your Position** | Highlighted node |
| **Match Status** | "Next match: Today 8PM" |

#### Rewards Track (Bottom 30%)
| Elemen | Detail |
|--------|--------|
| **Track** | Horizontal scroll, milestone cards |
| **Milestone** | Points needed + reward icon |
| **Current** | Indicator di milestone aktif |
| **Claim Button** | "CLAIM" untuk milestone yang sudah tercapai |

### Animasi
- Banner: parallax scroll
- Bracket: draw animation (SVG path)
- Rewards: progress bar fill
- Claim: sparkle + item pop

### Interaksi
- Tap "Join Event" → Queue untuk event
- Tap milestone → Reward detail
- Tap "Claim" → Item masuk inventory
- Swipe rewards → Scroll track

---

## SCREEN 19 — REPLAY / HIGHLIGHTS SCREEN

### Tujuan
Menyimpan dan menonton kembali momen epic dari game sebelumnya.

### Elemen UI

#### Header
| Elemen | Detail |
|--------|--------|
| **Title** | "🎬 HIGHLIGHTS" — bold, 18px |
| **Filter** | Dropdown: All, Wins, Epic Moments, Funny |

#### Video List
| Elemen | Detail |
|--------|--------|
| **Thumbnail** | 16:9, play icon overlay |
| **Title** | "Undercover exposed!" — bold, 14px |
| **Meta** | Date, duration, views |
| **Tags** | "#epic #undercover #clutch" — small pills |
| **Share Button** | Icon share |
| **Delete Button** | Icon trash |

#### Playback Screen (Full Screen)
| Elemen | Detail |
|--------|--------|
| **Video** | Full screen, auto-play |
| **Overlay** | Player names, roles, clues (synced) |
| **Timeline** | Scrubbable, chapter markers |
| **Controls** | Play/Pause, Speed (0.5x-2x), Fullscreen |

### Animasi
- Thumbnail: hover scale 1.02
- Play: icon scale pulse
- Share: slide up share sheet

### Interaksi
- Tap thumbnail → Playback screen
- Tap share → Native share sheet
- Swipe list → Scroll
- Long press → Delete confirmation

---

## SCREEN 20 — GUILD / CLAN SCREEN

### Tujuan
Mengelola clan, melihat anggota, dan berpartisipasi dalam clan wars.

### Elemen UI

#### Clan Header
| Elemen | Detail |
|--------|--------|
| **Banner** | Custom clan banner image |
| **Clan Icon** | Circle 80px, border Gold |
| **Clan Name** | "Secret Squad" — bold, 20px |
| **Tag** | "[SSQ]" — gray, 12px |
| **Rank** | "#42 Global" — Gold |
| **Members** | "32/50" — gray |

#### Stats Bar
| Elemen | Detail |
|--------|--------|
| **Trophies** | 🏆 1,245 |
| **Wins** | ✅ 342 |
| **Win Rate** | 📊 68% |

#### Member List
| Elemen | Detail |
|--------|--------|
| **Row** | Rank + Avatar + Name + Role + Contribution |
| **Leader** | Crown icon, Gold border |
| **Officer** | Star icon, Silver border |
| **Member** | No icon, gray border |
| **You** | Highlight Cyan |

#### Clan Wars Section
| Elemen | Detail |
|--------|--------|
| **Current War** | "VS Dark Alliance" — opponent clan |
| **Score** | "1,240 vs 1,180" — progress bar |
| **Time Left** | "Ends in 2 days" |
| **Contribute Button** | "+ CONTRIBUTE POINTS" — Cyan |

#### Actions
| Tombol | Detail |
|--------|--------|
| **Invite** | Outline, "+ INVITE" |
| **Leave** | Text merah |
| **Settings** | Gear icon (leader only) |

### Animasi
- Banner: parallax
- Member list: staggered fade
- War score: real-time update animation
- Invite: modal slide up

### Interaksi
- Tap member → Profile popup
- Tap "Contribute" → Pilih game untuk contribute
- Tap "Invite" → Share link / Friend list
- Swipe → Scroll member list

---

## SHARED COMPONENTS

### 1. SNACKBAR / TOAST
| Property | Value |
|----------|-------|
| **Position** | Bottom, 16px dari bottom nav |
| **Background** | #1A1A2E, border 1px sesuai type |
| **Success** | Border green, icon checkmark |
| **Error** | Border red, icon cross |
| **Info** | Border Cyan, icon info |
| **Animation** | Slide up + fade in (200ms), auto-dismiss 3s |

### 2. MODAL / DIALOG
| Property | Value |
|----------|-------|
| **Background** | Black 60% overlay |
| **Card** | Glassmorphism, rounded 16px, max width 320px |
| **Animation** | Scale 0.9 → 1.0 + fade in (200ms) |
| **Dismiss** | Tap overlay or swipe down |

### 3. LOADING SPINNER
| Property | Value |
|----------|-------|
| **Type** | Circular, neon Cyan |
| **Size** | 48px |
| **Animation** | Rotate 360°, 1s linear infinite |
| **Background** | Deep Navy 80% overlay |

### 4. BUTTON STATES
| State | Visual |
|-------|--------|
| **Default** | Background solid, text bold |
| **Hover/Press** | Scale 0.98, brightness 110% |
| **Disabled** | Opacity 50%, no interaction |
| **Loading** | Spinner menggantikan text |

### 5. CARD COMPONENT
| Property | Value |
|----------|-------|
| **Background** | #1A1A2E |
| **Border** | 1px, color sesuai konteks |
| **Border Radius** | 12-16px |
| **Shadow** | 0 4px 20px rgba(0,0,0,0.3) |
| **Hover** | Border glow + translateY(-2px) |

---

## RESPONSIVE BREAKPOINTS

| Device | Width | Adjustment |
|--------|-------|------------|
| **Small Phone** | <360px | Compact mode, smaller avatars, single column grids |
| **Phone** | 360-420px | Standard layout |
| **Large Phone** | 420-480px | Slightly larger elements, more padding |
| **Tablet** | >480px | Two-column layout for some screens, larger preview |

---

## ACCESSIBILITY

| Feature | Implementation |
|---------|----------------|
| **Screen Reader** | Semua elemen dengan contentDescription/label |
| **Color Contrast** | Minimum 4.5:1 untuk text |
| **Font Size** | Support system font scaling |
| **Reduce Motion** | Respect system setting — disable particles, simplify animations |
| **High Contrast** | Mode dengan border lebih tebal |
| **Voice Control** | Support voice commands untuk navigasi |

---

*"Every pixel tells a story. Every animation builds tension. Every screen is a clue."*

---

**Document Version:** 1.0  
**Last Updated:** 29 Mei 2026  
**Next Review:** Before Alpha Build



## 💰 MONETISASI

### Revenue Model

| Model | Detail | Harga |
|-------|--------|-------|
| **Freemium** | Gratis main, semua fitur dasar playable | Free |
| **Cosmetic IAP** | Avatar items, themes, card backs, elimination effects | Rp 5.000-50.000 |
| **Season Pass** | Tier premium dengan reward eksklusif per 8 minggu | Rp 35.000 |
| **Word Pack Premium** | Kata-kata eksklusif (tema: Film, Makanan, Teknologi) | Rp 15.000 per pack |
| **Starter Pack** | Bundle item + currency untuk pemain baru | Rp 25.000 (one-time) |
| **Remove Ads** | Hilangkan iklan banner & interstitial | Rp 55.000 (one-time) |
| **Currency Pack** | Coin & Gem untuk beli item | Rp 10.000-150.000 |

### Ads Integration

| Type | Placement | Reward |
|------|-----------|--------|
| **Rewarded Video** | After game (bonus poin), revive 1x, unlock item preview | +50% poin, free revive, 1-hour item trial |
| **Interstitial** | Between games (every 3 games) | None |
| **Banner** | Home screen bottom | None |

### Economy Balance

| Currency | Earned From | Spent On |
|----------|-------------|----------|
| **Coin** | Playing, winning, daily login, ads | Common items, word packs |
| **Gem** | IAP, season pass, achievement, events | Premium items, season pass, instant unlock |

---

## 📁 GLOSSARY

| Term | Definition |
|------|------------|
| **Clue Round** | Ronde di mana pemain memberi petunjuk tentang kata rahasia |
| **Elimination** | Pemain diusir dari game melalui voting |
| **Special Role** | Peran dengan kekuatan unik selain Civilian/Undercover/Mr. White |
| **Word Pack** | Kumpulan kata-kata dengan tema tertentu |
| **Season Pass** | Sistem subscription untuk konten premium per season |
| **PWA** | Progressive Web App — web app yang bisa di-install ke home screen |
| **Capacitor** | Tool untuk membungkus web app jadi APK/IPA native |

---

## 📎 REFERENCE

1. Undercover (Yanstar Studio) — Role mechanics reference
2. Spyfall — Word guessing mechanics
3. Among Us — Social deduction simplicity
4. Gartic Phone — Web party game viral mechanics
5. Brawl Stars — Season pass & progression model

---

**Document Owner:** Sathosi  
**Review Cycle:** Monthly  
**Next Review:** 29 Juni 2026

---

*"Trust No One. Reveal the Secret."*
