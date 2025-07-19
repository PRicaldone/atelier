/**
 * Theme Provider - Global theme management
 * Provides theme context with light/dark mode support
 */

import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Theme store with persistence
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setTheme: (theme) => set({ theme }),
      isDark: () => get().theme === 'dark'
    }),
    {
      name: 'ATELIER_THEME',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// Theme context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { theme, toggleTheme, setTheme, isDark } = useThemeStore();

  // Apply theme to document body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark());
  }, [theme, isDark]);

  // Expose theme utilities globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__atelierUI = window.__atelierUI || {};
      window.__atelierUI.toggleTheme = toggleTheme;
      window.__atelierUI.setTheme = setTheme;
      window.__atelierUI.getTheme = () => theme;
    }
  }, [theme, toggleTheme, setTheme]);

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDark: isDark()
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;