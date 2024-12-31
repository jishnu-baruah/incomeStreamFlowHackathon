'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';

export default function WalletConnection() {
  const { connected, walletAddress, chainId, isLoading, error, logIn, logOut, clientInitialized } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = useCallback(async () => {
    if (isConnecting || !clientInitialized) return;
    
    setIsConnecting(true);
    try {
      await logIn();
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Connection error:', error);
      localStorage.removeItem('walletConnected');
    } finally {
      setIsConnecting(false);
    }
  }, [logIn, isConnecting, clientInitialized]);

  const handleDisconnect = async () => {
    try {
      await logOut();
      localStorage.removeItem('walletConnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check for existing connection
  useEffect(() => {
    if (mounted && clientInitialized && !connected && !isLoading && !isConnecting) {
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (wasConnected) {
        handleConnect();
      }
    }
  }, [mounted, clientInitialized, connected, isLoading, isConnecting, handleConnect]);

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
                onClick={() => void handleDisconnect()}
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
              onClick={() => void handleConnect()}
              disabled={isLoading || isConnecting || !clientInitialized}
              className={`button button-connect ${
                (isLoading || isConnecting || !clientInitialized) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="button"
            >
              {!clientInitialized ? 'Initializing...' : 
               isLoading || isConnecting ? 'Connecting...' : 
               'Connect OKX Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}