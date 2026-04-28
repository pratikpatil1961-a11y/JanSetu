"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, AlertCircle, CheckCircle2, LogOut, Image as ImageIcon, MapPin, Clock, Search, LayoutDashboard } from "lucide-react";

export default function OfficialDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/official/login");
  };

  // We fetch all active cases
  const fetchPendingAndVerified = async () => {
    try {
      const res = await fetch("/api/complaints"); // fetch all, filter locally or change API
      const data = await res.json();
      if (data.complaints) {
        // Official sees all active cases
        const active = data.complaints.filter((c: any) => c.status !== 'Resolved');
        setComplaints(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (id: string) => {
    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newStatus: 'Resolved' })
      });
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-slate-900 w-24 h-24 rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl">
          <Briefcase className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex">
      
      {/* Sidebar for Desktop UI */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        <div className="p-8 flex items-center space-x-4 border-b border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SafeBridge</h1>
            <p className="text-xs text-blue-400 font-medium tracking-wide uppercase">Official Portal</p>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-3">
          <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-semibold text-lg">Active Cases</span>
          </button>
        </div>

        {user && (
          <div className="p-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="truncate text-sm font-medium text-slate-300">
                  {user.email}
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-8">
          
          {/* Stats & Search Bar Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800/50 p-8 rounded-3xl flex items-center justify-between shadow-xl">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Active Cases</h2>
                <p className="text-lg text-slate-400">Review and resolve reported civic issues.</p>
              </div>
              <div className="text-right bg-slate-950/50 px-6 py-4 rounded-2xl border border-slate-800">
                <div className="text-5xl font-black text-blue-400">{complaints.length}</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Pending Resolution</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/50 p-8 rounded-3xl flex flex-col justify-center shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Search</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search case number..." 
                  className="w-full bg-slate-950 border border-slate-800 text-base font-medium text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Case Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complaints.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-slate-900/30 rounded-[3rem] border border-slate-800/50 border-dashed">
                <CheckCircle2 className="w-20 h-20 text-slate-700 mx-auto mb-6" />
                <h3 className="text-3xl font-extrabold text-slate-300">All caught up!</h3>
                <p className="text-xl text-slate-500 mt-3">There are no active cases pending resolution.</p>
              </div>
            ) : (
              complaints.map((c) => (
                <div key={c._id} className="bg-slate-900 backdrop-blur-sm rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden flex flex-col group hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/10 transition-all relative">
                  
                  {/* Urgency Line */}
                  <div className={`absolute top-0 left-0 right-0 h-2 ${
                    c.urgencyScore > 7 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]' : 
                    c.urgencyScore > 4 ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 
                    'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                  }`} />

                  <div className="p-8 flex-grow space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider border border-slate-700 mb-3 shadow-sm">
                          {c.category}
                        </span>
                        <p className="text-xl font-bold text-white leading-tight">{c.summary}</p>
                      </div>
                      {c.urgencyScore > 7 && (
                        <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 shadow-lg shadow-rose-500/10">
                          <AlertCircle className="w-6 h-6 text-rose-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Case Details */}
                    <div className="space-y-4 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Case #</span>
                        <span className="text-base font-mono text-blue-400 font-bold">{c.caseNumber || 'N/A'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-2">AI Transcript</span>
                        <p className="text-base text-slate-300 italic leading-relaxed">"{c.transcript}"</p>
                      </div>
                    </div>
                    
                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {c.photoUrl && (
                        <div className="flex items-center text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                          <ImageIcon className="w-4 h-4 mr-2" /> Photo Attached
                        </div>
                      )}
                      {c.location && (
                        <div className="flex items-center text-sm font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl">
                          <MapPin className="w-4 h-4 mr-2" /> Geo-tagged
                        </div>
                      )}
                      <div className="flex items-center text-sm font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
                        <Clock className="w-4 h-4 mr-2" /> {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <button 
                      onClick={() => resolveIssue(c._id)}
                      className="w-full flex items-center justify-center space-x-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-6 py-4 rounded-2xl transition-all font-bold text-lg group shadow-lg hover:shadow-blue-600/30"
                    >
                      <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span>Resolve Case</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
