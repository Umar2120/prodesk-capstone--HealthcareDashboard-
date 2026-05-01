'use client';

import { useState, useMemo } from "react";
import { Pill, Calendar, FilePlus } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { InlineSpinnerCard, SkeletonList } from "../../../components/LoadingStates";

const statusColors = {
  active: "bg-emerald-100 text-emerald-800",
  expired: "bg-slate-100 text-slate-800",
  filled: "bg-blue-100 text-blue-800",
};

export default function Prescriptions() {
  const { currentPatient, prescriptions, prescriptionsLoading, prescriptionsError } = useApp();
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Memoized filtered prescriptions
  const filtered = useMemo(() => {
    const sorted = [...prescriptions].sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
    
    if (selectedStatus === "All") return sorted;
    return sorted.filter((p) => p.status === selectedStatus.toLowerCase());
  }, [prescriptions, selectedStatus]);

  if (!currentPatient) {
    return <InlineSpinnerCard title="Loading prescriptions" message="Fetching your medication history and active prescriptions." />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Prescriptions</h1>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage your medications</p>
      </div>

      {prescriptionsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {prescriptionsError}
        </div>
      )}

      <div className="flex gap-2">
        {["All", "Active", "Expired", "Filled"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {prescriptionsLoading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No prescriptions found</p>
          <p className="text-slate-400 text-sm mt-2">Your prescriptions from doctors will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rx) => (
            <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-900">{rx.medicineName}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">From Dr. {rx.doctorName} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rx.status]}`}>
                  {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{rx.medicineName}</p>
                    <p className="text-sm text-slate-600">{rx.dosage} · {rx.frequency}</p>
                    {rx.instructions && (
                      <p className="text-xs text-slate-500 mt-1">{rx.instructions}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <p>{rx.refills || 0} refills</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {rx.duration && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Duration: {rx.duration}</span>
                  </div>
                )}
                {rx.pharmacy && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <FilePlus className="w-4 h-4" />
                    <span>{rx.pharmacy}</span>
                  </div>
                )}
              </div>

              {rx.notes && (
                <div className="text-sm text-slate-600 bg-amber-50 rounded-lg p-3">
                  <strong>Note:</strong> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
