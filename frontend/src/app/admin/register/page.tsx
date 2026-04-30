"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, ArrowRight, AlertCircle, LayoutDashboard, User } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          name,
          email, 
          password,
          role: "admin",
          department: "Super Admin"
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          saveToken(data.token);
          router.push("/admin");
        } else {
          router.push("/admin/login");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 my-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] text-indigo-500 mb-4 animate-in zoom-in duration-500">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Admin<span className="text-indigo-500">Node</span>
          </h1>
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Request Admin Access</p>
        </div>

        <form onSubmit={handleRegister} className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] space-y-6 shadow-2xl">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center space-x-3 text-rose-500 text-xs font-bold animate-in slide-in-from-top-4">
              <AlertCircle className="w-4 h-4 min-w-[1rem]" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="admin@jansetu.gov"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center space-x-2 group mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Create Admin Node</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Already registered?{" "}
            <Link href="/admin/login" className="text-indigo-500 hover:text-indigo-400">
              Initialize Session
            </Link>
          </p>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Authorized Personnel Only • IP Logged
          </p>
          <div className="pt-4">
            <Link href="/" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
