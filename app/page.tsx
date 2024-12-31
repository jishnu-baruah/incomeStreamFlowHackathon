'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import WalletConnection from '@/components/WalletConnection'
import { ArrowRight, LineChart, Shield, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-indigo-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </motion.div>
)

const HomePage: React.FC = () => {
  const router = useRouter()
  const { connected } = useAuth()

  return (
    <div className="min-h-full bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Manage Your Income Streams in One Place
          </h1>
          <p className="text-xl text-slate-400 mb-12">
            Track, analyze, and optimize multiple income sources with our Web3-powered financial management platform
          </p>
          
          {/* Wallet Connection Component */}
          <div className="max-w-sm mx-auto">
            <WalletConnection />
          </div>

          {/* Navigation to Dashboard */}
          {connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={() => router.push('/dashboard')}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose IncomeStream?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={LineChart}
              title="Real-time Analytics"
              description="Track your income streams with interactive charts and get instant insights into your financial performance."
            />
            <FeatureCard
              icon={Wallet}
              title="Multi-wallet Integration"
              description="Connect multiple wallets and manage all your crypto income sources in one unified dashboard."
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise-grade Security"
              description="Your financial data is protected with state-of-the-art encryption and multi-factor authentication."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Finances?</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of users who are already managing their income streams more efficiently
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage

