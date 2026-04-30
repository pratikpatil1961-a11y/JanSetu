"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Shield, AlertTriangle, FileText, 
  MapPin, Clock, ArrowUpRight, Search, Filter, 
  ChevronRight, BarChart3, PieChart, Loader2, LogOut,
  TrendingUp, Activity
} from "lucide-react";
import { apiFetch, removeToken } from "@/lib/api";
import GlobalFeedback from "@/components/GlobalFeedback";

export default function NgoDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ evidenceAdded: 0, flagged: 0, jurisdiction: "10km" });
  const [complaints, setComplaints] = useState([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "insights">("list");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes, insightsRes] = await Promise.all([
        apiFetch("/ngo/stats"),
        apiFetch("/ngo/complaints"),
        apiFetch("/ngo/insights")
      ]);
      const statsData = await statsRes.json();
      const complaintsData = await complaintsRes.json();
      const insightsData = await insightsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (complaintsData.success) setComplaints(complaintsData.complaints);
      if (insightsData.success) setInsights(insightsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800 bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase italic">NGO Support Hub</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ground-Level Observation Portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView(view === "list" ? "insights" : "list")}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            {view === "list" ? <BarChart3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{view === "list" ? "View Insights" : "View Complaints"}</span>
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d1117] border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Contributions</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stats.evidenceAdded}</h3>
            </div>
          </div>
          <div className="bg-[#0d1117] border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flagged Cases</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stats.flagged}</h3>
            </div>
          </div>
          <div className="bg-[#0d1117] border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Jurisdiction</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stats.jurisdiction}</h3>
            </div>
          </div>
        </div>

        {view === "insights" && insights ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Regional Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0d1117] border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                  <PieChart className="w-4 h-4" />
                  <span>Issue Distribution</span>
                </h4>
                <div className="space-y-4">
                  {insights.trends.map((t: any) => (
                    <div key={t._id} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>{t._id}</span>
                        <span className="text-indigo-400">{t.count} Cases</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${(t.count / complaints.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0d1117] border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Resolution Status</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {insights.statusDistribution.map((s: any) => (
                    <div key={s._id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{s._id}</p>
                      <p className="text-2xl font-black text-white">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Localized Monitoring</h2>
                <p className="text-xs text-slate-500 font-medium">Read-only access to community grievances.</p>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" placeholder="Search..." className="w-full bg-[#0d1117] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <button className="bg-[#0d1117] border border-slate-800 p-2 rounded-xl text-slate-500 hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Scanning Grid...</p>
                </div>
              ) : complaints.map((comp: any) => (
                <div key={comp._id} className="bg-[#0d1117] border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md tracking-widest">{comp.caseNumber}</span>
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase ${comp.urgencyScore > 7 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          Priority {comp.urgencyScore}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white line-clamp-1">{comp.summary}</h4>
                      <div className="flex flex-wrap gap-4 items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5" /><span>{comp.locationName || 'Unknown'}</span></div>
                        <div className="flex items-center space-x-1.5"><Clock className="w-3.5 h-3.5" /><span>{new Date(comp.createdAt).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center self-end md:self-center">
                      <button 
                        onClick={() => router.push(`/ngo/support/${comp._id}`)}
                        className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <span>Add Observation</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <GlobalFeedback />
    </div>
  );
}
