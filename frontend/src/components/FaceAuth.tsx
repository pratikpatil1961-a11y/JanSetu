"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, Loader2, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, X } from "lucide-react";

interface FaceAuthProps {
  mode: 'enroll' | 'verify';
  onSuccess: (embedding?: number[]) => void;
  onCancel: () => void;
}

export default function FaceAuth({ mode, onSuccess, onCancel }: FaceAuthProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<string>("Initializing camera...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading neural networks...");
        const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        startVideo();
      } catch (err: any) {
        console.error("Model loading error:", err);
        setError(`Failed to load recognition models: ${err.message || 'Unknown error'}`);
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("Looking for face...");
      }
    } catch (err) {
      setError("Camera access denied.");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleFaceDetection = async () => {
    if (!videoRef.current || !modelsLoaded || isVerifying) return;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      // Draw detections on canvas
      if (canvasRef.current) {
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }

      if (mode === 'enroll') {
        setStatus("Face captured!");
        setIsVerifying(true);
        setTimeout(() => {
          onSuccess(Array.from(detections.descriptor));
        }, 1000);
      } else {
        setStatus("Matching face...");
        setIsVerifying(true);
        // Send to backend via onSuccess callback
        onSuccess(Array.from(detections.descriptor));
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (modelsLoaded && !isVerifying) {
      interval = setInterval(handleFaceDetection, 1000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, isVerifying]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[#0d1117] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 space-y-8">
        
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
             <ShieldCheck className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'enroll' ? 'Register Your Face' : 'Face Verification'}
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Passwordless Identity</p>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 group">
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={() => {}}
            width="300"
            height="300"
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
          />
          
          {/* Scanning Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent animate-[scan_3s_infinite]" />
          
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-3xl pointer-events-none" />
          
          {isVerifying && (
            <div className="absolute inset-0 bg-[#0d1117]/60 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
               <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
               <p className="text-xs font-bold text-white uppercase tracking-widest">Processing</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
           <div className={`p-4 rounded-2xl border flex items-center space-x-3 transition-colors ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-900/50 border-slate-800 text-slate-300'}`}>
              {error ? (
                <AlertCircle className="w-4 h-4" />
              ) : isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              ) : (
                <Camera className="w-4 h-4 text-indigo-500" />
              )}
              <span className="text-xs font-bold uppercase tracking-widest">{error || status}</span>
           </div>

           <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium uppercase tracking-[0.1em]">
              {mode === 'enroll' 
                ? "Look directly at the camera. We will capture a secure numerical representation of your face." 
                : "Looking for a match in our secure database. Access is granted instantly."}
           </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
