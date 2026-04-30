"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Lock, Loader2, Building2, ChevronDown, PenLine, User } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";

const DEPARTMENTS = [
  { id: "DPH", name: "Public Health (Water)" },
  { id: "DoP", name: "Power (Electricity)" },
  { id: "PWD", name: "Public Works (Roads)" },
  { id: "MC", name: "Municipal (Waste)" },
  { id: "TD", name: "Transport" },
  { id: "HD", name: "Health" },
  { id: "VP", name: "Vigilance & Police" },
  { id: "GA", name: "General Admin" },
];

export default function OfficialRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("DPH");
  const [customDepartment, setCustomDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const finalDept = department === "Other" ? customDepartment : department;
      
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: "official",
          department: finalDept 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto-login after registration
      if (data.token) {
        saveToken(data.token);
        router.replace("/official");
        router.refresh();
      } else {
        router.push("/official/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500 my-8">
        
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-2 shadow-xl shadow-blue-500/10 flex items-center justify-center">
            <img src="/logo.png" alt="JanSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Official Registration</h1>
            <p className="text-sm text-slate-500 font-medium">Create a new government personnel account.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all placeholder-slate-800"
                  placeholder="Official Name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all placeholder-slate-800"
                  placeholder="name@government.in"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all placeholder-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Department</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#161b22] pl-11 pr-10 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>

            {/* Custom Department Input */}
            {department === "Other" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom Department Name</label>
                <div className="relative group">
                  <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-800"
                    placeholder="Enter department name..."
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account &rarr;</span>}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already registered?{" "}
            <Link href="/official/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">
              Log in here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors flex items-center space-x-2">
          <span>&larr;</span>
          <span>Back to Landing Page</span>
        </Link>
      </div>
    </div>
  );
}
