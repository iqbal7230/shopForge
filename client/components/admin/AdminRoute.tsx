'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/lib/store/hooks';

type AdminRouteProps = {
  children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent('/admin/dashboard')}`);
    } else if (user?.role !== 'ADMIN') {
      router.replace(ROUTES.HOME);
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-950/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950 text-red-50">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">You don't have permission to access the admin panel. Redirecting you now.</p>
        </div>
      </div>
    );
  }

  return children;
}
