//D:\aurora-free-main\backend\src\db.ts
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  await mongoose.connect(uri);
  console.log(' MongoDB connected via Mongoose');
}

/**
 * Mongoose를 통한 네이티브 드라이버 컬렉션 접근용 헬퍼
 */
export function getCol(collectionName: string) {
  return mongoose.connection.db.collection(collectionName);
}

