'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { appointments, patients, doctors, medicalHistory } from "../../../lib/mockData";

export default function DoctorDashboard() {
  const { currentDoctor } = useApp();
  const router = useRouter();

  if (!currentDoctor) return null;

  const myAppointments = appointments.filter((a) => a.doctorId === currentDoctor.id);
  const todayAppts = myAppointments.filter((a) => a.date === "2026-04-10" || a.date === "2026-04-11");
  const upcomingAppts = myAppointments.filter((a) => a.status === "scheduled").slice(0, 5);
  const completedAppts = myAppointments.filter((a) => a.status === "completed");
  
  const uniquePatientIds = [...new Set(myAppointments.map((a) => a.patientId))];
  const myPatients = uniquePatientIds.length;

  const analyticsData = [
    { label: "Total Patients", value: myPatients, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Appointments Today", value: todayAppts.length, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completed This Week", value: completedAppts.length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Average Rating", value: currentDoctor.rating.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, Dr. {currentDoctor.name.split(" ")[1]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Tuesday, April 8, 2026 • {currentDoctor.department}</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Today's Appointments</h2>
            <button
              onClick={() => router.push("/doctor/appointments")}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View all →
            </button>
          </div>

          {todayAppts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.slice(0, 4).map((appt) => {
                const patient = patients.find((p) => p.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <img
                      src={patient?.photo}
                      alt={patient?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{patient?.name}</p>
                      <p className="text-sm text-slate-500">{appt.time}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                      {appt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Availability</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${currentDoctor.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="text-sm font-medium text-slate-900">
                  {currentDoctor.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Next Available Slot</p>
              <p className="text-slate-900 font-medium">{currentDoctor.nextAvailable}</p>
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

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
          <button
            onClick={() => router.push("/doctor/appointments")}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View all →
          </button>
        </div>

        {upcomingAppts.length === 0 ? (
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
                {upcomingAppts.map((appt) => {
                  const patient = patients.find((p) => p.id === appt.patientId);
                  return (
                    <tr key={appt.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{patient?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{appt.date} {appt.time}</td>
                      <td className="py-3 px-4 text-slate-600">{appt.type}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}