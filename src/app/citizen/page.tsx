"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, Camera, MapPin, User, LogOut, Droplet, Zap, AlertTriangle, Shield, EyeOff, MoreHorizontal, Trash2, Bus, Activity, Navigation, Clock, FileText, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "Water & Sanitation", icon: Droplet, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { id: "Electricity", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "Roads & Infrastructure", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "Waste Management", icon: Trash2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "Public Transport", icon: Bus, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  { id: "Medical & Health", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "Corruption", icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "Harassment", icon: EyeOff, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "Other", icon: MoreHorizontal, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
];

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"report" | "track">("report");
  
  const [step, setStep] = useState<"category" | "photo" | "audio" | "processing" | "success">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pin, setPin] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user.role === 'citizen') {
          setUser(data.user);
          fetchMyReports();
        } else {
          router.push("/citizen/login");
        }
      } else {
        router.push("/citizen/login");
      }
    } catch (e) {
      router.push("/citizen/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    try {
      const res = await fetch("/api/complaints?myReports=true");
      if (res.ok) {
        const data = await res.json();
        setMyReports(data.complaints || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/citizen/login");
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const photoCategories = ["Water & Sanitation", "Electricity", "Roads & Infrastructure", "Waste Management"];
    if (photoCategories.includes(categoryId)) {
      setStep("photo");
      startCamera();
    } else {
      setStep("audio");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => console.error("Location error", err)
        );
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStep("audio");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setPhotoData(canvas.toDataURL("image/jpeg"));
        stopCamera();
        setStep("audio");
      }
    }
  };

  const skipPhoto = () => {
    stopCamera();
    setStep("audio");
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        await uploadComplaint(audioBlob);
      };

      setRecordingTime(0);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record a grievance.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStep("processing");
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const uploadComplaint = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'grievance.webm');
      formData.append('category', selectedCategory);
      if (photoData) formData.append('photo', photoData);
      if (location) formData.append('location', JSON.stringify(location));
      
      const response = await fetch('/api/complaints', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.pin && data.caseNumber) {
        setPin(data.pin);
        setCaseNumber(data.caseNumber);
        setStep("success");
        if (user) fetchMyReports();
      } else {
        alert("Failed to process complaint: " + data.error);
        setStep("category");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("An error occurred while uploading.");
      setStep("category");
    }
  };

  const resetFlow = () => {
    setStep("category");
    setSelectedCategory("");
    setPhotoData(null);
    setLocation(null);
    setPin(null);
    setCaseNumber(null);
    setRecordingTime(0);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex">
      {/* Sidebar for Desktop UI */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        <div className="p-8 flex items-center space-x-3 border-b border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SafeBridge</h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">Citizen Portal</p>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-3">
          <button 
            onClick={() => { setActiveTab("report"); if(step==="success") resetFlow(); }}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'report' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
          >
            <PlusCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">New Report</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("track")}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'track' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-semibold text-lg">Track Cases</span>
          </button>
        </div>

        {user && (
          <div className="p-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="truncate text-sm font-medium text-slate-300">
                  {user.email}
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
          
          {/* --- NEW REPORT TAB --- */}
          {activeTab === "report" && (
            <div className="w-full space-y-8 max-w-4xl">
              
              {step === "category" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 mb-8 backdrop-blur-xl">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">What's the issue?</h2>
                    <p className="text-lg text-slate-400">Select a category below to securely report a problem in your community. We ensure full anonymity.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat.id)}
                        className={`flex items-center space-x-4 p-6 rounded-3xl border ${cat.border} bg-slate-900 hover:bg-slate-800 transition-all group shadow-sm hover:shadow-xl`}
                      >
                        <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <cat.icon className={`w-7 h-7 ${cat.color}`} />
                        </div>
                        <span className="text-lg font-bold text-slate-200 text-left">{cat.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "photo" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl">
                  <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-4xl font-extrabold text-white mb-2">Visual Evidence</h2>
                    <p className="text-lg text-slate-400">Please take a clear photo of the {selectedCategory.toLowerCase()} issue. This helps officials verify the problem quickly.</p>
                  </div>
                  
                  <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden aspect-video shadow-2xl border border-slate-700/50 ring-4 ring-slate-900">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    
                    {location ? (
                      <div className="absolute top-6 right-6 bg-emerald-500/90 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-xl">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location Locked
                      </div>
                    ) : (
                      <div className="absolute top-6 right-6 bg-amber-500/90 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-xl animate-pulse">
                        <Navigation className="w-4 h-4 mr-2" />
                        Locating...
                      </div>
                    )}
                    
                    {/* Camera Overlay Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/30 rounded-2xl"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={skipPhoto}
                      className="flex-[1] py-5 bg-slate-800 border border-slate-700 text-slate-300 text-lg font-bold rounded-2xl hover:bg-slate-700 transition-colors"
                    >
                      Skip Photo
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="flex-[2] flex items-center justify-center bg-indigo-600 text-white text-lg font-bold py-5 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                    >
                      <Camera className="w-6 h-6 mr-3" />
                      Capture Photo
                    </button>
                  </div>
                </div>
              )}

              {step === "audio" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl flex flex-col items-center mx-auto text-center">
                  <div className="w-full bg-slate-900/50 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-xl text-left">
                    <h2 className="text-4xl font-extrabold text-white mb-2">Record Your Issue</h2>
                    <p className="text-lg text-slate-400">Speak clearly about the problem. Our AI automatically removes any sensitive personal information (PII) to protect your identity.</p>
                  </div>

                  {photoData && (
                    <div className="w-full flex items-center space-x-6 p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-lg">
                        <img src={photoData} alt="Captured evidence" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-white mb-1">Evidence Captured</p>
                        <p className="text-sm font-semibold text-emerald-400 flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Geo-tagged automatically</p>
                      </div>
                    </div>
                  )}

                  <div className="py-16 flex flex-col items-center justify-center w-full relative bg-slate-900/30 rounded-[3rem] border border-slate-800/50">
                    <div className={`absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl transition-opacity duration-1000 ${isRecording ? 'opacity-100' : 'opacity-0'}`}></div>
                    
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`
                        relative z-10 flex items-center justify-center w-40 h-40 rounded-full border-4 transition-all duration-300 ease-out transform
                        ${isRecording 
                          ? "bg-rose-500 border-rose-400/50 scale-110 shadow-[0_0_80px_rgba(244,63,94,0.4)]" 
                          : "bg-indigo-600 border-indigo-500/50 hover:bg-indigo-500 hover:scale-105 shadow-[0_0_50px_rgba(99,102,241,0.3)]"}
                      `}
                    >
                      {isRecording ? (
                        <div className="w-12 h-12 bg-white rounded-xl animate-pulse" />
                      ) : (
                        <Mic className="w-16 h-16 text-white" />
                      )}
                    </button>

                    <div className="mt-12 text-center h-16">
                      {isRecording ? (
                        <div className="space-y-2">
                          <p className="text-4xl font-mono font-bold text-white tracking-widest">{formatTime(recordingTime)}</p>
                          <p className="text-rose-400 text-lg font-semibold animate-pulse">Recording in progress... Tap square to submit.</p>
                        </div>
                      ) : (
                        <p className="text-slate-300 text-lg font-medium bg-slate-800 px-6 py-3 rounded-full border border-slate-700 shadow-md">Tap the microphone to start speaking</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === "processing" && (
                <div className="py-32 flex flex-col items-center justify-center space-y-10 animate-in fade-in zoom-in duration-500 text-center max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-slate-800 w-32 h-32 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-2xl">
                      <Loader2 className="w-14 h-14 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold text-white">Securing Your Report</h2>
                    <p className="text-xl text-slate-400 leading-relaxed">Processing audio, verifying category, anonymizing identity, and generating an immutable cryptographic hash.</p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="py-16 flex flex-col items-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-8 border-slate-950">
                      <CheckCircle2 className="w-16 h-16 text-slate-950" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl font-extrabold text-white">Report Filed Successfully</h2>
                    <p className="text-xl text-slate-400">Your issue is securely logged on the network.</p>
                  </div>
                  
                  <div className="w-full bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-slate-700/50 shadow-2xl space-y-8">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Immutable Case Number</p>
                      <p className="text-2xl font-mono font-bold text-slate-200 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 break-all">{caseNumber}</p>
                    </div>
                    
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                      <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Your Secret PIN</p>
                      <p className="text-7xl font-mono font-black tracking-[0.2em] text-white relative z-10">{pin}</p>
                      <p className="text-sm text-indigo-300/80 mt-4 relative z-10 font-medium">Please save this PIN. You will need it to verify your identity when authorities contact you.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('track')}
                    className="w-full flex items-center justify-center space-x-3 bg-slate-800 hover:bg-slate-700 text-white text-lg font-bold py-6 rounded-2xl border border-slate-700 transition-all shadow-xl"
                  >
                    <Search className="w-6 h-6 text-indigo-400" />
                    <span>Track Your Cases</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- TRACK CASES TAB --- */}
          {activeTab === "track" && (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight">Your Cases</h2>
                  <p className="text-lg text-slate-400 mt-2">Track the resolution status of your grievances in real-time.</p>
                </div>
                <div className="bg-slate-800/80 px-6 py-3 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                  <span className="text-indigo-400 font-black text-3xl">{myReports.length}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Total Filed</span>
                </div>
              </div>

              {myReports.length === 0 ? (
                <div className="py-32 text-center bg-slate-900/50 rounded-[2.5rem] border-2 border-slate-800 border-dashed">
                  <FileText className="w-20 h-20 text-slate-700 mx-auto mb-6" />
                  <p className="text-xl text-slate-400 font-semibold mb-4">No complaints filed yet.</p>
                  <button onClick={() => setActiveTab('report')} className="text-indigo-400 hover:text-indigo-300 font-bold text-lg underline underline-offset-4">File your first report now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myReports.map((report) => (
                    <div key={report._id} className="bg-slate-800/60 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-700/50 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-colors flex flex-col">
                      {/* Status indicator line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        report.status === 'Resolved' ? 'bg-emerald-500' :
                        report.status === 'Verified' ? 'bg-indigo-500' :
                        'bg-amber-500'
                      }`}></div>
                      
                      <div className="flex justify-between items-start mb-6 pl-4">
                        <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">{report.caseNumber}</span>
                        <span className={`text-sm font-bold px-4 py-1.5 rounded-full flex items-center space-x-2 ${
                          report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          report.status === 'Verified' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {report.status === 'Resolved' && <CheckCircle2 className="w-4 h-4" />}
                          {report.status === 'Verified' && <Shield className="w-4 h-4" />}
                          {report.status === 'Pending Validation' && <Clock className="w-4 h-4" />}
                          <span>{report.status}</span>
                        </span>
                      </div>
                      
                      <div className="pl-4 flex-1 flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-sm font-bold text-slate-200 bg-slate-700 px-3 py-1 rounded-lg border border-slate-600">{report.category}</span>
                          {report.urgencyScore > 7 && <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">HIGH URGENCY</span>}
                        </div>
                        <p className="text-lg text-white font-medium leading-relaxed mb-8 flex-1">{report.summary}</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                          <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Secret PIN:</span>
                            <span className="text-lg font-mono font-bold text-white">{report.pin}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-500 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
