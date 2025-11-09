import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import pool from '@/lib/db';

async function getProducts() {
  const result = await pool.query(
    `SELECT p.*, u.first_name, u.last_name 
     FROM products p 
     JOIN users u ON p.seller_id = u.id 
     WHERE p.status = 'active' 
     ORDER BY p.created_at DESC 
     LIMIT 20`
  );
  return result.rows;
}

export default async function MarketplacePage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Craft Chain Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Suspense fallback={<div>Loading products...</div>}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}

