"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Camera, AlertTriangle, MapPin, Loader2, 
  ArrowLeft, Send, MessageSquare, FileUp, Flag
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SupportPage() {
  const router = useRouter();
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [comment, setComment] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchComplaint = async () => {
    try {
      const res = await apiFetch("/ngo/complaints");
      const data = await res.json();
      if (data.success && data.complaints) {
        const found = data.complaints.find((c: any) => c._id === id);
        setComplaint(found);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/ngo/add-evidence/${id}`, {
        method: "POST",
        body: JSON.stringify({ 
          comment, 
          flagged: isFlagged,
          media: preview ? [preview] : [] 
        })
      });
      if (res.ok) router.push("/ngo/dashboard");
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-rose-500" />
      <h1 className="text-xl font-bold text-white">Grievance Not Found</h1>
      <p className="text-sm text-slate-500 max-w-xs">The grievance data could not be retrieved or it has been restricted.</p>
      <button onClick={() => router.back()} className="text-indigo-400 font-bold hover:underline">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => router.back()} className="flex items-center space-x-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /><span>Back</span>
        </button>

        <div className="bg-[#0d1117] border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight italic">NGO Observation</h1>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Case ID: {complaint.caseNumber}</p>
            <p className="text-sm text-slate-500 font-medium tracking-wide leading-relaxed">
              Add supporting evidence or comments to this grievance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {preview && (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800 animate-in zoom-in duration-300">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg"
                >
                  <AlertTriangle className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <label className="border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:bg-white/5 cursor-pointer transition-all group">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Camera className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-300">Take Photo</span>
              </label>
              <label className="border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:bg-white/5 cursor-pointer transition-all group">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <FileUp className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-300">Upload File</span>
              </label>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NGO Comments</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Share your ground-level observations..."
                className="w-full bg-[#161b22] border border-slate-800 rounded-2xl p-6 text-sm text-white focus:border-indigo-500/50 outline-none h-32 resize-none font-medium"
              />
            </div>

            <div 
              onClick={() => setIsFlagged(!isFlagged)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${isFlagged ? 'bg-rose-500/10 border-rose-500/50' : 'bg-[#161b22] border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center space-x-4">
                <Flag className={`w-5 h-5 ${isFlagged ? 'text-rose-500' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Needs Attention</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Flag this case for official review</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isFlagged ? 'bg-rose-500' : 'bg-slate-700'}`}>
                 <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isFlagged ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /><span>Submit Observation</span></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
