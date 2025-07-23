"use client";

import React, { useEffect, useMemo } from "react";
import { ArrowUpDown, RefreshCw, Settings, Palette, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useDemoMode } from "@/components/providers";

// Contexts
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { TierProvider, useTier } from "@/contexts/TierContext";

// Hooks
import { useSwap } from "@/hooks/useSwap";

// Components
import { TokenSelector } from "@/components/TokenSelector";
import { WalletStatus } from "@/components/WalletStatus";
import { SwapButton } from "@/components/SwapButton";
import { ThemeSelector } from "@/components/ThemeSelector";
import { TierStatus } from "@/components/TierStatus";
import { FeeCalculator } from "@/components/FeeCalculator";
import { AdminToggle } from "@/components/AdminToggle";

// Utils
import { formatNumberWithCommas } from "@/utils/formatters";
import { TOKENS } from "@/constants/tokens";
import { cn } from "@/lib/utils";

function SwapUiInner() {
  const isDemoMode = useDemoMode();
  
  // Use Privy hooks only if not in demo mode
  let ready = true;
  let authenticated = false;
  let login = async () => console.log('Demo mode - wallet connection disabled');
  let logout = async () => console.log('Demo mode - wallet disconnection disabled');
  let user = null;
  
  if (!isDemoMode) {
    try {
      const privyHook = usePrivy();
      ready = privyHook.ready;
      authenticated = privyHook.authenticated;
      login = privyHook.login;
      logout = privyHook.logout;
      user = privyHook.user;
    } catch (error) {
      console.log('Error using Privy hooks:', error);
    }
  }
  
  const { currentTheme } = useTheme();
  const { userTier } = useTier();
  
  const {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isLoadingBalances,
    isLoadingQuote,
    isLoadingTransaction,
    quoteError,
    transactionError,
    transactionSignature,
    
    // Actions
    handleFromAmountChange,
    handleSwapTokens,
    handleTokenSelect,
    handleMaxClick,
    fetchTokenBalances,
    resetState,
    executeSwap,
    
    // Computed values
    getDisplayBalance,
    getTokenBalance,
    isInsufficientBalance,
    canSwap,
  } = useSwap();

  // Get wallet data from user object
  const walletAddress = useMemo(() => {
    const walletAccount = user?.linkedAccounts?.find(account => account.type === 'wallet');
    return walletAccount && 'address' in walletAccount ? walletAccount.address : "";
  }, [user?.linkedAccounts]);

  // Effect to get token addresses when wallet is connected
  useEffect(() => {
    if (authenticated && walletAddress) {
      fetchTokenBalances(walletAddress, TOKENS);
    }
  }, [authenticated, walletAddress, fetchTokenBalances]);

  // Debug logging to see user data (only in development) - optimized to reduce re-renders
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && authenticated && user && walletAddress) {
      console.log('User data:', {
        userId: user.id,
        linkedAccounts: user.linkedAccounts?.map(account => ({
          type: account.type,
          address: 'address' in account ? account.address : 'No address'
        })),
        walletAddress: walletAddress,
      });
    }
  }, [authenticated, user?.id, walletAddress, user]); // More specific dependencies

  const handleConnectWallet = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await logout();
      resetState();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleExecuteSwap = async () => {
    if (!walletAddress) {
      console.error("No wallet address available");
      return;
    }

    try {
      console.log("Executing swap...");
      
      // Note: In a real implementation with Privy, you would need to get the wallet instance
      // For now, we're passing the wallet address and letting the transaction hook handle it
      const signature = await executeSwap(walletAddress);
      
      if (signature) {
        console.log("Swap executed successfully!");
        // The success message will be shown in the transaction status section
        
        // Show a brief message about balance refresh
        setTimeout(() => {
          console.log("🔄 Updating token balances...");
        }, 1000);
      }
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  };

  const handleRefreshBalances = async () => {
    if (walletAddress && authenticated) {
      console.log("Manually refreshing balances...");
      await fetchTokenBalances(walletAddress, TOKENS);
    }
  };

  // Memoized computed values
  const hasAmount = useMemo(() => Boolean(fromAmount && Number.parseFloat(fromAmount) > 0), [fromAmount]);
  const isInsufficientBal = useMemo(() => isInsufficientBalance(fromAmount), [isInsufficientBalance, fromAmount]);
  const canPerformSwap = useMemo(() => canSwap(fromAmount, authenticated), [canSwap, fromAmount, authenticated]);
  const hasFromTokenBalance = useMemo(() => getTokenBalance(fromToken.symbol) > 0, [getTokenBalance, fromToken.symbol]);
  const isLoading = useMemo(() => isLoadingQuote || isLoadingTransaction, [isLoadingQuote, isLoadingTransaction]);

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-lg" style={{ color: currentTheme.colors.text }}>Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative transition-all duration-300"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Top Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        {/* Theme Selector */}
        <div className="flex items-center gap-2">
          <ThemeSelector />
        </div>
        
        {/* Wallet Status and Tier Info */}
        <div className="flex items-center gap-3">
          <AdminToggle />
          {authenticated && (
            <TierStatus compact={true} />
          )}
          {authenticated && walletAddress && (
            <WalletStatus 
              walletAddress={walletAddress} 
              onDisconnect={handleDisconnectWallet} 
            />
          )}
        </div>
      </div>

      {/* Main Swap Interface */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Tier Status (Desktop) */}
        <div className="hidden lg:block">
          {authenticated && (
            <TierStatus />
          )}
        </div>
        
        {/* Center Panel - Main Swap Card */}
        <Card 
          className={cn(
            "w-full border-2 transition-all duration-300 shadow-xl",
            userTier !== 'free' && "shadow-2xl",
            currentTheme.name === 'neon-cyber' && userTier !== 'free' && "shadow-cyan-500/20",
            currentTheme.name === 'golden-legend' && userTier !== 'free' && "shadow-yellow-500/20"
          )}
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: userTier !== 'free' ? currentTheme.colors.primary : currentTheme.colors.border
          }}
        >
          <CardHeader 
            className="text-center border-b-2"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/wagus-logo.png"
                alt="WAGUS Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <CardTitle 
                className="text-2xl font-bold flex items-center gap-2"
                style={{ color: currentTheme.colors.text }}
              >
                WAGUS Swap
                {userTier !== 'free' && (
                  <Crown className="h-6 w-6" style={{ color: currentTheme.colors.primary }} />
                )}
              </CardTitle>
            </div>
            
            {/* Mobile Tier Status */}
            <div className="lg:hidden mt-3">
              {authenticated && (
                <TierStatus compact={true} />
              )}
            </div>
          </CardHeader>
        
          <CardContent className="p-6 space-y-6">
            {/* From Token Section */}
            <div className="space-y-2">
              <Label 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                From
              </Label>
              <TokenSelector
                token={fromToken}
                amount={fromAmount}
                balance={getDisplayBalance(fromToken.symbol, authenticated)}
                isAuthenticated={authenticated}
                showMaxButton={true}
                hasBalance={hasFromTokenBalance}
                showTierBadge={userTier !== 'free'}
                onTokenSelect={(token) => handleTokenSelect(token, true)}
                onAmountChange={handleFromAmountChange}
                onMaxClick={handleMaxClick}
              />
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSwapTokens}
                variant="outline"
                size="icon"
                disabled={!authenticated}
                className={cn(
                  "border-2 rounded-full h-12 w-12 transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  userTier !== 'free' && "shadow-lg"
                )}
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary,
                  color: currentTheme.colors.primary
                }}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>

            {/* To Token Section */}
            <div className="space-y-2">
              <Label 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                To
              </Label>
              <TokenSelector
                token={toToken}
                amount={toAmount ? formatNumberWithCommas(Number(toAmount)) : ""}
                balance={getDisplayBalance(toToken.symbol, authenticated)}
                isAuthenticated={authenticated}
                isReadOnly={true}
                placeholder={isLoadingQuote ? "Loading..." : "0.00"}
                showTierBadge={userTier !== 'free'}
                onTokenSelect={(token) => handleTokenSelect(token, false)}
              />
            </div>

            {/* Main Action Button */}
            <SwapButton
              isAuthenticated={authenticated}
              canSwap={canPerformSwap}
              isLoadingQuote={isLoading}
              isLoadingBalances={isLoadingBalances}
              hasAmount={hasAmount}
              isInsufficientBalance={isInsufficientBal}
              swapAmount={fromAmount ? parseFloat(fromAmount) : 0}
              onConnect={handleConnectWallet}
              onSwap={handleExecuteSwap}
            />

            {/* Status Messages */}
            {(transactionSignature || (authenticated && hasAmount && isInsufficientBal) || quoteError || transactionError) && (
              <div 
                className="border-t-2 pt-4 space-y-3"
                style={{ borderColor: currentTheme.colors.border }}
              >
                {/* Transaction Success */}
                {transactionSignature && (
                  <div className="text-center text-sm text-green-400">
                    <div className="mb-2">Swap successful! 🎉</div>
                    <div className="mb-2 text-xs flex items-center justify-center gap-2" style={{ color: currentTheme.colors.textMuted }}>
                      {isLoadingBalances ? "Updating balances..." : "Balances updated"}
                      <Button
                        onClick={handleRefreshBalances}
                        variant="ghost"
                        size="sm"
                        disabled={isLoadingBalances}
                        className="h-6 w-6 p-0"
                        style={{ color: currentTheme.colors.textMuted }}
                      >
                        <RefreshCw className={`h-3 w-3 ${isLoadingBalances ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <a
                      href={`https://solscan.io/tx/${transactionSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      View transaction
                    </a>
                  </div>
                )}

                {/* Insufficient Balance Warning */}
                {authenticated && hasAmount && isInsufficientBal && (
                  <div className="text-center text-sm text-red-400">
                    Insufficient {fromToken.symbol} balance. Available: {getDisplayBalance(fromToken.symbol, authenticated)}
                  </div>
                )}

                {/* Quote Error */}
                {quoteError && (
                  <div className="text-center text-sm text-red-400">
                    {quoteError}
                  </div>
                )}

                {/* Transaction Error */}
                {transactionError && (
                  <div className="text-center text-sm text-red-400">
                    Transaction failed: {transactionError}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Right Panel - Fee Calculator (Desktop) */}
        <div className="hidden lg:block">
          {authenticated && hasAmount && (
            <FeeCalculator 
              swapAmount={fromAmount ? parseFloat(fromAmount) : 0}
              showComparison={true}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Fee Calculator */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-10">
        {authenticated && hasAmount && (
          <FeeCalculator 
            swapAmount={fromAmount ? parseFloat(fromAmount) : 0}
            compact={true}
            showComparison={false}
          />
        )}
      </div>
    </div>
  );
}

// Main component with providers
export default function SwapUi() {
  return (
    <ThemeProvider>
      <TierProvider>
        <SwapUiInner />
      </TierProvider>
    </ThemeProvider>
  );
}
