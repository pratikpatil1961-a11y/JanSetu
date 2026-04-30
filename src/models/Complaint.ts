import mongoose from 'mongoose';

export interface IComplaint extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  pin: string;
  originalAudioUrl?: string;
  photoUrl?: string;
  location?: { lat: number; lng: number };
  transcript?: string;
  summary: string;
  category: string;
  urgencyScore: number;
  status: 'Pending Validation' | 'Verified' | 'Resolved';
  hash: string;
  createdAt: Date;
}

const ComplaintSchema = new mongoose.Schema<IComplaint>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pin: { type: String, required: true, unique: true },
  originalAudioUrl: { type: String }, // Optional for MVP, since we might just process memory buffers
  photoUrl: { type: String },
  location: { 
    lat: { type: Number },
    lng: { type: Number }
  },
  transcript: { type: String }, // Scrubbed transcript
  summary: { type: String, required: true },
  category: { type: String, required: true },
  urgencyScore: { type: Number, required: true, min: 1, max: 10 },
  status: { 
    type: String, 
    enum: ['Pending Validation', 'Verified', 'Resolved'], 
    default: 'Pending Validation' 
  },
  hash: { type: String, required: true }, // The blockchain-lite tamper-proof hash
}, { timestamps: true });

export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
