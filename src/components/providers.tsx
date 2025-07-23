"use client";

import React, { createContext, useContext } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { AdminProvider } from "@/contexts/AdminContext";

// Demo mode context
const DemoModeContext = createContext(false);
export const useDemoMode = () => useContext(DemoModeContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  // Use demo credentials if environment variables are not set
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  // Check if we should run in demo mode
  const isDemoMode = !appId || appId === 'your-privy-app-id-here' || appId === 'demo-app-id';
  
  // For demo purposes, if using placeholder values, render children without Privy
  if (isDemoMode) {
    return (
      <AdminProvider>
        <DemoModeContext.Provider value={true}>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </DemoModeContext.Provider>
      </AdminProvider>
    );
  }
  
  return (
    <AdminProvider>
      <DemoModeContext.Provider value={false}>
        <PrivyProvider
          appId={appId}
          clientId={clientId}
          config={{
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
              solana: {
                createOnLogin: "users-without-wallets",
              },
            },
            appearance: { walletChainType: "solana-only" },
            externalWallets: {
              solana: { connectors: toSolanaWalletConnectors() },
            },
          }}
        >
          {children}
        </PrivyProvider>
      </DemoModeContext.Provider>
    </AdminProvider>
  );
}
