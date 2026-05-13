'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAdmin } from '@/lib/store/hooks';
import { setProducts, setPagination, setFilters, setLoading, setError, deleteProduct } from '@/lib/store/slices/adminSlice';
import { adminAPI, productAPI } from '@/lib/api';
import ProductsTable from '@/components/admin/ProductsTable';
import { Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAdmin();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const fetchProducts = async () => {
    dispatch(setLoading(true));
    try {
      const response = await productAPI.getProducts({
        page: pagination.page,
        limit: pagination.limit,
      });
      dispatch(setProducts(response.data.data || []));
      dispatch(setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: response.data.pagination?.total || 0,
      }));
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to load products'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteProduct(id);
      dispatch(deleteProduct(id));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to delete product'));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleSearch = (query: string) => {
    dispatch(setFilters({ search: query }));
    dispatch(setPagination({ ...pagination, page: 1 }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-stone-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Products</h1>
          <p className="mt-2 text-stone-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/create')}
          className="flex items-center gap-2 rounded-lg bg-stone-900 text-white px-4 py-2 font-medium hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <ProductsTable
        products={products}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={(id) => router.push(`/admin/products/manage/${id}`)}
        onDelete={(id) => setShowDeleteConfirm(id)}
        onSearch={handleSearch}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-stone-900">Delete Product?</h3>
            <p className="mt-2 text-sm text-stone-600">This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
