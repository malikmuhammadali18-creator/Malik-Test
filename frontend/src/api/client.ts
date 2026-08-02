const API_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  errors: string[];
  status: number;

  constructor(message: string, errors: string[], status: number) {
    super(message);
    this.errors = errors;
    this.status = status;
  }
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ErrorEnvelope {
  success: false;
  message: string;
  errors: string[];
}

let authToken: string | null = localStorage.getItem('token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(
  path: string,
  options: RequestInit & { isFormData?: boolean } = {},
): Promise<T> {
  const { isFormData, ...init } = options;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body as ErrorEnvelope | null;
    throw new ApiError(
      err?.message || `Request failed (${res.status})`,
      err?.errors || [],
      res.status,
    );
  }

  return (body as Envelope<T>).data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData, isFormData: true }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
