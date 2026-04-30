"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Shield, Mic, Lock, CheckCircle, 
  Globe, Zap, Users, BarChart3, LayoutDashboard, 
  Award, MapPin, MessageSquare, Heart, Search, 
  Scale, FileSearch, ShieldCheck, PieChart, TrendingUp,
  Activity, Fingerprint, EyeOff, FastForward, PhoneCall, X,
  Compass, Target, Cpu, Share2, Gavel, Star
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import LanguagePicker from "@/components/LanguagePicker";
import { useLanguage } from "@/context/LanguageContext";
import GlobalFeedback from "@/components/GlobalFeedback";

const FloatingIcon = ({ Icon, className, delay = "0s", size = 48 }: any) => (
  <div 
    className={`absolute opacity-20 animate-float pointer-events-none ${className}`}
    style={{ animationDelay: delay }}
  >
    <Icon size={size} strokeWidth={1} />
  </div>
);

const TinyIconsBackground = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const icons = [Shield, Mic, Scale, Fingerprint, Gavel, FileSearch, MessageSquare, ShieldCheck, Heart, Zap, Lock, Globe, MapPin, Award, Users];
    const items = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      Icon: icons[i % icons.length],
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 14,
      delay: -(Math.random() * 12),
      size: 18 + Math.random() * 10,
      opacity: 0.08 + Math.random() * 0.12,
    }));
    setParticles(items);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes liveFloat {
          0%   { transform: translateY(0px)   translateX(0px)   rotate(0deg); }
          25%  { transform: translateY(-40px) translateX(20px)  rotate(10deg); }
          50%  { transform: translateY(-80px) translateX(-20px) rotate(-8deg); }
          75%  { transform: translateY(-40px) translateX(30px)  rotate(12deg); }
          100% { transform: translateY(0px)   translateX(0px)   rotate(0deg); }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map(({ id, Icon, top, left, duration, delay, size, opacity }) => (
          <div
            key={id}
            className="absolute text-blue-300"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              animation: `liveFloat ${duration}s ease-in-out ${delay}s infinite`,
              willChange: 'transform',
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        ))}
      </div>
    </>
  );
};


const ProcessStep = ({ step, title, desc, icon: Icon, color, onClick, badge, isLast = false }: any) => (
  <div className="relative group">
    {!isLast && (
      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent z-0" />
    )}
    <div 
      onClick={onClick}
      className={`glass glass-hover p-8 rounded-[3rem] border-${color}-500/20 hover:border-${color}-400 cursor-pointer relative z-10 space-y-6 h-full flex flex-col`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-400 group-hover:bg-${color}-500 group-hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 uppercase tracking-widest`}>
          Step {step}
        </span>
      </div>
      <div className="space-y-3 flex-1">
        <h4 className="text-xl font-black text-white italic tracking-tight uppercase">{title}</h4>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
      <div className={`flex items-center text-${color}-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-4 transition-all pt-4 border-t border-white/5`}>
        <span>{badge}</span>
        <ArrowRight className="w-3 h-3 ml-2" />
      </div>
    </div>
  </div>
);

const HERO_CONTENT: Record<string, any> = {
  en: {
    taglines: [
      "Every complaint deserves an answer.",
      "Anonymous. Accountable. Unstoppable.",
      "Give your voice the power it deserves.",
      "From silence to resolution — in hours."
    ],
    desc: "AI-powered voice reporting, biometric identity, and real-time transparency — empowering every citizen without compromising privacy.",
    btn_file: "File Complaint",
    btn_track: "Track Status",
    trackTitle: "The Justice Track",
    trackSubtitle: "A step-by-step journey from grievance to accountability",
    step1Title: "Report",
    step1Desc: "Citizen reports grievance anonymously using AI Voice technology.",
    step1Badge: "Citizen Portal",
    step2Title: "Observe",
    step2Desc: "NGOs verify grounds and add supplemental field evidence.",
    step2Badge: "NGO Support",
    step3Title: "Resolve",
    step3Desc: "Officials coordinate and finalize departmental resolution.",
    step3Badge: "Official Mission",
    step4Title: "Oversight",
    step4Desc: "Admins monitor performance and maintain system transparency.",
    step4Badge: "Admin Dashboard",
    quantumTitle: "Quantum Encryption",
    quantumDesc: "Every data node is protected by multi-layer cryptographic hashing, ensuring citizen anonymity is mathematically unbreakable.",
    visionTitle: "The JanSetu Vision",
    instTitle: "Institutional Transparency",
    instDesc: "JanSetu is more than a portal; it's a social contract digitized. We believe that technology should be the shield of the citizen and the sword of accountability.",
    digIdTitle: "Digital Identity",
    digIdDesc: "Passwordless face-recognition ensuring secure, identity-first access.",
    agileTitle: "Agile Routing",
    agileDesc: "Automatic grievance dispatching to localized administrative nodes.",
    analyticsTitle: "Deep Analytics",
    analyticsDesc: "Predictive trend analysis to identify regional issue patterns.",
    ngoIncTitle: "NGO Inclusion",
    ngoIncDesc: "Verified organizations acting as observers for community trust.",
    impactTitle: "Social Impact",
    impactSubtitle: "Documenting the shift in governance",
    livesImpacted: "Lives Impacted",
    avgRes: "Avg. Resolution",
    partnerNgos: "Partner NGOs",
    footerDesc: "The futuristic bridge for digital governance and social accountability.",
    archTitle: "Architecture",
    arch1: "Neural Nodes",
    arch2: "Quantum Security",
    arch3: "Agile Pipeline",
    transTitle: "Transparency",
    trans1: "Public Audit",
    trans2: "NGO Logs",
    trans3: "Trust Index",
    supportTitle: "Support",
    support1: "1800-JAN-SETU",
    support2: "Emergency Node",
    support3: "Technical Hub",
    footerBottom: "JanSetu v3.0 • Institutional Infrastructure • 2026",
    supportHubTitle: "Institutional Support",
    emergencyControl: "Emergency Mission Control",
    nodeSupport: "Digital Node Support",
    connectBtn: "Connect to Node",
    stat1: "Platform Nodes",
    stat2: "Uptime",
    stat3: "Avg. Resolution",
    stat4: "Trust Index",
  },
  hi: {
    taglines: [
      "हर शिकायत का जवाब मिलना चाहिए।",
      "गुमनाम। जवाबदेह। अजेय।",
      "अपनी आवाज़ को वह शक्ति दें जिसकी वह हकदार है।",
      "मौन से समाधान तक — कुछ ही घंटों में।"
    ],
    desc: "एआई-संचालित वॉयस रिपोर्टिंग, बायोमेट्रिक पहचान, और रीयल-टाइम पारदर्शिता - निजता से समझौता किए बिना हर नागरिक को सशक्त बनाना।",
    btn_file: "शिकायत दर्ज करें",
    btn_track: "स्थिति ट्रैक करें",
    trackTitle: "न्याय मार्ग",
    trackSubtitle: "शिकायत से जवाबदेही तक की एक कदम-दर-कदम यात्रा",
    step1Title: "रिपोर्ट करें",
    step1Desc: "नागरिक एआई वॉयस तकनीक का उपयोग करके गुमनाम रूप से शिकायत रिपोर्ट करते हैं।",
    step1Badge: "नागरिक पोर्टल",
    step2Title: "अवलोकन करें",
    step2Desc: "एनजीओ आधार की पुष्टि करते हैं और पूरक क्षेत्रीय साक्ष्य जोड़ते हैं।",
    step2Badge: "एनजीओ सहायता",
    step3Title: "समाधान करें",
    step3Desc: "अधिकारी समन्वय करते हैं और विभागीय समाधान को अंतिम रूप देते हैं।",
    step3Badge: "आधिकारिक मिशन",
    step4Title: "निगरानी",
    step4Desc: "एडमिन प्रदर्शन की निगरानी करते हैं और सिस्टम पारदर्शिता बनाए रखते हैं।",
    step4Badge: "एडमिन डैशबोर्ड",
    quantumTitle: "क्वांटम एन्क्रिप्शन",
    quantumDesc: "प्रत्येक डेटा नोड बहु-स्तरीय क्रिप्टोग्राफिक हैशिंग द्वारा संरक्षित है, यह सुनिश्चित करते हुए कि नागरिक की गुमनामी गणितीय रूप से अटूट है।",
    visionTitle: "जनसेतु दृष्टि",
    instTitle: "संस्थागत पारदर्शिता",
    instDesc: "जनसेतु सिर्फ एक पोर्टल से कहीं ज़्यादा है; यह एक सामाजिक अनुबंध है जिसे डिजिटल किया गया है। हम मानते हैं कि तकनीक नागरिक की ढाल और जवाबदेही की तलवार होनी चाहिए।",
    digIdTitle: "डिजिटल पहचान",
    digIdDesc: "पासवर्ड रहित चेहरा-पहचान सुरक्षित, पहचान-प्रथम पहुंच सुनिश्चित करती है।",
    agileTitle: "फुर्तीला रूटिंग",
    agileDesc: "स्थानीयकृत प्रशासनिक नोड्स को शिकायतों का स्वचालित प्रेषण।",
    analyticsTitle: "गहन विश्लेषण",
    analyticsDesc: "क्षेत्रीय समस्या पैटर्न की पहचान करने के लिए भविष्य कहनेवाला प्रवृत्ति विश्लेषण।",
    ngoIncTitle: "एनजीओ समावेशन",
    ngoIncDesc: "सामुदायिक विश्वास के लिए पर्यवेक्षकों के रूप में कार्य करने वाले सत्यापित संगठन।",
    impactTitle: "सामाजिक प्रभाव",
    impactSubtitle: "शासन में बदलाव का दस्तावेजीकरण",
    livesImpacted: "प्रभावित जीवन",
    avgRes: "औसत समाधान",
    partnerNgos: "भागीदार एनजीओ",
    footerDesc: "डिजिटल शासन और सामाजिक जवाबदेही के लिए भविष्य का सेतु।",
    archTitle: "वास्तुकला",
    arch1: "न्यूरल नोड्स",
    arch2: "क्वांटम सुरक्षा",
    arch3: "फुर्तीली पाइपलाइन",
    transTitle: "पारदर्शिता",
    trans1: "सार्वजनिक ऑडिट",
    trans2: "एनजीओ लॉग",
    trans3: "विश्वास सूचकांक",
    supportTitle: "समर्थन",
    support1: "1800-जन-सेतु",
    support2: "आपातकालीन नोड",
    support3: "तकनीकी हब",
    footerBottom: "जनसेतु v3.0 • संस्थागत अवसंरचना • 2026",
    supportHubTitle: "संस्थागत समर्थन",
    emergencyControl: "आपातकालीन मिशन नियंत्रण",
    nodeSupport: "डिजिटल नोड समर्थन",
    connectBtn: "नोड से कनेक्ट करें",
    stat1: "प्लेटफ़ॉर्म नोड्स",
    stat2: "अपटाइम",
    stat3: "औसत समाधान",
    stat4: "विश्वास सूचकांक",
  },
  kn: {
    taglines: [
      "ಪ್ರತಿಯೊಂದು ದೂರಿಗೂ ಉತ್ತರವಿದೆ.",
      "ಅನಾಮಧೇಯ. ಜವಾಬ್ದಾರಿಯುತ. ಅಜೇಯ.",
      "ನಿಮ್ಮ ಧ್ವನಿಗೆ ಅರ್ಹವಾದ ಶಕ್ತಿಯನ್ನು ನೀಡಿ.",
      "ಮೌನದಿಂದ ಪರಿಹಾರದವರೆಗೆ — ಕೆಲವೇ ಗಂಟೆಗಳಲ್ಲಿ."
    ],
    desc: "ಎಐ-ಚಾಲಿತ ಧ್ವನಿ ವರದಿ, ಬಯೋಮೆಟ್ರಿಕ್ ಗುರುತು ಮತ್ತು ನೈಜ-ಸಮಯದ ಪಾರದರ್ಶಕತೆ — ಗೌಪ್ಯತೆಗೆ ಧಕ್ಕೆಯಾಗದಂತೆ ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕನನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.",
    btn_file: "ದೂರು ನೀಡಿ",
    btn_track: "ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    trackTitle: "ನ್ಯಾಯದ ಹಾದಿ",
    trackSubtitle: "ಕುಂದುಕೊರತೆಯಿಂದ ಹೊಣೆಗಾರಿಕೆಯವರೆಗಿನ ಒಂದು ಹಂತ-ಹಂತದ ಪ್ರಯಾಣ",
    step1Title: "ವರದಿ ಮಾಡಿ",
    step1Desc: "AI ಧ್ವನಿ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಿಕೊಂಡು ನಾಗರಿಕರು ಅನಾಮಧೇಯವಾಗಿ ಕುಂದುಕೊರತೆಗಳನ್ನು ವರದಿ ಮಾಡುತ್ತಾರೆ.",
    step1Badge: "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
    step2Title: "ಗಮನಿಸಿ",
    step2Desc: "NGO ಗಳು ಆಧಾರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತವೆ ಮತ್ತು ಪೂರಕ ಕ್ಷೇತ್ರ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಸೇರಿಸುತ್ತವೆ.",
    step2Badge: "NGO ಬೆಂಬಲ",
    step3Title: "ಪರಿಹರಿಸಿ",
    step3Desc: "ಅಧಿಕಾರಿಗಳು ಸಮನ್ವಯಗೊಳಿಸುತ್ತಾರೆ ಮತ್ತು ಇಲಾಖಾ ನಿರ್ಣಯವನ್ನು ಅಂತಿಮಗೊಳಿಸುತ್ತಾರೆ.",
    step3Badge: "ಅಧಿಕೃತ ಮಿಷನ್",
    step4Title: "ಮೇಲ್ವಿಚಾರಣೆ",
    step4Desc: "ನಿರ್ವಾಹಕರು ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಾರೆ ಮತ್ತು ಸಿಸ್ಟಮ್ ಪಾರದರ್ಶಕತೆಯನ್ನು ನಿರ್ವಹಿಸುತ್ತಾರೆ.",
    step4Badge: "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    quantumTitle: "ಕ್ವಾಂಟಮ್ ಎನ್‌ಕ್ರಿಪ್ಷನ್",
    quantumDesc: "ಪ್ರತಿಯೊಂದು ಡೇಟಾ ನೋಡ್ ಬಹು-ಪದರದ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಹ್ಯಾಶಿಂಗ್‌ನಿಂದ ರಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ, ನಾಗರಿಕರ ಅನಾಮಧೇಯತೆ ಗಣಿತೀಯವಾಗಿ ಮುರಿಯಲಾಗದು ಎಂದು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    visionTitle: "ಜನಸೇತು ದೃಷ್ಟಿ",
    instTitle: "ಸಾಂಸ್ಥಿಕ ಪಾರದರ್ಶಕತೆ",
    instDesc: "ಜನಸೇತು ಕೇವಲ ಒಂದು ಪೋರ್ಟಲ್ ಮಾತ್ರವಲ್ಲ; ಇದು ಡಿಜಿಟಲೀಕರಣಗೊಂಡ ಸಾಮಾಜಿಕ ಒಪ್ಪಂದವಾಗಿದೆ. ತಂತ್ರಜ್ಞಾನವು ನಾಗರಿಕರ ಗುರಾಣಿ ಮತ್ತು ಹೊಣೆಗಾರಿಕೆಯ ಕತ್ತಿ ಆಗಿರಬೇಕು ಎಂದು ನಾವು ನಂಬುತ್ತೇವೆ.",
    digIdTitle: "ಡಿಜಿಟಲ್ ಗುರುತು",
    digIdDesc: "ಪಾಸ್‌ವರ್ಡ್‌ರಹಿತ ಮುಖ ಗುರುತಿಸುವಿಕೆ ಸುರಕ್ಷಿತ, ಗುರುತು-ಮೊದಲು ಪ್ರವೇಶವನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ.",
    agileTitle: "ಅಗೈಲ್ ರೂಟಿಂಗ್",
    agileDesc: "ಸ್ಥಳೀಕರಿಸಿದ ಆಡಳಿತಾತ್ಮಕ ನೋಡ್‌ಗಳಿಗೆ ಕುಂದುಕೊರತೆಗಳ ಸ್ವಯಂಚಾಲಿತ ರವಾನೆ.",
    analyticsTitle: "ಡೀಪ್ ಅನಾಲಿಟಿಕ್ಸ್",
    analyticsDesc: "ಪ್ರಾದೇಶಿಕ ಸಮಸ್ಯೆ ಮಾದರಿಗಳನ್ನು ಗುರುತಿಸಲು ಭವಿಷ್ಯಸೂಚಕ ಪ್ರವೃತ್ತಿ ವಿಶ್ಲೇಷಣೆ.",
    ngoIncTitle: "NGO ಸೇರ್ಪಡೆ",
    ngoIncDesc: "ಸಮುದಾಯದ ವಿಶ್ವಾಸಕ್ಕಾಗಿ ವೀಕ್ಷಕರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಪರಿಶೀಲಿಸಿದ ಸಂಸ್ಥೆಗಳು.",
    impactTitle: "ಸಾಮಾಜಿಕ ಪರಿಣಾಮ",
    impactSubtitle: "ಆಡಳಿತದಲ್ಲಿನ ಬದಲಾವಣೆಯನ್ನು ದಾಖಲಿಸುವುದು",
    livesImpacted: "ಪ್ರಭಾವಿತ ಜೀವನಗಳು",
    avgRes: "ಸರಾಸರಿ ಪರಿಹಾರ",
    partnerNgos: "ಪಾಲುದಾರ NGO ಗಳು",
    footerDesc: "ಡಿಜಿಟಲ್ ಆಡಳಿತ ಮತ್ತು ಸಾಮಾಜಿಕ ಹೊಣೆಗಾರಿಕೆಗಾಗಿ ಭವಿಷ್ಯದ ಸೇತುವೆ.",
    archTitle: "ವಾಸ್ತುಶಿಲ್ಪ",
    arch1: "ನರ ನೋಡ್‌ಗಳು",
    arch2: "ಕ್ವಾಂಟಮ್ ಭದ್ರತೆ",
    arch3: "ಅಗೈಲ್ ಪೈಪ್‌ಲೈನ್",
    transTitle: "ಪಾರದರ್ಶಕತೆ",
    trans1: "ಸಾರ್ವಜನಿಕ ಲೆಕ್ಕಪರಿಶೋಧನೆ",
    trans2: "NGO ಲಾಗ್‌ಗಳು",
    trans3: "ವಿಶ್ವಾಸ ಸೂಚ್ಯಂಕ",
    supportTitle: "ಬೆಂಬಲ",
    support1: "1800-JAN-SETU",
    support2: "ತುರ್ತು ನೋಡ್",
    support3: "ತಾಂತ್ರಿಕ ಹಬ್",
    footerBottom: "ಜನಸೇತು v3.0 • ಸಾಂಸ್ಥಿಕ ಮೂಲಸೌಕರ್ಯ • 2026",
    supportHubTitle: "ಸಾಂಸ್ಥಿಕ ಬೆಂಬಲ",
    emergencyControl: "ತುರ್ತು ಮಿಷನ್ ನಿಯಂತ್ರಣ",
    nodeSupport: "ಡಿಜಿಟಲ್ ನೋಡ್ ಬೆಂಬಲ",
    connectBtn: "ನೋಡ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ",
    stat1: "ವೇದಿಕೆ ನೋಡ್‌ಗಳು",
    stat2: "ಕಾರ್ಯಾವಧಿ",
    stat3: "ಸರಾಸರಿ ಪರಿಹಾರ",
    stat4: "ವಿಶ್ವಾಸ ಸೂಚ್ಯಂಕ",
  },
  mr: {
    taglines: [
      "प्रत्येक तक्रारीचे उत्तर मिळायला हवे.",
      "निनावी. जबाबदार. अजिंक्य.",
      "तुमच्या आवाजाला हवी ती ताकद द्या.",
      "शांततेपासून निराकरणापर्यंत — काही तासांत."
    ],
    desc: "एआय-समर्थित व्हॉइस रिपोर्टिंग, बायोमेट्रिक ओळख आणि रिअल-टाइम पारदर्शकता — गोपनीयतेशी तडजोड न करता प्रत्येक नागरिकाला सक्षम करणे.",
    btn_file: "तक्रार नोंदवा",
    btn_track: "स्थिती ट्रॅक करा",
    trackTitle: "न्याय मार्ग",
    trackSubtitle: "तक्रारीपासून जबाबदारीपर्यंतचा एक टप्प्याटप्प्याचा प्रवास",
    step1Title: "तक्रार नोंदवा",
    step1Desc: "नागरिक एआय व्हॉईस तंत्रज्ञानाचा वापर करून अनामिकपणे तक्रार नोंदवतात.",
    step1Badge: "नागरिक पोर्टल",
    step2Title: "निरीक्षण करा",
    step2Desc: "स्वयंसेवी संस्था (एनजीओ) आधार तपासतात आणि पूरक क्षेत्रीय पुरावे जोडतात.",
    step2Badge: "स्वयंसेवी संस्था (एनजीओ) समर्थन",
    step3Title: "निराकरण करा",
    step3Desc: "अधिकारी समन्वय साधतात आणि विभागीय निराकरण अंतिम करतात.",
    step3Badge: "अधिकृत मोहीम",
    step4Title: "पर्यवेक्षण",
    step4Desc: "प्रशासक कार्यप्रदर्शनाचे निरीक्षण करतात आणि प्रणालीची पारदर्शकता राखतात.",
    step4Badge: "प्रशासक डॅशबोर्ड",
    quantumTitle: "क्वांटम एन्क्रिप्शन",
    quantumDesc: "प्रत्येक डेटा नोड बहु-स्तरीय क्रिप्टोग्राफिक हॅशिंगद्वारे संरक्षित आहे, ज्यामुळे नागरिकांची अनामिकता गणितीयदृष्ट्या अभेद्य राहते.",
    visionTitle: "जनसेतू दृष्टी",
    instTitle: "संस्थात्मक पारदर्शकता",
    instDesc: "जनसेतू केवळ एक पोर्टल नाही; तो एक डिजिटाइज्ड सामाजिक करार आहे. तंत्रज्ञान हे नागरिकांचे ढाल आणि जबाबदारीची तलवार असावे असे आमचे मत आहे.",
    digIdTitle: "डिजिटल ओळख",
    digIdDesc: "पासवर्डलेस चेहरा-ओळख सुरक्षित, ओळख-प्रथम प्रवेश सुनिश्चित करते.",
    agileTitle: "एजाइल रूटिंग",
    agileDesc: "स्थानिक प्रशासकीय नोड्सना तक्रारींचे स्वयंचलित वितरण.",
    analyticsTitle: "सखोल विश्लेषण",
    analyticsDesc: "प्रादेशिक समस्यांचे नमुने ओळखण्यासाठी भविष्यसूचक प्रवृत्ती विश्लेषण.",
    ngoIncTitle: "स्वयंसेवी संस्था (एनजीओ) समावेश",
    ngoIncDesc: "सामुदायिक विश्वासासाठी निरीक्षकाची भूमिका बजावणारे सत्यापित संस्था.",
    impactTitle: "सामाजिक परिणाम",
    impactSubtitle: "शासनातील बदलांचे दस्तऐवजीकरण",
    livesImpacted: "प्रभावित जीवन",
    avgRes: "सरासरी निराकरण",
    partnerNgos: "भागीदार स्वयंसेवी संस्था (एनजीओ)",
    footerDesc: "डिजिटल प्रशासन आणि सामाजिक जबाबदारीसाठी भविष्यातील पूल.",
    archTitle: "वास्तुकला",
    arch1: "न्यूरल नोड्स",
    arch2: "क्वांटम सुरक्षा",
    arch3: "एजाइल पाइपलाइन",
    transTitle: "पारदर्शकता",
    trans1: "सार्वजनिक लेखापरीक्षण",
    trans2: "स्वयंसेवी संस्था (एनजीओ) नोंदी",
    trans3: "विश्वास निर्देशांक",
    supportTitle: "समर्थन",
    support1: "1800-जन-सेतू",
    support2: "आपत्कालीन नोड",
    support3: "तांत्रिक हब",
    footerBottom: "जनसेतू v3.0 • संस्थात्मक पायाभूत सुविधा • 2026",
    supportHubTitle: "संस्थात्मक समर्थन",
    emergencyControl: "आपत्कालीन मोहीम नियंत्रण",
    nodeSupport: "डिजिटल नोड समर्थन",
    connectBtn: "नोडशी कनेक्ट करा",
    stat1: "प्लॅटफॉर्म नोड्स",
    stat2: "अपटाइम",
    stat3: "सरासरी निराकरण",
    stat4: "विश्वास निर्देशांक",
  },
  te: {
    taglines: [
      "ప్రతి ఫిర్యాదుకు ఒక సమాధానం దక్కాలి.",
      "అజ్ఞాతం. జవాబుదారీతనం. అజేయం.",
      "మీ గొంతుకు దక్కాల్సిన శక్తిని ఇవ్వండి.",
      "నిశ్శబ్దం నుండి పరిష్కారం వరకు — కొన్ని గంటల్లో."
    ],
    desc: "ఏఐ-ఆధారిత వాయిస్ రిపోర్టింగ్, బయోమెట్రిక్ గుర్తింపు మరియు రియల్-టైమ్ పారదర్శకత — గోప్యతకు భంగం కలగకుండా ప్రతి పౌరుడిని సాధికారపరచడం.",
    btn_file: "ఫిర్యాదు చేయండి",
    btn_track: "స్థితిని ట్రాక్ చేయండి",
    trackTitle: "న్యాయ మార్గం",
    trackSubtitle: "ఫిర్యాదు నుండి జవాబుదారీతనం వరకు ఒక అంచలంచల ప్రయాణం",
    step1Title: "నివేదించండి",
    step1Desc: "AI వాయిస్ సాంకేతికతను ఉపయోగించి పౌరులు అనామధేయంగా ఫిర్యాదులను నివేదిస్తారు.",
    step1Badge: "పౌర పోర్టల్",
    step2Title: "గమనించండి",
    step2Desc: "NGOలు ఆధారాలను ధృవీకరించి, అదనపు క్షేత్ర సాక్ష్యాలను జోడిస్తాయి.",
    step2Badge: "NGO మద్దతు",
    step3Title: "పరిష్కరించండి",
    step3Desc: "అధికారులు సమన్వయం చేసి, డిపార్ట్‌మెంటల్ తీర్మానాన్ని ఖరారు చేస్తారు.",
    step3Badge: "అధికారిక మిషన్",
    step4Title: "పర్యవేక్షణ",
    step4Desc: "నిర్వాహకులు పనితీరును పర్యవేక్షిస్తారు మరియు సిస్టమ్ పారదర్శకతను నిర్వహిస్తారు.",
    step4Badge: "అడ్మిన్ డాష్‌బోర్డ్",
    quantumTitle: "క్వాంటమ్ ఎన్‌క్రిప్షన్",
    quantumDesc: "ప్రతి డేటా నోడ్ బహుళ-పొరల క్రిప్టోగ్రాఫిక్ హాషింగ్ ద్వారా రక్షించబడుతుంది, పౌరుడి అనామధేయత గణితపరంగా అభేద్యంగా ఉంటుందని నిర్ధారిస్తుంది.",
    visionTitle: "జనసేతు దార్శనికత",
    instTitle: "సంస్థాగత పారదర్శకత",
    instDesc: "జనసేతు కేవలం ఒక పోర్టల్ కంటే ఎక్కువ; ఇది డిజిటలైజ్ చేయబడిన సామాజిక ఒప్పందం. సాంకేతికత పౌరుడికి కవచం మరియు జవాబుదారీతనానికి కత్తిగా ఉండాలని మేము నమ్ముతాము.",
    digIdTitle: "డిజిటల్ గుర్తింపు",
    digIdDesc: "పాస్‌వర్డ్‌లేని ముఖ గుర్తింపు, సురక్షితమైన, గుర్తింపు-మొదట యాక్సెస్‌ను నిర్ధారిస్తుంది.",
    agileTitle: "చురుకైన రూటింగ్",
    agileDesc: "స్థానికీకరించిన పరిపాలనా నోడ్‌లకు ఫిర్యాదులను స్వయంచాలకంగా పంపడం.",
    analyticsTitle: "డీప్ అనాలిటిక్స్",
    analyticsDesc: "ప్రాంతీయ సమస్య నమూనాలను గుర్తించడానికి ప్రిడిక్టివ్ ట్రెండ్ విశ్లేషణ.",
    ngoIncTitle: "NGO చేరిక",
    ngoIncDesc: "కమ్యూనిటీ నమ్మకం కోసం పరిశీలకులుగా పనిచేసే ధృవీకరించబడిన సంస్థలు.",
    impactTitle: "సామాజిక ప్రభావం",
    impactSubtitle: "పాలనలో మార్పును నమోదు చేయడం",
    livesImpacted: "ప్రభావిత జీవితాలు",
    avgRes: "సగటు పరిష్కారం",
    partnerNgos: "భాగస్వామ్య NGOలు",
    footerDesc: "డిజిటల్ పాలన మరియు సామాజిక జవాబుదారీతనం కోసం భవిష్యత్తు వారధి.",
    archTitle: "నిర్మాణం",
    arch1: "న్యూరల్ నోడ్‌లు",
    arch2: "క్వాంటమ్ భద్రత",
    arch3: "చురుకైన పైప్‌లైన్",
    transTitle: "పారదర్శకత",
    trans1: "ప్రజా ఆడిట్",
    trans2: "NGO లాగ్‌లు",
    trans3: "నమ్మక సూచిక",
    supportTitle: "మద్దతు",
    support1: "1800-JAN-SETU",
    support2: "అత్యవసర నోడ్",
    support3: "సాంకేతిక హబ్",
    footerBottom: "జనసేతు v3.0 • సంస్థాగత మౌలిక సదుపాయాలు • 2026",
    supportHubTitle: "సంస్థాగత మద్దతు",
    emergencyControl: "అత్యవసర మిషన్ నియంత్రణ",
    nodeSupport: "డిజిటల్ నోడ్ మద్దతు",
    connectBtn: "నోడ్‌కు కనెక్ట్ చేయండి",
    stat1: "ప్లాట్‌ఫారమ్ నోడ్‌లు",
    stat2: "అప్‌టైమ్",
    stat3: "సగటు పరిష్కారం",
    stat4: "నమ్మక సూచిక",
  },
};

export default function LandingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const content = HERO_CONTENT[language] || HERO_CONTENT.en;
  
  const [stats, setStats] = useState({ total: 1580, resolved: 1240, users: 9200 });
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([]);
  const [showHelpline, setShowHelpline] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [tagline, setTagline] = useState("");
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [trackVisible, setTrackVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  const useReveal = (setter: (v: boolean) => void) => {
    const ref = { current: null as HTMLElement | null };
    useEffect(() => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, { threshold: 0.15 });
      obs.observe(ref.current);
      return () => obs.disconnect();
    }, []);
    return ref;
  };

  const statsRef = useReveal(setStatsVisible);
  const trackRef = useReveal(setTrackVisible);
  const infoRef = useReveal(setInfoVisible);

  useEffect(() => { 
    const timer = setTimeout(() => {
      setAppLoading(false);
      setVisible(true);
    }, 2500);
    fetchRecentFeedbacks();
    return () => clearTimeout(timer);
  }, []);

  const fetchRecentFeedbacks = async () => {
    try {
      const res = await apiFetch("/feedback");
      if (res.ok) {
        const data = await res.json();
        setRecentFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const currentTaglines = content.taglines;
    const full = currentTaglines[taglineIdx % currentTaglines.length];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < full.length) {
      timer = setTimeout(() => { setTagline(full.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 45);
    } else if (!deleting && charIdx === full.length) {
      timer = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIdx > 0) {
      timer = setTimeout(() => { setTagline(full.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 25);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTaglineIdx(i => (i + 1) % currentTaglines.length);
    }
    return () => clearTimeout(timer);
  }, [tagline, charIdx, deleting, taglineIdx, content.taglines]);

  return (
    <div className="relative min-h-screen selection:bg-blue-500/30 overflow-x-hidden font-sans" style={{ background: '#040d1a' }}>
      
      {/* PRELOADER */}
      {appLoading && (
        <div className="fixed inset-0 z-[10000] bg-[#040d1a] flex flex-col items-center justify-center space-y-8 animate-out fade-out duration-1000 fill-mode-forwards" style={{ animationDelay: '2s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
            <img 
              src="/jansetu-brand.png" 
              alt="JanSetu Loading" 
              className="w-[500px] h-auto relative z-10 animate-in zoom-in-90 duration-1000 mix-blend-screen drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" 
              style={{
                maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)'
              }}
            />
          </div>
          <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 animate-loading-bar shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] animate-pulse">Initializing Digital Governance</p>
        </div>
      )}
      {/* Top right language picker */}
      <div className="absolute top-6 right-6 z-[9999] pointer-events-auto">
        <LanguagePicker placement="bottom" />
      </div>

      {/* Deep Navy Mesh Background */}
      <div className="fixed inset-0 z-0" style={{
        background: 'radial-gradient(ellipse at 20% 30%, rgba(6,30,80,0.9) 0%, #040d1a 60%), radial-gradient(ellipse at 80% 80%, rgba(0,60,100,0.5) 0%, transparent 50%)'
      }} />

      {/* Flowing Wave Animations - matching reference */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%', right: '-10%', height: '180px',
          background: 'linear-gradient(90deg, transparent, rgba(0,200,180,0.08), rgba(59,130,246,0.12), rgba(0,200,180,0.08), transparent)',
          borderRadius: '50%', filter: 'blur(30px)',
          animation: 'waveMove 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-20%', right: '-20%', height: '100px',
          background: 'linear-gradient(90deg, transparent, rgba(0,220,200,0.05), rgba(99,102,241,0.1), rgba(0,220,200,0.05), transparent)',
          borderRadius: '50%', filter: 'blur(20px)',
          animation: 'waveMove 12s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Tiny Icons Particle Field */}
      <TinyIconsBackground />

      {/* Global Floating Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingIcon Icon={Globe} className="top-[5%] left-[10%] text-blue-400" delay="0s" size={72} />
        <FloatingIcon Icon={Cpu} className="bottom-[15%] left-[5%] text-cyan-400" delay="1s" size={60} />
        <FloatingIcon Icon={Share2} className="top-[25%] right-[8%] text-indigo-400" delay="2s" size={64} />
        <FloatingIcon Icon={Target} className="bottom-[10%] right-[12%] text-blue-300" delay="3s" size={80} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 space-y-48 pb-40">

        {/* HERO */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', position: 'relative',
          padding: '80px 24px 120px', overflow: 'hidden', gap: '0',
        }}>
          {/* Center radial glow */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,80,180,0.2) 0%, rgba(6,50,120,0.08) 40%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none',
          }} />

          {/* Brand Identity — blends into dark background naturally */}
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)',
            transition: 'all 1.2s cubic-bezier(0.34,1.2,0.64,1) 0.1s',
            position: 'relative', zIndex: 2,
            marginBottom: '0px',
            pointerEvents: 'none',
          }}>
            {/* Soft glow bloom behind image */}
            <div style={{
              position: 'absolute', inset: '-40px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 65%)',
              filter: 'blur(30px)', pointerEvents: 'none', animation: 'logoPulse 4s ease-in-out infinite',
            }} />
            <img
              src="/jansetu-brand.png"
              alt="JanSetu — Bridging People With Justice"
              style={{
                width: 'clamp(320px, 60vw, 720px)',
                height: 'auto',
                display: 'block',
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.35)) drop-shadow(0 0 80px rgba(99,102,241,0.2))',
                position: 'relative',
                maskImage: 'radial-gradient(ellipse 65% 60% at 50% 50%, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 65% 60% at 50% 50%, black 40%, transparent 100%)',
              }}
            />
          </div>

          {/* Typewriter */}
          <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', position: 'relative', zIndex: 2, opacity: visible ? 1 : 0, transition: 'all 1s ease 0.7s' }}>
            <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', fontWeight: 500, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>
              {tagline}<span style={{ display: 'inline-block', width: 2, height: '1em', background: '#22d3ee', marginLeft: 4, verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
            </p>
          </div>

          {/* Description */}
          <p style={{ fontSize: '14px', color: 'rgba(147,197,253,0.4)', maxWidth: 480, lineHeight: 1.9, margin: '8px auto 0', fontFamily: 'var(--font-inter)', fontWeight: 400, opacity: visible ? 1 : 0, transition: 'all 1s ease 0.9s', position: 'relative', zIndex: 2 }}>
            {content.desc}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '36px', position: 'relative', zIndex: 2, opacity: visible ? 1 : 0, transition: 'all 1s ease 1.1s' }}>
            {/* File Complaint — primary glass */}
            <button
              onClick={() => router.push('/citizen')}
              style={{
                padding: '22px 68px',
                borderRadius: '999px',
                border: '1px solid rgba(99,102,241,0.6)',
                cursor: 'pointer',
                background: 'rgba(79,70,229,0.18)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#e0e7ff',
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-jakarta)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.32)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(129,140,248,0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(79,70,229,0.18)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
              }}
            >
              🗂&nbsp; {content.btn_file}
            </button>

            {/* Track Status — secondary glass */}
            <button
              onClick={() => router.push('/citizen')}
              style={{
                padding: '22px 68px',
                borderRadius: '999px',
                border: '1px solid rgba(34,211,238,0.35)',
                cursor: 'pointer',
                background: 'rgba(6,182,212,0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#a5f3fc',
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-jakarta)',
                boxShadow: '0 8px 32px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(6,182,212,0.22)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(6,182,212,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)';
              }}
            >
              🔍&nbsp; {content.btn_track}
            </button>
          </div>

          {/* Stats */}
          <div ref={statsRef as any} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '14px', width: '100%', maxWidth: 680, marginTop: '48px', position: 'relative', zIndex: 2 }}>
            {[
              { label: content.stat1, val: '124+', color: '#60a5fa' },
              { label: content.stat2, val: '99.9%', color: '#34d399' },
              { label: content.stat3, val: '24h', color: '#a78bfa' },
              { label: content.stat4, val: 'AAA', color: '#06b6d4' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', borderRadius: '18px', padding: '16px 10px', background: 'rgba(6,20,60,0.55)', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(10px)', opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ${i * 0.1}s, transform 0.6s ${i * 0.1}s` }}>
                <p style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(147,197,253,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: '0 0 6px' }}>{s.label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, margin: 0, fontFamily: 'var(--font-jakarta)', lineHeight: 1 }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* SVG Wave Lines — signature bottom element */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            <svg viewBox="0 0 1440 130" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '130px' }}>
              <path d="M0,70 C240,20 480,120 720,70 C960,20 1200,120 1440,70" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1.5" style={{ animation: 'wavePath 8s ease-in-out infinite' }} />
              <path d="M0,90 C200,40 440,140 720,90 C1000,40 1240,140 1440,90" fill="none" stroke="rgba(52,211,153,0.18)" strokeWidth="1.5" style={{ animation: 'wavePath 11s ease-in-out 1s infinite reverse' }} />
              <path d="M0,50 C300,100 600,10 900,60 C1100,90 1300,30 1440,55" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1" style={{ animation: 'wavePath 9s ease-in-out 0.5s infinite' }} />
              <path d="M0,110 C180,70 360,130 540,100 C720,70 900,130 1080,90 C1200,65 1350,110 1440,85" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="2" style={{ animation: 'wavePath 7s ease-in-out 2s infinite reverse' }} />
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to top, #040d1a, transparent)' }} />
          </div>
        </section>



        {/* STEP-WISE PROCESS TRACK */}


        <section ref={trackRef as any} className="space-y-20 relative">
          <div
            className="text-center space-y-4 max-w-2xl mx-auto transition-all duration-700"
            style={{ opacity: trackVisible ? 1 : 0, transform: trackVisible ? 'translateY(0)' : 'translateY(50px)' }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: 'var(--font-jakarta)' }}>{content.trackTitle}</h2>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-[10px]">{content.trackSubtitle}</p>
          </div>

          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-[60%] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 z-0 animate-pulse" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <ProcessStep 
              step={1} 
              title={content.step1Title} 
              desc={content.step1Desc} 
              icon={Mic} 
              color="blue"
              onClick={() => router.push("/citizen/login")}
              badge={content.step1Badge}
            />
            <ProcessStep 
              step={2} 
              title={content.step2Title} 
              desc={content.step2Desc} 
              icon={Award} 
              color="indigo"
              onClick={() => router.push("/ngo/login")}
              badge={content.step2Badge}
            />
            <ProcessStep 
              step={3} 
              title={content.step3Title} 
              desc={content.step3Desc} 
              icon={Shield} 
              color="cyan"
              onClick={() => router.push("/official/login")}
              badge={content.step3Badge}
            />
            <ProcessStep 
              step={4} 
              title={content.step4Title} 
              desc={content.step4Desc} 
              icon={LayoutDashboard} 
              color="blue"
              onClick={() => router.push("/admin/login")}
              badge={content.step4Badge}
              isLast={true}
            />
          </div>
        </section>

        {/* PLATFORM ARCHITECTURE - Detailed Info */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 blur-[150px] animate-pulse-glow" />
              <div className="glass aspect-square rounded-[5rem] overflow-hidden p-12 relative flex items-center justify-center">
                 <ShieldCheck size={280} className="text-blue-400/20 animate-float" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent" />
                 <div className="absolute bottom-12 left-12 right-12 space-y-4">
                    <div className="glass p-6 rounded-3xl border-blue-500/30">
                       <h5 className="text-lg font-black text-white italic mb-2 tracking-tight uppercase">{content.quantumTitle}</h5>
                       <p className="text-[10px] text-blue-200/60 font-medium leading-relaxed">{content.quantumDesc}</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
                  <Compass className="w-4 h-4" />
                  <span>{content.visionTitle}</span>
                </div>
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none" dangerouslySetInnerHTML={{ __html: content.instTitle.replace(" ", " <br /> ") }}></h2>
                <p className="text-blue-100/40 text-lg font-medium leading-relaxed">{content.instDesc}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                   <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><Fingerprint size={20} /></div>
                   <h5 className="text-sm font-bold text-white tracking-tight uppercase italic">{content.digIdTitle}</h5>
                   <p className="text-[11px] text-slate-500 font-medium">{content.digIdDesc}</p>
                </div>
                <div className="space-y-3 group">
                   <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all"><FastForward size={20} /></div>
                   <h5 className="text-sm font-bold text-white tracking-tight uppercase italic">{content.agileTitle}</h5>
                   <p className="text-[11px] text-slate-500 font-medium">{content.agileDesc}</p>
                </div>
                <div className="space-y-3 group">
                   <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><BarChart3 size={20} /></div>
                   <h5 className="text-sm font-bold text-white tracking-tight uppercase italic">{content.analyticsTitle}</h5>
                   <p className="text-[11px] text-slate-500 font-medium">{content.analyticsDesc}</p>
                </div>
                <div className="space-y-3 group">
                   <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-blue-300 group-hover:bg-blue-300 group-hover:text-white transition-all"><Users size={20} /></div>
                   <h5 className="text-sm font-bold text-white tracking-tight uppercase italic">{content.ngoIncTitle}</h5>
                   <p className="text-[11px] text-slate-500 font-medium">{content.ngoIncDesc}</p>
                </div>
              </div>
           </div>
        </section>

        {/* IMPACT TIMELINE */}
        <section className="space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">{content.impactTitle}</h2>
              <p className="text-blue-400 font-bold tracking-widest uppercase text-[10px]">{content.impactSubtitle}</p>
           </div>
           <div className="glass p-12 rounded-[4rem] border-blue-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -z-10" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="space-y-4 text-center px-6">
                    <Heart className="w-10 h-10 text-pink-500 mx-auto" />
                    <h5 className="text-4xl font-black text-white tracking-tighter italic">9.4k+</h5>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{content.livesImpacted}</p>
                 </div>
                 <div className="space-y-4 text-center px-6 border-x border-white/5">
                    <TrendingUp className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h5 className="text-4xl font-black text-white tracking-tighter italic">24h</h5>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{content.avgRes}</p>
                 </div>
                 <div className="space-y-4 text-center px-6">
                    <Users className="w-10 h-10 text-blue-500 mx-auto" />
                    <h5 className="text-4xl font-black text-white tracking-tighter italic">120+</h5>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{content.partnerNgos}</p>
                 </div>
              </div>
           </div>
        </section>

        {/* FEEDBACK WALL - Filling the empty space */}
        <section className="space-y-12 animate-in fade-in duration-1000 delay-500">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
                <MessageSquare className="w-4 h-4" />
                <span>Citizen Sentiments</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">The Voice of the People</h2>
           </div>

           <div className="relative w-full overflow-hidden py-10">
              {/* Soft edge masking */}
              <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#040d1a] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#040d1a] to-transparent z-10 pointer-events-none" />

              <div className="flex space-x-6 animate-marquee whitespace-nowrap">
                {recentFeedbacks.length > 0 ? (
                  [...recentFeedbacks, ...recentFeedbacks].map((f, i) => (
                    <div key={i} className="inline-block glass p-8 rounded-[2rem] border-white/5 min-w-[350px] space-y-4 hover:border-indigo-500/30 transition-all group">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                             <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                                <Users className="w-3 h-3" />
                             </div>
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Citizen Observer</span>
                          </div>
                          <span className="text-[7px] font-bold text-slate-700">{new Date(f.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-sm text-slate-300 font-medium whitespace-normal leading-relaxed italic">"{f.message}"</p>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-10">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Awaiting community input...</p>
                  </div>
                )}
              </div>
           </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-20 border-t border-white/5 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-6">
                 <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">JanSetu</h1>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">{content.footerDesc}</p>
              </div>
              <div className="space-y-4">
                 <h5 className="text-xs font-black text-white uppercase tracking-widest">{content.archTitle}</h5>
                 <ul className="text-[10px] text-slate-500 font-bold uppercase space-y-2 tracking-widest">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.arch1}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.arch2}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.arch3}</li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h5 className="text-xs font-black text-white uppercase tracking-widest">{content.transTitle}</h5>
                 <ul className="text-[10px] text-slate-500 font-bold uppercase space-y-2 tracking-widest">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.trans1}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.trans2}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.trans3}</li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h5 className="text-xs font-black text-white uppercase tracking-widest">{content.supportTitle}</h5>
                 <ul className="text-[10px] text-slate-500 font-bold uppercase space-y-2 tracking-widest">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.support1}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.support2}</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">{content.support3}</li>
                 </ul>
              </div>
           </div>
           <div className="pt-12 text-center">
              <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.8em]">{content.footerBottom}</p>
           </div>
        </footer>
      </main>

      {/* Floating Support Hub - Blue Theme */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end space-y-4">
        {showHelpline && (
          <div className="glass p-8 rounded-[3.5rem] border-blue-500/30 w-80 space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{content.supportHubTitle}</h4>
              <button onClick={() => setShowHelpline(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-6">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{content.emergencyControl}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{content.support1}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{content.nodeSupport}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">011-NODE-JS</p>
               </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase py-4 rounded-[2rem] transition-all shadow-xl shadow-blue-600/20">{content.connectBtn}</button>
          </div>
        )}
        <button 
          onClick={() => setShowHelpline(!showHelpline)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_0_40px_rgba(59,130,246,0.4)] group relative overflow-hidden ${showHelpline ? 'bg-rose-500 rotate-90' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'}`}
        >
          {showHelpline ? <X className="w-8 h-8 text-white" /> : <PhoneCall className="w-8 h-8 text-white group-hover:animate-bounce" />}
          {!showHelpline && (
             <span className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping" />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(60px, -80px) rotate(15deg) scale(1.1); }
          50% { transform: translate(-40px, -160px) rotate(-15deg) scale(0.9); }
          75% { transform: translate(80px, -80px) rotate(10deg) scale(1.05); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        @keyframes waveMove {
          0% { transform: translateX(-5%) scaleY(1); opacity: 0.6; }
          50% { transform: translateX(5%) scaleY(1.3); opacity: 1; }
          100% { transform: translateX(-5%) scaleY(1); opacity: 0.6; }
        }
        @keyframes wavePath {
          0% { stroke-dashoffset: 0; transform: translateX(0); }
          50% { transform: translateX(-30px); }
          100% { stroke-dashoffset: 0; transform: translateX(0); }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        @keyframes loading-bar {
          0% { width: 0%; left: 0%; }
          50% { width: 70%; left: 15%; }
          100% { width: 100%; left: 0%; }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-drift { animation: drift linear infinite; }
      `}</style>
      <GlobalFeedback />
    </div>
  );
}
