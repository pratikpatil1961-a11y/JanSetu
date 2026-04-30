import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-safebridge';

router.post('/', async (req, res) => {
  try {
    const { message, language, history } = req.body;
    const authHeader = req.headers.authorization;

    let role = 'citizen';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        role = decoded.role || 'citizen';
      } catch (e) {}
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ response: "I'm sorry, I'm currently offline. Please try again later." });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const langNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi',
        kn: 'Kannada',
        mr: 'Marathi',
        te: 'Telugu'
      };
      const targetLang = langNames[language as string] || 'English';

      const context = role === 'citizen' 
        ? `You are JanSetu Helper, a chatbot for a grievance reporting platform. You help citizens report issues (Water, Roads, Electricity, etc.) anonymously using voice or text. Explain that they can generate an ID, track status with a PIN, and that their privacy is protected. Keep responses brief and helpful. IMPORTANT: You MUST respond ONLY in ${targetLang}.`
        : `You are JanSetu Official Assistant. You help government officials handle complaints, understand department routing, and update grievance statuses. Provide technical and administrative assistance for resolving issues efficiently. IMPORTANT: You MUST respond ONLY in ${targetLang}.`;

      let conversationHistory = "";
      if (history && Array.isArray(history) && history.length > 0) {
        conversationHistory = "Conversation History:\n" + history.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Helper'}: ${msg.text}`).join('\n') + "\n\n";
      }

      const prompt = `Context: ${context}\n\n${conversationHistory}User Question: ${message}\nHelpful ${targetLang} Response:`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      res.json({ response: responseText });
    } catch (aiError: any) {
      console.error("Chatbot AI Error (Quota/Overload):", aiError.message);
      
      let cleanMessage = "I'm currently experiencing high traffic. Please try again in a moment.";
      if (aiError.message?.includes('503') || aiError.message?.includes('high demand')) {
        cleanMessage = "The JanSetu AI helper is currently experiencing a high volume of requests due to high demand. Please wait a moment and try again.";
      } else if (aiError.message?.includes('429') || aiError.message?.includes('quota')) {
        cleanMessage = "I have reached my maximum request limit for the day. Please try again later.";
      }

      res.json({ response: cleanMessage });
    }
  } catch (error: any) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
