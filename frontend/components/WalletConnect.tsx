'use client';

import { useState, useEffect } from 'react';
import { connectWallet, formatAddress } from '@/lib/web3';

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      });
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { address: walletAddress } = await connectWallet();
      setAddress(walletAddress);
    } catch (error: any) {
      alert(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{formatAddress(address)}</span>
        <button
          onClick={handleDisconnect}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

