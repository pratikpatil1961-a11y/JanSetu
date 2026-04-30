"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, ShieldCheck, Briefcase, Globe } from "lucide-react";

const translations = {
  en: {
    title: "Select Your Portal",
    subtitle: "Welcome to SafeBridge. Please select your role to proceed to your dedicated workspace and login.",
    citizen: "Citizen Portal",
    citizenDesc: "Report grievances, track the status of your issues, and help improve your community.",
    validator: "Validator Portal",
    validatorDesc: "Review and verify community reports to ensure authenticity and prevent spam.",
    official: "Official Portal",
    officialDesc: "Manage verified grievances, update resolution statuses, and coordinate actions.",
    enter: "Enter Portal \u2192"
  },
  hi: {
    title: "अपना पोर्टल चुनें",
    subtitle: "SafeBridge में आपका स्वागत है। कृपया आगे बढ़ने के लिए अपनी भूमिका चुनें।",
    citizen: "नागरिक पोर्टल",
    citizenDesc: "शिकायतें दर्ज करें, अपने मुद्दों की स्थिति ट्रैक करें, और समुदाय को बेहतर बनाएं।",
    validator: "सत्यापनकर्ता पोर्टल",
    validatorDesc: "प्रामाणिकता सुनिश्चित करने और स्पैम को रोकने के लिए रिपोर्ट सत्यापित करें।",
    official: "अधिकारी पोर्टल",
    officialDesc: "सत्यापित शिकायतों का प्रबंधन करें और समाधान स्थिति अपडेट करें।",
    enter: "पोर्टल में प्रवेश करें \u2192"
  },
  mr: {
    title: "तुमचे पोर्टल निवडा",
    subtitle: "SafeBridge मध्ये आपले स्वागत आहे. कृपया पुढे जाण्यासाठी तुमची भूमिका निवडा.",
    citizen: "नागरिक पोर्टल",
    citizenDesc: "तक्रारी नोंदवा, तुमच्या समस्यांचा मागोवा घ्या आणि समुदायात सुधारणा करा.",
    validator: "पडताळणीकर्ता पोर्टल",
    validatorDesc: "सत्यता सुनिश्चित करण्यासाठी आणि स्पॅम टाळण्यासाठी अहवाल पडताळणी करा.",
    official: "अधिकारी पोर्टल",
    officialDesc: "सत्यापित तक्रारी व्यवस्थापित करा आणि निराकरण स्थिती अद्यतनित करा.",
    enter: "पोर्टलमध्ये प्रवेश करा \u2192"
  },
  bn: {
    title: "আপনার পোর্টাল নির্বাচন করুন",
    subtitle: "SafeBridge এ আপনাকে স্বাগতম। এগিয়ে যেতে অনুগ্রহ করে আপনার ভূমিকা নির্বাচন করুন।",
    citizen: "নাগরিক পোর্টাল",
    citizenDesc: "অভিযোগ জমা দিন, স্থিতি ট্র্যাক করুন এবং সম্প্রদায়কে উন্নত করুন।",
    validator: "যাচাইকারী পোর্টাল",
    validatorDesc: "সত্যতা নিশ্চিত করতে এবং স্প্যাম প্রতিরোধ করতে প্রতিবেদনগুলি যাচাই করুন।",
    official: "সরকারি পোর্টাল",
    officialDesc: "যাচাইকৃত অভিযোগগুলি পরিচালনা করুন এবং সমাধানের স্থিতি আপডেট করুন।",
    enter: "পোর্টালে প্রবেশ করুন \u2192"
  },
  kn: {
    title: "ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ",
    subtitle: "SafeBridge ಗೆ ಸುಸ್ವಾಗತ. ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    citizen: "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
    citizenDesc: "ಕುಂದುಕೊರತೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಸಮುದಾಯವನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡಿ.",
    validator: "ಮೌಲ್ಯೀಕರಣ ಪೋರ್ಟಲ್",
    validatorDesc: "ದೃಢೀಕರಣವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಮತ್ತು ಸ್ಪ್ಯಾಮ್ ತಡೆಯಲು ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    official: "ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್",
    officialDesc: "ಪರಿಶೀಲಿಸಿದ ಕುಂದುಕೊರತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ರೆಸಲ್ಯೂಶನ್ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ.",
    enter: "ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ \u2192"
  }
};

export default function LandingPage() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("sb_lang");
    if (saved && translations[saved as keyof typeof translations]) {
      setLanguage(saved);
    }
  }, []);

  const handleLangChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("sb_lang", val);
    window.dispatchEvent(new Event("languageChanged"));
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      {/* Header with Language Selector */}
      <header className="w-full p-6 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SafeBridge</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <select 
            value={language}
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16 z-10">
        <div className="text-center max-w-2xl mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          
          {/* Citizen Portal Card */}
          <Link href="/citizen/login" className="group flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.citizen}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{t.citizenDesc}</p>
            <div className="inline-flex items-center justify-center font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 py-3 px-6 rounded-xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-colors">
              {t.enter}
            </div>
          </Link>

          {/* Validator Portal Card */}
          <Link href="/validator/login" className="group flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.validator}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{t.validatorDesc}</p>
            <div className="inline-flex items-center justify-center font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 py-3 px-6 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              {t.enter}
            </div>
          </Link>

          {/* Official Portal Card */}
          <Link href="/official/login" className="group flex flex-col bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-800 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 text-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.official}</h2>
            <p className="text-slate-400 mb-6 flex-1">{t.officialDesc}</p>
            <div className="inline-flex items-center justify-center font-medium text-blue-400 bg-blue-500/10 py-3 px-6 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {t.enter}
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
