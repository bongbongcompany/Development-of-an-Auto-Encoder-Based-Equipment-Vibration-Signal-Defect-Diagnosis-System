import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuItemProps,
  Stack,
  Switch,
  SxProps,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { translations } from 'pages/users/UserList';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import ProSnackbar from './ProSnackbar';

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
  localTheme?: string; // 테마 정보 전달을 위해 추가
}

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [localLang, setLocalLang] = useState(() => sessionStorage.getItem('session_lang') || 'ko');
  const [localTheme, setLocalTheme] = useState(
    () => (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light',
  );

  const t = (translations as any)[localLang] || translations.ko;

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleSync = () => {
      setLocalLang(sessionStorage.getItem('session_lang') || 'ko');
      setLocalTheme((sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light');

      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    };

    window.addEventListener('settingsUpdate', handleSync);
    window.addEventListener('userUpdate', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('settingsUpdate', handleSync);
      window.removeEventListener('userUpdate', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isLoggedIn = !!localStorage.getItem('token');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    handleClose();
    navigate(paths.login);
    window.location.reload();
  };

  const initial = (user?.nickname || user?.user_id || 'G').charAt(0).toUpperCase();

  return (
    <>
      <Button
        color="neutral"
        variant="text"
        onClick={handleClick}
        sx={{ height: 44, width: 44, p: 0 }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: isLoggedIn ? 'primary.main' : 'grey.400',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: 2,
            borderColor: 'background.paper',
          }}
        >
          {user?.profileImage ? (
            <Box
              component="img"
              src={user.profileImage}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{initial}</Typography>
          )}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${paperClasses.root}`]: {
            minWidth: 320,
            bgcolor: localTheme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: localTheme === 'dark' ? '#ffffff' : '#000000',
            backgroundImage: 'none',
            border: localTheme === 'dark' ? '1px solid #333' : 'none',
          },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: localTheme === 'dark' ? '#2d2d2d' : '#f9fafb',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: isLoggedIn ? 'primary.main' : 'grey.400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {user?.profileImage ? (
              <Box
                component="img"
                src={user.profileImage}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{initial}</Typography>
            )}
          </Box>
        </Stack>

        <Divider sx={{ borderColor: localTheme === 'dark' ? '#444' : 'rgba(0,0,0,0.12)' }} />

        <Box sx={{ py: 1 }}>
          {/* 테마 설정 메뉴 */}
          <ProfileMenuItem
            localTheme={localTheme}
            icon={
              localTheme === 'dark'
                ? 'material-symbols:light-mode-outline-rounded'
                : 'material-symbols:dark-mode-outline-rounded'
            } // ESLint 권고에 따라 줄바꿈 처리
            onClick={() => {
              handleClose();
              navigate('/users', { state: { scrollToBottom: true } }); // state 전달
            }}
          >
            {t.theme}
            <Switch checked={localTheme === 'dark'} readOnly sx={{ ml: 'auto' }} />
          </ProfileMenuItem>

          <ProfileMenuItem
            localTheme={localTheme}
            icon="material-symbols:language"
            onClick={() => {
              handleClose();
              navigate('/users', { state: { scrollToBottom: true } }); // state 전달
            }}
          >
            {t.language}: {localLang === 'ko' ? '한국어' : localLang.toUpperCase()}
          </ProfileMenuItem>
        </Box>

        <Divider sx={{ borderColor: localTheme === 'dark' ? '#444' : 'rgba(0,0,0,0.12)' }} />

        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            localTheme={localTheme}
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={() => {
              handleClose();
              // ✅ '/settings'에서 'paths.userList' (또는 '/users')로 변경
              // 만약 paths 파일에 정의되어 있다면 paths.userList를 사용하세요.
              navigate('/users');
            }}
          >
            {t.accountSection}
          </ProfileMenuItem>
          <ProfileMenuItem
            localTheme={localTheme}
            icon={isLoggedIn ? 'material-symbols:logout-rounded' : 'material-symbols:login-rounded'}
            onClick={
              isLoggedIn
                ? handleLogout
                : () => {
                    handleClose();
                    navigate(paths.login);
                  }
            }
          >
            {isLoggedIn ? t.logoutBtn : t.loginBtn}
          </ProfileMenuItem>
        </Box>
      </Menu>
      <ProSnackbar open={false} onClose={() => {}} />
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
  localTheme,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem
      onClick={onClick}
      {...linkProps}
      sx={{
        gap: 1,
        // ✅ 다크모드일 때 호버 시 배경색이 밝아지면 글자색을 검정으로 변경
        '&:hover': {
          bgcolor: localTheme === 'dark' ? 'grey.200' : 'action.hover',
          color: localTheme === 'dark' ? '#000000' : 'inherit',
          '& .MuiListItemIcon-root, & .MuiTypography-root': {
            color: localTheme === 'dark' ? '#000000' : 'inherit',
          },
        },
        ...sx,
      }}
    >
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
          color: 'inherit',
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'inherit' }} />
      </ListItemIcon>
      <Typography variant="body2" sx={{ flexGrow: 1, color: 'inherit' }}>
        {children}
      </Typography>
    </MenuItem>
  );
};

export default ProfileMenu;
