'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ArrowRight, Loader2, Mail, Lock, UserRound } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ROUTES, SUCCESS_MESSAGES } from '@/lib/constants';

const registerSchema = z.object({
  fullname: z.string().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Confirm your password.'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [redirectTo, setRedirectTo] = useState(ROUTES.VERIFY_EMAIL);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(params.get('redirect') ?? ROUTES.VERIFY_EMAIL);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validation = registerSchema.safeParse({ fullname, email, password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please check your details.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        fullname: validation.data.fullname,
        email: validation.data.email,
        password: validation.data.password,
      });

      setSuccess(SUCCESS_MESSAGES.REGISTER);
      router.push(`${redirectTo}?email=${encodeURIComponent(validation.data.email)}`);
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl shadow-stone-950/10 lg:grid-cols-[1fr_0.95fr]">
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Register</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Create your ShopForge account</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Save checkout details, view orders, and keep your wishlist in one place.
          </p>

          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Full name</span>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
              <UserRound className="h-4 w-4 text-stone-400" />
              <input
                value={fullname}
                onChange={(event) => setFullname(event.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                autoComplete="name"
              />
            </div>
          </label>

          <label className="mt-5 block">
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

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
                <Lock className="h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Confirm password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
                <Lock className="h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  autoComplete="new-password"
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="mt-4 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="font-semibold text-stone-950 transition hover:underline">
              Log in
            </Link>
          </p>
        </form>

        <aside className="flex flex-col justify-between bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 p-8 text-stone-950 lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-700">Why create an account</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Faster checkout, better order history, and a saved wishlist.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-800/80">
              The frontend already supports token storage, protected routes, and account-aware navigation. This page completes the entry point.
            </p>
          </div>
          <div className="grid gap-3 text-sm font-medium text-stone-900">
            <div className="rounded-3xl bg-white/40 p-4 backdrop-blur">Email verification redirect included after registration.</div>
            <div className="rounded-3xl bg-white/40 p-4 backdrop-blur">Matches the product, cart, and checkout screens you can ship next.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
