'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Wallet, Clock, ArrowRight } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { walletAddress } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [enableAutopay, setEnableAutopay] = useState(false)
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  const [additionalConditions, setAdditionalConditions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-300 mb-8">Welcome back, <span className="font-semibold text-indigo-400">{walletAddress}</span></p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-400">Autopay Settings</CardTitle>
                <CardDescription className="text-slate-300">Configure your automatic payment settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <Input id="wallet" placeholder="0x..." className="bg-slate-700/50 border-slate-600 focus:border-[#1e40af] focus:outline-none active:border-[#1e40af] text-white placeholder-slate-400" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentType" className="text-slate-200">Payment Type/Name</Label>
                        <Input id="paymentType" placeholder="e.g., Rent, Utilities" className="bg-slate-700/50 border-slate-600 focus:border-[#1e40af] focus:outline-none active:border-[#1e40af] text-white placeholder-slate-400" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-200">Payment Amount</Label>
                        <Input id="amount" type="number" placeholder="0.00" className="bg-slate-700/50 border-slate-600 focus:border-[#1e40af] focus:outline-none active:border-[#1e40af] text-white placeholder-slate-400" />
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
                            <Select>
                              <SelectTrigger id="conditionType" className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Select condition type" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="minBalance" className="text-white">Minimum Balance</SelectItem>
                                <SelectItem value="maxAmount" className="text-white">Maximum Amount</SelectItem>
                                <SelectItem value="custom" className="text-white">Custom Condition</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="conditionValue" className="text-slate-200">Condition Value</Label>
                            <Input id="conditionValue" placeholder="e.g., 1000" className="bg-slate-700/50 border-slate-600 focus:border-[#1e40af] focus:outline-none active:border-[#1e40af] text-white placeholder-slate-400" />
                          </div>
                        </motion.div>
                      )}

                      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                        Save Settings
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-indigo-400">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/20 rounded-full">
                      <Wallet className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Balance</p>
                      <p className="text-2xl font-bold text-white">$10,234.56</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-indigo-400">Upcoming Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        <p className="text-slate-200">Monthly Rent</p>
                      </div>
                      <p className="font-semibold text-white">$1,200.00</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        <p className="text-slate-200">Utilities</p>
                      </div>
                      <p className="font-semibold text-white">$150.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

