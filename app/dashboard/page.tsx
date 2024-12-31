'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wallet, Clock, ArrowRight, Loader2 } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

const Dashboard: React.FC = () => {
  const { walletAddress, web3Service } = useAuth();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [enableAutopay, setEnableAutopay] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [additionalConditions, setAdditionalConditions] = useState(false);
  const [paymentSchedules, setPaymentSchedules] = useState<any[]>([]);

  // Form states
  const [recipientWallet, setRecipientWallet] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [conditionType, setConditionType] = useState('none');
  const [conditionValue, setConditionValue] = useState('');

  // Pay Now states
  type ImmediatePaymentData = {
    recipient: string;
    amount: string;
    paymentType: string;
  };

  const [showPayNow, setShowPayNow] = useState(false);
  const [immediatePayment, setImmediatePayment] = useState({
    recipient: '',
    amount: '',
    paymentType: ''
  });

 
  useEffect(() => {
    const checkNetwork = async () => {
        if (window.okxwallet) {
            const chainId = await window.okxwallet.request({ method: 'eth_chainId' });
            if (chainId !== '0x2E3') { // 747 in hex
                toast({
                    title: 'Wrong Network',
                    description: 'Please switch to Flow Testnet',
                    variant: 'destructive'
                });
            }
        }
    };
    checkNetwork();
}, [walletAddress]);

const fetchData = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const [userBalance, schedules] = await Promise.all([
        web3Service.getUserBalance(),
        web3Service.getPaymentSchedules()
      ]);
      setBalance(userBalance);
      setPaymentSchedules(schedules);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    }
  }, [walletAddress, web3Service, toast]); // Add all dependencies
  
  useEffect(() => {
    if (walletAddress) {
      void fetchData();
    }
  }, [walletAddress, fetchData]);
  const handleAutopaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const frequency = paymentFrequency === 'daily' ? 0 : paymentFrequency === 'weekly' ? 1 : 2;
      const condition = conditionType === 'minBalance' ? 1 : conditionType === 'maxAmount' ? 2 : 0;
      
      await web3Service.createPaymentSchedule(
        recipientWallet,
        amount,
        frequency,
        Math.floor(selectedDate.getTime() / 1000),
        condition,
        conditionValue || '0',
        paymentType
      );

      toast({
        title: 'Success',
        description: 'Payment schedule created successfully',
      });

      // Reset form
      setRecipientWallet('');
      setPaymentType('');
      setAmount('');
      setConditionType('none');
      setConditionValue('');
      setEnableAutopay(false);

      await fetchData();
    } catch (error) {
      console.error('Error creating payment schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await web3Service.payNow(
        immediatePayment.recipient,
        immediatePayment.amount,
        immediatePayment.paymentType
      );

      toast({
        title: 'Success',
        description: 'Payment sent successfully',
      });

      setShowPayNow(false);
      setImmediatePayment({ recipient: '', amount: '', paymentType: '' });
      await fetchData();
    } catch (error) {
      console.error('Error sending payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to send payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const executeScheduledPayment = async (index: number) => {
    setLoading(true);
    try {
      await web3Service.executePayment(index);
      toast({
        title: 'Success',
        description: 'Payment executed successfully',
      });
      await fetchData();
    } catch (error) {
      console.error('Error executing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-300 mb-8">
            Welcome back, <span className="font-semibold text-indigo-400">{walletAddress}</span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Autopay Settings Card */}
            <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-400">Autopay Settings</CardTitle>
                <CardDescription className="text-slate-300">Configure your automatic payment settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAutopaySubmit} className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autopay"
                      checked={enableAutopay}
                      onCheckedChange={setEnableAutopay}
                      className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-slate-600"
                    />
                    <Label htmlFor="autopay" className="text-slate-200">Enable Autopay</Label>
                  </div>

                  {enableAutopay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="wallet" className="text-slate-200">Recipient Wallet Address</Label>
                        <Input
                          id="wallet"
                          value={recipientWallet}
                          onChange={(e) => setRecipientWallet(e.target.value)}
                          placeholder="0x..."
                          className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentType" className="text-slate-200">Payment Type/Name</Label>
                        <Input
                          id="paymentType"
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                          placeholder="e.g., Rent, Utilities"
                          className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-200">Payment Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-slate-200">Payment Frequency</Label>
                        <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                          <SelectTrigger id="frequency" className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="daily" className="text-white">Daily</SelectItem>
                            <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                            <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-200">Next Payment Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border border-slate-600 bg-slate-800/50 text-white"
                          classNames={{
                            day_selected: "bg-indigo-500/50 text-white hover:bg-indigo-500/75",
                            day_today: "bg-slate-700 text-white",
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="conditions"
                          checked={additionalConditions}
                          onCheckedChange={setAdditionalConditions}
                          className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-slate-600"
                        />
                        <Label htmlFor="conditions" className="text-slate-200">Add Additional Conditions</Label>
                      </div>

                      {additionalConditions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="conditionType" className="text-slate-200">Condition Type</Label>
                            <Select value={conditionType} onValueChange={setConditionType}>
                              <SelectTrigger id="conditionType" className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Select condition type" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="minBalance" className="text-white">Minimum Balance</SelectItem>
                                <SelectItem value="maxAmount" className="text-white">Maximum Amount</SelectItem>
                                <SelectItem value="none" className="text-white">No Condition</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {conditionType !== 'none' && (
                            <div className="space-y-2">
                              <Label htmlFor="conditionValue" className="text-slate-200">Condition Value</Label>
                              <Input
                                id="conditionValue"
                                value={conditionValue}
                                onChange={(e) => setConditionValue(e.target.value)}
                                placeholder="e.g., 1000"
                                className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
                              />
                            </div>
                          )}
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Save Settings
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Quick Stats Card */}
<Card className="bg-slate-800/50 border-slate-700 shadow-lg">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-2xl font-bold text-indigo-400">Quick Stats</CardTitle>
    <div className="flex space-x-2">
      <Button
        onClick={async () => {
          try {
            setLoading(true);
            await web3Service.deposit('100');
            toast({
              title: 'Success',
              description: 'Successfully deposited 100 FLOW',
            });
            await fetchData();
          } catch (error) {
            console.error('Error depositing:', error);
            toast({
              title: 'Error',
              description: 'Failed to deposit FLOW',
              variant: 'destructive'
            });
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Deposit 100 FLOW'
        )}
      </Button>
      <Button
        onClick={() => setShowPayNow(!showPayNow)}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
      >
        Pay Now
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-indigo-500/20 rounded-full">
          <Wallet className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Balance</p>
          <p className="text-2xl font-bold text-white">{balance} FLOW</p>
        </div>
      </div>
      <Button
        onClick={async () => {
          try {
            setLoading(true);
            await web3Service.withdraw(balance);
            toast({
              title: 'Success',
              description: 'Successfully withdrawn all FLOW',
            });
            await fetchData();
          } catch (error) {
            console.error('Error withdrawing:', error);
            toast({
              title: 'Error',
              description: 'Failed to withdraw FLOW',
              variant: 'destructive'
            });
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || Number(balance) <= 0}
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Withdraw All'
        )}
      </Button>
    </div>

    {showPayNow && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 border-t border-slate-700 pt-6"
      >
        <form onSubmit={handlePayNow} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="immediate-recipient" className="text-slate-200">Recipient Address</Label>
            <Input
              id="immediate-recipient"
              value={immediatePayment.recipient}
              onChange={(e) => setImmediatePayment(prev => ({...prev, recipient: e.target.value}))}
              placeholder="0x..."
              className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="immediate-amount" className="text-slate-200">Amount</Label>
            <Input
              id="immediate-amount"
              type="number"
              value={immediatePayment.amount}
              onChange={(e) => setImmediatePayment(prev => ({...prev, amount: e.target.value}))}
              placeholder="0.00"
              className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="immediate-type" className="text-slate-200">Payment Type</Label>
            <Input
              id="immediate-type"
              value={immediatePayment.paymentType}
              onChange={(e) => setImmediatePayment(prev => ({...prev, paymentType: e.target.value}))}
              placeholder="e.g., Rent, Services..."
              className="bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !immediatePayment.recipient || !immediatePayment.amount}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    )}
  </CardContent>
</Card>

              {/* Upcoming Payments Card */}
              <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-indigo-400">Upcoming Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentSchedules.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-indigo-400" />
                          <div>
                            <p className="text-slate-200">{schedule.paymentType}</p>
                            <p className="text-sm text-slate-400">
                              To: {schedule.recipient.slice(0, 6)}...{schedule.recipient.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{schedule.amount} FLOW</p>
                          <Button
                            onClick={() => executeScheduledPayment(index)}
                            disabled={loading}
                            size="sm"
                            className="mt-2 bg-indigo-500 hover:bg-indigo-600"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Execute'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {paymentSchedules.length === 0 && (
                      <p className="text-center text-slate-400">No upcoming payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;