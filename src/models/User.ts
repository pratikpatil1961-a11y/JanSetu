import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  role: 'citizen' | 'complainant' | 'official';
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'complainant', 'official'], 
    default: 'citizen' 
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
