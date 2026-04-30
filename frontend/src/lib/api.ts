const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiFetch(path: string, options: any = {}) {
  const token = localStorage.getItem('auth-token');
  
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}

export function saveToken(token: string) {
  localStorage.setItem('auth-token', token);
}

export function removeToken() {
  localStorage.removeItem('auth-token');
}
