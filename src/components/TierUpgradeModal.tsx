'use client';

import React, { useState } from 'react';
import { X, Crown, Star, Zap, Shield, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTier } from '@/contexts/TierContext';
import { useAdmin } from '@/contexts/AdminContext';
import { UserTier, TierBenefits } from '@/types/theme';
import { TIER_BENEFITS } from '@/constants/themes';
import { cn } from '@/lib/utils';

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier?: UserTier;
}

export function TierUpgradeModal({ isOpen, onClose, targetTier }: TierUpgradeModalProps) {
  const { userTier, upgradeTier } = useTier();
  const { isAdminMode } = useAdmin();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<UserTier>(targetTier || UserTier.VOYAGER);

  if (!isOpen) return null;

  const currentTierBenefits = TIER_BENEFITS.find(t => t.tier === userTier);
  const selectedTierBenefits = TIER_BENEFITS.find(t => t.tier === selectedTier);
  
  // Get available upgrade tiers (excluding current and lower tiers)
  const tierOrder = [UserTier.FREE, UserTier.EXPLORER, UserTier.VOYAGER, UserTier.PIONEER, UserTier.LEGEND];
  const currentIndex = tierOrder.indexOf(userTier);
  const availableTiers = TIER_BENEFITS.filter((_, index) => index > currentIndex);

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case UserTier.FREE:
        return <Star className="h-5 w-5" />;
      case UserTier.EXPLORER:
        return <Star className="h-5 w-5" />;
      case UserTier.VOYAGER:
        return <Shield className="h-5 w-5" />;
      case UserTier.PIONEER:
        return <Zap className="h-5 w-5" />;
      case UserTier.LEGEND:
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
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

  const handleUpgrade = async () => {
    if (!selectedTierBenefits) return;
    
    setIsUpgrading(true);
    try {
      const success = await upgradeTier(selectedTier);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const isPurchaseRequired = selectedTierBenefits?.isPurchaseRequired && !isAdminMode;
  const isFreeUpgrade = selectedTier === UserTier.EXPLORER && userTier === UserTier.FREE;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-gray-700/50">
          <CardHeader className="border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-500" />
                Upgrade Your Tier
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-gray-400 mt-2">
              {isAdminMode ? (
                "Admin mode: All tiers available without restrictions"
              ) : (
                "Choose your tier to unlock premium features and fee discounts"
              )}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Current Tier */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Current Tier</h3>
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r text-white",
                getTierGradient(userTier)
              )}>
                {getTierIcon(userTier)}
                <div>
                  <div className="font-semibold">{currentTierBenefits?.name}</div>
                  <div className="text-sm opacity-90">{currentTierBenefits?.description}</div>
                </div>
                <div className="ml-auto">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    -{currentTierBenefits?.feeDiscount}% fees
                  </Badge>
                </div>
              </div>
            </div>

            {/* Available Tiers */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Available Upgrades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTiers.map((tier) => {
                  const isSelected = selectedTier === tier.tier;
                  const isFreeTier = tier.tier === UserTier.EXPLORER;
                  const requiresPurchase = tier.isPurchaseRequired && !isAdminMode;
                  
                  return (
                    <div
                      key={tier.tier}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                        isSelected 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      )}
                      onClick={() => setSelectedTier(tier.tier)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "p-2 rounded-full bg-gradient-to-r text-white",
                          getTierGradient(tier.tier)
                        )}>
                          {getTierIcon(tier.tier)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{tier.name}</div>
                          <div className="text-sm text-gray-400">-{tier.feeDiscount}% fees</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {tier.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="h-3 w-3 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {requiresPurchase ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-500">${tier.price}</span>
                          </div>
                        ) : isFreeTier ? (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            FREE
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            Admin Access
                          </Badge>
                        )}
                        
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Tier Details */}
            {selectedTierBenefits && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Tier Details</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-3 rounded-full bg-gradient-to-r text-white",
                      getTierGradient(selectedTier)
                    )}>
                      {getTierIcon(selectedTier)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedTierBenefits.name}</h4>
                      <p className="text-gray-400">{selectedTierBenefits.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-white mb-2">Features</h5>
                      <div className="space-y-1">
                        {selectedTierBenefits.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="h-3 w-3 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-white mb-2">Benefits</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="text-gray-300">{selectedTierBenefits.feeDiscount}% fee discount</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-300">{selectedTierBenefits.themesUnlocked.length} themes unlocked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Warning */}
            {isPurchaseRequired && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold text-yellow-500">Premium Tier Purchase Required</h4>
                    <p className="text-sm text-yellow-400 mt-1">
                      This tier requires a one-time purchase of ${selectedTierBenefits?.price}. 
                      Payment integration would be implemented in a production environment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Mode Notice */}
            {isAdminMode && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="font-semibold text-red-400">Admin Mode Active</h4>
                    <p className="text-sm text-red-300 mt-1">
                      All tiers are available without purchase restrictions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading || !selectedTierBenefits}
                className={cn(
                  "flex-1 bg-gradient-to-r text-white font-semibold",
                  getTierGradient(selectedTier)
                )}
              >
                {isUpgrading ? (
                  "Upgrading..."
                ) : isPurchaseRequired ? (
                  `Purchase ${selectedTierBenefits?.name} - $${selectedTierBenefits?.price}`
                ) : (
                  `Upgrade to ${selectedTierBenefits?.name}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}