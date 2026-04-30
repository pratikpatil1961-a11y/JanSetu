"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, Camera, MapPin, User, LogOut, Droplet, Zap, AlertTriangle, Shield, EyeOff, MoreHorizontal, Trash2, Bus, Activity, Navigation, Clock, FileText, Search, PlusCircle, LayoutDashboard, Send, Keyboard, ChevronRight, X, PhoneCall, Heart, Siren, ShieldAlert, Baby, UserCheck, Flame, PieChart, TrendingUp, BarChart3, HelpCircle, Users, Sparkles, Download, ThumbsUp, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch, removeToken } from "@/lib/api";
import PdfModal from "@/components/PdfModal";
import SupportVerificationModal from "@/components/SupportVerificationModal";
import { useLanguage } from "@/context/LanguageContext";
import LanguagePicker from "@/components/LanguagePicker";
import VoiceModule from "@/components/VoiceModule";

const LOCAL_CONTENT: Record<string, any> = {
  en: {
    loc_inaccurate: "Location Inaccurate?",
    retry_gps: "Retry GPS",
    search_placeholder: "Search for exact address or landmark...",
    how_to_report: "How to report?",
    method_desc: "Choose your preferred method for describing the issue.",
    audio_desc: "Record audio, AI handles the rest.",
    text_desc: "Write a description manually.",
    write_report: "Write Report",
    provide_details: "Provide details about the problem.",
    describe_placeholder: "Describe what's happening...",
    submit_report: "Submit Report",
    quick_report_desc: "AI-powered anonymous grievance reporting",
    quick_track_desc: "View full history and case proof details",
    recent_cases: "Recent Cases",
    recent_cases_desc: "Real-time status of your filed grievances.",
    reports_count_label: "Reports",
    status_pending: "PENDING VALIDATION",
    status_verified: "VERIFIED",
    status_resolved: "RESOLVED",
    status_classified: "SHADOW PROTOCOL ACTIVE",
    supports_label: "Supports",
    confirm_btn: "Confirm",
    reopen_btn: "Reopen",
    pdf_btn: "PDF",
    audit_hash_label: "Immutable Audit Hash",
    report_logged: "Report Logged",
    report_logged_desc: "Your grievance has been securely added to the ledger.",
    secure_receipt: "JanSetu Secure Receipt",
    scan_qr: "Scan QR to track offline",
    access_pin: "Access PIN",
    save_btn: "Save",
    track_dashboard_btn: "Track Dashboard \u2192",
    report_another_btn: "Report Another Grievance",
    issue_reported: "issue reported.",
    nearby_grievances_title: "Nearby Grievances",
    nearby_grievances_desc: "Issues reported within 10km of your current location.",
    refresh_btn: "Refresh",
    locating_btn: "Locating...",
    no_issues_found: "No issues found nearby",
    everything_looks_good: "Everything looks good in your area",
    support_issue_btn: "Support Issue",
    supported_btn: "Supported",
    no_desc_provided: "No description provided."
  },
  hi: {
    loc_inaccurate: "स्थान गलत है?",
    retry_gps: "GPS पुनः प्रयास करें",
    search_placeholder: "सटीक पता या लैंडमार्क खोजें...",
    how_to_report: "रिपोर्ट कैसे करें?",
    method_desc: "समस्या का वर्णन करने के लिए अपनी पसंदीदा विधि चुनें।",
    audio_desc: "ऑडियो रिकॉर्ड करें, AI बाकी काम संभाल लेगा।",
    text_desc: "मैन्युअल रूप से विवरण लिखें।",
    write_report: "रिपोर्ट लिखें",
    provide_details: "समस्या के बारे में विवरण प्रदान करें।",
    describe_placeholder: "बताएं कि क्या हो रहा है...",
    submit_report: "रिपोर्ट जमा करें",
    quick_report_desc: "AI-संचालित अनाम शिकायत रिपोर्टिंग",
    quick_track_desc: "पूरा इतिहास और मामले के सबूत देखें",
    recent_cases: "हाल के मामले",
    recent_cases_desc: "आपकी दर्ज शिकायतों की वास्तविक समय स्थिति।",
    reports_count_label: "रिपोर्ट्स",
    status_pending: "सत्यापन लंबित",
    status_verified: "सत्यापित",
    status_resolved: "हल हो गया",
    status_classified: "शैडो प्रोटोकॉल सक्रिय",
    supports_label: "समर्थन",
    confirm_btn: "पुष्टि करें",
    reopen_btn: "पुनः खोलें",
    pdf_btn: "पीडीएफ",
    audit_hash_label: "अपरिवर्तनीय ऑडिट हैश",
    report_logged: "रिपोर्ट दर्ज की गई",
    report_logged_desc: "आपकी शिकायत सुरक्षित रूप से लेजर में जोड़ दी गई है।",
    secure_receipt: "जनसेतु सुरक्षित रसीद",
    scan_qr: "ऑफ़लाइन ट्रैक करने के लिए QR स्कैन करें",
    access_pin: "एक्सेस पिन",
    save_btn: "सहेजें",
    track_dashboard_btn: "डैशबोर्ड ट्रैक करें \u2192",
    report_another_btn: "एक और शिकायत दर्ज करें",
    issue_reported: "समस्या की सूचना दी गई।",
    nearby_grievances_title: "आसपास की शिकायतें",
    nearby_grievances_desc: "आपके वर्तमान स्थान के 10 किमी के भीतर दर्ज समस्याएं।",
    refresh_btn: "रिफ्रेश",
    locating_btn: "स्थान खोज रहा है...",
    no_issues_found: "आसपास कोई समस्या नहीं मिली",
    everything_looks_good: "आपके क्षेत्र में सब कुछ ठीक लग रहा है",
    support_issue_btn: "समस्या का समर्थन करें",
    supported_btn: "समर्थित",
    no_desc_provided: "कोई विवरण नहीं दिया गया।"
  },
  kn: {
    loc_inaccurate: "ಸ್ಥಳ ತಪ್ಪಾಗಿದೆಯೇ?",
    retry_gps: "GPS ಮರುಪ್ರಯತ್ನಿಸಿ",
    search_placeholder: "ನಿಖರವಾದ ವಿಳಾಸ ಅಥವಾ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ಹುಡುಕಿ...",
    how_to_report: "ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?",
    method_desc: "ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ವಿಧಾನವನ್ನು ಆರಿಸಿ.",
    audio_desc: "ಆಡಿಯೋ ರೆಕಾರ್ಡ್ ಮಾಡಿ, ಉಳಿದದ್ದನ್ನು AI ನೋಡಿಕೊಳ್ಳುತ್ತದೆ.",
    text_desc: "ವಿವರಣೆಯನ್ನು ಕೈಯಾರೆ ಬರೆಯಿರಿ.",
    write_report: "ವರದಿ ಬರೆಯಿರಿ",
    provide_details: "ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.",
    describe_placeholder: "ಏನಾಗುತ್ತಿದೆ ಎಂಬುದನ್ನು ವಿವರಿಸಿ...",
    submit_report: "ವರದಿ ಸಲ್ಲಿಸಿ",
    quick_report_desc: "AI-ಚಾಲಿತ ಅನಾಮಧೇಯ ದೂರು ವರದಿ",
    quick_track_desc: "ಸಂಪೂರ್ಣ ಇತಿಹಾಸ ಮತ್ತು ಪ್ರಕರಣದ ಪುರಾವೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    recent_cases: "ಇತ್ತೀಚಿನ ಪ್ರಕರಣಗಳು",
    recent_cases_desc: "ನಿಮ್ಮ ದಾಖಲಾದ ದೂರುಗಳ ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿ.",
    reports_count_label: "ವರದಿಗಳು",
    status_pending: "ಮೌಲ್ಯಮಾಪನ ಬಾಕಿ ಇದೆ",
    status_verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    status_resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    status_classified: "ಶ್ಯಾಡೋ ಪ್ರೋಟೋಕಾಲ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    supports_label: "ಬೆಂಬಲಗಳು",
    confirm_btn: "ಖಚಿತಪಡಿಸಿ",
    reopen_btn: "ಮರುತೆರೆಯಿರಿ",
    pdf_btn: "ಪಿಡಿಎಫ್",
    audit_hash_label: "ಬದಲಾಯಿಸಲಾಗದ ಆಡಿಟ್ ಹ್ಯಾಶ್",
    report_logged: "ವರದಿ ಲಾಗ್ ಆಗಿದೆ",
    report_logged_desc: "ನಿಮ್ಮ ದೂರನ್ನು ಲೆಡ್ಜರ್‌ಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.",
    secure_receipt: "ಜನಸೇತು ಸುರಕ್ಷಿತ ರಶೀದಿ",
    scan_qr: "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    access_pin: "ಪಿನ್ ಪ್ರವೇಶಿಸಿ",
    save_btn: "ಉಳಿಸಿ",
    track_dashboard_btn: "ಟ್ರ್ಯಾಕ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ \u2192",
    report_another_btn: "ಮತ್ತೊಂದು ದೂರನ್ನು ವರದಿ ಮಾಡಿ",
    issue_reported: "ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಲಾಗಿದೆ.",
    nearby_grievances_title: "ಹತ್ತಿರದ ದೂರುಗಳು",
    nearby_grievances_desc: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳದ 10 ಕಿಮೀ ಒಳಗೆ ವರದಿಯಾದ ಸಮಸ್ಯೆಗಳು.",
    refresh_btn: "ರಿಫ್ರೆಶ್",
    locating_btn: "ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    no_issues_found: "ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    everything_looks_good: "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿ ಕಾಣುತ್ತಿದೆ",
    support_issue_btn: "ಸಮಸ್ಯೆಯನ್ನು ಬೆಂಬಲಿಸಿ",
    supported_btn: "ಬೆಂಬಲಿಸಲಾಗಿದೆ",
    no_desc_provided: "ಯಾವುದೇ ವಿವರಣೆಯನ್ನು ಒದಗಿಸಲಾಗಿಲ್ಲ."
  },
  mr: {
    loc_inaccurate: "स्थान चुकीचे आहे?",
    retry_gps: "GPS पुन्हा तपासा",
    search_placeholder: "अचूक पत्ता किंवा खूण शोधा...",
    how_to_report: "तक्रार कशी नोंदवायची?",
    method_desc: "समस्येचे वर्णन करण्यासाठी तुमची पसंतीची पद्धत निवडा.",
    audio_desc: "ऑडिओ रेकॉर्ड करा, AI बाकीचे हाताळेल.",
    text_desc: "मॅन्युअली वर्णन लिहा.",
    write_report: "तक्रार लिहा",
    provide_details: "समस्येबद्दल तपशील द्या.",
    describe_placeholder: "काय होत आहे ते सांगा...",
    submit_report: "तक्रार सबमिट करा",
    quick_report_desc: "AI-समर्थित अनामित तक्रार नोंदणी",
    quick_track_desc: "संपूर्ण इतिहास आणि प्रकरणाचे पुरावे पहा",
    recent_cases: "अलीकडील प्रकरणे",
    recent_cases_desc: "तुमच्या नोंदवलेल्या तक्रारींची रिअल-टाइम स्थिती.",
    reports_count_label: "अहवाल",
    status_pending: "सत्यापन प्रलंबित",
    status_verified: "सत्यापित",
    status_resolved: "निराकरण झाले",
    status_classified: "शॅडो प्रोटोकॉल सक्रिय",
    supports_label: "समर्थन",
    confirm_btn: "पुष्टी करा",
    reopen_btn: "पुन्हा उघडा",
    pdf_btn: "पीडीएफ",
    audit_hash_label: "अपरिवर्तनीय ऑडिट हॅश",
    report_logged: "अहवाल नोंदवला",
    report_logged_desc: "तुमची तक्रार लेजरमध्ये सुरक्षितपणे जोडली गेली आहे.",
    secure_receipt: "जनसेतु सुरक्षित पावती",
    scan_qr: "ऑफलाइन ट्रॅक करण्यासाठी QR स्कॅन करा",
    access_pin: "अॅक्सेस पिन",
    save_btn: "जतन करा",
    track_dashboard_btn: "डॅशबोर्ड ट्रॅक करा \u2192",
    report_another_btn: "आणखी एक तक्रार नोंदवा",
    issue_reported: "समस्येची तक्रार केली.",
    nearby_grievances_title: "जवळपासच्या तक्रारी",
    nearby_grievances_desc: "तुमच्या सध्याच्या स्थानापासून १० किमीच्या आत नोंदवलेल्या समस्या.",
    refresh_btn: "रिफ्रेश",
    locating_btn: "स्थान शोधत आहे...",
    no_issues_found: "जवळपास कोणतीही समस्या आढळली नाही",
    everything_looks_good: "तुमच्या भागात सर्व काही ठीक दिसत आहे",
    support_issue_btn: "समस्येला समर्थन द्या",
    supported_btn: "समर्थित",
    no_desc_provided: "कोणतेही वर्णन दिलेले नाही."
  },
  te: {
    loc_inaccurate: "స్థానం సరికానిదా?",
    retry_gps: "GPS మళ్లీ ప్రయత్నించండి",
    search_placeholder: "ఖచ్చితమైన చిరునామా లేదా ల్యాండ్‌మార్క్ కోసం శోధించండి...",
    how_to_report: "ఎలా నివేదించాలి?",
    method_desc: "సమస్యను వివరించడానికి మీకు నచ్చిన పద్ధతిని ఎంచుకోండి.",
    audio_desc: "ఆడియోను రికార్డ్ చేయండి, AI మిగిలిన వాటిని చూసుకుంటుంది.",
    text_desc: "మానవీయంగా వివరణ రాయండి.",
    write_report: "నివేదిక రాయండి",
    provide_details: "సమస్య గురించి వివరాలను అందించండి.",
    describe_placeholder: "ఏం జరుగుతుందో వివరించండి...",
    submit_report: "నివేదికను సమర్పించండి",
    quick_report_desc: "AI-ఆధారిత అజ్ఞాత ఫిర్యాదు నివేదన",
    quick_track_desc: "పూర్తి చరిత్ర మరియు కేసు వివరాలను చూడండి",
    recent_cases: "ఇటీవలి కేసులు",
    recent_cases_desc: "మీరు దాఖలు చేసిన ఫిర్యాదుల నిజ-సమయ స్థితి.",
    reports_count_label: "నివేదికలు",
    status_pending: "ధృవీకరణ పెండింగ్‌లో ఉంది",
    status_verified: "ధృవీకరించబడింది",
    status_resolved: "పరిష్కరించబడింది",
    status_classified: "షాడో ప్రోటోకాల్ సక్రియం",
    supports_label: "మద్దతు",
    confirm_btn: "నిర్ధారించండి",
    reopen_btn: "తిరిగి తెరవండి",
    pdf_btn: "పిడిఎఫ్",
    audit_hash_label: "మార్చలేని ఆడిట్ హాష్",
    report_logged: "నివేదిక నమోదు చేయబడింది",
    report_logged_desc: "మీ ఫిర్యాదు లెడ్జర్‌కి సురక్షితంగా జోడించబడింది.",
    secure_receipt: "జనసేతు సురక్షిత రసీదు",
    scan_qr: "ఆఫ్‌లైన్‌లో ట్రాక్ చేయడానికి QR స్కాన్ చేయండి",
    access_pin: "యాక్సెస్ పిన్",
    save_btn: "సేవ్ చేయండి",
    track_dashboard_btn: "ట్రాక్ డాష్‌బోర్డ్ \u2192",
    report_another_btn: "మరొక ఫిర్యాదును నివేదించండి",
    issue_reported: "సమస్య నివేదించబడింది.",
    nearby_grievances_title: "సమీప ఫిర్యాదులు",
    nearby_grievances_desc: "మీ ప్రస్తుత స్థానానికి 10 కి.మీ లోపు నివేదించబడిన సమస్యలు.",
    refresh_btn: "రిఫ్రెష్",
    locating_btn: "స్థానం కనుగొనబడుతోంది...",
    no_issues_found: "సమీపంలో సమస్యలు కనుగొనబడలేదు",
    everything_looks_good: "మీ ప్రాంతంలో అంతా బాగానే ఉంది",
    support_issue_btn: "సమస్యకు మద్దతు ఇవ్వండి",
    supported_btn: "మద్దతు ఇవ్వబడింది",
    no_desc_provided: "ఎలాంటి వివరణ అందించబడలేదు."
  }
};

const CATEGORIES = [
  { id: "Water & Sanitation", tKey: "cat_water", icon: Droplet, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/10" },
  { id: "Electricity", tKey: "cat_electricity", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/10" },
  { id: "Roads & Infrastructure", tKey: "cat_roads", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/10" },
  { id: "Waste Management", tKey: "cat_waste", icon: Trash2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
  { id: "Public Transport", tKey: "cat_transport", icon: Bus, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/10" },
  { id: "Medical & Health", tKey: "cat_medical", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/10" },
  { id: "Corruption", tKey: "cat_corruption", icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/10" },
  { id: "Harassment", tKey: "cat_harassment", icon: EyeOff, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/10" },
  { id: "Other", tKey: "cat_other", icon: MoreHorizontal, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/10" },
];

const HELPLINES = [
  { id: "Police", number: "100", icon: Siren, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "Ambulance", number: "108", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "Fire", number: "101", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "Women", number: "1091", icon: ShieldAlert, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "Child", number: "1098", icon: Baby, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "Senior Citizen", number: "14567", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const FLOW_PROMPTS: Record<string, Record<string, string>> = {
  en: {
    photo: "Please capture a clear photo of the issue for evidence.",
    inputType: "Now, would you like to record a voice message or type your report?",
    success: "Your complaint has been recorded successfully. Please save your case number."
  },
  hi: {
    photo: "कृपया साक्ष्य के लिए समस्या का एक स्पष्ट फोटो लें।",
    inputType: "अब, क्या आप वॉइस मैसेज रिकॉर्ड करना चाहेंगे या अपनी रिपोर्ट टाइप करना चाहेंगे?",
    success: "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है। कृपया अपना केस नंबर सहेजें।"
  },
  kn: {
    photo: "ದಯವಿಟ್ಟು ಪುರಾವೆಗಾಗಿ ಸಮಸ್ಯೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.",
    inputType: "ಈಗ, ನೀವು ಧ್ವನಿ ಸಂದೇಶವನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಲು ಅಥವಾ ನಿಮ್ಮ ವರದಿಯನ್ನು ಟೈಪ್ ಮಾಡಲು ಬಯಸುವಿರಾ?",
    success: "ನಿಮ್ಮ ದೂರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಕರಣದ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ."
  },
  mr: {
    photo: "कृपया पुराव्यासाठी समस्येचा स्पष्ट फोटो घ्या.",
    inputType: "आता, तुम्हाला व्हॉइस मेसेज रेकॉर्ड करायचा आहे की तुमची तक्रार टाईप करायची आहे?",
    success: "तुमची तक्रार यशस्वीरित्या नोंदवली गेली आहे. कृपया तुमचा केस नंबर जतन करा."
  },
  te: {
    photo: "దయచేసి సాక్ష్యం కోసం సమస్య యొక్క స్పష్టమైన ఫోటోను తీయండి.",
    inputType: "ఇప్పుడు, మీరు వాయిస్ మెసేజ్‌ని రికార్డ్ చేయాలనుకుంటున్నారా లేదా మీ నివేదికను టైప్ చేయాలనుకుంటున్నారా?",
    success: "మీ ఫిర్యాదు విజయవంతంగా నమోదైంది. దయచేసి మీ కేసు నంబర్‌ను సేవ్ చేసుకోండి."
  }
};

export default function CitizenDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "track" | "support" | "feedback">("overview");
  const [nearbyComplaints, setNearbyComplaints] = useState<any[]>([]);
  const [nearbyLocationName, setNearbyLocationName] = useState<string | null>(null);
  const [selectedComplaintForPdf, setSelectedComplaintForPdf] = useState<any | null>(null);
  const [supportComplaintId, setSupportComplaintId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [allFeedbacks, setAllFeedbacks] = useState<any[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Voice Feedback Refs
  const feedbackMediaRecorder = useRef<MediaRecorder | null>(null);
  const feedbackAudioChunks = useRef<Blob[]>([]);
  const [isRecordingFeedback, setIsRecordingFeedback] = useState(false);
  const feedbackRecognitionRef = useRef<any>(null);

  // Initialize Feedback Speech Recognition
  useEffect(() => {
    const LANG_MAP: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN",
      mr: "mr-IN",
      te: "te-IN",
    };

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (feedbackRecognitionRef.current) {
        try { feedbackRecognitionRef.current.stop(); } catch(e) {}
      }
      feedbackRecognitionRef.current = new SpeechRecognition();
      feedbackRecognitionRef.current.continuous = true;
      feedbackRecognitionRef.current.interimResults = true;
      feedbackRecognitionRef.current.lang = LANG_MAP[language] || "en-IN";
      
      feedbackRecognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setFeedbackMessage((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };
    }
  }, [language]);
  
  const [step, setStep] = useState<"category" | "photo" | "input-type" | "audio" | "text" | "processing" | "success">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "locked" | "error">("idle");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const startFeedbackRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      feedbackMediaRecorder.current = new MediaRecorder(stream, { mimeType });
      feedbackAudioChunks.current = [];
      feedbackMediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) feedbackAudioChunks.current.push(e.data);
      };
      feedbackMediaRecorder.current.onstop = () => submitVoiceFeedback();
      feedbackMediaRecorder.current.start(1000);
      
      if (feedbackRecognitionRef.current) {
        feedbackRecognitionRef.current.start();
      }
      setIsRecordingFeedback(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied.");
    }
  };

  const stopFeedbackRecording = () => {
    if (feedbackMediaRecorder.current && isRecordingFeedback) {
      feedbackMediaRecorder.current.stop();
      if (feedbackRecognitionRef.current) {
        feedbackRecognitionRef.current.stop();
      }
      setIsRecordingFeedback(false);
      feedbackMediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const submitVoiceFeedback = async () => {
    const audioBlob = new Blob(feedbackAudioChunks.current, { type: 'audio/webm;codecs=opus' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'feedback.webm');

    setIsSubmittingFeedback(true);
    try {
      const res = await apiFetch("/feedback", {
        method: "POST",
        body: formData,
        headers: {} 
      });
      if (res.ok) {
        setFeedbackMessage("");
        setFeedbackSuccess(true);
        fetchFeedbacks();
      } else {
        const data = await res.json();
        alert(data.error || "Transcription failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Submission error.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [complaintText, setComplaintText] = useState("");
  const [pin, setPin] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  const speakFlow = (stepKey: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = FLOW_PROMPTS[language]?.[stepKey] || FLOW_PROMPTS.en[stepKey];
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = language === 'en' ? 'en-IN' : `${language}-IN`;
      utterance.lang = targetLang;
      
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith(language) && (v.name.includes("Google") || v.name.includes("Natural")));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith(language));
      
      // Fallback for Indian scripts: if native voice is missing, Hindi voice reads Indian context slightly better than English US
      if (!bestVoice && (language === 'mr' || language === 'hi' || language === 'kn' || language === 'te')) {
        bestVoice = voices.find(v => v.lang.replace('_', '-').startsWith('hi-IN') || v.lang.replace('_', '-').startsWith('hi'));
      }
      
      if (bestVoice) utterance.voice = bestVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (step === "photo") speakFlow("photo");
    if (step === "input-type") speakFlow("inputType");
    if (step === "success") speakFlow("success");
  }, [step, language]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    disposed: 0,
    onTime: "94.2%",
    feedback: "4.8/5"
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    checkAuth();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user.role === 'citizen') {
          setUser(data.user);
          fetchMyReports();
          fetchGlobalStats();
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
      const res = await apiFetch("/complaints?myReports=true");
      if (res.ok) {
        const data = await res.json();
        setMyReports(data.complaints || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await apiFetch("/complaints");
      if (res.ok) {
        const data = await res.json();
        const all = data.complaints || [];
        const todayCount = all.filter((c: any) => new Date(c.createdAt).toDateString() === new Date().toDateString()).length;
        const disposedCount = all.filter((c: any) => c.status === 'Resolved').length;
        
        setStats(prev => ({
          ...prev,
          total: all.length,
          today: todayCount,
          disposed: disposedCount
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    removeToken();
    router.push("/citizen/login");
  };

  const fetchNearbyComplaints = async () => {
    if (!navigator.geolocation) {
      setNearbyLocationName("Not Supported");
      return;
    }
    
    // Use the live accurate location if already locked by our watcher
    if (locationStatus === "locked" && location) {
      setNearbyLocationName("Updating...");
      try {
        const res = await apiFetch(`/complaints/nearby?lat=${location.lat}&lng=${location.lng}&radius=10000`);
        if (res.ok) {
          const data = await res.json();
          setNearbyComplaints(data.complaints || []);
          setNearbyLocationName(locationName || "Current Location");
        }
      } catch (e) {
        console.error("Fetch nearby error", e);
      }
      return;
    }

    setNearbyLocationName("Locating...");
    
    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
    
    const success = async (pos: GeolocationPosition) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await apiFetch(`/complaints/nearby?lat=${latitude}&lng=${longitude}&radius=10000`);
        if (res.ok) {
          const data = await res.json();
          setNearbyComplaints(data.complaints || []);
          
          const geoRes = await apiFetch(`/complaints/proxy/geocode?lat=${latitude}&lng=${longitude}`);
          const geoData = await geoRes.json();
          const addr = geoData.address;
          const name = addr?.road || addr?.suburb || addr?.neighbourhood || addr?.city || "Current Location";
          setNearbyLocationName(name);
        }
      } catch (e) {
        console.error("Fetch nearby error", e);
        setNearbyLocationName("Location Error");
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.warn(`Nearby location error (${err.code}): ${err.message}. Retrying...`);
      setNearbyLocationName("Location Denied");
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  const handleSupport = (id: string) => {
    setSupportComplaintId(id);
  };

  const handleResolution = async (id: string, action: 'Closed' | 'Reopened') => {
    try {
      const res = await apiFetch("/complaints", {
        method: "PATCH",
        body: JSON.stringify({ id, newStatus: action })
      });
      if (res.ok) {
        setMyReports(prev => prev.map(c => c._id === id ? { ...c, status: action } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onSupportSuccess = (newCount: number) => {
    if (!supportComplaintId) return;
    setNearbyComplaints(prev => prev.map(c => 
      c._id === supportComplaintId 
        ? { ...c, supporters: [...(c.supporters || []), { user: user?._id }] } 
        : c
    ));
    setSupportComplaintId(null);
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedback(true);
    try {
      const res = await apiFetch("/feedback");
      if (res.ok) {
        const data = await res.json();
        setAllFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (activeTab === "support") {
      fetchNearbyComplaints();
    }
    if (activeTab === "feedback") {
      fetchFeedbacks();
    }
  }, [activeTab, locationStatus]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await apiFetch(`/complaints/proxy/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (data.address) {
        const addr = data.address;
        const parts = [
          addr.road,
          addr.suburb || addr.neighbourhood || addr.village,
          addr.city || addr.town,
          addr.state
        ].filter(Boolean);
        const name = parts.join(", ");
        setLocationName(name || "Current Location");
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
  };

  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const searchLocation = async (query: string) => {
    if (query.length < 3) return;
    setIsSearchingLocation(true);
    try {
      const response = await apiFetch(`/complaints/proxy/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setLocationResults(data || []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLocationStatus("locating");
    
    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocationStatus("locked");
        reverseGeocode(latitude, longitude);
      },
      (err: GeolocationPositionError) => {
        console.warn(`Location error (${err.code}): ${err.message}. Retrying...`);
        if (err.code === err.TIMEOUT) {
          requestLocation();
        } else {
          setLocationStatus("error");
        }
      },
      options
    );
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    requestLocation();
    
    const photoCategories = ["Water & Sanitation", "Electricity", "Roads & Infrastructure", "Waste Management"];
    if (photoCategories.includes(categoryId)) {
      setStep("photo");
      startCamera();
    } else {
      setStep("input-type");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStep("input-type");
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
        setStep("input-type");
      }
    }
  };

  const skipPhoto = () => {
    stopCamera();
    setStep("input-type");
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

  const handleTextSubmit = () => {
    if (complaintText.trim().length < 10) {
      alert("Please provide a more detailed description.");
      return;
    }
    uploadComplaint(undefined, complaintText);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const uploadComplaint = async (audioBlob?: Blob, text?: string) => {
    try {
      setStep("processing");
      const formData = new FormData();
      if (audioBlob) formData.append('audio', audioBlob, 'grievance.webm');
      if (text) formData.append('text', text);
      
      formData.append('category', selectedCategory);
      if (photoData) formData.append('photo', photoData);
      if (location) formData.append('location', JSON.stringify(location));
      if (locationName) formData.append('locationName', locationName);
      
      const response = await apiFetch('/complaints', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success && data.pin && data.caseNumber) {
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
    setLocationName(null);
    setLocationStatus("idle");
    setPin(null);
    setCaseNumber(null);
    setRecordingTime(0);
    setComplaintText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
        <p className="text-slate-500 text-sm font-medium tracking-wide">Connecting to secure node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 selection:bg-indigo-500/30 flex" style={{fontFamily: 'var(--font-inter), sans-serif'}}>
      {/* Premium Sidebar */}
      <aside className="w-72 flex flex-col h-screen sticky top-0 relative" style={{background: 'linear-gradient(180deg, #06090f 0%, #02040a 100%)', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="p-6 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg shadow-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/jansetu-logo.png" alt="JanSetu" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black text-white tracking-tight" style={{fontFamily: 'var(--font-jakarta), sans-serif'}}>JanSetu</span>
            <p className="text-[9px] text-indigo-400/70 font-bold uppercase tracking-[0.3em]">Citizen Portal</p>
          </div>
        </div>

        <div className="px-4 py-4 flex-1 space-y-1">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] px-3 pb-2">Navigation</p>
          {([
            { key: "overview", icon: LayoutDashboard, label: t('overview') },
            { key: "report",   icon: PlusCircle,      label: t('report') },
            { key: "track",    icon: FileText,         label: t('track') },
            { key: "support",  icon: Users,            label: t('support') },
            { key: "feedback", icon: MessageSquare,    label: "Feedback" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                activeTab === key
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${activeTab === key ? 'text-indigo-400' : ''}`} />
              <span className="font-semibold text-sm tracking-wide">{label}</span>
              {activeTab === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
            </button>
          ))}
        </div>

        <div className="px-4 py-4" style={{borderTop: '1px solid rgba(255,255,255,0.04)'}}>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] px-3 pb-2">Language</p>
          <LanguagePicker />
        </div>

        {user && (
          <div className="p-4" style={{borderTop: '1px solid rgba(255,255,255,0.04)'}}>
            <div className="rounded-2xl p-4 space-y-3" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="truncate flex-1">
                  <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-widest">Citizen</p>
                  <p className="text-xs font-bold text-slate-200 truncate">{user.anonymousId}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 text-slate-600 hover:text-rose-400 rounded-xl transition-all hover:bg-rose-500/10 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0a0c10]">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === "overview" && (
            <div className="space-y-10 animate-in fade-in duration-700">

              {/* Welcome Hero */}
              <div className="relative rounded-[2.5rem] overflow-hidden p-10" style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.08) 50%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(99,102,241,0.15)'}}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
                <div className="relative flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(59,130,246,0.15))', border: '1px solid rgba(99,102,241,0.3)'}}>
                      <User className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-4xl font-black text-white leading-none" style={{fontFamily: 'var(--font-jakarta)'}}>{t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Citizen</span></h2>
                      <div className="flex items-center space-x-2">
                        <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">{t('anonymous_id')}: <span className="text-indigo-400 font-black">{user?.anonymousId}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">System Status</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">● All nodes operational</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: t('stats_total'),   value: stats.total,    icon: Sparkles, color: 'indigo',  glow: 'rgba(99,102,241,0.2)' },
                  { label: t('stats_today'),   value: stats.today,    icon: TrendingUp, color: 'emerald', glow: 'rgba(52,211,153,0.2)' },
                  { label: t('stats_disposed'), value: stats.disposed, icon: CheckCircle2, color: 'blue', glow: 'rgba(59,130,246,0.2)' },
                  { label: t('stats_ontime'),  value: stats.onTime,   icon: Zap, color: 'amber', glow: 'rgba(245,158,11,0.2)' },
                ].map(({ label, value, icon: Icon, color, glow }) => (
                  <div key={label} className="relative rounded-[1.75rem] p-6 overflow-hidden group hover:scale-[1.03] transition-all cursor-default" style={{background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`}}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background: `radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 70%)`}} />
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">{label}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-white" style={{fontFamily: 'var(--font-jakarta)'}}>{value}</span>
                      <Icon className={`w-4 h-4 text-${color}-400`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                  onClick={() => setActiveTab("report")}
                  className="relative overflow-hidden p-8 rounded-[2rem] text-left space-y-4 group transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', boxShadow: '0 20px 60px rgba(79,70,229,0.3)'}}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full" />
                  <PlusCircle className="w-9 h-9 text-white/90 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-xl font-black text-white" style={{fontFamily: 'var(--font-jakarta)'}}>{t('report')}</h3>
                    <p className="text-indigo-100/50 text-sm font-medium mt-1">{LOCAL_CONTENT[language]?.quick_report_desc || LOCAL_CONTENT.en.quick_report_desc}</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("track")}
                  className="relative overflow-hidden p-8 rounded-[2rem] text-left space-y-4 group transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)'}}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-all" />
                  <LayoutDashboard className="w-9 h-9 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <div>
                    <h3 className="text-xl font-black text-white" style={{fontFamily: 'var(--font-jakarta)'}}>{t('track')}</h3>
                    <p className="text-slate-600 text-sm font-medium mt-1">{LOCAL_CONTENT[language]?.quick_track_desc || LOCAL_CONTENT.en.quick_track_desc}</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* --- NEW REPORT TAB --- */}
          {activeTab === "report" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {step === "category" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t('report_title')}</h2>
                    <p className="text-slate-400 text-sm">{t('report_desc')}</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat.id)}
                        className={`flex flex-col items-start p-5 rounded-2xl border ${cat.border} bg-[#0d1117] hover:bg-[#161b22] hover:border-indigo-500/30 transition-all group text-left`}
                      >
                        <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <cat.icon className={`w-5 h-5 ${cat.color}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-200 leading-tight">{t(cat.tKey)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-700 mt-2 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Other steps same as before */}
              {step === "photo" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">{t('visual_proof')}</h2>
                      <p className="text-sm text-slate-400">{t('capture_photo')}</p>
                    </div>
                    <button onClick={() => setStep("category")} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-slate-800">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                        {locationStatus === "locked" ? (
                          <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
                            <MapPin className="w-3 h-3 mr-1.5" />
                            {locationName || "Location Captured"}
                          </div>
                        ) : (
                          <div className="bg-slate-900/80 backdrop-blur-md text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center border border-slate-800">
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            Locating...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manual Location Search */}
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{LOCAL_CONTENT[language]?.loc_inaccurate || LOCAL_CONTENT.en.loc_inaccurate}</label>
                        <button onClick={requestLocation} className="text-[10px] text-indigo-400 font-bold hover:underline">{LOCAL_CONTENT[language]?.retry_gps || LOCAL_CONTENT.en.retry_gps}</button>
                      </div>
                      <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                        <input 
                          type="text"
                          placeholder={LOCAL_CONTENT[language]?.search_placeholder || LOCAL_CONTENT.en.search_placeholder}
                          className="w-full bg-[#0d1117] border border-slate-800 text-sm py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                          onChange={(e) => searchLocation(e.target.value)}
                        />
                      </div>
                      {locationResults.length > 0 && (
                        <div className="space-y-1 pt-1 max-h-40 overflow-y-auto">
                          {locationResults.map((res, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                setLocation({ lat: parseFloat(res.lat), lng: parseFloat(res.lon) });
                                setLocationName(res.display_name);
                                setLocationStatus("locked");
                                setLocationResults([]);
                              }}
                              className="w-full text-left p-3 rounded-lg hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                            >
                              <p className="text-xs font-bold text-slate-300 truncate">{res.display_name}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={skipPhoto} className="flex-1 py-4 bg-transparent border border-slate-800 text-slate-400 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">{t('skip')}</button>
                    <button onClick={capturePhoto} className="flex-[2] flex items-center justify-center bg-indigo-600 text-white text-sm font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                      <Camera className="w-4 h-4 mr-2" />
                      {t('take_photo')}
                    </button>
                  </div>
                </div>
              )}

              {step === "input-type" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300 max-w-2xl">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">{LOCAL_CONTENT[language]?.how_to_report || LOCAL_CONTENT.en.how_to_report}</h2>
                    <p className="text-sm text-slate-400">{LOCAL_CONTENT[language]?.method_desc || LOCAL_CONTENT.en.method_desc}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setStep("audio")} className="group bg-[#0d1117] p-8 rounded-2xl border border-slate-800/50 hover:border-indigo-500/40 transition-all text-center space-y-4">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Mic className="w-6 h-6" /></div>
                      <div><h3 className="text-base font-bold text-white">{t('voice_report')}</h3><p className="text-xs text-slate-500 mt-1">{LOCAL_CONTENT[language]?.audio_desc || LOCAL_CONTENT.en.audio_desc}</p></div>
                    </button>
                    <button onClick={() => setStep("text")} className="group bg-[#0d1117] p-8 rounded-2xl border border-slate-800/50 hover:border-emerald-500/40 transition-all text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Keyboard className="w-6 h-6" /></div>
                      <div><h3 className="text-base font-bold text-white">{t('text_report')}</h3><p className="text-xs text-slate-500 mt-1">{LOCAL_CONTENT[language]?.text_desc || LOCAL_CONTENT.en.text_desc}</p></div>
                    </button>
                  </div>
                </div>
              )}

              {step === "audio" && (
                <VoiceModule 
                  category={selectedCategory}
                  language={language}
                  onComplete={(transcript, blob) => {
                    setComplaintText(transcript);
                    uploadComplaint(blob as Blob, transcript);
                  }}
                  onCancel={() => setStep("input-type")}
                />
              )}

              {step === "text" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300 max-w-2xl mx-auto">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">{LOCAL_CONTENT[language]?.write_report || LOCAL_CONTENT.en.write_report}</h2>
                    <p className="text-sm text-slate-400">{LOCAL_CONTENT[language]?.provide_details || LOCAL_CONTENT.en.provide_details}</p>
                  </div>
                  <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder={LOCAL_CONTENT[language]?.describe_placeholder || LOCAL_CONTENT.en.describe_placeholder} className="w-full h-48 bg-[#0d1117] border border-slate-800 rounded-2xl p-6 text-sm text-white focus:border-indigo-500/30 outline-none transition-all placeholder-slate-700" />
                  <button onClick={handleTextSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-4 rounded-xl transition-all flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>{LOCAL_CONTENT[language]?.submit_report || LOCAL_CONTENT.en.submit_report}</span>
                  </button>
                </div>
              )}

              {step === "processing" && (
                <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Neural Transcription Active</h3>
                    <p className="text-xs text-slate-500 font-medium">AI is performing high-accuracy multilingual cleanup and PII scrubbing...</p>
                    <div className="flex items-center justify-center space-x-1 mt-4">
                       <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                       <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                       <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="py-10 space-y-8 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{LOCAL_CONTENT[language]?.report_logged || LOCAL_CONTENT.en.report_logged}</h2>
                    <p className="text-sm text-slate-400">{LOCAL_CONTENT[language]?.report_logged_desc || LOCAL_CONTENT.en.report_logged_desc}</p>
                  </div>
                  
                  {/* Digital Receipt Card */}
                  <div className="bg-[#0d1117] rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{LOCAL_CONTENT[language]?.secure_receipt || LOCAL_CONTENT.en.secure_receipt}</p>
                        <p className="text-sm font-mono font-bold text-white">{caseNumber}</p>
                      </div>
                      <Shield className="w-6 h-6 text-indigo-500/50" />
                    </div>
                    
                    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                      <div className="bg-white p-3 rounded-2xl shadow-xl shadow-indigo-500/10 transition-transform group-hover:scale-105">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${caseNumber}|${pin}&bgcolor=ffffff&color=0a0c10`} 
                          alt="QR Code" 
                          className="w-32 h-32"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{LOCAL_CONTENT[language]?.scan_qr || LOCAL_CONTENT.en.scan_qr}</p>
                    </div>

                    <div className="bg-[#161b22] border border-slate-800/50 p-5 rounded-2xl text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-xl"></div>
                      <p className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest mb-1">{LOCAL_CONTENT[language]?.access_pin || LOCAL_CONTENT.en.access_pin}</p>
                      <p className="text-4xl font-mono font-black text-white tracking-[0.3em]">{pin}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          alert("Receipt successfully saved to your digital gallery!");
                        }} 
                        className="flex-1 py-4 bg-[#161b22] hover:bg-slate-800 border border-slate-800 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 group"
                      >
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        <span>{LOCAL_CONTENT[language]?.save_btn || LOCAL_CONTENT.en.save_btn}</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('track')} 
                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                      >
                        {LOCAL_CONTENT[language]?.track_dashboard_btn || LOCAL_CONTENT.en.track_dashboard_btn}
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        setStep('category');
                        setSelectedCategory("");
                        setPhotoData(null);
                        setComplaintText("");
                        setPin(null);
                        setCaseNumber(null);
                      }} 
                      className="w-full py-4 bg-transparent hover:bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 group"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span>{LOCAL_CONTENT[language]?.report_another_btn || LOCAL_CONTENT.en.report_another_btn}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TRACK CASES TAB --- */}
          {activeTab === "track" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{LOCAL_CONTENT[language]?.recent_cases || LOCAL_CONTENT.en.recent_cases}</h2>
                  <p className="text-sm text-slate-400 mt-1">{LOCAL_CONTENT[language]?.recent_cases_desc || LOCAL_CONTENT.en.recent_cases_desc}</p>
                </div>
                <div className="bg-[#0d1117] px-4 py-2 rounded-xl border border-slate-800/50 flex items-center space-x-2">
                  <span className="text-indigo-400 font-bold text-sm">{myReports.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{LOCAL_CONTENT[language]?.reports_count_label || LOCAL_CONTENT.en.reports_count_label}</span>
                </div>
              </div>
              {myReports.length === 0 ? (
                <div className="py-20 text-center bg-[#0d1117]/50 rounded-2xl border border-slate-800/30 border-dashed">
                  <p className="text-sm text-slate-500">{t('no_cases')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myReports.map((report) => {
                    // Translate dynamic AI summary if it matches default pattern
                    let displaySummary = report.summary;
                    if (displaySummary && displaySummary.endsWith(" issue reported.")) {
                      const catId = displaySummary.replace(" issue reported.", "");
                      const cat = CATEGORIES.find(c => c.id === catId);
                      if (cat) {
                        displaySummary = `${t(cat.tKey)} ${LOCAL_CONTENT[language]?.issue_reported || LOCAL_CONTENT.en.issue_reported}`;
                      }
                    }
                    
                    return (
                    <div key={report._id} className="bg-[#0d1117] rounded-xl p-5 border border-slate-800/50 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className={`w-1.5 h-12 rounded-full hidden sm:block ${report.status === 'Resolved' ? 'bg-emerald-500' : report.status === 'Verified' ? 'bg-indigo-500' : report.status === 'Classified' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500'}`}></div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">{report.caseNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : report.status === 'Verified' ? 'bg-indigo-500/10 text-indigo-400' : report.status === 'Classified' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center' : 'bg-amber-500/10 text-amber-400'}`}>
                            {report.status === 'Classified' && <ShieldAlert className="w-3 h-3 mr-1" />}
                            {report.status === 'Classified' 
                              ? (LOCAL_CONTENT[language]?.status_classified || LOCAL_CONTENT.en.status_classified)
                              : report.status === 'Verified' ? (LOCAL_CONTENT[language]?.status_verified || LOCAL_CONTENT.en.status_verified)
                              : report.status === 'Resolved' ? (LOCAL_CONTENT[language]?.status_resolved || LOCAL_CONTENT.en.status_resolved)
                              : (LOCAL_CONTENT[language]?.status_pending || LOCAL_CONTENT.en.status_pending)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white">{displaySummary}</p>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                          {report.locationName && <span className="flex items-center text-indigo-400/80"><MapPin className="w-3 h-3 mr-1" /> {report.locationName}</span>}
                          <span className="flex items-center text-emerald-400 font-bold"><ThumbsUp className="w-3 h-3 mr-1" /> {report.supporters?.length || 0} {LOCAL_CONTENT[language]?.supports_label || LOCAL_CONTENT.en.supports_label}</span>
                        </div>

                        {/* Blockchain-Lite Trail */}
                        {report.hash && (
                          <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <Shield className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{LOCAL_CONTENT[language]?.audit_hash_label || LOCAL_CONTENT.en.audit_hash_label}</p>
                              <p className="text-[10px] font-mono text-emerald-400/80 truncate w-[200px] sm:w-[350px]">{report.hash}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        {report.status === 'Resolved' && (
                          <div className="flex space-x-2 mr-2 animate-in slide-in-from-right-4 duration-500">
                            <button 
                              onClick={() => handleResolution(report._id, 'Closed')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              {LOCAL_CONTENT[language]?.confirm_btn || LOCAL_CONTENT.en.confirm_btn}
                            </button>
                            <button 
                              onClick={() => handleResolution(report._id, 'Reopened')}
                              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                            >
                              {LOCAL_CONTENT[language]?.reopen_btn || LOCAL_CONTENT.en.reopen_btn}
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedComplaintForPdf(report)}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{LOCAL_CONTENT[language]?.pdf_btn || LOCAL_CONTENT.en.pdf_btn}</span>
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}
          
          {/* --- SUPPORT NEARBY TAB --- */}
          {activeTab === "support" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{LOCAL_CONTENT[language]?.nearby_grievances_title || LOCAL_CONTENT.en.nearby_grievances_title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{LOCAL_CONTENT[language]?.nearby_grievances_desc || LOCAL_CONTENT.en.nearby_grievances_desc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {nearbyLocationName && (
                    <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-100">{nearbyLocationName}</span>
                    </div>
                  )}
                  <button 
                    onClick={fetchNearbyComplaints}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Navigation className={`w-3 h-3 ${nearbyLocationName === 'Locating...' ? 'animate-spin' : ''}`} />
                    <span>{nearbyLocationName === 'Locating...' 
                      ? (LOCAL_CONTENT[language]?.locating_btn || LOCAL_CONTENT.en.locating_btn) 
                      : (LOCAL_CONTENT[language]?.refresh_btn || LOCAL_CONTENT.en.refresh_btn)}
                    </span>
                  </button>
                </div>
              </div>

              {nearbyComplaints.length === 0 ? (
                <div className="py-24 text-center bg-[#0d1117] rounded-3xl border border-slate-800/30 border-dashed space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400 font-bold">{LOCAL_CONTENT[language]?.no_issues_found || LOCAL_CONTENT.en.no_issues_found}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">{LOCAL_CONTENT[language]?.everything_looks_good || LOCAL_CONTENT.en.everything_looks_good}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nearbyComplaints.map((report) => {
                    // Translate dynamic AI summary if it matches default pattern
                    let displaySummary = report.summary;
                    if (displaySummary && displaySummary.endsWith(" issue reported.")) {
                      const catId = displaySummary.replace(" issue reported.", "");
                      const cat = CATEGORIES.find(c => c.id === catId);
                      if (cat) {
                        displaySummary = `${t(cat.tKey)} ${LOCAL_CONTENT[language]?.issue_reported || LOCAL_CONTENT.en.issue_reported}`;
                      }
                    }
                    
                    return (
                    <div key={report._id} className="bg-[#0d1117] rounded-3xl p-6 border border-slate-800/50 hover:border-indigo-500/20 transition-all group flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            {report.status === 'Classified' 
                              ? (LOCAL_CONTENT[language]?.status_classified || LOCAL_CONTENT.en.status_classified)
                              : report.status === 'Verified' ? (LOCAL_CONTENT[language]?.status_verified || LOCAL_CONTENT.en.status_verified)
                              : report.status === 'Resolved' ? (LOCAL_CONTENT[language]?.status_resolved || LOCAL_CONTENT.en.status_resolved)
                              : (LOCAL_CONTENT[language]?.status_pending || LOCAL_CONTENT.en.status_pending)}
                          </span>
                          <h3 className="text-base font-bold text-white line-clamp-1">{displaySummary}</h3>
                        </div>
                        <div className="bg-slate-800/50 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">
                          {Math.round(Math.random() * 5 + 1)}km
                        </div>
                      </div>
                      
                      <div className="flex-1 text-xs text-slate-500 line-clamp-2 italic">
                        "{report.transcript || (LOCAL_CONTENT[language]?.no_desc_provided || LOCAL_CONTENT.en.no_desc_provided)}"
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{report.supporters?.length || 0} {LOCAL_CONTENT[language]?.supports_label || LOCAL_CONTENT.en.supports_label}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleSupport(report._id)}
                          disabled={report.supporters?.some((s: any) => s.user?.toString() === user?._id)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            report.supporters?.some((s: any) => s.user?.toString() === user?._id)
                              ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/10'
                          }`}
                        >
                          {report.supporters?.some((s: any) => s.user?.toString() === user?._id) 
                            ? (LOCAL_CONTENT[language]?.supported_btn || LOCAL_CONTENT.en.supported_btn)
                            : (LOCAL_CONTENT[language]?.support_issue_btn || LOCAL_CONTENT.en.support_issue_btn)}
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {/* PDF Modal */}
          {selectedComplaintForPdf && (
            <PdfModal 
              complaint={selectedComplaintForPdf} 
              onClose={() => setSelectedComplaintForPdf(null)} 
            />
          )}

          {/* Support Verification Modal */}
          {supportComplaintId && (
            <SupportVerificationModal 
              complaintId={supportComplaintId}
              onClose={() => setSupportComplaintId(null)}
              onSuccess={onSupportSuccess}
            />
          )}

          {/* --- FEEDBACK TAB --- */}
          {activeTab === "feedback" && (
            <div className="max-w-3xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                  <MessageSquare className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight italic" style={{fontFamily: 'var(--font-jakarta)'}}>{t('feedback')}</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">{t('report_desc')}</p>
              </div>

              {/* Existing Feedbacks */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{t('active_cases')}</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>

                {loadingFeedback ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-indigo-500/30 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allFeedbacks.map((f, i) => (
                      <div key={i} className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-3xl space-y-3 hover:border-indigo-500/20 transition-all animate-in fade-in zoom-in-95" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('anonymous_id')}</span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-700">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">"{f.message}"</p>
                      </div>
                    ))}
                    {allFeedbacks.length === 0 && !loadingFeedback && (
                      <div className="col-span-full py-10 text-center text-slate-600">
                        <p className="text-xs font-black uppercase tracking-widest">{t('no_cases')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="space-y-8 pt-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-px flex-1 bg-indigo-500/20"></div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{t('shareYourThoughts')}</span>
                  <div className="h-px flex-1 bg-indigo-500/20"></div>
                </div>

                {!feedbackSuccess ? (
                  <div className="bg-[#0d1117] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!feedbackMessage.trim()) return;
                      setIsSubmittingFeedback(true);
                      try {
                        const res = await apiFetch("/feedback", {
                          method: "POST",
                          body: JSON.stringify({ message: feedbackMessage })
                        });
                        if (res.ok) {
                          setFeedbackSuccess(true);
                          setFeedbackMessage("");
                          fetchFeedbacks();
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSubmittingFeedback(false);
                      }
                    }} className="space-y-8">
                      <div className="space-y-4">
                        <textarea 
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          placeholder={t('feedbackPlaceholder')}
                          className="w-full h-40 bg-[#161b22] border border-slate-800 rounded-3xl p-8 text-slate-200 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-700 font-medium resize-none text-base leading-relaxed"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          type="button"
                          onClick={isRecordingFeedback ? stopFeedbackRecording : startFeedbackRecording}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border shadow-xl ${isRecordingFeedback ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                        >
                          {isRecordingFeedback ? <><Square className="w-4 h-4 fill-current" /> <span>{t('stop_recording')}</span></> : <><Mic className="w-4 h-4" /> <span>{t('voice_report')}</span></>}
                        </button>

                        <button 
                          type="submit"
                          disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 disabled:opacity-50"
                        >
                          {isSubmittingFeedback ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /><span>{t('submit')}</span></>}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-12 text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white italic">{t('success_title')}</h3>
                      <p className="text-slate-500 font-medium">{t('Thank you for your feedback!')}</p>
                    </div>
                    <button 
                      onClick={() => setFeedbackSuccess(false)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-800"
                    >
                      {t('report_another_btn')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
