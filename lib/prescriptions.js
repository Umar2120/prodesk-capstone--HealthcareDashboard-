'use client';

import { supabase } from './supabaseClient';
import { callSupabaseProxy, isNetworkFetchError } from './supabaseProxyClient';

const PRESCRIPTIONS_TABLE = 'prescriptions';

const humanizeSupabaseError = (message = '') => {
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Unable to reach Supabase right now. Check your internet connection, VPN/ad blocker settings, and Supabase project URL, then try again.';
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return 'The prescriptions table is missing in Supabase. Run the SQL in supabase/appointments-schema.sql first.';
  }

  if (message.toLowerCase().includes('row-level security')) {
    return 'Supabase blocked this prescriptions request because the row-level security policy does not allow it.';
  }

  return message || 'Something went wrong while talking to Supabase.';
};

const mapPrescription = (row) => ({
  id: row.id,
  appointmentId: row.appointment_id,
  patientId: row.patient_id,
  patientName: row.patient_name,
  patientEmail: row.patient_email,
  doctorId: row.doctor_id,
  doctorName: row.doctor_name,
  medicineName: row.medicine_name,
  dosage: row.dosage,
  frequency: row.frequency,
  instructions: row.instructions || '',
  duration: row.duration || '',
  refills: row.refills || 0,
  status: row.status || 'active',
  pharmacy: row.pharmacy || '',
  expiryDate: row.expiry_date,
  notes: row.notes || '',
  createdAt: row.created_at,
});

export async function fetchPrescriptionsForPatient(patientUserId) {
  if (!supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  if (typeof window !== 'undefined') {
    try {
      const result = await callSupabaseProxy('fetchPrescriptionsForPatient', { patientUserId });
      return { data: (result.data || []).map(mapPrescription), error: null };
    } catch (fallbackError) {
      return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
    }
  }

  try {
    const { data, error } = await supabase
      .from(PRESCRIPTIONS_TABLE)
      .select('*')
      .eq('patient_id', patientUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: (data || []).map(mapPrescription), error: null };
  } catch (error) {
    if (isNetworkFetchError(error)) {
      try {
        const result = await callSupabaseProxy('fetchPrescriptionsForPatient', { patientUserId });
        return { data: (result.data || []).map(mapPrescription), error: null };
      } catch (fallbackError) {
        return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: [], error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function fetchPrescriptionsForDoctor(doctorUserId) {
  if (!supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  if (typeof window !== 'undefined') {
    try {
      const result = await callSupabaseProxy('fetchPrescriptionsForDoctor', { doctorUserId });
      return { data: (result.data || []).map(mapPrescription), error: null };
    } catch (fallbackError) {
      return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
    }
  }

  try {
    const { data, error } = await supabase
      .from(PRESCRIPTIONS_TABLE)
      .select('*')
      .eq('doctor_id', doctorUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: (data || []).map(mapPrescription), error: null };
  } catch (error) {
    if (isNetworkFetchError(error)) {
      try {
        const result = await callSupabaseProxy('fetchPrescriptionsForDoctor', { doctorUserId });
        return { data: (result.data || []).map(mapPrescription), error: null };
      } catch (fallbackError) {
        return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: [], error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function createPrescriptionRecord({
  appointmentId,
  patientProfile,
  doctorProfile,
  medicineName,
  dosage,
  frequency,
  instructions = '',
  duration = '',
  refills = 0,
  pharmacy = '',
  expiryDate = '',
  notes = '',
}) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const payload = {
    appointment_id: appointmentId,
    patient_id: patientProfile.userId || patientProfile.id,
    patient_name: patientProfile.name,
    patient_email: patientProfile.email,
    doctor_id: doctorProfile.userId,
    doctor_name: doctorProfile.name,
    medicine_name: medicineName,
    dosage,
    frequency,
    instructions,
    duration,
    refills,
    pharmacy,
    expiry_date: expiryDate,
    notes,
    status: 'active',
  };

  if (typeof window !== 'undefined') {
    try {
      const result = await callSupabaseProxy('createPrescriptionRecord', { payload });
      return { data: mapPrescription(result.data), error: null };
    } catch (fallbackError) {
      return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
    }
  }

  try {
    const { data, error } = await supabase
      .from(PRESCRIPTIONS_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: mapPrescription(data), error: null };
  } catch (error) {
    if (isNetworkFetchError(error)) {
      try {
        const result = await callSupabaseProxy('createPrescriptionRecord', { payload });
        return { data: mapPrescription(result.data), error: null };
      } catch (fallbackError) {
        return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function updatePrescriptionStatus(prescriptionId, newStatus) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from(PRESCRIPTIONS_TABLE)
      .update({ status: newStatus })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: mapPrescription(data), error: null };
  } catch (error) {
    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}
