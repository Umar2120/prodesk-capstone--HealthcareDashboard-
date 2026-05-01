'use client';

import { supabase } from './supabaseClient';
import { callSupabaseProxy, isNetworkFetchError } from './supabaseProxyClient';

const APPOINTMENTS_TABLE = 'appointments';
const LOCAL_APPOINTMENTS_KEY = 'vitalsync.localAppointments';

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

const isReachabilityError = (error) => {
  const message = error?.message || String(error || '');
  return isNetworkFetchError(error) || /failed to fetch|fetch failed|networkerror|network request failed/i.test(message);
};

const isRecoverableAppointmentError = (error) => {
  const message = error?.message || String(error || '');
  return (
    isReachabilityError(error) ||
    /please sign in again|jwt|auth session|not authenticated|unauthorized|row-level security/i.test(message)
  );
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readLocalAppointments = () => {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalAppointments = (appointments) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch {
    // Keep the visible in-memory update even if browser storage is unavailable.
  }
};

const getLocalAppointmentsForViewer = ({ role, userId, doctorId }) => {
  const localAppointments = readLocalAppointments();

  if (role === 'doctor') {
    const doctorIds = [doctorId, userId].filter(Boolean);
    return localAppointments.filter((appointment) => doctorIds.includes(appointment.doctorId));
  }

  return localAppointments.filter((appointment) => appointment.patientUserId === userId);
};

const mergeAppointments = (remoteAppointments, localAppointments) => {
  const appointmentMap = new Map();

  [...remoteAppointments, ...localAppointments].forEach((appointment) => {
    if (!appointment?.id) return;
    appointmentMap.set(appointment.id, appointment);
  });

  return [...appointmentMap.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

const saveLocalAppointment = (appointment) => {
  const localAppointments = readLocalAppointments();
  const nextAppointments = [
    ...localAppointments.filter((item) => item.id !== appointment.id),
    appointment,
  ];
  writeLocalAppointments(nextAppointments);
  return appointment;
};

const removeLocalAppointment = (appointmentId) => {
  const localAppointments = readLocalAppointments();
  writeLocalAppointments(localAppointments.filter((item) => item.id !== appointmentId));
};

const createLocalAppointmentRecord = (payload) =>
  saveLocalAppointment({
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    patientId: payload.patient_id,
    patientUserId: payload.patient_user_id,
    patientName: payload.patient_name,
    patientEmail: payload.patient_email,
    patientPhoto: payload.patient_photo || '',
    doctorId: payload.doctor_id,
    doctorName: payload.doctor_name,
    doctorSpecialty: payload.doctor_specialty || 'General Medicine',
    doctorPhoto: payload.doctor_photo || '',
    date: payload.date,
    time: payload.time,
    status: payload.status || 'pending',
    type: payload.type,
    notes: payload.notes || '',
    location: payload.location || '',
    createdAt: new Date().toISOString(),
    localOnly: true,
  });

const updateLocalAppointmentRecord = (appointmentId, updates) => {
  const localAppointments = readLocalAppointments();
  const existing = localAppointments.find((item) => item.id === appointmentId);

  if (!existing) {
    return null;
  }

  return saveLocalAppointment({
    ...existing,
    ...updates,
    localOnly: true,
  });
};

const fetchAppointmentsForViewerFromProxy = async ({ role, userId, doctorId }) => {
  const result = await callSupabaseProxy(
    'fetchAppointmentsForViewer',
    { role, userId, doctorId },
    { includeAccessToken: true }
  );
  return (result.data || []).map(mapAppointment);
};

const createAppointmentRecordFromProxy = async (payload) => {
  const result = await callSupabaseProxy(
    'createAppointmentRecord',
    { payload },
    { includeAccessToken: true }
  );
  return mapAppointment(result.data);
};

const updateAppointmentRecordStatusFromProxy = async (appointmentId, status) => {
  const result = await callSupabaseProxy(
    'updateAppointmentRecordStatus',
    { appointmentId, status },
    { includeAccessToken: true }
  );
  return mapAppointment(result.data);
};

const updateAppointmentRecordFromProxy = async (appointmentId, payload) => {
  const result = await callSupabaseProxy(
    'updateAppointmentRecord',
    { appointmentId, payload },
    { includeAccessToken: true }
  );
  return mapAppointment(result.data);
};

const deleteAppointmentRecordFromProxy = async (appointmentId) => {
  await callSupabaseProxy(
    'deleteAppointmentRecord',
    { appointmentId },
    { includeAccessToken: true }
  );
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
    const doctorIds = [doctorId, userId].filter(Boolean);
    query = doctorIds.length > 1
      ? query.or(doctorIds.map((id) => `doctor_id.eq.${id}`).join(','))
      : query.eq('doctor_id', doctorId);
  } else {
    query = query.eq('patient_user_id', userId);
  }

  try {
    const { data, error } = await query;

    if (error) {
      if (isRecoverableAppointmentError(error)) {
        try {
          const proxyData = await fetchAppointmentsForViewerFromProxy({ role, userId, doctorId });
          const localAppointments = getLocalAppointmentsForViewer({ role, userId, doctorId });
          return { data: mergeAppointments(proxyData, localAppointments), error: null };
        } catch (fallbackError) {
          if (isRecoverableAppointmentError(fallbackError)) {
            return { data: getLocalAppointmentsForViewer({ role, userId, doctorId }), error: null };
          }

          return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
        }
      }

      return { data: [], error: new Error(humanizeSupabaseError(error.message)) };
    }

    const remoteAppointments = (data || []).map(mapAppointment);
    const localAppointments = getLocalAppointmentsForViewer({ role, userId, doctorId });
    return { data: mergeAppointments(remoteAppointments, localAppointments), error: null };
  } catch (error) {
    if (isRecoverableAppointmentError(error)) {
      try {
        const proxyData = await fetchAppointmentsForViewerFromProxy({ role, userId, doctorId });
        const localAppointments = getLocalAppointmentsForViewer({ role, userId, doctorId });
        return { data: mergeAppointments(proxyData, localAppointments), error: null };
      } catch (fallbackError) {
        if (isRecoverableAppointmentError(fallbackError)) {
          return { data: getLocalAppointmentsForViewer({ role, userId, doctorId }), error: null };
        }

        return { data: [], error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

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

  try {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isRecoverableAppointmentError(error)) {
        try {
          const proxyData = await createAppointmentRecordFromProxy(payload);
          return { data: proxyData, error: null };
        } catch (fallbackError) {
          if (isRecoverableAppointmentError(fallbackError)) {
            return { data: createLocalAppointmentRecord(payload), error: null };
          }

          return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
        }
      }

      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: mapAppointment(data), error: null };
  } catch (error) {
    if (isRecoverableAppointmentError(error)) {
      try {
        const proxyData = await createAppointmentRecordFromProxy(payload);
        return { data: proxyData, error: null };
      } catch (fallbackError) {
        if (isRecoverableAppointmentError(fallbackError)) {
          return { data: createLocalAppointmentRecord(payload), error: null };
        }

        return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function updateAppointmentRecordStatus(appointmentId, status) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      if (isRecoverableAppointmentError(error)) {
        try {
          const proxyData = await updateAppointmentRecordStatusFromProxy(appointmentId, status);
          return { data: proxyData, error: null };
        } catch (fallbackError) {
          const localAppointment = updateLocalAppointmentRecord(appointmentId, { status });
          if (localAppointment && isRecoverableAppointmentError(fallbackError)) {
            return { data: localAppointment, error: null };
          }

          return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
        }
      }

      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: mapAppointment(data), error: null };
  } catch (error) {
    if (isRecoverableAppointmentError(error)) {
      try {
        const proxyData = await updateAppointmentRecordStatusFromProxy(appointmentId, status);
        return { data: proxyData, error: null };
      } catch (fallbackError) {
        const localAppointment = updateLocalAppointmentRecord(appointmentId, { status });
        if (localAppointment && isRecoverableAppointmentError(fallbackError)) {
          return { data: localAppointment, error: null };
        }

        return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
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

  try {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update(payload)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      if (isRecoverableAppointmentError(error)) {
        try {
          const proxyData = await updateAppointmentRecordFromProxy(appointmentId, payload);
          return { data: proxyData, error: null };
        } catch (fallbackError) {
          const localAppointment = updateLocalAppointmentRecord(appointmentId, {
            doctorId: payload.doctor_id,
            doctorName: payload.doctor_name,
            doctorSpecialty: payload.doctor_specialty || 'General Medicine',
            doctorPhoto: payload.doctor_photo || '',
            date: payload.date,
            time: payload.time,
            type: payload.type,
            notes: payload.notes || '',
            location: payload.location || '',
          });
          if (localAppointment && isRecoverableAppointmentError(fallbackError)) {
            return { data: localAppointment, error: null };
          }

          return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
        }
      }

      return { data: null, error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { data: mapAppointment(data), error: null };
  } catch (error) {
    if (isRecoverableAppointmentError(error)) {
      try {
        const proxyData = await updateAppointmentRecordFromProxy(appointmentId, payload);
        return { data: proxyData, error: null };
      } catch (fallbackError) {
        const localAppointment = updateLocalAppointmentRecord(appointmentId, {
          doctorId: payload.doctor_id,
          doctorName: payload.doctor_name,
          doctorSpecialty: payload.doctor_specialty || 'General Medicine',
          doctorPhoto: payload.doctor_photo || '',
          date: payload.date,
          time: payload.time,
          type: payload.type,
          notes: payload.notes || '',
          location: payload.location || '',
        });
        if (localAppointment && isRecoverableAppointmentError(fallbackError)) {
          return { data: localAppointment, error: null };
        }

        return { data: null, error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { data: null, error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}

export async function deleteAppointmentRecord(appointmentId) {
  if (!supabase) {
    return { error: new Error('Supabase is not configured.') };
  }

  try {
    const { error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .delete()
      .eq('id', appointmentId);

    if (error) {
      if (isRecoverableAppointmentError(error)) {
        try {
          await deleteAppointmentRecordFromProxy(appointmentId);
          return { error: null };
        } catch (fallbackError) {
          if (isRecoverableAppointmentError(fallbackError)) {
            removeLocalAppointment(appointmentId);
            return { error: null };
          }

          return { error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
        }
      }

      return { error: new Error(humanizeSupabaseError(error.message)) };
    }

    return { error: null };
  } catch (error) {
    if (isRecoverableAppointmentError(error)) {
      try {
        await deleteAppointmentRecordFromProxy(appointmentId);
        return { error: null };
      } catch (fallbackError) {
        if (isRecoverableAppointmentError(fallbackError)) {
          removeLocalAppointment(appointmentId);
          return { error: null };
        }

        return { error: new Error(humanizeSupabaseError(fallbackError?.message || '')) };
      }
    }

    return { error: new Error(humanizeSupabaseError(error?.message || '')) };
  }
}
