'use client';

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useApp } from "../../../lib/AppContext";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function DoctorAvailability() {
  const { currentDoctor } = useApp();
  const [availability, setAvailability] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
  });
  const [slots, setSlots] = useState({
    Monday: [...timeSlots],
    Tuesday: [...timeSlots],
    Wednesday: [...timeSlots],
    Thursday: [...timeSlots],
    Friday: [...timeSlots],
    Saturday: [],
  });

  if (!currentDoctor) return null;

  const toggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    if (!availability[day]) {
      setSlots((prev) => ({
        ...prev,
        [day]: [...timeSlots],
      }));
    }
  };

  const toggleSlot = (day, slot) => {
    setSlots((prev) => ({
      ...prev,
      [day]: prev[day].includes(slot)
        ? prev[day].filter((s) => s !== slot)
        : [...prev[day], slot].sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b)),
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
        <p className="text-slate-500 mt-1">Manage your schedule and available time slots</p>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <p className="text-blue-900">
          <span className="font-semibold">Current Status:</span> {currentDoctor.available ? "Available" : "Unavailable"}
        </p>
        <p className="text-blue-800 text-sm mt-1">Next available: {currentDoctor.nextAvailable}</p>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={availability[day]}
                  onChange={() => toggleDay(day)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                <h3 className="font-semibold text-slate-900">{day}</h3>
                <span className="text-sm text-slate-600">
                  {availability[day] ? `${slots[day].length} slots available` : "Not available"}
                </span>
              </div>
            </div>

            {availability[day] && (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(day, slot)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slots[day].includes(slot)
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Check className="w-4 h-4" />
          Save Changes
        </button>
        <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
          <X className="w-4 h-4" />
          Discard
        </button>
      </div>
    </div>
  );
}
