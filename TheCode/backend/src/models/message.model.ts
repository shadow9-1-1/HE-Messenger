import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderUid: string;
  content: string;
  type: 'text' | 'image' | 'file';
  expiresAt: Date;      // Ephemeral — TTL index
  isDeleted: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderUid: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
