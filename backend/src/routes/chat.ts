//\aurora-free-main\backend\src\routes\chat.ts
import { Router } from 'express';
import mongoose, { Types } from 'mongoose';
import fetch from 'node-fetch';
import { requireAuth } from '../middlewares/auth';
import { ChatSession } from '../models/ChatSession';
import { ChatMessage } from '../models/ChatMessage';

export const chatRouter = Router();
chatRouter.use(requireAuth);

/* =========================
   DTO Helpers
========================= */
function toSessionDTO(s: any) {
  return {
    id: String(s._id),
    title: s.title ?? null,
    updated_at: new Date(s.updatedAt).toISOString(),
  };
}

function toMessageDTO(m: any) {
  return {
    id: String(m._id),
    role: m.role,
    content: m.content,
    created_at: new Date(m.createdAt).toISOString(),
  };
}

/* =========================
   GET /sessions
========================= */
chatRouter.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.auth!;
    const userObjectId = new Types.ObjectId(userId);

    const sessions = await ChatSession.find({
      userId: userObjectId,
      isArchived: false,
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    res.json({ sessions: sessions.map(toSessionDTO) });
  } catch (e) {
    console.error('GET /chat/sessions:', e);
    res.status(500).json({ message: 'Failed to load sessions' });
  }
});

/* =========================
   POST /sessions
========================= */
chatRouter.post('/sessions', async (req, res) => {
  try {
    const { userId, loginHistoryId } = req.auth!;
    const userObjectId = new Types.ObjectId(userId);

    const title =
      typeof req.body?.title === 'string' ? req.body.title : null;

    const session = await ChatSession.create({
      userId: userObjectId,
      loginHistoryId: loginHistoryId
        ? new Types.ObjectId(loginHistoryId)
        : null,
      title,
      isArchived: false,
    });

    res.status(201).json({ session: toSessionDTO(session) });
  } catch (e) {
    console.error('POST /chat/sessions:', e);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

/* =========================
   GET /sessions/:id/messages
========================= */
chatRouter.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { userId } = req.auth!;
    const userObjectId = new Types.ObjectId(userId);

    const { sessionId } = req.params;
    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid sessionId' });
    }

    const sessionObjectId = new Types.ObjectId(sessionId);
    const limit = Math.min(Number(req.query.limit ?? 50), 200);

    const session = await ChatSession.findOne({
      _id: sessionObjectId,
      userId: userObjectId,
      isArchived: false,
    }).lean();

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messages = await ChatMessage.find({
      sessionId: sessionObjectId,
      userId: userObjectId,
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    res.json({ messages: messages.map(toMessageDTO) });
  } catch (e) {
    console.error('GET /chat/messages:', e);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

/* =========================
   POST /sessions/:id/messages
   + GPT API (fetch)
========================= */
chatRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { userId } = req.auth!;
    const userObjectId = new Types.ObjectId(userId);

    const { sessionId } = req.params;
    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid sessionId' });
    }
    const sessionObjectId = new Types.ObjectId(sessionId);

    const content = String(req.body?.content ?? '').trim();
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    const sessionDoc = await ChatSession.findOne({
      _id: sessionObjectId,
      userId: userObjectId,
      isArchived: false,
    });

    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }

    /* 1️⃣ 유저 메시지 저장 */
    const userMsg = await ChatMessage.create({
      sessionId: sessionObjectId,
      userId: userObjectId,
      role: 'user',
      content,
    });

    /* 2️⃣ 대화 히스토리 조회 */
    const history = await ChatMessage.find({
      sessionId: sessionObjectId,
    })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    /* 3️⃣ GPT 입력 포맷 */
    const messagesForGPT = history.map((m) => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content,
    }));

    /* 4️⃣ GPT 호출 */
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messagesForGPT,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await response.json();
    const botReply =
      data.choices?.[0]?.message?.content ??
      '응답을 생성하지 못했습니다.';

    /* 5️⃣ 봇 메시지 저장 */
    const botMsg = await ChatMessage.create({
      sessionId: sessionObjectId,
      userId: userObjectId,
      role: 'bot',
      content: botReply,
    });

    /* 6️⃣ 세션 updatedAt 갱신 */
    await ChatSession.updateOne(
      { _id: sessionObjectId },
      { $set: { updatedAt: new Date() } }
    );

    res.status(201).json({
      userMessage: toMessageDTO(userMsg),
      botMessage: toMessageDTO(botMsg),
    });
  } catch (e) {
    console.error('POST /chat/send:', e);
    res.status(500).json({ message: 'Failed to send message' });
  }
});
