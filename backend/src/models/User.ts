// // backend/src/models/User.ts
// import mongoose, { Schema } from 'mongoose';

// const UserSchema = new Schema(
//   {
//     user_id: { type: String, required: true, unique: true, index: true }, // email/아이디
//     password_hash: { type: String, required: true },
//     nickname: { type: String, required: true },
//     is_active: { type: Boolean, default: true },
//   },
//   { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
// );

// export const User = mongoose.models.User || mongoose.model('User', UserSchema);

import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    nickname: { type: String, required: true },
  },
  { timestamps: true },
);

export const User = model('User', UserSchema);
