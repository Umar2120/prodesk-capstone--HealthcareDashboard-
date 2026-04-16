'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth';

const roleContent = {
  patient: {
    accent: 'bg-sky-400',
    title: 'Patient Sign In',
    description: 'Access appointments, prescriptions, and your personal health dashboard.',
  },
  doctor: {
    accent: 'bg-emerald-400',
    title: 'Doctor Sign In',
    description: 'Access patient schedules, availability, and your physician dashboard.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = useMemo(() => {
    const value = searchParams.get('role');
    return value === 'doctor' ? 'doctor' : 'patient';
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/${user.role || role}/dashboard`);
    }
  }, [loading, role, router, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message || 'Unable to sign in.');
      return;
    }

    const signedInRole = result.data?.session?.user?.user_metadata?.role || role;
    router.replace(`/${signedInRole}/dashboard`);
  };

  const currentRoleContent = roleContent[role];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081a3c] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_rgba(8,24,58,0.96),_rgba(2,9,27,0.96))] pointer-events-none" />
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen flex-col justify-center px-6 py-10 lg:px-12">
        <div className="absolute left-6 top-6 z-20 fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 shadow-lg shadow-sky-500/10 backdrop-blur-md">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-300">❤</span>
            <div>
              <p className="font-semibold text-white">VitalSync</p>
              <p className="text-slate-400">Healthcare</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[440px] rounded-[1.8rem] border border-white/12 bg-[#0d224b]/92 p-7 shadow-[0_35px_90px_rgba(2,13,36,0.28)] backdrop-blur-xl fade-in-up">
          <div className="mb-7 space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-slate-950/60 p-1">
              <Link
                href="/login?role=patient"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${role === 'patient' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Patient
              </Link>
              <Link
                href="/login?role=doctor"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${role === 'doctor' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Doctor
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              <span className={`h-2.5 w-2.5 rounded-full ${currentRoleContent.accent}`} />
              {currentRoleContent.title}
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
              <p className="mt-2 text-slate-400">{currentRoleContent.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </label>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_15px_40px_rgba(56,189,248,0.2)] transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : `Sign in as ${role}`}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-slate-400">
            Need an account?{' '}
            <Link href={`/register?role=${role}`} className="text-sky-300 hover:text-white">
              Create a {role} account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
