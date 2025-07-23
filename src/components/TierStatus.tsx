"use client";

import React, { useState } from 'react';
import { Crown, Star, TrendingUp, Zap, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTier, useTierBenefits, useCanUpgrade, useNextTier } from '@/contexts/TierContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserTier } from '@/types/theme';
import { cn } from '@/lib/utils';
import { formatNumberWithCommas } from '@/utils/formatters';
import { TierUpgradeModal } from './TierUpgradeModal';

interface TierStatusProps {
  className?: string;
  compact?: boolean;
  showUpgradeButton?: boolean;
  onUpgradeClick?: () => void;
}

export function TierStatus({ 
  className, 
  compact = false, 
  showUpgradeButton = true,
  onUpgradeClick 
}: TierStatusProps) {
  const { userTier, getTierProgress, calculateFeeDiscount } = useTier();
  const { currentTheme } = useTheme();
  const currentTierBenefits = useTierBenefits();
  const canUpgrade = useCanUpgrade();
  const nextTier = useNextTier();
  const [isHovered, setIsHovered] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const progress = getTierProgress();
  const sampleFeeCalculation = calculateFeeDiscount(1000); // $1000 sample

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case UserTier.FREE:
        return <Star className="h-4 w-4" />;
      case UserTier.EXPLORER:
        return <Star className="h-4 w-4" />;
      case UserTier.VOYAGER:
        return <Star className="h-4 w-4" />;
      case UserTier.PIONEER:
        return <Crown className="h-4 w-4" />;
      case UserTier.LEGEND:
        return <Crown className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getTierGradient = (tier: UserTier) => {
    switch (tier) {
      case UserTier.FREE:
        return 'from-gray-500 to-gray-600';
      case UserTier.EXPLORER:
        return 'from-green-500 to-emerald-600';
      case UserTier.VOYAGER:
        return 'from-blue-500 to-cyan-600';
      case UserTier.PIONEER:
        return 'from-purple-500 to-violet-600';
      case UserTier.LEGEND:
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (compact) {
    return (
      <>
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
            "hover:scale-[1.02] cursor-pointer",
            className
          )}
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            if (onUpgradeClick) {
              onUpgradeClick();
            } else {
              setShowUpgradeModal(true);
            }
          }}
        >
          {/* Tier Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r text-white font-medium text-sm",
            getTierGradient(userTier)
          )}>
            {getTierIcon(userTier)}
            {currentTierBenefits?.name}
          </div>

          {/* Fee Discount */}
          <div className="flex items-center gap-1 text-sm">
            <Zap className="h-3 w-3 text-green-400" />
            <span style={{ color: currentTheme.colors.textSecondary }}>-{currentTierBenefits?.feeDiscount}% fees</span>
          </div>

          {/* Upgrade Indicator */}
          {canUpgrade && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <TrendingUp className="h-3 w-3" />
              <span>Upgrade available</span>
            </div>
          )}
        </div>
        
        {/* Upgrade Modal */}
     <TierUpgradeModal
       isOpen={showUpgradeModal}
       onClose={() => setShowUpgradeModal(false)}
       targetTier={nextTier?.tier as UserTier}
     />
   </>
  );
  }

  return (
    <>
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        isHovered && "scale-[1.02]",
        className
      )}
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r text-white font-bold",
              getTierGradient(userTier)
            )}>
              {getTierIcon(userTier)}
              {currentTierBenefits?.name}
            </div>
            
            {currentTierBenefits?.feeDiscount && currentTierBenefits.feeDiscount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 border-green-200"
              >
                <Zap className="h-3 w-3 mr-1" />
                -{currentTierBenefits.feeDiscount}% fees
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Benefits */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm" style={{ color: currentTheme.colors.text }}>
            Current Benefits
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {currentTierBenefits?.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
                <span style={{ color: currentTheme.colors.textSecondary }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Savings */}
        {currentTierBenefits?.feeDiscount && currentTierBenefits.feeDiscount > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.backgroundSecondary }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                Fee Savings Example
              </span>
              <Gift className="h-4 w-4" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>On $1,000 swap:</span>
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  ${formatNumberWithCommas(sampleFeeCalculation.savings.toFixed(2))} saved
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Standard fee:</span>
                <span style={{ color: currentTheme.colors.textMuted }}>
                  ${formatNumberWithCommas(sampleFeeCalculation.baseFee.toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span style={{ color: currentTheme.colors.text }}>Your fee:</span>
                <span style={{ color: currentTheme.colors.primary }}>
                  ${formatNumberWithCommas(sampleFeeCalculation.finalFee.toFixed(2))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {canUpgrade && nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                Next Tier: {nextTier.name}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "bg-gradient-to-r text-white border-0",
                  getTierGradient(nextTier.tier as UserTier)
                )}
              >
                -{nextTier.feeDiscount}% fees
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: currentTheme.colors.textMuted }}>Progress to next tier</span>
                <span style={{ color: currentTheme.colors.textSecondary }}>{Math.round(progress.progress)}%</span>
              </div>
              <Progress 
                value={progress.progress} 
                className="h-2"
                style={{
                  backgroundColor: currentTheme.colors.backgroundSecondary
                }}
              />
            </div>

            {showUpgradeButton && (
              <Button
                onClick={() => {
                  if (onUpgradeClick) {
                    onUpgradeClick();
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className={cn(
                  "w-full bg-gradient-to-r text-white font-medium transition-all duration-200",
                  "hover:scale-[1.02] hover:shadow-lg",
                  getTierGradient(nextTier.tier as UserTier)
                )}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade to {nextTier.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Legend Tier Message */}
        {userTier === UserTier.LEGEND && (
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20">
            <Crown className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
              You've reached the highest tier!
            </p>
            <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
              Enjoy maximum benefits and exclusive features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Upgrade Modal */}
    <TierUpgradeModal
      isOpen={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      targetTier={nextTier?.tier as UserTier}
    />
  </>);
}