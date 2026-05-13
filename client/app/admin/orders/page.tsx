'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAdmin } from '@/lib/store/hooks';
import { setOrders, setPagination, setLoading, setError, updateOrderStatus } from '@/lib/store/slices/adminSlice';
import { adminAPI } from '@/lib/api';
import OrdersTable from '@/components/admin/OrdersTable';

export default function AdminOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, pagination, loading } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    dispatch(setLoading(true));
    try {
      const response = await adminAPI.getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      dispatch(setOrders(response.data.data || []));
      dispatch(setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: response.data.pagination?.total || 0,
      }));
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to load orders'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await adminAPI.updateOrderStatus(selectedOrder, { status: newStatus });
      dispatch(updateOrderStatus({ id: selectedOrder, status: newStatus }));
      setSelectedOrder(null);
      setNewStatus('');
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to update order status'));
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-stone-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
        <p className="mt-2 text-stone-600">Track and manage customer orders</p>
      </div>

      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <OrdersTable
        orders={orders}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={(id) => setSelectedOrder(id)}
        onStatusFilterChange={setStatusFilter}
      />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 max-w-md">
            <h3 className="text-lg font-semibold text-stone-900">Update Order Status</h3>
            <p className="mt-2 text-sm text-stone-600">
              Order: {orders.find(o => o.id === selectedOrder)?.order_number}
            </p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-4 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            >
              <option value="">Select Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setNewStatus('');
                }}
                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus}
                className="flex-1 rounded-lg bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
