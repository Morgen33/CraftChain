'use client';

import { useState } from 'react';
import axios from 'axios';
import ShippingCalculator from './ShippingCalculator';
import PaymentModal from './PaymentModal';

interface BuyButtonProps {
  product: {
    id: string;
    price_usd: number;
    nft_enabled: boolean;
  };
}

export default function BuyButton({ product }: BuyButtonProps) {
  const [showShipping, setShowShipping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState<{ rateId: string; cost: number } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleBuyClick = () => {
    setShowShipping(true);
  };

  const handleShippingSelect = async (rateId: string, cost: number) => {
    setSelectedShippingRate({ rateId, cost });
    try {
      const response = await axios.post('/api/orders/create', {
        productId: product.id,
        shippingRateId: rateId,
        shippingCost: cost,
        paymentMethod: 'pending',
      });
      setOrderId(response.data.order.id);
      setShowShipping(false);
      setShowPayment(true);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create order');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    window.location.href = '/orders/success';
  };

  const totalAmount = product.price_usd + (selectedShippingRate?.cost || 0);

  return (
    <>
      <div className="border-t pt-6 space-y-4">
        {!showShipping ? (
          <button
            onClick={handleBuyClick}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 text-lg font-semibold"
          >
            Buy Now
          </button>
        ) : (
          <ShippingCalculator
            productId={product.id}
            onRateSelect={handleShippingSelect}
          />
        )}
      </div>

      {showPayment && orderId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderId={orderId}
          totalAmount={totalAmount}
          productId={product.id}
          nftEnabled={product.nft_enabled}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

