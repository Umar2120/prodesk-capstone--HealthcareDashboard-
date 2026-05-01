'use client';

import { useMemo, useState } from "react";
import { Mail, Phone, Calendar } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { InlineSpinnerCard, SkeletonList } from "../../../components/LoadingStates";
import { formatAppointmentDate } from "../../../lib/appointments";

export default function DoctorPatients() {
  const { currentDoctor, appointments, appointmentsLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const myPatients = useMemo(() => {
    const grouped = new Map();

    appointments.forEach((appointment) => {
      const key = appointment.patientUserId || appointment.patientEmail || appointment.patientId;
      if (!key) return;

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          id: key,
          name: appointment.patientName || 'Patient',
          email: appointment.patientEmail || '',
          photo: appointment.patientPhoto || '',
          appointments: [appointment],
        });
      } else {
        existing.appointments.push(appointment);
      }
    });

    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);

  if (!currentDoctor) {
    return <InlineSpinnerCard title="Loading patients" message="Gathering patients from your latest appointment activity." />;
  }

  const filtered = myPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Patients</h1>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Patients booked with your registered doctor account ({myPatients.length} total)</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by patient name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {appointmentsLoading ? (
        <SkeletonList count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500">No patients found</p>
            </div>
          ) : (
            filtered.map((patient) => {
              const sortedAppointments = [...patient.appointments].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const lastAppointment = sortedAppointments[0];

              return (
                <div key={patient.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.name} className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                      <p className="text-sm text-slate-600">{sortedAppointments.length} appointments</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{patient.email || 'No email available'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{lastAppointment?.notes ? 'See appointment notes' : 'No notes yet'}</span>
                    </div>
                    {lastAppointment && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Latest: {formatAppointmentDate(lastAppointment.date)} at {lastAppointment.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
