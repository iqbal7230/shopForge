'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingBag, Sparkles, User2, LogOut } from 'lucide-react';
import { useAppDispatch, useCart, useAuth } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { ROUTES } from '@/lib/constants';

const navItems = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.PRODUCTS, label: 'Products' },
  { href: ROUTES.CART, label: 'Cart' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setMenuOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}` : ROUTES.PRODUCTS);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    router.push(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-3 font-semibold tracking-tight text-stone-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-stone-50 shadow-lg shadow-stone-950/15">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            ShopForge
            <span className="block text-xs font-medium text-stone-500">Curated commerce</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm md:flex">
          <Search className="h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, categories, or brands"
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.href !== ROUTES.HOME ? pathname.startsWith(item.href) : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-stone-950 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href={ROUTES.CART}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 transition hover:border-stone-300 hover:bg-stone-100"
        >
          <ShoppingBag className="h-5 w-5" />
          {items.length > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-white">
              {items.length}
            </span>
          ) : null}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
          >
            <User2 className="h-4 w-4" />
            <span className="hidden sm:inline">{isAuthenticated ? user?.full_name ?? 'Account' : 'Sign in'}</span>
            <Menu className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-950/10">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl bg-stone-950 px-4 py-3 text-stone-50">
                    <p className="text-sm font-semibold">{user?.full_name ?? 'Signed in user'}</p>
                    <p className="text-xs text-stone-300">{user?.email}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <Link href={ROUTES.PRODUCTS} className="rounded-2xl px-4 py-3 text-stone-700 transition hover:bg-stone-100">
                      Continue shopping
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-stone-700 transition hover:bg-stone-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid gap-2 text-sm">
                  <Link href={ROUTES.LOGIN} className="rounded-2xl px-4 py-3 font-medium text-stone-700 transition hover:bg-stone-100">
                    Log in
                  </Link>
                  <Link href={ROUTES.REGISTER} className="rounded-2xl px-4 py-3 font-medium text-stone-700 transition hover:bg-stone-100">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
