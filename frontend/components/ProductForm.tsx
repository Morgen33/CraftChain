'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['handmade', 'vintage']),
  price_usd: z.number().min(0.01, 'Price must be greater than 0'),
  nft_enabled: z.boolean().default(false),
  length_inches: z.number().min(0.1),
  width_inches: z.number().min(0.1),
  height_inches: z.number().min(0.1),
  weight_lbs: z.number().min(0.1),
  shipping_from_name: z.string().min(1),
  shipping_from_street1: z.string().min(1),
  shipping_from_street2: z.string().optional(),
  shipping_from_city: z.string().min(1),
  shipping_from_state: z.string().min(2),
  shipping_from_zip: z.string().min(5),
  shipping_from_country: z.string().default('US'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await axios.post('/api/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages([...images, ...response.data.urls]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setSubmitting(true);
    try {
      const shippingFromAddress = {
        name: data.shipping_from_name,
        street1: data.shipping_from_street1,
        street2: data.shipping_from_street2,
        city: data.shipping_from_city,
        state: data.shipping_from_state,
        zip: data.shipping_from_zip,
        country: data.shipping_from_country,
      };

      const response = await axios.post('/api/products/create', {
        ...data,
        images,
        shipping_from_address: shippingFromAddress,
      });

      router.push(`/products/${response.data.product.id}`);
    } catch (error: any) {
      console.error('Product creation error:', error);
      alert(error.response?.data?.error || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">List a New Product</h2>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            {...register('title')}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter product title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Describe your product"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select {...register('category')} className="w-full px-3 py-2 border rounded-md">
              <option value="handmade">Handmade</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              {...register('price_usd', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0.00"
            />
            {errors.price_usd && (
              <p className="text-red-500 text-sm mt-1">{errors.price_usd.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('nft_enabled')}
            className="mr-2"
            id="nft-enabled"
          />
          <label htmlFor="nft-enabled" className="text-sm">
            Enable NFT minting for proof of ownership
          </label>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Images *</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="w-full px-3 py-2 border rounded-md"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipping Dimensions */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Shipping Dimensions</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (in) *</label>
            <input
              type="number"
              step="0.1"
              {...register('length_inches', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width (in) *</label>
            <input
              type="number"
              step="0.1"
              {...register('width_inches', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (in) *</label>
            <input
              type="number"
              step="0.1"
              {...register('height_inches', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lbs) *</label>
            <input
              type="number"
              step="0.1"
              {...register('weight_lbs', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Shipping From Address */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Shipping From Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              {...register('shipping_from_name')}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address *</label>
            <input
              {...register('shipping_from_street1')}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address 2</label>
            <input
              {...register('shipping_from_street2')}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                {...register('shipping_from_city')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input
                {...register('shipping_from_state')}
                className="w-full px-3 py-2 border rounded-md"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input
                {...register('shipping_from_zip')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}

