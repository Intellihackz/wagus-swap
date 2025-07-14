"use client";

import React, { useEffect, useMemo } from "react";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

// Hooks
import { useSwap } from "@/hooks/useSwap";

// Components
import { TokenSelector } from "@/components/TokenSelector";
import { WalletStatus } from "@/components/WalletStatus";
import { SwapButton } from "@/components/SwapButton";

// Utils
import { formatNumberWithCommas } from "@/utils/formatters";
import { TOKENS } from "@/constants/tokens";

export default function SwapUi() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Wallet Status - Upper Right Corner */}
      {authenticated && walletAddress && (
        <WalletStatus 
          walletAddress={walletAddress} 
          onDisconnect={handleDisconnectWallet} 
        />
      )}

      <Card className="w-full max-w-md border-2 border-white bg-black">
        <CardHeader className="text-center border-b-2 border-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/wagus-logo.png"
              alt="WAGUS Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <CardTitle className="text-2xl font-bold text-white">
              WAGUS Swap
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* From Token Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">From</Label>
            <TokenSelector
              token={fromToken}
              amount={fromAmount}
              balance={getDisplayBalance(fromToken.symbol, authenticated)}
              isAuthenticated={authenticated}
              showMaxButton={true}
              hasBalance={hasFromTokenBalance}
              onTokenSelect={(token) => handleTokenSelect(token, true)}
              onAmountChange={handleFromAmountChange}
              onMaxClick={handleMaxClick}
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwapTokens}
              variant="outline"
              size="icon"
              disabled={!authenticated}
              className="border-2 border-white bg-black text-white hover:bg-white hover:text-black rounded-full h-10 w-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">To</Label>
            <TokenSelector
              token={toToken}
              amount={toAmount ? formatNumberWithCommas(Number(toAmount)) : ""}
              balance={getDisplayBalance(toToken.symbol, authenticated)}
              isAuthenticated={authenticated}
              isReadOnly={true}
              placeholder={isLoadingQuote ? "Loading..." : "0.00"}
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
            onConnect={handleConnectWallet}
            onSwap={handleExecuteSwap}
          />

          {/* Transaction Success */}
          {transactionSignature && (
            <div className="text-center text-sm text-green-400 border-t-2 border-white pt-4">
              <div className="mb-2">Swap successful! 🎉</div>
              <div className="mb-2 text-xs text-gray-400 flex items-center justify-center gap-2">
                {isLoadingBalances ? "Updating balances..." : "Balances updated"}
                <Button
                  onClick={handleRefreshBalances}
                  variant="ghost"
                  size="sm"
                  disabled={isLoadingBalances}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
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
            <div className="text-center text-sm text-red-400 border-t-2 border-white pt-4">
              Insufficient {fromToken.symbol} balance. Available: {getDisplayBalance(fromToken.symbol, authenticated)}
            </div>
          )}

          {/* Quote Error */}
          {quoteError && (
            <div className="text-center text-sm text-red-400 border-t-2 border-white pt-4">
              {quoteError}
            </div>
          )}

          {/* Transaction Error */}
          {transactionError && (
            <div className="text-center text-sm text-red-400 border-t-2 border-white pt-4">
              Transaction failed: {transactionError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
