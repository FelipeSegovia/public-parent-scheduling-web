import type {
  AuthResult,
  BookingResult,
  CreateBookingInput,
  GuardianProfile,
  SlotView,
} from '@/domain/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'acompana.authToken'

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(
      'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.',
      0,
      'NETWORK_ERROR',
    )
  }
  if (!res.ok) {
    let message = 'Algo salió mal. Intenta de nuevo.'
    let code: string | undefined
    try {
      const data = (await res.json()) as { error?: string; code?: string }
      message = data.error ?? message
      code = data.code
    } catch {
      // cuerpo vacío o no JSON
    }
    throw new ApiError(message, res.status, code)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export async function fetchSlots(weekStartYmd: string): Promise<SlotView[]> {
  const data = await request<{ slots: SlotView[] }>(
    `/api/slots?weekStart=${encodeURIComponent(weekStartYmd)}`,
  )
  return data.slots
}

export function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  return post('/api/bookings', input)
}

export function fetchBooking(id: string): Promise<BookingResult> {
  return request(`/api/bookings/${id}`)
}

export function confirmSession(token: string): Promise<BookingResult> {
  return post(`/api/sessions/confirm/${token}`)
}

export function cancelSession(token: string): Promise<BookingResult> {
  return post(`/api/sessions/cancel/${token}`)
}

export function loginRequest(email: string, password: string): Promise<AuthResult> {
  return post('/api/auth/login', { email, password })
}

export type RegisterInput = {
  email: string
  password: string
  guardianName: string
  phone: string
}

export function registerRequest(input: RegisterInput): Promise<AuthResult> {
  return post('/api/auth/register', input)
}

export function logoutRequest(): Promise<void> {
  return post('/api/auth/logout')
}

export async function fetchProfile(): Promise<GuardianProfile> {
  const data = await request<{ profile: GuardianProfile }>('/api/auth/me')
  return data.profile
}

export async function emailHasAccount(email: string): Promise<boolean> {
  const data = await request<{ hasAccount: boolean }>(
    `/api/auth/email-status?email=${encodeURIComponent(email)}`,
  )
  return data.hasAccount
}

export function requestPasswordReset(
  email: string,
): Promise<{ ok: true; devResetToken?: string }> {
  return post('/api/auth/forgot', { email })
}

export function resetPasswordRequest(
  token: string,
  password: string,
): Promise<AuthResult> {
  return post('/api/auth/reset', { token, password })
}
