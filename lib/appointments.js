'use client';

import { supabase } from './supabaseClient';

const APPOINTMENTS_TABLE = 'appointments';

const STATUS_LABELS = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const humanizeSupabaseError = (message = '') => {
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Unable to reach Supabase right now. Check your internet connection, VPN/ad blocker settings, and NEXT_PUBLIC_SUPABASE_URL, then try again.';
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return 'The appointments table is missing in Supabase. Run the SQL in supabase/appointments-schema.sql first.';
  }

  if (message.toLowerCase().includes('row-level security')) {
    return 'Supabase blocked this appointments request because the row-level security policy does not allow it.';
  }

  return message || 'Something went wrong while talking to Supabase.';
};

const mapAppointment = (row) => ({
  id: row.id,
  patientId: row.patient_id,
  patientUserId: row.patient_user_id,
  patientName: row.patient_name,
  patientEmail: row.patient_email,
  patientPhoto: row.patient_photo || '',
  doctorId: row.doctor_id,
  doctorName: row.doctor_name,
  doctorSpecialty: row.doctor_specialty || 'General Medicine',
  doctorPhoto: row.doctor_photo || '',
  date: row.date,
  time: row.time,
  status: row.status,
  type: row.type,
  notes: row.notes || '',
  location: row.location || '',
  createdAt: row.created_at,
});

export const formatAppointmentDate = (dateValue) => {
  if (!dateValue) return 'TBD';

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const buildAppointmentLocation = (doctor) =>
  `${doctor.department || doctor.specialty || 'Care'} Wing, Room ${Math.floor(Math.random() * 900) + 100}`;

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;

export const getAppointmentStatusCounts = (appointments) =>
  appointments.reduce(
    (acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    },
    { pending: 0, scheduled: 0, completed: 0, cancelled: 0 }
  );

export const getMonthlyAppointmentChartData = (appointments, referenceDate = new Date()) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const chartMap = new Map();

  for (let day = 1; day <= daysInMonth; day += 1) {
    chartMap.set(day, {
      day: `${day}`,
      total: 0,
      completed: 0,
      pending: 0,
    });
  }

  appointments.forEach((appointment) => {
    const appointmentDate = new Date(`${appointment.date}T00:00:00`);
    if (
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate.getFullYear() !== year ||
      appointmentDate.getMonth() !== month
    ) {
      return;
    }

    const day = appointmentDate.getDate();
    const bucket = chartMap.get(day);
    if (!bucket) return;

    bucket.total += 1;
    if (appointment.status === 'completed') {
      bucket.completed += 1;
    }
    if (appointment.status === 'pending') {
      bucket.pending += 1;
    }
  });

  return [...chartMap.values()];
};

export async function fetchAppointmentsForViewer({ role, userId, doctorId }) {
  if (!supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  let query = supabase
    .from(APPOINTMENTS_TABLE)
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: false });

  if (role === 'doctor') {
    query = query.eq('doctor_id', doctorId);
  } else {
    query = query.eq('patient_user_id', userId);
  }

  try {
    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: (data || []).map(mapAppointment), error: null };
  } catch (error) {
    return { data: [], error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function createAppointmentRecord({
  patientProfile,
  doctor,
  user,
  date,
  time,
  type,
  notes,
}) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const payload = {
    patient_id: patientProfile.id,
    patient_user_id: user.uid,
    patient_name: patientProfile.name,
    patient_email: patientProfile.email,
    patient_photo: patientProfile.photo || '',
    doctor_id: doctor.id,
    doctor_name: doctor.name,
    doctor_specialty: doctor.specialty || 'General Medicine',
    doctor_photo: doctor.photo || '',
    date,
    time,
    type,
    notes: notes.trim(),
    status: 'pending',
    location: buildAppointmentLocation(doctor),
  };

  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
  }

  return { data: mapAppointment(data), error: null };
}

export async function updateAppointmentRecordStatus(appointmentId, status) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
  }

  return { data: mapAppointment(data), error: null };
}

export async function updateAppointmentRecord(appointmentId, updates) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const payload = {
    doctor_id: updates.doctorId,
    doctor_name: updates.doctorName,
    doctor_specialty: updates.doctorSpecialty || 'General Medicine',
    doctor_photo: updates.doctorPhoto || '',
    date: updates.date,
    time: updates.time,
    type: updates.type,
    notes: updates.notes?.trim() || '',
    location: updates.location || '',
  };

  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .update(payload)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
  }

  return { data: mapAppointment(data), error: null };
}

export async function deleteAppointmentRecord(appointmentId) {
  if (!supabase) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .delete()
    .eq('id', appointmentId);

  if (error) {
    return { error: new Error(humanizeSupabaseError(error.message)) };
  }

  return { error: null };
}
