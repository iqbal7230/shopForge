'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAppDispatch, useCart } from '@/lib/store/hooks';
import { initCartFromLocalStorage, removeItem, saveCartToLocalStorage, setShipping, updateQuantity } from '@/lib/store/slices/cartSlice';
import { formatPrice } from '@/lib/mock-data';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, subtotal, shipping, discount, total } = useCart();

  useEffect(() => {
    dispatch(initCartFromLocalStorage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(saveCartToLocalStorage());
  }, [dispatch, items, subtotal, shipping, discount, total]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const nextShipping = subtotal >= 5000 ? 0 : 249;
    if (shipping !== nextShipping) {
      dispatch(setShipping(nextShipping));
    }
  }, [dispatch, items.length, subtotal, shipping]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Cart</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Review your items before checkout</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">Update quantities, remove items, and keep track of your current order total.</p>
          </div>
          <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
            <ShoppingBag className="h-10 w-10 text-stone-400" />
            <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">Add some products to see totals, coupon handling, and checkout actions in motion.</p>
            <Link href={ROUTES.PRODUCTS} className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="grid gap-4">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <div className="flex h-28 items-center justify-center rounded-[1.5rem] bg-stone-900 text-sm font-medium text-stone-50">
                    {item.product.images?.[0] ?? item.product.name}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-stone-500">{item.variant?.size ?? 'Standard'}</p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-950">{item.product.name}</h3>
                    <p className="mt-1 text-sm text-stone-600">{formatPrice(item.price)} each</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white p-1">
                      <button type="button" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-stone-950">{formatPrice(item.price * item.quantity)}</p>
                      <button type="button" onClick={() => dispatch(removeItem(item.id))} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Summary</p>
              <div className="mt-5 grid gap-4 text-sm text-stone-700">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
                <div className="border-t border-stone-200 pt-4 text-base font-semibold text-stone-950">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(ROUTES.CHECKOUT)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
              >
                Proceed to checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
