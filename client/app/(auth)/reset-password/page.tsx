'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Loader2, Lock } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

const resetSchema = z.object({
  token: z.string().min(6, 'Enter the reset token.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') ?? '');
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const validation = resetSchema.safeParse({ token, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please check the form.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(validation.data);
      setMessage('Password updated successfully. You can now sign in with the new password.');
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || 'Unable to reset the password right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-lg items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-950/10 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Reset password</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create a new password</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Use the reset token sent to your email to set a new password.</p>

        {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Reset token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
              placeholder="Paste token here"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">New password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
              <Lock className="h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                placeholder="New password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Updating...' : 'Update password'}
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
