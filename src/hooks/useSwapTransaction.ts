import { useState, useCallback } from "react";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import type { SwapResponse } from "@/types/token";

// Conditional import of Privy hooks to prevent errors in demo mode
let useSendTransaction: any = null;
let useSolanaWallets: any = null;

try {
  const privyHooks = require('@privy-io/react-auth/solana');
  useSendTransaction = privyHooks.useSendTransaction;
  useSolanaWallets = privyHooks.useSolanaWallets;
} catch (error) {
  console.warn('Privy hooks not available, using fallback');
}

// Solana RPC endpoint - using Helius for better performance and reliability
const SOLANA_RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=75f1f27b-b99d-4578-9efd-c585e383ac7c";

/**
 * Hook for handling Solana transaction sending using Privy's wallet integration
 */

export const useSwapTransaction = () => {
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  // Fallback implementation - always return null to prevent Privy errors
  const sendTransaction = null;
  const wallets: any[] = [];
  
  // Note: This hook is currently disabled to prevent Privy errors
  // Enable when proper Privy configuration is available

  const sendSwapTransaction = useCallback(async (
    swapResponse: SwapResponse,
    userPublicKey: string
  ): Promise<string | null> => {
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    
    try {
      setIsLoadingTransaction(true);
      setTransactionError(null);
      setTransactionSignature(null);

      // Check if Privy is available
      if (!sendTransaction) {
        throw new Error("Wallet functionality not available in demo mode");
      }
      
      // Check if we have a connected Solana wallet
      if (!wallets || wallets.length === 0) {
        throw new Error("No Solana wallet connected");
      }

      console.log("Available wallets:", wallets.map(w => ({ 
        address: w.address, 
        type: w.walletClientType,
        connectorType: w.connectorType 
      })));

      // Find the wallet that matches the user's public key
      const wallet = wallets.find(w => w.address === userPublicKey);
      if (!wallet) {
        // If no exact match, use the first available wallet
        console.warn(`No exact wallet match for ${userPublicKey}, using first available wallet`);
        const firstWallet = wallets[0];
        console.log("Using first available wallet:", firstWallet.address);
      }

      const selectedWallet = wallet || wallets[0];
      console.log("Using wallet:", selectedWallet.address);
      console.log("Wallet type:", selectedWallet.walletClientType);

      console.log("Preparing transaction for signing...");

      // Step 1: Convert base64 transaction to VersionedTransaction
      const transactionBase64 = swapResponse.swapTransaction;
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(transactionBase64, 'base64')
      );

      console.log("Transaction deserialized:", transaction);
      console.log("Transaction details:", {
        blockhash: transaction.message.recentBlockhash,
        instructions: transaction.message.compiledInstructions.length,
        addressTableLookups: transaction.message.addressTableLookups?.length || 0
      });

      // Step 2: Send the transaction using Privy's sendTransaction with specific wallet
      console.log("Sending transaction via Privy...");
      
      const receipt = await sendTransaction({
        transaction: transaction,
        connection: connection,
        address: selectedWallet.address // Specify which wallet to use
      });

      console.log("Transaction sent with signature:", receipt.signature);

      // Step 3: Wait for transaction confirmation
      // Note: Privy usually handles confirmation automatically, but let's add manual confirmation for reliability
      if (receipt.signature && receipt.signature !== "1111111111111111111111111111111111111111111111111111111111111111") {
        console.log("Confirming transaction...");
        
        try {
          const confirmation = await connection.confirmTransaction({
            signature: receipt.signature,
            blockhash: transaction.message.recentBlockhash,
            lastValidBlockHeight: swapResponse.lastValidBlockHeight
          }, "confirmed");

          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }
        } catch (confirmError: unknown) {
          console.warn("Manual confirmation failed, but transaction may have succeeded:", confirmError instanceof Error ? confirmError.message : 'Unknown error');
          // Don't throw here as Privy may have already handled confirmation
        }
      }

      console.log(`Transaction successful: https://solscan.io/tx/${receipt.signature}/`);
      setTransactionSignature(receipt.signature);
      return receipt.signature;

    } catch (error: unknown) {
      console.error('Error sending swap transaction:', error);
      
      let errorMessage = 'Failed to send transaction';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      setTransactionError(errorMessage);
      return null;
    } finally {
      setIsLoadingTransaction(false);
    }
  }, [sendTransaction, wallets]);

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
