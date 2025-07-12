import React, { memo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Token } from "@/types/token";
import { TOKENS } from "@/constants/tokens";

interface TokenSelectorProps {
  token: Token;
  amount: string;
  balance: string;
  isAuthenticated: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  showMaxButton?: boolean;
  hasBalance?: boolean;
  onTokenSelect: (token: Token) => void;
  onAmountChange?: (value: string) => void;
  onMaxClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TokenSelector = memo<TokenSelectorProps>(({
  token,
  amount,
  balance,
  isAuthenticated,
  isReadOnly = false,
  placeholder = "0.00",
  showMaxButton = false,
  hasBalance = false,
  onTokenSelect,
  onAmountChange,
  onMaxClick,
  onKeyDown,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent minus key, plus key, and 'e' key (scientific notation)
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  return (
    <div className="border-2 border-white rounded-lg p-4 space-y-3 bg-black">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!isAuthenticated}
              className="border-2 border-white bg-black text-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-bold">${token.symbol}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-2 border-white bg-black">
            {TOKENS.map((tokenOption) => (
              <DropdownMenuItem
                key={tokenOption.symbol}
                onClick={() => onTokenSelect(tokenOption)}
                className="text-white hover:bg-white hover:text-black cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-bold">${tokenOption.symbol}</span>
                  <span className="text-xs opacity-70">
                    {tokenOption.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-right">
          <div className="text-xs text-white opacity-70">Balance</div>
          <div className="font-medium text-white">
            {balance}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          placeholder={placeholder}
          value={amount}
          onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
          onKeyDown={handleKeyDown}
          readOnly={isReadOnly}
          disabled={!isAuthenticated}
          className="text-right text-xl font-bold border-2 border-white bg-black text-white placeholder:text-gray-400 focus:ring-0 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {showMaxButton && isAuthenticated && hasBalance && onMaxClick && (
          <Button
            onClick={onMaxClick}
            variant="outline"
            size="sm"
            className="border-2 border-white bg-black text-white hover:bg-white hover:text-black px-3 py-1 text-xs"
          >
            MAX
          </Button>
        )}
      </div>
    </div>
  );
});

TokenSelector.displayName = "TokenSelector";
