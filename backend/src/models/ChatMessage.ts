// backend/src/models/ChatMessage.ts
import { Schema, model, Types } from 'mongoose';

export type SenderRole = 'user' | 'bot' | 'system';

export type ChatMessageDoc = {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  role: SenderRole;
  content: string;
  modelInputId?: Types.ObjectId | null;
  createdAt: Date;
};

const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ['user', 'bot', 'system'], required: true },
    content: { type: String, required: true },
    modelInputId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessage = model<ChatMessageDoc>('chat_messages', chatMessageSchema);
