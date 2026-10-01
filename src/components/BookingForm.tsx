import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  HiOutlineCalendar,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUserCircle,
} from 'react-icons/hi2'
import { ApiError, emailHasAccount } from '@/api/client'
import { getPasswordErrors, PASSWORD_MIN_LENGTH } from '@/domain/auth'
import {
  formatSessionSummary,
  getRequiredBookingFieldErrors,
  HELP_REQUEST_MAX_LENGTH,
  normalizeHelpRequest,
  REQUIRED_FIELD_MESSAGE,
  type BookingRequiredFieldKey,
} from '@/domain/booking'
import type { Child, GuardianProfile } from '@/domain/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldMessage } from '@/components/FieldMessage'
import { ChildPicker } from '@/components/ChildPicker'

export type BookingFormValues = {
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: string
  helpRequest: string
  createAccount: boolean
  password: string
  passwordConfirm: string
}

type FieldErrorKey =
  | BookingRequiredFieldKey
  | 'slot'
  | 'helpRequest'
  | 'password'
  | 'passwordConfirm'

type Props = {
  selectedStartsAt: string | null
  disabled: boolean
  submitting: boolean
  /** Perfil con sesión iniciada; el formulario se monta de nuevo cuando cambia. */
  profile: GuardianProfile | null
  onChangeSlot: () => void
  onRequestLogin: (email: string) => void
  onSubmit: (values: BookingFormValues) => Promise<void>
}

const empty: BookingFormValues = {
  guardianName: '',
  email: '',
  phone: '',
  childName: '',
  childAge: '',
  helpRequest: '',
  createAccount: false,
  password: '',
  passwordConfirm: '',
}

function initialValues(profile: GuardianProfile | null): BookingFormValues {
  if (!profile) return empty
  const onlyChild = profile.children.length === 1 ? profile.children[0] : null
  return {
    ...empty,
    guardianName: profile.guardian.name,
    email: profile.guardian.email,
    phone: profile.guardian.phone,
    childName: onlyChild?.name ?? '',
    childAge: onlyChild ? String(onlyChild.age) : '',
  }
}

export function BookingForm({
  selectedStartsAt,
  disabled,
  submitting,
  profile,
  onChangeSlot,
  onRequestLogin,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<BookingFormValues>(() =>
    initialValues(profile),
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldErrorKey, string>>
  >({})
  const [formError, setFormError] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState<string | null>(null)
  const childNameRef = useRef<HTMLInputElement>(null)

  const signedIn = profile !== null
  const emailHasSavedAccount =
    !signedIn &&
    accountEmail !== null &&
    accountEmail === values.email.trim().toLowerCase()

  useEffect(() => {
    if (!selectedStartsAt) return
    setFormError(null)
    setFieldErrors((prev) => {
      if (!prev.slot) return prev
      const next = { ...prev }
      delete next.slot
      return next
    })
  }, [selectedStartsAt])

  function update<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key as FieldErrorKey]
      return next
    })
    setFormError(null)
  }

  function pickChild(child: Child | null) {
    setValues((prev) => ({
      ...prev,
      childName: child?.name ?? '',
      childAge: child ? String(child.age) : '',
    }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.childName
      delete next.childAge
      return next
    })
    if (!child) childNameRef.current?.focus()
  }

  async function checkEmail() {
    if (signedIn) return
    const email = values.email.trim().toLowerCase()
    if (!email.includes('@')) return
    try {
      if (await emailHasAccount(email)) {
        setAccountEmail(email)
        update('createAccount', false)
      }
    } catch {
      // el aviso es una ayuda; si falla, la reserva sigue funcionando
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const nextErrors: Partial<Record<FieldErrorKey, string>> = {}

    if (!selectedStartsAt) {
      nextErrors.slot = 'Elige un horario disponible para continuar.'
    }

    Object.assign(nextErrors, getRequiredBookingFieldErrors(values))

    const helpRequest = normalizeHelpRequest(values.helpRequest)
    if (helpRequest && helpRequest.length > HELP_REQUEST_MAX_LENGTH) {
      nextErrors.helpRequest = `Describe tu necesidad en ${HELP_REQUEST_MAX_LENGTH} caracteres o menos.`
    }

    if (values.createAccount && !signedIn) {
      Object.assign(
        nextErrors,
        getPasswordErrors(values.password, values.passwordConfirm),
      )
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    try {
      await onSubmit({
        ...values,
        createAccount: values.createAccount && !signedIn,
        helpRequest: helpRequest ?? '',
      })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ACCOUNT_EXISTS') {
        setAccountEmail(values.email.trim().toLowerCase())
        update('createAccount', false)
      }
      setFormError(err instanceof Error ? err.message : 'No se pudo reservar.')
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={`space-y-5 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      aria-disabled={disabled}
    >
      {signedIn ? (
        <p className="text-sm text-muted-foreground">
          Completamos tus datos, {profile.guardian.name.split(' ')[0]}. Revisa
          que estén al día antes de reservar.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Usaremos estos datos solo para enviarte la confirmación de tu reserva.
        </p>
      )}

      {selectedStartsAt ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-soft px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <HiOutlineCalendar className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 text-left">
              <p className="text-xs text-muted-foreground">Tu sesión</p>
              <p className="truncate font-medium capitalize">
                {formatSessionSummary(selectedStartsAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeSlot}
            className="shrink-0 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={cn(
              'rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground',
              fieldErrors.slot ? 'border-destructive/50' : 'border-border',
            )}
          >
            Selecciona un horario en el paso 1 para continuar.
          </div>
          {fieldErrors.slot ? (
            <FieldMessage id="slot-error">{fieldErrors.slot}</FieldMessage>
          ) : null}
        </div>
      )}

      <Field
        id="guardianName"
        label="Tu nombre"
        required
        error={fieldErrors.guardianName}
        icon={<HiOutlineUser className="size-4" />}
      >
        <Input
          id="guardianName"
          required
          disabled={disabled}
          autoComplete="name"
          placeholder="Ej. Camila González"
          value={values.guardianName}
          onChange={(e) => update('guardianName', e.target.value)}
          className="h-11 rounded-xl pl-9"
        />
      </Field>

      <Field
        id="email"
        label="Correo electrónico"
        required
        error={fieldErrors.email}
        hint={signedIn ? 'Es el correo de tu cuenta.' : undefined}
        icon={<HiOutlineEnvelope className="size-4" />}
      >
        <Input
          id="email"
          type="email"
          required
          disabled={disabled}
          readOnly={signedIn}
          autoComplete="email"
          placeholder="nombre@correo.cl"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => void checkEmail()}
          className={cn('h-11 rounded-xl pl-9', signedIn && 'bg-muted/60')}
        />
      </Field>

      {emailHasSavedAccount ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-brand-soft px-4 py-3 text-sm">
          <p className="text-foreground">
            Este correo ya tiene cuenta. Inicia sesión y completamos tus datos.
          </p>
          <button
            type="button"
            onClick={() => onRequestLogin(values.email.trim())}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Iniciar sesión
          </button>
        </div>
      ) : null}

      <Field
        id="phone"
        label="Teléfono"
        required
        error={fieldErrors.phone}
        icon={<HiOutlinePhone className="size-4" />}
      >
        <Input
          id="phone"
          type="tel"
          required
          disabled={disabled}
          autoComplete="tel"
          placeholder="+56 9 1234 5678"
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="h-11 rounded-xl pl-9"
        />
      </Field>

      {signedIn && profile.children.length > 1 ? (
        <ChildPicker
          saved={profile.children}
          childName={values.childName}
          onPick={pickChild}
        />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
        <Field
          id="childName"
          label="Nombre del niño o niña"
          required
          error={fieldErrors.childName}
          icon={<HiOutlineUserCircle className="size-4" />}
        >
          <Input
            ref={childNameRef}
            id="childName"
            required
            disabled={disabled}
            placeholder="Ej. Mateo"
            value={values.childName}
            onChange={(e) => update('childName', e.target.value)}
            className="h-11 rounded-xl pl-9"
          />
        </Field>

        <div className="space-y-2 text-left">
          <RequiredLabel htmlFor="childAge">Edad (3 a 13)</RequiredLabel>
          <Input
            id="childAge"
            type="number"
            inputMode="numeric"
            min={3}
            max={13}
            required
            aria-required
            disabled={disabled}
            placeholder="Ej. 7"
            value={values.childAge}
            onChange={(e) => update('childAge', e.target.value)}
            aria-invalid={fieldErrors.childAge ? true : undefined}
            aria-describedby={
              fieldErrors.childAge ? 'childAge-error' : undefined
            }
            className="h-11 rounded-xl tabular-nums"
          />
          {fieldErrors.childAge ? (
            <FieldMessage id="childAge-error">{fieldErrors.childAge}</FieldMessage>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="helpRequest">
          ¿En qué te gustaría que te ayude la educadora?
        </Label>
        <textarea
          id="helpRequest"
          disabled={disabled}
          rows={4}
          maxLength={HELP_REQUEST_MAX_LENGTH}
          placeholder="Ej. dificultades con la lectura, organización del estudio, conducta en el colegio…"
          value={values.helpRequest}
          onChange={(e) => update('helpRequest', e.target.value)}
          aria-invalid={fieldErrors.helpRequest ? true : undefined}
          aria-describedby={
            fieldErrors.helpRequest ? 'helpRequest-error' : 'helpRequest-hint'
          }
          className={cn(
            'w-full min-w-0 resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm',
          )}
        />
        {fieldErrors.helpRequest ? (
          <FieldMessage id="helpRequest-error">
            {fieldErrors.helpRequest}
          </FieldMessage>
        ) : (
          <p id="helpRequest-hint" className="text-xs text-muted-foreground">
            Opcional. Nos ayuda a preparar mejor la sesión (máx.{' '}
            {HELP_REQUEST_MAX_LENGTH} caracteres).
          </p>
        )}
      </div>

      {!signedIn && !emailHasSavedAccount ? (
        <div className="space-y-4 border-t border-border pt-5">
          <label className="flex cursor-pointer items-start gap-3 text-left">
            <input
              type="checkbox"
              checked={values.createAccount}
              disabled={disabled}
              onChange={(e) => update('createAccount', e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">
                Crear cuenta con estos datos
              </span>
              <span className="block text-xs text-muted-foreground">
                La próxima vez solo inicias sesión y el formulario aparece
                completo. Es opcional.
              </span>
            </span>
          </label>

          {values.createAccount ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="password"
                label="Clave"
                required
                error={fieldErrors.password}
                hint={
                  fieldErrors.password
                    ? undefined
                    : `Al menos ${PASSWORD_MIN_LENGTH} caracteres.`
                }
                icon={<HiOutlineLockClosed className="size-4" />}
              >
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={disabled}
                  value={values.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </Field>
              <Field
                id="passwordConfirm"
                label="Repite la clave"
                required
                error={fieldErrors.passwordConfirm}
                icon={<HiOutlineLockClosed className="size-4" />}
              >
                <Input
                  id="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  disabled={disabled}
                  value={values.passwordConfirm}
                  onChange={(e) => update('passwordConfirm', e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </Field>
            </div>
          ) : null}
        </div>
      ) : null}

      {formError ? (
        <FieldMessage id="form-error">{formError}</FieldMessage>
      ) : null}

      <Button
        type="submit"
        disabled={disabled || submitting}
        className="h-11 w-full rounded-xl text-base"
        size="lg"
      >
        {submitting ? 'Reservando…' : 'Reservar sesión'}
      </Button>
    </form>
  )
}

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: ReactNode
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="text-destructive" aria-hidden="true">
        {' '}
        *
      </span>
      <span className="sr-only"> ({REQUIRED_FIELD_MESSAGE})</span>
    </Label>
  )
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  icon,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  icon: ReactNode
  children: ReactNode
}) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const control =
    isValidElement(children) && messageId
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          'aria-invalid': error ? true : undefined,
          'aria-describedby': messageId,
        })
      : children

  return (
    <div className="space-y-2 text-left">
      {required ? (
        <RequiredLabel htmlFor={id}>{label}</RequiredLabel>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {control}
      </div>
      {error ? (
        <FieldMessage id={messageId}>{error}</FieldMessage>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
