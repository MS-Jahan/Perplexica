'use client';

import { Loader2, Lock } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type AuthStatus = {
  required: boolean;
  authenticated: boolean;
};

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/auth/status');
    if (!res.ok) {
      throw new Error('Failed to load auth status');
    }
    return (await res.json()) as AuthStatus;
  }, []);

  useEffect(() => {
    loadStatus()
      .then(setStatus)
      .catch(() => {
        toast.error('Failed to check authentication status.');
        setStatus({ required: true, authenticated: false });
      });
  }, [loadStatus]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Invalid password.');
      }

      setPassword('');
      setStatus({ required: true, authenticated: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!status) {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center bg-light-primary dark:bg-dark-primary">
        <Loader2 className="h-8 w-8 animate-spin text-black/40 dark:text-white/40" />
      </div>
    );
  }

  if (!status.required || status.authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center bg-light-primary px-4 dark:bg-dark-primary">
      <div className="w-full max-w-md rounded-xl border border-light-200 bg-light-primary/80 p-6 shadow-sm dark:border-dark-200 dark:bg-dark-primary/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/10 p-2">
            <Lock className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-black dark:text-white">
              Sign in to Vane
            </h1>
            <p className="text-xs text-black/50 dark:text-white/50">
              Enter the access password configured on the server.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="vane-password"
              className="text-xs text-black/70 dark:text-white/70"
            >
              Password
            </label>
            <input
              id="vane-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
              className="w-full rounded-lg border border-light-200 bg-light-primary px-4 py-3 text-sm text-black/80 placeholder:text-black/40 focus-visible:border-light-300 focus-visible:outline-none dark:border-dark-200 dark:bg-dark-primary dark:text-white/80 dark:placeholder:text-white/40 dark:focus-visible:border-dark-300"
              placeholder="Access password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || password.length === 0}
            className="flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthGate;
