'use client';

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { ConfirmDialog, InlineSpinnerCard, SkeletonList } from "../../../components/LoadingStates";
import {
  formatAppointmentDate,
  getStatusLabel,
  statusColors,
} from "../../../lib/appointments";
import { toast } from "sonner";

export default function Appointments() {
  const {
    currentPatient,
    appointments,
    appointmentsLoading,
    appointmentsError,
    registeredDoctors,
    registeredDoctorsLoading,
    registeredDoctorsError,
    bookAppointment,
    editAppointment,
    deleteAppointment,
  } = useApp();
  const [filterStatus, setFilterStatus] = useState("All");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState("");
  const [deletingAppointmentId, setDeletingAppointmentId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");

  useEffect(() => {
    if (!editingAppointmentId || selectedDoctor || registeredDoctors.length === 0) return;

    const appointment = appointments.find((item) => item.id === editingAppointmentId);
    if (!appointment) return;

    const matchedDoctor = registeredDoctors.find((doctor) => doctor.id === appointment.doctorId);
    if (matchedDoctor) {
      setSelectedDoctor(matchedDoctor);
    }
  }, [appointments, editingAppointmentId, registeredDoctors, selectedDoctor]);

  if (!currentPatient) {
    return <InlineSpinnerCard title="Loading your appointments" message="Fetching your patient profile and upcoming visits." />;
  }

  const myAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const filtered =
    filterStatus === "All"
      ? myAppointments
      : myAppointments.filter((a) => a.status === filterStatus.toLowerCase());

  const statusDescriptions = {
    pending: "Awaiting doctor confirmation",
    scheduled: "Appointment confirmed",
    completed: "Visit completed",
    cancelled: "Appointment cancelled",
  };

  const appointmentTypes = ["Consultation", "Follow-up", "Check-up", "Lab Work"];

  const resetBookingFlow = () => {
    setShowBooking(false);
    setBookingStep(1);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setBookingError("");
    setSubmitting(false);
    setEditingAppointmentId("");
  };

  const openEditFlow = (appointment) => {
    const doctor = registeredDoctors.find((item) => item.id === appointment.doctorId) || null;
    setEditingAppointmentId(appointment.id);
    setSelectedDoctor(doctor);
    setSelectedDate(appointment.date);
    setSelectedTime(appointment.time);
    setAppointmentType(appointment.type);
    setNotes(appointment.notes || "");
    setBookingError("");
    setBookingSuccess(false);
    setShowBooking(true);
    setBookingStep(doctor ? 2 : 1);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setBookingError("");

    const action = editingAppointmentId
      ? editAppointment(editingAppointmentId, {
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: selectedTime,
          type: appointmentType,
          notes,
        })
      : bookAppointment({
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: selectedTime,
          type: appointmentType,
          notes,
        });

    const result = await action;

    setSubmitting(false);

    if (result.error) {
      setBookingError(result.error.message || "Unable to save your appointment right now.");
      toast.error(result.error.message || "Unable to save your appointment right now.");
      return;
    }

    setBookingSuccess(true);
    toast.success(editingAppointmentId ? "Appointment updated successfully." : "Appointment booked successfully.");

    setTimeout(() => {
      resetBookingFlow();
      setBookingSuccess(false);
    }, 2000);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    setConfirmDeleteId("");
    setDeletingAppointmentId(appointmentId);
    const result = await deleteAppointment(appointmentId);
    setDeletingAppointmentId("");

    if (result.error) {
      setBookingError(result.error.message || "Unable to delete this appointment right now.");
      toast.error(result.error.message || "Unable to delete this appointment right now.");
      return;
    }

    toast.success("Appointment deleted successfully.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage and view your medical appointments</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setBookingSuccess(false);
            resetBookingFlow();
            setShowBooking(true);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Book Appointment
        </button>
      </div>

      {(appointmentsError || registeredDoctorsError || bookingError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {appointmentsError || registeredDoctorsError || bookingError}
        </div>
      )}

      {showBooking && bookingSuccess && (
        <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center bg-emerald-50">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">
            {editingAppointmentId ? "Appointment Updated!" : "Appointment Booked!"}
          </h2>
          <p className="text-emerald-700">
            {editingAppointmentId
              ? "Your appointment changes were saved successfully."
              : "Your appointment is pending doctor approval. You'll be notified once confirmed."}
          </p>
        </div>
      )}

      {showBooking && !bookingSuccess && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {editingAppointmentId ? "Edit Appointment" : "Book an Appointment"}
            </h2>
            <button
              onClick={resetBookingFlow}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              x
            </button>
          </div>

          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= bookingStep ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step < bookingStep ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {bookingStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Select a Doctor</h3>
              {registeredDoctorsLoading ? (
                <SkeletonList count={4} />
              ) : registeredDoctors.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  No registered doctors are available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {registeredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setBookingStep(2);
                      }}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        selectedDoctor?.id === doctor.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex gap-3">
                        {doctor.photo ? (
                          <img src={doctor.photo} alt={doctor.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                            No Photo
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{doctor.name}</p>
                          <p className="text-xs text-slate-600">{doctor.specialty}</p>
                          <p className="text-xs text-amber-600">Rating: {doctor.rating.toFixed(1)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setBookingStep(2)}
                disabled={!selectedDoctor}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {bookingStep === 2 && selectedDoctor && (
            <div className="space-y-4">
              <button
                onClick={() => setBookingStep(1)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Back
              </button>
              <h3 className="font-semibold text-slate-900">{selectedDoctor.name}</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {appointmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setAppointmentType(type)}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        appointmentType === type
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctor.slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-2 rounded text-sm font-medium transition-colors ${
                          selectedTime === slot
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {bookingStep === 3 && selectedDoctor && selectedDate && selectedTime && (
            <div className="space-y-4">
              <button
                onClick={() => setBookingStep(2)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Back
              </button>
              <h3 className="font-semibold text-slate-900">
                {editingAppointmentId ? "Review Changes" : "Review Appointment"}
              </h3>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Doctor</span>
                  <span className="font-medium text-slate-900">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Specialty</span>
                  <span className="font-medium text-slate-900">{selectedDoctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Date</span>
                  <span className="font-medium text-slate-900">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Time</span>
                  <span className="font-medium text-slate-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Type</span>
                  <span className="font-medium text-slate-900">{appointmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="font-medium text-amber-700">
                    {editingAppointmentId ? "Will remain unchanged" : "Pending Approval"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setBookingStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting
                    ? "Saving..."
                    : editingAppointmentId
                      ? "Save Changes"
                      : "Confirm Booking"}
                </button>
              </div>
              {bookingError && <p className="text-sm text-rose-600">{bookingError}</p>}
            </div>
          )}
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
            filtered.map((apt) => {
              const doctor = registeredDoctors.find((d) => d.id === apt.doctorId) || {
                name: apt.doctorName,
                specialty: apt.doctorSpecialty,
                photo: apt.doctorPhoto,
              };
              const canManage = apt.status === "pending" || apt.status === "scheduled";

              return (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {doctor.photo ? (
                      <img src={doctor.photo} alt={doctor.name || "Doctor"} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-slate-900">{doctor.name || "Doctor"}</h3>
                          <p className="text-sm text-slate-500">{doctor.specialty || "General Medicine"}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusColors[apt.status]}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{statusDescriptions[apt.status]}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-4 text-sm text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatAppointmentDate(apt.date)}
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
                      {apt.notes && <p className="mt-2 text-sm text-slate-600">Notes: {apt.notes}</p>}

                      {canManage ? (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => openEditFlow(apt)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(apt.id)}
                            disabled={deletingAppointmentId === apt.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingAppointmentId === apt.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => (deletingAppointmentId ? null : setConfirmDeleteId(""))}
        onConfirm={() => handleDeleteAppointment(confirmDeleteId)}
        title="Delete appointment?"
        message="This appointment will be removed from your schedule immediately."
        confirmText="Delete"
        cancelText="Keep"
        variant="danger"
        loading={Boolean(confirmDeleteId) && deletingAppointmentId === confirmDeleteId}
      />
    </div>
  );
}
