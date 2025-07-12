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
  platformFee?: any;
  priceImpactPct: string;
  routePlan: any[];
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
