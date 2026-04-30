import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-safebridge';

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      role, email, password, ngoName, ngoType, 
      registrationId, operationalArea, phone, 
      representative, description, website 
    } = req.body;
    const userRole = role || 'citizen';

    if (userRole === 'ngo') {
      if (!email || !password || !ngoName || !ngoType || !phone) {
        return res.status(400).json({ error: "Required fields missing for NGO registration" });
      }
      
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Account already exists with this email" });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const user = await User.create({
        email,
        passwordHash,
        role: 'ngo',
        ngoName,
        ngoType,
        registrationId,
        operationalArea,
        phone,
        representative,
        description,
        website,
        ngoStatus: 'Unverified' // Default status
      });

      const token = jwt.sign(
        { userId: user._id, role: user.role, ngoName: user.ngoName },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({ 
        success: true, 
        message: "NGO registered successfully. Pending verification.", 
        token, 
        role: user.role 
      });
    }

    if (userRole === 'citizen') {
      const anonymousId = 'JAN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const secretKey = 'key-' + crypto.randomBytes(8).toString('hex');
      
      const salt = await bcrypt.genSalt(8);
      const passwordHash = await bcrypt.hash(secretKey, salt);

      const user = await User.create({
        anonymousId,
        passwordHash,
        role: 'citizen'
      });

      return res.json({ 
        success: true, 
        userId: user._id,
        anonymousId, 
        secretKey,
        message: "Anonymous identity generated." 
      });
    }

    if (userRole === 'official' || userRole === 'admin' || userRole === 'anganwadi') {
      const { email, password, department } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Account already exists with this email" });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email,
        passwordHash,
        role: userRole,
        department: department
      });

      return res.json({ 
        success: true, 
        message: "Account registered successfully." 
      });
    }

    // If no block matched
    return res.status(400).json({ error: "Invalid role specified" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { anonymousId, secretKey, email, password } = req.body;

    let user;
    if (email && password) {
      // Official/Email Login
      user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Invalid email or password" });
      
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });
    } else if (anonymousId && secretKey) {
      // Citizen/Anonymous Login
      user = await User.findOne({ anonymousId });
      if (!user) return res.status(401).json({ error: "Invalid ID or Key" });

      const isMatch = await bcrypt.compare(secretKey, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: "Invalid ID or Key" });
    } else {
      return res.status(400).json({ error: "Missing login credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, department: user.department, anonymousId: user.anonymousId, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, role: user.role, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, user: decoded });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
