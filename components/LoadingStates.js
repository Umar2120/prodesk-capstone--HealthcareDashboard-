'use client';

import { AlertTriangle, CheckCircle, HeartPulse, Loader2, Sparkles, XCircle } from "lucide-react";

export function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning", // warning, danger, success
  loading = false
}) {
  if (!open) return null;

  const variants = {
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-200",
      confirmBtn: "bg-amber-600 hover:bg-amber-700",
    },
    danger: {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-200",
      confirmBtn: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      confirmBtn: "bg-emerald-600 hover:bg-emerald-700",
    },
  };

  const style = variants[variant] || variants.warning;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className={`p-6 ${style.bg} border-b ${style.border}`}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">{style.icon}</div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 ${style.confirmBtn} text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Components
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded-full w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="animate-pulse space-y-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-100">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded-lg" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded-lg" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-24 bg-slate-200 rounded-lg" />
        <div className="flex gap-3 pt-4">
          <div className="h-10 bg-slate-200 rounded-lg w-24" />
          <div className="h-10 bg-slate-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-64" />
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-36" />
      </div>
      <SkeletonStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function FullScreenLoader({
  title = "Loading your workspace",
  message = "Pulling together your latest data and preferences.",
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <HeartPulse className="h-8 w-8" />
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Syncing
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function InlineSpinnerCard({
  title = "Loading data",
  message = "This should only take a moment.",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function SectionSkeleton({
  title = "Loading section",
  rows = 3,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5" />
          {title}
        </div>
      </div>
      <SkeletonList count={rows} />
    </div>
  );
}
