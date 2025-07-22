"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, UserTier, ThemeContextType } from '@/types/theme';
import { THEMES, DEFAULT_THEME_ID, getThemeById, getThemesByTier } from '@/constants/themes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  userTier?: UserTier;
}

export function ThemeProvider({ children, userTier = UserTier.FREE }: ThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getThemeById(DEFAULT_THEME_ID)!);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wagus-theme');
    if (savedTheme && canUseTheme(savedTheme)) {
      setCurrentThemeId(savedTheme);
      const theme = getThemeById(savedTheme);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, [userTier]);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply effect classes
    const body = document.body;
    body.classList.toggle('glassmorphism', theme.effects.glassmorphism);
    body.classList.toggle('animations-enabled', theme.effects.animations);
    body.classList.toggle('gradients-enabled', theme.effects.gradients);
    body.classList.toggle('shadows-enabled', theme.effects.shadows);

    // Set theme data attribute for CSS targeting
    body.setAttribute('data-theme', theme.id);
  }, [currentTheme]);

  const switchTheme = (themeId: string) => {
    if (!canUseTheme(themeId)) {
      console.warn(`Theme ${themeId} is not available for tier ${userTier}`);
      return;
    }

    const theme = getThemeById(themeId);
    if (theme) {
      setCurrentThemeId(themeId);
      setCurrentTheme(theme);
      localStorage.setItem('wagus-theme', themeId);
    }
  };

  const canUseTheme = (themeId: string): boolean => {
    const theme = getThemeById(themeId);
    if (!theme) return false;

    const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
    const userTierIndex = tierOrder.indexOf(userTier);
    const themeTierIndex = tierOrder.indexOf(theme.requiredTier);

    return themeTierIndex <= userTierIndex;
  };

  const value: ThemeContextType = {
    currentTheme,
    availableThemes: THEMES,
    userTier,
    switchTheme,
    canUseTheme,
    getThemesByTier
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting theme-aware styles
export function useThemeStyles() {
  const { currentTheme } = useTheme();
  
  return {
    // Background styles
    background: {
      backgroundColor: currentTheme.colors.background,
      backgroundImage: currentTheme.effects.gradients ? currentTheme.colors.gradient : undefined
    },
    surface: {
      backgroundColor: currentTheme.colors.surface,
      border: `1px solid ${currentTheme.colors.border}`,
      boxShadow: currentTheme.effects.shadows ? currentTheme.colors.shadow : undefined
    },
    surfaceGlass: currentTheme.effects.glassmorphism ? {
      backgroundColor: `${currentTheme.colors.surface}80`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${currentTheme.colors.border}40`
    } : {
      backgroundColor: currentTheme.colors.surface,
      border: `1px solid ${currentTheme.colors.border}`
    },
    // Text styles
    text: {
      color: currentTheme.colors.text
    },
    textSecondary: {
      color: currentTheme.colors.textSecondary
    },
    textMuted: {
      color: currentTheme.colors.textMuted
    },
    // Button styles
    primaryButton: {
      backgroundColor: currentTheme.colors.primary,
      color: currentTheme.colors.primaryForeground,
      border: 'none',
      boxShadow: currentTheme.effects.shadows ? currentTheme.colors.shadow : undefined,
      backgroundImage: currentTheme.effects.gradients ? currentTheme.colors.gradient : undefined
    },
    // Utility functions
    getGlowStyle: (color?: string) => currentTheme.effects.shadows ? {
      boxShadow: `0 0 20px ${color || currentTheme.colors.primary}40`
    } : {},
    getHoverStyle: (baseColor: string) => ({
      backgroundColor: `${baseColor}10`,
      transform: currentTheme.effects.animations ? 'translateY(-1px)' : undefined,
      transition: currentTheme.effects.animations ? 'all 0.2s ease' : undefined
    })
  };
}