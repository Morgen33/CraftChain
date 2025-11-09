import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, walletAddress, amount } = body;

    await pool.query(
      `UPDATE orders 
       SET payment_method = 'crypto',
           payment_status = 'completed',
           crypto_transaction_hash = $1,
           order_status = 'confirmed'
       WHERE id = $2`,
      [`0x${Math.random().toString(16).substr(2, 64)}`, orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Crypto payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}

