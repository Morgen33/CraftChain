import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      price_usd,
      nft_enabled,
      images,
      length_inches,
      width_inches,
      height_inches,
      weight_lbs,
      shipping_from_address,
    } = body;

    const userId = 'user-id-from-session';

    const result = await pool.query(
      `INSERT INTO products (
        seller_id, title, description, category, price_usd,
        nft_enabled, images, length_inches, width_inches,
        height_inches, weight_lbs, shipping_from_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId,
        title,
        description,
        category,
        price_usd,
        nft_enabled || false,
        images,
        length_inches,
        width_inches,
        height_inches,
        weight_lbs,
        JSON.stringify(shipping_from_address),
      ]
    );

    return NextResponse.json({ product: result.rows[0] });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

