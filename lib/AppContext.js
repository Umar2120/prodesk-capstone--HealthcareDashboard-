'use client';

import React, { createContext, useContext, useState } from "react";
import { doctors, patients, appointments as initialAppointments } from "./mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [role, setRoleState] = useState(null);
  const [currentDoctor, setCurrentDoctorState] = useState(null);
  const [currentPatient, setCurrentPatientState] = useState(null);
  const [appointments, setAppointments] = useState(initialAppointments);

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
      location: `${currentDoctor?.department || "Department"} Wing, Room ${Math.floor(Math.random() * 999) + 100}`,
    };
    
    // Find the doctor object to get location
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
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}