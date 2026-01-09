import { useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

const Footer = () => {
  // 1. 초기 테마 상태를 sessionStorage에서 가져옵니다.
  const [localTheme, setLocalTheme] = useState(
    () => (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light',
  );

  useEffect(() => {
    // 2. UserList.tsx에서 발생하는 테마 변경 이벤트를 감지합니다.
    const handleSync = () => {
      const currentTheme = (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light';
      setLocalTheme(currentTheme);
    };

    window.addEventListener('settingsUpdate', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('settingsUpdate', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return (
    <>
      <Divider sx={{ borderColor: localTheme === 'dark' ? '#333' : 'rgba(0,0,0,0.12)' }} />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        sx={[
          {
            columnGap: 2,
            rowGap: 0.5,
            bgcolor: localTheme === 'dark' ? '#1e1e1e' : 'background.default',
            justifyContent: { xs: 'center', sm: 'space-between' },
            alignItems: 'center',
            height: { xs: 72, sm: 56 },
            py: 1,
            px: { xs: 3, md: 5 },
            textAlign: { xs: 'center', sm: 'left' },
            transition: 'background-color 0.3s ease',
          },
        ]}
      >
        <Typography
          variant="caption"
          component="p"
          sx={{
            lineHeight: 1.6,
            fontWeight: 'light',
            color: localTheme === 'dark' ? 'grey.400' : 'text.secondary',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box component="span" whiteSpace="nowrap">
            Thank you for watching
            <Box
              component="strong"
              mx={0.5}
              sx={{ color: localTheme === 'dark' ? 'primary.light' : 'inherit' }}
            >
              BongBongCompany{' '}
            </Box>
          </Box>

          <Box component="span" whiteSpace="nowrap">
            <Box component="span" display={{ xs: 'none', sm: 'inline' }}>
              |
            </Box>{' '}
            {dayjs().year()} ©
          </Box>
        </Typography>

        <Typography
          variant="caption"
          component="p"
          sx={{
            fontWeight: 'light',
            color: localTheme === 'dark' ? 'grey.500' : 'text.secondary',
          }}
        >
          v{import.meta.env.VITE_APP_VERSION}
        </Typography>
      </Stack>
    </>
  );
};

export default Footer;
