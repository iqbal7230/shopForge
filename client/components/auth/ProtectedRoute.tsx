'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/lib/store/hooks';

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      const target = redirectTo ?? ROUTES.CHECKOUT;
      router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(target)}`);
    }
  }, [isAuthenticated, redirectTo, router]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-950/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-stone-50">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Protected checkout</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">You need to be signed in to access this page. Redirecting you now.</p>
        </div>
      </div>
    );
  }

  return children;
}
