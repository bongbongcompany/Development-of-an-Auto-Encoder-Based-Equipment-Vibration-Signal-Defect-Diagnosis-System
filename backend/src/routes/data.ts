//D:\aurora-free-main\backend\src\routes\chat.ts
import { Router } from 'express';
import { getCol } from '../db';

export const dataRouter = Router();

dataRouter.get('/fetch-db', async (req, res) => {
  try {
    const data = await getCol('uploads').find({}).toArray();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "데이터 조회 실패" });
  }
});