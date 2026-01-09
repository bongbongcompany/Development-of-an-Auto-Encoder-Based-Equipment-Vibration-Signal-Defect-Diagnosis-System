// backend/src/routes/upload.ts
import { Router } from 'express';
import { getCol } from '../db';

export const uploadRouter = Router();

uploadRouter.post('/', async (req, res) => {
  try {
    const uploadCol = getCol('uploads');
    const history = await uploadCol.find({}).toArray();
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "데이터 로드 실패" });
  }
});