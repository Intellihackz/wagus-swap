"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserTier } from '@/types/theme';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  adminTier: UserTier;
  setAdminTier: (tier: UserTier) => void;
  adminWalletConnected: boolean;
  setAdminWalletConnected: (connected: boolean) => void;
  resetAdminState: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTier, setAdminTier] = useState<UserTier>(UserTier.LEGEND);
  const [adminWalletConnected, setAdminWalletConnected] = useState(true);

  // Load admin state from localStorage
  useEffect(() => {
    const savedAdminMode = localStorage.getItem('wagus-admin-mode');
    const savedAdminTier = localStorage.getItem('wagus-admin-tier');
    const savedWalletState = localStorage.getItem('wagus-admin-wallet');
    
    if (savedAdminMode === 'true') {
      setIsAdminMode(true);
    }
    if (savedAdminTier) {
      setAdminTier(savedAdminTier as UserTier);
    }
    if (savedWalletState) {
      setAdminWalletConnected(savedWalletState === 'true');
    }
  }, []);

  const toggleAdminMode = () => {
    const newAdminMode = !isAdminMode;
    setIsAdminMode(newAdminMode);
    localStorage.setItem('wagus-admin-mode', newAdminMode.toString());
    
    if (newAdminMode) {
      console.log('🔧 Admin mode enabled - All features unlocked');
    } else {
      console.log('👤 Admin mode disabled - Normal user experience');
    }
  };

  const handleSetAdminTier = (tier: UserTier) => {
    setAdminTier(tier);
    localStorage.setItem('wagus-admin-tier', tier);
    console.log(`🎯 Admin tier set to: ${tier}`);
  };

  const handleSetAdminWalletConnected = (connected: boolean) => {
    setAdminWalletConnected(connected);
    localStorage.setItem('wagus-admin-wallet', connected.toString());
    console.log(`💰 Admin wallet ${connected ? 'connected' : 'disconnected'}`);
  };

  const resetAdminState = () => {
    setIsAdminMode(false);
    setAdminTier(UserTier.LEGEND);
    setAdminWalletConnected(true);
    localStorage.removeItem('wagus-admin-mode');
    localStorage.removeItem('wagus-admin-tier');
    localStorage.removeItem('wagus-admin-wallet');
    console.log('🔄 Admin state reset');
  };

  const value: AdminContextType = {
    isAdminMode,
    toggleAdminMode,
    adminTier,
    setAdminTier: handleSetAdminTier,
    adminWalletConnected,
    setAdminWalletConnected: handleSetAdminWalletConnected,
    resetAdminState
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Hook to check if admin mode is active
export function useIsAdminMode(): boolean {
  const { isAdminMode } = useAdmin();
  return isAdminMode;
}

// Hook to get effective user state (admin override or real state)
export function useEffectiveUserState() {
  const { isAdminMode, adminTier, adminWalletConnected } = useAdmin();
  
  return {
    isAdminMode,
    effectiveTier: isAdminMode ? adminTier : undefined,
    effectiveWalletConnected: isAdminMode ? adminWalletConnected : undefined
  };
}