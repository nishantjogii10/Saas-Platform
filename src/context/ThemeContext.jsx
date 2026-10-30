import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from './AppContext';

export const THEME_MODES = [
  {
    id: 'light',
    label: 'Light Mode',
    shortLabel: 'Light',
    description: 'Clean architectural paper with high-contrast slate typography',
    icon: 'Sun',
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    shortLabel: 'Dark',
    description: 'Deep forest-green and charcoal with luminous emerald accents',
    icon: 'Moon',
  },
  {
    id: 'system',
    label: 'System Default',
    shortLabel: 'System',
    description: 'Automatically synchronizes with your device theme preference',
    icon: 'Monitor',
  },
];

const ThemeContext = createContext({
  mode: 'light', // 'light' | 'dark' | 'system'
  effectiveTheme: 'light', // 'light' | 'dark'
  setMode: () => {},
  isDark: false,
  availableModes: THEME_MODES,
});

const getSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getUserStorageKey = (userId) => {
  return userId ? `stockmate_user_theme_${userId}` : 'stockmate_default_theme';
};

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useApp();
  const userId = currentUser?.id || null;

  // Resolve initial mode for current user
  const [mode, setModeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const activeKey = getUserStorageKey(userId);
      const savedMode = localStorage.getItem(activeKey);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        return savedMode;
      }
    } catch {
      // Fallback to light
    }
    return 'light';
  });

  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  // Listen to OS / Browser system appearance changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // When currentUser changes (login/logout/switch user), reload that user's saved theme preference
  useEffect(() => {
    try {
      const userKey = getUserStorageKey(userId);
      const savedUserMode = localStorage.getItem(userKey);
      if (savedUserMode && (savedUserMode === 'light' || savedUserMode === 'dark' || savedUserMode === 'system')) {
        setModeState(savedUserMode);
      } else {
        // Default to 'light' for users without a saved preference
        setModeState('light');
      }

      if (userId) {
        localStorage.setItem('stockmate_active_user_id', userId);
      } else {
        localStorage.removeItem('stockmate_active_user_id');
      }
    } catch {
      // Fallback
    }
  }, [userId]);

  // Compute effective theme ('light' or 'dark')
  const effectiveTheme = useMemo(() => {
    if (mode === 'system') {
      return systemPreference;
    }
    return mode;
  }, [mode, systemPreference]);

  // Synchronize document attributes & classes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);
    root.setAttribute('data-theme-mode', mode);

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme, mode]);

  // Set mode handler
  const setMode = useCallback(
    (newMode) => {
      if (newMode !== 'light' && newMode !== 'dark' && newMode !== 'system') return;
      setModeState(newMode);
      try {
        const userKey = getUserStorageKey(userId);
        localStorage.setItem(userKey, newMode);
        // Also save fallback default
        localStorage.setItem('stockmate_theme_mode', newMode);
        const resolved = newMode === 'system' ? getSystemPreference() : newMode;
        localStorage.setItem('stockmate_effective_theme', resolved);
      } catch {
        // Storage unavailable
      }
    },
    [userId]
  );

  const isDark = effectiveTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: effectiveTheme,
        effectiveTheme,
        setMode,
        isDark,
        availableModes: THEME_MODES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
