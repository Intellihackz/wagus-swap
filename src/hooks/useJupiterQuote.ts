import { useState, useCallback, useRef } from "react";
import type { QuoteResponse, SwapResponse } from "@/types/token";
import { JUPITER_API_BASE, JUPITER_TOKEN_LIST, DEFAULT_SLIPPAGE_BPS } from "@/constants/tokens";

export const useJupiterQuote = () => {
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [currentQuoteResponse, setCurrentQuoteResponse] = useState<QuoteResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const tokenDecimalsCache = useRef<Map<string, number>>(new Map());

  const getTokenDecimals = useCallback(async (mintAddress: string): Promise<number | null> => {
    // Check cache first for faster response
    if (tokenDecimalsCache.current.has(mintAddress)) {
      return tokenDecimalsCache.current.get(mintAddress)!;
    }

    try {
      const response = await fetch(JUPITER_TOKEN_LIST, {
        signal: AbortSignal.timeout(2000), // 2 second timeout for faster fallback
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      });
      
      if (response.ok) {
        const tokens = await response.json();
        const token = tokens.find((t: { address: string; symbol: string; decimals: number }) => t.address === mintAddress);
        if (token) {
          console.log(`Found token ${token.symbol} with ${token.decimals} decimals`);
          
          // Cache the result for faster future lookups
          tokenDecimalsCache.current.set(mintAddress, token.decimals);
          return token.decimals;
        }
      }
    } catch {
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
      // Cancel any pending request for faster response
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      // Convert amount to lamports/atomic units
      const amountInLamports = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
      
      // Build optimized URL with parameters
      const url = new URL(`${JUPITER_API_BASE}/quote`);
      url.searchParams.set('inputMint', inputMint);
      url.searchParams.set('outputMint', outputMint);
      url.searchParams.set('amount', amountInLamports.toString());
      url.searchParams.set('slippageBps', DEFAULT_SLIPPAGE_BPS.toString());
      url.searchParams.set('restrictIntermediateTokens', 'false'); // Allow intermediate tokens for better prices
      url.searchParams.set('onlyDirectRoutes', 'false'); // Allow multi-hop routes
      url.searchParams.set('asLegacyTransaction', 'false'); // Use versioned transactions
      url.searchParams.set('maxAccounts', '64'); // Optimize for faster processing
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive' // Reuse connections for faster requests
        },
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const quoteData: QuoteResponse = await response.json();
      
      // Store the full quote response for later use in swap
      setCurrentQuoteResponse(quoteData);
      
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
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Quote request was cancelled');
        return null;
      }
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

  const getSwapTransaction = useCallback(async (
    userPublicKey: string
  ): Promise<SwapResponse | null> => {
    if (!currentQuoteResponse) {
      setQuoteError('No quote available. Please get a quote first.');
      return null;
    }

    try {
      setIsLoadingQuote(true);
      setQuoteError(null);

      const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: currentQuoteResponse,
          userPublicKey: userPublicKey,
          
          // ADDITIONAL PARAMETERS TO OPTIMIZE FOR TRANSACTION LANDING
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 1000000,
              priorityLevel: "veryHigh"
            }
          }
        })
      });

      if (!swapResponse.ok) {
        throw new Error(`HTTP error! status: ${swapResponse.status}`);
      }

      const swapData: SwapResponse = await swapResponse.json();
      
      console.log('Swap transaction response:', swapData);
      
      return swapData;
    } catch (error: unknown) {
      console.error('Error getting swap transaction:', error);
      setQuoteError('Failed to get swap transaction');
      return null;
    } finally {
      setIsLoadingQuote(false);
    }
  }, [currentQuoteResponse]);

  // Cleanup function to cancel pending requests
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isLoadingQuote,
    quoteError,
    currentQuoteResponse,
    getJupiterQuote,
    getTokenDecimals,
    getSwapTransaction,
    clearQuoteError,
    cancelPendingRequests,
  };
};
