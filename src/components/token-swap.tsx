"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, ChevronDown, Wallet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";

// Solana connection - Using Helius RPC with API key for better reliability
const SOLANA_CONNECTION = new Connection("https://mainnet.helius-rpc.com/?api-key=75f1f27b-b99d-4578-9efd-c585e383ac7c", "confirmed");

const tokens = [
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

export default function SwapUi() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  
  // State to store actual token balances
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: number}>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Get wallet data from user object
  const walletAccount = user?.linkedAccounts?.find(account => account.type === 'wallet');
  const walletAddress = walletAccount && 'address' in walletAccount ? walletAccount.address : "";

  // Function to get token info from Jupiter's token list
  const getTokenDecimals = async (mintAddress: string) => {
    try {
      const response = await fetch('https://token.jup.ag/all');
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
  };

  // Function to get quote from Jupiter API
  const getJupiterQuote = async (inputMint: string, outputMint: string, amount: string, decimals: number) => {
    try {
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      // Get actual decimals for output token
      const actualOutputDecimals = await getTokenDecimals(outputMint);
      const outputToken = tokens.find(token => token.mint === outputMint);
      const outputDecimals = actualOutputDecimals || outputToken?.decimals || 9;
      
      // Convert amount to lamports/atomic units
      const amountInLamports = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
      
      const response = await fetch(
        `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=50&restrictIntermediateTokens=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const quoteData = await response.json();
      
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
  };
  

  const handleConnectWallet = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await logout();
      setFromAmount("");
      setToAmount("");
      setTokenBalances({});
      setIsLoadingBalances(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Debug logging to see user data
  if (authenticated && user) {
    console.log('User data:', {
      userId: user.id,
      linkedAccounts: user.linkedAccounts?.map(account => ({
        type: account.type,
        address: 'address' in account ? account.address : 'No address'
      })),
      walletAddress: walletAddress,
    });
  }

  // Effect to get token addresses when wallet is connected
  useEffect(() => {
    if (authenticated && walletAddress) {
      getUserTokenAddresses(walletAddress);
    }
  }, [authenticated, walletAddress]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setQuoteError(null);
    setIsLoadingQuote(false);
  };

  // Debounced quote fetching
  const debounceQuote = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (value && parseFloat(value) > 0) {
            const outputAmount = await getJupiterQuote(
              fromToken.mint,
              toToken.mint,
              value,
              fromToken.decimals
            );
            
            if (outputAmount !== null) {
              // Format with commas for better readability
              const formattedAmount = formatNumberWithCommas(outputAmount);
              setToAmount(formattedAmount);
            } else {
              setToAmount("");
            }
          }
        }, 500); // 500ms delay
      };
    })(),
    [fromToken, toToken]
  );

  const handleFromAmountChange = (value: string) => {
    // Remove any negative signs and prevent negative values
    const cleanValue = value.replace(/-/g, "");

    setFromAmount(cleanValue);
    
    if (cleanValue && parseFloat(cleanValue) > 0) {
      setIsLoadingQuote(true);
      debounceQuote(cleanValue);
    } else {
      setToAmount("");
      setIsLoadingQuote(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent minus key, plus key, and 'e' key (scientific notation)
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Helper function to get actual token balance
  const getTokenBalance = (tokenSymbol: string): number => {
    return tokenBalances[tokenSymbol] || 0;
  };

  // Helper function to format balance for display
  const getDisplayBalance = (tokenSymbol: string): string => {
    if (!authenticated) return "--";
    if (isLoadingBalances) return "Loading...";
    
    const balance = getTokenBalance(tokenSymbol);
    return formatNumberWithCommas(balance);
  };

  // Function to format numbers with commas
  const formatNumberWithCommas = (num: number): string => {
    let formattedNumber;
    
    if (num < 0.0001) {
      // Use 10 decimal places for very small numbers
      formattedNumber = num.toFixed(10);
    } else if (num < 1) {
      // Use 8 decimal places for small numbers
      formattedNumber = num.toFixed(8);
    } else {
      // Use 6 decimal places for normal numbers
      formattedNumber = num.toFixed(6);
    }
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = formattedNumber.split('.');
    
    // Add commas to integer part
    const formattedInteger = parseInt(integerPart).toLocaleString();
    
    // Return with decimal part if it exists
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  // Function to get user's token addresses
  const getUserTokenAddresses = async (walletAddress: string) => {
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
      const newBalances: {[key: string]: number} = {};
      results.forEach(result => {
        newBalances[result.symbol] = result.balance;
      });
      
      setTokenBalances(newBalances);
      setIsLoadingBalances(false);
      
    } catch (error) {
      console.error("❌ Error getting token addresses:", error);
      setIsLoadingBalances(false);
    }
  };

  // Function to get SOL balance using native getBalance method
  const getSolBalance = async (connection: Connection, walletAddress: string) => {
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
  };

  // Function to get token balance using SPL Token API
  const getTokenBalanceSpl = async (connection: Connection, tokenAccount: PublicKey, tokenSymbol: string) => {
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
  };

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Wallet Status - Upper Right Corner */}
      {authenticated && walletAddress && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 border-2 border-white rounded-lg px-3 py-2 bg-black">
            <Wallet className="h-4 w-4 text-white" />
            <div className="flex flex-col">
              <span 
                className="text-white font-mono text-sm cursor-pointer hover:bg-white hover:text-black px-1 rounded transition-colors"
                onClick={() => navigator.clipboard.writeText(walletAddress)}
                title="Click to copy address"
              >
                {formatAddress(walletAddress)}
              </span>
              
            </div>
            <Button
              onClick={handleDisconnectWallet}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white hover:text-black"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md border-2 border-white bg-black">
        <CardHeader className="text-center border-b-2 border-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/wagus-logo.png"
              alt="WAGUS Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <CardTitle className="text-2xl font-bold text-white">
              WAGUS Swap
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* From Token Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">From</Label>
            <div className="border-2 border-white rounded-lg p-4 space-y-3 bg-black">
              <div className="flex justify-between items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!authenticated}
                      className="border-2 border-white bg-black text-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-bold">${fromToken.symbol}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-2 border-white bg-black">
                    {tokens.map((token) => (
                      <DropdownMenuItem
                        key={token.symbol}
                        onClick={() => {
                          setFromToken(token);
                          // Auto-switch the "to" token to the opposite
                          const oppositeToken = tokens.find(t => t.symbol !== token.symbol);
                          if (oppositeToken) {
                            setToToken(oppositeToken);
                          }
                          // Clear amounts and quote states when switching tokens
                          setFromAmount("");
                          setToAmount("");
                          setQuoteError(null);
                          setIsLoadingQuote(false);
                        }}
                        className="text-white hover:bg-white hover:text-black cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">${token.symbol}</span>
                          <span className="text-xs opacity-70">
                            {token.name}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="text-right">
                  <div className="text-xs text-white opacity-70">Balance</div>
                  <div className="font-medium text-white">
                    {getDisplayBalance(fromToken.symbol)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!authenticated}
                  className="text-right text-xl font-bold border-2 border-white bg-black text-white placeholder:text-gray-400 focus:ring-0 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {authenticated && getTokenBalance(fromToken.symbol) > 0 && (
                  <Button
                    onClick={() => {
                      const maxBalance = getTokenBalance(fromToken.symbol);
                      handleFromAmountChange(maxBalance.toString());
                    }}
                    variant="outline"
                    size="sm"
                    className="border-2 border-white bg-black text-white hover:bg-white hover:text-black px-3 py-1 text-xs"
                  >
                    MAX
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwapTokens}
              variant="outline"
              size="icon"
              disabled={!authenticated}
              className="border-2 border-white bg-black text-white hover:bg-white hover:text-black rounded-full h-10 w-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">To</Label>
            <div className="border-2 border-white rounded-lg p-4 space-y-3 bg-black">
              <div className="flex justify-between items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!authenticated}
                      className="border-2 border-white bg-black text-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-bold">${toToken.symbol}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-2 border-white bg-black">
                    {tokens.map((token) => (
                      <DropdownMenuItem
                        key={token.symbol}
                        onClick={() => {
                          setToToken(token);
                          // Auto-switch the "from" token to the opposite
                          const oppositeToken = tokens.find(t => t.symbol !== token.symbol);
                          if (oppositeToken) {
                            setFromToken(oppositeToken);
                          }
                          // Clear amounts and quote states when switching tokens
                          setFromAmount("");
                          setToAmount("");
                          setQuoteError(null);
                          setIsLoadingQuote(false);
                        }}
                        className="text-white hover:bg-white hover:text-black cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">${token.symbol}</span>
                          <span className="text-xs opacity-70">
                            {token.name}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="text-right">
                  <div className="text-xs text-white opacity-70">Balance</div>
                  <div className="font-medium text-white">
                    {getDisplayBalance(toToken.symbol)}
                  </div>
                </div>
              </div>
              <Input
                type="number"
                min="0"
                placeholder={isLoadingQuote ? "Loading..." : "0.00"}
                value={toAmount}
                readOnly
                disabled={!authenticated}
                className="text-right text-xl font-bold border-2 border-white bg-black text-white placeholder:text-gray-400 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Main Action Button */}
          {!authenticated ? (
            <Button
              onClick={handleConnectWallet}
              className="w-full bg-white text-black hover:bg-black hover:text-white border-2 border-white font-bold py-3 text-lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          ) : (
            <Button
              className="w-full bg-white text-black hover:bg-black hover:text-white border-2 border-white font-bold py-3 text-lg"
              disabled={
                !fromAmount || 
                Number.parseFloat(fromAmount) <= 0 || 
                isLoadingQuote ||
                isLoadingBalances ||
                Number.parseFloat(fromAmount) > getTokenBalance(fromToken.symbol)
              }
            >
              {isLoadingQuote ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Quote...
                </>
              ) : isLoadingBalances ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading Balances...
                </>
              ) : !fromAmount || Number.parseFloat(fromAmount) <= 0 ? (
                "Enter Amount"
              ) : Number.parseFloat(fromAmount) > getTokenBalance(fromToken.symbol) ? (
                "Insufficient Balance"
              ) : (
                "Swap Tokens"
              )}
            </Button>
          )}

          {/* Insufficient Balance Warning */}
          {authenticated && fromAmount && Number.parseFloat(fromAmount) > getTokenBalance(fromToken.symbol) && (
            <div className="text-center text-sm text-red-400 border-t-2 border-white pt-4">
              Insufficient {fromToken.symbol} balance. Available: {getDisplayBalance(fromToken.symbol)}
            </div>
          )}

          {/* Exchange Rate Info */}
          {authenticated && fromAmount && toAmount && !isLoadingQuote && (
            <div className="text-center text-sm text-white opacity-70 border-t-2 border-white pt-4">
              1 ${fromToken.symbol} ={" "}
              {(() => {
                const rate = Number.parseFloat(toAmount.replace(/,/g, '')) / Number.parseFloat(fromAmount.replace(/,/g, ''));
                return formatNumberWithCommas(rate);
              })()} ${toToken.symbol}
            </div>
          )}

          {/* Quote Error */}
          {quoteError && (
            <div className="text-center text-sm text-red-400 border-t-2 border-white pt-4">
              {quoteError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
