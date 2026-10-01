import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { cancelSession, confirmSession } from '@/api/client'
import { formatSessionSummary } from '@/domain/booking'
import { SiteHeader } from '@/components/SiteHeader'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Action = 'confirmar' | 'cancelar'

export function SessionLinkPage({ action }: { action: Action }) {
  const { token } = useParams<{ token: string }>()
  const ranFor = useRef<string | null>(null)

  const mutation = useMutation({
    mutationFn: (t: string) =>
      (action === 'confirmar' ? confirmSession : cancelSession)(t),
  })

  useEffect(() => {
    if (!token || ranFor.current === token) return
    ranFor.current = token
    mutation.mutate(token)
    // mutation is stable per render but not a dependency we want to retrigger on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, action])

  const data = mutation.data ?? null
  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'No se pudo completar'
    : null
  const done = mutation.isSuccess || mutation.isError

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

      <main className="mt-8 rounded-xl bg-card p-6 shadow-[0_12px_40px_-24px_rgb(74_36_48/0.35)] sm:p-8">
        {!done ? (
          <p className="text-muted-foreground">Procesando…</p>
        ) : (
          <div className="space-y-5 text-left">
            <h1 className="font-heading text-3xl text-balance text-foreground">{title}</h1>
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
            <Link
              to="/"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5 text-base')}
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
