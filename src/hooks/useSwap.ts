import { useState, useCallback, useRef } from "react";
import type { Token } from "@/types/token";
import { useJupiterQuote } from "./useJupiterQuote";
import { useTokenBalances } from "./useTokenBalances";
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
    getJupiterQuote, 
    getTokenDecimals, 
    clearQuoteError 
  } = useJupiterQuote();

  const {
    tokenBalances,
    isLoadingBalances,
    fetchTokenBalances,
    clearBalances,
    getTokenBalance,
  } = useTokenBalances();

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
        // Get actual decimals for output token
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
          // Format with commas for better readability
          const formattedAmount = formatNumberWithCommas(outputAmount);
          setToAmount(formattedAmount);
        } else {
          setToAmount("");
        }
      }
    }, QUOTE_DEBOUNCE_MS);
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
  }, [clearQuoteError]);

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
    if (isLoadingQuote || isLoadingBalances) return false;
    if (isInsufficientBalance(amount)) return false;
    return true;
  }, [isLoadingQuote, isLoadingBalances, isInsufficientBalance]);

  const resetState = useCallback(() => {
    setFromAmount("");
    setToAmount("");
    clearBalances();
    clearQuoteError();
  }, [clearBalances, clearQuoteError]);

  return {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    tokenBalances,
    isLoadingBalances,
    isLoadingQuote,
    quoteError,
    
    // Actions
    handleFromAmountChange,
    handleSwapTokens,
    handleTokenSelect,
    handleMaxClick,
    fetchTokenBalances,
    resetState,
    
    // Computed values
    getDisplayBalance,
    getTokenBalance,
    isInsufficientBalance,
    canSwap,
  };
};
