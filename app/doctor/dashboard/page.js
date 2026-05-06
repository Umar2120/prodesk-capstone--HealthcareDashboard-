'use client';

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  CheckCircle,
  Star,
  User,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { useAuth } from "../../../lib/auth";
import { InlineSpinnerCard, SkeletonList, SkeletonStats, SkeletonTable } from "../../../components/LoadingStates";
import {
  formatAppointmentDate,
  getMonthlyAppointmentChartData,
  getStatusLabel,
  statusColors,
} from "../../../lib/appointments";
import { getDoctorDataSeed } from "../../../lib/mockData";
import { toast } from 'sonner';

const AppointmentVolumeChart = dynamic(
  () => import("../../../lib/AppointmentVolumeChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex items-center justify-center text-slate-500">
        Loading chart...
      </div>
    ),
  }
);

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { currentDoctor, appointments, appointmentsLoading, appointmentsError, addPrescription } = useApp();
  const router = useRouter();

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    // Only redirect after auth loading is complete AND user is null
    if (!authLoading && !user) {
      router.push('/login?role=doctor');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth (wait for loading to complete)
  if (authLoading) {
    return <InlineSpinnerCard title="Verifying session" message="Please wait while we verify your login." />;
  }
  const doctorProfile = currentDoctor ? getDoctorDataSeed(currentDoctor) : null;
  
  // Prescription form state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    instructions: '',
    duration: '',
    refills: 0,
    pharmacy: '',
    expiryDate: '',
  });
  const [prescribing, setPrescribing] = useState(false);

  // Handle opening prescription form for an appointment
  const openPrescriptionForm = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionForm({
      medicineName: '',
      dosage: '',
      frequency: '',
      instructions: '',
      duration: '',
      refills: 0,
      pharmacy: '',
      expiryDate: '',
    });
    setShowPrescriptionForm(true);
  };

  // Handle prescription submission
  const handleCreatePrescription = async () => {
    if (!selectedAppointment || !prescriptionForm.medicineName || !prescriptionForm.dosage || !prescriptionForm.frequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    setPrescribing(true);

    const result = await addPrescription({
      appointmentId: selectedAppointment.id,
      patientProfile: {
        userId: selectedAppointment.patientUserId,
        name: selectedAppointment.patientName,
        email: selectedAppointment.patientEmail,
      },
      ...prescriptionForm,
    });

    setPrescribing(false);

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Prescription created successfully!');
      setShowPrescriptionForm(false);
      setSelectedAppointment(null);
    }
  };

  // Memoized values to prevent unnecessary re-renders
  const memoizedAnalytics = useMemo(() => ({
    displayName: doctorProfile?.name?.replace(/^Dr\.\s*/i, "").split(" ")[0] || "Doctor",
    myAppointments: [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    todayKey: new Date().toISOString().split("T")[0],
  }), [appointments, doctorProfile]);

  const { displayName, myAppointments, todayKey } = memoizedAnalytics;
  const todayAppts = myAppointments.filter((a) => a.date === todayKey);
  const upcomingAppts = myAppointments.filter((a) => a.status === "scheduled").slice(0, 5);
  const completedAppts = myAppointments.filter((a) => a.status === "completed");
  const chartData = getMonthlyAppointmentChartData(myAppointments);
  const currentMonthLabel = new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const thisMonthTotal = chartData.reduce((sum, point) => sum + point.total, 0);
  const thisMonthCompleted = chartData.reduce((sum, point) => sum + point.completed, 0);
  const uniquePatients = [...new Map(
    myAppointments.map((appointment) => [
      appointment.patientId || appointment.patientEmail,
      {
        id: appointment.patientId || appointment.patientEmail,
        name: appointment.patientName,
        photo: appointment.patientPhoto,
      },
    ])
  ).values()];

  const analyticsData = [
    { label: "Total Patients", value: uniquePatients.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Appointments Today", value: todayAppts.length, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completed", value: completedAppts.length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Average Rating", value: Number(doctorProfile?.rating ?? 4.8).toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  if (!currentDoctor) {
    return <InlineSpinnerCard title="Loading your dashboard" message="Preparing today's schedule, patient stats, and appointment trends." />;
  }

  if (!doctorProfile) {
    return <InlineSpinnerCard title="Loading your profile" message="Finishing doctor profile setup for the dashboard." />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-xl lg:text-3xl font-bold text-slate-900">
          Welcome back,{" "}
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="inline-flex items-center gap-1 underline decoration-slate-300 underline-offset-4 text-slate-900 hover:text-blue-600 transition"
          >
            Dr. {displayName}
            <User className="w-4 h-4" />
          </button>
        </h1>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Your live dashboard for {doctorProfile.department}</p>
      </div>

      {appointmentsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {appointmentsError}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {appointmentsLoading ? (
          <div className="col-span-full">
            <SkeletonStats />
          </div>
        ) : analyticsData.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Today's Appointments</h2>
            <button
              onClick={() => router.push("/doctor/appointments")}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View all {'->'}
            </button>
          </div>

          {appointmentsLoading ? (
            <SkeletonList count={3} />
          ) : todayAppts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  {appointment.patientPhoto ? (
                    <img src={appointment.patientPhoto} alt={appointment.patientName || "Patient"} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                      Pt
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{appointment.patientName || "Patient"}</p>
                    <p className="text-sm text-slate-500">{appointment.time}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Availability</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${doctorProfile.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="text-sm font-medium text-slate-900">
                  {doctorProfile.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Next Available Slot</p>
              <p className="text-slate-900 font-medium">{doctorProfile.nextAvailable}</p>
            </div>
            <button
              onClick={() => router.push("/doctor/availability")}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Manage Availability
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_0.9fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Appointments This Month</h2>
              <p className="text-slate-400 text-sm">Daily appointment volume for {currentMonthLabel}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Total
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Completed
              </span>
            </div>
          </div>

          {appointmentsLoading ? (
            <div className="h-72 flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : (
            <AppointmentVolumeChart data={chartData} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Monthly Summary</h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total visits</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{thisMonthTotal}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-500">Completed visits</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{thisMonthCompleted}</p>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-500">Average per day</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {thisMonthTotal ? (thisMonthTotal / chartData.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
            <p className="text-slate-400 text-sm">Fetched from your cloud dataset</p>
          </div>
          <button
            onClick={() => router.push("/doctor/appointments")}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View all {'->'}
          </button>
        </div>

        {appointmentsLoading ? (
          <SkeletonTable rows={4} cols={4} />
        ) : upcomingAppts.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No upcoming appointments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppts.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900">{appointment.patientName || "Patient"}</td>
                    <td className="py-3 px-4 text-slate-600">{formatAppointmentDate(appointment.date)} {appointment.time}</td>
                    <td className="py-3 px-4 text-slate-600">{appointment.type}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Write Prescription</h3>
              <button
                onClick={() => setShowPrescriptionForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-slate-600">Patient: <span className="font-medium text-slate-900">{selectedAppointment.patientName}</span></p>
                <p className="text-sm text-slate-600">Appointment: {formatAppointmentDate(selectedAppointment.date)} at {selectedAppointment.time}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={prescriptionForm.medicineName}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicineName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Amoxicillin"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
                  <input
                    type="text"
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3 times daily"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
                <textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="e.g., Take after meals"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 7 days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Refills</label>
                  <input
                    type="number"
                    min="0"
                    value={prescriptionForm.refills}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refills: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pharmacy</label>
                  <input
                    type="text"
                    value={prescriptionForm.pharmacy}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, pharmacy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CVS Pharmacy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={prescriptionForm.expiryDate}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPrescriptionForm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrescription}
                disabled={prescribing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {prescribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
