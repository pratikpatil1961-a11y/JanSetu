"use client";

import { useState } from "react";
import { FileText, Download, Sparkles, X, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PdfModalProps {
  complaint: any;
  onClose: () => void;
}

export default function PdfModal({ complaint, onClose }: PdfModalProps) {
  const [loading, setLoading] = useState<"summary" | "download" | null>(null);
  const [aiInsight, setAiInsight] = useState<{ 
    summary: string; 
    solution: string;
    priority: string;
    effort: string;
    legalContext: string;
  } | null>(null);

  const handleGenerate = async (type: "summary" | "download") => {
    setLoading(type);
    try {
      if (type === 'summary') {
        const res = await apiFetch("/pdf/generate", {
          method: "POST",
          body: JSON.stringify({ complaintId: complaint._id, type: 'summary' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAiInsight(data.aiInsight);
        } else {
          alert(data.error || "Failed to generate AI summary. Please ensure the backend is running and the AI API key is set.");
        }
      } else {
        // Download Full PDF
        const response = await apiFetch("/pdf/generate", {
          method: "POST",
          body: JSON.stringify({ complaintId: complaint._id, type: 'full' }),
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Grievance_${complaint.caseNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          const data = await response.json().catch(() => ({ error: "Internal Server Error" }));
          alert(data.error || "Failed to download PDF report. Please check the backend logs.");
        }
      }
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-[#0d1117] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Generate Report</h2>
              <p className="text-sm text-slate-500 font-medium">{complaint.caseNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!aiInsight ? (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleGenerate("summary")}
                disabled={loading !== null}
                className="flex items-center justify-between p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <Sparkles className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">AI Summary</p>
                    <p className="text-xs text-slate-500">Generate executive summary & solution</p>
                  </div>
                </div>
                {loading === "summary" ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
              </button>

              <button
                onClick={() => handleGenerate("download")}
                disabled={loading !== null}
                className="flex items-center justify-between p-6 rounded-3xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <Download className="w-6 h-6 text-slate-400 group-hover:translate-y-1 transition-transform" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Download Full PDF</p>
                    <p className="text-xs text-slate-500">Complete formal grievance document</p>
                  </div>
                </div>
                {loading === "download" ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500/80">Deep AI Analysis</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${aiInsight.priority === 'Emergency' || aiInsight.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    {aiInsight.priority} Priority
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-200 leading-relaxed font-medium italic">"{aiInsight.summary}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-emerald-500/10">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Effort Required</p>
                    <p className="text-sm font-bold text-white">{aiInsight.effort}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Policy Context</p>
                    <p className="text-sm font-bold text-white">{aiInsight.legalContext}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Proposed Resolution Plan</p>
                  <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">{aiInsight.solution}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerate("download")}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF</span>
                </button>
                <button
                  onClick={() => setAiInsight(null)}
                  className="px-6 border border-slate-700 text-slate-400 rounded-2xl hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
