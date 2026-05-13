'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAdmin } from '@/lib/store/hooks';
import { setStats, setLoading, setError } from '@/lib/store/slices/adminSlice';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import { ShoppingCart, TrendingUp, AlertCircle, Users } from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAdmin();

  useEffect(() => {
    const fetchStats = async () => {
      dispatch(setLoading(true));
      try {
        const response = await adminAPI.getAnalytics();
        dispatch(setStats(response.data.data || {
          total_orders: 0,
          revenue: 0,
          low_stock_count: 0,
          active_users: 0
        }));
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(setError(err.response?.data?.message || 'Failed to load stats'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStats();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-stone-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-2 text-stone-600">Welcome back! Here's an overview of your store.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Revenue"
          value={`$${(stats?.revenue || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats?.low_stock_count || 0}
          icon={AlertCircle}
          color="yellow"
        />
        <StatsCard
          title="Active Users"
          value={stats?.active_users || 0}
          icon={Users}
          color="blue"
        />
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Quick Access</h2>
        <p className="mt-2 text-sm text-stone-600">Navigate to manage your store content</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a href="/admin/products" className="rounded-lg border border-stone-200 p-4 hover:border-stone-300 hover:bg-stone-50 transition">
            <div className="font-medium text-stone-900">Manage Products</div>
            <div className="text-sm text-stone-600">Add, edit, or delete products</div>
          </a>
          <a href="/admin/orders" className="rounded-lg border border-stone-200 p-4 hover:border-stone-300 hover:bg-stone-50 transition">
            <div className="font-medium text-stone-900">View Orders</div>
            <div className="text-sm text-stone-600">Track and update order status</div>
          </a>
          <div className="rounded-lg border border-stone-200 p-4 opacity-50 cursor-not-allowed">
            <div className="font-medium text-stone-900">Analytics</div>
            <div className="text-sm text-stone-600">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
