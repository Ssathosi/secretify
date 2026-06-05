# Secretify — Neubrutalism UI (Desktop-First)

**Versi:** 2.0 · **30 Mei 2026**  
**Scope:** Visual layer only — routes, Zustand, game logic **tidak diubah**.  
**Platform:** **Desktop-first** (1024px+), **optimal mobile** (360–480px, PWA).  
**Sumber layout:** `SECRETIFY_UI_Screen_Context.md` · stitch folder `stitch_secretify_neubrutal_pixel_redesign/`

---

## 1. Prinsip layout (wajib)

| Aturan | Desktop (≥1024px) | Mobile (<1024px) |
|--------|-------------------|------------------|
| **Lebar konten** | Frame max **1280px**, centered; isi **2 kolom** bila masuk akal | Full width; **1 kolom**; padding 16–24px |
| **Root app** | **Jangan** `max-width: 480px` di `#root` | Safe-area; tap target ≥44px |
| **Area kosong** | Isi dengan sidebar, grid kartu, tips, atau doodle 8–12% opacity — **bukan** kolom sempit di tengah layar lebar | Hindari dead space; scroll vertikal |
| **Navigasi** | Top bar + sidebar opsional (onboarding, settings, shop) | Bottom nav floating pill (4 tab) |
| **Ilustrasi** | SVG/asset **lokal** — jangan andalkan URL eksternal | Sama; ukuran hero disesuaikan |
| **Onboarding** | Sidebar langkah + 1 kartu besar | Carousel snap horizontal |
| **Splash** | Split **horizontal** navy \| cream | Split **vertikal** 65% \| 35% + scallop |
| **Gameplay** | Orbit voting / grid pemain memakai lebar penuh frame | Layout stack; scroll horizontal untuk kartu pemain |
| **A11y** | Hover + keyboard focus ring 3px sunflower | `prefers-reduced-motion`: tanpa partikel/shake |

**Anti-patterns:** neon glow, glassmorphism, blur backdrop, gradient “AI slop”, placeholder `?` kosong, emoji sebagai satu-satunya ikon, layout “HP 480px” di monitor lebar.

---

## 2. Design system (satu blok untuk semua screen)

### Zona warna

| Zona | Screen | BG | Kartu |
|------|--------|-----|-------|
| **A — Meta/Hub** | Home, Profile, Shop, Settings, Onboarding, Login, Leaderboard, Guild | `#F7F4EE` cream | `#FFFFFF` paper |
| **B — Gameplay** | Lobby→Win (tension) | `#12182B` navy | `#F0EDE6` sand / paper on dark |

Transisi: scallop horizontal (mobile) · scallop vertikal (desktop split).

### Token warna

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| ink | `#000000` | Border 3px, stroke |
| cream / navy / paper / sand | `#F7F4EE` / `#12182B` / `#FFF` / `#F0EDE6` | BG & kartu |
| lime / teal / coral / sunflower / grape | `#DFFF00` / `#2EC4B6` / `#FF6B35` / `#FFD23F` / `#9B5DE5` | CTA, nav, danger, highlight, special |
| slate / fog | `#4A5568` / `#8B95A8` | Muted, placeholder |

**Peran (flat + border 3px, tanpa glow):** Sivil=lime · Undercover=coral · Mr. White=sunflower · Special=grape.

### Tipografi

| Role | Font | Catatan |
|------|------|---------|
| Display | Space Grotesk 700–800 | Judul |
| Body | DM Sans 400–700 | Copy; min 14px, lh 1.45 |
| Game accent | Press Start 2P | Max 1–4 kata (COUNTDOWN, ELIMINATED) |
| Mono | IBM Plex Mono | Kode ruangan, timer |

### Neubrutal (semua komponen)

- Border **3px** `#000` · Shadow **`4px 4px 0 #000`** · Press: `translate(2px,2px)` + shadow `2px 2px 0`
- Radius: 12px control · 16px kartu · 20px hero
- **Tanpa** blur, neon text-shadow, glass card
- Pixel art **hanya** ilustrasi/dekor; UI chrome tetap vector

### Bilingual

- **ID** bold (aksi & judul) · **EN** kecil fog/slate di bawah atau setelah `/`
- Contoh tombol: `MAIN CEPAT` / `Quick Play` · Chip: `Beranda / Home`

### Komponen ringkas

| Komponen | Spesifikasi |
|----------|-------------|
| CTA primary | lime fill, teks hitam, border+shadow brutal |
| Secondary | teal · Danger | coral · Ghost | paper + border |
| Input | paper, placeholder fog, focus inner 4px sunflower (flat) |
| Toast | paper, stripe kiri 6px (lime/teal/coral), di atas nav |
| Modal | overlay navy **85% flat** (no blur), kartu paper/sand, binder dots opsional |
| Bottom nav (mobile) | pill teal, 4 tab, active=garis sunflower |
| Timer/bar | track paper+border, fill teal (normal) / coral (urgent), min-h 12px |

---

## 3. Shell aplikasi (implementasi)

```
AppShell
├── backdrop: navy gradient + pola pixel 7% (isi sisi layar lebar)
└── frame: max-w-[1280px] mx-auto min-h-dvh
    ├── lg: padding 24–32px, rounded-2xl border brutal (opsional)
    └── children: layout per screen (lihat §4)
```

**Breakpoint Tailwind:** `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

---

## 4. Template prompt per screen

Salin blok ini, ganti `[SCREEN]`, `[ZONE]`, `[ROUTE]`:

```
Redesign Secretify [SCREEN] — neubrutal + pixel accents, desktop-first, bilingual ID/EN.

LAYOUT
- Desktop (lg+): [deskripsi 2 kolom / sidebar / grid — spesifik screen]
- Mobile: [stack / carousel / bottom sheet]
- AppShell frame 1280px; no empty letterbox on wide screens

ZONE: [A cream | B navy | A+B transitional]
VISUAL: 3px black borders, 4px hard shadow, [warna aksen screen]
CONTENT: Keep all actions/state from existing React screen unchanged.
COPY: Indonesian primary + English secondary per §2.
ILLUSTRATIONS: Local SVG or public/assets — never broken external URLs.
AVOID: neon, glass, 480px-only column, empty placeholders.

Reference: stitch folder [folder_name]/code.html + screen.png if present.
```

---

## 5. Screen cheat sheet (24)

| # | Screen | Route | Zone | Desktop layout | Mobile layout |
|---|--------|-------|------|----------------|---------------|
| 01 | Splash | `/` | B→A | Split H: brand + features \| loading+tips | Split V 65/35 + scallop |
| 02 | Onboarding | `/onboarding` | A | Sidebar 4 steps + kartu besar | Carousel 4 slide |
| 03 | Login | `/login` | A | Center card max-w-md; doodle kiri/kanan | Stack tombol auth |
| 04 | Home | `/home` | A | 2 col: profil+aksi \| event+carousel | Stack + bottom nav |
| 05 | Lobby | `/lobby` | A+B | Grid pemain 3–4 col; settings panel kanan | Grid 2 col; sheet settings |
| 06 | Role assign | `/role-assignment` | B | Kartu peran centered max-w-lg | Fullscreen kartu |
| 07 | Word reveal | `/word-reveal` | B | Kartu reveal centered; timer bawah | Overlay privasi fullscreen |
| 08 | Clue round | `/clue-round` | B | Chat kiri + input kanan (atau chat bawah lebar) | Chat stack + input sticky |
| 09 | Discussion | `/discussion` | B | Header timer + scroll kartu pemain horizontal + chat | Sama, narrower |
| 10 | Voting | `/voting` | B | Orbit/lebar penuh; trails SVG | Orbit compact / list fallback |
| 11 | Elimination | `/elimination` | B | Kartu eliminasi center + survivor row | Fullscreen dramatis |
| 12 | Win | `/win` | A+B | Scoreboard 2 col; CTAs row | Stack + confetti pixel |
| 13 | Profile | `/profile` | A | Banner + stats grid + achievements 4 col | Stack |
| 14 | Avatar studio | `/avatar-studio` | A | Preview kiri, grid item kanan | Preview atas, grid bawah |
| 15 | Shop | `/shop` | A | Tabs + featured row + grid 3–4 col | Tabs + grid 2 col |
| 16 | Leaderboard | `/leaderboard` | A | Podium + table full width | Podium stack + list |
| 17 | Settings | `/settings` | A | Sidebar section + panel kanan | Accordion stack |
| 18 | Tournament | `/tournament` | A | Banner + bracket SVG lebar | Scroll horizontal bracket |
| 19 | Replay | `/replay` | A | Grid kartu 3 col | List 1 col |
| 20 | Guild | `/guild` | A | Banner + 2 col: members \| clan war | Stack |
| 21 | Role guide | `/role-guide` | A | Sidebar tier + daftar accordion | Tabs + accordion |
| 22 | Stats | `/stats` | A | Dashboard grid 2×2 charts | Stack cards |
| 23 | Custom words | `/custom-words` | A | List packs kiri, editor kanan | Stack |
| 24 | Special ability | overlay | B | Modal centered max-w-md | Sheet / modal full |

### Overlay global (semua breakpoint)

| Overlay | Inti visual |
|---------|-------------|
| Pass device | Navy 90%; kartu sand; pixel avatar; `SIAP / READY` lime |
| Countdown 3-2-1 | Press Start 2P; offset hitam; GO di kartu lime |
| Emote panel | Sheet cream scallop top; grid 48px tiles |
| Vote trail | Bezier 3px hitam; tanpa glow |
| Role card sheet | Stripe warna peran; keyword sunflower flat |

---

## 6. Urutan implementasi

1. **Tokens** — `tailwind.config.js`, `index.css`, `AppShell`, komponen brutal (`Button`, `BilingualLabel`, `PixelStars`)  
2. **Pre-game** — Splash → Onboarding → Login → Home → Settings  
3. **Game flow** — Lobby → Role → Word → Clue → Discussion → Voting → Elimination → Win  
4. **Meta** — Profile, Avatar, Shop, Leaderboard, Tournament, Replay, Guild, Role Guide, Stats, Custom Words  
5. **Overlays** — PassDevice, Countdown, Emote, VoteTrail, Toast, Modal  

---

## 7. Mockup AI (suffix)

```
Secretify [SCREEN], desktop-first responsive UI, max content width 1280px, neubrutalism 3px black borders 4px hard shadows, cream #F7F4EE navy #12182B zones, lime teal coral accents, Space Grotesk DM Sans Press Start 2P, 8-bit pixel illustrations local assets, bilingual Indonesian English, no neon no glass --ar 16:10 for desktop mockup; optional 9:19 mobile variant
```

---

## 8. Referensi moodboard

| Referensi | Adopsi |
|-----------|--------|
| NFT marketplace lime | Kartu chunky, CTA lime, stat boxes |
| Retro gaming | Dual zone, scallop, pixel type |
| Music player teal/orange | Nav pill teal, coral danger, binder modal |

**Jangan** copy layout/brand pihak ketiga persis.

---

*Secretify Neubrutalism UI v2.0 · Desktop-first, mobile-optimal · Visual only.*
