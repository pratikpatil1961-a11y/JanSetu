"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Loader2, Lock, Fingerprint } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [anonymousId, setAnonymousId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        throw new Error(data.error || t('login_failed'));
      }

      if (data.token) {
        saveToken(data.token);
      }

      if (data.role === "official") {
        router.replace("/official");
      } else {
        router.replace("/citizen");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans relative">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500">

        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-2 shadow-xl shadow-indigo-500/10 flex items-center justify-center">
            <img src="/logo.png" alt="JanSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('access_portal')}</h1>
            <p className="text-sm text-slate-500 font-medium">{t('verify_identity')}</p>
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('anonymous_id_label')}</label>
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('secret_key_label')}</label>
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
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('unlock_dashboard')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">
            {t('lost_identity')}{" "}
            <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              {t('generate_new')}
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors flex items-center space-x-2">
          <span>&larr;</span>
          <span>{t('back_to_landing')}</span>
        </Link>
      </div>
    </div>
  );
}
