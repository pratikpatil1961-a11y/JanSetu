"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from "recharts";
import { 
  Users, CheckCircle2, MessageSquare, AlertCircle, TrendingUp, 
  Filter, Download, LayoutDashboard, Database, ArrowUpRight
} from "lucide-react";
import { apiFetch, removeToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import GlobalFeedback from "@/components/GlobalFeedback";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/admin/login");
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, feedbackRes] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/feedback")
      ]);
      
      if (statsRes.ok && feedbackRes.ok) {
        const statsData = await statsRes.json();
        const feedbackData = await feedbackRes.json();
        setStats(statsData.stats);
        setFeedbacks(feedbackData.feedbacks);
      }
    } catch (e) {
      console.error("Admin data fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = stats.statusBreakdown.map((item: any) => ({ name: item._id, value: item.count }));
  const barData = stats.categoryBreakdown.map((item: any) => ({ name: item._id, value: item.count }));

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 font-sans pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black uppercase tracking-tighter italic">Admin<span className="text-indigo-500">Node</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all mr-4"
          >
            <span>&larr; Back to Home</span>
          </button>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Systems</span>
          </div>
          <button onClick={fetchAdminData} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
            <TrendingUp className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 pt-8 space-y-8">
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Complaints", value: stats.total, icon: Database, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Resolved", value: stats.statusBreakdown.find((s:any)=>s._id==='Resolved')?.count || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Active Feedback", value: feedbacks.length, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Urgent/Pending", value: stats.statusBreakdown.find((s:any)=>s._id==='Pending Validation')?.count || 0, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" }
          ].map((card, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex items-center space-x-6 hover:border-slate-700 transition-all group">
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-3xl font-black">{card.value}</h3>
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Grievance Flow Trend</h3>
              <select className="bg-slate-800 border-none text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="_id" stroke="#64748b" fontSize={10} fontWeight={900} />
                  <YAxis stroke="#64748b" fontSize={10} fontWeight={900} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-center">Status Breakdown</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black">{stats.total}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Cases</span>
              </div>
            </div>
            <div className="space-y-2">
              {pieData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section: Category & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Bar Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight">Category Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight={900} />
                  <YAxis stroke="#64748b" fontSize={10} fontWeight={900} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feedback Stream */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-6 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Citizen Feedback</h3>
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Latest {feedbacks.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[300px]">
              {feedbacks.map((f, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-800/50 p-5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center text-indigo-400">
                        <Users className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anonymous Citizen</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium italic">"{f.message}"</p>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-10">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">No feedback received yet</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
      <GlobalFeedback />
    </div>
  );
}
