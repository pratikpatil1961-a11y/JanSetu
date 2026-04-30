"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Languages, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { id: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
  { id: "mr", name: "मराठी", flag: "🇮🇳" },
  { id: "te", name: "తెలుగు", flag: "🇮🇳" },
] as const;

export default function LanguagePicker({ placement = "top" }: { placement?: "top" | "bottom" }) {
  const { language, setLanguage } = useLanguage();

  const menuClasses = placement === "top" 
    ? "bottom-full mb-2 left-0" 
    : "top-full mt-2 right-0";

  return (
    <div className="relative group z-[100]">
      <div className="flex items-center space-x-2 bg-[#161b22] px-3 py-2 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-pointer">
        <Languages className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-300">
          {LANGUAGES.find((l) => l.id === language)?.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-transform ${placement === "bottom" ? "" : "rotate-180"}`} />
      </div>
      
      <div className={`absolute ${menuClasses} w-40 bg-[#0d1117] border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden`}>
        <div className="p-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                language === lang.id
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
