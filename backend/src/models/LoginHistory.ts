// backend/src/models/LoginHistory.ts
import mongoose, { Schema } from 'mongoose';

const LoginHistorySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ip_address: { type: String, required: true },
    user_agent: { type: String, required: true },
    logged_at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

export const LoginHistory =
  mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema);
