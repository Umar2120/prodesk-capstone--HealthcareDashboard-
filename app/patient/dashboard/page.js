'use client';

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Pill,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  AlertCircle,
  Droplets,
  Thermometer,
  Wind,
  User,
} from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { useAuth } from "../../../lib/auth";
import { InlineSpinnerCard, SkeletonList, SkeletonTable } from "../../../components/LoadingStates";
import AppointmentStatusChart from "../../../lib/AppointmentStatusChart";
import {
  formatAppointmentDate,
  getAppointmentStatusCounts,
  getStatusLabel,
  statusColors,
} from "../../../lib/appointments";
import {
  getPatientDataSeed,
  vitalSigns,
} from "../../../lib/mockData";

export default function PatientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { currentPatient, appointments, appointmentsLoading, appointmentsError, prescriptions } = useApp();
  const router = useRouter();

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    // Only redirect after auth loading is complete AND user is null
    if (!authLoading && !user) {
      router.push('/login?role=patient');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth (wait for loading to complete)
  if (authLoading) {
    return <InlineSpinnerCard title="Verifying session" message="Please wait while we verify your login." />;
  }
  const patientProfile = currentPatient ? getPatientDataSeed(currentPatient) : null;

  const displayName = patientProfile?.name?.split(" ")[0] || "Patient";
  
  // Use real appointments from Supabase
  const myAppts = useMemo(() => 
    [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointments]
  );
  
  const upcoming = myAppts.filter((a) => a.status === "scheduled");
  
  // Use real prescriptions from Supabase
  const activePrescriptions = useMemo(() => 
    prescriptions.filter((p) => p.status === "active"),
    [prescriptions]
  );
  
  const appointmentSummary = getAppointmentStatusCounts(myAppts);

  if (!currentPatient || !patientProfile) {
    return <InlineSpinnerCard title="Loading your dashboard" message="Building your care overview, vitals, and appointment summary." />;
  }

  const latestVitals = vitalSigns[vitalSigns.length - 1];
  const prevVitals = vitalSigns[vitalSigns.length - 2];

  const vitals = [
    {
      label: "Heart Rate",
      value: `${latestVitals.heartRate}`,
      unit: "bpm",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      trend: latestVitals.heartRate < prevVitals.heartRate ? "down" : "up",
      trendGood: latestVitals.heartRate < prevVitals.heartRate,
    },
    {
      label: "Blood Pressure",
      value: `${latestVitals.bloodPressureSys}/${latestVitals.bloodPressureDia}`,
      unit: "mmHg",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
      trend: latestVitals.bloodPressureSys < prevVitals.bloodPressureSys ? "down" : "up",
      trendGood: latestVitals.bloodPressureSys < prevVitals.bloodPressureSys,
    },
    {
      label: "O2 Saturation",
      value: `${latestVitals.oxygenSat}`,
      unit: "%",
      icon: Wind,
      color: "text-teal-500",
      bg: "bg-teal-50",
      trend: latestVitals.oxygenSat > prevVitals.oxygenSat ? "up" : "down",
      trendGood: latestVitals.oxygenSat >= prevVitals.oxygenSat,
    },
    {
      label: "Temperature",
      value: `${latestVitals.temperature}`,
      unit: "deg F",
      icon: Thermometer,
      color: "text-amber-500",
      bg: "bg-amber-50",
      trend: "stable",
      trendGood: true,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 sm:pt-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Good morning,{" "}
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="inline-flex items-center gap-1 underline decoration-slate-300 underline-offset-4 text-slate-900 hover:text-blue-600 transition"
            >
              {displayName}
              <User className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Wednesday, April 8, 2026 · Here's your health overview</p>
        </div>
        <button
          onClick={() => router.push("/patient/appointments")}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors w-full sm:w-auto"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {patientProfile.conditions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 text-sm font-medium">Active Conditions Reminder</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Managing: {patientProfile.conditions.join(", ")}. Stay consistent with your prescribed medications.
            </p>
          </div>
        </div>
      )}

      {appointmentsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {appointmentsError}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Appointments", value: upcoming.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50", action: () => router.push("/patient/appointments") },
          { label: "Active Prescriptions", value: activePrescriptions.length, icon: Pill, color: "text-violet-500", bg: "bg-violet-50", action: () => router.push("/patient/prescriptions") },
          { label: "Pending Requests", value: appointmentSummary.pending, icon: Activity, color: "text-rose-500", bg: "bg-rose-50", action: () => router.push("/patient/appointments") },
          { label: "Last Visit", value: "Mar 28", icon: Clock, color: "text-teal-500", bg: "bg-teal-50", action: () => router.push("/patient/history") },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className="bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-md transition-all group"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-slate-900 group-hover:text-blue-600 transition-colors" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>
              {stat.value}
            </p>
            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-900 font-semibold">Current Vitals</h2>
          <span className="text-slate-400 text-xs">Updated Apr 8, 2026</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {vitals.map((v) => (
            <div key={v.label} className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${v.bg} rounded-lg flex items-center justify-center`}>
                  <v.icon className={`w-4 h-4 ${v.color}`} />
                </div>
                {v.trend !== "stable" && (
                  <span className={`${v.trendGood ? "text-emerald-500" : "text-red-500"}`}>
                    {v.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  </span>
                )}
              </div>
              <p className="text-slate-900" style={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1 }}>
                {v.value}
                <span className="text-slate-400 ml-1" style={{ fontSize: "0.7rem", fontWeight: 400 }}>{v.unit}</span>
              </p>
              <p className="text-slate-500 text-xs mt-1">{v.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-semibold">Appointment Status Overview</h3>
              <p className="text-slate-400 text-xs mt-0.5">Live from your Supabase appointments</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{myAppts.length} total</span>
              <span>{appointmentSummary.pending} pending</span>
            </div>
          </div>
          <AppointmentStatusChart appointments={myAppts} />
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-semibold">Upcoming</h3>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="text-blue-500 text-xs font-medium hover:text-blue-600 flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {appointmentsLoading ? (
            <div className="py-2">
              <SkeletonList count={3} />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <img src={appointment.doctorPhoto} alt={appointment.doctorName || "Doctor"} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 text-sm font-medium truncate">{appointment.doctorName || "Doctor"}</p>
                    <p className="text-slate-400 text-xs">{appointment.doctorSpecialty || "General Medicine"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-600 text-xs">{formatAppointmentDate(appointment.date)} · {appointment.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-900 font-semibold">Cloud Appointments</h3>
            <p className="text-slate-400 text-xs mt-0.5">Fetched for {patientProfile.email}</p>
          </div>
          <button
            onClick={() => router.push("/patient/appointments")}
            className="text-blue-500 text-xs font-medium hover:text-blue-600 flex items-center gap-0.5"
          >
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {appointmentsLoading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : myAppts.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No cloud appointments yet. Book your first visit to populate this table.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-2 py-3 font-medium">Doctor</th>
                  <th className="px-2 py-3 font-medium">Date</th>
                  <th className="px-2 py-3 font-medium">Type</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {myAppts.slice(0, 5).map((appointment) => (
                  <tr key={appointment.id} className="border-b border-slate-50 text-sm text-slate-600">
                    <td className="px-2 py-3">
                      <div className="font-medium text-slate-900">{appointment.doctorName}</div>
                      <div className="text-xs text-slate-400">{appointment.doctorSpecialty}</div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="font-medium text-slate-900">{formatAppointmentDate(appointment.date)}</div>
                      <div className="text-xs text-slate-400">{appointment.time}</div>
                    </td>
                    <td className="px-2 py-3">{appointment.type}</td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[appointment.status]}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-500">{appointment.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-semibold">Active Prescriptions</h3>
          <button
            onClick={() => router.push("/patient/prescriptions")}
            className="text-blue-500 text-xs font-medium hover:text-blue-600 flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePrescriptions.map((rx) => (
            <div key={rx.id} className="border border-slate-100 rounded-xl p-3.5 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-100">
                  Active
                </span>
                <span className="text-slate-400 text-xs">{rx.date}</span>
              </div>
              <div className="space-y-1.5">
                {rx.medications.slice(0, 2).map((med) => (
                  <div key={med.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                    <span className="text-slate-700 text-sm truncate">{med.name}</span>
                    <span className="text-slate-400 text-xs ml-auto flex-shrink-0">{med.dosage}</span>
                  </div>
                ))}
                {rx.medications.length > 2 && (
                  <p className="text-slate-400 text-xs">+{rx.medications.length - 2} more</p>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-2 pt-2 border-t border-slate-50 truncate">
                Dr. {doctors.find((d) => d.id === rx.doctorId)?.name.replace("Dr. ", "") || "Care Team"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
