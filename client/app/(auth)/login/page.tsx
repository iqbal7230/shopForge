'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ROUTES, ERROR_MESSAGES } from '@/lib/constants';
import { setTokens, setUser } from '@/lib/store/slices/authSlice';
import { useAppDispatch } from '@/lib/store/hooks';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const extractAuthPayload = (response: any) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  return {
    user: payload.user ?? payload.account ?? null,
    accessToken: payload.accessToken ?? payload.token ?? null,
    refreshToken: payload.refreshToken ?? null,
  };
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectTo, setRedirectTo] = useState(ROUTES.HOME);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(params.get('redirect') ?? ROUTES.HOME);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please check your details.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(validation.data);
      const { user, accessToken, refreshToken } = extractAuthPayload(response);

      if (user) {
        dispatch(setUser(user));
      }

      if (accessToken) {
        dispatch(setTokens({ token: accessToken, refreshToken: refreshToken ?? undefined }));
      }

      router.push(redirectTo);
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl shadow-stone-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col justify-between bg-stone-950 p-8 text-stone-50 lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-400">Welcome back</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to keep your cart, wishlist, and orders in sync.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
              Use the same account across the browsing, checkout, and order confirmation experience.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-stone-300">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Secure session handling with Redux token storage.</div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Redirect back to checkout or home after login.</div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Login</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Start shopping</h2>
            </div>
            <Link href={ROUTES.REGISTER} className="text-sm font-medium text-stone-700 transition hover:text-stone-950">
              Create account
            </Link>
          </div>

          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
              <Mail className="h-4 w-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
              <Lock className="h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                autoComplete="current-password"
              />
            </div>
          </label>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href={ROUTES.FORGOT_PASSWORD} className="font-medium text-stone-700 transition hover:text-stone-950">
              Forgot password?
            </Link>
            <Link href={ROUTES.HOME} className="font-medium text-stone-500 transition hover:text-stone-950">
              Continue browsing
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-sm text-stone-600">
            New here?{' '}
            <Link href={ROUTES.REGISTER} className="font-semibold text-stone-950 transition hover:underline">
              Create your account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
