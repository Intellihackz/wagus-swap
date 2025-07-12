import React, { memo } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwapButtonProps {
  isAuthenticated: boolean;
  canSwap: boolean;
  isLoadingQuote: boolean;
  isLoadingBalances: boolean;
  hasAmount: boolean;
  isInsufficientBalance: boolean;
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
  onConnect,
  onSwap,
}) => {
  if (!isAuthenticated) {
    return (
      <Button
        onClick={onConnect}
        className="w-full bg-white text-black hover:bg-black hover:text-white border-2 border-white font-bold py-3 text-lg"
      >
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </Button>
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
      return "Enter Amount";
    }
    
    if (isInsufficientBalance) {
      return "Insufficient Balance";
    }
    
    return "Swap Tokens";
  };

  return (
    <Button
      onClick={onSwap}
      disabled={!canSwap}
      className="w-full bg-white text-black hover:bg-black hover:text-white border-2 border-white font-bold py-3 text-lg"
    >
      {getButtonContent()}
    </Button>
  );
});

SwapButton.displayName = "SwapButton";
