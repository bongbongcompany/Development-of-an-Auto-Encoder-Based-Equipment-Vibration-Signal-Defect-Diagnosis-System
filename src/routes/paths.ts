export const rootPaths = {
  root: '/',
  authRoot: 'auth',
};

const paths = {
  root: rootPaths.root,
  starter: `/starter`,
  users: `/users`,
  account: `/account`,
  login: `/${rootPaths.authRoot}/login`,
  signup: `/${rootPaths.authRoot}/sign-up`,
  notifications: `/notifications`,
  documentation: `/documentation`,

  404: `/404`,
};

export default paths;
