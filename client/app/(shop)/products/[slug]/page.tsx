'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, ShieldCheck, Truck } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { addItem } from '@/lib/store/slices/cartSlice';
import { useAppDispatch } from '@/lib/store/hooks';
import { formatPrice, getProductBySlug, mockProducts } from '@/lib/mock-data';

type Product = (typeof mockProducts)[number];

const extractProducts = (response: any): Product[] => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  if (Array.isArray(payload)) return payload;
  return payload.products ?? payload.items ?? payload.rows ?? payload.data ?? [];
};

export default function ProductDetailPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getProducts({ limit: 100 });
        const products = extractProducts(response) as Product[];
        const found = products.find((item) => item.slug === slug || item.id === slug) ?? getProductBySlug(slug) ?? mockProducts[0];

        if (active) {
          setProduct(found);
        }
      } catch {
        if (active) {
          setProduct(getProductBySlug(slug) ?? mockProducts[0]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchProduct();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const related = useMemo(() => mockProducts.filter((item) => item.slug !== slug).slice(0, 3), [slug]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    dispatch(
      addItem({
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
        },
        quantity,
        price: product.price,
      })
    );

    router.push(ROUTES.CART);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[520px] animate-pulse rounded-[2rem] bg-stone-200" />
          <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5">
            <div className="h-6 w-32 animate-pulse rounded-full bg-stone-200" />
            <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-stone-200" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-stone-200" />
            <div className="h-14 w-40 animate-pulse rounded-full bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-lg shadow-stone-950/5">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-sm text-stone-600">We could not load that item.</p>
          <Link href={ROUTES.PRODUCTS} className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-lg shadow-stone-950/5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {(product.images?.urls || []).map((label, index) => (
              <div key={label} className={`flex min-h-44 items-end rounded-[1.5rem] p-4 text-white ${index === 0 ? 'bg-stone-950' : index === 1 ? 'bg-stone-800' : 'bg-stone-600'}`}>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Image {index + 1}</p>
                  <h2 className="mt-2 text-xl font-semibold">{label}</h2>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Warranty-ready', text: 'Basic purchase protection across the experience.' },
              { icon: Truck, title: 'Quick shipping', text: 'Shipping totals are visible in the cart and checkout flow.' },
              { icon: Star, title: 'Review support', text: 'Ratings and review counts are surfaced on the listing and detail views.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <item.icon className="h-5 w-5 text-orange-600" />
                <h3 className="mt-3 text-sm font-semibold text-stone-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5">
          <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
            {product.badge ?? 'Featured'}
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {(product.average_rating ?? 0).toFixed(1)} · {product.review_count ?? 0} reviews
          </div>
          <p className="mt-5 text-3xl font-semibold text-stone-950">{formatPrice(product.price)}</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">{product.description}</p>

          <ul className="mt-6 grid gap-3 text-sm text-stone-700">
            {(product.features ?? []).map((feature) => (
              <li key={feature} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white">
              <Minus className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Quantity</p>
              <p className="text-lg font-semibold">{quantity}</p>
            </div>
            <button type="button" onClick={() => setQuantity((current) => current + 1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </button>
        </aside>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Reviews</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">What buyers say</h2>
          <div className="mt-6 grid gap-4">
            {[
              { name: 'Priya', text: 'The product page feels premium and the add-to-cart flow is direct.', rating: 5 },
              { name: 'Arjun', text: 'Everything needed for a convincing storefront is already visible here.', rating: 5 },
              { name: 'Mira', text: 'This makes it easy to picture how the rest of the shop will scale out.', rating: 4 },
            ].map((review) => (
              <article key={review.name} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-stone-950">{review.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{review.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Related</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">More products</h2>
          <div className="mt-6 grid gap-4">
            {related.map((item) => (
              <Link key={item.id} href={`${ROUTES.PRODUCTS}/${item.slug}`} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 transition hover:-translate-y-1 hover:bg-white">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{item.badge ?? 'Popular'}</p>
                <h3 className="mt-2 font-semibold text-stone-950">{item.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
