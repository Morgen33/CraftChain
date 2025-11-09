import { NextRequest, NextResponse } from 'next/server';
import { create } from 'ipfs-http-client';

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
    ).toString('base64')}`,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const urls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await ipfs.add(buffer);
      const ipfsUrl = `https://ipfs.io/ipfs/${result.path}`;
      urls.push(ipfsUrl);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}

