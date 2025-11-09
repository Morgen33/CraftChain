import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingRates, ShippingAddress, ProductDimensions } from '@/lib/shippo';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, shippingAddress } = body;

    const productResult = await pool.query(
      'SELECT length_inches, width_inches, height_inches, weight_lbs, shipping_from_address FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productResult.rows[0];
    const fromAddress = product.shipping_from_address as ShippingAddress;

    if (!fromAddress) {
      return NextResponse.json(
        { error: 'Seller shipping address not configured' },
        { status: 400 }
      );
    }

    const dimensions: ProductDimensions = {
      length: parseFloat(product.length_inches),
      width: parseFloat(product.width_inches),
      height: parseFloat(product.height_inches),
      weight: parseFloat(product.weight_lbs),
    };

    const rates = await calculateShippingRates(
      fromAddress,
      shippingAddress,
      dimensions
    );

    return NextResponse.json({ rates });
  } catch (error: any) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}

