import { defaultAuthCredentials } from 'config';
import LoginForm from 'components/sections/authentications/LoginForm';

const Login = () => {
  const mappedCredentials = {
    email: defaultAuthCredentials.email,
    password: defaultAuthCredentials.password,
  };

  return <LoginForm defaultCredential={mappedCredentials} />;
};

export default Login;
