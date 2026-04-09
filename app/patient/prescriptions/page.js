'use client';

import { useState } from "react";
import { Pill, Calendar, FilePlus, AlertCircle } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { prescriptions as allPrescriptions, doctors } from "../../../lib/mockData";

const statusColors = {
  active: "bg-emerald-100 text-emerald-800",
  expired: "bg-slate-100 text-slate-800",
  filled: "bg-blue-100 text-blue-800",
};

export default function Prescriptions() {
  const { currentPatient } = useApp();
  const [selectedStatus, setSelectedStatus] = useState("All");

  if (!currentPatient) return null;

  const myPrescriptions = allPrescriptions
    .filter((p) => p.patientId === currentPatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered =
    selectedStatus === "All"
      ? myPrescriptions
      : myPrescriptions.filter((p) => p.status === selectedStatus.toLowerCase());

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Prescriptions</h1>
        <p className="text-slate-500 mt-1">Manage your medications</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["All", "Active", "Expired", "Filled"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No prescriptions found</p>
          </div>
        ) : (
          filtered.map((rx) => {
            const doctor = doctors.find((d) => d.id === rx.doctorId);
            return (
              <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-slate-900">Prescription #{rx.id}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">From {doctor?.name} • {rx.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rx.status]}`}>
                    {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                  </span>
                </div>

                {/* Medications */}
                <div className="space-y-2 bg-slate-50 rounded-lg p-4">
                  {rx.medications.map((med) => (
                    <div key={med.name} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900">{med.name}</p>
                        <p className="text-sm text-slate-600">{med.dosage} • {med.frequency}</p>
                        <p className="text-xs text-slate-500 mt-1">{med.instructions}</p>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p>{med.refills} refills</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {rx.expiryDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FilePlus className="w-4 h-4" />
                    <span>{rx.pharmacy}</span>
                  </div>
                </div>

                {rx.notes && (
                  <div className="bg-blue-50 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">{rx.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}