import { useState, useCallback, useRef, useEffect } from "react";
import type { Token } from "@/types/token";
import { useJupiterQuote } from "./useJupiterQuote";
import { useTokenBalances } from "./useTokenBalances";
import { useSwapTransaction } from "./useSwapTransaction";
import { formatNumberWithCommas, removeNegativeFromInput } from "@/utils/formatters";
import { TOKENS, QUOTE_DEBOUNCE_MS } from "@/constants/tokens";

export const useSwap = () => {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isLoadingQuote,
    quoteError,
    currentQuoteResponse,
    getJupiterQuote, 
    getTokenDecimals, 
    getSwapTransaction,
    clearQuoteError,
    cancelPendingRequests
  } = useJupiterQuote();

  const {
    tokenBalances,
    isLoadingBalances,
    fetchTokenBalances,
    clearBalances,
    getTokenBalance,
  } = useTokenBalances();

  const {
    isLoadingTransaction,
    transactionError,
    transactionSignature,
    sendSwapTransaction,
    clearTransactionState,
  } = useSwapTransaction();

  // Cleanup effect to cancel pending requests for better performance
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      cancelPendingRequests();
    };
  }, [cancelPendingRequests]);

  const getDisplayBalance = useCallback((tokenSymbol: string, isAuthenticated: boolean): string => {
    if (!isAuthenticated) return "--";
    if (isLoadingBalances) return "Loading...";
    
    const balance = getTokenBalance(tokenSymbol);
    return formatNumberWithCommas(balance);
  }, [isLoadingBalances, getTokenBalance]);

  const debounceQuote = useCallback(async (value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (value && parseFloat(value) > 0) {
        // Get actual decimals for output token (with caching for faster response)
        const actualOutputDecimals = await getTokenDecimals(toToken.mint);
        const outputDecimals = actualOutputDecimals || toToken.decimals || 9;

        const outputAmount = await getJupiterQuote(
          fromToken.mint,
          toToken.mint,
          value,
          fromToken.decimals,
          outputDecimals
        );
        
        if (outputAmount !== null) {
          // Store raw number as string for accuracy
          setToAmount(outputAmount.toString());
        } else {
          setToAmount("");
        }
      }
    }, QUOTE_DEBOUNCE_MS); // Now using 150ms for much faster response
  }, [fromToken, toToken, getJupiterQuote, getTokenDecimals]);

  const handleFromAmountChange = useCallback((value: string) => {
    // Remove any negative signs and prevent negative values
    const cleanValue = removeNegativeFromInput(value);

    setFromAmount(cleanValue);
    
    if (cleanValue && parseFloat(cleanValue) > 0) {
      debounceQuote(cleanValue);
    } else {
      setToAmount("");
    }
  }, [debounceQuote]);

  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    clearQuoteError();
  }, [fromToken, toToken, fromAmount, toAmount, clearQuoteError]);

  const handleTokenSelect = useCallback((token: Token, isFromToken: boolean) => {
    // Cancel any pending quote requests for faster token switching
    cancelPendingRequests();
    
    if (isFromToken) {
      setFromToken(token);
      // Auto-switch the "to" token to the opposite
      const oppositeToken = TOKENS.find(t => t.symbol !== token.symbol);
      if (oppositeToken) {
        setToToken(oppositeToken);
      }
    } else {
      setToToken(token);
      // Auto-switch the "from" token to the opposite
      const oppositeToken = TOKENS.find(t => t.symbol !== token.symbol);
      if (oppositeToken) {
        setFromToken(oppositeToken);
      }
    }
    // Clear amounts and quote states when switching tokens
    setFromAmount("");
    setToAmount("");
    clearQuoteError();
  }, [cancelPendingRequests, clearQuoteError]);

  const handleMaxClick = useCallback(() => {
    const maxBalance = getTokenBalance(fromToken.symbol);
    handleFromAmountChange(maxBalance.toString());
  }, [fromToken.symbol, getTokenBalance, handleFromAmountChange]);

  const isInsufficientBalance = useCallback((amount: string): boolean => {
    if (!amount) return false;
    return Number.parseFloat(amount) > getTokenBalance(fromToken.symbol);
  }, [fromToken.symbol, getTokenBalance]);

  const canSwap = useCallback((amount: string, isAuthenticated: boolean): boolean => {
    if (!isAuthenticated || !amount || Number.parseFloat(amount) <= 0) return false;
    if (isLoadingQuote || isLoadingBalances || isLoadingTransaction) return false;
    if (isInsufficientBalance(amount)) return false;
    return true;
  }, [isLoadingQuote, isLoadingBalances, isLoadingTransaction, isInsufficientBalance]);

  const resetState = useCallback(() => {
    setFromAmount("");
    setToAmount("");
    clearBalances();
    clearQuoteError();
    clearTransactionState();
  }, [clearBalances, clearQuoteError, clearTransactionState]);

  const executeSwap = useCallback(async (userPublicKey: string) => {
    if (!currentQuoteResponse) {
      console.error('No quote available for swap');
      return null;
    }

    try {
      // Step 1: Get the swap transaction from Jupiter
      const swapTransaction = await getSwapTransaction(userPublicKey);
      
      if (!swapTransaction) {
        console.error('Failed to get swap transaction');
        return null;
      }

      console.log('Swap transaction ready:', {
        lastValidBlockHeight: swapTransaction.lastValidBlockHeight,
        prioritizationFeeLamports: swapTransaction.prioritizationFeeLamports,
        computeUnitLimit: swapTransaction.computeUnitLimit,
        dynamicSlippageReport: swapTransaction.dynamicSlippageReport
      });

      // Step 2: Send the transaction to the blockchain using Privy
      const signature = await sendSwapTransaction(swapTransaction, userPublicKey);
      
      if (signature) {
        console.log('Swap executed successfully with signature:', signature);
        
        // Reset form after successful swap
        setFromAmount("");
        setToAmount("");
        
        // Wait a moment for the transaction to be processed, then refresh balances
        if (userPublicKey) {
          console.log('Refreshing token balances after successful swap...');
          // Small delay to ensure transaction is processed
          setTimeout(async () => {
            try {
              await fetchTokenBalances(userPublicKey, TOKENS);
              console.log('✅ Token balances updated after swap');
            } catch (error) {
              console.error('Failed to refresh balances after swap:', error);
            }
          }, 2000); // 2 second delay
        }
        
        return signature;
      }
      
      return null;
    } catch (error) {
      console.error('Error executing swap:', error);
      return null;
    }
  }, [currentQuoteResponse, getSwapTransaction, sendSwapTransaction, fetchTokenBalances]);

  return {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    tokenBalances,
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
  };
};
