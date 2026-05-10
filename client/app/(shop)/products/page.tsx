'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Filter, Grid2x2, Search, SlidersHorizontal, Star } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { ROUTES, PAGINATION } from '@/lib/constants';
import { filterProducts, formatPrice, getProductBySlug, mockCategories, mockProducts } from '@/lib/mock-data';

type Product = (typeof mockProducts)[number];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_low', label: 'Price: Low to high' },
  { value: 'price_high', label: 'Price: High to low' },
  { value: 'rating', label: 'Top rated' },
];

const extractProducts = (response: any): Product[] => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  return payload.products ?? payload.items ?? payload.rows ?? payload.data ?? [];
};

const extractTotal = (response: any, fallback: number) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  return payload.total ?? payload.count ?? fallback;
};

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGINATION.PRODUCTS_PER_PAGE);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(mockCategories);

  const pages = Math.max(1, Math.ceil(total / limit));

  const queryKey = useMemo(() => JSON.stringify({ query, category, sort, minPrice, maxPrice, page, limit }), [query, category, sort, minPrice, maxPrice, page, limit]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('search') ?? '');
    setCategory(params.get('category') ?? 'all');
    setSort(params.get('sort') ?? 'featured');
    setMinPrice(Number(params.get('min_price') ?? '0') || 0);
    setMaxPrice(Number(params.get('max_price') ?? '0') || 0);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const effectiveSort = sort === 'featured' ? undefined : sort;
        const hasSearch = query.trim().length > 0;

        const [productResponse, categoryResponse] = await Promise.all([
          hasSearch
            ? productAPI.searchProducts(query.trim(), { page, limit })
            : productAPI.getProducts({
                page,
                limit,
                category_id: category !== 'all' ? category : undefined,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                sort: effectiveSort,
              }),
          productAPI.getCategories().catch(() => ({ data: { data: mockCategories } })),
        ]);

        if (!active) {
          return;
        }

        const remoteProducts = extractProducts(productResponse);
        const fallbackProducts = filterProducts({
          search: query,
          category,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
        });

        const combined = remoteProducts.length > 0 ? remoteProducts : fallbackProducts;
        setProducts(combined as Product[]);
        setTotal(extractTotal(productResponse, combined.length));

        const remoteCategories = extractProducts(categoryResponse);
        if (remoteCategories.length > 0) {
          setCategories(remoteCategories as any);
        }
      } catch {
        if (!active) {
          return;
        }

        const fallbackProducts = filterProducts({
          search: query,
          category,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
        });

        setProducts(fallbackProducts as Product[]);
        setTotal(fallbackProducts.length);
        setCategories(mockCategories);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [queryKey, query, category, sort, minPrice, maxPrice, page, limit]);

  const handleReset = () => {
    setQuery('');
    setCategory('all');
    setSort('featured');
    setMinPrice(0);
    setMaxPrice(0);
    setPage(1);
    router.replace(pathname);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-950/5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Products</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Search, filter, and discover the catalog</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              The listing page is wired for the API, but also falls back to curated mock data so the experience stays useful while the backend is being finished.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
            }}
            className="flex w-full max-w-xl items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-2"
          >
            <Search className="h-4 w-4 text-stone-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              placeholder="Search products"
            />
          </form>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>

            <label className="mt-5 block text-sm">
              <span className="mb-2 block font-medium text-stone-700">Category</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
              >
                <option value="all">All categories</option>
                {categories.map((item: any) => (
                  <option key={item.id ?? item.slug ?? item.name} value={item.slug ?? item.id}>
                    {item.name ?? item.category_name ?? 'Category'}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-medium text-stone-700">Min price</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice || ''}
                  onChange={(event) => {
                    setMinPrice(Number(event.target.value) || 0);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                  placeholder="0"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-stone-700">Max price</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice || ''}
                  onChange={(event) => {
                    setMaxPrice(Number(event.target.value) || 0);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
                  placeholder="Any"
                />
              </label>
            </div>

            <label className="mt-5 block text-sm">
              <span className="mb-2 block font-medium text-stone-700">Sort by</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-400"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" onClick={handleReset} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800">
              <Filter className="h-4 w-4" />
              Reset filters
            </button>
          </aside>

          <section>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Grid2x2 className="h-4 w-4" />
                {loading ? 'Loading products...' : `${total || products.length} products found`}
              </div>
              <p className="text-sm text-stone-500">Page {page} of {pages}</p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(() => {
                const displayItems: Array<Product | null> = loading ? Array.from({ length: 6 }, () => null) : products;

                return displayItems.map((product, index) => {
                  if (loading || !product) {
                    return (
                      <div key={index} className="h-80 animate-pulse rounded-[1.75rem] border border-stone-200 bg-stone-100" />
                    );
                  }

                  const mockFallback = getProductBySlug(product.slug) ?? mockProducts[0];
                  const display = { ...mockFallback, ...product };
                  return (
                    <Link key={display.id} href={`${ROUTES.PRODUCTS}/${display.slug}`} className="group rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-950/10">
                      <div className="flex h-40 items-center justify-between rounded-[1.5rem] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 p-4 text-stone-50">
                        <div>
                          {display.badge ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{display.badge}</span> : null}
                          <h2 className="mt-3 text-lg font-semibold leading-6">{display.name}</h2>
                        </div>
                        <div className="grid h-24 w-24 place-items-center rounded-[1.5rem] border border-white/10 bg-white/8 text-center text-sm text-stone-200">
                          <span>{display.images[0] ?? 'Product'}</span>
                        </div>
                      </div>
                      <div className="p-2 pt-4">
                        <p className="line-clamp-2 text-sm leading-6 text-stone-600">{display.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-stone-950">{formatPrice(display.price)}</p>
                            <p className="flex items-center gap-1 text-xs text-stone-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {display.average_rating.toFixed(1)} · {display.review_count} reviews
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-stone-700 transition group-hover:gap-2 group-hover:text-stone-950">
                            View <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                });
              })()}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-sm text-stone-600">
                Showing page {page} with {limit} items per page.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pages, current + 1))}
                  disabled={page >= pages}
                  className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
