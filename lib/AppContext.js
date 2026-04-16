'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doctors, appointments as initialAppointments } from './mockData';
import { useAuth } from './auth';

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
  emergencyContact: 'Alex Smith — +1 (555) 765-4321',
  lastVisit: 'April 8, 2026',
});

const createDoctorProfile = (user) => ({
  id: `d_${user.uid}`,
  name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
  specialty: 'General Medicine',
  photo: user.photo || '',
  available: true,
  rating: 4.8,
  experience: 12,
  hospital: 'VitalSync Medical Center',
  department: 'General Medicine',
  nextAvailable: 'Today, 2:00 PM',
  slots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:30 PM'],
  bio: 'Primary care physician focused on preventive health and long-term patient relationships.',
  patients: 214,
  phone: user.phone || '',
  dob: user.dob || '',
});

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState(null);
  const [currentDoctor, setCurrentDoctorState] = useState(null);
  const [currentPatient, setCurrentPatientState] = useState(null);
  const [appointments, setAppointments] = useState(initialAppointments);

  useEffect(() => {
    if (!user) {
      setRoleState(null);
      setCurrentDoctorState(null);
      setCurrentPatientState(null);
      return;
    }

    const userRole = user.role || 'patient';
    setRoleState(userRole);

    if (userRole === 'doctor') {
      setCurrentDoctorState(createDoctorProfile(user));
      setCurrentPatientState(null);
    } else {
      setCurrentPatientState(createPatientProfile(user));
      setCurrentDoctorState(null);
    }
  }, [user]);

  const setRole = (r) => setRoleState(r);
  const setCurrentDoctor = (d) => setCurrentDoctorState(d);
  const setCurrentPatient = (p) => setCurrentPatientState(p);

  const logout = () => {
    setRoleState(null);
    setCurrentDoctorState(null);
    setCurrentPatientState(null);
  };

  const bookAppointment = (appointmentData) => {
    const newAppointment = {
      id: `a${appointments.length + 1}`,
      ...appointmentData,
      location: `${currentDoctor?.department || 'Department'} Wing, Room ${Math.floor(Math.random() * 999) + 100}`,
    };

    const doctor = doctors.find(d => d.id === appointmentData.doctorId);
    if (doctor) {
      newAppointment.location = `${doctor.department}, Room ${Math.floor(Math.random() * 999) + 100}`;
    }

    setAppointments([...appointments, newAppointment]);
  };

  const updateAppointmentStatus = (appointmentId, newStatus) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentDoctor,
        currentPatient,
        appointments,
        setRole,
        setCurrentDoctor,
        setCurrentPatient,
        logout,
        bookAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
