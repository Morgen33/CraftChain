'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';

interface ShippingRate {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: {
    name: string;
  };
  estimated_days?: number;
}

interface ShippingCalculatorProps {
  productId: string;
  onRateSelect: (rateId: string, cost: number) => void;
}

export default function ShippingCalculator({ productId, onRateSelect }: ShippingCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const calculateRates = async () => {
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      alert('Please fill in all required shipping address fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/shipping/rates', {
        productId,
        shippingAddress,
      });
      setRates(response.data.rates);
    } catch (error: any) {
      console.error('Shipping calculation error:', error);
      alert(error.response?.data?.error || 'Failed to calculate shipping rates');
    } finally {
      setLoading(false);
    }
  };

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRate(rate.object_id);
    onRateSelect(rate.object_id, parseFloat(rate.amount));
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold">Shipping Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={shippingAddress.name}
            onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Street Address *</label>
          <input
            type="text"
            value={shippingAddress.street1}
            onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="123 Main St"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Apt/Suite</label>
          <input
            type="text"
            value={shippingAddress.street2}
            onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Apt 4B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="New York"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <input
            type="text"
            value={shippingAddress.state}
            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="NY"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code *</label>
          <input
            type="text"
            value={shippingAddress.zip}
            onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="10001"
          />
        </div>
      </div>

      <button
        onClick={calculateRates}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Shipping Rates'}
      </button>

      {rates.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Available Shipping Options:</h4>
          <div className="space-y-2">
            {rates.map((rate) => (
              <div
                key={rate.object_id}
                onClick={() => handleRateSelect(rate)}
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  selectedRate === rate.object_id
                    ? 'border-blue-600 bg-blue-50'
                    : 'hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{rate.provider}</p>
                    <p className="text-sm text-gray-600">{rate.servicelevel.name}</p>
                    {rate.estimated_days && (
                      <p className="text-xs text-gray-500">
                        Estimated {rate.estimated_days} days
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-semibold">
                    {formatPrice(parseFloat(rate.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

