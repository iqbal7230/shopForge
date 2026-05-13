'use client';

import { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '@/lib/store/slices/adminSlice';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_qty: number;
  category_id?: string;
  images?: Record<string, unknown> | null;
}

interface ProductsTableProps {
  products: Product[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string) => void;
}

export default function ProductsTable({
  products,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onSearch,
}: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-stone-800"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-6 py-3 text-left font-medium text-stone-900">Name</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Price</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Stock</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-stone-200 hover:bg-stone-50">
                <td className="px-6 py-3 text-stone-900 font-medium">{product.name}</td>
                <td className="px-6 py-3 text-stone-600">${parseFloat(product.price as any).toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.stock_qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_qty}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-stone-600">
          Showing {products.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex items-center px-3 text-sm text-stone-600">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
