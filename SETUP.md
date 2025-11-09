# Craft Chain Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
- **Shippo**: Get test API key from https://goshippo.com/
- **Stripe**: Get keys from https://stripe.com/docs/keys
- **IPFS**: Sign up at https://infura.io/ for IPFS access
- **Database**: Set up PostgreSQL connection string

### 3. Set Up Database

```bash
# Create database
createdb craftchain

# Run schema
psql craftchain < ../database/schema.sql
```

### 4. Deploy Smart Contract (Optional for development)

```bash
cd contracts
npm install
npx hardhat compile

# For local testing
npx hardhat node

# Deploy to Polygon (update .env with PRIVATE_KEY and RPC_URL first)
npx hardhat run scripts/deploy.ts --network polygon
```

Copy the deployed contract address to `.env.local` as `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`.

### 5. Run Development Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
craft-chain/
├── frontend/              # Next.js application
│   ├── app/              # App router pages and API routes
│   │   ├── api/          # API endpoints
│   │   ├── auth/         # Authentication pages
│   │   ├── products/     # Product pages
│   │   └── dashboard/    # User dashboards
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   ├── contracts/        # Smart contracts
│   └── types/            # TypeScript types
├── database/             # Database schema
└── README.md
```

## Features Implemented

✅ Product listing and creation
✅ Shippo shipping integration
✅ Stripe payment processing
✅ Crypto wallet integration
✅ NFT minting functionality
✅ User authentication
✅ Seller dashboard
✅ Order management

## Next Steps

1. Implement proper authentication middleware
2. Add image upload validation
3. Set up Stripe webhooks for payment confirmation
4. Implement order tracking UI
5. Add email notifications
6. Set up production environment variables
7. Deploy to Vercel/Netlify
8. Deploy smart contract to mainnet

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/products/create` - Create product listing
- `POST /api/products/upload-images` - Upload product images
- `POST /api/shipping/rates` - Calculate shipping rates
- `POST /api/orders/create` - Create order
- `POST /api/payments/crypto` - Process crypto payment
- `POST /api/nft/mint` - Mint NFT for order

## Important Notes

- Replace `'user-id-from-session'` placeholders with actual authentication
- Set up proper error handling and validation
- Add rate limiting for API routes
- Implement proper security measures for production
- Test all payment flows thoroughly before going live

