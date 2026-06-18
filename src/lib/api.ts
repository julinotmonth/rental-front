// src/lib/api.ts
// Axios-like fetch wrapper yang terhubung ke backend Express

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('ps-rental-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, data.message || 'Terjadi kesalahan')
  }

  return data
}

export const api = {
  get:    <T>(endpoint: string, auth = true) =>
    request<T>(endpoint, { method: 'GET', auth }),

  post:   <T>(endpoint: string, body: unknown, auth = true) =>
    request<T>(endpoint, { method: 'POST', body, auth }),

  put:    <T>(endpoint: string, body: unknown, auth = true) =>
    request<T>(endpoint, { method: 'PUT', body, auth }),

  patch:  <T>(endpoint: string, body: unknown, auth = true) =>
    request<T>(endpoint, { method: 'PATCH', body, auth }),

  delete: <T>(endpoint: string, auth = true) =>
    request<T>(endpoint, { method: 'DELETE', auth }),
}

export default api
