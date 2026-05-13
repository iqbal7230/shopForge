'use client';

import { ReactNode } from 'react';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
