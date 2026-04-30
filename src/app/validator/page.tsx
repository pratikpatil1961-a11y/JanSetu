"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Shield, Clock, LogOut, MapPin, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ValidatorPortal() {
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
        if (data.authenticated && data.user.role === 'validator') {
          setUser(data.user);
          fetchComplaints();
        } else {
          router.push("/validator/login");
        }
      } else {
        router.push("/validator/login");
      }
    } catch (e) {
      router.push("/validator/login");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/validator/login");
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints?status=Pending Validation");
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

  const handleVote = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newStatus })
      });
      // Remove from list
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center text-slate-900 dark:text-white">Loading pending claims...</div>;

  return (
    <div className="min-h-screen bg-transparent p-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Validator Portal</h1>
              <p className="text-slate-500 dark:text-slate-400">Review anonymized reports from the community to filter out spam.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Link href="/citizen" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Citizen</Link>
              <Link href="/official" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Official</Link>
            </div>
            <button onClick={handleLogout} className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <LogOut className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center p-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white dark:border-slate-700">
              <Check className="w-12 h-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No pending reports to validate right now!</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        {c.category}
                      </span>
                      <span className="flex items-center text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Urgency: {c.urgencyScore}/10
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.summary}</h3>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mt-3">
                      <p className="text-sm font-mono text-slate-600 dark:text-slate-400 italic">"{c.transcript}"</p>
                    </div>
                    
                    {(c.photoUrl || c.location) && (
                      <div className="flex space-x-3 pt-2">
                        {c.photoUrl && (
                          <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            <ImageIcon className="w-3 h-3 mr-1" /> Photo Evidence Attached
                          </div>
                        )}
                        {c.location && (
                          <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                            <MapPin className="w-3 h-3 mr-1" /> Location Tagged
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                       Hash: {c.hash.substring(0, 16)}...
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button 
                      onClick={() => handleVote(c._id, 'Verified')}
                      className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl transition-colors font-medium border border-green-200 dark:border-green-800"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify</span>
                    </button>
                    <button 
                      onClick={() => handleVote(c._id, 'Rejected')}
                      className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl transition-colors font-medium border border-red-200 dark:border-red-800"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
