/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WordPair {
  civilian: string;
  undercover: string;
}

export const WORD_PACKS: Record<string, WordPair[]> = {
  pack_food: [
    { civilian: "RENDANG", undercover: "GULAI" },
    { civilian: "MARTABAK MANIS", undercover: "MARTABAK TELUR" },
    { civilian: "NASI GORENG", undercover: "MIE GORENG" },
    { civilian: "SATE AYAM", undercover: "SATE KAMBING" },
    { civilian: "BAKSO", undercover: "MIE AYAM" },
    { civilian: "GADO-GADO", undercover: "KETOPRAK" },
    { civilian: "PEMPEK", undercover: "OTAK-OTAK" },
    { civilian: "TEMPE GORENG", undercover: "TAHU GORENG" },
    { civilian: "BUBUR DIADUK", undercover: "BUBUR TIDAK DIADUK" },
    { civilian: "ES TEH MANIS", undercover: "TEH MANIS HANGAT" },
    { civilian: "SOTO AYAM", undercover: "SOP BUNTUT" },
    { civilian: "KENTANG GORENG", undercover: "UBI GORENG" }
  ],
  pack_cuisine: [
    { civilian: "PIZZA", undercover: "PASTA" },
    { civilian: "BURGER", undercover: "SANDWICH" },
    { civilian: "SUSHI", undercover: "SASHIMI" },
    { civilian: "TACO", undercover: "BURRITO" },
    { civilian: "CROISSANT", undercover: "BAGUETTE" },
    { civilian: "RAMEN", undercover: "UDON" },
    { civilian: "STEAK", undercover: "BARBEQUE" },
    { civilian: "DIMSUM", undercover: "PAOPAO" },
    { civilian: "MACARON", undercover: "CUPCAKE" },
    { civilian: "HOTDOG", undercover: "SOSIS" }
  ],
  pack_space: [
    { civilian: "ASTRONOT", undercover: "KOSMONOT" },
    { civilian: "ROKET", undercover: "PESAWAT LUAR ANGKASA" },
    { civilian: "PLANET MARS", undercover: "PLANET VENUS" },
    { civilian: "MATAHARI", undercover: "BINTANG" },
    { civilian: "BULAN", undercover: "SATELIT" },
    { civilian: "GALAKSI", undercover: "NEBULA" },
    { civilian: "ALIEN", undercover: "MONSTER" },
    { civilian: "TELESKOP", undercover: "TEROPONG" },
    { civilian: "GRAVITASI", undercover: "MEDAN MAGNET" },
    { civilian: "ASTEROID", undercover: "KOMET" }
  ]
};

export function getRandomWordPair(packId: string): WordPair {
  const list = WORD_PACKS[packId] || WORD_PACKS['pack_food'];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
