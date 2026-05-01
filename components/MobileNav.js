'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Heart, 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Pill,
  Users,
  Clock,
  LogOut,
  X,
  Menu,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

const patientNavItems = [
  { to: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { to: "/patient/history", icon: ClipboardList, label: "Medical History" },
  { to: "/patient/prescriptions", icon: Pill, label: "Prescriptions" },
];

const doctorNavItems = [
  { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "My Patients" },
  { to: "/doctor/availability", icon: Clock, label: "Availability" },
];

export function MobileNav({ user, onLogout, userType = "patient" }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = userType === "doctor" ? doctorNavItems : patientNavItems;
  const accentColor = userType === "doctor" ? "teal" : "blue";
  
  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
    router.replace('/');
  };

  const handleNavClick = (href) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-slate-200`}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 bg-${accentColor}-500 rounded-lg flex items-center justify-center`}>
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <div>
                <span className="text-white font-semibold text-sm tracking-tight">VitalSync</span>
                <p className="text-slate-500 text-xs">{userType === "doctor" ? "Physician Portal" : "Healthcare"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-700/70 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-slate-400 text-xs capitalize">{userType}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-slate-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">Menu</p>
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = pathname.startsWith(to);
              return (
                <button
                  key={to}
                  onClick={() => handleNavClick(to)}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? `bg-${accentColor}-500/15 text-${accentColor}-400 font-medium`
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Profile & Logout */}
          <div className="px-3 py-4 border-t border-white/5 space-y-1">
            <button
              onClick={() => handleNavClick('/profile')}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile Header Component for pages
export function MobileHeader({ title, subtitle }) {
  return (
    <div className="lg:hidden mb-6 pt-12">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}