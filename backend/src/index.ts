import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnect from './lib/mongodb';
import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import pdfRoutes from './routes/pdfRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import adminRoutes from './routes/adminRoutes';
import faceAuthRoutes from './routes/faceAuthRoutes';
import ngoRoutes from './routes/ngoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow Next.js frontend
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', faceAuthRoutes);
app.use('/api/ngo', ngoRoutes);

app.get('/', (req, res) => {
  res.send('SafeBridge API Server is running...');
});

// Database connection & Server Start
dbConnect()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
