'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OKXUniversalConnectUI, THEME, WalletSession } from '@okxconnect/ui';
import {web3Service} from '../services/web3Service';

declare global {
	interface Window {
	  okxwallet?: any;
	}
  }

type AuthContextType = {
  connected: boolean;
  walletAddress: string | null;
  chainId: string | null;
  isLoading: boolean;
  error: string | null;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  clientInitialized: boolean;
  web3Service: typeof web3Service;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [client, setClient] = useState<OKXUniversalConnectUI | null>(null);
  const [clientInitialized, setClientInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initClient = async () => {
      try {
        if (!client && !isCancelled) {
          const uiClient = await OKXUniversalConnectUI.init({
            dappMetaData: {
              name: 'IncomeStream',
              icon: 'https://cryptologos.cc/logos/flow-flow-logo.png',
            },
            actionsConfiguration: {
              returnStrategy: 'none',
              modals: 'all',
            },
            uiPreferences: {
              theme: THEME.DARK,
            },
          });
          
          if (!isCancelled) {
            setClient(uiClient);
            setClientInitialized(true);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize OKX UI';
          setError(errorMessage);
          console.error('Failed to initialize OKX UI:', err);
        }
      }
    };

    if (mounted && !client && !clientInitialized) {
      void initClient();
    }

    return () => {
      isCancelled = true;
    };
  }, [mounted, client, clientInitialized]);

  const resetState = () => {
    setWalletAddress(null);
    setChainId(null);
    setConnected(false);
    setError(null);
  };

  const logIn = async () => {
    if (!client || !clientInitialized) {
      setError('OKX client not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = (await Promise.race([
        client.openModal({
          namespaces: {
            eip155: {
              chains: ['eip155:747'],
              defaultChain: '747',
            },
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ])) as WalletSession;

      if (!session?.namespaces?.eip155?.accounts?.[0]) {
        throw new Error('Invalid session response');
      }

      // Initialize web3 service with provider
      if (window.okxwallet) {
        await web3Service.initialize(window.okxwallet, 'web');
      }

      const address = session.namespaces.eip155.accounts[0].split(':')[2];
      const chain = session.namespaces.eip155.chains[0]?.split(':')[1] ?? null;

      // Verify wallet address
      const confirmedAddress = await web3Service.getWalletAddress();
      
      setWalletAddress(confirmedAddress || address);
      setChainId(chain);
      setConnected(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'Connection timeout') {
        setError('Connection timed out. Please try again.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(errorMessage);
      }
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    if (!client || !clientInitialized) {
      setError('OKX client not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.race([
        client.disconnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Disconnect timeout')), 10000)
        )
      ]);
      resetState();
    } catch (err) {
      if (err instanceof Error && err.message === 'Disconnect timeout') {
        setError('Disconnect timed out. Please try again.');
        resetState();
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
        setError(errorMessage);
      }
      console.error('Failed to disconnect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        connected,
        walletAddress,
        chainId,
        isLoading,
        error,
        logIn,
        logOut,
        clientInitialized,
        web3Service,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}