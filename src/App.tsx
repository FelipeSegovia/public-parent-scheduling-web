import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { BookingPage } from '@/pages/BookingPage'
import { BookingResultPage } from '@/pages/BookingResultPage'
import { SessionLinkPage } from '@/pages/SessionLinkPage'

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
