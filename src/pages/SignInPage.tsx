import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export function SignInPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/settings');
    } catch (error) {
      console.error(error);
      setErrorMessage('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-500">FootyAM Account</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              Sign in to FootyAM
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Save favorite clubs, sync your settings, and get spoiler-free highlight notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Close sign in"
          >
            ×
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-slate-900 p-5">
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full rounded-full border border-slate-600 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {errorMessage && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </p>
          )}

          <p className="text-center text-xs text-slate-500">
            We only use your account to save favorites, settings, and notification preferences.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Why sign in?
        </h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            Favorite clubs
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            Spoiler-free alerts
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            Sync settings
          </div>
        </div>
      </section>

      <Link to="/" className="inline-block text-sm text-brand-500">
        ← Back to highlights
      </Link>
    </main>
  );
}