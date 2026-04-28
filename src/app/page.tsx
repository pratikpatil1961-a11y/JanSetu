"use client";

import { useState } from "react";
import Link from "next/link";
import { User, ShieldCheck, Briefcase, Globe } from "lucide-react";

type LanguageKey = 'en' | 'hi' | 'mr' | 'bn';

const TRANSLATIONS = {
  en: {
    title: "Select Your Portal",
    subtitle: "Welcome to SafeBridge. Please select your role to proceed to your dedicated workspace and login.",
    citizenTitle: "Citizen Portal",
    citizenDesc: "Report grievances, track the status of your issues, and help improve your community.",
    enterPortal: "Enter Portal \u2192",
    officialTitle: "Official Portal",
    officialDesc: "Manage verified grievances, update resolution statuses, and coordinate actions.",
  },
  hi: {
    title: "अपना पोर्टल चुनें",
    subtitle: "सेफब्रिज में आपका स्वागत है। अपने समर्पित कार्यस्थान पर जाने और लॉग इन करने के लिए कृपया अपनी भूमिका चुनें।",
    citizenTitle: "नागरिक पोर्टल",
    citizenDesc: "शिकायतें दर्ज करें, अपने मुद्दों की स्थिति ट्रैक करें और अपने समुदाय को बेहतर बनाने में मदद करें।",
    enterPortal: "पोर्टल में प्रवेश करें \u2192",
    officialTitle: "अधिकारी पोर्टल",
    officialDesc: "सत्यापित शिकायतों का प्रबंधन करें, समाधान स्थिति अपडेट करें और कार्यों का समन्वय करें।",
  },
  mr: {
    title: "आपले पोर्टल निवडा",
    subtitle: "सेफब्रिजमध्ये आपले स्वागत आहे. आपल्या समर्पित कार्यक्षेत्रात जाण्यासाठी आणि लॉग इन करण्यासाठी कृपया आपली भूमिका निवडा.",
    citizenTitle: "नागरिक पोर्टल",
    citizenDesc: "तक्रारी नोंदवा, आपल्या समस्यांची स्थिती ट्रॅक करा आणि आपला समुदाय सुधारण्यास मदत करा.",
    enterPortal: "पोर्टलमध्ये प्रवेश करा \u2192",
    officialTitle: "अधिकारी पोर्टल",
    officialDesc: "सत्यापित तक्रारींचे व्यवस्थापन करा, निराकरण स्थिती अद्यतनित करा आणि कृतींचे समन्वय करा.",
  },
  bn: {
    title: "আপনার পোর্টাল নির্বাচন করুন",
    subtitle: "সেফব্রিজে স্বাগতম। আপনার ডেডিকেটেড ওয়ার্কস্পেসে এগিয়ে যেতে এবং লগ ইন করতে অনুগ্রহ করে আপনার ভূমিকা নির্বাচন করুন।",
    citizenTitle: "নাগরিক পোর্টাল",
    citizenDesc: "অভিযোগ দায়ের করুন, আপনার সমস্যার অবস্থা ট্র্যাক করুন এবং আপনার সম্প্রদায়ের উন্নতিতে সহায়তা করুন।",
    enterPortal: "পোর্টালে প্রবেশ করুন \u2192",
    officialTitle: "অফিসিয়াল পোর্টাল",
    officialDesc: "যাচাইকৃত অভিযোগ পরিচালনা করুন, সমাধানের অবস্থা আপডেট করুন এবং কাজের সমন্বয় করুন।",
  }
};

export default function LandingPage() {
  const [language, setLanguage] = useState<LanguageKey>("en");

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header with Language Selector */}
      <header className="w-full p-6 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">SafeBridge</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
          <Globe className="w-4 h-4 text-slate-500" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageKey)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="text-center max-w-2xl mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          
          {/* Citizen Portal Card */}
          <Link href="/citizen/login" className="group flex flex-col bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.citizenTitle}</h2>
            <p className="text-slate-500 mb-6 flex-1">
              {t.citizenDesc}
            </p>
            <div className="inline-flex items-center justify-center font-medium text-indigo-600 bg-indigo-50 py-3 px-6 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {t.enterPortal}
            </div>
          </Link>

          {/* Official Portal Card */}
          <Link href="/official/login" className="group flex flex-col bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 text-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.officialTitle}</h2>
            <p className="text-slate-400 mb-6 flex-1">
              {t.officialDesc}
            </p>
            <div className="inline-flex items-center justify-center font-medium text-blue-400 bg-blue-500/10 py-3 px-6 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {t.enterPortal}
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
