"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Loader2, Key, Fingerprint, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  const handleWeb3Login = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey.trim() || !privateKey.trim()) {
      setError("Both Public and Private Keys are required.");
      return;
    }
    
    setError("");
    setLoading(true);

    // Simulate Web3 cryptographic signing process
    setTimeout(() => {
      setLoading(false);
      setSigned(true);
      
      // Simulate redirection after successful signature verification
      setTimeout(() => {
        router.push("/citizen"); // Directing to Citizen Dashboard for demo
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-transparent">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/40 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[20%] right-[20%] w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] animate-[pulse_10s_ease-in-out_infinite]" />

      {/* Glassmorphism Card */}
      <div className="relative max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden p-8 space-y-6 z-10">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-inner border border-white/10 mb-2 relative overflow-hidden">
            <Fingerprint className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Web3 Access</h1>
          <p className="text-slate-400 font-medium text-sm">Sign a digital message using your Private Key to verify your identity.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {!signed && !loading ? (
          <form onSubmit={handleWeb3Login} className="space-y-5">
            <div className="space-y-4">
              {/* Public Key Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-indigo-300/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Public Key (Identity)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/50 border border-white/10 text-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-sm font-mono"
                    placeholder="0x..."
                  />
                  <Fingerprint className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Private Key Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-fuchsia-300/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Private Key (Signature)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/50 border border-white/10 text-fuchsia-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-sm font-mono"
                    placeholder="••••••••••••••••••••••••"
                  />
                  <ShieldAlert className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Never share your private key. It is strictly used locally to sign the verification payload.</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Key className="w-4 h-4" /> Sign & Verify
              </span>
            </button>
          </form>
        ) : null}

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-indigo-300 text-sm font-mono tracking-widest animate-pulse">CRYPTOGRAPHIC SIGNING...</p>
          </div>
        )}

        {/* Success State */}
        {signed && !loading && (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-mono font-bold tracking-[0.2em] text-sm">SIGNATURE VERIFIED</p>
            <p className="text-emerald-500/60 font-mono text-xs text-center px-4">Cryptographic proof established. Redirecting to Secure Node...</p>
          </div>
        )}

        <div className="text-center text-sm text-slate-400 pt-4 border-t border-white/10">
          New to Web3?{" "}
          <button className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">
            Generate Keypair
          </button>
        </div>
      </div>

      {/* Space Horizon Bottom Layer */}
      <div className="absolute bottom-[-20%] left-[-20%] right-[-20%] h-[35%] bg-indigo-950/30 rounded-[100%] blur-[80px] z-0 pointer-events-none border-t border-indigo-400/20 shadow-[0_-15px_60px_rgba(79,70,229,0.2)]" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-0" />
      
      {/* Status Bar / Bottom Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <p className="text-[10px] font-mono text-indigo-200/60 tracking-[0.3em] uppercase">Blockchain Connected</p>
        </div>
        <p className="text-xs font-mono text-indigo-300/40 tracking-[0.4em] uppercase">SafeBridge Secure Node</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
}
