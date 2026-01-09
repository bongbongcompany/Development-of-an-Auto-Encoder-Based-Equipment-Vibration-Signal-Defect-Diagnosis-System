import { HTMLAttributeAnchorTarget } from 'react';
import { SxProps } from '@mui/material';
import paths, { rootPaths } from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  onClick?: () => void;
}

export interface MenuItem {
  id: string;
  key?: string;
  subheader?: string;
  icon: string;
  target?: HTMLAttributeAnchorTarget;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

// ✅ 로그인 여부 확인 함수
const isLoggedIn = () => !!localStorage.getItem('token');

const sitemap: MenuItem[] = [
  {
    id: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Models',
        path: rootPaths.root,
        pathName: 'dashboard',
        icon: 'material-symbols:query-stats-rounded',
        active: true,
      },
      {
        name: 'Users',
        path: paths.users,
        pathName: 'users',
        icon: 'material-symbols:account-box-outline',
        active: true,
      },
      {
        name: 'Explain',
        key: 'account',
        path: paths.account,
        pathName: 'account',
        active: true,
        icon: 'material-symbols:description-outline-rounded',
      },
      {
        name: 'Starter',
        path: paths.starter,
        pathName: 'starter',
        icon: 'material-symbols:play-circle-outline-rounded',
        active: true,
      },
      {
        name: 'Error 404',
        pathName: 'error',
        active: true,
        icon: 'material-symbols:warning-outline-rounded',
        path: paths[404],
      },
      // -----------------------------------------------------------------
      // ✅ 로그아웃 시 메인 경로('/')로 이동하며 초기화하도록 수정
      // -----------------------------------------------------------------
      ...(isLoggedIn()
        ? [
            {
              name: 'Login',
              icon: 'material-symbols:logout',
              path: paths.login,
              pathName: 'logout',
              active: true,
              onClick: () => {
                localStorage.clear();
                sessionStorage.clear();
                // ProfileMenu와 동일하게 전체 새로고침으로 확실히 리셋
                window.location.href = paths.login;
              },
            },
          ]
        : [
            {
              name: 'Login',
              icon: 'material-symbols:login',
              path: paths.login,
              pathName: 'login',
              active: true,
            },
          ]),
      // -----------------------------------------------------------------
      {
        name: 'Sign up',
        icon: 'material-symbols:person-add-outline',
        path: paths.signup,
        pathName: 'sign-up',
        active: true,
      },
      {
        name: 'Documentation',
        key: 'account',
        path: paths.documentation,
        pathName: 'account',
        active: true,
        icon: 'material-symbols:admin-panel-settings-outline-rounded',
      },
    ],
  },
];

export default sitemap;
