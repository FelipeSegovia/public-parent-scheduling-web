export const TIMEZONE = 'America/Santiago'

export type SessionStatus =
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'no_confirmada'

export type Guardian = {
  id: string
  name: string
  email: string
  phone: string
}

export type Child = {
  id: string
  guardianId: string
  name: string
  age: number
}

export type Session = {
  id: string
  childId: string
  guardianId: string
  /** ISO string of slot start in UTC */
  startsAt: string
  status: SessionStatus
  confirmToken: string
  cancelToken: string
  /** Motivo o área en la que el apoderado pide apoyo (opcional). */
  helpRequest?: string
}

export type SlotView = {
  /** YYYY-MM-DD in America/Santiago */
  date: string
  /** HH:mm local Chile */
  time: string
  /** ISO UTC */
  startsAt: string
  available: boolean
  past: boolean
}

export type CreateBookingInput = {
  startsAt: string
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: number
  helpRequest?: string
  /** Crea la cuenta del apoderado en el mismo envío que la reserva. */
  createAccount?: { password: string }
}

export type GuardianProfile = {
  guardian: Guardian
  children: Child[]
}

export type AuthResult = {
  token: string
  profile: GuardianProfile
}

export type BookingResult = {
  session: Session
  guardian: Guardian
  child: Child
  /** Presente cuando la reserva también creó la cuenta. */
  auth?: AuthResult
}
