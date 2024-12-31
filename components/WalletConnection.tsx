'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function WalletConnection() {
  const { connected, walletAddress, chainId, isLoading, error, logIn, logOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="card-title">OKX Wallet Connect</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {connected ? (
          <div>
            <p className="card-subtitle">Thanks for connecting your wallet!</p>
            <div className="space-y-4">
              <p className="connected-text">
                Wallet Address:{' '}
                {walletAddress && (
                  <span className="connected-username" title={walletAddress}>
                    {truncateAddress(walletAddress)}
                  </span>
                )}
              </p>
              {chainId && (
                <p className="connected-text">
                  Chain ID: <span className="connected-username">{chainId}</span>
                </p>
              )}
              <button
                onClick={() => void logOut()}
                disabled={isLoading}
                className={`button button-disconnect ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                type="button"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Wallet'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="card-subtitle">Connect your wallet with OKX</p>
            <button
              onClick={() => void logIn()}
              disabled={isLoading}
              className={`button button-connect ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="button"
            >
              {isLoading ? 'Connecting...' : 'Connect OKX Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}