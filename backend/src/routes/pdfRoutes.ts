import express from 'express';
import PDFDocument from 'pdfkit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Complaint from '../models/Complaint';
import jwt from 'jsonwebtoken';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-safebridge';

router.post('/generate', async (req, res) => {
  try {
    const { complaintId, type } = req.body; // type: 'summary' or 'full'
    if (!complaintId) return res.status(400).json({ error: "Missing complaintId" });

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // AI Analysis (Detailed)
    let aiInsight = { 
      summary: "", 
      solution: "",
      priority: "Medium",
      effort: "Moderate",
      legalContext: "As per Citizen Charter Section 4.2"
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("Initiating Deep AI Analysis for complaint:", complaintId);
        // Initialize inside to ensure env vars are ready
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
          Perform an institutional analysis on this grievance:
          Category: ${complaint.category}
          Summary: ${complaint.summary}
          Description: ${complaint.transcript}
          Status: ${complaint.status}
          
          Provide a detailed response in JSON format only:
          {
            "summary": "2-sentence executive summary",
            "priority": "Low/Medium/High/Emergency",
            "effort": "Easy/Moderate/Complex",
            "solution": "Step-by-step resolution plan for the department",
            "legalContext": "Mention relevant municipal or civic policy context"
          }
        `;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          aiInsight = JSON.parse(jsonMatch[0]);
          console.log("Deep AI Analysis completed successfully");
        }
      } catch (aiError: any) {
        console.error("AI Analysis Error:", aiError.message);
        aiInsight.summary = "AI analysis currently unavailable. Manual review required.";
        aiInsight.solution = "Official should conduct site inspection and verify coordinates.";
      }
    }
 else {
      console.log("GEMINI_API_KEY missing, skipping AI summary");
      aiInsight = { 
        summary: "AI Summary is disabled (API Key missing).", 
        solution: "Please check system configuration.",
        priority: "Medium",
        effort: "Moderate",
        legalContext: "Manual review required."
      };
    }

    if (type === 'summary') {
      return res.json({ success: true, aiInsight });
    }

    // Generate Full PDF
    const doc = new PDFDocument({ margin: 50 });
    let filename = `Complaint_${complaint.caseNumber}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(25).text('JanSetu Grievance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Sections
    doc.fontSize(16).fillColor('#4f46e5').text('General Information');
    doc.fontSize(12).fillColor('black').text(`Complaint ID: ${complaint._id}`);
    doc.text(`Case Number: ${complaint.caseNumber}`);
    doc.text(`Citizen ID: ${complaint.userId || 'Anonymous'}`);
    doc.text(`Status: ${complaint.status}`);
    doc.moveDown();

    doc.fontSize(16).fillColor('#4f46e5').text('Issue Details');
    doc.fontSize(12).fillColor('black').text(`Category: ${complaint.category}`);
    doc.text(`Department: ${complaint.department}`);
    doc.text(`Summary: ${complaint.summary}`);
    doc.text(`Description: ${complaint.transcript || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(16).fillColor('#4f46e5').text('Location & Support');
    doc.fontSize(12).fillColor('black').text(`Location Name: ${complaint.locationName || 'Not specified'}`);
    doc.text(`Support Count: ${complaint.supporters?.length || 0}`);
    doc.moveDown();

    if (aiInsight.summary) {
      doc.addPage(); // Start AI analysis on a fresh page
      doc.fontSize(18).fillColor('#10b981').text('Institutional AI Analysis');
      doc.moveDown();

      // Summary
      doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text('Executive Summary:');
      doc.font('Helvetica').text(aiInsight.summary);
      doc.moveDown();

      // Metrics Grid
      doc.fontSize(12).font('Helvetica-Bold').text('Operational Metrics:');
      doc.font('Helvetica');
      doc.text(`- Priority Level: `, { continued: true }).fillColor(aiInsight.priority === 'Emergency' || aiInsight.priority === 'High' ? '#ef4444' : '#4f46e5').text(aiInsight.priority);
      doc.fillColor('black').text(`- Implementation Effort: ${aiInsight.effort}`);
      doc.text(`- Legal/Policy Context: ${aiInsight.legalContext}`);
      doc.moveDown();

      // Solution
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#10b981').text('Proposed Resolution Plan:');
      doc.fontSize(11).font('Helvetica').fillColor('black').text(aiInsight.solution);
      doc.moveDown();

      doc.fontSize(10).fillColor('#64748b').font('Helvetica-Oblique').text('Note: This analysis is AI-generated and should be verified by a department official before execution.');
    }

    doc.end();

  } catch (error: any) {
    console.error("PDF Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
