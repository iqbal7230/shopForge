'use client';

import ProductForm from '@/components/admin/ProductForm';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductEditPage({ params }: ProductPageProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Edit Product</h1>
        <p className="mt-2 text-stone-600">Update product information</p>
      </div>
      <ProductForm productId={params.id} />
    </div>
  );
}
