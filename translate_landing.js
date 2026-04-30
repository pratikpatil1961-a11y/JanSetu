const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCANcqrY1sslobrQfFe_xXDrSnqjRJVc8E');

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Translate the following English UI strings into Hindi (hi), Kannada (kn), Marathi (mr), and Telugu (te).
Output ONLY valid JSON containing a single object where the keys are the languages 'hi', 'kn', 'mr', 'te'. Each language object should have the exact same keys as the English one.
Do NOT wrap in markdown. Just output raw JSON.

English JSON:
{
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
}
`;
    const result = await model.generateContent(prompt);
    require('fs').writeFileSync('translations.json', result.response.text(), 'utf8');
    console.log('Saved to translations.json');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
