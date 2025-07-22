import { useSwapTransactionDemo } from "./useSwapTransactionDemo";

/**
 * Wrapper hook that uses demo swap transaction to prevent Privy errors
 * This ensures the app works without requiring Privy configuration
 */
export const useSwapTransactionWrapper = () => {
  // Always use demo mode to prevent Privy hooks from being called
  // This ensures the app works without proper Privy configuration
  return useSwapTransactionDemo();
};

// Export a function to check if real transactions are available
export const isRealTransactionAvailable = () => {
  try {
    require('@privy-io/react-auth/solana');
    return process.env.NEXT_PUBLIC_PRIVY_APP_ID && 
           process.env.NEXT_PUBLIC_PRIVY_APP_ID !== 'your-privy-app-id';
  } catch {
    return false;
  }
};