"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, Mail, Lock, ArrowRight, ArrowLeft, 
  Loader2, Globe, MapPin, Phone, User as UserIcon, 
  FileText, CheckCircle2 
} from "lucide-react";
import { apiFetch, saveToken } from "@/lib/api";

export default function NgoRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ngoName: "",
    ngoType: "Registered NGO",
    registrationId: "",
    operationalArea: { city: "", state: "" },
    phone: "",
    email: "",
    representative: { name: "", role: "" },
    description: "",
    website: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, role: "ngo" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Registration failed");

      if (data.token) saveToken(data.token);
      router.replace("/ngo/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.ngoName}
                    onChange={(e) => setFormData({...formData, ngoName: e.target.value})}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-800"
                    placeholder="E.g. JanSetu Trust"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Type</label>
                <select 
                  value={formData.ngoType}
                  onChange={(e) => setFormData({...formData, ngoType: e.target.value})}
                  className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Registered NGO">Registered NGO</option>
                  <option value="Community Group">Community Group</option>
                  <option value="Volunteer Group">Volunteer Group</option>
                  <option value="Trust">Trust / Foundation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration No. (Optional)</label>
                <input
                  type="text"
                  value={formData.registrationId}
                  onChange={(e) => setFormData({...formData, registrationId: e.target.value})}
                  className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-800"
                  placeholder="E.g. NGO/2026/XXXX"
                />
              </div>
            </div>
            <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 group">
              <span>Continue &rarr;</span>
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.operationalArea.city}
                    onChange={(e) => setFormData({...formData, operationalArea: {...formData.operationalArea, city: e.target.value}})}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.operationalArea.state}
                    onChange={(e) => setFormData({...formData, operationalArea: {...formData.operationalArea, state: e.target.value}})}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website / Social (Optional)</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleBack} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm py-5 rounded-2xl transition-all flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button onClick={handleNext} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20">
                <span>Continue &rarr;</span>
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rep. Name</label>
                  <input
                    type="text"
                    required
                    value={formData.representative.name}
                    onChange={(e) => setFormData({...formData, representative: {...formData.representative, name: e.target.value}})}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rep. Role</label>
                  <input
                    type="text"
                    required
                    value={formData.representative.role}
                    onChange={(e) => setFormData({...formData, representative: {...formData.representative, role: e.target.value}})}
                    className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="E.g. Secretary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#161b22] px-6 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all h-24 resize-none"
                  placeholder="Describe your NGO's mission and impact..."
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleBack} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm py-5 rounded-2xl transition-all flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button onClick={handleNext} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20">
                <span>Continue &rarr;</span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="email@organization.org"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#161b22] px-11 py-4 rounded-2xl border border-slate-800 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                  By signing up, you agree to JanSetu's field verification protocols. Your organization will be listed as <span className="font-black text-white">Unverified</span> until official vetting is complete.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={handleBack} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm py-5 rounded-2xl transition-all flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Finalize Signup &rarr;</span>}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in fade-in zoom-in duration-500 relative">
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl p-3 shadow-xl shadow-indigo-500/10 flex items-center justify-center group overflow-hidden">
             {step === 1 && <Building2 className="w-8 h-8 text-indigo-600 animate-in zoom-in" />}
             {step === 2 && <MapPin className="w-8 h-8 text-indigo-600 animate-in zoom-in" />}
             {step === 3 && <UserIcon className="w-8 h-8 text-indigo-600 animate-in zoom-in" />}
             {step === 4 && <Lock className="w-8 h-8 text-indigo-600 animate-in zoom-in" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight italic">
              {step === 1 ? 'NGO Basics' : step === 2 ? 'Operations' : step === 3 ? 'Representative' : 'Final Step'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">JanSetu Trust Network Onboarding</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {renderStep()}

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
