'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OKXUniversalConnectUI, THEME, WalletSession } from '@okxconnect/ui';
import { Contract, BrowserProvider, parseEther, formatEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contractConfig';
import { Web3Service } from '@/types/web3';

declare global {
	interface Window {
	  okxwallet?: any;
	}
  }

// Web3Service Implementation
class Web3ServiceImplementation implements Web3Service {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;

  async initialize(provider: any) {
    try {
        // Request network switch to Flow testnet
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x221' }], // 545 in hex
        });
    } catch (error: any) {
        if (error.code === 4902) {
            // If network doesn't exist, add it
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x221', // 545 in hex
                    chainName: 'EVM on Flow Testnet',
                    nativeCurrency: {
                        name: 'FLOW',
                        symbol: 'FLOW',
                        decimals: 18
                    },
                    rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
                    blockExplorerUrls: ['https://evm-testnet.flowscan.io']
                }]
            });
        }
    }

    this.provider = new BrowserProvider(provider);
    const signer = await this.provider.getSigner();
    this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  async createPaymentSchedule(
    recipient: string,
    amount: string,
    frequency: number,
    nextPaymentDate: number,
    conditionType: number,
    conditionValue: string,
    paymentType: string
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.createPaymentSchedule(
      recipient,
      parseEther(amount),
      frequency,
      nextPaymentDate,
      conditionType,
      parseEther(conditionValue),
      paymentType
    );
    await tx.wait();
  }

  async payNow(recipient: string, amount: string, paymentType: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.payNow(
      recipient,
      parseEther(amount),
      paymentType
    );
    await tx.wait();
  }

  async getUserBalance() {
    if (!this.contract) throw new Error('Contract not initialized');
    const balance = await this.contract.getUserBalance();
    return formatEther(balance);
  }

  async getPaymentSchedules() {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getUserPaymentSchedules();
  }

  async executePayment(index: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.executePayment(index);
    await tx.wait();
  }

  async deposit(amount: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.deposit({
      value: parseEther(amount)
    });
    await tx.wait();
  }

  async withdraw(amount: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.withdraw(parseEther(amount));
    await tx.wait();
  }
}

const web3Service = new Web3ServiceImplementation();

type AuthContextType = {
  connected: boolean;
  walletAddress: string | null;
  chainId: string | null;
  isLoading: boolean;
  error: string | null;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  clientInitialized: boolean;
  web3Service: Web3Service;
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
              name: 'Flow DApp',
              icon: 'https://cryptologos.cc/logos/flow-flow-logo.png',
            },
            actionsConfiguration: {
              returnStrategy: 'none',
              modals: 'all',
            },
            uiPreferences: {
              theme: THEME.LIGHT,
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

      const address = session.namespaces.eip155.accounts[0].split(':')[2];
      const chain = session.namespaces.eip155.chains[0]?.split(':')[1] ?? null;

      // Initialize web3 service with provider
      if (window.okxwallet) {
        await web3Service.initialize(window.okxwallet);
      }

      setWalletAddress(address);
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