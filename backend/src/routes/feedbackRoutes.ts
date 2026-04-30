import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Feedback from '../models/Feedback';

const router = express.Router();
const upload = multer();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', upload.single('audio'), async (req: any, res) => {
  try {
    let { message } = req.body;
    const audioFile = req.file;

    console.log("Feedback Request:", { hasMessage: !!message, hasAudio: !!audioFile });

    if (!message && !audioFile) {
      return res.status(400).json({ error: "Feedback message or audio is required" });
    }

    // AI Transcription if audio exists
    if (audioFile && process.env.GEMINI_API_KEY) {
      try {
        console.log("Feedback Audio Received:", { 
          mimetype: audioFile.mimetype, 
          size: audioFile.size,
          bufferLength: audioFile.buffer.length 
        });

        if (audioFile.size < 100) {
           console.warn("Audio file is suspiciously small.");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `
          Listen to the attached audio and transcribe it into clear English text.
          If the audio is in another language, translate it faithfully to English.
          Return ONLY the transcribed text. If there is no speech, return an empty string.
        `;
        
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "audio/webm", // Gemini works best with this for webm/opus
              data: audioFile.buffer.toString('base64')
            }
          },
          prompt
        ]);
        
        const transcribedText = result.response.text().trim();
        console.log("Gemini Response:", transcribedText);
        
        if (transcribedText) {
          message = transcribedText;
        } else {
          console.warn("Gemini returned empty text.");
          if (!message) return res.status(400).json({ error: "Could not detect any speech in the audio. Please try again." });
        }
      } catch (err: any) {
        console.error("Gemini Transcription Error:", err.message);
        if (!message) {
          return res.status(500).json({ error: "AI Transcription failed. Please type your feedback or try again." });
        }
      }
    }

    if (!message) {
      return res.status(400).json({ error: "No message could be extracted from audio" });
    }

    const newFeedback = await Feedback.create({ message });
    console.log("Feedback Saved:", newFeedback._id);
    res.json({ success: true, message: "Thank you for your feedback!", feedback: newFeedback });
  } catch (error: any) {
    console.error("Feedback Route Fatal Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, feedbacks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
