'use client';

import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Pagination } from '@/lib/store/slices/adminSlice';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  total_amount: number;
  createdAt: string;
  items?: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
  onStatusFilterChange: (status: string) => void;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-stone-100 text-stone-800',
};

export default function OrdersTable({
  orders,
  pagination,
  onPageChange,
  onViewDetails,
  onStatusFilterChange,
}: OrdersTableProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-6 py-3 text-left font-medium text-stone-900">Order #</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Amount</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Order Status</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Payment</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Date</th>
              <th className="px-6 py-3 text-left font-medium text-stone-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-stone-200 hover:bg-stone-50">
                <td className="px-6 py-3 font-medium text-stone-900">{order.order_number}</td>
                <td className="px-6 py-3 text-stone-600">${order.total_amount.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${paymentStatusColors[order.payment_status]}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => onViewDetails(order.id)}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-stone-600">
          Showing {orders.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
