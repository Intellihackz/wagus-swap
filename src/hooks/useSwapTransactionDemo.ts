import { useState, useCallback } from "react";
import type { SwapResponse } from "@/types/token";

/**
 * Demo version of useSwapTransaction hook that doesn't use Privy
 */
export const useSwapTransactionDemo = () => {
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const sendSwapTransaction = useCallback(async (
    swapResponse: SwapResponse,
    userPublicKey: string
  ): Promise<string | null> => {
    // Simulate a successful transaction in demo mode
    setIsLoadingTransaction(true);
    setTransactionError(null);
    setTransactionSignature(null);
    
    // Simulate transaction processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const demoSignature = 'demo_' + Math.random().toString(36).substring(2, 15);
    setTransactionSignature(demoSignature);
    setIsLoadingTransaction(false);
    
    console.log('Demo transaction completed:', demoSignature);
    return demoSignature;
  }, []);

  const clearTransactionState = useCallback(() => {
    setTransactionError(null);
    setTransactionSignature(null);
  }, []);

  return {
    isLoadingTransaction,
    transactionError,
    transactionSignature,
    sendSwapTransaction,
    clearTransactionState,
  };
};