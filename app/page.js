'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Stethoscope, ArrowRight, Shield, Activity, Users } from "lucide-react";
import { useApp } from "../lib/AppContext";
import { doctors, patients } from "../lib/mockData";

export default function Login() {
  const { setRole, setCurrentDoctor, setCurrentPatient } = useApp();
  const router = useRouter();
  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep("select");
  };

  const handleUserSelect = (id) => {
    if (selectedRole === "doctor") {
      const doc = doctors.find((d) => d.id === id);
      setCurrentDoctor(doc);
      setRole("doctor");
      router.push("/doctor/dashboard");
    } else {
      const pat = patients.find((p) => p.id === id);
      setCurrentPatient(pat);
      setRole("patient");
      router.push("/patient/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-6">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="text-white text-xl font-semibold tracking-tight">VitalSync</span>
        <span className="text-blue-400 text-sm ml-1">Healthcare</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {step === "role" ? (
            <>
              {/* Hero */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300 text-xs font-medium">Intelligent Healthcare Platform</span>
                </div>
                <h1 className="text-white mb-4" style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.1 }}>
                  Your health, connected.
                </h1>
                <p className="text-slate-400 max-w-md mx-auto" style={{ fontSize: "1.05rem" }}>
                  Seamless care coordination between patients and physicians — all in one place.
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <button
                  onClick={() => handleRoleSelect("patient")}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl p-8 text-left transition-all duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="w-7 h-7 text-blue-400" />
                  </div>
                  <h2 className="text-white mb-2" style={{ fontSize: "1.35rem", fontWeight: 600 }}>I'm a Patient</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    View appointments, medical history, prescriptions, and connect with your care team.
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <span>Continue as Patient</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("doctor")}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 rounded-2xl p-8 text-left transition-all duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500/30 transition-colors">
                    <Stethoscope className="w-7 h-7 text-teal-400" />
                  </div>
                  <h2 className="text-white mb-2" style={{ fontSize: "1.35rem", fontWeight: 600 }}>I'm a Doctor</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Manage patient schedules, review records, update availability, and coordinate care.
                  </p>
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                    <span>Continue as Doctor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Features */}
              <div className="flex items-center justify-center gap-8 text-slate-500 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>256-bit Encryption</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to role selection
              </button>

              <div className="text-center mb-10">
                <h2 className="text-white mb-2" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                  {selectedRole === "patient" ? "Select your profile" : "Select your physician profile"}
                </h2>
                <p className="text-slate-400 text-sm">Choose a demo account to explore the platform</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {selectedRole === "patient"
                  ? patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleUserSelect(patient.id)}
                        className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 text-left transition-all duration-300 cursor-pointer"
                      >
                        <img
                          src={patient.photo}
                          alt={patient.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{patient.name}</p>
                          <p className="text-slate-400 text-sm">
                            {patient.age} yrs · {patient.gender} · {patient.bloodType}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {patient.conditions.slice(0, 2).map((c) => (
                              <span key={c} className="bg-blue-500/10 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </button>
                    ))
                  : doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => handleUserSelect(doctor.id)}
                        className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 rounded-2xl p-5 text-left transition-all duration-300 cursor-pointer"
                      >
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{doctor.name}</p>
                          <p className="text-slate-400 text-sm">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${doctor.available ? "bg-emerald-400" : "bg-slate-500"}`} />
                            <span className={`text-xs ${doctor.available ? "text-emerald-400" : "text-slate-500"}`}>
                              {doctor.available ? "Available Now" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </button>
                    ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
