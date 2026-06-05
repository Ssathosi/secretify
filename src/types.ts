/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageType = 'ID' | 'EN';

export type RoleType = 'SIVIL' | 'UNDERCOVER' | 'MR_WHITE' | 'SPECIAL';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  points: number;
  isReady: boolean;
  isHost: boolean;
  role?: RoleType;
  word?: string;
  isEliminated: boolean;
  votedForId?: string; // ID of player this user votes for
  votesReceived: number;
  hasConfirmedRole?: boolean;
  specialRole?: string; // e.g. 'clown' | 'boomerang' | 'shadow' | 'ghost' | 'lovers' | 'revenger'
  loversPartnerId?: string; // ID of the linked Lovers partner
}

export interface Clue {
  id: string;
  playerId?: string;
  playerName: string;
  avatar: string;
  clueTextID: string;
  clueTextEN: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  messageID: string;
  messageEN: string;
  isMe: boolean;
  avatar: string;
}

export interface MatchHistory {
  id: string;
  date: string;
  mode: 'Classic' | 'Blitz' | 'Boss Battle';
  rounds: number;
  role: string;
  secretWordCivilian: string;
  secretWordUndercover: string;
  pointsEarned: number;
  isWin: boolean;
}

export interface ShopItem {
  id: string;
  category: 'character' | 'wordpack' | 'emoji';
  nameID: string;
  nameEN: string;
  descriptionID?: string;
  descriptionEN?: string;
  cost: number;
  imgUrl?: string; // pixel icon placeholder
  avatarSvg?: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatarID: string;
  avatarSvg: string;
  points: number;
  level: number;
  isYou?: boolean;
}

// Initial mock data to ensure rich presentation without empty space
export const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Budi_Gamer', avatar: 'detective', level: 12, points: 2450, isReady: true, isHost: true, role: 'SIVIL', word: 'PIZZA', isEliminated: false, votesReceived: 0 },
  { id: '2', name: 'Si_Paling_Seket', avatar: 'cat', level: 14, points: 1980, isReady: true, isHost: false, role: 'UNDERCOVER', word: 'MARTABAK', isEliminated: false, votesReceived: 0 },
  { id: '3', name: 'Felix', avatar: 'boy1', level: 8, points: 1220, isReady: true, isHost: false, role: 'SIVIL', word: 'PIZZA', isEliminated: false, votesReceived: 2 },
  { id: '4', name: 'Anya', avatar: 'girl1', level: 19, points: 3100, isReady: true, isHost: false, role: 'UNDERCOVER', word: 'MARTABAK', isEliminated: false, votesReceived: 0 },
  { id: '5', name: 'Budi (Alpaca)', avatar: 'boy2', level: 11, points: 1540, isReady: true, isHost: false, role: 'SIVIL', word: 'PIZZA', isEliminated: false, votesReceived: 0 },
  { id: '6', name: 'Agent_Frost', avatar: 'sci-fi', level: 35, points: 5120, isReady: false, isHost: false, role: 'MR_WHITE', word: '???', isEliminated: false, votesReceived: 0 },
  { id: '7', name: 'Ratu_Intel', avatar: 'glasses-girl', level: 5, points: 740, isReady: false, isHost: false, role: 'SIVIL', word: 'PIZZA', isEliminated: true, votesReceived: 0 },
  { id: '8', name: 'Agen_Rahasia', avatar: 'monster', level: 15, points: 2150, isReady: false, isHost: false, role: 'SIVIL', word: 'PIZZA', isEliminated: false, votesReceived: 1 }
];

export const MOCK_CLUES: Clue[] = [
  {
    id: 'c1',
    playerName: 'Felix',
    avatar: 'boy1',
    clueTextID: 'Ini adalah sesuatu yang bisa dimakan siang hari.',
    clueTextEN: "It's something you can eat for lunch."
  },
  {
    id: 'c2',
    playerName: 'Anya',
    avatar: 'girl1',
    clueTextID: 'Bentuknya biasanya bulat atau segitiga.',
    clueTextEN: "It's usually round or triangular."
  },
  {
    id: 'c3',
    playerName: 'Budi (Alpaca)',
    avatar: 'boy2',
    clueTextID: 'Ada banyak topingnya.',
    clueTextEN: 'It has many toppings.'
  }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderName: 'Felix',
    messageID: 'Sepertinya Budi terlalu spesifik bilang soal toping...',
    messageEN: 'Looks like Budi was too specific about the toppings...',
    isMe: false,
    avatar: 'boy1'
  },
  {
    id: 'm2',
    senderName: 'Anya',
    messageID: 'Setuju! Pizza dan Martabak dua-duanya punya toping, tapi Budi mencurigakan.',
    messageEN: 'Agreed! Both Pizza and Martabak have toppings, but Budi is suspicious.',
    isMe: false,
    avatar: 'girl1'
  }
];

export const MOCK_MATCH_HISTORY: MatchHistory[] = [
  {
    id: 'h1',
    date: '24 May 2026',
    mode: 'Classic',
    rounds: 5,
    role: 'Sipil / Civilian',
    secretWordCivilian: 'Kopi / Coffee',
    secretWordUndercover: 'Susu / Latte',
    pointsEarned: 120,
    isWin: true
  },
  {
    id: 'h2',
    date: '22 May 2026',
    mode: 'Blitz',
    rounds: 3,
    role: 'Penyamar / Undercover',
    secretWordCivilian: 'Apel / Apple',
    secretWordUndercover: 'Pir / Pear',
    pointsEarned: -40,
    isWin: false
  },
  {
    id: 'h3',
    date: '20 May 2026',
    mode: 'Classic',
    rounds: 8,
    role: 'Mata-mata / Spy',
    secretWordCivilian: 'Pizza',
    secretWordUndercover: '??? / Unknown',
    pointsEarned: 250,
    isWin: true
  }
];

export const MOCK_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_det',
    category: 'character',
    nameID: 'Detektif Budi',
    nameEN: 'Detective Budi',
    descriptionID: 'Mata tajam, mengendus kebohongan seketika.',
    descriptionEN: 'Sharp eyes, sniffs out lies instantly.',
    cost: 500,
    rarity: 'RARE',
    avatarSvg: 'detective'
  },
  {
    id: 'shop_spy',
    category: 'character',
    nameID: 'Mata-Mata',
    nameEN: 'The Spy',
    descriptionID: 'Sangat andal menyamar tanpa suara.',
    descriptionEN: 'Masters the art of silent infiltration.',
    cost: 750,
    rarity: 'EPIC',
    avatarSvg: 'spy'
  },
  {
    id: 'shop_vil',
    category: 'character',
    nameID: 'Penjahat Berdasi',
    nameEN: 'The Villain',
    descriptionID: 'Mata satu dengan kerah ruff klasik abad 18.',
    descriptionEN: 'One-eyed master with an 18th-century ruff collar.',
    cost: 600,
    rarity: 'EPIC',
    avatarSvg: 'villain'
  },
  {
    id: 'shop_hack',
    category: 'character',
    nameID: 'Peretas Kripto',
    nameEN: 'The Hacker',
    descriptionID: 'Melihat kode di balik setiap kalimat.',
    descriptionEN: 'Sees the cipher behind every sentence.',
    cost: 900,
    rarity: 'LEGENDARY',
    avatarSvg: 'hacker'
  },
  {
    id: 'pack_world',
    category: 'wordpack',
    nameID: 'Kuliner Dunia',
    nameEN: 'Global Cuisine',
    descriptionID: '150+ Kata baru kuliner lezat dari seluruh dunia.',
    descriptionEN: '150+ new delicious food words from raw culinary arts.',
    cost: 300
  },
  {
    id: 'pack_space',
    category: 'wordpack',
    nameID: 'Ruang Angkasa',
    nameEN: 'Deep Space',
    descriptionID: 'Kata rahasia bertema astronomi dan teknologi fiksi ilmiah.',
    descriptionEN: 'Secret words themed around outer space, stars, and sci-fi technology.',
    cost: 400
  },
  {
    id: 'emo_fire',
    category: 'emoji',
    nameID: 'Api Membara',
    nameEN: 'Burning Flame',
    cost: 50,
    imgUrl: '🔥'
  },
  {
    id: 'emo_conf',
    category: 'emoji',
    nameID: 'Berpikir Keras',
    nameEN: 'Thinking',
    cost: 50,
    imgUrl: '🤔'
  },
  {
    id: 'emo_skull',
    category: 'emoji',
    nameID: 'Tengkorak',
    nameEN: 'Skull',
    cost: 50,
    imgUrl: '💀'
  },
  {
    id: 'emo_diam',
    category: 'emoji',
    nameID: 'Berlian Biru',
    nameEN: 'Blue Diamond',
    cost: 150,
    imgUrl: '💎'
  },
  {
    id: 'emo_pizza',
    category: 'emoji',
    nameID: 'Potongan Pizza',
    nameEN: 'Pizza Slice',
    cost: 75,
    imgUrl: '🍕'
  },
  {
    id: 'emo_clown',
    category: 'emoji',
    nameID: 'Sirkus Badut',
    nameEN: 'Clown Circus',
    cost: 50,
    imgUrl: '🤡'
  }
];

export const MOCK_LEADER_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'SHADOW_MASTER', avatarID: 'ninja', avatarSvg: 'ninja', points: 150200, level: 99 },
  { rank: 2, name: 'Agent_Frost', avatarID: 'sci-fi', avatarSvg: 'sci-fi', points: 128450, level: 88 },
  { rank: 3, name: 'Techno_Ghost', avatarID: 'girl2', avatarSvg: 'girl2', points: 98100, level: 64 },
  { rank: 4, name: 'Silent_Reaper', avatarID: 'monk', avatarSvg: 'monk', points: 89400, level: 85 },
  { rank: 5, name: 'Detektif Budi', avatarID: 'detective', avatarSvg: 'detective', points: 45320, level: 12, isYou: true },
  { rank: 6, name: 'Cyber_Samurai', avatarID: 'samurai', avatarSvg: 'samurai', points: 82900, level: 74 }
];
