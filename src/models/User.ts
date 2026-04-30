import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  role: 'complainant' | 'validator' | 'official';
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['complainant', 'validator', 'official'], 
    default: 'complainant' 
  },
  otp: { type: String, required: false },
  otpExpiry: { type: Date, required: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
