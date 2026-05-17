import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  uid: string;          // Firebase UID
  displayName: string;
  email?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, sparse: true }, // Optional from token flow
    photoURL: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', UserSchema);
