export interface Web3Service {
    initialize: (provider: any) => Promise<void>;
    deposit: (amount: string) => Promise<void>;
    withdraw: (amount: string) => Promise<void>;
    createPaymentSchedule: (
      recipient: string,
      amount: string,
      frequency: number,
      nextPaymentDate: number,
      conditionType: number,
      conditionValue: string,
      paymentType: string
    ) => Promise<void>;
    payNow: (recipient: string, amount: string, paymentType: string) => Promise<void>;
    getUserBalance: () => Promise<string>;
    getPaymentSchedules: () => Promise<any[]>;
    executePayment: (index: number) => Promise<void>;
  }