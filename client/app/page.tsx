"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Search, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { formatPrice, getFeaturedProducts, mockCategories } from '@/lib/mock-data';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const featured = getFeaturedProducts();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `${ROUTES.PRODUCTS}?search=${encodeURIComponent(trimmed)}` : ROUTES.PRODUCTS);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-stone-50 shadow-2xl shadow-stone-950/10 lg:grid-cols-[1.4fr_1fr] lg:p-12">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">
            <Sparkles className="h-4 w-4 text-amber-300" />
            New arrivals, sharp edits, real utility
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            A storefront built for products that deserve better presentation.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
            Browse a curated mix of fashion, electronics, home goods, and wellness products with fast search, filters, cart, and checkout flows already wired into the frontend.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/8 p-2 backdrop-blur">
            <Search className="ml-3 h-4 w-4 text-stone-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, categories, or collections"
              className="flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-stone-400"
            />
            <button type="submit" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300">
              Search
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-100">
              Shop products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={ROUTES.CART} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-white/10">
              View cart
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Fast checkout', value: 'Razorpay ready' },
              { label: 'Responsive UI', value: 'Mobile first' },
              { label: 'Redux state', value: 'Persisted cart' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {featured.map((product, index) => (
            <Link
              key={product.id}
              href={`${ROUTES.PRODUCTS}/${product.slug}`}
              className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-300">Featured {index + 1}</p>
                  <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-200">{product.badge ?? 'Popular'}</span>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <p className="text-sm leading-6 text-stone-300">{product.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-300">
                    {product.features.slice(0, 2).map((feature) => (
                      <span key={feature} className="rounded-full bg-white/10 px-3 py-1">{feature}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
                  <p className="text-xs text-stone-400">{product.average_rating.toFixed(1)} rating</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Categories</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Shop by mood, not only by category.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
            Each collection is styled to feel distinct so the homepage works like a quick editorial guide into the catalog.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {mockCategories.map((category) => (
              <Link
                key={category.slug}
                href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                className={`rounded-[1.5rem] bg-gradient-to-br ${category.accent} p-[1px] transition hover:-translate-y-1`}
              >
                <div className="h-full rounded-[1.45rem] bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{category.name}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: 'Verified checkout flow', text: 'Login, cart, and payment screens already connect to the Redux and API layers.' },
            { icon: Truck, title: 'Order-ready interface', text: 'Cart totals, shipping logic, and confirmation screens are in place.' },
            { icon: Star, title: 'Product-first design', text: 'Cards, details, and supporting states are built around product discovery.' },
            { icon: Sparkles, title: 'Developer friendly', text: 'The components are split so more account and admin pages can land next.' },
          ].map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5">
              <item.icon className="h-5 w-5 text-orange-600" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
