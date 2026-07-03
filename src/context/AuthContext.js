import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';
import { clearMemoryCache } from '../utils/memoryCache';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from '../constants/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY]).then((entries) => {
      const [, token] = entries[0];
      const [, storedUser] = entries[1];
      if (token && storedUser) setUser(JSON.parse(storedUser));
      setInitializing(false);
    });
  }, []);

  const persistSession = useCallback(async (data) => {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_STORAGE_KEY, data.token],
      [AUTH_USER_STORAGE_KEY, JSON.stringify(data.user)],
    ]);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (name, email, password) => {
      const data = await authApi.signup(name, email, password);
      await persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      await persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    // Tell the server first (best-effort), but always clear the local session
    // even if the request fails so logout works offline.
    try {
      await authApi.logout();
    } catch (err) {
      // ignore network/auth errors on logout
    }
    await AsyncStorage.multiRemove([AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY]);
    clearMemoryCache();
    setUser(null);
  }, []);

  const updateAvatar = useCallback(async (avatar) => {
    const { user: updated } = await authApi.updateProfile({ avatar });
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const value = { user, initializing, isAuthenticated: !!user, signup, login, logout, updateAvatar };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
