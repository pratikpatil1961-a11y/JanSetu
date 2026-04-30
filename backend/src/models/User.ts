import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  anonymousId?: string;
  email?: string;
  passwordHash: string; // Stores the hashed secret key or password
  role: 'citizen' | 'official' | 'admin' | 'anganwadi';
  department?: string; // For officials/anganwadi
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  anonymousId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'official', 'admin', 'anganwadi', 'ngo'], 
    default: 'citizen' 
  },
  department: { type: String }, // Assign department to official
  
  // NGO Profile
  ngoName: { type: String },
  ngoType: { type: String, enum: ['Registered NGO', 'Community Group', 'Volunteer Group', 'Trust'] },
  registrationId: { type: String },
  operationalArea: {
    city: { type: String },
    state: { type: String }
  },
  phone: { type: String },
  representative: {
    name: { type: String },
    role: { type: String }
  },
  description: { type: String },
  website: { type: String },
  ngoStatus: { type: String, enum: ['Unverified', 'Verified', 'Suspended'], default: 'Unverified' },
  credibilityScore: { type: Number, default: 100 },

  facialEmbedding: { type: [Number], select: true }, // 128-dimensional vector
  isFaceRegistered: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
