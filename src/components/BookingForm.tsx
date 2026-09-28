import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  HiOutlineCalendar,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUserCircle,
} from 'react-icons/hi2'
import {
  formatSessionSummary,
  getRequiredBookingFieldErrors,
  HELP_REQUEST_MAX_LENGTH,
  normalizeHelpRequest,
  REQUIRED_FIELD_MESSAGE,
  type BookingRequiredFieldKey,
} from '@/domain/booking'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldMessage } from '@/components/FieldMessage'

export type BookingFormValues = {
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: string
  helpRequest: string
}

type FieldErrorKey = BookingRequiredFieldKey | 'slot' | 'helpRequest'

type Props = {
  selectedStartsAt: string | null
  disabled: boolean
  submitting: boolean
  onChangeSlot: () => void
  onSubmit: (values: BookingFormValues) => Promise<void>
}

const empty: BookingFormValues = {
  guardianName: '',
  email: '',
  phone: '',
  childName: '',
  childAge: '',
  helpRequest: '',
}

export function BookingForm({
  selectedStartsAt,
  disabled,
  submitting,
  onChangeSlot,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<BookingFormValues>(empty)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldErrorKey, string>>
  >({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedStartsAt) return
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

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    try {
      await onSubmit({ ...values, helpRequest: helpRequest ?? '' })
    } catch (err) {
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
      <p className="text-sm text-muted-foreground">
        Usaremos estos datos solo para enviarte la confirmación de tu reserva.
      </p>

      {selectedStartsAt ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3">
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
              'rounded-2xl border border-dashed px-4 py-3 text-sm text-muted-foreground',
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
        icon={<HiOutlineEnvelope className="size-4" />}
      >
        <Input
          id="email"
          type="email"
          required
          disabled={disabled}
          placeholder="nombre@correo.cl"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          className="h-11 rounded-xl pl-9"
        />
      </Field>

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
          placeholder="+56 9 1234 5678"
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="h-11 rounded-xl pl-9"
        />
      </Field>

      <Field
        id="childName"
        label="Nombre del niño o niña"
        required
        error={fieldErrors.childName}
        icon={<HiOutlineUserCircle className="size-4" />}
      >
        <Input
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
        <RequiredLabel htmlFor="childAge">Edad (3 a 13 años)</RequiredLabel>
        <Input
          id="childAge"
          type="number"
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
          className="h-11 rounded-xl"
        />
        {fieldErrors.childAge ? (
          <FieldMessage id="childAge-error">{fieldErrors.childAge}</FieldMessage>
        ) : null}
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
            fieldErrors.helpRequest ? 'helpRequest-error' : undefined
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
          <p className="text-xs text-muted-foreground">
            Opcional. Nos ayuda a preparar mejor la sesión (máx.{' '}
            {HELP_REQUEST_MAX_LENGTH} caracteres).
          </p>
        )}
      </div>

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
  icon,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  icon: ReactNode
  children: ReactNode
}) {
  const messageId = `${id}-error`
  const control =
    isValidElement(children) && error
      ? cloneElement(children as ReactElement<{ id?: string }>, {
          'aria-invalid': true,
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
      {error ? <FieldMessage id={messageId}>{error}</FieldMessage> : null}
    </div>
  )
}
