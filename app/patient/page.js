'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { FullScreenLoader } from '../../components/LoadingStates';

export default function PatientPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'patient') {
        router.replace('/patient/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, router, user]);

  return <FullScreenLoader title="Opening your patient dashboard" message="Verifying your session and preparing your care overview." />;
}
