import { useEffect, useState } from 'react';
import { Box, Button, ButtonOwnProps, SxProps } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from './SearchTextField';

interface SearchBoxButtonProps extends ButtonOwnProps {
  type?: 'default' | 'slim';
}

interface SearchBoxProps {
  sx?: SxProps;
}

const SearchBox = ({ sx }: SearchBoxProps) => {
  // ✅ 테마 감지
  const [localTheme, setLocalTheme] = useState(
    () => (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light',
  );

  // ✅ 언어 감지 (i18next 라이브러리 없이 직접 읽기)
  const [currentLang, setCurrentLang] = useState(
    () => sessionStorage.getItem('i18nextLng') || 'en',
  );

  useEffect(() => {
    const handleSync = () => {
      setLocalTheme((sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light');
      setCurrentLang(sessionStorage.getItem('i18nextLng') || 'en');
    };
    window.addEventListener('settingsUpdate', handleSync);
    return () => window.removeEventListener('settingsUpdate', handleSync);
  }, []);

  // ✅ 언어에 따른 텍스트 분기
  const searchPlaceholder = currentLang === 'ko' ? '검색' : 'Search';

  return (
    <SearchTextField
      sx={sx}
      placeholder={searchPlaceholder}
      focused={false}
      slotProps={{
        input: {
          autoComplete: 'off',
          sx: {
            borderRadius: 5,
            border: 1,
            borderStyle: 'solid',
            bgcolor: localTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: localTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: localTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            },
            '& input': {
              color: localTheme === 'dark' ? '#cccccc' : 'inherit',
            },
          },
        },
      }}
    />
  );
};

export const SearchBoxButton = ({ type = 'default', sx, ...rest }: SearchBoxButtonProps) => {
  const { up } = useBreakpoints();
  const upSm = up('sm');

  // 버튼용 언어 감지
  const currentLang = sessionStorage.getItem('i18nextLng') || 'en';
  const searchText = currentLang === 'ko' ? '검색' : 'Search';

  return (
    <>
      {type === 'slim' && upSm ? (
        <Button
          className="search-box-button"
          color="neutral"
          size="small"
          variant="soft"
          startIcon={<IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 20 }} />}
          sx={{ borderRadius: 11, py: '5px', ...sx }}
          {...rest}
        >
          <Box sx={{ mb: 0.25 }} component="span">
            {searchText}
          </Box>
        </Button>
      ) : (
        <Button
          className="search-box-button"
          color="neutral"
          shape="circle"
          variant="soft"
          size={type === 'slim' ? 'small' : 'medium'}
          sx={sx}
          {...rest}
        >
          <IconifyIcon
            icon="material-symbols:search-rounded"
            sx={[{ fontSize: 20 }, type === 'slim' && { fontSize: 18 }]}
          />
        </Button>
      )}
    </>
  );
};

export default SearchBox;
