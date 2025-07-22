import React, { memo } from "react";
import { ChevronDown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useTier } from "@/contexts/TierContext";
import type { Token } from "@/types/token";
import { TOKENS } from "@/constants/tokens";
import { formatNumberWithCommas } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  token: Token;
  amount: string;
  balance: string;
  isAuthenticated: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  showMaxButton?: boolean;
  hasBalance?: boolean;
  label?: string;
  showTierBadge?: boolean;
  onTokenSelect: (token: Token) => void;
  onAmountChange?: (value: string) => void;
  onMaxClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TokenSelector = memo<TokenSelectorProps>(({
  token,
  amount,
  balance,
  isAuthenticated,
  isReadOnly = false,
  placeholder = "0.00",
  showMaxButton = false,
  hasBalance = false,
  label,
  showTierBadge = false,
  onTokenSelect,
  onAmountChange,
  onMaxClick,
  onKeyDown,
}) => {
  const { currentTheme } = useTheme();
  const { userTier, tierBenefits } = useTier();
  
  const currentTierBenefits = tierBenefits.find(tier => tier.tier === userTier);
  const isPremiumTier = userTier !== 'free';
  
  const formatDisplayAmount = (value: string) => {
    if (!value || isNaN(parseFloat(value))) return value;
    return formatNumberWithCommas(parseFloat(value).toFixed(6));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent minus key, plus key, and 'e' key (scientific notation)
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };
  
  const handleAmountChange = (value: string) => {
    // Remove commas and validate numeric input
    const cleanValue = value.replace(/,/g, '');
    if (onAmountChange) {
      onAmountChange(cleanValue);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-lg p-4 space-y-3 border-2 transition-all duration-200",
        isPremiumTier && "shadow-lg",
        currentTheme.name === 'neon-cyber' && isPremiumTier && "shadow-cyan-500/20",
        currentTheme.name === 'golden-legend' && isPremiumTier && "shadow-yellow-500/20"
      )}
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: isPremiumTier ? currentTheme.colors.primary : currentTheme.colors.border
      }}
    >
      {/* Header with label and tier badge */}
      {(label || showTierBadge) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span 
              className="text-sm font-medium"
              style={{ color: currentTheme.colors.text }}
            >
              {label}
            </span>
          )}
          {showTierBadge && isPremiumTier && currentTierBenefits && (
            <Badge 
              variant="secondary"
              className={cn(
                "text-xs",
                currentTheme.name === 'neon-cyber' && "bg-cyan-100 text-cyan-800 border-cyan-200",
                currentTheme.name === 'golden-legend' && "bg-yellow-100 text-yellow-800 border-yellow-200"
              )}
              style={{
                backgroundColor: currentTheme.colors.backgroundSecondary,
                color: currentTheme.colors.primary,
                borderColor: currentTheme.colors.primary
              }}
            >
              <Star className="h-3 w-3 mr-1" />
              {currentTierBenefits.name}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!isAuthenticated}
              className={cn(
                "border-2 transition-all duration-200",
                isPremiumTier && "shadow-sm"
              )}
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            >
              <span className="font-bold">${token.symbol}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="border-2"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border
            }}
          >
            {TOKENS.map((tokenOption) => (
              <DropdownMenuItem
                key={tokenOption.symbol}
                onClick={() => onTokenSelect(tokenOption)}
                className="cursor-pointer transition-colors duration-150"
                style={{
                  color: currentTheme.colors.text
                }}
              >
                <div className="flex flex-col">
                  <span className="font-bold">${tokenOption.symbol}</span>
                  <span 
                    className="text-xs opacity-70"
                    style={{ color: currentTheme.colors.textMuted }}
                  >
                    {tokenOption.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="text-right">
          <div 
            className="text-xs opacity-70"
            style={{ color: currentTheme.colors.textMuted }}
          >
            Balance
          </div>
          <div 
            className="font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            {balance}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Input
          type={isReadOnly ? "text" : "number"}
          min="0"
          placeholder={placeholder}
          value={isReadOnly ? formatDisplayAmount(amount) : (amount?.replace(/,/g, '') || '')}
          onChange={onAmountChange ? (e) => handleAmountChange(e.target.value) : undefined}
          onKeyDown={handleKeyDown}
          readOnly={isReadOnly}
          disabled={!isAuthenticated}
          className={cn(
            "text-right text-xl font-bold border-2 transition-all duration-200",
            "focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            isPremiumTier && "shadow-sm"
          )}
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text
          }}
        />
        {showMaxButton && isAuthenticated && hasBalance && onMaxClick && (
          <Button
            onClick={onMaxClick}
            variant="outline"
            size="sm"
            className={cn(
              "border-2 px-3 py-1 text-xs transition-all duration-200",
              isPremiumTier && "shadow-sm"
            )}
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.primary,
              color: currentTheme.colors.primary
            }}
          >
            {isPremiumTier && <Zap className="h-3 w-3 mr-1" />}
            MAX
          </Button>
        )}
      </div>
    </div>
  );
});

TokenSelector.displayName = "TokenSelector";
