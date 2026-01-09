import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
// 프로젝트 내 기존 컴포넌트 및 경로 설정 (기존 파일 위치 확인 필요)
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import SocialAuth from './SocialAuth';

/* ==========================================
    1. 타입 정의 (백엔드 응답 스키마와 일치)
   ========================================== */
interface LoginFormProps {
  defaultCredential?: { email: string; password: string };
}

type LoginResponse = {
  token?: string;
  user?: { id: string; nickname: string };
  loginHistory?: { id: string; logged_at: string };
  message?: string;
};

const LoginForm = ({ defaultCredential }: LoginFormProps) => {
  const navigate = useNavigate();

  // 상태 관리
  const [email, setEmail] = useState(defaultCredential?.email ?? ''); // 프론트의 email은 백엔드의 user_id로 전송됨
  const [password, setPassword] = useState(defaultCredential?.password ?? '');
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 제출 버튼 활성화 조건
  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !loading,
    [email, password, loading],
  );

  /* ==========================================
      2. 로그인 처리 로직
     ========================================== */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      // Vite 프록시 설정 덕분에 /api/... 로 호출하면 3001번 서버로 전달됩니다.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: email.trim().toLowerCase(), // 백엔드 User 스키마가 user_id를 기대함
          password: password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as LoginResponse;

      if (!res.ok) {
        // 백엔드에서 보낸 message가 있으면 표시, 없으면 기본 에러 출력
        throw new Error(data?.message || `Login failed (${res.status})`);
      }

      if (!data.token) {
        throw new Error('인증 토큰을 받지 못했습니다.');
      }

      // ✅ 토큰 및 유저 정보 저장 (Remember 체크 여부에 따라 분기)
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', data.token);

      if (data.user) {
        storage.setItem('user', JSON.stringify(data.user));
      }
      if (data.loginHistory) {
        storage.setItem('loginHistory', JSON.stringify(data.loginHistory));
      }

      // ✅ 성공 시 홈으로 이동
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '서버와의 통신 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: { md: 10 },
        pb: 10,
      }}
    >
      <div />

      <Grid
        container
        sx={{
          maxWidth: '35rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          mb: 5,
        }}
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Typography variant="h4">Log in</Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Don&apos;t have an account?
              <Link href={paths.signup} sx={{ ml: 1 }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </Grid>

        {/* 에러 메시지 알림 */}
        {error && (
          <Grid size={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid size={12}>
          <SocialAuth />
        </Grid>

        <Grid size={12}>
          <Divider sx={{ color: 'text.secondary' }}>or use email</Divider>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Grid container>
              {/* 이메일(user_id) 입력창 */}
              <Grid sx={{ mb: 3 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="email"
                  type="email"
                  label="Email (User ID)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </Grid>

              {/* 비밀번호 입력창 */}
              <Grid sx={{ mb: 2.5 }} size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Grid>

              <Grid sx={{ mb: 6 }} size={12}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="remember"
                        color="primary"
                        size="small"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Remember this device
                      </Typography>
                    }
                  />

                  <Link href="#!" variant="subtitle2">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>

              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={!canSubmit}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Link href="#!" variant="subtitle2">
        Trouble signing in?
      </Link>
    </Stack>
  );
};

export default LoginForm;
