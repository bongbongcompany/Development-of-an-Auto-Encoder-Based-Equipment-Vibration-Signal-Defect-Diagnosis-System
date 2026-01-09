import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SettingsContext, SettingsProvider, translations } from 'pages/users/UserList';
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import SocialAuth from './SocialAuth';

type RegisterResponse = {
  token?: string;
  user?: { id: number; nickname: string; user_id: string };
  loginHistory?: { id: number; logged_at: string };
  message?: string;
};

const SignupForm = () => {
  const navigate = useNavigate();

  const settings = useContext(SettingsContext);
  const language = settings?.language || 'ko';
  const t = (translations as any)[language] || translations.ko;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!password) return false;
    return true;
  }, [name, email, password, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      const nickname = name.trim();
      const user_id = email.trim();

      if (!user_id.includes('@')) {
        throw new Error(
          language === 'ko' ? '이메일 형식이 올바르지 않아요.' : 'Invalid email format.',
        );
      }
      if (password.length < 6) {
        throw new Error(
          language === 'ko'
            ? '비밀번호는 6자 이상이어야 해요.'
            : 'Password must be at least 6 characters.',
        );
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          password,
          nickname,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as RegisterResponse;

      if (!res.ok) {
        throw new Error(data?.message || `가입 실패 (오류 코드: ${res.status})`);
      }

      if (!data.token) {
        throw new Error('가입은 완료되었으나 인증 토큰을 받지 못했습니다.');
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', String(data.user.id));
      }
      if (data.loginHistory) {
        localStorage.setItem('loginHistory', JSON.stringify(data.loginHistory));
      }

      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
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
        bgcolor: 'background.default',
      }}
    >
      <div />
      <Grid
        container
        sx={{
          height: 1,
          maxWidth: '35rem',
          rowGap: 4,
          alignContent: { md: 'center' },
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
            <Typography variant="h4" sx={{ color: 'text.primary' }}>
              {t.signupBtn || '회원가입'}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {t.alreadyHaveAccount || 'Already have an account?'}
              <Link href={paths.login} sx={{ ml: 1 }}>
                {t.loginBtn || 'Log in'}
              </Link>
            </Typography>
          </Stack>
        </Grid>

        {error && (
          <Grid size={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid size={12}>
          <SocialAuth />
        </Grid>
        <Grid size={12}>
          <Divider sx={{ color: 'text.secondary' }}>{t.orUseEmail || 'or use email'}</Divider>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Grid container>
              <Grid sx={{ mb: 3 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="name"
                  label={t.nameLabel || 'Name'}
                  variant="filled"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid sx={{ mb: 3 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="email"
                  type="email"
                  label={t.emailLabel || 'Email'}
                  variant="filled"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid sx={{ mb: 4 }} size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="password"
                  label={t.passwordLabel || 'Password'}
                  variant="filled"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={!canSubmit}
                >
                  {loading ? t.creating || 'Creating...' : t.createAccountBtn || 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Link href="#!" variant="subtitle2" sx={{ flex: 1, color: 'text.secondary' }}>
        {t.troubleSigningIn || 'Trouble signing in?'}
      </Link>
    </Stack>
  );
};

export default function SignupFormWrapper() {
  return (
    <SettingsProvider>
      <SignupForm />
    </SettingsProvider>
  );
}
