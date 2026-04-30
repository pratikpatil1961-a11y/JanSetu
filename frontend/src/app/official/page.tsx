"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, AlertCircle, CheckCircle2, LogOut, Image as ImageIcon, MapPin, Clock, Search, LayoutDashboard, ChevronRight, User, Loader2, Building2, FileText, Sparkles, Download } from "lucide-react";
import { apiFetch, removeToken } from "@/lib/api";
import PdfModal from "@/components/PdfModal";
import GlobalFeedback from "@/components/GlobalFeedback";

const DEPARTMENTS: Record<string, string> = {
  "DPH": "Public Health (Water)",
  "DoP": "Power (Electricity)",
  "PWD": "Public Works (Roads)",
  "MC": "Municipal (Waste)",
  "TD": "Transport",
  "HD": "Health",
  "VP": "Vigilance & Police",
  "GA": "General Admin",
};

export default function OfficialDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedComplaintForPdf, setSelectedComplaintForPdf] = useState<any | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user.role === 'official') {
          setUser(data.user);
          fetchPendingAndVerified();
        } else {
          router.push("/official/login");
        }
      } else {
        router.push("/official/login");
      }
    } catch (e) {
      router.push("/official/login");
    }
  };

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    removeToken();
    router.push("/official/login");
  };

  const fetchPendingAndVerified = async () => {
    try {
      const res = await apiFetch("/complaints");
      const data = await res.json();
      if (data.complaints) {
        // The backend already filters by department for officials
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (id: string) => {
    try {
      await apiFetch("/complaints", {
        method: "PATCH",
        body: JSON.stringify({ id, newStatus: 'Resolved' })
      });
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-blue-500/30 flex">
      
      {/* Sidebar - Slimmer & More Modern */}
      <aside className="w-64 bg-[#0d1117] border-r border-slate-800/50 flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800/30">
          <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-lg flex items-center justify-center">
            <img src="/logo.png" alt="JanSetu Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">JanSetu</span>
        </div>
        
        <div className="flex-1 px-3 py-6 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-semibold text-sm">Active Cases</span>
          </button>
        </div>

        {user && (
          <div className="p-4 border-t border-slate-800/30">
            <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800/50 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate flex-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Official</p>
                  <p className="text-xs font-medium text-slate-300 truncate">{user.anonymousId}</p>
                </div>
              </div>

              {user.department && (
                <div className="bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Department</p>
                  <p className="text-[10px] font-bold text-blue-400 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {DEPARTMENTS[user.department] || user.department}
                  </p>
                </div>
              )}

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center space-x-2 py-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0a0c10]">
        <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-8">
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Manage Cases</h2>
              <p className="text-sm text-slate-400">Review and resolve grievances for <span className="text-blue-400 font-bold">{DEPARTMENTS[user?.department] || "Your Department"}</span>.</p>
            </div>
            <div className="bg-[#0d1117] px-6 py-3 rounded-xl border border-slate-800/50 text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Assigned to You</p>
              <p className="text-2xl font-black text-blue-400">{complaints.length}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search case number..." 
              className="w-full bg-[#0d1117] border border-slate-800 text-sm font-medium text-white rounded-xl py-3.5 pl-10 pr-4 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-700"
            />
          </div>

          {/* Case Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-[#0d1117]/50 rounded-2xl border border-slate-800/30 border-dashed">
                <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No active cases for your department.</p>
              </div>
            ) : (
              complaints.map((c) => (
                <div key={c._id} className="bg-[#0d1117] rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all">
                  
                  <div className={`h-1.5 w-full ${
                    c.urgencyScore > 7 ? 'bg-rose-500' : 
                    c.urgencyScore > 4 ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />

                  <div className="p-6 flex-grow space-y-5">
                    <div className="flex justify-between items-start">
                      <span className="inline-block px-2 py-1 bg-slate-900 text-slate-400 text-[10px] font-bold rounded border border-slate-800 uppercase tracking-wider">
                        {c.category}
                      </span>
                      {c.urgencyScore > 7 && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{c.summary}</h3>
                    
                    <div className="space-y-3 bg-[#161b22] rounded-xl p-4 border border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Case ID</span>
                        <span className="text-xs font-mono text-blue-400 font-bold">{c.caseNumber || 'N/A'}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-slate-400 italic line-clamp-2">"{c.transcript}"</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.photoUrl && <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md"><ImageIcon className="w-3 h-3 mr-1" /> Photo</span>}
                      {c.locationName && (
                        <span className="flex items-center text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md"><MapPin className="w-3 h-3 mr-1" /> {c.locationName}</span>
                      )}
                      <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md"><Clock className="w-3 h-3 mr-1" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#161b22]/30 border-t border-slate-800/50 flex flex-col space-y-2">
                    <button 
                      onClick={() => setSelectedComplaintForPdf(c)}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 px-4 py-2.5 rounded-xl transition-all font-bold text-xs group"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF Report</span>
                    </button>
                    <button 
                      onClick={() => resolveIssue(c._id)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-4 py-2.5 rounded-xl transition-all font-bold text-xs group"
                    >
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Resolve Case</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* PDF Modal */}
          {selectedComplaintForPdf && (
            <PdfModal 
              complaint={selectedComplaintForPdf} 
              onClose={() => setSelectedComplaintForPdf(null)} 
            />
          )}
        </div>
      </main>
      <GlobalFeedback />
    </div>
  );
}
