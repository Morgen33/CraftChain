import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

const NFT_ABI = [
  'function mint(address to, string memory orderId, string memory tokenURI) public returns (uint256)',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, ownerAddress } = body;

    const orderResult = await pool.query(
      `SELECT o.*, p.title, p.description, p.images
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult.rows[0];

    if (order.nft_minted) {
      return NextResponse.json({ error: 'NFT already minted' }, { status: 400 });
    }

    const metadata = {
      name: order.title,
      description: order.description,
      image: order.images[0],
      attributes: [
        { trait_type: 'Order ID', value: orderId },
        { trait_type: 'Product ID', value: productId },
        { trait_type: 'Category', value: order.category },
      ],
    };

    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const ipfsResult = await ipfs.add(metadataBuffer);
    const metadataUri = `ipfs://${ipfsResult.path}`;

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '',
      NFT_ABI,
      wallet
    );

    const tx = await contract.mint(ownerAddress, orderId, metadataUri);
    const receipt = await tx.wait();
    
    const mintEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('NFTMinted(uint256,address,string,string)')
    );
    const tokenId = parseInt(mintEvent.topics[1], 16);

    await pool.query(
      `UPDATE orders 
       SET nft_token_id = $1,
           nft_contract_address = $2,
           nft_metadata_uri = $3,
           nft_minted = true
       WHERE id = $4`,
      [
        tokenId,
        process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        metadataUri,
        orderId,
      ]
    );

    await pool.query(
      `INSERT INTO nfts (order_id, token_id, contract_address, owner_address, metadata_uri, ipfs_hash)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        orderId,
        tokenId,
        process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        ownerAddress,
        metadataUri,
        ipfsResult.path,
      ]
    );

    return NextResponse.json({
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      metadataUri,
    });
  } catch (error: any) {
    console.error('NFT minting error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}

