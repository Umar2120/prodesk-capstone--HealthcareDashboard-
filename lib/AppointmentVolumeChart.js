'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AppointmentVolumeChart({ data = [] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="appointmentsTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="appointmentsCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total appointments"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#appointmentsTotal)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed appointments"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#appointmentsCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
