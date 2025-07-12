import { useState, useCallback } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
import type { Token, TokenBalances } from "@/types/token";
import { SOLANA_CONNECTION } from "@/constants/tokens";

export const useTokenBalances = () => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const getSolBalance = useCallback(async (connection: Connection, walletAddress: string): Promise<number | null> => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`💰 SOL Balance (using native getBalance):`, solBalance);
      return solBalance;
    } catch (error) {
      console.log(`❌ Error getting SOL balance:`, error);
      return null;
    }
  }, []);

  const getTokenBalanceSpl = useCallback(async (
    connection: Connection, 
    tokenAccount: PublicKey, 
    tokenSymbol: string
  ): Promise<number | null> => {
    try {
      const info = await getAccount(connection, tokenAccount);
      const amount = Number(info.amount);
      const mint = await getMint(connection, info.mint);
      const balance = amount / (10 ** mint.decimals);
      
      console.log(`💰 ${tokenSymbol} Balance (using SPL Token API):`, balance);
      return balance;
    } catch (error) {
      console.log(`❌ Error getting ${tokenSymbol} balance:`, error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        // Account doesn't exist (normal for new wallets)
        if (error.message.includes('could not find account') || 
            error.message.includes('Invalid param: could not find account') ||
            error.message.includes('Account does not exist')) {
          console.log(`💰 ${tokenSymbol} Balance: 0 (account not created yet)`);
          return 0;
        }
        
        // RPC rate limit or access denied
        if (error.message.includes('403') || error.message.includes('Access forbidden')) {
          console.log(`⚠️ ${tokenSymbol} Balance: Unable to fetch (RPC rate limit - try again later)`);
          return null;
        }
        
        // Other RPC errors
        if (error.message.includes('failed to get info about account')) {
          console.log(`⚠️ ${tokenSymbol} Balance: RPC error (try refreshing)`);
          return null;
        }
      }
      
      // Unknown error
      return null;
    }
  }, []);

  const fetchTokenBalances = useCallback(async (walletAddress: string, tokens: Token[]) => {
    try {
      if (!walletAddress) {
        console.log("❌ No wallet address available");
        return;
      }

      setIsLoadingBalances(true);
      const WALLET = new PublicKey(walletAddress);
      
      console.log("🔍 Getting token addresses for wallet:", walletAddress);
      
      const balancePromises = tokens.map(async (token) => {
        try {
          if (token.symbol === "SOL") {
            // For SOL, use native getBalance method
            console.log(`✅ ${token.symbol} (${token.name}) - using native balance method`);
            const balance = await getSolBalance(SOLANA_CONNECTION, walletAddress);
            return { symbol: token.symbol, balance: balance || 0 };
          } else {
            // For SPL tokens, use associated token account method
            const MINT = new PublicKey(token.mint);
            const associatedTokenAddress = getAssociatedTokenAddressSync(MINT, WALLET);
            
            console.log(
              `✅ ${token.symbol} (${token.name}) associated token address:`,
              associatedTokenAddress.toBase58()
            );

            // Get the actual token balance
            const balance = await getTokenBalanceSpl(SOLANA_CONNECTION, associatedTokenAddress, token.symbol);
            return { symbol: token.symbol, balance: balance || 0 };
          }
        } catch (error) {
          console.log(`❌ Error getting ${token.symbol} token address:`, error);
          return { symbol: token.symbol, balance: 0 };
        }
      });

      // Wait for all balance fetches to complete
      const results = await Promise.all(balancePromises);
      
      // Update state with fetched balances
      const newBalances: TokenBalances = {};
      results.forEach(result => {
        newBalances[result.symbol] = result.balance;
      });
      
      setTokenBalances(newBalances);
      
    } catch (error) {
      console.error("❌ Error getting token addresses:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [getSolBalance, getTokenBalanceSpl]);

  const clearBalances = useCallback(() => {
    setTokenBalances({});
    setIsLoadingBalances(false);
  }, []);

  const getTokenBalance = useCallback((tokenSymbol: string): number => {
    return tokenBalances[tokenSymbol] || 0;
  }, [tokenBalances]);

  return {
    tokenBalances,
    isLoadingBalances,
    fetchTokenBalances,
    clearBalances,
    getTokenBalance,
  };
};
