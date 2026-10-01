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
import {
  normalizeEmail,
  PASSWORD_MIN_LENGTH,
  PASSWORD_TOO_SHORT_MESSAGE,
} from '@/domain/auth'
import type {
  AuthResult,
  BookingResult,
  Child,
  CreateBookingInput,
  Guardian,
  GuardianProfile,
  Session,
  SlotView,
} from '@/domain/types'

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

function token(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

type Account = {
  guardianId: string
  salt: string
  passwordHash: string
}

type AuthSession = {
  token: string
  guardianId: string
}

type PasswordReset = {
  token: string
  guardianId: string
  expiresAt: number
}

type Db = {
  guardians: Guardian[]
  children: Child[]
  sessions: Session[]
  accounts: Account[]
  authSessions: AuthSession[]
  passwordResets: PasswordReset[]
}

const RESET_TTL_MS = 60 * 60 * 1000
const SEED_PASSWORD = 'acompana123'

function httpError(message: string, status: number, code: string): Error {
  return Object.assign(new Error(message), { status, code })
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

async function buildAccount(
  guardianId: string,
  password: string,
): Promise<Account> {
  const salt = token()
  return { guardianId, salt, passwordHash: await hashPassword(password, salt) }
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
      {
        id: 'child_seed_2',
        guardianId: 'guard_seed',
        name: 'Sofía Ejemplo',
        age: 5,
      },
    ],
    sessions: seedOccupiedSessions(),
    accounts: [],
    authSessions: [],
    passwordResets: [],
  }
}

const db: Db = globalStore.__acompañaDb ?? createDb()
db.accounts ??= []
db.authSessions ??= []
db.passwordResets ??= []
globalStore.__acompañaDb = db

let seedReady: Promise<void> | null = null

/** La cuenta de ejemplo necesita hash asíncrono; se crea una sola vez. */
export function ensureSeed(): Promise<void> {
  seedReady ??= (async () => {
    if (!db.accounts.some((a) => a.guardianId === 'guard_seed')) {
      db.accounts.push(await buildAccount('guard_seed', SEED_PASSWORD))
    }
  })()
  return seedReady
}

function findAccountByEmail(email: string): {
  guardian: Guardian
  account: Account
} | null {
  const guardian = db.guardians.find((g) => g.email === normalizeEmail(email))
  if (!guardian) return null
  const account = db.accounts.find((a) => a.guardianId === guardian.id)
  return account ? { guardian, account } : null
}

function profileFor(guardianId: string): GuardianProfile {
  const guardian = db.guardians.find((g) => g.id === guardianId)
  if (!guardian) throw httpError('Cuenta no encontrada.', 404, 'NO_ACCOUNT')
  return {
    guardian,
    children: db.children.filter((c) => c.guardianId === guardianId),
  }
}

function startAuthSession(guardianId: string): AuthResult {
  const authSession = { token: token(), guardianId }
  db.authSessions.push(authSession)
  return { token: authSession.token, profile: profileFor(guardianId) }
}

function assertPassword(password: string): void {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    throw httpError(PASSWORD_TOO_SHORT_MESSAGE, 400, 'WEAK_PASSWORD')
  }
}

export function guardianIdForToken(authToken: string | null): string | null {
  if (!authToken) return null
  return db.authSessions.find((s) => s.token === authToken)?.guardianId ?? null
}

export function getProfile(authToken: string | null): GuardianProfile {
  const guardianId = guardianIdForToken(authToken)
  if (!guardianId) {
    throw httpError('Tu sesión expiró. Inicia sesión de nuevo.', 401, 'NO_SESSION')
  }
  return profileFor(guardianId)
}

export async function emailHasAccount(email: string): Promise<boolean> {
  await ensureSeed()
  return findAccountByEmail(email) !== null
}

export async function register(input: {
  email: string
  password: string
  guardianName: string
  phone: string
}): Promise<AuthResult> {
  await ensureSeed()
  assertPassword(input.password)
  const email = normalizeEmail(input.email ?? '')
  if (!email || !input.guardianName?.trim() || !input.phone?.trim()) {
    throw httpError(REQUIRED_BOOKING_FIELDS_MESSAGE, 400, 'MISSING_FIELDS')
  }
  if (findAccountByEmail(email)) {
    throw httpError('Ese correo ya tiene cuenta. Inicia sesión.', 409, 'ACCOUNT_EXISTS')
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
  }
  db.accounts.push(await buildAccount(guardian.id, input.password))
  return startAuthSession(guardian.id)
}

export async function login(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  await ensureSeed()
  const found = findAccountByEmail(input.email ?? '')
  const invalid = httpError('Correo o clave incorrectos.', 401, 'INVALID_CREDENTIALS')
  if (!found) throw invalid
  const hash = await hashPassword(input.password ?? '', found.account.salt)
  if (hash !== found.account.passwordHash) throw invalid
  return startAuthSession(found.guardian.id)
}

export function logout(authToken: string | null): void {
  db.authSessions = db.authSessions.filter((s) => s.token !== authToken)
}

/** Siempre responde igual; solo devuelve el token para simular el correo en local. */
export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true; devResetToken?: string }> {
  await ensureSeed()
  const found = findAccountByEmail(email ?? '')
  if (!found) return { ok: true }
  const reset = {
    token: token(),
    guardianId: found.guardian.id,
    expiresAt: Date.now() + RESET_TTL_MS,
  }
  db.passwordResets.push(reset)
  return { ok: true, devResetToken: reset.token }
}

export async function resetPassword(input: {
  token: string
  password: string
}): Promise<AuthResult> {
  await ensureSeed()
  const reset = db.passwordResets.find((r) => r.token === input.token)
  if (!reset || reset.expiresAt < Date.now()) {
    throw httpError(
      'Este enlace ya no es válido. Pide uno nuevo desde «Iniciar sesión».',
      400,
      'INVALID_RESET',
    )
  }
  assertPassword(input.password)
  const account = db.accounts.find((a) => a.guardianId === reset.guardianId)
  if (!account) throw httpError('Cuenta no encontrada.', 404, 'NO_ACCOUNT')
  account.salt = token()
  account.passwordHash = await hashPassword(input.password, account.salt)
  db.passwordResets = db.passwordResets.filter(
    (r) => r.guardianId !== reset.guardianId,
  )
  db.authSessions = db.authSessions.filter(
    (s) => s.guardianId !== reset.guardianId,
  )
  return startAuthSession(reset.guardianId)
}

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

export async function createBooking(
  input: CreateBookingInput,
  authToken: string | null = null,
): Promise<BookingResult> {
  await ensureSeed()
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

  const email = normalizeEmail(input.email)
  const sessionGuardianId = guardianIdForToken(authToken)
  const sessionGuardian = sessionGuardianId
    ? db.guardians.find((g) => g.id === sessionGuardianId)
    : undefined

  if (sessionGuardian && sessionGuardian.email !== email) {
    throw httpError(
      'El correo debe ser el de tu cuenta. Sal de tu cuenta para reservar con otro.',
      400,
      'EMAIL_MISMATCH',
    )
  }

  const emailAccount = findAccountByEmail(email)
  const canUpdateProfile = Boolean(sessionGuardian) || !emailAccount

  if (input.createAccount) {
    if (sessionGuardian || emailAccount) {
      throw httpError('Ese correo ya tiene cuenta. Inicia sesión.', 409, 'ACCOUNT_EXISTS')
    }
    assertPassword(input.createAccount.password)
  }

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
  } else if (canUpdateProfile) {
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
  } else if (canUpdateProfile) {
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

  if (input.createAccount) {
    db.accounts.push(await buildAccount(guardian.id, input.createAccount.password))
    return { session, guardian, child, auth: startAuthSession(guardian.id) }
  }

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
