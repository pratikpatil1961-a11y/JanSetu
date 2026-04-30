import express from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth to all routes
router.use(authenticate);
router.use(authorize(['ngo']));

// @route   GET /api/ngo/stats
// @desc    Get NGO activity stats (No trust score control)
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const ngoId = req.user?.userId;
    
    const evidenceCount = await Complaint.countDocuments({ "ngoEvidence.ngoId": ngoId });
    const flaggedCount = await Complaint.countDocuments({ "ngoEvidence.ngoId": ngoId, "ngoEvidence.flagged": true });

    res.json({
      success: true,
      stats: {
        evidenceAdded: evidenceCount,
        flagged: flaggedCount,
        jurisdiction: "10km Radius"
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/ngo/insights
// @desc    Get trend insights for the area
router.get('/insights', async (req: AuthRequest, res) => {
  try {
    const trends = await Complaint.aggregate([
      { $match: { status: { $ne: 'Classified' } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const statusDistribution = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({ success: true, trends, statusDistribution });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/ngo/complaints
// @desc    View local complaints (Read-only)
router.get('/complaints', async (req: AuthRequest, res) => {
  try {
    const { status, priority } = req.query;
    let query: any = { status: { $ne: 'Classified' } };

    if (status) query.status = status;
    if (priority) query.urgencyScore = { $gte: parseInt(priority as string) };

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/ngo/add-evidence/:id
// @desc    Upload supporting evidence (No verification authority)
router.post('/add-evidence/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { media, comment, flagged } = req.body;
    const ngoId = req.user?.userId;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // NGOs cannot change status, only add evidence/comments
    complaint.ngoEvidence.push({
      ngoId: ngoId as any,
      media: media || [],
      comment: comment || "",
      flagged: flagged || false
    });

    if (flagged) {
      complaint.needsAttention = true;
    }

    await complaint.save();
    res.json({ success: true, message: "Supporting evidence added as 'NGO Observation'" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
