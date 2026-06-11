/**
 * useEconomy.ts — Shop & Economy State Manager
 * Manages wallet balance and inventory, syncing with server for logged-in users.
 */

import { useState, useEffect, useCallback } from 'react';
import { ShopItem, MOCK_SHOP_ITEMS } from '../types';

const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:5000';

interface EconomyState {
  coins: number;
  ownedItemIds: string[];
  isLoading: boolean;
  error: string | null;
}

interface UseEconomyReturn {
  coins: number;
  ownedItemIds: string[];
  isLoading: boolean;
  error: string | null;
  purchaseItem: (item: ShopItem) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  addCoinsReward: (amount: number) => Promise<void>;
}

// Default starting state for guests
const DEFAULT_COINS = 500;
const DEFAULT_OWNED: string[] = [];

export function useEconomy(
  currentUser: { id: string | number; coins?: number } | null
): UseEconomyReturn {
  const [state, setState] = useState<EconomyState>({
    coins: currentUser?.coins ?? DEFAULT_COINS,
    ownedItemIds: DEFAULT_OWNED,
    isLoading: false,
    error: null,
  });

  // Fetch wallet & inventory from server
  const refreshData = useCallback(async () => {
    if (!currentUser?.id) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem('secretify_token');

      // Fetch wallet
      const walletRes = await fetch(`${SERVER_URL}/api/economy/wallet/${currentUser.id}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setState((prev) => ({ ...prev, coins: walletData.coins ?? DEFAULT_COINS }));
      }

      // Fetch inventory
      const invRes = await fetch(`${SERVER_URL}/api/economy/inventory/${currentUser.id}`);
      if (invRes.ok) {
        const invData = await invRes.json();
        setState((prev) => ({ ...prev, ownedItemIds: invData.inventory || DEFAULT_OWNED }));
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      console.error('[useEconomy] Failed to fetch economy data:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load economy data.',
      }));
    }
  }, [currentUser?.id]);

  // Load economy data on mount or user change
  useEffect(() => {
    if (currentUser?.id) {
      refreshData();
    } else {
      // Guest mode — reset to defaults
      setState({
        coins: DEFAULT_COINS,
        ownedItemIds: DEFAULT_OWNED,
        isLoading: false,
        error: null,
      });
    }
  }, [currentUser?.id, refreshData]);

  // Purchase an item
  const purchaseItem = useCallback(
    async (item: ShopItem): Promise<{ success: boolean; error?: string }> => {
      // Check if already owned
      if (state.ownedItemIds.includes(item.id)) {
        return { success: false, error: 'Item sudah dimiliki. / Already owned.' };
      }

      // Check balance
      if (state.coins < item.cost) {
        return { success: false, error: 'Koin tidak cukup. / Not enough coins.' };
      }

      if (!currentUser?.id) {
        // Guest mode — local-only purchase (not persisted)
        setState((prev) => ({
          ...prev,
          coins: prev.coins - item.cost,
          ownedItemIds: [...prev.ownedItemIds, item.id],
        }));
        return { success: true };
      }

      // Logged-in user — server-side purchase
      try {
        const token = localStorage.getItem('secretify_token');
        const res = await fetch(`${SERVER_URL}/api/economy/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemId: item.id, cost: item.cost }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || 'Purchase failed.' };
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          coins: data.coins,
          ownedItemIds: [...prev.ownedItemIds, data.itemId],
        }));

        // Also update localStorage user object
        const savedUser = localStorage.getItem('secretify_user');
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          userObj.coins = data.coins;
          localStorage.setItem('secretify_user', JSON.stringify(userObj));
        }

        return { success: true };
      } catch (err) {
        console.error('[useEconomy] Purchase failed:', err);
        return { success: false, error: 'Network error. / Gagal terhubung.' };
      }
    },
    [currentUser?.id, state.coins, state.ownedItemIds]
  );

  // Add coins reward (after winning a game, etc.)
  const addCoinsReward = useCallback(
    async (amount: number) => {
      if (!currentUser?.id || amount <= 0) return;

      try {
        const token = localStorage.getItem('secretify_token');
        const res = await fetch(`${SERVER_URL}/api/economy/add-coins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        });

        if (res.ok) {
          const data = await res.json();
          setState((prev) => ({ ...prev, coins: data.coins }));

          // Update localStorage
          const savedUser = localStorage.getItem('secretify_user');
          if (savedUser) {
            const userObj = JSON.parse(savedUser);
            userObj.coins = data.coins;
            localStorage.setItem('secretify_user', JSON.stringify(userObj));
          }
        }
      } catch (err) {
        console.error('[useEconomy] Add coins reward failed:', err);
      }
    },
    [currentUser?.id]
  );

  return {
    coins: state.coins,
    ownedItemIds: state.ownedItemIds,
    isLoading: state.isLoading,
    error: state.error,
    purchaseItem,
    refreshData,
    addCoinsReward,
  };
}
