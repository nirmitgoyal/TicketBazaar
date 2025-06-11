import React, { createContext, useContext, ReactNode } from 'react';
import { useSunsetTheme } from '@/hooks/use-sunset-theme';

interface ThemeContextType {
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  location: { latitude: number; longitude: number } | null;
  sunsetData: { sunset: string; sunrise: string } | null;
  toggleTheme: () => void;
  isDarkTime: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeData = useSunsetTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}