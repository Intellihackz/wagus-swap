import { Theme, UserTier, TierBenefits } from '@/types/theme';

export const THEMES: Theme[] = [
  {
    id: 'wagus-dark',
    name: 'WAGUS Dark',
    description: 'The signature WAGUS dark theme with electric blue accents',
    requiredTier: UserTier.EXPLORER,
    isPremium: false,
    colors: {
      background: '#0a0a0a',
      backgroundSecondary: '#111111',
      backgroundTertiary: '#1a1a1a',
      surface: '#1e1e1e',
      surfaceSecondary: '#2a2a2a',
      surfaceHover: '#333333',
      text: '#ffffff',
      textSecondary: '#e0e0e0',
      textMuted: '#a0a0a0',
      primary: '#3182ce',
      primaryHover: '#2c5aa0',
      primaryForeground: '#ffffff',
      accent: '#805ad5',
      accentHover: '#6b46c1',
      accentForeground: '#ffffff',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      info: '#3182ce',
      border: '#333333',
      borderSecondary: '#444444',
      gradient: 'linear-gradient(135deg, #3182ce 0%, #805ad5 100%)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(49, 130, 206, 0.3)'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      gradients: true,
      shadows: true
    }
  },
  {
    id: 'jupiter-inspired',
    name: 'Jupiter Pro',
    description: 'Professional theme inspired by Jupiter.ag with clean aesthetics',
    requiredTier: UserTier.EXPLORER,
    isPremium: true,
    colors: {
      background: '#0d1421',
      backgroundSecondary: '#1a2332',
      backgroundTertiary: '#243447',
      surface: '#1e2a3a',
      surfaceSecondary: '#2a3441',
      surfaceHover: '#364152',
      text: '#ffffff',
      textSecondary: '#c7d2fe',
      textMuted: '#94a3b8',
      primary: '#00d4aa',
      primaryHover: '#00b894',
      primaryForeground: '#000000',
      accent: '#fbbf24',
      accentHover: '#f59e0b',
      accentForeground: '#000000',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: '#374151',
      borderSecondary: '#4b5563',
      gradient: 'linear-gradient(135deg, #00d4aa 0%, #fbbf24 100%)',
      shadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
      glow: '0 0 25px rgba(0, 212, 170, 0.2)'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      gradients: true,
      shadows: true
    }
  },
  {
    id: 'coinbase-inspired',
    name: 'Coinbase Elite',
    description: 'Premium theme with Coinbase-inspired professional design',
    requiredTier: UserTier.VOYAGER,
    isPremium: true,
    colors: {
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      surface: '#ffffff',
      surfaceSecondary: '#f8fafc',
      surfaceHover: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      primary: '#0052ff',
      primaryHover: '#0041cc',
      primaryForeground: '#ffffff',
      accent: '#00d395',
      accentHover: '#00b87a',
      accentForeground: '#ffffff',
      success: '#00d395',
      warning: '#ff9500',
      error: '#ff4747',
      info: '#0052ff',
      border: '#e2e8f0',
      borderSecondary: '#cbd5e1',
      gradient: 'linear-gradient(135deg, #0052ff 0%, #00d395 100%)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(0, 82, 255, 0.15)'
    },
    effects: {
      glassmorphism: false,
      animations: true,
      gradients: true,
      shadows: true
    }
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic cyberpunk theme with neon accents',
    requiredTier: UserTier.PIONEER,
    isPremium: true,
    colors: {
      background: '#000000',
      backgroundSecondary: '#0a0a0a',
      backgroundTertiary: '#111111',
      surface: '#1a1a1a',
      surfaceSecondary: '#222222',
      surfaceHover: '#2a2a2a',
      text: '#00ff88',
      textSecondary: '#88ffaa',
      textMuted: '#44aa66',
      primary: '#00ff88',
      primaryHover: '#00cc66',
      primaryForeground: '#000000',
      accent: '#ff0088',
      accentHover: '#cc0066',
      accentForeground: '#ffffff',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff0088',
      info: '#0088ff',
      border: '#333333',
      borderSecondary: '#444444',
      gradient: 'linear-gradient(135deg, #00ff88 0%, #ff0088 100%)',
      shadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
      glow: '0 0 30px rgba(0, 255, 136, 0.5)'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      gradients: true,
      shadows: true
    }
  },
  {
    id: 'golden-legend',
    name: 'Golden Legend',
    description: 'Exclusive golden theme for legendary tier members',
    requiredTier: UserTier.LEGEND,
    isPremium: true,
    colors: {
      background: '#1a1611',
      backgroundSecondary: '#2a2419',
      backgroundTertiary: '#3a3221',
      surface: '#2d2619',
      surfaceSecondary: '#3d3621',
      surfaceHover: '#4d4629',
      text: '#ffd700',
      textSecondary: '#ffed4e',
      textMuted: '#d4af37',
      primary: '#ffd700',
      primaryHover: '#ffed4e',
      primaryForeground: '#000000',
      accent: '#ff8c00',
      accentHover: '#ff7700',
      accentForeground: '#000000',
      success: '#32cd32',
      warning: '#ff8c00',
      error: '#dc143c',
      info: '#4169e1',
      border: '#4d4629',
      borderSecondary: '#5d5631',
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
      shadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
      glow: '0 0 40px rgba(255, 215, 0, 0.4)'
    },
    effects: {
      glassmorphism: true,
      animations: true,
      gradients: true,
      shadows: true
    }
  }
];

export const TIER_BENEFITS: TierBenefits[] = [
  {
    tier: UserTier.FREE,
    name: 'Free User',
    description: 'Basic swap functionality with standard fees',
    feeDiscount: 0,
    features: [
      'Basic token swapping',
      'Standard fees',
      'Basic themes',
      'Community support'
    ],
    themesUnlocked: ['wagus-dark'],
    color: '#64748b',
    icon: 'User'
  },
  {
    tier: UserTier.EXPLORER,
    name: 'Adventurer (Free)',
    description: 'Free adventurer tier with basic benefits',
    feeDiscount: 5,
    features: [
      'Basic token swapping',
      '5% fee discount',
      'WAGUS theme access',
      'Community support',
      'Swap history tracking'
    ],
    themesUnlocked: ['wagus-dark'],
    color: '#10b981',
    icon: 'Compass'
    // No price - this is the free tier
  },
  {
    tier: UserTier.VOYAGER,
    name: 'Voyager',
    description: 'Experienced trader with enhanced benefits - PREMIUM TIER',
    feeDiscount: 10,
    features: [
      'All Adventurer features',
      '10% fee discount',
      'Jupiter Pro theme access',
      'Coinbase Elite theme access',
      'Advanced analytics',
      'Custom slippage settings',
      'Priority support'
    ],
    themesUnlocked: ['wagus-dark', 'jupiter-inspired', 'coinbase-inspired'],
    color: '#3b82f6',
    icon: 'Ship',
    price: 25,
    isPurchaseRequired: true
  },
  {
    tier: UserTier.PIONEER,
    name: 'Pioneer',
    description: 'Advanced trader with premium features - PREMIUM TIER',
    feeDiscount: 20,
    features: [
      'All Voyager features',
      '20% fee discount',
      'Neon Cyber theme access',
      'API access',
      'White-label options',
      'Dedicated support',
      'Early feature access'
    ],
    themesUnlocked: ['wagus-dark', 'jupiter-inspired', 'coinbase-inspired', 'neon-cyber'],
    color: '#8b5cf6',
    icon: 'Rocket',
    price: 50,
    isPurchaseRequired: true
  },
  {
    tier: UserTier.LEGEND,
    name: 'Legend',
    description: 'Ultimate tier with maximum benefits and exclusivity - PREMIUM TIER',
    feeDiscount: 25,
    features: [
      'All Pioneer features',
      '25% fee discount',
      'Exclusive Golden Legend theme',
      'Personal account manager',
      'Custom theme creation',
      'Revenue sharing program',
      'Governance voting rights',
      'VIP events access'
    ],
    themesUnlocked: ['wagus-dark', 'jupiter-inspired', 'coinbase-inspired', 'neon-cyber', 'golden-legend'],
    color: '#ffd700',
    icon: 'Crown',
    price: 100,
    isPurchaseRequired: true
  }
];

export const DEFAULT_THEME_ID = 'wagus-dark';

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find(theme => theme.id === id);
}

export function getThemesByTier(tier: UserTier): Theme[] {
  const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
  const userTierIndex = tierOrder.indexOf(tier);
  
  return THEMES.filter(theme => {
    const themeTierIndex = tierOrder.indexOf(theme.requiredTier);
    return themeTierIndex <= userTierIndex;
  });
}

export function getTierBenefits(tier: UserTier): TierBenefits | undefined {
  return TIER_BENEFITS.find(benefit => benefit.tier === tier);
}

export function calculateFeeDiscount(baseFee: number, tier: UserTier): { finalFee: number; savings: number; discountPercentage: number } {
  const tierBenefits = getTierBenefits(tier);
  const discountPercentage = tierBenefits?.feeDiscount || 0;
  const savings = (baseFee * discountPercentage) / 100;
  const finalFee = baseFee - savings;
  
  return {
    finalFee,
    savings,
    discountPercentage
  };
}