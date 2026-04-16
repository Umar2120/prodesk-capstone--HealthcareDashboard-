'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/${user.role || 'patient'}/dashboard`);
      } else {
        router.replace('/login');
      }
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
