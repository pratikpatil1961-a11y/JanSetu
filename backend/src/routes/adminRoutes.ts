import express from 'express';
import Complaint from '../models/Complaint';
import Feedback from '../models/Feedback';

const router = express.Router();

// Get overall stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const statusBreakdown = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const categoryBreakdown = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    // Last 7 days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        statusBreakdown,
        categoryBreakdown,
        trend
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
