import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-safebridge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const category = formData.get('category') as string || 'General';
    const photoData = formData.get('photo') as string; // Base64
    const locationData = formData.get('location') as string;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 1. Convert Audio to Base64 for Gemini
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Handle Photo upload (simulated local storage for MVP)
    let photoUrl = undefined;
    if (photoData && photoData.startsWith('data:image')) {
      photoUrl = photoData; // Store base64 directly or implement save logic
      // In a real app, upload to S3 and save the URL.
    }

    let location = undefined;
    if (locationData) {
      try {
        location = JSON.parse(locationData);
      } catch (e) {}
    }

    // Attempt to get user ID from token
    let userId = undefined;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth-token')?.value;
      if (token) {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (e) {
      // Allow anonymous submission if token fails
    }

    // 2. Call Gemini for AI Processing (Transcription, PII Scrubbing, Summarization)
    let aiResult;
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are a grievance processing AI. Listen to the audio. 
        The user has categorized this issue as "${category}".
        1. Transcribe the audio but SCRUB/REMOVE any Personally Identifiable Information (PII) like names, phone numbers, or exact addresses. Replace them with [REDACTED].
        2. Provide a short, formal summary of the issue.
        3. Verify the category or provide a better one if needed.
        4. Assign an urgency score from 1 to 10 (10 being immediate life-threatening danger).
        
        Respond ONLY with a valid JSON object matching this schema exactly:
        {
          "transcript": "scrubbed text here",
          "summary": "short summary",
          "category": "category name",
          "urgencyScore": 5
        }
      `;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: audioFile.type || "audio/webm",
            data: base64Data
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*?}/);
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```/g, '') : "{}";
      aiResult = JSON.parse(jsonString);
    } else {
      aiResult = {
        transcript: "Simulated transcript: [REDACTED] reported an issue regarding " + category + ".",
        summary: category + " issue reported.",
        category: category,
        urgencyScore: 7
      };
    }

    // 3. Connect to Database & Generate PIN & Case Number
    await dbConnect();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const caseNumber = 'CAS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    // 4. Create Blockchain-lite Hash (Tamper-proof log)
    const dataToHash = `${caseNumber}-${pin}-${aiResult.summary}-${aiResult.category}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // 5. Save to MongoDB
    const complaintData: any = {
      caseNumber,
      pin,
      transcript: aiResult.transcript,
      summary: aiResult.summary,
      category: aiResult.category,
      urgencyScore: aiResult.urgencyScore,
      hash,
      status: 'Pending Validation'
    };

    if (userId) complaintData.userId = userId;
    if (photoUrl) complaintData.photoUrl = photoUrl;
    if (location) complaintData.location = location;

    const complaint = await Complaint.create(complaintData);

    return NextResponse.json({ success: true, caseNumber, pin, complaintId: complaint._id });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const myReports = url.searchParams.get("myReports");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }

    if (myReports === 'true') {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (token) {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          query.userId = decoded.userId;
        } else {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ complaints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, newStatus } = body;

    if (!id || !newStatus) {
      return NextResponse.json({ error: "Missing id or newStatus" }, { status: 400 });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
