export type MockCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
};

export type MockProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stock_qty: number;
  average_rating: number;
  review_count: number;
  badge?: string;
  images: string[];
  features: string[];
};

export type MockAddress = {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export const mockCategories: MockCategory[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Everyday essentials with a sharper silhouette.',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Useful tools that look and feel premium.',
    accent: 'from-cyan-500 via-sky-600 to-blue-700',
  },
  {
    id: 'home',
    name: 'Home',
    slug: 'home',
    description: 'Warm textures and practical upgrades.',
    accent: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    slug: 'wellness',
    description: 'Small routines that make the day feel better.',
    accent: 'from-fuchsia-500 via-pink-500 to-rose-600',
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: 'p-001',
    name: 'Canvas Field Jacket',
    slug: 'canvas-field-jacket',
    description: 'A structured layer with a soft hand-feel and utility pockets.',
    price: 3499,
    category: 'fashion',
    stock_qty: 18,
    average_rating: 4.8,
    review_count: 124,
    badge: 'Best Seller',
    images: ['Stone', 'Olive', 'Rust'],
    features: ['Breathable cotton canvas', 'Water-resistant finish', 'Relaxed fit'],
  },
  {
    id: 'p-002',
    name: 'Aurora Wireless Headphones',
    slug: 'aurora-wireless-headphones',
    description: 'Over-ear headphones with strong low-end detail and all-day comfort.',
    price: 8999,
    category: 'electronics',
    stock_qty: 12,
    average_rating: 4.6,
    review_count: 83,
    badge: 'New',
    images: ['Midnight', 'Graphite', 'Pearl'],
    features: ['Active noise isolation', '48-hour battery', 'Fast charging'],
  },
  {
    id: 'p-003',
    name: 'Studio Desk Lamp',
    slug: 'studio-desk-lamp',
    description: 'Minimal lighting that shifts from focused work to soft ambience.',
    price: 2199,
    category: 'home',
    stock_qty: 34,
    average_rating: 4.7,
    review_count: 57,
    badge: 'Editor Pick',
    images: ['Brass', 'Charcoal', 'Sand'],
    features: ['Touch dimmer', 'Warm LED ring', 'USB-C powered'],
  },
  {
    id: 'p-004',
    name: 'Recovery Tea Set',
    slug: 'recovery-tea-set',
    description: 'A compact set for unwinding after long productive stretches.',
    price: 1299,
    category: 'wellness',
    stock_qty: 41,
    average_rating: 4.5,
    review_count: 46,
    badge: 'Calm Choice',
    images: ['Sage', 'Oat', 'Clay'],
    features: ['Loose-leaf sampler', 'Ceramic infuser', 'Gift-ready packaging'],
  },
  {
    id: 'p-005',
    name: 'Monochrome Runner',
    slug: 'monochrome-runner',
    description: 'Lightweight footwear with a balanced profile and responsive sole.',
    price: 4599,
    category: 'fashion',
    stock_qty: 22,
    average_rating: 4.4,
    review_count: 112,
    images: ['Black', 'White', 'Grey'],
    features: ['Cushioned heel', 'Mesh upper', 'Durable tread'],
  },
  {
    id: 'p-006',
    name: 'Compact Espresso Grinder',
    slug: 'compact-espresso-grinder',
    description: 'A countertop grinder tuned for consistency and cleaner extraction.',
    price: 6399,
    category: 'home',
    stock_qty: 9,
    average_rating: 4.9,
    review_count: 31,
    badge: 'Premium',
    images: ['Espresso', 'Graphite', 'Cream'],
    features: ['40 grind settings', 'Low-retention burrs', 'Quiet motor'],
  },
];

export const mockAddresses: MockAddress[] = [
  {
    id: 'addr-1',
    full_name: 'Aarav Mehta',
    phone: '+91 98765 43210',
    street: '24 Lake View Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India',
    is_default: true,
  },
  {
    id: 'addr-2',
    full_name: 'Aarav Mehta',
    phone: '+91 98765 43210',
    street: 'Flat 302, Cedar Towers',
    city: 'Mysuru',
    state: 'Karnataka',
    postal_code: '570001',
    country: 'India',
    is_default: false,
  },
];

export const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => currencyFormatter.format(value);

export const getFeaturedProducts = () => mockProducts.slice(0, 4);

export const getProductBySlug = (slug: string) =>
  mockProducts.find((product) => product.slug === slug);

export const getCategoryBySlug = (slug: string) =>
  mockCategories.find((category) => category.slug === slug);

export const filterProducts = (options: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}) => {
  const search = options.search?.trim().toLowerCase();

  return mockProducts
    .filter((product) => {
      const matchesSearch = !search || product.name.toLowerCase().includes(search) || product.description.toLowerCase().includes(search);
      const matchesCategory = !options.category || options.category === 'all' || product.category === options.category;
      const matchesMin = !options.minPrice || product.price >= options.minPrice;
      const matchesMax = !options.maxPrice || product.price <= options.maxPrice;
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    })
    .sort((left, right) => {
      switch (options.sort) {
        case 'price_low':
          return left.price - right.price;
        case 'price_high':
          return right.price - left.price;
        case 'rating':
          return right.average_rating - left.average_rating;
        default:
          return mockProducts.indexOf(left) - mockProducts.indexOf(right);
      }
    });
};
