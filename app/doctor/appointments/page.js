'use client';

import { useState } from "react";
import { Calendar, Clock, MapPin, CheckCircle, X } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { InlineSpinnerCard, SkeletonList } from "../../../components/LoadingStates";
import { formatAppointmentDate, getStatusLabel, statusColors } from "../../../lib/appointments";
import { toast } from "sonner";

export default function DoctorAppointments() {
  const {
    currentDoctor,
    appointments,
    appointmentsLoading,
    appointmentsError,
    updateAppointmentStatus,
  } = useApp();
  const [filterStatus, setFilterStatus] = useState("All");
  const [actioningId, setActioningId] = useState("");

  if (!currentDoctor) {
    return <InlineSpinnerCard title="Loading appointments" message="Fetching your patient schedule and current statuses." />;
  }

  const myAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const filtered =
    filterStatus === "All"
      ? myAppointments
      : myAppointments.filter((a) => a.status === filterStatus.toLowerCase());

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setActioningId(appointmentId);
    const result = await updateAppointmentStatus(appointmentId, newStatus);
    setActioningId("");

    if (result?.error) {
      toast.error(result.error.message || "Unable to update appointment status.");
      return;
    }

    const labels = {
      scheduled: "Appointment approved successfully.",
      cancelled: "Appointment rejected successfully.",
      completed: "Appointment marked as completed.",
    };
    toast.success(labels[newStatus] || "Appointment updated successfully.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage your patient appointments</p>
      </div>

      {appointmentsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {appointmentsError}
        </div>
      )}

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

      {appointmentsLoading ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500">No appointments found</p>
            </div>
          ) : (
            filtered.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4 flex-col md:flex-row">
                  <img src={appointment.patientPhoto} alt={appointment.patientName || "Patient"} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-900">{appointment.patientName || "Patient"}</h3>
                        <p className="text-sm text-slate-500">{appointment.patientEmail}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatAppointmentDate(appointment.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {appointment.location}
                      </div>
                    </div>
                    {appointment.notes && <p className="mt-2 text-sm text-slate-600">Notes: {appointment.notes}</p>}

                    <div className="mt-4 flex gap-2 flex-wrap">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, "scheduled")}
                            disabled={actioningId === appointment.id}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                            disabled={actioningId === appointment.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-60"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {appointment.status === "scheduled" && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "completed")}
                          disabled={actioningId === appointment.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-60"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
