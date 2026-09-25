import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchBooking } from '@/api/client'
import { formatSessionSummary } from '@/domain/booking'
import type { BookingResult } from '@/domain/types'
import { SiteHeader } from '@/components/SiteHeader'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BookingResultPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<BookingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    void fetchBooking(id)
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No encontrada'),
      )
  }, [id])

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 sm:px-6">
      <SiteHeader />

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : !data ? (
          <p className="text-muted-foreground">Cargando tu reserva…</p>
        ) : (
          <div className="space-y-5 text-left">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Reserva lista
            </p>
            <h1 className="font-heading text-3xl text-foreground">
              {data.session.status === 'confirmada'
                ? 'Tu sesión quedó confirmada'
                : 'Tu sesión quedó pendiente de confirmación'}
            </h1>
            <p className="text-muted-foreground">
              {formatSessionSummary(data.session.startsAt)} ·{' '}
              {data.child.name} ({data.child.age} años)
            </p>
            <p className="text-sm text-muted-foreground">
              Enviamos los detalles a <strong>{data.guardian.email}</strong>.
              {data.session.status === 'pendiente'
                ? ' Usa los enlaces de abajo para confirmar o cancelar (en local simulan el correo).'
                : ' Como faltaba menos de 24 horas, la cita ya está confirmada.'}
            </p>

            {data.session.status === 'pendiente' ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to={`/sesion/${data.session.confirmToken}/confirmar`}
                  className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl')}
                >
                  Confirmo
                </Link>
                <Link
                  to={`/sesion/${data.session.cancelToken}/cancelar`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'rounded-xl',
                  )}
                >
                  No puedo
                </Link>
              </div>
            ) : null}

            <Link
              to="/"
              className={cn(buttonVariants({ variant: 'ghost' }), 'px-0')}
            >
              Volver a agendar
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
