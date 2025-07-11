"use client";

import type React from "react";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Wallet, X } from "lucide-react";
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

const tokens = [
  { symbol: "WAGUS", name: "Wagus Token", balance: "1,234.56" },
  { symbol: "USDC", name: "USD Coin", balance: "5,678.90" },
  { symbol: "SOL", name: "Solana", balance: "123.45" },
];

export default function SwapUi() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // Get wallet data from user object
  const walletAccount = user?.linkedAccounts?.find(account => account.type === 'wallet');
  const walletAddress = walletAccount && 'address' in walletAccount ? walletAccount.address : "";
  

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

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (value: string) => {
    // Remove any negative signs and prevent negative values
    const cleanValue = value.replace(/-/g, "");

    setFromAmount(cleanValue);
    // Simple mock conversion rate (in real app, this would call an API)
    if (cleanValue) {
      const rate =
        fromToken.symbol === "USDC"
          ? 0.95
          : fromToken.symbol === "SOL"
          ? 180
          : 0.001;
      setToAmount((Number.parseFloat(cleanValue) * rate).toFixed(6));
    } else {
      setToAmount("");
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
                        onClick={() => setFromToken(token)}
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
                    {authenticated ? fromToken.balance : "--"}
                  </div>
                </div>
              </div>
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
                        onClick={() => setToToken(token)}
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
                    {authenticated ? toToken.balance : "--"}
                  </div>
                </div>
              </div>
              <Input
                type="number"
                min="0"
                placeholder="0.00"
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
              disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}
            >
              {!fromAmount || Number.parseFloat(fromAmount) <= 0
                ? "Enter Amount"
                : "Swap Tokens"}
            </Button>
          )}

          {/* Exchange Rate Info */}
          {authenticated && fromAmount && toAmount && (
            <div className="text-center text-sm text-white opacity-70 border-t-2 border-white pt-4">
              1 ${fromToken.symbol} ={" "}
              {(
                Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)
              ).toFixed(6)}{" "}
              ${toToken.symbol}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
