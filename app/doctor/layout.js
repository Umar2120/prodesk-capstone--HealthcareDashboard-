'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useApp } from "../../lib/AppContext";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "My Patients" },
  { to: "/doctor/availability", icon: Clock, label: "Availability" },
];

export default function DoctorLayout({ children }) {
  const { currentDoctor, logout } = useApp();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'doctor')) {
      router.replace('/login?role=doctor');
    }
  }, [loading, router, user]);

  const handleLogout = async () => {
    await signOut();
    logout();
    router.replace('/');
  };

  if (!currentDoctor) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight">VitalSync</span>
            <p className="text-slate-500 text-xs">Physician Portal</p>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            {currentDoctor.photo ? (
              <img
                src={currentDoctor.photo}
                alt={currentDoctor.name}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-700/70 flex items-center justify-center text-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{currentDoctor.name}</p>
              <p className="text-slate-400 text-xs">{currentDoctor.specialty}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-slate-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-teal-500/15 text-teal-400 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients, records..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5">
              {currentDoctor.photo ? (
                <img src={currentDoctor.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700/70 flex items-center justify-center text-slate-200">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden sm:block">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 text-left text-slate-800 text-sm font-medium leading-none hover:text-blue-600 transition"
                >
                  <span>{currentDoctor.name}</span>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <p className="text-slate-400 text-xs mt-0.5">Physician</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
