export const apiFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  return fetch(url, { ...options, headers });
};
