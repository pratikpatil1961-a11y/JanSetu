"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, AlertCircle, CheckCircle2, LogOut, Image as ImageIcon, MapPin } from "lucide-react";
import Link from "next/link";

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
          fetchVerified();
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

  const fetchVerified = async () => {
    try {
      const res = await fetch("/api/complaints?status=Verified");
      const data = await res.json();
      if (data.complaints) {
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

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center text-slate-900 dark:text-white">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-transparent p-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Official Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage and resolve community-verified "Complaint Papers".</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-right">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{complaints.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Cases</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center space-y-1">
                <Link href="/citizen" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Citizen</Link>
                <Link href="/validator" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Validator</Link>
              </div>
              <button onClick={handleLogout} className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <LogOut className="w-6 h-6 mb-1" />
                <span className="text-xs">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.length === 0 ? (
            <div className="col-span-full text-center p-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white dark:border-slate-700 text-slate-500 dark:text-slate-400">
              No active cases to resolve. Good job!
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`h-2 ${c.urgencyScore > 7 ? 'bg-red-500' : c.urgencyScore > 4 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded uppercase">
                      {c.category}
                    </span>
                    {c.urgencyScore > 7 && <AlertCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">{c.summary}</h3>
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                     <p className="text-sm text-slate-600 dark:text-slate-400">"{c.transcript}"</p>
                  </div>
                  
                  {(c.photoUrl || c.location) && (
                    <div className="flex space-x-3 mt-2">
                      {c.photoUrl && (
                        <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                          <ImageIcon className="w-3 h-3 mr-1" /> View Evidence
                        </div>
                      )}
                      {c.location && (
                        <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                          <MapPin className="w-3 h-3 mr-1" /> Location Tagged
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <button 
                    onClick={() => resolveIssue(c._id)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
