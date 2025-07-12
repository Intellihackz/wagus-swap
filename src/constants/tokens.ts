import { Connection } from "@solana/web3.js";
import type { Token } from "@/types/token";

// Solana connection - Using Helius RPC with API key for better reliability
export const SOLANA_CONNECTION = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=75f1f27b-b99d-4578-9efd-c585e383ac7c", 
  "confirmed"
);

export const TOKENS: Token[] = [
  { 
    symbol: "WAGUS", 
    name: "Wagus Token", 
    balance: "1,234.56",
    mint: "7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump", // WAGUS token mint
    decimals: 6 // Many tokens use 6 decimals instead of 9
  },
  { 
    symbol: "SOL", 
    name: "Solana", 
    balance: "123.45",
    mint: "So11111111111111111111111111111111111111112", // SOL mint (wrapped SOL)
    decimals: 9
  },
];

export const JUPITER_API_BASE = "https://lite-api.jup.ag/swap/v1";
export const JUPITER_TOKEN_LIST = "https://token.jup.ag/all";

export const DEFAULT_SLIPPAGE_BPS = 50;
export const QUOTE_DEBOUNCE_MS = 500;
