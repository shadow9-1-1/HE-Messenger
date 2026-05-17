import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description?: string;
  isEphemeral: boolean;
  ttlSeconds: number;   // How long messages live in this room
  members: string[];    // Firebase UIDs
  createdBy: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    description: { type: String },
    isEphemeral: { type: Boolean, default: true },
    ttlSeconds: { type: Number, default: 3600 }, // 1 hour default
    members: [{ type: String }],
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
