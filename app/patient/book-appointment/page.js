'use client';

import { useState } from "react";
import { Calendar, Clock, User, ArrowRight, CheckCircle } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { doctors } from "../../../lib/mockData";

export default function BookAppointment() {
  const { currentPatient, bookAppointment } = useApp();
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Confirm
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!currentPatient) return null;

  const appointmentTypes = ["Consultation", "Follow-up", "Check-up", "Lab Work"];

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      const appointment = {
        patientId: currentPatient.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes,
        status: "pending", // Pending doctor approval
      };

      bookAppointment(appointment);
      setBookingSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setStep(1);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
        setBookingSuccess(false);
      }, 2000);
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Appointment Booked!</h2>
            <p className="text-slate-600 mb-6">
              Your appointment has been scheduled and is pending doctor approval. You'll be notified once the doctor confirms.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-amber-900">Status: <span className="text-amber-700 font-semibold">Pending Approval</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
        <p className="text-slate-500 mt-1">Schedule a consultation with a healthcare professional</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s <= step
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  s < step ? "bg-blue-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Select a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
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
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                    <p className="text-sm text-slate-600">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        ⭐ {doctor.rating}
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
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(1)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Select Doctor
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {selectedDoctor.name}
            </h2>

            {/* Appointment Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Appointment Type
              </label>
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

            {/* Date Selection */}
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

            {/* Time Selection */}
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

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            </div>

            {/* Action Buttons */}
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
                Review Booking <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && selectedDoctor && selectedDate && selectedTime && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(2)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Edit
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Your Appointment</h2>

            <div className="space-y-4 mb-8">
              {/* Doctor Info */}
              <div className="flex gap-4 pb-6 border-b border-slate-200">
                <img
                  src={selectedDoctor.photo}
                  alt={selectedDoctor.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{selectedDoctor.name}</h3>
                  <p className="text-slate-600">{selectedDoctor.specialty}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedDoctor.hospital}</p>
                </div>
              </div>

              {/* Appointment Details */}
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
                  <p className="font-semibold text-amber-900">Pending Approval</p>
                </div>
              </div>

              {notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">NOTES</p>
                  <p className="text-slate-700">{notes}</p>
                </div>
              )}
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                After booking, this appointment will be pending doctor approval. You'll receive a notification once Dr. {selectedDoctor.name.split(' ')[1]} confirms.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleBookAppointment}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 text-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
