import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bucketListApi from '../api/bucketListApi';
import { useAuth } from './AuthContext';

const BucketListContext = createContext(null);

// Last-known list, persisted so the app can render instantly on launch (offline-
// first) while the network refresh runs in the background. Cleared on logout so
// a different user on the same device never sees the previous user's trips.
const ITEMS_CACHE_KEY = 'cache:bucketListItems';

export function BucketListProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await bucketListApi.getItems();
      setItems(data);
      // Persist the fresh snapshot for the next cold start.
      AsyncStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(data)).catch(() => {});
    } catch (err) {
      setError(err.message || 'Failed to load bucket list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (isAuthenticated) {
      (async () => {
        // 1. Paint cached items immediately (no spinner) if we have them.
        try {
          const cached = await AsyncStorage.getItem(ITEMS_CACHE_KEY);
          if (active && cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setItems(parsed);
              setLoading(false);
            }
          }
        } catch (err) {
          // ignore malformed cache; the refresh below is the source of truth
        }
        // 2. Refresh from the network (updates state + cache).
        if (active) refresh();
      })();
    } else {
      setItems([]);
      setLoading(false);
      AsyncStorage.removeItem(ITEMS_CACHE_KEY).catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, refresh]);

  const addItem = useCallback(async (payload) => {
    const created = await bucketListApi.createItem(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleTask = useCallback(async (itemId, taskId) => {
    const updated = await bucketListApi.toggleTask(itemId, taskId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const completeItem = useCallback(async (itemId) => {
    const updated = await bucketListApi.completeItem(itemId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const shareItem = useCallback(async (itemId, email) => {
    const updated = await bucketListApi.shareItem(itemId, email);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const unshareItem = useCallback(async (itemId, userId) => {
    const updated = await bucketListApi.unshareItem(itemId, userId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const updateItem = useCallback(async (itemId, payload) => {
    const updated = await bucketListApi.updateItem(itemId, payload);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const addPackingItems = useCallback(async (itemId, packItems, source) => {
    const updated = await bucketListApi.addPackingItems(itemId, packItems, source);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const togglePackingItem = useCallback(async (itemId, packId) => {
    const updated = await bucketListApi.togglePackingItem(itemId, packId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const deletePackingItem = useCallback(async (itemId, packId) => {
    const updated = await bucketListApi.deletePackingItem(itemId, packId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const addExpense = useCallback(async (itemId, description, amount) => {
    const updated = await bucketListApi.addExpense(itemId, description, amount);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const deleteExpense = useCallback(async (itemId, expenseId) => {
    const updated = await bucketListApi.deleteExpense(itemId, expenseId);
    setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    return updated;
  }, []);

  const value = {
    items,
    loading,
    error,
    refresh,
    addItem,
    toggleTask,
    completeItem,
    shareItem,
    unshareItem,
    updateItem,
    addPackingItems,
    togglePackingItem,
    deletePackingItem,
    addExpense,
    deleteExpense,
  };

  return <BucketListContext.Provider value={value}>{children}</BucketListContext.Provider>;
}

export function useBucketList() {
  const ctx = useContext(BucketListContext);
  if (!ctx) throw new Error('useBucketList must be used within a BucketListProvider');
  return ctx;
}
