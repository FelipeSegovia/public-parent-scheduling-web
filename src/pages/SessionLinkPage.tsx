import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { cancelSession, confirmSession } from '@/api/client'
import { formatSessionSummary } from '@/domain/booking'
import type { BookingResult } from '@/domain/types'
import { SiteHeader } from '@/components/SiteHeader'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Action = 'confirmar' | 'cancelar'

export function SessionLinkPage({ action }: { action: Action }) {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<BookingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) return
    const run = action === 'confirmar' ? confirmSession : cancelSession
    void run(token)
      .then((result) => {
        setData(result)
        setDone(true)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudo completar')
        setDone(true)
      })
  }, [token, action])

  const title =
    action === 'confirmar'
      ? error
        ? 'No se pudo confirmar'
        : 'Cita confirmada'
      : error
        ? 'No se pudo cancelar'
        : 'Cita cancelada'

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 sm:px-6">
      <SiteHeader />

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {!done ? (
          <p className="text-muted-foreground">Procesando…</p>
        ) : (
          <div className="space-y-5 text-left">
            <h1 className="font-heading text-3xl text-foreground">{title}</h1>
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : data ? (
              <p className="text-muted-foreground">
                {formatSessionSummary(data.session.startsAt)} ·{' '}
                {data.child.name}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {action === 'cancelar' && !error
                ? 'El cupo quedó libre. Si quieres, puedes reservar otro horario.'
                : null}
              {action === 'confirmar' && !error
                ? 'Te esperamos en la sesión. Si no puedes asistir, cancela con el enlace del correo antes de la hora.'
                : null}
            </p>
            <Link to="/" className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl')}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
