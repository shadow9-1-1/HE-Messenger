import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  uid: string;          // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastSeen: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', UserSchema);
