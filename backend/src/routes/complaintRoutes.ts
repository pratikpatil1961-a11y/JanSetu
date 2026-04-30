import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint';

const router = express.Router();
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-safebridge';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Post Complaint
router.post('/', upload.single('audio'), async (req: any, res) => {
  try {
    const { category = 'General', photo, location: locationData, locationName, text: complaintText } = req.body;
    const audioFile = req.file;

    if (!audioFile && !complaintText) {
      return res.status(400).json({ error: "No audio or text description provided" });
    }

    let location = undefined;
    if (locationData) {
      try {
        location = JSON.parse(locationData);
      } catch (e) {}
    }

    // Auth check
    let userId = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    // AI Processing
    let aiResult;
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        let prompt = `
          You are an expert, multilingual grievance processing AI for a government platform.
          The user has tentatively categorized this issue as "${category}".
        `;

        if (audioFile) {
          prompt += `
          AUDIO ANALYSIS PROTOCOL:
          Listen to the attached audio recording with EXTREME precision. This is your PRIMARY source of truth.
          The audio may contain regional Indian languages (Hindi, Kannada, Marathi, Telugu, etc.) or a mix (Hinglish/Kanglish).
          
          1. Detect the specific language and dialect.
          2. Transcribe EVERY word spoken in the audio. DO NOT summarize yet; provide a full, faithful transcription.
          3. If the audio is not in English, translate the full transcript into clear, formal English while preserving the original intent and urgency.
          4. SCRUB and REMOVE any Personally Identifiable Information (PII) from the final transcript. Replace them with [REDACTED].
          `;
        } else {
          prompt += `
          Read the following text description: "${complaintText}". It may be in any language.
          
          1. If it is not in English, accurately translate it to English.
          2. Sanitize the text and SCRUB/REMOVE any Personally Identifiable Information (PII) like names, phone numbers, or exact street numbers. Replace them with [REDACTED].
          `;
        }

        prompt += `
          4. Provide a highly accurate, formal summary of the issue. The summary MUST reflect the exact, specific problem described in the audio/text without hallucinating extra details.
          5. Verify and assign exactly ONE category from this list: Water & Sanitation, Electricity, Roads & Infrastructure, Waste Management, Public Transport, Medical & Health, Corruption, Harassment, Other.
          6. Assign an urgency score from 1 to 10 (10 being immediate life-threatening danger, 1 being a minor inconvenience).
          7. SECURITY PROTOCOL: Analyze the context. If the complaint is explicitly accusing a high-ranking official, police officer, or local authority of systemic corruption, bribery, or abuse of power, set "isHighAuthorityCorruption" to true. 
          8. SENSITIVITY: If the content mentions harassment, sexual misconduct, or direct threats, set "isSensitive" to true.
          9. COMPLETENESS: Check if the user mentioned "WHERE" (location) and "WHEN" (time). Return a list of missing fields.

          Respond ONLY with a valid JSON object matching this schema exactly. Do not include markdown blocks outside the JSON:
          {
            "transcript": "English translated and scrubbed text here",
            "summary": "Highly accurate short summary",
            "category": "One of the specific categories listed above",
            "urgencyScore": 5,
            "isHighAuthorityCorruption": false,
            "isSensitive": false,
            "missingDetails": ["location", "time"]
          }
        `;

        const content: any[] = [];
        if (audioFile) {
          content.push({
            inlineData: {
              mimeType: audioFile.mimetype || "audio/webm",
              data: audioFile.buffer.toString('base64')
            }
          });
        }
        content.push(prompt);

        const result = await model.generateContent(content);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*?}/);
        const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```/g, '') : "{}";
        aiResult = JSON.parse(jsonString);
      } catch (aiError) {
        console.error("AI Error (Quota/Overload). Falling back to simulated result.", aiError);
        aiResult = {
          transcript: "Simulated transcript: [REDACTED] reported an issue regarding " + category + ".",
          summary: category + " issue reported.",
          category: category,
          urgencyScore: 7
        };
      }
    } else {
      aiResult = {
        transcript: "Simulated transcript: [REDACTED] reported an issue regarding " + category + ".",
        summary: category + " issue reported.",
        category: category,
        urgencyScore: 7
      };
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const caseNumber = 'CAS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    const dataToHash = `${caseNumber}-${pin}-${aiResult.summary}-${aiResult.category}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Normalize Category & Assign Department
    let matchedCategory = Object.keys(CATEGORY_TO_DEPARTMENT).find(
      c => c.toLowerCase() === aiResult.category?.toLowerCase()
    ) || "Other";
    
    let department = CATEGORY_TO_DEPARTMENT[matchedCategory] || "GA";
    let initialStatus = 'Pending Validation';

    // SHADOW PROTOCOL: Override routing and visibility for high-authority corruption
    if (aiResult.isHighAuthorityCorruption) {
      department = 'Super Admin';
      initialStatus = 'Classified';
    }

    const complaintData: any = {
      caseNumber,
      pin,
      transcript: aiResult.transcript,
      summary: aiResult.summary,
      category: matchedCategory,
      department,
      urgencyScore: aiResult.urgencyScore,
      hash,
      status: initialStatus,
      isSensitive: aiResult.isSensitive || false,
      missingDetails: aiResult.missingDetails || []
    };

    if (userId) complaintData.userId = userId;
    if (photo) complaintData.photoUrl = photo;
    
    // Auto-classify for sensitivity
    if (aiResult.isSensitive || aiResult.isHighAuthorityCorruption) {
      complaintData.status = 'Classified';
      complaintData.department = 'Super Admin';
    }
    if (location && location.lat && location.lng) {
      complaintData.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }
    if (locationName) complaintData.locationName = locationName;

    const complaint = await Complaint.create(complaintData);

    res.json({ success: true, caseNumber, pin, complaintId: complaint._id });

  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Nearby Complaints
router.get('/nearby', async (req: any, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // Default 10km
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const complaints = await Complaint.find({
      status: { $ne: 'Classified' },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
          $maxDistance: parseInt(radius as string)
        }
      }
    });

    res.json({ success: true, complaints });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Haversine Distance (in meters)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Support a Complaint
router.post('/:id/support', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { photo, location: locationStr } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!photo) {
      return res.status(400).json({ error: "Verification photo is required to support" });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // Location Validation & Distance Check
    if (!locationStr) {
      return res.status(400).json({ error: "High-accuracy GPS location is required" });
    }

    const supporterLoc = JSON.parse(locationStr);
    
    // Check Distance if complaint has location
    if (complaint.location && complaint.location.coordinates) {
      const [compLng, compLat] = complaint.location.coordinates;
      const distance = getDistance(supporterLoc.lat, supporterLoc.lng, compLat, compLng);

      // Max 200 meters for validation
      if (distance > 200) {
        return res.status(403).json({ 
          error: "Verification Failed", 
          details: `You must be within 200m of the site to support. Current distance: ${Math.round(distance)}m` 
        });
      }
    }

    // Check if already supported
    const alreadySupported = complaint.supporters.some((s: any) => s.user.toString() === userId);
    if (alreadySupported) {
      return res.status(400).json({ error: "You have already supported this grievance" });
    }

    complaint.supporters.push({
      user: userId,
      verificationPhoto: photo,
      location: supporterLoc
    });

    await complaint.save();
    res.json({ success: true, supportersCount: complaint.supporters.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy Geocode to avoid CORS/User-Agent issues
router.get('/proxy/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`, {
      headers: {
        'User-Agent': 'JanSetu-App/1.0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy Search to allow manual location correction
router.get('/proxy/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query" });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q as string)}&limit=5`, {
      headers: {
        'User-Agent': 'JanSetu-App/1.0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const CATEGORY_TO_DEPARTMENT: Record<string, string> = {
  "Water & Sanitation": "DPH",
  "Electricity": "DoP",
  "Roads & Infrastructure": "PWD",
  "Waste Management": "MC",
  "Public Transport": "TD",
  "Medical & Health": "HD",
  "Corruption": "VP",
  "Harassment": "VP",
  "Other": "GA"
};

// Get Complaints
router.get('/', async (req: any, res) => {
  try {
    const { status, myReports } = req.query;
    const authHeader = req.headers.authorization;
    let query: any = {};
    
    if (status) {
      query.status = status;
    } else {
      // By default, don't show classified reports to anyone through this endpoint
      // except if explicitly requested and user has rights (simplified for now)
      query.status = { $ne: 'Classified' };
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // If citizen wants only their reports
      if (myReports === 'true') {
        query.userId = decoded.userId;
      } 
      // If official, filter by department
      else if (decoded.role === 'official') {
        // Import User model if not already imported (it's not)
        const User = (await import('../models/User')).default;
        const user = await User.findById(decoded.userId);
        if (user && user.department) {
          query.department = user.department;
        }
      }
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Patch Complaint
router.patch('/', async (req, res) => {
  try {
    const { id, newStatus } = req.body;
    if (!id || !newStatus) {
      return res.status(400).json({ error: "Missing id or newStatus" });
    }
    const complaint = await Complaint.findByIdAndUpdate(id, { status: newStatus }, { new: true });
    res.json({ success: true, complaint });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
