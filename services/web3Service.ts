import { Contract, BrowserProvider, parseEther, formatEther } from 'ethers';
import { Web3Service } from '@/types/web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contractConfig';

// Platform-agnostic Web3 Service Implementation
class UniversalWeb3ServiceImplementation implements Web3Service {
  private provider: BrowserProvider | any | null = null;
  private contract: Contract | null = null;
  private signer: any | null = null;

  // Universal initialization method supporting multiple platforms
  async initialize(provider: any, platform: 'web' | 'telegram' = 'web') {
    try {
      // Network switch logic for Flow testnet
      if (platform === 'web' || platform === 'telegram') {
        await this.switchToFlowTestnet(provider);
      }

      // Initialize provider based on platform
      if (platform === 'web') {
        this.provider = new BrowserProvider(provider);
        this.signer = await this.provider.getSigner();
      } else {
        // For Telegram or other platforms
        this.provider = provider;
        this.signer = provider; // Adjust based on specific Telegram wallet provider
      }

      // Create contract instance
      this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  // Network switching method
  private async switchToFlowTestnet(provider: any) {
    try {
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
      } else {
        throw error;
      }
    }
  }

  // Ensure contract is initialized before transactions
  private async ensureContractInitialized() {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
  }

  async deposit(amount: string) {
    await this.ensureContractInitialized();
    
    const tx = await this.contract!.deposit({
      value: parseEther(amount)
    });
    
    return tx.wait();
  }

  async withdraw(amount: string) {
    await this.ensureContractInitialized();
    
    const tx = await this.contract!.withdraw(parseEther(amount));
    return tx.wait();
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
    await this.ensureContractInitialized();
    
    const tx = await this.contract!.createPaymentSchedule(
      recipient,
      parseEther(amount),
      frequency,
      nextPaymentDate,
      conditionType,
      parseEther(conditionValue),
      paymentType
    );
    
    return tx.wait();
  }

  async payNow(recipient: string, amount: string, paymentType: string) {
    await this.ensureContractInitialized();
    
    const tx = await this.contract!.payNow(
      recipient,
      parseEther(amount),
      paymentType
    );
    
    return tx.wait();
  }

  async getUserBalance() {
    await this.ensureContractInitialized();
    
    const balance = await this.contract!.getUserBalance();
    return formatEther(balance);
  }

  async getPaymentSchedules() {
    await this.ensureContractInitialized();
    
    return await this.contract!.getUserPaymentSchedules();
  }

  async executePayment(index: number) {
    await this.ensureContractInitialized();
    
    const tx = await this.contract!.executePayment(index);
    return tx.wait();
  }

  // Utility method to get current wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      await this.ensureContractInitialized();
      
      // For web (BrowserProvider)
      if (this.provider instanceof BrowserProvider) {
        const signer = await this.provider.getSigner();
        return await signer.getAddress();
      }
      
      // For other platforms, add specific address retrieval logic
      return null;
    } catch (error) {
      console.error('Error retrieving wallet address:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const web3Service = new UniversalWeb3ServiceImplementation();

export default web3Service;