'use client';

import { useState } from "react";
import { AlertCircle, CheckCircle, Activity, Syringe, testTube } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { medicalHistory, doctors } from "../../../lib/mockData";

const typeIcons = {
  diagnosis: <AlertCircle className="w-5 h-5 text-red-500" />,
  procedure: <Activity className="w-5 h-5 text-purple-500" />,
  lab: <testTube className="w-5 h-5 text-blue-500" />,
  visit: <CheckCircle className="w-5 h-5 text-green-500" />,
  vaccination: <Syringe className="w-5 h-5 text-emerald-500" />,
  emergency: <AlertCircle className="w-5 h-5 text-orange-600" />,
};

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function MedicalHistory() {
  const { currentPatient } = useApp();
  const [selectedType, setSelectedType] = useState("All");

  if (!currentPatient) return null;

  const events = medicalHistory
    .filter((e) => e.patientId === currentPatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered =
    selectedType === "All"
      ? events
      : events.filter((e) => e.type === selectedType.toLowerCase());

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Medical History</h1>
        <p className="text-slate-500 mt-1">Your complete medical timeline</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Diagnosis", "Procedure", "Lab", "Visit", "Vaccination", "Emergency"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No events found</p>
          </div>
        ) : (
          filtered.map((event) => {
            const doctor = doctors.find((d) => d.id === event.doctorId);
            return (
              <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{typeIcons[event.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      </div>
                      {event.severity && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${severityColors[event.severity]}`}>
                          {event.severity === "low" ? "Low" : event.severity === "medium" ? "Medium" : "High"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <div>
                        <span>{event.date}</span>
                        {doctor && <span> • {doctor.name}</span>}
                      </div>
                      {event.attachments && event.attachments.length > 0 && (
                        <div className="flex gap-2">
                          {event.attachments.map((attachment) => (
                            <span key={attachment} className="text-blue-600 hover:underline cursor-pointer">
                              📎 {attachment}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}