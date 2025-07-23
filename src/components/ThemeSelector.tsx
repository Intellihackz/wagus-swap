"use client";

import React, { useState } from 'react';
import { ChevronDown, Palette, Lock, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useTier } from '@/contexts/TierContext';
import { UserTier } from '@/types/theme';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeSelector({ className, showLabel = true }: ThemeSelectorProps) {
  const { currentTheme, availableThemes, switchTheme, canUseTheme, getThemesByTier } = useTheme();
  const { userTier } = useTier();
  const [isOpen, setIsOpen] = useState(false);

  const availableForUser = getThemesByTier(userTier);
  const lockedThemes = availableThemes.filter(theme => !canUseTheme(theme.id));

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case UserTier.FREE:
        return null;
      case UserTier.EXPLORER:
        return <Star className="h-3 w-3" />;
      case UserTier.VOYAGER:
        return <Star className="h-3 w-3" />;
      case UserTier.PIONEER:
        return <Crown className="h-3 w-3" />;
      case UserTier.LEGEND:
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case UserTier.FREE:
        return 'bg-gray-500';
      case UserTier.EXPLORER:
        return 'bg-green-500';
      case UserTier.VOYAGER:
        return 'bg-blue-500';
      case UserTier.PIONEER:
        return 'bg-purple-500';
      case UserTier.LEGEND:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleThemeSelect = (themeId: string) => {
    if (canUseTheme(themeId)) {
      switchTheme(themeId);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 border-2 transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            className
          )}
          style={{
            borderColor: currentTheme.colors.border,
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.text
          }}
        >
          <Palette className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="hidden sm:inline">{currentTheme.name}</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-2"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          color: currentTheme.colors.text
        }}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4" />
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: currentTheme.colors.border }} />
        
        {/* Available Themes */}
        {availableForUser.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-md",
              currentTheme.id === theme.id && "ring-2 ring-opacity-50"
            )}
            style={{
              backgroundColor: currentTheme.id === theme.id 
                ? `${currentTheme.colors.primary}20` 
                : 'transparent',
              borderColor: currentTheme.id === theme.id 
                ? currentTheme.colors.primary 
                : 'transparent'
            }}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="flex items-center gap-3">
              {/* Theme Preview */}
              <div 
                className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                style={{
                  background: theme.colors.gradient || theme.colors.primary,
                  borderColor: currentTheme.colors.border
                }}
              />
              
              <div className="flex flex-col">
                <span className="font-medium text-sm">{theme.name}</span>
                <span className="text-xs opacity-70">{theme.description}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {theme.isPremium && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs px-2 py-1 flex items-center gap-1",
                    getTierColor(theme.requiredTier)
                  )}
                >
                  {getTierIcon(theme.requiredTier)}
                  {theme.requiredTier}
                </Badge>
              )}
              
              {currentTheme.id === theme.id && (
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        {/* Locked Themes */}
        {lockedThemes.length > 0 && (
          <>
            <DropdownMenuSeparator style={{ backgroundColor: currentTheme.colors.border }} />
            <DropdownMenuLabel className="text-xs opacity-70">
              Upgrade to unlock
            </DropdownMenuLabel>
            
            {lockedThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                className="flex items-center justify-between p-3 rounded-lg opacity-60 cursor-not-allowed"
                disabled
              >
                <div className="flex items-center gap-3">
                  {/* Theme Preview */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 flex-shrink-0 relative"
                    style={{
                      background: theme.colors.gradient || theme.colors.primary,
                      borderColor: currentTheme.colors.border
                    }}
                  >
                    <Lock className="h-3 w-3 absolute inset-0 m-auto text-white" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{theme.name}</span>
                    <span className="text-xs opacity-70">{theme.description}</span>
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs px-2 py-1 flex items-center gap-1",
                    getTierColor(theme.requiredTier)
                  )}
                >
                  {getTierIcon(theme.requiredTier)}
                  {theme.requiredTier}
                </Badge>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}