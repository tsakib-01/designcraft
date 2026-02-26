import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar: string | null;
  plan: 'free' | 'pro';
  designCount: number;
  storageUsed: number;
  lastLogin: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    username:     { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar:       { type: String, default: null },
    plan:         { type: String, enum: ['free', 'pro'], default: 'free' },
    designCount:  { type: Number, default: 0 },
    storageUsed:  { type: Number, default: 0 },
    lastLogin:    { type: Date, default: null },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema);

export default User;