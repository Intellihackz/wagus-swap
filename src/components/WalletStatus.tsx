import React, { memo } from "react";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWalletAddress } from "@/utils/formatters";

interface WalletStatusProps {
  walletAddress: string;
  onDisconnect: () => void;
}

export const WalletStatus = memo<WalletStatusProps>(({ walletAddress, onDisconnect }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-2 border-2 border-white rounded-lg px-3 py-2 bg-black">
        <Wallet className="h-4 w-4 text-white" />
        <div className="flex flex-col">
          <span 
            className="text-white font-mono text-sm cursor-pointer hover:bg-white hover:text-black px-1 rounded transition-colors"
            onClick={copyToClipboard}
            title="Click to copy address"
          >
            {formatWalletAddress(walletAddress)}
          </span>
        </div>
        <Button
          onClick={onDisconnect}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-white hover:bg-white hover:text-black"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

WalletStatus.displayName = "WalletStatus";
