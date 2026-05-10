'use client';

import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const validation = forgotSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please check your email.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(validation.data);
      setMessage('If an account exists for that email, a reset link has been sent.');
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || 'Unable to process the request right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-lg items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-950/10 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Forgot password</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reset access to your account</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Enter the email you use on ShopForge and we will send password reset instructions.</p>

        {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
              <Mail className="h-4 w-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-600">
          <Link href={ROUTES.LOGIN} className="font-semibold text-stone-950 transition hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
