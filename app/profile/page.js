'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Camera, Mail, Phone, Save, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useApp } from '../../lib/AppContext';
import { supabase } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { currentDoctor, currentPatient, setCurrentDoctor, setCurrentPatient, syncDoctorProfile } = useApp();
  const profile = currentDoctor || currentPatient;
  const isDoctor = Boolean(currentDoctor);
  const dashboardPath = isDoctor ? '/doctor/dashboard' : '/patient/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayName = useMemo(() => {
    if (!profile) return '';
    if (isDoctor) return profile.name.replace(/^Dr\.?\s*/i, '');
    return profile.name;
  }, [profile, isDoctor]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!profile) return;

    setName(displayName || '');
    setEmail(profile.email || user?.email || '');
    setPhone(profile.phone || '');
    setDob(profile.dob || '');
    setPhotoPreview(profile.photo || '');
  }, [profile, displayName, user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');
    setSubmitting(true);

    if (!supabase) {
      setError('Supabase is not configured.');
      setSubmitting(false);
      return;
    }

    const trimmedName = name.trim();
    const result = await supabase.auth.updateUser({
      email: email.trim(),
      data: {
        full_name: trimmedName,
        phone: phone.trim(),
        dob: dob.trim(),
        photo: photoPreview || '',
      },
    });

    if (result.error) {
      setSubmitting(false);
      setError(result.error.message || 'Unable to update profile.');
      return;
    }

    const updatedProfile = {
      ...profile,
      name: isDoctor ? `Dr. ${trimmedName}` : trimmedName,
      email: email.trim(),
      phone: phone.trim(),
      dob: dob.trim(),
      photo: photoPreview || '',
    };

    if (isDoctor) {
      const doctorSync = await syncDoctorProfile(updatedProfile);
      if (doctorSync.error) {
        setSubmitting(false);
        setError(doctorSync.error.message || 'Unable to update doctor directory profile.');
        return;
      }
      setCurrentDoctor(doctorSync.data);
    } else {
      setCurrentPatient(updatedProfile);
    }

    setSubmitting(false);
    setStatusMessage('Profile updated successfully.');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#081a3c] text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081a3c] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_rgba(8,24,58,0.96),_rgba(2,9,27,0.96))] pointer-events-none" />
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 py-10 lg:px-12">
        <button
          type="button"
          onClick={() => router.replace(dashboardPath)}
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="rounded-[1.8rem] border border-white/12 bg-[#0d224b]/92 p-8 shadow-[0_35px_90px_rgba(2,13,36,0.28)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">Profile settings</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Edit your profile</h1>
              <p className="mt-2 text-slate-400 max-w-xl">
                Update your name, contact details, date of birth, and profile photo whenever you need.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <User className="w-8 h-8" />
                      <span className="text-[0.7rem] uppercase tracking-[0.2em]">No photo</span>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 right-0 inline-flex items-center gap-2 rounded-full bg-slate-900/95 px-3 py-2 text-xs text-slate-200 border border-white/10 cursor-pointer hover:bg-slate-800">
                  <Camera className="w-3.5 h-3.5" />
                  Upload
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <User className="w-4 h-4" /> Full name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>

              <label className="block text-sm text-slate-300">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Mail className="w-4 h-4" /> Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Phone className="w-4 h-4" /> Phone number
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>

              <label className="block text-sm text-slate-300">
                <span className="flex items-center gap-2 text-slate-200 font-medium">
                  <Calendar className="w-4 h-4" /> Date of birth
                </span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}
            {statusMessage && <p className="text-sm text-emerald-300">{statusMessage}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_15px_40px_rgba(56,189,248,0.2)] transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
