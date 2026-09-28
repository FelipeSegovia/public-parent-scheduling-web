import { format } from 'date-fns'
import {
  HELP_REQUEST_MAX_LENGTH,
  hasAllRequiredBookingFields,
  initialSessionStatus,
  isValidChildAge,
  normalizeHelpRequest,
  normalizeName,
  REQUIRED_BOOKING_FIELDS_MESSAGE,
  slotStartsAtIso,
  weekMondayYmd,
  canCancelSession,
  buildSlotsForWeek,
  isPastSlot,
} from '@/domain/booking'
import type {
  BookingResult,
  Child,
  CreateBookingInput,
  Guardian,
  Session,
  SlotView,
} from '@/domain/types'

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

function token(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

type Db = {
  guardians: Guardian[]
  children: Child[]
  sessions: Session[]
}

function seedOccupiedSessions(): Session[] {
  const mondayYmd = weekMondayYmd(new Date())
  const [y, m, d] = mondayYmd.split('-').map(Number)
  const fridayYmd = format(new Date(y, m - 1, d + 4, 12), 'yyyy-MM-dd')
  const saturdayYmd = format(new Date(y, m - 1, d + 5, 12), 'yyyy-MM-dd')

  return [
    {
      id: 'ses_seed_1',
      childId: 'child_seed',
      guardianId: 'guard_seed',
      startsAt: slotStartsAtIso(fridayYmd, '20:00'),
      status: 'confirmada',
      confirmToken: token(),
      cancelToken: token(),
    },
    {
      id: 'ses_seed_2',
      childId: 'child_seed',
      guardianId: 'guard_seed',
      startsAt: slotStartsAtIso(saturdayYmd, '10:00'),
      status: 'pendiente',
      confirmToken: token(),
      cancelToken: token(),
    },
  ]
}

const globalStore = globalThis as typeof globalThis & {
  __acompañaDb?: Db
}

function createDb(): Db {
  return {
    guardians: [
      {
        id: 'guard_seed',
        name: 'Familia Ejemplo',
        email: 'ejemplo@correo.cl',
        phone: '+56 9 0000 0000',
      },
    ],
    children: [
      {
        id: 'child_seed',
        guardianId: 'guard_seed',
        name: 'Niño Ejemplo',
        age: 8,
      },
    ],
    sessions: seedOccupiedSessions(),
  }
}

const db: Db = globalStore.__acompañaDb ?? createDb()
globalStore.__acompañaDb = db

export function listSlotsForWeek(weekStartYmd: string): SlotView[] {
  return buildSlotsForWeek(weekStartYmd, db.sessions).map((slot) => {
    const past = isPastSlot(slot.startsAt)
    return {
      ...slot,
      past,
      available: slot.available && !past,
    }
  })
}

export function getSessions(): Session[] {
  return db.sessions
}

export function getSessionById(sessionId: string): Session | undefined {
  return db.sessions.find((s) => s.id === sessionId)
}

export function getBookingBundle(sessionId: string): BookingResult | null {
  const session = getSessionById(sessionId)
  if (!session) return null
  const guardian = db.guardians.find((g) => g.id === session.guardianId)
  const child = db.children.find((c) => c.id === session.childId)
  if (!guardian || !child) return null
  return { session, guardian, child }
}

export function createBooking(input: CreateBookingInput): BookingResult {
  const age = Number(input.childAge)
  if (!isValidChildAge(age)) {
    throw Object.assign(new Error('La edad del niño debe estar entre 3 y 13 años.'), {
      status: 400,
      code: 'INVALID_AGE',
    })
  }

  if (!hasAllRequiredBookingFields(input)) {
    throw Object.assign(new Error(REQUIRED_BOOKING_FIELDS_MESSAGE), {
      status: 400,
      code: 'MISSING_FIELDS',
    })
  }

  const email = input.email.trim().toLowerCase()

  if (isPastSlot(input.startsAt)) {
    throw Object.assign(new Error('Ese horario ya pasó.'), {
      status: 400,
      code: 'PAST_SLOT',
    })
  }

  const occupied = db.sessions.some(
    (s) =>
      s.startsAt === input.startsAt &&
      (s.status === 'pendiente' || s.status === 'confirmada'),
  )
  if (occupied) {
    throw Object.assign(new Error('Ese cupo ya no está disponible.'), {
      status: 409,
      code: 'SLOT_TAKEN',
    })
  }

  const helpRequest = normalizeHelpRequest(input.helpRequest)
  if (helpRequest && helpRequest.length > HELP_REQUEST_MAX_LENGTH) {
    throw Object.assign(
      new Error(
        `El texto de ayuda no puede superar ${HELP_REQUEST_MAX_LENGTH} caracteres.`,
      ),
      { status: 400, code: 'HELP_REQUEST_TOO_LONG' },
    )
  }

  let guardian = db.guardians.find((g) => g.email === email)
  if (!guardian) {
    guardian = {
      id: id('guard'),
      name: input.guardianName.trim(),
      email,
      phone: input.phone.trim(),
    }
    db.guardians.push(guardian)
  } else {
    guardian.name = input.guardianName.trim()
    guardian.phone = input.phone.trim()
  }

  const childNorm = normalizeName(input.childName)
  let child = db.children.find(
    (c) => c.guardianId === guardian!.id && normalizeName(c.name) === childNorm,
  )
  if (!child) {
    child = {
      id: id('child'),
      guardianId: guardian.id,
      name: input.childName.trim().replace(/\s+/g, ' '),
      age,
    }
    db.children.push(child)
  } else {
    child.age = age
  }

  const session: Session = {
    id: id('ses'),
    childId: child.id,
    guardianId: guardian.id,
    startsAt: input.startsAt,
    status: initialSessionStatus(input.startsAt),
    confirmToken: token(),
    cancelToken: token(),
    ...(helpRequest ? { helpRequest } : {}),
  }
  db.sessions.push(session)

  return { session, guardian, child }
}

export function confirmByToken(confirmToken: string): BookingResult {
  const session = db.sessions.find((s) => s.confirmToken === confirmToken)
  if (!session) {
    throw Object.assign(new Error('Enlace no válido.'), {
      status: 404,
      code: 'INVALID_TOKEN',
    })
  }
  if (session.status === 'confirmada') {
    const bundle = getBookingBundle(session.id)
    if (!bundle) throw new Error('Sesión inconsistente')
    return bundle
  }
  if (session.status !== 'pendiente') {
    throw Object.assign(new Error('Esta cita ya no se puede confirmar.'), {
      status: 409,
      code: 'NOT_PENDING',
    })
  }
  session.status = 'confirmada'
  const bundle = getBookingBundle(session.id)
  if (!bundle) throw new Error('Sesión inconsistente')
  return bundle
}

export function cancelByToken(cancelToken: string): BookingResult {
  const session = db.sessions.find((s) => s.cancelToken === cancelToken)
  if (!session) {
    throw Object.assign(new Error('Enlace no válido.'), {
      status: 404,
      code: 'INVALID_TOKEN',
    })
  }
  if (session.status === 'cancelada') {
    const bundle = getBookingBundle(session.id)
    if (!bundle) throw new Error('Sesión inconsistente')
    return bundle
  }
  if (!canCancelSession(session)) {
    throw Object.assign(new Error('Ya no es posible cancelar esta cita.'), {
      status: 409,
      code: 'CANCEL_NOT_ALLOWED',
    })
  }
  session.status = 'cancelada'
  const bundle = getBookingBundle(session.id)
  if (!bundle) throw new Error('Sesión inconsistente')
  return bundle
}
