"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, Camera, MapPin, User, LogOut, Droplet, Zap, AlertTriangle, Shield, EyeOff, MoreHorizontal, Trash2, Bus, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "Water & Sanitation", icon: Droplet, color: "text-blue-500", bg: "bg-blue-100" },
  { id: "Electricity", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
  { id: "Roads & Infrastructure", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-100" },
  { id: "Waste Management", icon: Trash2, color: "text-green-500", bg: "bg-green-100" },
  { id: "Public Transport", icon: Bus, color: "text-teal-500", bg: "bg-teal-100" },
  { id: "Medical & Health", icon: Activity, color: "text-rose-500", bg: "bg-rose-100" },
  { id: "Corruption", icon: Shield, color: "text-red-500", bg: "bg-red-100" },
  { id: "Harassment", icon: EyeOff, color: "text-purple-500", bg: "bg-purple-100" },
  { id: "Other", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-100" },
];

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [viewingReports, setViewingReports] = useState(false);
  
  const [step, setStep] = useState<"category" | "photo" | "audio" | "processing" | "success">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Animation states
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    checkAuth();
    
    // Global mouse listener for ambient background glow
    const handleGlobalMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate tilt (divided by 20 to keep it subtle)
    const tiltX = (y - centerY) / 20; 
    const tiltY = (centerX - x) / 20;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && (data.user.role === 'complainant' || data.user.role === 'citizen')) {
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

  const uploadComplaint = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'grievance.webm');
      formData.append('category', selectedCategory);
      if (photoData) formData.append('photo', photoData);
      if (location) formData.append('location', JSON.stringify(location));
      
      const response = await fetch('/api/complaints', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.pin) {
        setPin(data.pin);
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
  };

  if (loading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col p-4 relative overflow-hidden">
      
      {/* Ambient Mouse-Following Background Glow */}
      <div 
        className="fixed w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none transition-all duration-500 ease-out z-0"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />
      <div 
        className="fixed w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          left: mousePos.x - 100,
          top: mousePos.y - 400,
        }}
      />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white dark:border-slate-800 z-10 relative">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Citizen Dashboard</h1>
        <div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center"><User className="w-4 h-4 mr-1"/> {user.email}</span>
              <div className="flex items-center space-x-2">
                <Link href="/validator" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Validator</Link>
                <Link href="/official" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Official</Link>
                <button onClick={handleLogout} className="text-sm text-red-600 dark:text-red-400 flex items-center hover:text-red-800 dark:hover:text-red-300 transition-colors">
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center z-10 relative" style={{ perspective: '1200px' }}>
        <div 
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease-out, box-shadow 0.5s ease-out' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
            boxShadow: tilt.x === 0 && tilt.y === 0 
              ? '0 20px 50px -12px rgba(0,0,0,0.1)' 
              : `${-tilt.y * 2}px ${tilt.x * 2 + 20}px 40px rgba(0,0,0,0.15)`,
            transformStyle: 'preserve-3d'
          }}
          className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl overflow-hidden p-8 text-center space-y-6 will-change-transform"
        >
          
          {step === "category" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300" style={{ transform: 'translateZ(30px)' }}>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is the issue?</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Select a category to start your report.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className="flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div className={`w-12 h-12 ${cat.bg} dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <cat.icon className={`w-6 h-6 ${cat.color} dark:text-indigo-400`} />
                    </div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "photo" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300" style={{ transform: 'translateZ(30px)' }}>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Evidence Required</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Please take a photo of the {selectedCategory.toLowerCase()} issue. We will securely tag your location.</p>
              </div>
              
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[3/4] shadow-inner transform-gpu">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-2xl pointer-events-none"></div>
                
                {location && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center backdrop-blur-md">
                    <MapPin className="w-3 h-3 mr-1" />
                    Locating...
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={skipPhoto}
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={capturePhoto}
                  className="flex-[2] flex items-center justify-center bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:-translate-y-1 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {step === "audio" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300" style={{ transform: 'translateZ(30px)' }}>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Describe the Issue</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Speak clearly into your microphone. We will automatically scrub sensitive info.</p>
                <div className="inline-flex items-center mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
                  Category: {selectedCategory}
                </div>
              </div>

              <div className="py-8 flex flex-col items-center justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    relative group flex items-center justify-center w-40 h-40 rounded-full 
                    transition-all duration-300 ease-in-out transform
                    ${isRecording 
                      ? "bg-red-500 hover:bg-red-600 scale-105 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_40px_rgba(239,68,68,0.5)]" 
                      : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-[0_20px_40px_rgba(79,70,229,0.3)]"}
                  `}
                >
                  {isRecording ? (
                    <Square className="w-16 h-16 text-white fill-current" />
                  ) : (
                    <Mic className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <div className="mt-8 h-8">
                  {isRecording ? (
                    <p className="text-red-500 font-medium animate-pulse">Recording... Tap to submit</p>
                  ) : (
                    <p className="text-slate-500 font-medium">Tap the microphone to speak</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300" style={{ transform: 'translateZ(30px)' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-500/50 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-indigo-600 dark:bg-indigo-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Securing your report...</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Processing audio and anonymizing data.</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 space-y-6 animate-in fade-in zoom-in duration-500" style={{ transform: 'translateZ(30px)' }}>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Secured</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm px-4">Your issue is being reviewed by local NGOs. Please save this secret code to check your status later.</p>
              </div>
              
              <div className="bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Your Secret Status Code</p>
                <p className="text-5xl font-mono font-bold tracking-[0.25em] text-indigo-600 dark:text-indigo-400">{pin}</p>
              </div>

              <button 
                onClick={resetFlow}
                className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Make another report
              </button>
            </div>
          )}

        </div>
      </div>

      {user && !viewingReports && myReports.length > 0 && (
        <div className="mt-8 max-w-md mx-auto w-full text-center z-10 relative animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <button 
            onClick={() => setViewingReports(true)}
            className="text-indigo-600 dark:text-indigo-400 font-medium bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white dark:border-slate-800 shadow-sm px-6 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all"
          >
            View My Past Reports ({myReports.length})
          </button>
        </div>
      )}

      {viewingReports && (
        <div className="mt-8 max-w-md mx-auto w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 z-10 relative animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Reports</h2>
            <button onClick={() => setViewingReports(false)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Close</button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {myReports.map((report) => (
              <div key={report._id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{report.category}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    report.status === 'Resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    report.status === 'Verified' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{report.summary}</p>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">PIN: {report.pin}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
