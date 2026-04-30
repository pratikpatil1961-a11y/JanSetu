import express from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper: Calculate Euclidean distance between two vectors
const getDistance = (v1: number[], v2: number[]) => {
  return Math.sqrt(v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0));
};

// @route   POST /api/auth/face-register
// @desc    Register a user's face embedding
router.post('/face-register', async (req, res) => {
  try {
    const { userId, embedding } = req.body;

    if (!userId || !embedding || embedding.length !== 128) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.facialEmbedding = embedding;
    user.isFaceRegistered = true;
    await user.save();

    res.json({ success: true, message: 'Face registered successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/face-login
// @desc    Authenticate using face embedding
router.post('/face-login', async (req, res) => {
  try {
    const { embedding } = req.body;

    if (!embedding || embedding.length !== 128) {
      return res.status(400).json({ message: 'Invalid embedding' });
    }

    // Fetch all users with registered faces
    const users = await User.find({ isFaceRegistered: true, facialEmbedding: { $exists: true, $ne: [] } }).select('+facialEmbedding');

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'No registered faces found in database' });
    }

    let bestMatch = null;
    let minDistance = 0.45; // Tightened threshold (0.6 is too loose for some environments)

    for (const user of users) {
      if (user.facialEmbedding && user.facialEmbedding.length === 128) {
        const distance = getDistance(embedding, user.facialEmbedding);
        console.log(`Matching against User ID: ${user._id}, Distance: ${distance}`);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = user;
        }
      }
    }

    if (!bestMatch) {
      console.log('No match found for the provided face embedding.');
      return res.status(401).json({ success: false, message: 'Face not recognized. Access denied.' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: bestMatch._id, role: bestMatch.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: bestMatch._id,
        role: bestMatch.role,
        anonymousId: bestMatch.anonymousId
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
