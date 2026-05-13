'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, productAPI } from '@/lib/api';
import { Upload, Loader } from 'lucide-react';

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export default function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    category_id: '',
    stock_qty: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && productId) {
      fetchProduct();
    }
  }, [productId, isEdit]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProductById(productId!);
      const product = response.data.data;
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        compare_price: product.compare_price?.toString() || '',
        category_id: product.category_id || '',
        stock_qty: product.stock_qty?.toString() || '',
      });
    } catch (err: any) {
      setError('Failed to load product');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('description', formData.description);
      data.append('price', formData.price);
      if (formData.compare_price) data.append('compare_price', formData.compare_price);
      if (formData.category_id) data.append('category_id', formData.category_id);
      data.append('stock_qty', formData.stock_qty);

      images.forEach(image => {
        data.append('images', image);
      });

      if (isEdit) {
        await adminAPI.updateProduct(productId!, data);
      } else {
        await adminAPI.createProduct(data);
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-stone-600">Loading product...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          {isEdit ? 'Edit Product' : 'Create Product'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-900 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="e.g., Wireless Headphones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-900 mb-1">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="e.g., wireless-headphones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-900 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1">
                Compare Price
              </label>
              <input
                type="number"
                name="compare_price"
                value={formData.compare_price}
                onChange={handleChange}
                step="0.01"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock_qty"
                value={formData.stock_qty}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1">
                Category ID
              </label>
              <input
                type="text"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="UUID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-900 mb-2">
              Images (up to 5)
            </label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-200 p-6">
              <label className="cursor-pointer text-center">
                <Upload className="mx-auto h-8 w-8 text-stone-400" />
                <p className="mt-2 text-sm text-stone-600">
                  Click to upload images
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i}`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-stone-200 px-4 py-2 font-medium hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-stone-900 text-white px-4 py-2 font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
