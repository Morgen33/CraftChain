import Image from 'next/image';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import BuyButton from '@/components/BuyButton';

async function getProduct(id: string) {
  const result = await pool.query(
    `SELECT p.*, u.first_name, u.last_name, u.email as seller_email
     FROM products p
     JOIN users u ON p.seller_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image: string, index: number) => (
                <div key={index} className="relative w-full h-24 bg-gray-200 rounded overflow-hidden">
                  <Image src={image} alt={`${product.title} ${index + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                {product.category}
              </span>
              {product.nft_enabled && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  NFT Available
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <p className="text-2xl font-semibold text-green-600 mb-4">
              ${parseFloat(product.price_usd).toFixed(2)}
            </p>
            <p className="text-gray-700 mb-6">{product.description}</p>
            <p className="text-sm text-gray-500">
              Sold by {product.first_name} {product.last_name}
            </p>
          </div>

          <BuyButton product={product} />
        </div>
      </div>
    </div>
  );
}

