'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function CreateProductPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Create Product</h1>
        <p className="mt-2 text-stone-600">Add a new product to your catalog</p>
      </div>
      <ProductForm />
    </div>
  );
}
