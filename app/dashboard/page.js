'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { FullScreenLoader } from '../../components/LoadingStates';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Small delay to ensure session is loaded before redirect
        setTimeout(() => {
          window.location.href = `/${user.role || 'patient'}/dashboard`;
        }, 100);
      } else {
        router.replace('/login');
      }
    }
  }, [loading, user, router]);

  return <FullScreenLoader title="Routing you to the right dashboard" message="Checking your signed-in role and sending you to the right workspace." />;
}
