import { useContext, useEffect, useRef, useState } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { SettingsContext, SettingsProvider, translations } from 'pages/users/UserList';
import styled from 'styled-components';

/* --- Styled Components (기존 색상 및 기능 유지) --- */
const ChatScrollArea = styled.div<{ isDark: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 라이트모드 배경색 #b2c7da 엄격 유지 */
  background-color: ${(props) => (props.isDark ? '#1c1c21' : '#b2c7da')};
  transition: background-color 0.3s ease;
`;

const MessageWrapper = styled.div<{ isMe: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.isMe ? 'flex-end' : 'flex-start')};
  width: 100%;
`;

const ChatBubble = styled.div<{ isMe: boolean; isDark: boolean }>`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: ${(props) => (props.isMe ? '15px 15px 2px 15px' : '15px 15px 15px 2px')};
  background-color: ${(props) => (props.isMe ? '#74fa80' : props.isDark ? '#333333' : '#ffffff')};
  color: ${(props) => (props.isDark && !props.isMe ? '#ffffff' : '#000000')};
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CHAT_BASE = '/api/chat';

function StarterContent() {
  const { language, themeMode } = useContext(SettingsContext);
  const isDark = themeMode === 'dark';
  const t = (translations as any)[language] || translations.ko;

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const authFetch = (url: string, init: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await authFetch(`${CHAT_BASE}/sessions/${sessionId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('메시지 로드 실패:', err);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      try {
        const res = await authFetch(`${CHAT_BASE}/sessions`);
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
          const firstSessionId = data.sessions[0].id;
          setActiveId(firstSessionId);
          loadMessages(firstSessionId);
        }
      } catch (err) {
        console.error('세션 목록 로드 실패:', err);
      }
    };
    initLoad();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeId) return;
    const text = input;
    setInput('');
    const tempMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const res = await authFetch(`${CHAT_BASE}/sessions/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.botMessage) {
        setMessages((prev) => [...prev, data.botMessage]);
      }
    } catch (err) {
      console.error('전송 에러:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: isDark ? '#121212' : '#f5f5f5' }}>
      <Paper
        elevation={0}
        sx={{
          width: 280,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDark ? '#121212' : '#ffffff',
        }}
      >
        <Box sx={{ p: 2, bgcolor: isDark ? '#1e1e1e' : '#3f51b5', color: 'white' }}>
          <Typography variant="h6">{t.chatHistory || 'Chat History'}</Typography>
        </Box>
        <List sx={{ flex: 1, overflowY: 'auto' }}>
          {sessions.map((s) => (
            <ListItemButton
              key={s.id}
              selected={s.id === activeId}
              onClick={() => {
                setActiveId(s.id);
                loadMessages(s.id);
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemText
                primary={new Date(s.updated_at).toLocaleDateString()}
                secondary={new Date(s.updated_at).toLocaleTimeString()}
                primaryTypographyProps={{ color: isDark ? '#fff' : 'inherit' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatScrollArea ref={scrollRef} isDark={isDark}>
          {messages.map((m) => (
            <MessageWrapper key={m.id} isMe={m.role === 'user'}>
              <ChatBubble isMe={m.role === 'user'} isDark={isDark}>
                {m.content}
              </ChatBubble>
            </MessageWrapper>
          ))}
        </ChatScrollArea>
        <Divider />
        <Box sx={{ p: 2, bgcolor: isDark ? '#121212' : '#fff', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={t.placeholder || '메시지를 입력하세요...'}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 5,
                bgcolor: isDark ? '#2a2a2a' : '#f9f9f9',
                color: isDark ? '#fff' : '#000',
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={send}
            disabled={!input.trim()}
            sx={{ bgcolor: '#3f51b5', color: '#fff' }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default function Starter() {
  return (
    <SettingsProvider>
      <StarterContent />
    </SettingsProvider>
  );
}
