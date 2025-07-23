import React, { memo } from "react";
import { Loader2, Wallet, Zap, TrendingDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useTier } from "@/contexts/TierContext";
import { formatNumberWithCommas } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface SwapButtonProps {
  isAuthenticated: boolean;
  canSwap: boolean;
  isLoadingQuote: boolean;
  isLoadingBalances: boolean;
  hasAmount: boolean;
  isInsufficientBalance: boolean;
  swapAmount?: number;
  showFeeInfo?: boolean;
  onConnect: () => void;
  onSwap: () => void;
}

export const SwapButton = memo<SwapButtonProps>(({
  isAuthenticated,
  canSwap,
  isLoadingQuote,
  isLoadingBalances,
  hasAmount,
  isInsufficientBalance,
  swapAmount = 0,
  showFeeInfo = true,
  onConnect,
  onSwap,
}) => {
  const { currentTheme } = useTheme();
  const { userTier, calculateFeeDiscount, tierBenefits } = useTier();
  
  const currentTierBenefits = tierBenefits.find(tier => tier.tier === userTier);
  const isPremiumTier = userTier !== 'free';
  
  const feeCalculation = swapAmount > 0 ? calculateFeeDiscount(swapAmount) : null;
  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onConnect}
          className={cn(
            "w-full font-bold py-3 text-lg border-2 transition-all duration-200",
            "hover:shadow-lg"
          )}
          style={{
            backgroundColor: currentTheme.colors.primary,
            borderColor: currentTheme.colors.primary,
            color: currentTheme.colors.background
          }}
        >
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
        
        {/* Preview of tier benefits */}
        <div 
          className="text-center p-3 rounded-lg border"
          style={{
            backgroundColor: currentTheme.colors.backgroundSecondary,
            borderColor: currentTheme.colors.border
          }}
        >
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
            Connect to unlock tier benefits and fee discounts
          </p>
        </div>
      </div>
    );
  }

  const getButtonContent = () => {
    if (isLoadingQuote) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Getting Quote...
        </>
      );
    }
    
    if (isLoadingBalances) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading Balances...
        </>
      );
    }
    
    if (!hasAmount) {
      return (
        <>
          <ArrowUpDown className="mr-2 h-5 w-5" />
          Enter Amount
        </>
      );
    }
    
    if (isInsufficientBalance) {
      return (
        <>
          <Wallet className="mr-2 h-5 w-5" />
          Insufficient Balance
        </>
      );
    }
    
    return (
      <>
        {isPremiumTier && <Zap className="mr-2 h-5 w-5" />}
        <ArrowUpDown className="mr-2 h-5 w-5" />
        Swap Tokens
        {isPremiumTier && currentTierBenefits && (
          <Badge 
            variant="secondary" 
            className="ml-2 text-xs"
            style={{
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.primary
            }}
          >
            -{currentTierBenefits.feeDiscount}%
          </Badge>
        )}
      </>
    );
  };

  return (
    <div className="space-y-3">
      {/* Fee Information */}
      {showFeeInfo && feeCalculation && hasAmount && (
        <div 
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: currentTheme.colors.backgroundSecondary,
            borderColor: currentTheme.colors.border
          }}
        >
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: currentTheme.colors.textMuted }}>Swap Fee:</span>
            <div className="flex items-center gap-2">
              {feeCalculation.savings > 0 && (
                <span className="text-green-600 text-xs flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  ${formatNumberWithCommas(feeCalculation.savings.toFixed(4))} saved
                </span>
              )}
              <span 
                className="font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                ${formatNumberWithCommas(feeCalculation.finalFee.toFixed(4))}
              </span>
            </div>
          </div>
          
          {isPremiumTier && currentTierBenefits && (
            <div className="flex justify-between items-center text-xs mt-1">
              <span style={{ color: currentTheme.colors.textMuted }}>
                {currentTierBenefits.name} Discount:
              </span>
              <span className="text-green-600 font-medium">
                -{currentTierBenefits.feeDiscount}%
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Main Swap Button */}
      <Button
        onClick={onSwap}
        disabled={!canSwap}
        className={cn(
          "w-full font-bold py-3 text-lg border-2 transition-all duration-200",
          "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
          isPremiumTier && "shadow-md",
          currentTheme.name === 'neon-cyber' && isPremiumTier && "shadow-cyan-500/20",
          currentTheme.name === 'golden-legend' && isPremiumTier && "shadow-yellow-500/20"
        )}
        style={{
          backgroundColor: canSwap ? currentTheme.colors.primary : currentTheme.colors.backgroundSecondary,
          borderColor: canSwap ? currentTheme.colors.primary : currentTheme.colors.border,
          color: canSwap ? currentTheme.colors.background : currentTheme.colors.textMuted
        }}
      >
        {getButtonContent()}
      </Button>
      
      {/* Tier Upgrade Hint */}
      {!isPremiumTier && hasAmount && swapAmount > 100 && (
        <div 
          className="text-center p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.backgroundTertiary,
            borderColor: currentTheme.colors.borderSecondary
          }}
        >
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
            💡 Upgrade to Explorer tier to save on fees!
          </p>
        </div>
      )}
    </div>
  );
});

SwapButton.displayName = "SwapButton";
