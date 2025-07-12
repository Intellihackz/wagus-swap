import { useState, useCallback } from "react";
import type { QuoteResponse } from "@/types/token";
import { JUPITER_API_BASE, JUPITER_TOKEN_LIST, DEFAULT_SLIPPAGE_BPS } from "@/constants/tokens";

export const useJupiterQuote = () => {
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const getTokenDecimals = useCallback(async (mintAddress: string): Promise<number | null> => {
    try {
      const response = await fetch(JUPITER_TOKEN_LIST);
      if (response.ok) {
        const tokens = await response.json();
        const token = tokens.find((t: any) => t.address === mintAddress);
        if (token) {
          console.log(`Found token ${token.symbol} with ${token.decimals} decimals`);
          return token.decimals;
        }
      }
    } catch (error) {
      console.log('Could not fetch token info from Jupiter, using default decimals');
    }
    return null;
  }, []);

  const getJupiterQuote = useCallback(async (
    inputMint: string,
    outputMint: string,
    amount: string,
    decimals: number,
    outputDecimals: number
  ): Promise<number | null> => {
    try {
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      // Convert amount to lamports/atomic units
      const amountInLamports = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
      
      const response = await fetch(
        `${JUPITER_API_BASE}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=${DEFAULT_SLIPPAGE_BPS}&restrictIntermediateTokens=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const quoteData: QuoteResponse = await response.json();
      
      // Debug logging
      console.log('Jupiter API Response:', {
        inputMint,
        outputMint,
        inAmount: quoteData.inAmount,
        outAmount: quoteData.outAmount,
        inputDecimals: decimals,
        outputDecimals: outputDecimals
      });
      
      // Convert output amount back to decimal
      const outputAmount = parseFloat(quoteData.outAmount) / Math.pow(10, outputDecimals);
      
      console.log('Converted output amount:', outputAmount);
      
      return outputAmount;
    } catch (error) {
      console.error('Error fetching Jupiter quote:', error);
      setQuoteError('Failed to fetch quote');
      return null;
    } finally {
      setIsLoadingQuote(false);
    }
  }, []);

  const clearQuoteError = useCallback(() => {
    setQuoteError(null);
  }, []);

  return {
    isLoadingQuote,
    quoteError,
    getJupiterQuote,
    getTokenDecimals,
    clearQuoteError,
  };
};
