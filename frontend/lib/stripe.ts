import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
  });
}

