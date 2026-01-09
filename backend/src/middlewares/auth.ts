//D:\aurora-free-main\backend\src\middlewares\auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type AuthPayload = {
  userId: number;
  loginHistoryId: number;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
