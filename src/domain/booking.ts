import {
  addDays,
  addHours,
  format,
  getDay,
  isBefore,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { TIMEZONE, type Session, type SlotView } from './types'

/**
 * Plantilla inicial fija, solo para el mock (`src/mocks/db.ts`), igual que
 * `buildSlotsForWeek` e `initialSessionStatus` (plazo fijo de 24 h). Con el
 * backend real la plantilla y el plazo los edita la educadora y llegan ya
 * resueltos en `GET /api/slots` y en el estado de la sesión.
 *
 * Mon–Fri: 19:00, 20:00. Sat: 9:00, 10:00, 11:00. Sun: none.
 */
const WEEKDAY_TIMES = ['19:00', '20:00'] as const
const SATURDAY_TIMES = ['09:00', '10:00', '11:00'] as const

const ACTIVE_STATUSES = new Set(['pendiente', 'confirmada'])

export const HELP_REQUEST_MAX_LENGTH = 500

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function normalizeHelpRequest(value: string | undefined): string | undefined {
  if (value == null) return undefined
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed.length > 0 ? trimmed : undefined
}

export function isValidChildAge(age: number): boolean {
  return Number.isInteger(age) && age >= 3 && age <= 13
}

export const REQUIRED_BOOKING_FIELDS_MESSAGE =
  'Completa todos los campos obligatorios.'

export const REQUIRED_FIELD_MESSAGE = 'Este campo es obligatorio.'

export type BookingRequiredFieldKey =
  | 'guardianName'
  | 'email'
  | 'phone'
  | 'childName'
  | 'childAge'

export function getRequiredBookingFieldErrors(fields: {
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: string
}): Partial<Record<BookingRequiredFieldKey, string>> {
  const errors: Partial<Record<BookingRequiredFieldKey, string>> = {}

  if (!fields.guardianName.trim()) {
    errors.guardianName = REQUIRED_FIELD_MESSAGE
  }
  if (!fields.email.trim()) {
    errors.email = REQUIRED_FIELD_MESSAGE
  }
  if (!fields.phone.trim()) {
    errors.phone = REQUIRED_FIELD_MESSAGE
  }
  if (!fields.childName.trim()) {
    errors.childName = REQUIRED_FIELD_MESSAGE
  }
  if (!fields.childAge.trim()) {
    errors.childAge = REQUIRED_FIELD_MESSAGE
  } else {
    const age = Number(fields.childAge)
    if (!isValidChildAge(age)) {
      errors.childAge = 'La edad del niño debe estar entre 3 y 13 años.'
    }
  }

  return errors
}

/** Obligatorios en reserva; `helpRequest` queda fuera a propósito. */
export function hasAllRequiredBookingFields(fields: {
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: string | number
}): boolean {
  if (
    !fields.guardianName.trim() ||
    !fields.email.trim() ||
    !fields.phone.trim() ||
    !fields.childName.trim()
  ) {
    return false
  }
  if (typeof fields.childAge === 'string') {
    return fields.childAge.trim() !== ''
  }
  return Number.isFinite(fields.childAge)
}

/** Local Chile calendar date as YYYY-MM-DD */
export function toChileDateString(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd')
}

export function slotStartsAtIso(dateYmd: string, timeHm: string): string {
  return fromZonedTime(`${dateYmd}T${timeHm}:00`, TIMEZONE).toISOString()
}

export function timesForWeekday(weekday: number): readonly string[] {
  // 0 Sun … 6 Sat (date-fns getDay)
  if (weekday === 0) return []
  if (weekday === 6) return SATURDAY_TIMES
  return WEEKDAY_TIMES
}

/**
 * Monday of the Chile week containing `anchor`, as YYYY-MM-DD.
 */
export function weekMondayYmd(anchor = new Date()): string {
  const local = toZonedTime(anchor, TIMEZONE)
  const monday = startOfWeek(local, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

/** Mon–Sat YYYY-MM-DD for the week starting on mondayYmd. */
export function weekDaysMonSatYmd(mondayYmd: string): string[] {
  const monday = parseYmdAsLocalParts(mondayYmd)
  return Array.from({ length: 6 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'))
}

/** Parse YYYY-MM-DD into a Date whose local Y/M/D match (for calendar math only). */
function parseYmdAsLocalParts(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

export function isSlotOccupied(startsAt: string, sessions: Session[]): boolean {
  return sessions.some(
    (s) => s.startsAt === startsAt && ACTIVE_STATUSES.has(s.status),
  )
}

export function buildSlotsForDay(
  dateYmd: string,
  sessions: Session[],
): SlotView[] {
  const weekday = getDay(parseYmdAsLocalParts(dateYmd))
  const times = timesForWeekday(weekday)
  return times.map((time) => {
    const startsAt = slotStartsAtIso(dateYmd, time)
    const occupied = isSlotOccupied(startsAt, sessions)
    return {
      date: dateYmd,
      time,
      startsAt,
      available: !occupied,
      past: false,
    }
  })
}

export function buildSlotsForWeek(
  mondayYmd: string,
  sessions: Session[],
): SlotView[] {
  return weekDaysMonSatYmd(mondayYmd).flatMap((date) =>
    buildSlotsForDay(date, sessions),
  )
}

/** True when confirmation deadline already passed at booking time (incl. same day). */
export function confirmationDeadlinePassed(
  startsAtIso: string,
  now = new Date(),
  hoursBefore = 24,
): boolean {
  const deadline = addHours(parseISO(startsAtIso), -hoursBefore)
  return !isBefore(now, deadline)
}

export function initialSessionStatus(
  startsAtIso: string,
  now = new Date(),
): 'pendiente' | 'confirmada' {
  return confirmationDeadlinePassed(startsAtIso, now)
    ? 'confirmada'
    : 'pendiente'
}

export function canCancelSession(session: Session, now = new Date()): boolean {
  if (session.status !== 'pendiente' && session.status !== 'confirmada') {
    return false
  }
  return isBefore(now, parseISO(session.startsAt))
}

export function formatSessionSummary(startsAtIso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(parseISO(startsAtIso))
    .replace(',', ' ·')
}

export function formatDayChip(dateYmd: string): {
  weekday: string
  day: string
  month: string
} {
  const instant = fromZonedTime(`${dateYmd}T12:00:00`, TIMEZONE)
  const parts = new Intl.DateTimeFormat('es-CL', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).formatToParts(instant)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  return {
    weekday: get('weekday').replace('.', '').toUpperCase(),
    day: get('day'),
    month: get('month').replace('.', ''),
  }
}

/** «martes 6 de octubre», para etiquetas accesibles. */
export function formatDayLong(dateYmd: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(fromZonedTime(`${dateYmd}T12:00:00`, TIMEZONE))
    .replace(',', '')
}

/** «19:00 – 20:00». Las sesiones duran 1 hora fija. */
export function slotRangeLabel(timeHm: string): string {
  const [h, m] = timeHm.split(':').map(Number)
  const end = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `${timeHm} – ${end}`
}

export function monthRangeLabel(mondayYmd: string): string {
  const days = weekDaysMonSatYmd(mondayYmd)
  const first = days[0]
  const last = days[days.length - 1]
  const fmt = (ymd: string) =>
    new Intl.DateTimeFormat('es-CL', {
      timeZone: TIMEZONE,
      month: 'long',
      year: 'numeric',
    }).format(fromZonedTime(`${ymd}T12:00:00`, TIMEZONE))

  const a = fmt(first)
  const b = fmt(last)
  if (a === b) {
    return a.charAt(0).toUpperCase() + a.slice(1)
  }
  const monthYear = (label: string) => {
    const parts = label.includes(' de ')
      ? label.split(' de ')
      : label.split(' ')
    const month = parts[0] ?? ''
    const year = parts[parts.length - 1] ?? ''
    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      year,
    }
  }
  const left = monthYear(a)
  const right = monthYear(b)
  if (left.year === right.year) {
    return `${left.month} — ${right.month} ${left.year}`
  }
  return `${left.month} ${left.year} — ${right.month} ${right.year}`
}

export function isPastSlot(startsAtIso: string, now = new Date()): boolean {
  return !isBefore(now, parseISO(startsAtIso))
}

export function shiftWeek(mondayYmd: string, weeks: number): string {
  return format(addDays(parseYmdAsLocalParts(mondayYmd), weeks * 7), 'yyyy-MM-dd')
}
