-- ============================================================
-- SECRETIFY ECONOMY SYSTEM — Database Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add coins column to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 500;

-- Set existing users to 500 coins (welcome bonus)
UPDATE users SET coins = 500 WHERE coins IS NULL;

-- 2. Create user_inventory table to track purchased items
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item ON user_inventory(item_id);

-- 4. Row Level Security (RLS) policies
-- Enable RLS on user_inventory
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
CREATE POLICY "Users can view own inventory" ON user_inventory
  FOR SELECT USING (true);

-- Allow inserts (server-side via service role key bypasses RLS)
DROP POLICY IF EXISTS "Users can insert own inventory" ON user_inventory;
CREATE POLICY "Users can insert own inventory" ON user_inventory
  FOR INSERT WITH CHECK (true);

-- Allow deletes (for refunds, etc.)
DROP POLICY IF EXISTS "Users can delete own inventory" ON user_inventory;
CREATE POLICY "Users can delete own inventory" ON user_inventory
  FOR DELETE USING (true);
