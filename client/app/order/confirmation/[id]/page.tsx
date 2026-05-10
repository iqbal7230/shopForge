'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = typeof params?.id === 'string' ? params.id : 'pending';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-2xl shadow-stone-950/10 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Your order is on the way</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">We created confirmation page {orderId} so the checkout flow ends on a real screen.</p>

        <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Keep this order id for support: <span className="font-semibold text-stone-950">{orderId}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800">
            Keep shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={ROUTES.CART} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
}
