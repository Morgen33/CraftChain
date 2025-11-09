'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price_usd: number;
    images: string[];
    category: string;
    nft_enabled: boolean;
    first_name: string;
    last_name: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative w-full h-64 bg-gray-200">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.nft_enabled && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
              NFT
            </div>
          )}
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
            {product.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(product.price_usd)}
            </span>
            <span className="text-sm text-gray-500">
              by {product.first_name} {product.last_name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

