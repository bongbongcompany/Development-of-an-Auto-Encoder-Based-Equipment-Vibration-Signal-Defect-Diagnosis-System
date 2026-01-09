import { useEffect, useMemo, useState } from 'react';
import { Divider, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import { useSettingsContext } from 'providers/SettingsProvider';
import sitemap from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import PromoCard from 'components/common/PromoCard';
import NavItem from './NavItem';
import SidenavSimpleBar from './SidenavSimpleBar';
import promo from '/assets/images/illustrations/5.webp';

interface SidenavDrawerContentProps {
  variant?: 'permanent' | 'temporary';
}

const SidenavDrawerContent = ({ variant = 'permanent' }: SidenavDrawerContentProps) => {
  const {
    config: { sidenavCollapsed, openNavbarDrawer },
    setConfig,
  } = useSettingsContext();

  const [localTheme, setLocalTheme] = useState(
    () => (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light',
  );

  useEffect(() => {
    const handleSync = () => {
      setLocalTheme((sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light');
    };
    window.addEventListener('settingsUpdate', handleSync);
    return () => window.removeEventListener('settingsUpdate', handleSync);
  }, []);

  const expanded = useMemo(
    () => variant === 'temporary' || (variant === 'permanent' && !sidenavCollapsed),
    [sidenavCollapsed, variant],
  );

  const toggleNavbarDrawer = () => {
    setConfig({ openNavbarDrawer: !openNavbarDrawer });
  };

  const bgColor = localTheme === 'dark' ? '#1e1e1e' : 'background.default';

  return (
    <>
      <Toolbar
        variant="appbar"
        sx={{
          display: 'block',
          px: { xs: 0 },
          bgcolor: bgColor,
          transition: 'background-color 0.3s ease',
        }}
      >
        <Box
          sx={[
            { height: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            !expanded && { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            expanded && { pl: { xs: 4, md: 6 }, pr: { xs: 2, md: 3 } },
          ]}
        >
          <Logo showName={expanded} />
          <IconButton
            sx={{
              mt: 1,
              display: { md: 'none' },
              color: localTheme === 'dark' ? 'white' : 'inherit',
            }}
            onClick={toggleNavbarDrawer}
          >
            <IconifyIcon icon="material-symbols:left-panel-close-outline" fontSize={20} />
          </IconButton>
        </Box>
      </Toolbar>
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          bgcolor: bgColor,
          transition: 'background-color 0.3s ease',
        }}
      >
        <SidenavSimpleBar>
          <Box
            sx={[
              {
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100%',
              },
              !expanded && { px: 1 },
              expanded && { px: { xs: 2, md: 4 } },
            ]}
          >
            <div>
              {sitemap.map((menu) => (
                <Box key={menu.id}>
                  {menu.subheader === 'Docs' && !sidenavCollapsed && (
                    <Divider
                      sx={{
                        mb: 4,
                        borderColor: localTheme === 'dark' ? '#333' : 'divider',
                      }}
                    />
                  )}
                  <List
                    dense
                    sx={{
                      mb: 3,
                      pb: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {menu.items.map((item) => (
                      <NavItem
                        key={item.pathName}
                        item={item}
                        level={0}
                        {...({ localTheme } as any)}
                      />
                    ))}
                  </List>
                </Box>
              ))}
            </div>
            {!sidenavCollapsed && (
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <PromoCard
                  img={promo}
                  imgStyles={{
                    maxWidth: 136,
                    filter: localTheme === 'dark' ? 'brightness(0.8)' : 'none',
                  }}
                />
              </Box>
            )}
          </Box>
        </SidenavSimpleBar>
      </Box>
    </>
  );
};

export default SidenavDrawerContent;
