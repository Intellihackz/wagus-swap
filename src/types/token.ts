export interface Token {
  symbol: string;
  name: string;
  balance: string;
  mint: string;
  decimals: number;
}

export interface TokenBalances {
  [key: string]: number;
}

export interface QuoteResponse {
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: unknown;
  priceImpactPct: string;
  routePlan: unknown[];
}

export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: {
    computeBudget: {
      microLamports: number;
      estimatedMicroLamports: number;
    };
  };
  dynamicSlippageReport: {
    slippageBps: number;
    otherAmount: number;
    simulatedIncurredSlippageBps: number;
    amplificationRatio: string;
    categoryName: string;
    heuristicMaxSlippageBps: number;
  };
  simulationError: string | null;
}

export interface SwapState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  isLoadingQuote: boolean;
  quoteError: string | null;
  tokenBalances: TokenBalances;
  isLoadingBalances: boolean;
}
