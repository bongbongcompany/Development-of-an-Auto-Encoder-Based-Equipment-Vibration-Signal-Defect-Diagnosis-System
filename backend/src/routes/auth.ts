//\aurora-free-main\backend\src\routes
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoginHistory } from '../models/LoginHistory';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { user_id, password, nickname } = req.body as {
      user_id: string;
      password: string;
      nickname: string;
    };

    if (!user_id || !password || !nickname) {
      return res.status(400).json({ message: 'user_id, password, nickname are required' });
    }

    const uid = user_id.trim().toLowerCase();
    const nick = nickname.trim();

    const exists = await User.findOne({ user_id: uid }).select('_id').lean();
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      user_id: uid,
      password_hash,
      nickname: nick,
      is_active: true,
    });

    const ip = req.ip;
    const ua = req.get('user-agent') ?? 'unknown';
    const lh = await LoginHistory.create({
      user_id: user._id,
      ip_address: ip,
      user_agent: ua,
    });

    const token = jwt.sign(
      { userId: String(user._id), loginHistoryId: String(lh._id) },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    return res.status(201).json({
      token,
      user: { id: String(user._id), nickname: user.nickname },
      loginHistory: { id: String(lh._id), logged_at: lh.logged_at },
    });
  } catch (e: any) {
  console.error('POST /auth/register error:', e);
  return res.status(500).json({
    message: 'Register failed',
    detail: e?.message ?? String(e),
  });
  }
});
authRouter.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body as { user_id: string; password: string };
    if (!user_id || !password) return res.status(400).json({ message: 'Missing credentials' });

    const uid = user_id.trim().toLowerCase();

    const user = await User.findOne({ user_id: uid }).lean();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ message: 'Inactive user' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    const ip = req.ip;
    const ua = req.get('user-agent') ?? 'unknown';

    const lh = await LoginHistory.create({
      user_id: user._id,
      ip_address: ip,
      user_agent: ua,
    });

    const token = jwt.sign(
      { userId: String(user._id), loginHistoryId: String(lh._id) },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    return res.json({
      token,
      user: { id: String(user._id), nickname: user.nickname },
      loginHistory: { id: String(lh._id), logged_at: lh.logged_at },
    });
  } catch (e) {
    console.error('POST /auth/login error:', e);
    return res.status(500).json({ message: 'Login failed' });
  }
});

authRouter.patch('/updateAccount', async (req, res) => {
  try {
    const { target_id, new_email, new_nickname, current_password, new_password } = req.body;

    // 1. DB에서 사용자 검색
    const user = await User.findOne({ user_id: target_id });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 2. 닉네임 변경 로직 
    if (new_nickname && new_nickname !== user.nickname) {
      user.nickname = new_nickname.trim();
    }

    // 3. 비밀번호 변경 로직
    if (current_password && new_password) {
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }
      user.password_hash = await bcrypt.hash(new_password, 10);
    }

    // 4. 아이디(이메일) 변경 로직
    if (new_email && new_email !== user.user_id) {
      const exists = await User.findOne({ user_id: new_email.toLowerCase() });
      if (exists) {
        return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
      }
      user.user_id = new_email.toLowerCase();
    }

    // 5. 저장
    await user.save();

    return res.json({
      message: '정보가 성공적으로 수정되었습니다.',
      user: {
        user_id: user.user_id,
        nickname: user.nickname
      }
    });
  } catch (e: any) {
    console.error('Update DB Error:', e);
    return res.status(500).json({ message: 'DB 수정 중 오류 발생' });
  }
});
