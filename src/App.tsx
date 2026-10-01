import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from '@/auth/AuthProvider'
import { queryClient } from '@/lib/query-client'
import { BookingPage } from '@/pages/BookingPage'
import { BookingResultPage } from '@/pages/BookingResultPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SessionLinkPage } from '@/pages/SessionLinkPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/reserva/:id" element={<BookingResultPage />} />
            <Route
              path="/sesion/:token/confirmar"
              element={<SessionLinkPage action="confirmar" />}
            />
            <Route
              path="/sesion/:token/cancelar"
              element={<SessionLinkPage action="cancelar" />}
            />
            <Route
              path="/cuenta/restablecer/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
