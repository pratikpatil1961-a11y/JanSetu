"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, MapPin, X, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SupportVerificationModalProps {
  complaintId: string;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function SupportVerificationModal({ complaintId, onClose, onSuccess }: SupportVerificationModalProps) {
  const [step, setStep] = useState<"camera" | "processing" | "success">("camera");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    requestLocation();
    return () => {
      stopCamera();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const [accuracy, setAccuracy] = useState<number | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setAccuracy(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setAccuracy(acc);
        
        try {
          // Only reverse geocode if location changed significantly or not yet set
          const response = await apiFetch(`/complaints/proxy/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await response.json();
          const name = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.address?.city || "Current Location";
          setLocationName(name);
        } catch (e) {}
      },
      (err) => {
        console.error("Location watch error:", err);
        // Fallback to low accuracy if high fails
        if (err.code === err.TIMEOUT) {
          requestLocation(); // Retry once
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const captureAndSupport = async () => {
    if (!videoRef.current || loading) return;

    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL("image/jpeg");
      
      try {
        const res = await apiFetch(`/complaints/${complaintId}/support`, {
          method: "POST",
          body: JSON.stringify({
            photo,
            location: JSON.stringify(location)
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setStep("success");
          setTimeout(() => {
            onSuccess(data.supportersCount);
            onClose();
          }, 2000);
        } else {
          alert(data.error || "Failed to support");
          onClose();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-[#0d1117] border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Verification</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Geo-Tagged Proof</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === "camera" && (
            <div className="space-y-6">
              <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-square border border-slate-800 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                  {location ? (
                    <>
                      <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        {locationName || "Location Locked"}
                      </div>
                      {accuracy !== null && (
                        <div className={`backdrop-blur-md text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${accuracy > 100 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                          Accuracy: ±{Math.round(accuracy)}m
                        </div>
                      )}
                    </>
                  ) : (
                    <button 
                      onClick={requestLocation}
                      className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center border border-slate-800 transition-all active:scale-95"
                    >
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Locating... (Tap to retry)
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <p className="text-xs text-indigo-200/70 text-center leading-relaxed">
                    Capture proof of the issue. You must be within <span className="text-white font-bold">200m</span> of the site. 
                    {accuracy && accuracy > 100 && <span className="text-rose-400 block mt-1 font-bold">Weak GPS signal detected. Move to an open area.</span>}
                  </p>
                </div>

                <button 
                  onClick={captureAndSupport}
                  disabled={!location || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  <span>Verify & Support</span>
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Proof Verified</h3>
                <p className="text-sm text-slate-500">Your support has been logged with location proof.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
