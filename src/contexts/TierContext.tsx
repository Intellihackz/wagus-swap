"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserTier, TierContextType, SwapFeeCalculation, TierBenefits, UserProfile } from '@/types/theme';
import { TIER_BENEFITS, getTierBenefits, calculateFeeDiscount } from '@/constants/themes';
import { useAdmin } from './AdminContext';

const TierContext = createContext<TierContextType | undefined>(undefined);

interface TierProviderProps {
  children: ReactNode;
  walletAddress?: string;
}

export function TierProvider({ children, walletAddress }: TierProviderProps) {
  const [userTier, setUserTier] = useState<UserTier>(UserTier.EXPLORER);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdminMode, adminTier } = useAdmin();

  // Load user tier from localStorage or API
  useEffect(() => {
    if (walletAddress) {
      loadUserProfile(walletAddress);
    } else {
      // Reset to free tier when wallet disconnected
      setUserTier(UserTier.FREE);
      setUserProfile(null);
    }
  }, [walletAddress]);

  const loadUserProfile = async (address: string) => {
    try {
      setIsLoading(true);
      
      // Try to load from localStorage first
      const savedProfile = localStorage.getItem(`wagus-profile-${address}`);
      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setUserTier(profile.tier);
      } else {
        // Create new profile for first-time user
        const newProfile: UserProfile = {
          walletAddress: address,
          tier: UserTier.FREE,
          selectedTheme: 'wagus-dark',
          totalSwaps: 0,
          totalFeesSaved: 0,
          joinDate: new Date(),
          preferences: {
            defaultTheme: 'wagus-dark',
            autoThemeSwitch: false,
            notifications: true
          }
        };
        setUserProfile(newProfile);
        setUserTier(UserTier.FREE);
        saveUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem(`wagus-profile-${profile.walletAddress}`, JSON.stringify(profile));
  };

  const upgradeTier = async (newTier: UserTier): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const tierBenefits = getTierBenefits(newTier);
      if (!tierBenefits) {
        throw new Error('Invalid tier');
      }

      // In admin mode, allow any tier upgrade
      if (isAdminMode) {
        setUserTier(newTier);
        if (userProfile) {
          const updatedProfile: UserProfile = {
            ...userProfile,
            tier: newTier
          };
          setUserProfile(updatedProfile);
          saveUserProfile(updatedProfile);
        }
        return true;
      }

      // For non-admin users, check if tier requires purchase
      if (tierBenefits.price && tierBenefits.price > 0) {
        // In a real app, this would trigger a payment flow
        alert(`This tier requires purchase of $${tierBenefits.price}. Payment integration would be implemented here.`);
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Update user profile
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          tier: newTier
        };
        setUserProfile(updatedProfile);
        setUserTier(newTier);
        saveUserProfile(updatedProfile);
      }
      
      return true;
    } catch (error) {
      console.error('Error upgrading tier:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFeeDiscount = (amount: number): SwapFeeCalculation => {
    const baseFeePercentage = 0.003; // 0.3% base fee
    const baseFee = amount * baseFeePercentage;
    
    // Use admin tier if in admin mode, otherwise use user tier
    const effectiveTier = isAdminMode ? adminTier : userTier;
    const tierBenefits = getTierBenefits(effectiveTier);
    const discountPercentage = tierBenefits?.feeDiscount || 0;
    
    const savings = (baseFee * discountPercentage) / 100;
    const finalFee = baseFee - savings;
    
    return {
      baseFee,
      tierDiscount: discountPercentage,
      finalFee,
      savings,
      discountPercentage
    };
  };

  const getTierProgress = () => {
    const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
    const currentIndex = tierOrder.indexOf(userTier);
    const nextTier = tierOrder[currentIndex + 1];
    
    if (!nextTier) {
      // Already at max tier
      return { current: 100, next: 100, progress: 100 };
    }
    
    const currentBenefits = getTierBenefits(userTier);
    const nextBenefits = getTierBenefits(nextTier);
    
    // Calculate progress based on swaps or other metrics
    // For now, we'll use a simple calculation
    const swapsForNextTier = (currentIndex + 1) * 10; // Example: 10, 20, 30, 40 swaps
    const currentSwaps = userProfile?.totalSwaps || 0;
    const progress = Math.min((currentSwaps / swapsForNextTier) * 100, 100);
    
    return {
      current: currentBenefits?.feeDiscount || 0,
      next: nextBenefits?.feeDiscount || 0,
      progress
    };
  };

  const updateSwapStats = (feesSaved: number) => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        totalSwaps: userProfile.totalSwaps + 1,
        totalFeesSaved: userProfile.totalFeesSaved + feesSaved
      };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
    }
  };

  const value: TierContextType = {
    userTier: isAdminMode ? adminTier : userTier,
    tierBenefits: TIER_BENEFITS,
    upgradeTier,
    calculateFeeDiscount,
    getTierProgress
  };

  return (
    <TierContext.Provider value={value}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier(): TierContextType {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}

// Additional hooks for specific tier functionality
export function useTierBenefits(tier?: UserTier) {
  const { userTier } = useTier();
  const targetTier = tier || userTier;
  return getTierBenefits(targetTier);
}

export function useCanUpgrade() {
  const { userTier } = useTier();
  const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
  const currentIndex = tierOrder.indexOf(userTier);
  return currentIndex < tierOrder.length - 1;
}

export function useNextTier() {
  const { userTier } = useTier();
  const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
  const currentIndex = tierOrder.indexOf(userTier);
  const nextTier = tierOrder[currentIndex + 1];
  return nextTier ? getTierBenefits(nextTier) : null;
}