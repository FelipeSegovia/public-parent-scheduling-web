import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { HiOutlineEnvelope, HiOutlineLockClosed, HiXMark } from 'react-icons/hi2'
import { requestPasswordReset } from '@/api/client'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldMessage } from '@/components/FieldMessage'

type Props = {
  open: boolean
  initialEmail: string
  onClose: () => void
}

type View =
  | { name: 'login' }
  | { name: 'forgot' }
  | { name: 'sent'; devResetToken?: string }

export function LoginDialog({ open, initialEmail, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const { login } = useAuth()
  const [view, setView] = useState<View>({ name: 'login' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  })
  const forgotMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })
  const busy = loginMutation.isPending || forgotMutation.isPending

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setView({ name: 'login' })
      setEmail(initialEmail)
      setPassword('')
      setError(null)
      dialog.showModal()
      requestAnimationFrame(() => {
        dialog
          .querySelector<HTMLInputElement>(
            initialEmail ? '#login-password' : '#login-email',
          )
          ?.focus()
      })
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, initialEmail])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu clave.')
      return
    }
    setError(null)
    try {
      await loginMutation.mutateAsync({ email, password })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Escribe el correo de tu cuenta.')
      return
    }
    setError(null)
    try {
      const res = await forgotMutation.mutateAsync(email)
      setView({ name: 'sent', devResetToken: res.devResetToken })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.')
    }
  }

  function goTo(next: View) {
    setError(null)
    setView(next)
  }

  const title =
    view.name === 'login'
      ? 'Inicia sesión'
      : view.name === 'forgot'
        ? 'Recupera tu clave'
        : 'Revisa tu correo'

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-labelledby="login-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-card p-0 text-foreground shadow-[0_24px_60px_-20px_rgb(74_36_48/0.35)] backdrop:bg-foreground/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 id="login-title" className="font-heading text-3xl text-balance">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mt-1 -mr-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <HiXMark className="size-5" aria-hidden />
          </button>
        </div>

        {view.name === 'login' ? (
          <form noValidate onSubmit={handleLogin} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Completaremos el formulario con tus datos y los de tu hijo o hija.
            </p>
            <DialogField
              id="login-email"
              label="Correo electrónico"
              icon={<HiOutlineEnvelope className="size-4" />}
            >
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </DialogField>
            <DialogField
              id="login-password"
              label="Clave"
              icon={<HiOutlineLockClosed className="size-4" />}
            >
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </DialogField>
            {error ? <FieldMessage id="login-error">{error}</FieldMessage> : null}
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="h-11 w-full rounded-xl text-base"
            >
              {busy ? 'Entrando…' : 'Iniciar sesión'}
            </Button>
            <button
              type="button"
              onClick={() => goTo({ name: 'forgot' })}
              className="w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Olvidé mi clave
            </button>
          </form>
        ) : view.name === 'forgot' ? (
          <form noValidate onSubmit={handleForgot} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Te enviaremos un enlace para elegir una clave nueva.
            </p>
            <DialogField
              id="forgot-email"
              label="Correo de tu cuenta"
              icon={<HiOutlineEnvelope className="size-4" />}
            >
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </DialogField>
            {error ? <FieldMessage id="forgot-error">{error}</FieldMessage> : null}
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="h-11 w-full rounded-xl text-base"
            >
              {busy ? 'Enviando…' : 'Enviar enlace'}
            </Button>
            <button
              type="button"
              onClick={() => goTo({ name: 'login' })}
              className="w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver a iniciar sesión
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Si <strong className="text-foreground">{email.trim()}</strong>{' '}
              tiene cuenta, te llegará un enlace para elegir una clave nueva.
              Vence en una hora.
            </p>
            {view.devResetToken ? (
              <div className="rounded-xl bg-brand-soft px-4 py-3 text-sm">
                <p className="text-muted-foreground">
                  En local no se envían correos. Este es el enlace:
                </p>
                <Link
                  to={`/cuenta/restablecer/${view.devResetToken}`}
                  onClick={onClose}
                  className="mt-1 inline-block font-medium text-primary underline underline-offset-4"
                >
                  Elegir una clave nueva
                </Link>
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => goTo({ name: 'login' })}
              className="h-11 w-full rounded-xl text-base"
            >
              Volver a iniciar sesión
            </Button>
          </div>
        )}
      </div>
    </dialog>
  )
}

function DialogField({
  id,
  label,
  icon,
  children,
}: {
  id: string
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-2 text-left">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}
