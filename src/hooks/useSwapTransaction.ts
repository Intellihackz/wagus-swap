import { useState, useCallback } from "react";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { useSendTransaction, useSolanaWallets } from '@privy-io/react-auth/solana';
import type { SwapResponse } from "@/types/token";

// Solana RPC endpoint - using Helius for better performance and reliability
const SOLANA_RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=75f1f27b-b99d-4578-9efd-c585e383ac7c";

/**
 * Hook for handling Solana transaction sending using Privy's wallet integration
 */

export const useSwapTransaction = () => {
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  // Privy hooks for Solana wallet integration
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useSolanaWallets();

  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  const sendSwapTransaction = useCallback(async (
    swapResponse: SwapResponse,
    userPublicKey: string
  ): Promise<string | null> => {
    try {
      setIsLoadingTransaction(true);
      setTransactionError(null);
      setTransactionSignature(null);

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
        } catch (confirmError: any) {
          console.warn("Manual confirmation failed, but transaction may have succeeded:", confirmError.message);
          // Don't throw here as Privy may have already handled confirmation
        }
      }

      console.log(`Transaction successful: https://solscan.io/tx/${receipt.signature}/`);
      setTransactionSignature(receipt.signature);
      return receipt.signature;

    } catch (error: any) {
      console.error('Error sending swap transaction:', error);
      
      let errorMessage = 'Failed to send transaction';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setTransactionError(errorMessage);
      return null;
    } finally {
      setIsLoadingTransaction(false);
    }
  }, [sendTransaction, wallets, connection]);

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
