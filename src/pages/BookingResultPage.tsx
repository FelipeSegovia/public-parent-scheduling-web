import { Link, useLocation, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { HiOutlineCheckCircle } from 'react-icons/hi2'
import { fetchBooking } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { formatSessionSummary } from '@/domain/booking'
import { SiteHeader } from '@/components/SiteHeader'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BookingResultPage() {
  const { id } = useParams<{ id: string }>()
  const accountCreated =
    (useLocation().state as { accountCreated?: boolean } | null)?.accountCreated ===
    true

  const bookingQuery = useQuery({
    queryKey: queryKeys.booking(id ?? ''),
    queryFn: () => fetchBooking(id!),
    enabled: Boolean(id),
  })

  const data = bookingQuery.data ?? null
  const error = bookingQuery.isError
    ? bookingQuery.error instanceof Error
      ? bookingQuery.error.message
      : 'No encontrada'
    : null

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 sm:px-6">
      <SiteHeader />

      <main className="mt-8 rounded-xl bg-card p-6 shadow-[0_12px_40px_-24px_rgb(74_36_48/0.35)] sm:p-8">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : !data ? (
          <p className="text-muted-foreground">Cargando tu reserva…</p>
        ) : (
          <div className="space-y-5 text-left">
            <h1 className="font-heading text-3xl text-balance text-foreground">
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
                ? ' Mientras el envío de correos no esté activo, usa estos enlaces para confirmar o cancelar.'
                : ' Como la cita está muy próxima, ya quedó confirmada.'}
            </p>

            {accountCreated ? (
              <p className="flex items-start gap-2.5 rounded-xl bg-brand-soft px-4 py-3 text-sm text-foreground">
                <HiOutlineCheckCircle
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                Creamos tu cuenta. La próxima vez inicia sesión y el formulario
                aparecerá con tus datos.
              </p>
            ) : null}

            {data.session.status === 'pendiente' ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to={`/sesion/${data.session.confirmToken}/confirmar`}
                  className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5 text-base')}
                >
                  Confirmo
                </Link>
                <Link
                  to={`/sesion/${data.session.cancelToken}/cancelar`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-11 rounded-xl px-5 text-base',
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
      </main>
    </div>
  )
}
