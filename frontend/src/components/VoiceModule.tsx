"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, MessageSquare, Volume2, MapPin, Clock } from "lucide-react";

interface VoiceModuleProps {
  onComplete: (transcript: string, audioBlob?: Blob) => void;
  onCancel: () => void;
  category: string;
  language: string;
}

const LANG_MAP: Record<string, { rec: string, synth: string }> = {
  en: { rec: "en-IN", synth: "en-IN" },
  hi: { rec: "hi-IN", synth: "hi-IN" },
  kn: { rec: "kn-IN", synth: "kn-IN" },
  mr: { rec: "mr-IN", synth: "mr-IN" },
  te: { rec: "te-IN", synth: "te-IN" },
};

const PROMPTS: Record<string, Record<string, string>> = {
  en: {
    issue: "Tell me, what is the issue?",
    location: "Where is this happening?",
    time: "Since when has this been an issue?",
    else: "Got it. Anything else you want to add?",
    safe: "I have enabled Safe Mode for your protection."
  },
  hi: {
    issue: "मुझे बताएं, समस्या क्या है?",
    location: "यह कहाँ हो रहा है?",
    time: "यह समस्या कब से है?",
    else: "समझ गया। क्या आप कुछ और जोड़ना चाहते हैं?",
    safe: "मैंने आपकी सुरक्षा के लिए सेफ मोड सक्षम कर दिया है।"
  },
  kn: {
    issue: "ಸಮಸ್ಯೆ ಏನು ಎಂದು ನನಗೆ ತಿಳಿಸಿ?",
    location: "ಇದು ಎಲ್ಲಿ ನಡೆಯುತ್ತಿದೆ?",
    time: "ಇದು ಯಾವಾಗಲಿಂದ ಸಮಸ್ಯೆಯಾಗಿದೆ?",
    else: "ಅರ್ಥವಾಯಿತು. ನೀವು ಬೇರೆ ಏನಾದರೂ ಸೇರಿಸಲು ಬಯಸುವಿರಾ?",
    safe: "ನಿಮ್ಮ ರಕ್ಷಣೆಗಾಗಿ ನಾನು ಸೇಫ್ ಮೋಡ್ ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿದ್ದೇನೆ."
  },
  mr: {
    issue: "मला सांगा, समस्या काय आहे?",
    location: "हे कुठे घडत आहे?",
    time: "ही समस्या कधीपासून आहे?",
    else: "समजले. तुम्हाला अजून काही सांगायचे आहे का?",
    safe: "मी तुमच्या संरक्षणासाठी सेफ मोड सक्षम केला आहे."
  },
  te: {
    issue: "సమస్య ఏమిటో నాకు చెప్పండి?",
    location: "ఇది ఎక్కడ జరుగుతోంది?",
    time: "ఈ సమస్య ఎప్పటి నుండి ఉంది?",
    else: "అర్థమైంది. మీరు ఇంకేదైనా చెప్పాలనుకుంటున్నారా?",
    safe: "మీ రక్షణ కోసం నేను సేఫ్ మోడ్‌ని ఎనేబుల్ చేసాను."
  }
};

export default function VoiceModule({ onComplete, onCancel, category, language }: VoiceModuleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[language]?.issue || PROMPTS.en.issue);
  const [safeMode, setSafeMode] = useState(false);
  const safeModeRef = useRef(false);
  const [missingFields, setMissingFields] = useState<string[]>(["issue", "location", "time"]);
  const missingFieldsRef = useRef<string[]>(["issue", "location", "time"]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = LANG_MAP[language]?.rec || "en-IN";

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setTranscript((prev) => prev + final);
        setInterimTranscript(interim);
        analyzeTranscript(transcript + final + interim);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, transcript, language]);

  // Analyze transcript for missing fields and sensitivity
  const analyzeTranscript = (text: string) => {
    const lowerText = text.toLowerCase();
    const currentMissing = missingFieldsRef.current;

    // Simple keyword detection for guidance
    if (currentMissing.includes("issue") && (lowerText.length > 20)) {
      missingFieldsRef.current = currentMissing.filter(f => f !== "issue");
      setMissingFields(missingFieldsRef.current);
      const next = PROMPTS[language]?.location || PROMPTS.en.location;
      speakPrompt(next);
      setCurrentPrompt(next);
    }
    
    if (!currentMissing.includes("issue") && currentMissing.includes("location") && 
       (lowerText.includes("at ") || lowerText.includes("in ") || lowerText.includes("near ") || lowerText.includes("area") || lowerText.length > 50)) {
      missingFieldsRef.current = currentMissing.filter(f => f !== "location");
      setMissingFields(missingFieldsRef.current);
      const next = PROMPTS[language]?.time || PROMPTS.en.time;
      speakPrompt(next);
      setCurrentPrompt(next);
    }

    if (!currentMissing.includes("location") && currentMissing.includes("time") && 
       (lowerText.includes("since") || lowerText.includes("days") || lowerText.includes("today") || lowerText.includes("yesterday") || lowerText.length > 80)) {
      missingFieldsRef.current = currentMissing.filter(f => f !== "time");
      setMissingFields(missingFieldsRef.current);
      const next = PROMPTS[language]?.else || PROMPTS.en.else;
      speakPrompt(next);
      setCurrentPrompt(next);
    }

    // Sensitive keyword detection
    const sensitiveWords = ["harassment", "corruption", "bribe", "threat", "सेक्स", "रिश्वत", "भ्रष्टाचार", "छेडछाड"];
    if (sensitiveWords.some(word => lowerText.includes(word))) {
      if (!safeModeRef.current) {
        safeModeRef.current = true;
        setSafeMode(true);
        const safe = PROMPTS[language]?.safe || PROMPTS.en.safe;
        speakPrompt(safe);
      }
    }
  };

  const speakPrompt = (text: string, onEnd?: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[language]?.synth || "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const targetLang = LANG_MAP[language]?.synth || "en-IN";
      let bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith(language) && (v.name.includes("Google") || v.name.includes("Natural")));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith(language));
      
      // Fallback for Indian scripts: if native voice is missing, Hindi voice reads Indian context slightly better than English US
      if (!bestVoice && (language === 'mr' || language === 'hi' || language === 'kn' || language === 'te')) {
        bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith('hi-IN') || v.lang.replace('_', '-').startsWith('hi'));
      }
      
      if (bestVoice) utterance.voice = bestVoice;

      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      onEnd();
    }
  };

  const startFlow = async () => {
    // Step 1: Speak the initial prompt first
    speakPrompt(currentPrompt, async () => {
      // Step 2: Start recording/recognition only AFTER speaking is done
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          onComplete(transcript, audioBlob);
        };

        chunksRef.current = [];
        mediaRecorderRef.current.start();
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic error:", err);
        alert("Microphone access is required.");
      }
    });
  };

  const stopFlow = () => {
    setIsRecording(false);
    setIsProcessing(true);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
  };

  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 rotate-12' : 'bg-slate-800 text-slate-500'}`}>
            <Sparkles className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">JanSetu Assistant</h3>
            <div className="flex items-center space-x-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active & Learning</p>
            </div>
          </div>
        </div>
        {safeMode && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-bold animate-in fade-in slide-in-from-top-2">
            <ShieldCheck className="w-3 h-3" />
            <span>PROTECTIVE MODE</span>
          </div>
        )}
      </div>

      <div className="min-h-[220px] flex flex-col items-center justify-center space-y-8 text-center mb-10 relative z-10">
        {!isRecording && !isProcessing ? (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer group" onClick={startFlow}>
              <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-bold">Ready to assist you</p>
              <p className="text-xs text-slate-500">Tap to start a guided voice report</p>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-300 font-bold">Neural Processing...</p>
              <p className="text-xs text-slate-500">Optimizing transcript and removing PII</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 w-full animate-in fade-in duration-500">
            {/* Real-time Entities Display */}
            <div className="flex flex-wrap justify-center gap-2">
               <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-500 flex items-center space-x-1.5 ${!missingFields.includes("issue") ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ISSUE DETECTED</span>
               </div>
               <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-500 flex items-center space-x-1.5 ${!missingFields.includes("location") ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}>
                  <MapPin className="w-3 h-3" />
                  <span>LOCATION PINNED</span>
               </div>
               <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-500 flex items-center space-x-1.5 ${!missingFields.includes("time") ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}>
                  <Clock className="w-3 h-3" />
                  <span>TIME EXTRACTED</span>
               </div>
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
              <p className="text-indigo-400 text-base font-bold flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                {currentPrompt}
              </p>
            </div>
            
            <div className="relative px-4">
              <div className="h-20 flex items-center justify-center space-x-1 mb-4">
                 {[...Array(12)].map((_, i) => (
                   <div 
                    key={i} 
                    className="w-1.5 bg-indigo-500/40 rounded-full animate-bounce" 
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                      animationDelay: `${i * 0.05}s`
                    }} 
                   />
                 ))}
              </div>
              <div className="max-h-24 overflow-y-auto no-scrollbar">
                <p className="text-slate-300 text-lg font-medium leading-relaxed italic">
                  {transcript}
                  <span className="text-indigo-400/50">{interimTranscript}</span>
                </p>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent" />
            </div>

            <button 
              onClick={stopFlow}
              className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-600/20 group"
            >
              <Square className="w-6 h-6 text-white group-hover:scale-90 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {!isRecording && !isProcessing && (
        <div className="flex flex-col items-center space-y-6 relative z-10">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center space-y-2 group">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${missingFields.includes("issue") ? 'bg-slate-800 scale-75' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Issue</span>
            </div>
            <div className="flex flex-col items-center space-y-2 group">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${missingFields.includes("location") ? 'bg-slate-800 scale-75' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Location</span>
            </div>
            <div className="flex flex-col items-center space-y-2 group">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${missingFields.includes("time") ? 'bg-slate-800 scale-75' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Time</span>
            </div>
          </div>
          
          <button 
            onClick={onCancel}
            className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-rose-400 transition-colors border-t border-slate-800/50"
          >
            DISCARD SESSION
          </button>
        </div>
      )}
    </div>
  );
}
