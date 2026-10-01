import { createContext, useContext } from 'react'
import type { AuthResult, GuardianProfile } from '@/domain/types'

export type AuthState = {
  /** `undefined` mientras se valida el token guardado. */
  profile: GuardianProfile | null | undefined
  login: (email: string, password: string) => Promise<GuardianProfile>
  logout: () => Promise<void>
  /** Guarda una sesión ya creada (registro al reservar o clave nueva). */
  acceptAuth: (auth: AuthResult) => void
  openLogin: (email?: string) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
