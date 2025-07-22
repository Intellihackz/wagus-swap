export interface Theme {
  id: string;
  name: string;
  description: string;
  requiredTier: UserTier;
  isPremium: boolean;
  colors: {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Surface colors
    surface: string;
    surfaceSecondary: string;
    surfaceHover: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;
    
    // Primary colors
    primary: string;
    primaryHover: string;
    primaryForeground: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    accentForeground: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border colors
    border: string;
    borderSecondary: string;
    
    // Special effects
    gradient: string;
    shadow: string;
    glow: string;
  };
  effects: {
    glassmorphism: boolean;
    animations: boolean;
    gradients: boolean;
    shadows: boolean;
  };
}

export enum UserTier {
  FREE = 'free',
  EXPLORER = 'explorer',
  VOYAGER = 'voyager',
  PIONEER = 'pioneer',
  LEGEND = 'legend'
}

export interface TierBenefits {
  tier: UserTier;
  name: string;
  description: string;
  feeDiscount: number; // Percentage discount (0-100)
  features: string[];
  themesUnlocked: string[];
  color: string;
  icon: string;
  price?: number; // Price in USD
  isPurchaseRequired?: boolean; // Whether this tier requires purchase
}

export interface UserProfile {
  walletAddress: string;
  tier: UserTier;
  selectedTheme: string;
  totalSwaps: number;
  totalFeesSaved: number;
  joinDate: Date;
  preferences: {
    defaultTheme: string;
    autoThemeSwitch: boolean;
    notifications: boolean;
  };
}

export interface SwapFeeCalculation {
  baseFee: number;
  tierDiscount: number;
  finalFee: number;
  savings: number;
  discountPercentage: number;
}

export interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Theme[];
  userTier: UserTier;
  switchTheme: (themeId: string) => void;
  canUseTheme: (themeId: string) => boolean;
  getThemesByTier: (tier: UserTier) => Theme[];
}

export interface TierContextType {
  userTier: UserTier;
  tierBenefits: TierBenefits[];
  upgradeTier: (newTier: UserTier) => Promise<boolean>;
  calculateFeeDiscount: (amount: number) => SwapFeeCalculation;
  getTierProgress: () => { current: number; next: number; progress: number };
}