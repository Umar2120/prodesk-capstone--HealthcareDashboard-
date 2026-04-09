'use client';

import { useState } from "react";
import { Calendar, Clock, MapPin, CheckCircle, X, AlertCircle } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { patients } from "../../../lib/mockData";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DoctorAppointments() {
  const { currentDoctor, appointments, updateAppointmentStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState("All");

  if (!currentDoctor) return null;

  const myAppointments = appointments
    .filter((a) => a.doctorId === currentDoctor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered =
    filterStatus === "All"
      ? myAppointments
      : myAppointments.filter((a) => a.status === filterStatus.toLowerCase());

  const handleApprove = (appointmentId) => {
    updateAppointmentStatus(appointmentId, "scheduled");
  };

  const handleReject = (appointmentId) => {
    updateAppointmentStatus(appointmentId, "cancelled");
  };

  const handleComplete = (appointmentId) => {
    updateAppointmentStatus(appointmentId, "completed");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 mt-1">Manage your patient appointments</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "Scheduled", "Completed", "Cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No appointments found</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const patient = patients.find((p) => p.id === apt.patientId);
            return (
              <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4 flex-col md:flex-row">
                  <img
                    src={patient?.photo}
                    alt={patient?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-900">{patient?.name}</h3>
                        <p className="text-sm text-slate-500">{patient?.age} years • {patient?.bloodType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {apt.location}
                      </div>
                    </div>
                    {apt.notes && <p className="mt-2 text-sm text-slate-600">📝 {apt.notes}</p>}
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(apt.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(apt.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {apt.status === "scheduled" && (
                        <button
                          onClick={() => handleComplete(apt.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
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