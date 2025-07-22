'use client';

import React, { useState } from 'react';
import { Settings, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { UserTier } from '@/types/theme';
import { TIER_BENEFITS } from '@/constants/themes';

interface AdminToggleProps {
  className?: string;
}

export function AdminToggle({ className = '' }: AdminToggleProps) {
  const {
    isAdminMode,
    toggleAdminMode,
    adminTier,
    setAdminTier,
    adminWalletConnected,
    setAdminWalletConnected,
    resetAdminState
  } = useAdmin();
  
  const [isOpen, setIsOpen] = useState(false);

  const tierOptions = Object.values(UserTier).map(tier => {
    const benefits = TIER_BENEFITS.find(b => b.tier === tier);
    return {
      value: tier,
      label: benefits?.name || tier,
      color: benefits?.color || '#64748b'
    };
  });

  return (
    <div className={`relative ${className}`}>
      {/* Admin Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
          ${isAdminMode 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10' 
            : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
          }
        `}
        title="Admin Controls"
      >
        {isAdminMode ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">ADMIN</span>
          </>
        ) : (
          <>
            <Settings className="h-4 w-4" />
            <span className="text-xs">Admin</span>
          </>
        )}
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Admin Controls</h3>
              </div>

              {/* Admin Mode Toggle */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Admin Mode
                  </label>
                  <button
                    onClick={toggleAdminMode}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${isAdminMode ? 'bg-red-500' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {isAdminMode 
                    ? 'Bypass all restrictions and access all features' 
                    : 'Enable to access admin features'
                  }
                </p>
              </div>

              {/* Admin Controls (only show when admin mode is enabled) */}
              {isAdminMode && (
                <div className="space-y-4 border-t border-gray-700/50 pt-4">
                  {/* Tier Override */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Override Tier
                    </label>
                    <select
                      value={adminTier}
                      onChange={(e) => setAdminTier(e.target.value as UserTier)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {tierOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Wallet Connection Override */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        Simulate Wallet Connected
                      </label>
                      <button
                        onClick={() => setAdminWalletConnected(!adminWalletConnected)}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                          ${adminWalletConnected 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-600/20 text-gray-400'
                          }
                        `}
                      >
                        {adminWalletConnected ? (
                          <>
                            <Eye className="h-3 w-3" />
                            Connected
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Disconnected
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Override wallet connection status for testing
                    </p>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      resetAdminState();
                      setIsOpen(false);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Reset Admin State
                  </button>
                </div>
              )}

              {/* Warning */}
              {isAdminMode && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">
                    ⚠️ Admin mode is active. All restrictions are bypassed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}