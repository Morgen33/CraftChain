import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId,
      productId,
      paymentMethod,
      shippingAddress,
      shippingRateId,
      shippingCost,
    } = body;

    const productResult = await pool.query(
      `SELECT p.*, u.id as seller_id 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.id = $1`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productResult.rows[0];
    const totalAmount = parseFloat(product.price_usd) + parseFloat(shippingCost);

    let paymentIntentId = null;
    let paymentStatus = 'pending';

    if (paymentMethod === 'stripe') {
      const paymentIntent = await createPaymentIntent(totalAmount, 'usd', {
        productId,
        buyerId,
      });
      paymentIntentId = paymentIntent.id;
    }

    const orderResult = await pool.query(
      `INSERT INTO orders (
        buyer_id, seller_id, product_id, payment_method, 
        payment_amount, payment_currency, payment_status,
        stripe_payment_intent_id, shipping_address, 
        shipping_cost, shipping_rate_id, order_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        buyerId,
        product.seller_id,
        productId,
        paymentMethod,
        totalAmount,
        'USD',
        paymentStatus,
        paymentIntentId,
        JSON.stringify(shippingAddress),
        shippingCost,
        shippingRateId,
        'pending',
      ]
    );

    const order = orderResult.rows[0];

    return NextResponse.json({
      order,
      clientSecret: paymentIntentId ? (await createPaymentIntent(totalAmount)).client_secret : null,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

