const fs = require('fs');

const oldHeroContentBlock = `  en: {
    taglines: [
      "Every complaint deserves an answer.",
      "Anonymous. Accountable. Unstoppable.",
      "Give your voice the power it deserves.",
      "From silence to resolution — in hours."
    ],
    desc: "AI-powered voice reporting, biometric identity, and real-time transparency — empowering every citizen without compromising privacy.",
    btn_file: "File Complaint",
    btn_track: "Track Status"
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
    btn_track: "स्थिति ट्रैक करें"
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
    btn_track: "ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ"
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
    btn_track: "स्थिती ट्रॅक करा"
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
    btn_track: "స్థితిని ట్రాక్ చేయండి"
  }`;

// Create an object to store this old data
const oldHeroContentDict = {};
const matchRegex = /(\w+):\s*\{\s*taglines:\s*\[([\s\S]*?)\],\s*desc:\s*"(.*?)",\s*btn_file:\s*"(.*?)",\s*btn_track:\s*"(.*?)"\s*\}/g;
let match;
while ((match = matchRegex.exec(oldHeroContentBlock)) !== null) {
  oldHeroContentDict[match[1]] = {
    taglines: `[${match[2]}]`,
    desc: match[3],
    btn_file: match[4],
    btn_track: match[5]
  };
}

let code = fs.readFileSync('frontend/src/app/page.tsx', 'utf-8');
const translations = JSON.parse(fs.readFileSync('translations.json', 'utf-8'));

translations.en = {
    "trackTitle": "The Justice Track",
    "trackSubtitle": "A step-by-step journey from grievance to accountability",
    "step1Title": "Report",
    "step1Desc": "Citizen reports grievance anonymously using AI Voice technology.",
    "step1Badge": "Citizen Portal",
    "step2Title": "Observe",
    "step2Desc": "NGOs verify grounds and add supplemental field evidence.",
    "step2Badge": "NGO Support",
    "step3Title": "Resolve",
    "step3Desc": "Officials coordinate and finalize departmental resolution.",
    "step3Badge": "Official Mission",
    "step4Title": "Oversight",
    "step4Desc": "Admins monitor performance and maintain system transparency.",
    "step4Badge": "Admin Dashboard",
    "quantumTitle": "Quantum Encryption",
    "quantumDesc": "Every data node is protected by multi-layer cryptographic hashing, ensuring citizen anonymity is mathematically unbreakable.",
    "visionTitle": "The JanSetu Vision",
    "instTitle": "Institutional Transparency",
    "instDesc": "JanSetu is more than a portal; it's a social contract digitized. We believe that technology should be the shield of the citizen and the sword of accountability.",
    "digIdTitle": "Digital Identity",
    "digIdDesc": "Passwordless face-recognition ensuring secure, identity-first access.",
    "agileTitle": "Agile Routing",
    "agileDesc": "Automatic grievance dispatching to localized administrative nodes.",
    "analyticsTitle": "Deep Analytics",
    "analyticsDesc": "Predictive trend analysis to identify regional issue patterns.",
    "ngoIncTitle": "NGO Inclusion",
    "ngoIncDesc": "Verified organizations acting as observers for community trust.",
    "impactTitle": "Social Impact",
    "impactSubtitle": "Documenting the shift in governance",
    "livesImpacted": "Lives Impacted",
    "avgRes": "Avg. Resolution",
    "partnerNgos": "Partner NGOs",
    "footerDesc": "The futuristic bridge for digital governance and social accountability.",
    "archTitle": "Architecture",
    "arch1": "Neural Nodes",
    "arch2": "Quantum Security",
    "arch3": "Agile Pipeline",
    "transTitle": "Transparency",
    "trans1": "Public Audit",
    "trans2": "NGO Logs",
    "trans3": "Trust Index",
    "supportTitle": "Support",
    "support1": "1800-JAN-SETU",
    "support2": "Emergency Node",
    "support3": "Technical Hub",
    "footerBottom": "JanSetu v3.0 • Institutional Infrastructure • 2026",
    "supportHubTitle": "Institutional Support",
    "emergencyControl": "Emergency Mission Control",
    "nodeSupport": "Digital Node Support",
    "connectBtn": "Connect to Node",
    "stat1": "Platform Nodes",
    "stat2": "Uptime",
    "stat3": "Avg. Resolution",
    "stat4": "Trust Index"
};

const startIndex = code.indexOf('const HERO_CONTENT: Record<string');
const endIndex = code.indexOf('};', startIndex) + 2;
const currentHeroContent = code.substring(startIndex, endIndex);

let newContentBlock = `const HERO_CONTENT: Record<string, any> = {\n`;
for (const lang of ['en', 'hi', 'kn', 'mr', 'te']) {
    newContentBlock += `  ${lang}: {\n`;
    
    // Add existing taglines etc
    const old = oldHeroContentDict[lang];
    if (old) {
       newContentBlock += `    taglines: ${old.taglines},\n`;
       newContentBlock += `    desc: "${old.desc}",\n`;
       newContentBlock += `    btn_file: "${old.btn_file}",\n`;
       newContentBlock += `    btn_track: "${old.btn_track}",\n`;
    }
    
    // Append the new translations
    const t = translations[lang];
    for (const key in t) {
       newContentBlock += `    ${key}: ${JSON.stringify(t[key])},\n`;
    }
    newContentBlock += `  },\n`;
}
newContentBlock += `};`;

code = code.replace(currentHeroContent, newContentBlock);

fs.writeFileSync('frontend/src/app/page.tsx', code);
console.log("Successfully patched page.tsx dictionary!");
