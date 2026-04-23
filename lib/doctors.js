'use client';

import { supabase } from './supabaseClient';

const DOCTORS_TABLE = 'doctors';
const DOCTORS_CACHE_KEY = 'vitalsync.registeredDoctors';

const DEFAULT_DOCTOR_PROFILE = {
  specialty: 'General Medicine',
  available: true,
  rating: 4.8,
  experience: 5,
  hospital: 'VitalSync Medical Center',
  department: 'General Medicine',
  nextAvailable: 'Today, 2:00 PM',
  slots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:30 PM'],
  bio: 'Care-focused physician available for consultations and follow-up visits.',
  patients: 0,
};

const humanizeSupabaseError = (message = '') => {
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Unable to reach Supabase right now. Check your internet connection, VPN/ad blocker settings, and Supabase project URL, then try again.';
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return 'The doctors table is missing in Supabase. Re-run supabase/appointments-schema.sql to create it.';
  }

  if (message.toLowerCase().includes('row-level security')) {
    return 'Supabase blocked this doctors request because the row-level security policy does not allow it.';
  }

  return message || 'Something went wrong while talking to Supabase.';
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const readCachedDoctors = () => {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(DOCTORS_CACHE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedDoctors = (doctors) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DOCTORS_CACHE_KEY, JSON.stringify(doctors));
  } catch {
    // Ignore cache write failures and continue with live data.
  }
};

export const mapDoctorRecord = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  specialty: row.specialty || DEFAULT_DOCTOR_PROFILE.specialty,
  photo: row.photo || '',
  available: row.available ?? DEFAULT_DOCTOR_PROFILE.available,
  rating: Number(row.rating ?? DEFAULT_DOCTOR_PROFILE.rating),
  experience: Number(row.experience ?? DEFAULT_DOCTOR_PROFILE.experience),
  hospital: row.hospital || DEFAULT_DOCTOR_PROFILE.hospital,
  department: row.department || row.specialty || DEFAULT_DOCTOR_PROFILE.department,
  nextAvailable: row.next_available || DEFAULT_DOCTOR_PROFILE.nextAvailable,
  slots: Array.isArray(row.slots) && row.slots.length ? row.slots : DEFAULT_DOCTOR_PROFILE.slots,
  bio: row.bio || DEFAULT_DOCTOR_PROFILE.bio,
  patients: Number(row.patients ?? DEFAULT_DOCTOR_PROFILE.patients),
  phone: row.phone || '',
  dob: row.dob || '',
  email: row.email || '',
});

const buildDoctorPayload = (user, overrides = {}) => {
  const displayName =
    overrides.name ||
    user.name ||
    user.email?.split('@')[0] ||
    'Doctor';

  return {
    user_id: user.uid,
    name: displayName.startsWith('Dr.') ? displayName : `Dr. ${displayName}`,
    specialty: overrides.specialty || DEFAULT_DOCTOR_PROFILE.specialty,
    photo: overrides.photo || user.photo || '',
    available: overrides.available ?? DEFAULT_DOCTOR_PROFILE.available,
    rating: overrides.rating ?? DEFAULT_DOCTOR_PROFILE.rating,
    experience: overrides.experience ?? DEFAULT_DOCTOR_PROFILE.experience,
    hospital: overrides.hospital || DEFAULT_DOCTOR_PROFILE.hospital,
    department: overrides.department || overrides.specialty || DEFAULT_DOCTOR_PROFILE.department,
    next_available: overrides.nextAvailable || DEFAULT_DOCTOR_PROFILE.nextAvailable,
    slots: overrides.slots || DEFAULT_DOCTOR_PROFILE.slots,
    bio: overrides.bio || DEFAULT_DOCTOR_PROFILE.bio,
    patients: overrides.patients ?? DEFAULT_DOCTOR_PROFILE.patients,
    phone: overrides.phone || user.phone || '',
    dob: overrides.dob || user.dob || '',
    email: overrides.email || user.email || '',
  };
};

export async function fetchRegisteredDoctors() {
  if (!supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from(DOCTORS_TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: [], error: new Error(humanizeSupabaseError(error.message)) };
    }

    const mappedDoctors = (data || []).map(mapDoctorRecord);
    writeCachedDoctors(mappedDoctors);
    return { data: mappedDoctors, error: null };
  } catch (error) {
    return { data: [], error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function ensureDoctorProfile(user, overrides = {}) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const payload = buildDoctorPayload(user, overrides);
    const { data, error } = await supabase
      .from(DOCTORS_TABLE)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    const mappedDoctor = mapDoctorRecord(data);
    const cachedDoctors = readCachedDoctors().filter((doctor) => doctor.userId !== mappedDoctor.userId);
    writeCachedDoctors([...cachedDoctors, mappedDoctor].sort((a, b) => a.name.localeCompare(b.name)));
    return { data: mappedDoctor, error: null };
  } catch (error) {
    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}
