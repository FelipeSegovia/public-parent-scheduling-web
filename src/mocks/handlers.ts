import { http, HttpResponse, type JsonBodyType } from 'msw'
import {
  cancelByToken,
  confirmByToken,
  createBooking,
  emailHasAccount,
  getBookingBundle,
  getProfile,
  listSlotsForWeek,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from './db'
import type { CreateBookingInput } from '@/domain/types'

function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

function errorResponse(err: unknown) {
  const e = err as Error & { status?: number; code?: string }
  return HttpResponse.json(
    { error: e.message, code: e.code },
    { status: e.status ?? 500 },
  )
}

async function run<T extends JsonBodyType>(
  fn: () => T | Promise<T>,
  status = 200,
) {
  try {
    return HttpResponse.json(await fn(), { status })
  } catch (err) {
    return errorResponse(err)
  }
}

export const handlers = [
  http.get('/api/slots', ({ request }) => {
    const url = new URL(request.url)
    const weekStart = url.searchParams.get('weekStart')
    if (!weekStart) {
      return HttpResponse.json(
        { error: 'Falta weekStart' },
        { status: 400 },
      )
    }
    return HttpResponse.json({ slots: listSlotsForWeek(weekStart) })
  }),

  http.post('/api/bookings', async ({ request }) => {
    const body = (await request.json()) as CreateBookingInput
    return run(() => createBooking(body, bearer(request)), 201)
  }),

  http.get('/api/bookings/:id', ({ params }) => {
    const bundle = getBookingBundle(String(params.id))
    if (!bundle) {
      return HttpResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    return HttpResponse.json(bundle)
  }),

  http.post('/api/sessions/confirm/:token', ({ params }) =>
    run(() => confirmByToken(String(params.token))),
  ),

  http.post('/api/sessions/cancel/:token', ({ params }) =>
    run(() => cancelByToken(String(params.token))),
  ),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof register>[0]
    return run(() => register(body), 201)
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof login>[0]
    return run(() => login(body))
  }),

  http.post('/api/auth/logout', ({ request }) => {
    logout(bearer(request))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/auth/me', ({ request }) =>
    run(() => ({ profile: getProfile(bearer(request)) })),
  ),

  http.get('/api/auth/email-status', async ({ request }) => {
    const email = new URL(request.url).searchParams.get('email') ?? ''
    return HttpResponse.json({ hasAccount: await emailHasAccount(email) })
  }),

  http.post('/api/auth/forgot', async ({ request }) => {
    const body = (await request.json()) as { email: string }
    return run(() => requestPasswordReset(body.email))
  }),

  http.post('/api/auth/reset', async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof resetPassword>[0]
    return run(() => resetPassword(body))
  }),
]
