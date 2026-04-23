'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar, Clock, ArrowRight, CheckCircle, MapPin, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { formatAppointmentDate, getStatusLabel, statusColors } from "../../../lib/appointments";
import { toast } from 'sonner';

// Skeleton loader component for doctors
function DoctorSkeleton() {
  return (
    <div className="p-4 rounded-xl border-2 border-slate-200 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookAppointment() {
  const {
    currentPatient,
    appointments,
    appointmentsLoading,
    appointmentsError,
    bookAppointment,
    editAppointment,
    deleteAppointment,
    registeredDoctors,
    registeredDoctorsLoading,
    registeredDoctorsError,
  } = useApp();
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    if (!editingAppointmentId || selectedDoctor || registeredDoctors.length === 0) return;

    const appointment = appointments.find((item) => item.id === editingAppointmentId);
    if (!appointment) return;

    const matchedDoctor = registeredDoctors.find((doctor) => doctor.id === appointment.doctorId);
    if (matchedDoctor) {
      setSelectedDoctor(matchedDoctor);
    }
  }, [appointments, editingAppointmentId, registeredDoctors, selectedDoctor]);

  if (!currentPatient) return null;

  const appointmentTypes = ["Consultation", "Follow-up", "Check-up", "Lab Work"];
  const myAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const resetForm = () => {
    setStep(1);
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
    setStep(doctor ? 2 : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    toast.success(editingAppointmentId ? "Appointment updated successfully!" : "Appointment booked successfully!");

    setTimeout(() => {
      resetForm();
      setBookingSuccess(false);
    }, 2000);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!shouldDelete) return;

    setDeletingAppointmentId(appointmentId);
    const result = await deleteAppointment(appointmentId);
    setDeletingAppointmentId("");

    if (result.error) {
      setBookingError(result.error.message || "Unable to delete this appointment right now.");
      toast.error(result.error.message || "Unable to delete this appointment right now.");
    } else {
      toast.success("Appointment deleted successfully!");
    }
  };

  if (bookingSuccess) {
    return (
      <div className="p-6 min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-emerald-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {editingAppointmentId ? "Appointment Updated!" : "Appointment Booked!"}
            </h2>
            <p className="text-slate-600 mb-6">
              {editingAppointmentId
                ? "Your appointment changes were saved to Supabase."
                : "Your appointment has been saved to Supabase and is pending doctor approval."}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-amber-900">
                Status: <span className="text-amber-700 font-semibold">{editingAppointmentId ? "Updated" : "Pending Approval"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {editingAppointmentId ? "Edit Appointment" : "Book an Appointment"}
        </h1>
        <p className="text-slate-500 mt-1">Schedule a consultation with a registered doctor</p>
      </div>

      {(registeredDoctorsError || appointmentsError || bookingError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {bookingError || registeredDoctorsError || appointmentsError}
        </div>
      )}

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s <= step ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 mx-2 ${s < step ? "bg-blue-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Select a Doctor</h2>
          {registeredDoctorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <DoctorSkeleton key={i} />
              ))}
            </div>
          ) : registeredDoctors.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No registered doctors are available yet.</p>
              <p className="text-slate-400 text-sm mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registeredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setStep(2);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedDoctor?.id === doctor.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex gap-4">
                    {doctor.photo ? (
                      <img src={doctor.photo} alt={doctor.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                      <p className="text-sm text-slate-600">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          Rating: {doctor.rating.toFixed(1)}
                        </span>
                        {doctor.available && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Back to Select Doctor
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedDoctor.name}</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Appointment Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {appointmentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setAppointmentType(type)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      appointmentType === type
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Select Time Slot
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedDoctor.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editingAppointmentId ? "Review Changes" : "Review Booking"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedDoctor && selectedDate && selectedTime && (
        <div className="space-y-6">
          <button onClick={() => setStep(2)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Back to Edit
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingAppointmentId ? "Review Your Changes" : "Review Your Appointment"}
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4 pb-6 border-b border-slate-200">
                {selectedDoctor.photo ? (
                  <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    No Photo
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{selectedDoctor.name}</h3>
                  <p className="text-slate-600">{selectedDoctor.specialty}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedDoctor.hospital}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">DATE</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">TIME</p>
                  <p className="font-semibold text-slate-900">{selectedTime}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">TYPE</p>
                  <p className="font-semibold text-slate-900">{appointmentType}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium mb-1">STATUS</p>
                  <p className="font-semibold text-amber-900">
                    {editingAppointmentId ? "Will remain unchanged" : "Pending Approval"}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">NOTES</p>
                  <p className="text-slate-700">{notes}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                {editingAppointmentId
                  ? "When you save, the appointment in Supabase will be updated immediately."
                  : "After booking, this appointment will be saved to your cloud dataset and remain pending until the registered doctor reviews it."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? "Saving..." : editingAppointmentId ? "Save Changes" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
            <p className="text-slate-500 text-sm mt-1">Edit or delete pending and scheduled items</p>
          </div>
        </div>

        {appointmentsLoading ? (
          <div className="py-8 text-center text-slate-500">Loading appointments...</div>
        ) : myAppointments.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No appointments found</div>
        ) : (
          <div className="space-y-3">
            {myAppointments.map((appointment) => {
              const doctor = registeredDoctors.find((item) => item.id === appointment.doctorId) || {
                name: appointment.doctorName,
                specialty: appointment.doctorSpecialty,
                photo: appointment.doctorPhoto,
              };
              const canManage = appointment.status === 'pending' || appointment.status === 'scheduled';

              return (
                <div key={appointment.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex gap-4">
                    {doctor.photo ? (
                      <img src={doctor.photo} alt={doctor.name || "Doctor"} className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-slate-900">{doctor.name || "Doctor"}</h3>
                          <p className="text-sm text-slate-500">{doctor.specialty || "General Medicine"}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-4 text-sm text-slate-600 flex-wrap">
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

                      {appointment.notes ? (
                        <p className="mt-2 text-sm text-slate-600">Notes: {appointment.notes}</p>
                      ) : null}

                      {canManage ? (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => openEditFlow(appointment)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            disabled={deletingAppointmentId === appointment.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingAppointmentId === appointment.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
