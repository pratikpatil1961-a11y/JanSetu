"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";

const botTranslations = {
  en: {
    greeting: "Hi! Need help using SafeBridge? Just ask me.",
    title: "SafeBridge Guide",
    placeholder: "Ask a question...",
    hints: ["How do I login?", "Who is a Validator?", "What is a Citizen Portal?"],
    loginHints: ["I forgot my password", "Which portal should I choose?", "How to register?"],
    citizenHints: ["How do I submit a report?", "Where is my PIN?", "How do I check status?"],
    responses: {
      default: "I'm still learning! But basically, you can choose a role (Citizen, Validator, Official) to proceed.",
      login: "To log in, go to the Home page, pick your role and click 'Enter Portal'. Then enter your email and password!",
      register: "To register, click the 'Register here' link at the bottom of any login page. Make sure to pick the correct role!",
      forgot: "If you forgot your password, you will need to ask the administrator or reset it via your MongoDB Atlas dashboard.",
      submit: "To submit a report, log in to the Citizen Portal, select a category, take a picture, and tap the microphone to describe the issue!",
      validator: "Validators are NGO members or community leaders who review reports to ensure they are real and not spam.",
      pin: "When you submit a report, you will receive a secret 4-digit PIN. Save it! You can use it later to check if your report was verified or resolved.",
      portal: "Citizens report issues. Validators verify them. Officials resolve them. Pick the one that fits you best!"
    }
  },
  hi: {
    greeting: "नमस्ते! सेफब्रिज का उपयोग करने में मदद चाहिए? मुझसे पूछें।",
    title: "SafeBridge गाइड",
    placeholder: "एक प्रश्न पूछें...",
    hints: ["मैं लॉगिन कैसे करूँ?", "सत्यापनकर्ता कौन है?", "नागरिक पोर्टल क्या है?"],
    loginHints: ["मैं अपना पासवर्ड भूल गया", "मुझे कौन सा पोर्टल चुनना चाहिए?", "रजिस्टर कैसे करें?"],
    citizenHints: ["मैं रिपोर्ट कैसे दर्ज करूँ?", "मेरा पिन कहाँ है?", "मैं स्थिति कैसे जांचूं?"],
    responses: {
      default: "मैं अभी भी सीख रहा हूँ! लेकिन मूल रूप से, आप आगे बढ़ने के लिए एक भूमिका (नागरिक, सत्यापनकर्ता, अधिकारी) चुन सकते हैं।",
      login: "लॉग इन करने के लिए, होम पेज पर जाएं, अपनी भूमिका चुनें और 'पोर्टल दर्ज करें' पर क्लिक करें। फिर अपना ईमेल और पासवर्ड दर्ज करें!",
      register: "रजिस्टर करने के लिए, किसी भी लॉगिन पृष्ठ के नीचे 'यहां रजिस्टर करें' लिंक पर क्लिक करें।",
      forgot: "यदि आप अपना पासवर्ड भूल गए हैं, तो आपको व्यवस्थापक से पूछना होगा या इसे अपने MongoDB एटलस डैशबोर्ड के माध्यम से रीसेट करना होगा।",
      submit: "रिपोर्ट दर्ज करने के लिए, नागरिक पोर्टल में लॉग इन करें, एक श्रेणी चुनें, एक तस्वीर लें, और समस्या का वर्णन करने के लिए माइक्रोफ़ोन टैप करें!",
      validator: "सत्यापनकर्ता एनजीओ सदस्य या समुदाय के नेता हैं जो रिपोर्ट की समीक्षा करते हैं ताकि यह सुनिश्चित हो सके कि वे वास्तविक हैं और स्पैम नहीं हैं।",
      pin: "जब आप कोई रिपोर्ट सबमिट करते हैं, तो आपको एक गुप्त 4-अंकीय पिन प्राप्त होगा। इसे सहेजें! आप बाद में इसका उपयोग कर सकते हैं।",
      portal: "नागरिक समस्याओं की रिपोर्ट करते हैं। सत्यापनकर्ता उन्हें सत्यापित करते हैं। अधिकारी उन्हें हल करते हैं।"
    }
  },
  mr: {
    greeting: "नमस्कार! सेफब्रिज वापरण्यासाठी मदत हवी आहे का? मला विचारा.",
    title: "SafeBridge मार्गदर्शक",
    placeholder: "एक प्रश्न विचारा...",
    hints: ["मी लॉगिन कसे करू?", "पडताळणीकर्ता कोण आहे?", "नागरिक पोर्टल काय आहे?"],
    loginHints: ["मी माझा पासवर्ड विसरलो", "मी कोणते पोर्टल निवडावे?", "नोंदणी कशी करावी?"],
    citizenHints: ["मी अहवाल कसा सबमिट करू?", "माझा पिन कुठे आहे?", "स्थिती कशी तपासावी?"],
    responses: {
      default: "मी अजूनही शिकत आहे! पण मुळात, तुम्ही पुढे जाण्यासाठी एक भूमिका (नागरिक, पडताळणीकर्ता, अधिकारी) निवडू शकता.",
      login: "लॉग इन करण्यासाठी, मुख्य पृष्ठावर जा, तुमची भूमिका निवडा आणि 'पोर्टल प्रविष्ट करा' क्लिक करा. नंतर तुमचा ईमेल आणि पासवर्ड प्रविष्ट करा!",
      register: "नोंदणी करण्यासाठी, कोणत्याही लॉगिन पृष्ठाच्या तळाशी असलेल्या 'येथे नोंदणी करा' लिंकवर क्लिक करा.",
      forgot: "तुम्ही तुमचा पासवर्ड विसरल्यास, तुम्हाला प्रशासकाला विचारण्याची किंवा तुमच्या MongoDB अॅटलस डॅशबोर्डद्वारे ते रीसेट करण्याची आवश्यकता असेल.",
      submit: "अहवाल सबमिट करण्यासाठी, नागरिक पोर्टलवर लॉग इन करा, एक श्रेणी निवडा, चित्र घ्या आणि समस्येचे वर्णन करण्यासाठी मायक्रोफोन टॅप करा!",
      validator: "पडताळणीकर्ते हे एनजीओ सदस्य किंवा समुदाय नेते आहेत जे अहवाल खऱ्या आहेत आणि स्पॅम नाहीत याची खात्री करण्यासाठी त्यांचे पुनरावलोकन करतात.",
      pin: "जेव्हा तुम्ही अहवाल सबमिट करता, तेव्हा तुम्हाला एक गुप्त ४-अंकी पिन प्राप्त होईल. तो जतन करा! तुम्ही त्याचा वापर नंतर करू शकता.",
      portal: "नागरिक समस्यांची तक्रार करतात. पडताळणीकर्ते त्यांची पडताळणी करतात. अधिकारी त्यांचे निराकरण करतात."
    }
  },
  bn: {
    greeting: "হ্যালো! SafeBridge ব্যবহার করতে সাহায্য প্রয়োজন? আমাকে জিজ্ঞাসা করুন।",
    title: "SafeBridge গাইড",
    placeholder: "একটি প্রশ্ন জিজ্ঞাসা করুন...",
    hints: ["আমি কীভাবে লগইন করব?", "যাচাইকারী কে?", "নাগরিক পোর্টাল কী?"],
    loginHints: ["আমি আমার পাসওয়ার্ড ভুলে গেছি", "আমার কোন পোর্টালটি বেছে নেওয়া উচিত?", "কীভাবে নিবন্ধন করবেন?"],
    citizenHints: ["আমি কীভাবে একটি প্রতিবেদন জমা দেব?", "আমার পিন কোথায়?", "কীভাবে স্থিতি পরীক্ষা করব?"],
    responses: {
      default: "আমি এখনও শিখছি! তবে মূলত, আপনি এগিয়ে যাওয়ার জন্য একটি ভূমিকা (নাগরিক, যাচাইকারী, কর্মকর্তা) বেছে নিতে পারেন।",
      login: "লগ ইন করতে, হোম পেজে যান, আপনার ভূমিকা চয়ন করুন এবং 'পোর্টালে প্রবেশ করুন' ক্লিক করুন। তারপর আপনার ইমেল এবং পাসওয়ার্ড লিখুন!",
      register: "নিবন্ধন করতে, যে কোনও লগইন পৃষ্ঠার নীচে 'এখানে নিবন্ধন করুন' লিঙ্কটিতে ক্লিক করুন।",
      forgot: "আপনি যদি আপনার পাসওয়ার্ড ভুলে যান, তবে আপনাকে প্রশাসকের কাছে জিজ্ঞাসা করতে হবে বা আপনার MongoDB অ্যাটলাস ড্যাশবোর্ডের মাধ্যমে এটি পুনরায় সেট করতে হবে।",
      submit: "একটি প্রতিবেদন জমা দিতে, নাগরিক পোর্টালে লগ ইন করুন, একটি বিভাগ নির্বাচন করুন, একটি ছবি তুলুন এবং সমস্যাটি বর্ণনা করতে মাইক্রোফোনে আলতো চাপুন!",
      validator: "যাচাইকারীরা এনজিও সদস্য বা সম্প্রদায়ের নেতা যারা প্রতিবেদনগুলি আসল এবং স্প্যাম নয় তা নিশ্চিত করার জন্য পর্যালোচনা করে।",
      pin: "আপনি যখন একটি প্রতিবেদন জমা দেন, তখন আপনি একটি গোপন ৪-অঙ্কের পিন পাবেন। এটি সংরক্ষণ করুন! আপনি পরে এটি ব্যবহার করতে পারেন।",
      portal: "নাগরিকরা সমস্যা রিপোর্ট করে। যাচাইকারীরা সেগুলি যাচাই করে। কর্মকর্তারা সেগুলি সমাধান করে।"
    }
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! ಸೇಫ್‌ಬ್ರಿಡ್ಜ್ ಬಳಸಲು ಸಹಾಯ ಬೇಕೇ? ನನ್ನನ್ನು ಕೇಳಿ.",
    title: "SafeBridge ಮಾರ್ಗದರ್ಶಿ",
    placeholder: "ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    hints: ["ನಾನು ಲಾಗಿನ್ ಮಾಡುವುದು ಹೇಗೆ?", "ಮೌಲ್ಯೀಕರಿಸುವವರು ಯಾರು?", "ನಾಗರಿಕ ಪೋರ್ಟಲ್ ಎಂದರೇನು?"],
    loginHints: ["ನಾನು ನನ್ನ ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೇನೆ", "ನಾನು ಯಾವ ಪೋರ್ಟಲ್ ಆಯ್ಕೆ ಮಾಡಬೇಕು?", "ನೋಂದಾಯಿಸುವುದು ಹೇಗೆ?"],
    citizenHints: ["ನಾನು ವರದಿಯನ್ನು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?", "ನನ್ನ ಪಿನ್ ಎಲ್ಲಿದೆ?", "ನಾನು ಸ್ಥಿತಿಯನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸಬಹುದು?"],
    responses: {
      default: "ನಾನು ಇನ್ನೂ ಕಲಿಯುತ್ತಿದ್ದೇನೆ! ಆದರೆ ಮೂಲತಃ, ಮುಂದುವರಿಯಲು ನೀವು ಒಂದು ಪಾತ್ರವನ್ನು (ನಾಗರಿಕ, ಮೌಲ್ಯೀಕರಿಸುವವರು, ಅಧಿಕಾರಿ) ಆಯ್ಕೆ ಮಾಡಬಹುದು.",
      login: "ಲಾಗಿನ್ ಮಾಡಲು, ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ, ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು 'ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ. ನಂತರ ನಿಮ್ಮ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ!",
      register: "ನೋಂದಾಯಿಸಲು, ಯಾವುದೇ ಲಾಗಿನ್ ಪುಟದ ಕೆಳಭಾಗದಲ್ಲಿರುವ 'ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ' ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
      forgot: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನೀವು ಮರೆತಿದ್ದರೆ, ನೀವು ನಿರ್ವಾಹಕರನ್ನು ಕೇಳಬೇಕು ಅಥವಾ ನಿಮ್ಮ MongoDB ಅಟ್ಲಾಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮೂಲಕ ಅದನ್ನು ಮರುಹೊಂದಿಸಬೇಕಾಗುತ್ತದೆ.",
      submit: "ವರದಿಯನ್ನು ಸಲ್ಲಿಸಲು, ನಾಗರಿಕ ಪೋರ್ಟಲ್‌ಗೆ ಲಾಗಿನ್ ಮಾಡಿ, ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಚಿತ್ರವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಲು ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ!",
      validator: "ಮೌಲ್ಯೀಕರಿಸುವವರು NGO ಸದಸ್ಯರು ಅಥವಾ ಸಮುದಾಯದ ಮುಖಂಡರು, ಅವರು ವರದಿಗಳು ನೈಜವಾಗಿವೆ ಮತ್ತು ಸ್ಪ್ಯಾಮ್ ಅಲ್ಲ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಪರಿಶೀಲಿಸುತ್ತಾರೆ.",
      pin: "ನೀವು ವರದಿಯನ್ನು ಸಲ್ಲಿಸಿದಾಗ, ನೀವು ರಹಸ್ಯ 4-ಅಂಕಿಯ ಪಿನ್ ಅನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ. ಅದನ್ನು ಉಳಿಸಿ! ನಿಮ್ಮ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆಯೇ ಅಥವಾ ಪರಿಹರಿಸಲಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು ನೀವು ಅದನ್ನು ನಂತರ ಬಳಸಬಹುದು.",
      portal: "ನಾಗರಿಕರು ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡುತ್ತಾರೆ. ಮೌಲ್ಯೀಕರಿಸುವವರು ಅವುಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಾರೆ. ಅಧಿಕಾರಿಗಳು ಅವುಗಳನ್ನು ಪರಿಹರಿಸುತ್ತಾರೆ."
    }
  }
};

export default function ChatBot() {
  const [language, setLanguage] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Load and cache voices for all supported languages
  useEffect(() => {
    const loadVoices = () => {
      if (speechSynthesis) {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Pre-load Hindi and Marathi voices by triggering them
        voices.forEach(voice => {
          if (voice.lang.startsWith('hi') || voice.lang.startsWith('mr')) {
            // Voice available
          }
        });
      }
    };
    
    // Initial load
    loadVoices();
    
    // Some browsers need this event to load voices
    if (speechSynthesis) {
      speechSynthesis.addEventListener("voiceschanged", loadVoices);
      
      // Force voice loading for Hindi and Marathi
      setTimeout(() => {
        const testUtterance = new SpeechSynthesisUtterance("");
        testUtterance.lang = "hi-IN";
        speechSynthesis.speak(testUtterance);
        speechSynthesis.cancel();
        
        const mrUtterance = new SpeechSynthesisUtterance("");
        mrUtterance.lang = "mr-IN";
        speechSynthesis.speak(mrUtterance);
        speechSynthesis.cancel();
      }, 100);
    }
    
    return () => speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, [speechSynthesis]);

  // Load language and listen for changes

  // Load language and listen for changes
  useEffect(() => {
    const loadLang = () => {
      const saved = localStorage.getItem("sb_lang");
      if (saved && botTranslations[saved as keyof typeof botTranslations]) {
        setLanguage(saved);
      }
    };
    
    loadLang();
    window.addEventListener("languageChanged", loadLang);
    return () => window.removeEventListener("languageChanged", loadLang);
  }, []);

  // Set initial greeting based on language
  useEffect(() => {
    const t = botTranslations[language as keyof typeof botTranslations];
    if (messages.length === 0 || messages[0].text !== t.greeting) {
      setMessages([{ role: 'bot', text: t.greeting }]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const t = botTranslations[language as keyof typeof botTranslations] || botTranslations.en;

  // Language code mapping for speech synthesis
  const speechLangMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    kn: "kn-IN"
  };

  // Language display names
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
    bn: "বাংলা",
    kn: "ಕನ್ನಡ"
  };

  // Localized voice button labels
  const voiceLabels: Record<string, { listen: string; stop: string }> = {
    en: { listen: "Listen", stop: "Stop" },
    hi: { listen: "सुनें", stop: "रुकें" },
    mr: { listen: "ऐका", stop: "थांबा" },
    bn: { listen: "শুনুন", stop: "বন্ধ" },
    kn: { listen: "ಕೇಳಿ", stop: "ನಿಲ್ಲಿಸಿ" }
  };

  const getVoiceLabel = (isListening: boolean) => {
    const labels = voiceLabels[language] || voiceLabels.en;
    return isListening ? labels.stop : labels.listen;
  };

  const speakText = (text: string) => {
    if (!speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a voice for the specific language
    const findVoice = (langCode: string) => {
      return availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(langCode.toLowerCase())
      ) || null;
    };
    
    // Get language code from map
    const primaryLang = speechLangMap[language] || "en-US";
    const langPrefix = primaryLang.split("-")[0];
    
    // Try primary language voice
    let selectedVoice = findVoice(langPrefix);
    
    // Fallback chain: try different variants
    if (!selectedVoice) {
      // Try Hindi variants
      if (language === "hi") {
        selectedVoice = findVoice("hi") || findVoice("en") || findVoice("en-US");
      }
      // Try Marathi variants
      else if (language === "mr") {
        selectedVoice = findVoice("mr") || findVoice("hi") || findVoice("en");
      }
      // Try Bengali
      else if (language === "bn") {
        selectedVoice = findVoice("bn") || findVoice("en");
      }
      // Try Kannada
      else if (language === "kn") {
        selectedVoice = findVoice("kn") || findVoice("en");
      }
      // English fallback
      else {
        selectedVoice = findVoice("en") || findVoice("en-US");
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Use language code directly as last resort
      utterance.lang = primaryLang;
    }
    
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  let hints = t.hints;
  if (pathname?.includes("/login") || pathname?.includes("/register")) {
    hints = t.loginHints;
  } else if (pathname?.includes("/citizen")) {
    hints = t.citizenHints;
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");

    setTimeout(() => {
      let response = t.responses.default;
      
      // Basic keyword matching mapping for all languages
      // We map the hint indices or basic English keywords to the translated responses
      const engHints = botTranslations.en;
      const lower = text.toLowerCase();
      
      if (lower.includes("login") || lower.includes("sign") || lower.includes("लॉगिन") || lower.includes("लॉग इन") || lower.includes("লগইন") || lower.includes("ಲಾಗಿನ್")) {
        response = t.responses.login;
      } else if (lower.includes("register") || lower.includes("रजिस्टर") || lower.includes("नोंदणी") || lower.includes("নিবন্ধন") || lower.includes("ನೋಂದಾಯಿಸಿ") || lower.includes("ನೋಂದಣಿ")) {
        response = t.responses.register;
      } else if (lower.includes("forgot") || lower.includes("password") || lower.includes("पासवर्ड") || lower.includes("पাসওয়ার্ড") || lower.includes("ಪಾಸ್‌ವರ್ಡ್") || lower.includes("ಮರೆತಿದ್ದೇನೆ")) {
        response = t.responses.forgot;
      } else if (lower.includes("submit") || lower.includes("report") || lower.includes("दर्ज") || lower.includes("अहवाल") || lower.includes("প্রতিবেদন") || lower.includes("ವರದಿ") || lower.includes("ಸಲ್ಲಿಸಿ")) {
        response = t.responses.submit;
      } else if (lower.includes("validator") || lower.includes("सत्यापनकर्ता") || lower.includes("पडताळणीकर्ता") || lower.includes("যাচাইকারী") || lower.includes("ಮೌಲ್ಯೀಕರಿಸುವವರು")) {
        response = t.responses.validator;
      } else if (lower.includes("pin") || lower.includes("status") || lower.includes("पिन") || lower.includes("स्थिति") || lower.includes("स्थिती") || lower.includes("স্থিতি") || lower.includes("ಪಿನ್") || lower.includes("ಸ್ಥಿತಿ")) {
        response = t.responses.pin;
      } else if (lower.includes("portal") || lower.includes("पोर्टल") || lower.includes("পোর্টাল") || lower.includes("ಪೋರ್ಟಲ್")) {
        response = t.responses.portal;
      } else {
        // Find exact hint matches across all languages to route properly
        for (const lang of Object.values(botTranslations)) {
          if (lang.loginHints[0] === text) response = t.responses.forgot;
          if (lang.loginHints[1] === text) response = t.responses.portal;
          if (lang.loginHints[2] === text) response = t.responses.register;
          if (lang.citizenHints[0] === text) response = t.responses.submit;
          if (lang.citizenHints[1] === text) response = t.responses.pin;
          if (lang.citizenHints[2] === text) response = t.responses.pin;
          if (lang.hints[0] === text) response = t.responses.login;
          if (lang.hints[1] === text) response = t.responses.validator;
          if (lang.hints[2] === text) response = t.responses.portal;
        }
      }

      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      
      // Auto-speak the response
      speakText(response);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-transform transform hover:scale-105 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <div>
              <h3 className="font-semibold tracking-tight">{t.title}</h3>
              <span className="text-xs text-indigo-200">{languageNames[language] || "English"}</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                <p className="text-sm">{msg.text}</p>
                {msg.role === 'bot' && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                    className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isSpeaking ? (
                      <><VolumeX className="w-3 h-3" /> {getVoiceLabel(true)}</>
                    ) : (
                      <><Volume2 className="w-3 h-3" /> {getVoiceLabel(false)}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages[messages.length - 1]?.role === 'bot' && (
          <div className="px-4 pb-2 bg-slate-50 flex flex-wrap gap-2 shrink-0">
            {hints.map((hint, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(hint)}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors border border-indigo-100 text-left shadow-sm"
              >
                {hint}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center space-x-2 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
