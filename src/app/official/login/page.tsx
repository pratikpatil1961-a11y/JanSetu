"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Loader2, Key, Fingerprint, Lock, ShieldCheck } from "lucide-react";

export default function OfficialLoginPage() {
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
        router.push("/official"); // Directing to Official Dashboard
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite_reverse]" />
      
      {/* Glassmorphism Card */}
      <div className="relative max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden p-8 space-y-6 z-10">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-inner border border-white/10 mb-2 relative overflow-hidden">
            <Fingerprint className="w-8 h-8 text-fuchsia-400 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/20 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Official Access</h1>
          <p className="text-slate-400 font-medium text-sm">Log in using Authority Public/Private Key Cryptography.</p>
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
                <label className="text-xs font-mono text-fuchsia-300/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Public Key (Identity)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/50 border border-white/10 text-fuchsia-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-sm font-mono"
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
              </div>
            </div>

            <button
              type="submit"
              className="w-full relative overflow-hidden bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Key className="w-4 h-4" /> Sign Message
              </span>
            </button>
          </form>
        ) : null}

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin" />
            <p className="text-fuchsia-300 text-sm font-mono tracking-widest animate-pulse">VERIFYING SIGNATURE...</p>
          </div>
        )}

        {/* Success State */}
        {signed && !loading && (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-mono font-bold tracking-[0.2em] text-sm">ACCESS GRANTED</p>
            <p className="text-emerald-500/60 font-mono text-xs text-center px-4">Authority verified. Redirecting...</p>
          </div>
        )}

        <div className="text-center text-sm text-slate-400 pt-4 border-t border-white/10 flex flex-col gap-2">
          <p>
            No authority keys?{" "}
            <Link href="/official/register" className="text-fuchsia-400 font-medium hover:text-fuchsia-300 hover:underline transition-colors">
              Request Authority Access
            </Link>
          </p>
          <Link href="/" className="text-fuchsia-400 font-medium hover:text-fuchsia-300 hover:underline transition-colors">
            Return to Home
          </Link>
        </div>
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
