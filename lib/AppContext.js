'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth';
import {
  createAppointmentRecord,
  deleteAppointmentRecord,
  fetchAppointmentsForViewer,
  updateAppointmentRecord,
  updateAppointmentRecordStatus,
} from './appointments';
import { ensureDoctorProfile, fetchRegisteredDoctors, mergeDoctorDirectories, readCachedDoctors } from './doctors';
import {
  fetchPrescriptionsForDoctor,
  fetchPrescriptionsForPatient,
  createPrescriptionRecord,
} from './prescriptions';

const AppContext = createContext();

const createPatientProfile = (user) => ({
  id: `p_${user.uid}`,
  name: user.name,
  age: 34,
  gender: 'Female',
  bloodType: 'A+',
  photo: user.photo || '',
  conditions: ['Hypertension'],
  allergies: ['None'],
  phone: user.phone || '',
  dob: user.dob || '',
  email: user.email,
  address: '123 Wellness Ave, Boston, MA',
  emergencyContact: 'Alex Smith - +1 (555) 765-4321',
  lastVisit: 'April 8, 2026',
});

const createDoctorProfileFallback = (user) => ({
  id: user.uid,
  userId: user.uid,
  name: user.name?.startsWith('Dr.') ? user.name : `Dr. ${user.name || user.email?.split('@')[0] || 'Doctor'}`,
  specialty: 'General Medicine',
  photo: user.photo || '',
  available: true,
  rating: 4.8,
  experience: 5,
  hospital: 'VitalSync Medical Center',
  department: 'General Medicine',
  nextAvailable: 'Today, 2:00 PM',
  slots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:30 PM'],
  bio: 'Care-focused physician available for consultations and follow-up visits.',
  patients: 0,
  phone: user.phone || '',
  dob: user.dob || '',
  email: user.email || '',
});

const getCachedDoctorDirectory = (currentDoctor = null) => {
  const cachedDoctors = readCachedDoctors();

  if (!currentDoctor) {
    return cachedDoctors;
  }

  const alreadyIncluded = cachedDoctors.some(
    (doctor) => doctor.userId === currentDoctor.userId || doctor.id === currentDoctor.id || doctor.email === currentDoctor.email
  );

  return alreadyIncluded ? cachedDoctors : [...cachedDoctors, currentDoctor];
};

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState(null);
  const [currentDoctor, setCurrentDoctorState] = useState(null);
  const [currentPatient, setCurrentPatientState] = useState(null);
  const [registeredDoctors, setRegisteredDoctors] = useState([]);
  const [registeredDoctorsLoading, setRegisteredDoctorsLoading] = useState(false);
  const [registeredDoctorsError, setRegisteredDoctorsError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const syncAppState = async () => {
      if (!user) {
        if (!isMounted) return;
        setRoleState(null);
        setCurrentDoctorState(null);
        setCurrentPatientState(null);
        setRegisteredDoctors([]);
        setRegisteredDoctorsLoading(false);
        setRegisteredDoctorsError('');
        setAppointments([]);
        setAppointmentsLoading(false);
        setAppointmentsError('');
        return;
      }

      const userRole = user.role || 'patient';
      const nextPatient = userRole === 'doctor' ? null : createPatientProfile(user);
      const fallbackDoctor = userRole === 'doctor' ? createDoctorProfileFallback(user) : null;

      if (!isMounted) return;

      setRoleState(userRole);
      setCurrentPatientState(nextPatient);
      setCurrentDoctorState(fallbackDoctor);
      setAppointmentsLoading(true);
      setAppointmentsError('');
      setRegisteredDoctorsLoading(true);
      setRegisteredDoctorsError('');
      setPrescriptions([]);
      setPrescriptionsLoading(true);
      setPrescriptionsError('');

      try {
        let nextDoctor = null;

        if (userRole === 'doctor') {
          const ensuredDoctor = await ensureDoctorProfile(user);
          if (!isMounted) return;

          if (ensuredDoctor.error) {
            setRegisteredDoctorsError(ensuredDoctor.error.message);
          } else {
            nextDoctor = ensuredDoctor.data;
            setCurrentDoctorState(nextDoctor);
          }
        } else {
          setCurrentDoctorState(null);
        }

        const [{ data: doctorsData, error: doctorsError }, { data: appointmentsData, error: appointmentsFetchError }] =
          await Promise.all([
            fetchRegisteredDoctors(),
            fetchAppointmentsForViewer({
              role: userRole,
              userId: user.uid,
              doctorId: nextDoctor?.id || fallbackDoctor?.id || user.uid,
            }),
          ]);

        if (!isMounted) return;

        if (doctorsError) {
          const cachedDoctors = getCachedDoctorDirectory(nextDoctor || fallbackDoctor);
          setRegisteredDoctors(cachedDoctors);
          setRegisteredDoctorsError((currentError) => currentError || doctorsError.message);
        } else {
          const mergedDoctors = mergeDoctorDirectories(
            getCachedDoctorDirectory(nextDoctor || fallbackDoctor),
            doctorsData
          );
          setRegisteredDoctors(mergedDoctors);
          if (userRole === 'doctor') {
            const matchedDoctor = nextDoctor || mergedDoctors.find((doctor) => doctor.userId === user.uid) || fallbackDoctor;
            setCurrentDoctorState(matchedDoctor);
          }
        }

        if (appointmentsFetchError) {
          setAppointments([]);
          setAppointmentsError(appointmentsFetchError.message);
        } else {
          setAppointments(appointmentsData);
        }

        if (userRole === 'patient') {
          const { data: prescriptionsData, error: prescriptionsError } = await fetchPrescriptionsForPatient(user.uid);
          if (!isMounted) return;

          if (prescriptionsError) {
            setPrescriptionsError(prescriptionsError.message);
          } else {
            setPrescriptions(prescriptionsData || []);
          }
        } else if (userRole === 'doctor') {
          const { data: prescriptionsData, error: prescriptionsError } = await fetchPrescriptionsForDoctor(user.uid);
          if (!isMounted) return;

          if (prescriptionsError) {
            setPrescriptionsError(prescriptionsError.message);
          } else {
            setPrescriptions(prescriptionsData || []);
          }
        }
        setPrescriptionsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setRegisteredDoctors(getCachedDoctorDirectory(fallbackDoctor));
        setAppointments([]);
        setPrescriptions([]);
        setRegisteredDoctorsError(error instanceof Error ? error.message : 'Unable to load doctor data.');
      } finally {
        if (!isMounted) return;
        setRegisteredDoctorsLoading(false);
        setAppointmentsLoading(false);
        setPrescriptionsLoading(false);
      }
    };

    syncAppState();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const setRole = (nextRole) => setRoleState(nextRole);
  const setCurrentDoctor = (doctor) => setCurrentDoctorState(doctor);
  const setCurrentPatient = (patient) => setCurrentPatientState(patient);

  const syncDoctorProfile = async (updates) => {
    if (!user || (role || user.role) !== 'doctor') {
      return { data: null, error: new Error('Only doctors can sync doctor profiles.') };
    }

    const result = await ensureDoctorProfile(user, updates);
    if (result.error) {
      setRegisteredDoctorsError(result.error.message);
      return result;
    }

    setRegisteredDoctorsError('');
    setCurrentDoctorState(result.data);
    setRegisteredDoctors((currentDoctors) => {
      const others = currentDoctors.filter((doctor) => doctor.userId !== user.uid);
      return [...others, result.data].sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
  };

  const logout = () => {
    setRoleState(null);
    setCurrentDoctorState(null);
    setCurrentPatientState(null);
    setRegisteredDoctors([]);
    setRegisteredDoctorsError('');
    setAppointments([]);
    setAppointmentsError('');
    setPrescriptions([]);
    setPrescriptionsError('');
  };

  const bookAppointment = async (appointmentData) => {
    if (!user || !currentPatient) {
      return { data: null, error: new Error('You must be signed in as a patient to book an appointment.') };
    }

    const doctor = registeredDoctors.find((item) => item.id === appointmentData.doctorId);

    if (!doctor) {
      return { data: null, error: new Error('Please choose a registered doctor from the directory.') };
    }

    const result = await createAppointmentRecord({
      patientProfile: currentPatient,
      doctor,
      user,
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type,
      notes: appointmentData.notes || '',
    });

    if (result.error) {
      setAppointmentsError(result.error.message);
      return result;
    }

    setAppointmentsError('');
    setAppointments((currentAppointments) =>
      [...currentAppointments, result.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );

    return result;
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    const result = await updateAppointmentRecordStatus(appointmentId, newStatus);

    if (result.error) {
      setAppointmentsError(result.error.message);
      return result;
    }

    setAppointmentsError('');
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId ? result.data : appointment
      )
    );

    return result;
  };

  const editAppointment = async (appointmentId, appointmentData) => {
    if (!user || !currentPatient) {
      return { data: null, error: new Error('You must be signed in as a patient to edit an appointment.') };
    }

    const doctor = registeredDoctors.find((item) => item.id === appointmentData.doctorId);

    if (!doctor) {
      return { data: null, error: new Error('Please choose a registered doctor from the directory.') };
    }

    const result = await updateAppointmentRecord(appointmentId, {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorPhoto: doctor.photo,
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type,
      notes: appointmentData.notes || '',
      location: `${doctor.department || doctor.specialty || 'Care'} Wing, Room ${Math.floor(Math.random() * 900) + 100}`,
    });

    if (result.error) {
      setAppointmentsError(result.error.message);
      return result;
    }

    setAppointmentsError('');
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId ? result.data : appointment
      )
    );

    return result;
  };

  const deleteAppointment = async (appointmentId) => {
    const result = await deleteAppointmentRecord(appointmentId);

    if (result.error) {
      setAppointmentsError(result.error.message);
      return result;
    }

    setAppointmentsError('');
    setAppointments((currentAppointments) =>
      currentAppointments.filter((appointment) => appointment.id !== appointmentId)
    );

    return result;
  };

  const addPrescription = async (prescriptionData) => {
    if (!user || role !== 'doctor' || !currentDoctor) {
      return { data: null, error: new Error('Only doctors can create prescriptions.') };
    }

    const result = await createPrescriptionRecord({
      appointmentId: prescriptionData.appointmentId,
      patientProfile: prescriptionData.patientProfile,
      doctorProfile: currentDoctor,
      medicineName: prescriptionData.medicineName,
      dosage: prescriptionData.dosage,
      frequency: prescriptionData.frequency,
      instructions: prescriptionData.instructions || '',
      duration: prescriptionData.duration || '',
      refills: prescriptionData.refills || 0,
      pharmacy: prescriptionData.pharmacy || '',
      expiryDate: prescriptionData.expiryDate || '',
      notes: prescriptionData.notes || '',
    });

    if (result.error) {
      setPrescriptionsError(result.error.message);
      return result;
    }

    setPrescriptionsError('');
    setPrescriptions((currentPrescriptions) => [result.data, ...currentPrescriptions]);

    return result;
  };

  // Memoized values to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    role,
    currentDoctor,
    currentPatient,
    registeredDoctors,
    registeredDoctorsLoading,
    registeredDoctorsError,
    appointments,
    appointmentsLoading,
    appointmentsError,
    prescriptions,
    prescriptionsLoading,
    prescriptionsError,
    setRole,
    setCurrentDoctor,
    setCurrentPatient,
    syncDoctorProfile,
    logout,
    bookAppointment,
    editAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    addPrescription,
  }), [
    role,
    currentDoctor,
    currentPatient,
    registeredDoctors,
    registeredDoctorsLoading,
    registeredDoctorsError,
    appointments,
    appointmentsLoading,
    appointmentsError,
    prescriptions,
    prescriptionsLoading,
    prescriptionsError,
    user,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
