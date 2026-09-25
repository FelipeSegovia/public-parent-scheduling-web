import type { BookingResult, CreateBookingInput, SlotView } from '@/domain/types'

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data.error ?? res.statusText
  } catch {
    return res.statusText
  }
}

export async function fetchSlots(weekStartYmd: string): Promise<SlotView[]> {
  const res = await fetch(
    `/api/slots?weekStart=${encodeURIComponent(weekStartYmd)}`,
  )
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { slots: SlotView[] }
  return data.slots
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as BookingResult
}

export async function fetchBooking(id: string): Promise<BookingResult> {
  const res = await fetch(`/api/bookings/${id}`)
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as BookingResult
}

export async function confirmSession(token: string): Promise<BookingResult> {
  const res = await fetch(`/api/sessions/confirm/${token}`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as BookingResult
}

export async function cancelSession(token: string): Promise<BookingResult> {
  const res = await fetch(`/api/sessions/cancel/${token}`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as BookingResult
}
