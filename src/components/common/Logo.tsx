import { useEffect, useState } from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';
import darknut from 'assets/darknut.png';
import nut from 'assets/nut.png';
import { rootPaths } from 'routes/paths';

const Logo = ({ showName = true }: { showName?: boolean }) => {
  const theme = useTheme();
  const [currentMode, setCurrentMode] = useState(theme.palette.mode);

  useEffect(() => {
    const updateMode = () => {
      const savedTheme = sessionStorage.getItem('session_theme');
      if (savedTheme) {
        setCurrentMode(savedTheme as 'light' | 'dark');
      } else {
        setCurrentMode(theme.palette.mode);
      }
    };

    updateMode();
    window.addEventListener('settingsUpdate', updateMode);
    return () => window.removeEventListener('settingsUpdate', updateMode);
  }, [theme.palette.mode]);

  const isDark = currentMode === 'dark';

  return (
    <Link href={rootPaths.root} underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        component="img"
        src={isDark ? darknut : nut}
        alt="logo"
        sx={{ width: 60, height: 60, display: 'block', flexShrink: 0 }}
      />
      {showName && (
        <Typography
          sx={{
            ml: 1,
            fontWeight: 'medium',
            fontSize: 29.5,
            color: 'text.secondary',
            background: ({ vars }) =>
              `linear-gradient(100.06deg, #f76e2eff 6.97%, #00b646ff 27.63%, #00b646ff 49.36%, ${vars.palette.text.secondary} 50.11%, ${vars.palette.text.secondary} 87.87%)`,
            backgroundSize: '240% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NotNut
        </Typography>
      )}
    </Link>
  );
};

export default Logo;
