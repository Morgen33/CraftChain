# Craft Chain - Handmade & Vintage Marketplace

A decentralized marketplace for handmade and vintage items with optional NFT proof of ownership.

## Features

- 🛍️ Product listings (handmade/vintage items)
- 💳 Dual payment: USD (Stripe) & Crypto (Web3)
- 🎨 Optional NFT minting for proof of ownership
- 📦 Integrated shipping with Shippo
- 👤 Seller & Buyer dashboards

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Payments**: Stripe (USD), Web3 (Crypto)
- **Shipping**: Shippo API
- **Blockchain**: Ethereum/Polygon, Solidity

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

3. Set up database:
```bash
createdb craftchain
psql craftchain < ../database/schema.sql
```

4. Deploy smart contracts:
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat deploy --network polygon
```

5. Run development server:
```bash
npm run dev
```

## Environment Variables

See `.env.local.example` for required variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
