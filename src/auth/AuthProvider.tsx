import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ApiError,
  fetchProfile,
  getAuthToken,
  loginRequest,
  logoutRequest,
  setAuthToken,
} from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { AuthResult, GuardianProfile } from '@/domain/types'
import { LoginDialog } from '@/components/LoginDialog'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => Boolean(getAuthToken()))
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')

  const meQuery = useQuery({
    queryKey: queryKeys.me(),
    queryFn: fetchProfile,
    enabled: hasToken,
    retry: false,
  })

  // Solo un 401 (NO_SESSION) invalida el token; un corte de red o un 500 no.
  const sessionRejected =
    meQuery.error instanceof ApiError && meQuery.error.status === 401

  useEffect(() => {
    if (hasToken && sessionRejected) {
      setAuthToken(null)
      setHasToken(false)
    }
  }, [hasToken, sessionRejected])

  const profile: GuardianProfile | null | undefined = !hasToken
    ? null
    : meQuery.isSuccess
      ? meQuery.data
      : meQuery.isError
        ? null
        : undefined

  function acceptAuth(auth: AuthResult) {
    setAuthToken(auth.token)
    setHasToken(true)
    queryClient.setQueryData(queryKeys.me(), auth.profile)
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
  })

  async function login(email: string, password: string) {
    const auth = await loginMutation.mutateAsync({ email, password })
    acceptAuth(auth)
    return auth.profile
  }

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
  })

  async function logout() {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      setAuthToken(null)
      setHasToken(false)
      queryClient.setQueryData(queryKeys.me(), null)
    }
  }

  function openLogin(email = '') {
    setLoginEmail(email)
    setLoginOpen(true)
  }

  return (
    <AuthContext.Provider
      value={{ profile, login, logout, acceptAuth, openLogin }}
    >
      {children}
      <LoginDialog
        open={loginOpen}
        initialEmail={loginEmail}
        onClose={() => setLoginOpen(false)}
      />
    </AuthContext.Provider>
  )
}
