/**
 * db.ts — Secretify Supabase Client Module
 * Initializes the Supabase client and exports it alongside utility functions.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[DB WARNING] Supabase URL or Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // For server-side environments
  }
});

/**
 * Calculate level based on total points
 */
export function calculateLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

/**
 * Calculate points awarded for winning/losing
 */
export function calcPointsGained(
  role: string,
  winnerGroup: string,
  isWinner: boolean
): number {
  if (isWinner) {
    if (winnerGroup === 'CIVILIANS' && role === 'SIVIL') return 120;
    if (winnerGroup === 'UNDERCOVERS' && role === 'UNDERCOVER') return 150;
    if (winnerGroup === 'MR_WHITE' && role === 'MR_WHITE') return 200;
    if (winnerGroup === 'CLOWN') return 180; // Happy Clown special win
  }
  return 30; // Participation points
}
