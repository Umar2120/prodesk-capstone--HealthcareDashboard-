'use client';

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
import {
  doctors,
  getAppointmentsForPatient,
  getPatientDataSeed,
  getPrescriptionsForPatient,
  vitalSigns,
} from "../../../lib/mockData";

export default function PatientDashboard() {
  const { currentPatient } = useApp();
  const router = useRouter();

  if (!currentPatient) return null;

  const patientProfile = getPatientDataSeed(currentPatient);
  const displayName = patientProfile.name.split(" ")[0];
  const myAppts = getAppointmentsForPatient(currentPatient).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const upcoming = myAppts.filter((a) => a.status === "scheduled");
  const activePrescriptions = getPrescriptionsForPatient(currentPatient).filter(
    (p) => p.status === "active"
  );

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Good morning,{" "}
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="inline-flex items-center gap-2 underline decoration-slate-300 underline-offset-4 text-slate-900 hover:text-blue-600 transition"
            >
              {displayName}
              <User className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Wednesday, April 8, 2026 · Here's your health overview</p>
        </div>
        <button
          onClick={() => router.push("/patient/appointments")}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Appointments", value: upcoming.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50", action: () => router.push("/patient/appointments") },
          { label: "Active Prescriptions", value: activePrescriptions.length, icon: Pill, color: "text-violet-500", bg: "bg-violet-50", action: () => router.push("/patient/prescriptions") },
          { label: "Active Conditions", value: patientProfile.conditions.length, icon: Activity, color: "text-rose-500", bg: "bg-rose-50", action: () => router.push("/patient/history") },
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
              <h3 className="text-slate-900 font-semibold">Blood Pressure Trend</h3>
              <p className="text-slate-400 text-xs mt-0.5">Last 6 readings</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-blue-500 rounded inline-block" />Systolic</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-teal-400 rounded inline-block" />Diastolic</span>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
            Chart Placeholder (Install recharts for full chart)
          </div>
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
          {upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((appt) => {
                const doc = doctors.find((d) => d.id === appt.doctorId);
                return (
                  <div key={appt.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <img src={doc?.photo} alt={doc?.name || "Doctor"} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 text-sm font-medium truncate">{doc?.name || "Doctor"}</p>
                      <p className="text-slate-400 text-xs">{doc?.specialty || "General Medicine"}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-600 text-xs">{appt.date} · {appt.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
