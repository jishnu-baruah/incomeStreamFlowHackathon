import { Contract, BrowserProvider, parseEther, formatEther } from 'ethers';
import { Web3Service } from '@/types/web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contractConfig';

class Web3ServiceImplementation implements Web3Service {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;

  async initialize(provider: any) {
    this.provider = new BrowserProvider(provider);
    const signer = await this.provider.getSigner();
    this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
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
}

export const web3Service = new Web3ServiceImplementation();