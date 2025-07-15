import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';

import { getTheme } from './index';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultMode = 'dark' }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('themeMode') as ThemeMode) || defaultMode);

  useEffect(() => {
    // Check for system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setMode(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial theme based on system preference if no theme is set
    if (!localStorage.getItem('themeMode')) {
      setMode(mediaQuery.matches ? 'dark' : 'light');
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const contextValue = useMemo(
    () =>
      ({
        mode,
        toggleTheme,
        setMode: (newMode: ThemeMode) => {
          localStorage.setItem('themeMode', newMode);
          setMode(newMode);
        },
      }) satisfies ThemeContextType,
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
