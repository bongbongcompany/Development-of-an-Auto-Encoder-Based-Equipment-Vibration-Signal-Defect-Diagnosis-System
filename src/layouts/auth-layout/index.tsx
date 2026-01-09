import { PropsWithChildren, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Image from 'components/base/Image';
import Logo from 'components/common/Logo';
import image from '/assets/images/illustrations/3.webp';
import darkmode from '/assets/images/illustrations/dark3.png';

const AuthLayout = ({ children }: PropsWithChildren) => {
  const theme = useTheme();

  // 1. Context 대신 세션 스토리지에서 직접 값을 가져와 로컬 상태로 관리
  const [currentMode, setCurrentMode] = useState(() => {
    return sessionStorage.getItem('session_theme') || theme.palette.mode;
  });

  useEffect(() => {
    // 2. 테마 변경 감지 함수
    const handleThemeChange = () => {
      const savedMode = sessionStorage.getItem('session_theme');
      if (savedMode) {
        console.log('--- 신호 감지: 테마 변경됨 ---', savedMode);
        setCurrentMode(savedMode);
      }
    };

    // 3. UserList.tsx에서 발생시키는 'settingsUpdate' 이벤트를 구독
    window.addEventListener('settingsUpdate', handleThemeChange);

    return () => {
      window.removeEventListener('settingsUpdate', handleThemeChange);
    };
  }, []);

  // 4. 로컬 상태(currentMode)를 기준으로 다크모드 판별
  const isDark = currentMode === 'dark';

  console.log('--- AuthLayout 최종 판정 ---');
  console.log('현재 인식된 모드:', currentMode);
  console.log('다크모드 여부:', isDark);

  return (
    <Grid
      container
      sx={{
        height: { md: '100vh' },
        minHeight: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Grid
        sx={{ borderRight: { md: 1 }, borderColor: { md: 'divider' } }}
        size={{ xs: 12, md: 6 }}
      >
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', height: 1, p: { xs: 3, sm: 5 } }}
        >
          <Stack sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 5, md: 0 } }}>
            <Logo />
          </Stack>
          <Stack
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: { xs: 'none', md: 'flex', flexDirection: 'row-reverse' },
            }}
          >
            <Box sx={{ maxWidth: 600, maxHeight: 390 }}>
              <Image src={isDark ? darkmode : image} width="100%" height="100%" alt="auth" />
            </Box>
          </Stack>
          <div />
        </Stack>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }} sx={{ display: { xs: 'flex', md: 'block' }, flex: 1 }}>
        {children}
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
