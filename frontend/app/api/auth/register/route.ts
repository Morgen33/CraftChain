import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, isSeller } = body;

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_seller)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, is_seller`,
      [email, passwordHash, firstName, lastName, isSeller || false]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '');

    return NextResponse.json({ user, token });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

