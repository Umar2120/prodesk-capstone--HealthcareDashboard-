'use client';

import { useState } from "react";
import { AlertCircle, CheckCircle, Activity, Syringe, TestTube, Sparkles, Loader2, X } from "lucide-react";
import { useApp } from "../../../lib/AppContext";
import { InlineSpinnerCard } from "../../../components/LoadingStates";
import { doctors, getMedicalHistoryForPatient, patients } from "../../../lib/mockData";
import { summarizePatientHistory } from "../../../lib/aiService";
import { toast } from "sonner";

const typeIcons = {
  diagnosis: <AlertCircle className="w-5 h-5 text-red-500" />,
  procedure: <Activity className="w-5 h-5 text-purple-500" />,
  lab: <TestTube className="w-5 h-5 text-blue-500" />,
  visit: <CheckCircle className="w-5 h-5 text-green-500" />,
  vaccination: <Syringe className="w-5 h-5 text-emerald-500" />,
  emergency: <AlertCircle className="w-5 h-5 text-orange-600" />,
};

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function MedicalHistory() {
  const { currentPatient } = useApp();
  const [selectedType, setSelectedType] = useState("All");
  const [aiSummary, setAiSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAISummary = async () => {
    setIsGenerating(true);
    
    try {
      const patientInfo = patients.find(p => p.id === currentPatient) || { name: currentPatient };
      const summary = await summarizePatientHistory(events, patientInfo);
      setAiSummary(summary);
    } catch (error) {
      const message = error.message || "Unable to generate the AI summary right now.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentPatient) {
    return <InlineSpinnerCard title="Loading medical history" message="Assembling your visit timeline, labs, and previous diagnoses." />;
  }

  const events = getMedicalHistoryForPatient(currentPatient).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const filtered =
    selectedType === "All"
      ? events
      : events.filter((e) => e.type === selectedType.toLowerCase());

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 sm:pt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Medical History</h1>
          <p className="text-slate-500 mt-1">Your complete medical timeline</p>
        </div>
        <button
          onClick={handleAISummary}
          disabled={isGenerating || events.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGenerating ? "Analyzing..." : "AI Summary"}
        </button>
      </div>

      {/* AI Summary Modal */}
      {aiSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-slate-900">AI Patient Summary</h2>
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="prose prose-slate max-w-none">
                {aiSummary.split('\n').map((line, idx) => {
                  if (line.trim() === '') return null;
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={idx} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <li key={idx} className="text-slate-700 ml-4">{line.replace(/^[-\u2022]\s*/, '')}</li>;
                  }
                  return <p key={idx} className="text-slate-700 mb-2">{line}</p>;
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                ⚠️ This is an AI-generated summary. Please verify with original medical records.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {["All", "Diagnosis", "Procedure", "Lab", "Visit", "Vaccination", "Emergency"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No events found</p>
          </div>
        ) : (
          filtered.map((event) => {
            const doctor = doctors.find((d) => d.id === event.doctorId);
            return (
              <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{typeIcons[event.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      </div>
                      {event.severity && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${severityColors[event.severity]}`}>
                          {event.severity === "low" ? "Low" : event.severity === "medium" ? "Medium" : "High"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <div>
                        <span>{event.date}</span>
                        {doctor && <span> · {doctor.name}</span>}
                      </div>
                      {event.attachments && event.attachments.length > 0 && (
                        <div className="flex gap-2">
                          {event.attachments.map((attachment) => (
                            <span key={attachment} className="text-blue-600 hover:underline cursor-pointer">
                              Attachment: {attachment}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
