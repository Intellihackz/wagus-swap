"use client";

import React, { useMemo } from 'react';
import { Calculator, TrendingDown, Zap, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTier } from '@/contexts/TierContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatNumberWithCommas } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FeeCalculatorProps {
  swapAmount: number;
  className?: string;
  showComparison?: boolean;
  compact?: boolean;
}

export function FeeCalculator({ 
  swapAmount, 
  className, 
  showComparison = true, 
  compact = false 
}: FeeCalculatorProps) {
  const { userTier, calculateFeeDiscount, tierBenefits } = useTier();
  const { currentTheme } = useTheme();

  const feeCalculation = useMemo(() => {
    return calculateFeeDiscount(swapAmount);
  }, [swapAmount, calculateFeeDiscount]);

  const currentTierBenefits = useMemo(() => {
    return tierBenefits.find(tier => tier.tier === userTier);
  }, [tierBenefits, userTier]);

  const nextTierComparison = useMemo(() => {
    if (!showComparison) return null;
    
    const tierOrder = ['free', 'explorer', 'voyager', 'pioneer', 'legend'];
    const currentIndex = tierOrder.indexOf(userTier);
    const nextTierIndex = currentIndex + 1;
    
    if (nextTierIndex >= tierOrder.length) return null;
    
    const nextTier = tierBenefits[nextTierIndex];
    const nextTierFeeCalc = {
      baseFee: feeCalculation.baseFee,
      tierDiscount: nextTier.feeDiscount,
      finalFee: feeCalculation.baseFee * (1 - nextTier.feeDiscount / 100),
      savings: feeCalculation.baseFee * (nextTier.feeDiscount / 100),
      discountPercentage: nextTier.feeDiscount
    };
    
    return {
      tier: nextTier,
      calculation: nextTierFeeCalc,
      additionalSavings: nextTierFeeCalc.savings - feeCalculation.savings
    };
  }, [showComparison, userTier, tierBenefits, feeCalculation]);

  if (swapAmount <= 0) {
    return (
      <Card 
        className={cn("opacity-50", className)}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border
        }}
      >
        <CardContent className="p-4 text-center">
          <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: currentTheme.colors.textMuted }} />
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
            Enter swap amount to see fee calculation
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          className
        )}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border
        }}
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4" style={{ color: currentTheme.colors.primary }} />
          <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
            Fee: ${formatNumberWithCommas(feeCalculation.finalFee.toFixed(4))}
          </span>
          {feeCalculation.savings > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              ${formatNumberWithCommas(feeCalculation.savings.toFixed(4))} saved
            </Badge>
          )}
        </div>
        
        {currentTierBenefits && currentTierBenefits.feeDiscount > 0 && (
          <Badge 
            variant="outline"
            className="text-xs"
            style={{ borderColor: currentTheme.colors.primary, color: currentTheme.colors.primary }}
          >
            <Zap className="h-3 w-3 mr-1" />
            -{currentTierBenefits.feeDiscount}%
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={cn("transition-all duration-200 hover:shadow-md", className)}
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          <span style={{ color: currentTheme.colors.text }}>Fee Breakdown</span>
          {currentTierBenefits && currentTierBenefits.feeDiscount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-green-100 text-green-800 border-green-200"
            >
              <Zap className="h-3 w-3 mr-1" />
              {currentTierBenefits.name} Discount
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Fee Calculation */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
              Swap Amount
            </span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              ${formatNumberWithCommas(swapAmount.toFixed(2))}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
              Base Fee (0.3%)
            </span>
            <span style={{ color: currentTheme.colors.textSecondary }}>
              ${formatNumberWithCommas(feeCalculation.baseFee.toFixed(4))}
            </span>
          </div>
          
          {feeCalculation.discountPercentage > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-1" style={{ color: currentTheme.colors.textMuted }}>
                <TrendingDown className="h-3 w-3 text-green-500" />
                Tier Discount ({feeCalculation.discountPercentage}%)
              </span>
              <span className="text-green-600 font-medium">
                -${formatNumberWithCommas(feeCalculation.savings.toFixed(4))}
              </span>
            </div>
          )}
          
          <Separator style={{ backgroundColor: currentTheme.colors.border }} />
          
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              Final Fee
            </span>
            <span 
              className="font-bold text-lg"
              style={{ color: currentTheme.colors.primary }}
            >
              ${formatNumberWithCommas(feeCalculation.finalFee.toFixed(4))}
            </span>
          </div>
        </div>

        {/* Savings Summary */}
        {feeCalculation.savings > 0 && (
          <div 
            className="p-3 rounded-lg border"
            style={{ 
              backgroundColor: currentTheme.colors.backgroundSecondary,
              borderColor: currentTheme.colors.border
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm" style={{ color: currentTheme.colors.text }}>
                Your Savings
              </span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Amount saved on this swap:</span>
                <span className="text-green-600 font-medium">
                  ${formatNumberWithCommas(feeCalculation.savings.toFixed(4))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Percentage saved:</span>
                <span className="text-green-600 font-medium">
                  {feeCalculation.discountPercentage}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Tier Comparison */}
        {nextTierComparison && (
          <div 
            className="p-3 rounded-lg border"
            style={{ 
              backgroundColor: currentTheme.colors.backgroundTertiary,
              borderColor: currentTheme.colors.borderSecondary
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" style={{ color: currentTheme.colors.primary }} />
              <span className="font-medium text-sm" style={{ color: currentTheme.colors.text }}>
                Upgrade to {nextTierComparison.tier.name}
              </span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Fee with {nextTierComparison.tier.name}:</span>
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  ${formatNumberWithCommas(nextTierComparison.calculation.finalFee.toFixed(4))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Additional savings:</span>
                <span className="text-blue-600 font-medium">
                  ${formatNumberWithCommas(nextTierComparison.additionalSavings.toFixed(4))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: currentTheme.colors.textMuted }}>Upgrade cost:</span>
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  ${nextTierComparison.tier.price}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fee Structure Info */}
        <div className="text-xs p-2 rounded" style={{ backgroundColor: currentTheme.colors.backgroundSecondary }}>
          <div className="flex items-center gap-1 mb-1">
            <Info className="h-3 w-3" style={{ color: currentTheme.colors.textMuted }} />
            <span style={{ color: currentTheme.colors.textMuted }}>Fee Structure</span>
          </div>
          <p style={{ color: currentTheme.colors.textMuted }}>
            Base fee is 0.3% of swap amount. Tier discounts are applied automatically based on your membership level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}