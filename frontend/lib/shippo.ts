import Shippo from 'shippo';

const shippo = new Shippo({
  apiKey: process.env.SHIPPO_API_KEY || '',
});

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShippingRate {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: {
    name: string;
  };
  estimated_days?: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

/**
 * Calculate shipping rates for a product
 */
export async function calculateShippingRates(
  fromAddress: ShippingAddress,
  toAddress: ShippingAddress,
  dimensions: ProductDimensions
): Promise<ShippingRate[]> {
  try {
    const shipment = await shippo.shipment.create({
      address_from: {
        name: fromAddress.name,
        street1: fromAddress.street1,
        street2: fromAddress.street2,
        city: fromAddress.city,
        state: fromAddress.state,
        zip: fromAddress.zip,
        country: fromAddress.country,
      },
      address_to: {
        name: toAddress.name,
        street1: toAddress.street1,
        street2: toAddress.street2,
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.zip,
        country: toAddress.country,
      },
      parcels: [
        {
          length: dimensions.length.toString(),
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
          weight: dimensions.weight.toString(),
          distance_unit: 'in',
          mass_unit: 'lb',
        },
      ],
      async: false,
    });

    if (!shipment.rates || shipment.rates.length === 0) {
      throw new Error('No shipping rates available');
    }

    return shipment.rates.map((rate: any) => ({
      object_id: rate.object_id,
      amount: rate.amount,
      currency: rate.currency,
      provider: rate.provider,
      servicelevel: rate.servicelevel,
      estimated_days: rate.estimated_days,
    }));
  } catch (error) {
    console.error('Shippo error:', error);
    throw error;
  }
}

/**
 * Create a shipping label for an order
 */
export async function createShippingLabel(rateId: string): Promise<{
  tracking_number: string;
  label_url: string;
  tracking_url_provider: string;
}> {
  try {
    const transaction = await shippo.transaction.create({
      rate: rateId,
      label_format: 'PDF',
      async: false,
    });

    if (transaction.status !== 'SUCCESS') {
      throw new Error(`Label creation failed: ${transaction.messages}`);
    }

    return {
      tracking_number: transaction.tracking_number || '',
      label_url: transaction.label_url || '',
      tracking_url_provider: transaction.tracking_url_provider || '',
    };
  } catch (error) {
    console.error('Shippo label creation error:', error);
    throw error;
  }
}

/**
 * Track a shipment
 */
export async function trackShipment(carrier: string, trackingNumber: string) {
  try {
    const tracking = await shippo.track.get_status(carrier, trackingNumber);
    return tracking;
  } catch (error) {
    console.error('Shippo tracking error:', error);
    throw error;
  }
}

export default shippo;

