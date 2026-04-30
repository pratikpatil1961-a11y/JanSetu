"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, ArrowRight, Loader2, ShieldCheck, User, Copy, CheckCircle2, Download, AlertCircle, Building2, ChevronDown, PenLine, Camera, Fingerprint } from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";
import FaceAuth from "@/components/FaceAuth";

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

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"citizen" | "official">("citizen");
  const [department, setDepartment] = useState("DPH");
  const [customDepartment, setCustomDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{userId: string, anonymousId: string, secretKey: string} | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalDept = department === "Other" ? customDepartment : department;
      
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          role, 
          department: role === 'official' ? finalDept : undefined,
          email: role === 'official' ? email : undefined,
          password: role === 'official' ? password : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === 'official') {
        alert("Official registered! Please log in.");
        router.push("/official/login");
      } else {
        setCredentials({ 
          userId: data.userId, 
          anonymousId: data.anonymousId, 
          secretKey: data.secretKey 
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceEnroll = async (embedding: number[]) => {
    if (!credentials) return;
    try {
      const res = await apiFetch("/auth/face-register", {
        method: "POST",
        body: JSON.stringify({ userId: credentials.userId, embedding }),
      });
      if (res.ok) {
        setFaceEnrolled(true);
        setShowFaceEnroll(false);
      }
    } catch (err) {
      console.error("Enrollment error:", err);
    }
  };

  const copyToClipboard = (text: string, type: 'id' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const downloadCredentials = () => {
    if (!credentials) return;
    const element = document.createElement("a");
    const file = new Blob([
      `JANSETU SECURE CREDENTIALS\n--------------------------\nRole: ${role.toUpperCase()}\nAnonymous ID: ${credentials.anonymousId}\nSecret Key: ${credentials.secretKey}\n--------------------------\nWARNING: DO NOT SHARE THESE. RECOVERY IS NOT POSSIBLE.`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `JanSetu_Credentials_${credentials.anonymousId}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-2 shadow-xl shadow-indigo-500/10 flex items-center justify-center">
            <img src="/logo.png" alt="JanSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Identity</h1>
            <p className="text-sm text-slate-500 font-medium">Join JanSetu securely.</p>
          </div>
        </div>

        {!credentials ? (
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block text-center">Step 1: Select Your Role</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#161b22] rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRole("citizen")}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'citizen' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("official")}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all ${role === 'official' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official</span>
                  </button>
                </div>
              </div>

              {role === 'official' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none"
                        placeholder="official@gov.in"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#161b22] pl-11 pr-10 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none appearance-none cursor-pointer"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                        <option value="Other">Other (Custom)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                  </div>

                  {department === "Other" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom Dept Name</label>
                      <div className="relative group">
                        <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                          type="text"
                          required
                          value={customDepartment}
                          onChange={(e) => setCustomDepartment(e.target.value)}
                          className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none placeholder-slate-800"
                          placeholder="Fire Department, etc."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Citizens remain 100% anonymous. <br/> No email or password required.
                   </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-black text-sm py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl flex items-center justify-center space-x-3 group active:scale-[0.98] ${role === 'official' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{role === 'official' ? 'Create Official Account' : 'Generate Anonymous Identity'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400 font-bold leading-relaxed uppercase tracking-wide">
                Save these credentials immediately. They will NOT be shown again and cannot be recovered.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Anonymous ID</label>
                <div className="relative group">
                  <input
                    readOnly
                    value={credentials.anonymousId}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm font-mono font-bold text-white outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(credentials.anonymousId, 'id')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {copiedId ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Secret Key</label>
                <div className="relative group">
                  <input
                    readOnly
                    value={credentials.secretKey}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm font-mono font-bold text-white outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(credentials.secretKey, 'key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">Enhance Security (Optional)</label>
              <button 
                onClick={() => setShowFaceEnroll(true)}
                disabled={faceEnrolled}
                className={`w-full py-4 rounded-2xl border flex items-center justify-center space-x-3 transition-all ${faceEnrolled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white shadow-xl shadow-indigo-600/10'}`}
              >
                {faceEnrolled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Face Recognition Ready</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Enroll Face Login</span>
                  </>
                )}
              </button>
              {!faceEnrolled && (
                <p className="text-[10px] text-slate-600 text-center font-medium leading-relaxed">
                   Skip passwords. Look at the camera to log in instantly.
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={downloadCredentials}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-4 rounded-xl transition-all border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Save to File</span>
              </button>
              <Link
                href="/login"
                className="flex-[1.5] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {showFaceEnroll && (
          <FaceAuth 
            mode="enroll"
            onSuccess={handleFaceEnroll}
            onCancel={() => setShowFaceEnroll(false)}
          />
        )}

        {!credentials && (
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an identity?{" "}
              <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center space-y-4">
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center space-x-2">
          <span>&larr;</span>
          <span>Back to Landing Page</span>
        </Link>
      </div>
    </div>
  );
}
