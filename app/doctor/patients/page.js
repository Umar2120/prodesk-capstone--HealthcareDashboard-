'use client';

import { useState } from "react";
import { Heart, AlertCircle, Calendar } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { getAppointmentsForDoctor, getPatientsForDoctor } from "../../../lib/mockData";

export default function DoctorPatients() {
  const { currentDoctor } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  if (!currentDoctor) return null;

  const myAppointments = getAppointmentsForDoctor(currentDoctor);
  const myPatients = getPatientsForDoctor(currentDoctor);
  const filtered = myPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bloodType.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Patients</h1>
        <p className="text-slate-500 mt-1">Manage and view your patient list ({myPatients.length} total)</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by name or blood type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No patients found</p>
          </div>
        ) : (
          filtered.map((patient) => {
            const patientAppts = myAppointments.filter((a) => a.patientId === patient.id);
            const lastAppt = patientAppts[0];

            return (
              <div key={patient.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <img src={patient.photo} alt={patient.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                    <p className="text-sm text-slate-600">{patient.age} yrs · {patient.gender}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Heart className="w-4 h-4" />
                    <span>{patient.bloodType}</span>
                  </div>
                  {patient.conditions.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="truncate">{patient.conditions.join(", ")}</span>
                    </div>
                  )}
                  {patient.allergies.length > 0 && (
                    <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                      <p className="font-medium">Allergies:</p>
                      <p>{patient.allergies.join(", ")}</p>
                    </div>
                  )}
                </div>

                {lastAppt && (
                  <div className="mt-4 pt-4 border-t border-slate-200 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Last: {lastAppt.date}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <p>Email: {patient.email}</p>
                  <p>Phone: {patient.phone}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
