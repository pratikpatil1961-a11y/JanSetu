import mongoose from 'mongoose';

export interface IComplaint extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  caseNumber: string;
  pin: string;
  originalAudioUrl?: string;
  photoUrl?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  locationName?: string;
  transcript?: string;
  summary: string;
  category: string;
  department: string;
  urgencyScore: number;
  status: 'Pending Validation' | 'Verified' | 'Resolved' | 'Closed' | 'Reopened' | 'Classified';
  supporters: any[];
  hash: string;
  isSensitive?: boolean;
  missingDetails?: string[];
  ngoEvidence: {
    ngoId: mongoose.Types.ObjectId;
    media: string[];
    comment: string;
    flagged: boolean;
    createdAt: Date;
  }[];
  needsAttention: boolean;
  createdAt: Date;
}

const ComplaintSchema = new mongoose.Schema<IComplaint>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caseNumber: { type: String, required: true, unique: true },
  pin: { type: String, required: true, unique: true },
  originalAudioUrl: { type: String },
  photoUrl: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  locationName: { type: String },
  transcript: { type: String },
  summary: { type: String, required: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  urgencyScore: { type: Number, required: true, min: 1, max: 10 },
  status: {
    type: String,
    enum: ['Pending Validation', 'Verified', 'Resolved', 'Closed', 'Reopened', 'Classified'],
    default: 'Pending Validation'
  },
  supporters: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationPhoto: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  hash: { type: String, required: true },
  isSensitive: { type: Boolean, default: false },
  missingDetails: [{ type: String }],
  
  // NGO Supporting System (Limited Access)
  ngoEvidence: [{
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    media: [{ type: String }],
    comment: { type: String },
    flagged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  needsAttention: { type: Boolean, default: false },
}, { timestamps: true });

// Add Geospatial Index
ComplaintSchema.index({ location: "2dsphere" });

export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
