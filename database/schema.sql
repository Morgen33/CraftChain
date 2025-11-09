-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('handmade', 'vintage')),
    price_usd DECIMAL(10, 2) NOT NULL,
    price_crypto DECIMAL(20, 8),
    images TEXT[] DEFAULT '{}',
    nft_enabled BOOLEAN DEFAULT false,
    
    -- Shipping dimensions
    length_inches DECIMAL(5, 2),
    width_inches DECIMAL(5, 2),
    height_inches DECIMAL(5, 2),
    weight_lbs DECIMAL(5, 2),
    
    -- Shipping address (seller's return address)
    shipping_from_address JSONB,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    
    -- Payment info
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('stripe', 'crypto')),
    payment_amount DECIMAL(20, 8) NOT NULL,
    payment_currency VARCHAR(10) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    crypto_transaction_hash VARCHAR(255),
    
    -- Shipping info
    shipping_address JSONB NOT NULL,
    shipping_cost DECIMAL(10, 2),
    shipping_rate_id VARCHAR(255),
    shipping_carrier VARCHAR(50),
    shipping_service VARCHAR(100),
    tracking_number VARCHAR(255),
    label_url TEXT,
    
    -- NFT info
    nft_token_id INTEGER,
    nft_contract_address VARCHAR(42),
    nft_metadata_uri TEXT,
    nft_minted BOOLEAN DEFAULT false,
    
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFTs table (for tracking)
CREATE TABLE nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    metadata_uri TEXT,
    ipfs_hash VARCHAR(255),
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_nfts_order ON nfts(order_id);
CREATE INDEX idx_nfts_token ON nfts(contract_address, token_id);
