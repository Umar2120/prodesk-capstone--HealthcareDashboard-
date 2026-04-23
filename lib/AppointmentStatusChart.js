'use client';

import { getAppointmentStatusCounts } from './appointments';

const BAR_STYLES = {
  pending: { color: '#f59e0b', label: 'Pending' },
  scheduled: { color: '#2563eb', label: 'Scheduled' },
  completed: { color: '#10b981', label: 'Completed' },
  cancelled: { color: '#f43f5e', label: 'Cancelled' },
};

export default function AppointmentStatusChart({ appointments = [] }) {
  const counts = getAppointmentStatusCounts(appointments);
  const bars = Object.entries(BAR_STYLES).map(([key, config]) => ({
    key,
    label: config.label,
    color: config.color,
    value: counts[key] || 0,
  }));
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="space-y-4">
      <div className="h-44 flex items-end gap-3">
        {bars.map((bar) => (
          <div key={bar.key} className="flex-1 flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{bar.value}</span>
            <div className="h-32 w-full rounded-2xl bg-slate-100 flex items-end overflow-hidden">
              <div
                className="w-full rounded-2xl transition-all duration-500"
                style={{
                  backgroundColor: bar.color,
                  height: `${Math.max((bar.value / maxValue) * 100, bar.value ? 18 : 6)}%`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500 text-center">{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bar.color }} />
            <span>{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
