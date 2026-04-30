"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, ArrowRight, Loader2, Building2 } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";

export default function NgoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.role === "ngo") {
        if (data.token) saveToken(data.token);
        router.replace("/ngo/dashboard");
      } else {
        throw new Error("Unauthorized: NGO access required.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-3 shadow-xl shadow-indigo-500/10 flex items-center justify-center group overflow-hidden">
             <Shield className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight italic">NGO Portal</h1>
            <p className="text-sm text-slate-500 font-medium">JanSetu Trust Network Monitoring</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-800"
                  placeholder="email@organization.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In &rarr;</span>}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">
            Not part of the network?{" "}
            <Link href="/ngo/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              Join as NGO
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors flex items-center space-x-2">
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
