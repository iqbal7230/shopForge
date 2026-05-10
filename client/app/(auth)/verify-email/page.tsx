'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Loader2, MailCheck } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

const verifySchema = z.object({
  token: z.string().min(6, 'Enter the verification token.'),
});

export default function VerifyEmailPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') ?? '');
  }, []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const validation = verifySchema.safeParse({ token });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please enter the token.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyEmail(validation.data);
      setMessage('Email verified successfully. You can now sign in.');
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || 'Unable to verify the email right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-lg items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-950/10 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-stone-50">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Verify email</p>
        <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">Confirm your new account</h1>
        <p className="mt-3 text-center text-sm leading-6 text-stone-600">Enter the verification token from your email to activate your ShopForge account.</p>

        {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Verification token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
              placeholder="Paste token here"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Verifying...' : 'Verify email'}
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
