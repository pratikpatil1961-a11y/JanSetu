"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, CheckCircle2, User, Clock, Mic, Square } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalFeedback() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const LANG_MAP: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
    mr: "mr-IN",
    te: "te-IN",
  };
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const fetchFeedbacks = async () => {
    setLoadingList(true);
    try {
      const res = await apiFetch("/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeedbacks();
    }
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = LANG_MAP[language] || "en-IN";
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };
    }
  }, [language]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => submitVoiceFeedback();
      
      mediaRecorder.current.start(1000);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const submitVoiceFeedback = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'feedback.webm');

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/feedback", {
        method: "POST",
        body: formData,
        headers: {} // Let browser set boundary
      });
      if (res.ok) {
        setSuccess(true);
        fetchFeedbacks();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to transcribe feedback. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        setSuccess(true);
        setMessage("");
        fetchFeedbacks();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-10 z-[100] flex flex-col items-start">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-[#0d1117]/95 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in slide-in-from-left-10 fade-in duration-500 max-h-[70vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-indigo-500/5">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('feedback')}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Feedbacks List */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('active_cases')}</p>
              {loadingList ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 text-slate-700 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.slice(0, 3).map((f, i) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-indigo-400/70 uppercase">{t('anonymous_id')}</span>
                        <span className="text-[8px] text-slate-600 font-medium">{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">"{f.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('shareYourThoughts')}</p>
              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-2 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-emerald-400">{t('Thank you for your feedback!')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('feedbackPlaceholder')}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:border-indigo-500/50 outline-none transition-all placeholder-slate-700 resize-none h-24 font-medium"
                    />
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border shadow-lg ${isRecording ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {isRecording ? <><Square className="w-3 h-3 fill-current" /> <span>{t('stop_recording')}</span></> : <><Mic className="w-3 h-3" /> <span>{t('voice_report')}</span></>}
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3 h-3" /><span>{t('submit')}</span></>}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl group relative overflow-hidden ${isOpen ? 'bg-slate-800 rotate-90 border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-110 shadow-indigo-600/30'}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />}
        {!isOpen && (
          <span className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping pointer-events-none" />
        )}
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
