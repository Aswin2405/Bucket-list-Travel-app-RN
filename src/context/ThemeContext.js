import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/theme';

const THEME_STORAGE_KEY = 'themeMode';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system, else 'light' | 'dark'

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setOverride(saved);
    });
  }, []);

  const isDark = override ? override === 'dark' : systemScheme === 'dark';

  const toggleTheme = useCallback(() => {
    setOverride((prev) => {
      const currentIsDark = prev ? prev === 'dark' : systemScheme === 'dark';
      const next = currentIsDark ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, [systemScheme]);

  const useSystemTheme = useCallback(() => {
    setOverride(null);
    AsyncStorage.removeItem(THEME_STORAGE_KEY).catch(() => {});
  }, []);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, isDark, toggleTheme, useSystemTheme, isSystemTheme: override === null }),
    [colors, isDark, toggleTheme, useSystemTheme, override]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
