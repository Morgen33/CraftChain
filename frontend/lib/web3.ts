import { ethers } from 'ethers';

export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
}

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

