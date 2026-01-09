// backend/src/models/ChatSession.ts
import { Schema, model, Types } from 'mongoose';

export type ChatSessionDoc = {
  userId: Types.ObjectId;
  title?: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date; //  마지막 메시지 시간
};

const chatSessionSchema = new Schema<ChatSessionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, default: null },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true } //  createdAt / updatedAt 자동
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

export const ChatSession = model<ChatSessionDoc>(
  'chat_sessions',
  chatSessionSchema
);
