import { http, HttpResponse } from 'msw'
import {
  cancelByToken,
  confirmByToken,
  createBooking,
  getBookingBundle,
  listSlotsForWeek,
} from './db'
import type { CreateBookingInput } from '@/domain/types'

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
    try {
      const body = (await request.json()) as CreateBookingInput
      const result = createBooking(body)
      return HttpResponse.json(result, { status: 201 })
    } catch (err) {
      const e = err as Error & { status?: number; code?: string }
      return HttpResponse.json(
        { error: e.message, code: e.code },
        { status: e.status ?? 500 },
      )
    }
  }),

  http.get('/api/bookings/:id', ({ params }) => {
    const bundle = getBookingBundle(String(params.id))
    if (!bundle) {
      return HttpResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    return HttpResponse.json(bundle)
  }),

  http.post('/api/sessions/confirm/:token', ({ params }) => {
    try {
      const result = confirmByToken(String(params.token))
      return HttpResponse.json(result)
    } catch (err) {
      const e = err as Error & { status?: number; code?: string }
      return HttpResponse.json(
        { error: e.message, code: e.code },
        { status: e.status ?? 500 },
      )
    }
  }),

  http.post('/api/sessions/cancel/:token', ({ params }) => {
    try {
      const result = cancelByToken(String(params.token))
      return HttpResponse.json(result)
    } catch (err) {
      const e = err as Error & { status?: number; code?: string }
      return HttpResponse.json(
        { error: e.message, code: e.code },
        { status: e.status ?? 500 },
      )
    }
  }),
]
