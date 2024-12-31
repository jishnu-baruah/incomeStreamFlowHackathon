'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function WalletConnection() {
  const { connected, walletAddress, chainId, isLoading, error, logIn, logOut, clientInitialized } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = useCallback(async () => {
    if (isConnecting || !clientInitialized) return
    
    setIsConnecting(true)
    try {
      await logIn()
      localStorage.setItem('walletConnected', 'true')
      setShouldAutoConnect(true)
    } catch (error) {
      console.error('Connection error:', error)
      localStorage.removeItem('walletConnected')
      setShouldAutoConnect(false)
    } finally {
      setIsConnecting(false)
    }
  }, [logIn, isConnecting, clientInitialized])

  const handleDisconnect = async () => {
    try {
      await logOut()
      localStorage.removeItem('walletConnected')
      setShouldAutoConnect(false)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    if (mounted && clientInitialized && !connected && !isLoading && !isConnecting && shouldAutoConnect) {
      const wasConnected = localStorage.getItem('walletConnected') === 'true'
      if (wasConnected) {
        handleConnect()
      }
    }
  }, [mounted, clientInitialized, connected, isLoading, isConnecting, handleConnect, shouldAutoConnect])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {connected ? (
        <div className="space-y-4">
          <p className="text-center text-slate-300">
            Connected: <span className="font-mono bg-slate-700 px-2 py-1 rounded">{truncateAddress(walletAddress!)}</span>
          </p>
          {chainId && (
            <p className="text-center text-slate-400">
              Chain ID: <span className="font-mono">{chainId}</span>
            </p>
          )}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => void handleDisconnect()}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => void handleConnect()}
          disabled={isLoading || isConnecting || !clientInitialized}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {!clientInitialized ? 'Initializing...' : 
           isLoading || isConnecting ? 'Connecting...' : 
           'Connect Wallet'}
        </Button>
      )}
    </div>
  )
}

