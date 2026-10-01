import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { resetPasswordRequest } from '@/api/client'
import { useAuth } from '@/auth/auth-context'
import { getPasswordErrors, PASSWORD_MIN_LENGTH } from '@/domain/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { FieldMessage } from '@/components/FieldMessage'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const { acceptAuth, openLogin } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{
    password?: string
    passwordConfirm?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [doneName, setDoneName] = useState<string | null>(null)

  const resetMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPasswordRequest(token, password),
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const next = getPasswordErrors(password, confirm)
    setErrors(next)
    if (Object.keys(next).length > 0 || !token) return
    try {
      const auth = await resetMutation.mutateAsync({ token, password })
      acceptAuth(auth)
      setDoneName(auth.profile.guardian.name.split(' ')[0])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo cambiar la clave.')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 sm:px-6">
      <SiteHeader />

      <main className="mt-8 rounded-xl bg-card p-6 shadow-[0_12px_40px_-24px_rgb(74_36_48/0.35)] sm:p-8">
        {doneName ? (
          <div className="space-y-5 text-left">
            <h1 className="font-heading text-3xl text-balance">
              Listo, {doneName}. Tu clave nueva ya funciona.
            </h1>
            <p className="text-muted-foreground">
              Ya iniciaste sesión. Al reservar, el formulario aparecerá con tus
              datos.
            </p>
            <Link
              to="/"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5 text-base')}
            >
              Reservar una sesión
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-5 text-left">
            <h1 className="font-heading text-3xl text-balance">
              Elige una clave nueva
            </h1>
            <p className="text-sm text-muted-foreground">
              Al guardarla, la clave anterior deja de funcionar.
            </p>

            <div className="space-y-2">
              <Label htmlFor="new-password">Clave nueva</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby="new-password-msg"
                className="h-11 rounded-xl"
              />
              {errors.password ? (
                <FieldMessage id="new-password-msg">{errors.password}</FieldMessage>
              ) : (
                <p id="new-password-msg" className="text-xs text-muted-foreground">
                  Al menos {PASSWORD_MIN_LENGTH} caracteres.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password-confirm">Repite la clave</Label>
              <Input
                id="new-password-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={errors.passwordConfirm ? true : undefined}
                aria-describedby={
                  errors.passwordConfirm ? 'new-password-confirm-error' : undefined
                }
                className="h-11 rounded-xl"
              />
              {errors.passwordConfirm ? (
                <FieldMessage id="new-password-confirm-error">
                  {errors.passwordConfirm}
                </FieldMessage>
              ) : null}
            </div>

            {formError ? (
              <div className="space-y-2">
                <FieldMessage id="reset-error">{formError}</FieldMessage>
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Pedir un enlace nuevo
                </button>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={resetMutation.isPending}
              className="h-11 w-full rounded-xl text-base"
            >
              {resetMutation.isPending ? 'Guardando…' : 'Guardar clave'}
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}
