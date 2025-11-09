'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { connectWallet } from '@/lib/web3';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  productId: string;
  nftEnabled: boolean;
  onSuccess: () => void;
}

function StripeCheckoutForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      alert(error.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay with Card'}
      </button>
    </form>
  );
}

function CryptoPaymentForm({
  totalAmount,
  orderId,
  productId,
  nftEnabled,
  onSuccess,
}: {
  totalAmount: number;
  orderId: string;
  productId: string;
  nftEnabled: boolean;
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (error: any) {
      alert(error.message || 'Failed to connect wallet');
    }
  };

  const handleCryptoPayment = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post('/api/payments/crypto', {
        orderId,
        walletAddress,
        amount: totalAmount,
      });

      if (nftEnabled) {
        await axios.post('/api/nft/mint', {
          orderId,
          productId,
          ownerAddress: walletAddress,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Crypto payment error:', error);
      alert(error.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!walletAddress ? (
        <button
          onClick={handleConnectWallet}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <p className="text-lg font-semibold mt-2">Amount: ${totalAmount.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCryptoPayment}
            disabled={processing}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Pay with Crypto'}
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  productId,
  nftEnabled,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xl font-semibold mb-4">Total: ${totalAmount.toFixed(2)}</p>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`flex-1 py-2 px-4 rounded ${
                paymentMethod === 'stripe'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Credit Card
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`flex-1 py-2 px-4 rounded ${
                paymentMethod === 'crypto'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Crypto
            </button>
          </div>
        </div>

        {paymentMethod === 'stripe' ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret || undefined,
              appearance: { theme: 'stripe' },
            }}
          >
            <StripeCheckoutForm clientSecret={clientSecret || ''} onSuccess={onSuccess} />
          </Elements>
        ) : (
          <CryptoPaymentForm
            totalAmount={totalAmount}
            orderId={orderId}
            productId={productId}
            nftEnabled={nftEnabled}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}

