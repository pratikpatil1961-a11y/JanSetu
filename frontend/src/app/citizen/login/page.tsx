"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Loader2, Fingerprint, Camera, ShieldCheck } from "lucide-react";
import { apiFetch, saveToken, removeToken } from "@/lib/api";
import FaceAuth from "@/components/FaceAuth";

export default function CitizenLoginPage() {
  const router = useRouter();
  const [anonymousId, setAnonymousId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaceAuth, setShowFaceAuth] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ anonymousId, secretKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.role === "citizen") {
        if (data.token) saveToken(data.token);
        router.replace("/citizen");
        router.refresh();
      } else {
        await apiFetch("/auth/logout", { method: "POST" });
        removeToken();
        throw new Error("Unauthorized: Citizen access required.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (embedding: number[]) => {
    setError("");
    try {
      const res = await apiFetch("/auth/face-login", {
        method: "POST",
        body: JSON.stringify({ embedding }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Face not recognized");
      }

      if (data.token) saveToken(data.token);
      router.replace("/citizen");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setShowFaceAuth(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-2 shadow-xl shadow-indigo-500/10 flex items-center justify-center">
            <img src="/logo.png" alt="JanSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Citizen Portal</h1>
            <p className="text-sm text-slate-500 font-medium">Verify your identity to report grievances.</p>
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Anonymous ID</label>
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={anonymousId}
                  onChange={(e) => setAnonymousId(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm font-mono text-white focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 outline-none transition-all placeholder-slate-800"
                  placeholder="JAN-XXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secret Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm font-mono text-white focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 outline-none transition-all placeholder-slate-800"
                  placeholder="key-xxxx-xxxx"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Unlock Dashboard &rarr;</span>}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#0d1117] px-4 text-slate-600">Secure Biometric</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFaceAuth(true)}
            className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black text-sm py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-xl group active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Face Recognition Login</span>
          </button>
        </form>

        {showFaceAuth && (
          <FaceAuth 
            mode="verify" 
            onSuccess={handleFaceLogin}
            onCancel={() => setShowFaceAuth(false)}
          />
        )}

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">
            Lost your identity?{" "}
            <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              Generate new one
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-6">
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors">
          Back to Home
        </Link>
        <span className="text-slate-800 text-xs">|</span>
        <Link href="/official/login" className="text-xs font-bold text-slate-600 hover:text-blue-400 transition-colors">
          Official Login
        </Link>
      </div>
    </div>
  );
}
