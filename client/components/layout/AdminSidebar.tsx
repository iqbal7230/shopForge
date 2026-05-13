'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-stone-200 bg-stone-50 p-6">
      <Link href="/" className="mb-8 flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900">
        <Home className="h-4 w-4" />
        Back to shop
      </Link>

      <nav className="space-y-1">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-200'
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
