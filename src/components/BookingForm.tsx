import { useState, type FormEvent, type ReactNode } from 'react'
import {
  HiOutlineCalendar,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUserCircle,
} from 'react-icons/hi2'
import { formatSessionSummary, isValidChildAge } from '@/domain/booking'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type BookingFormValues = {
  guardianName: string
  email: string
  phone: string
  childName: string
  childAge: string
}

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
}

export function BookingForm({
  selectedStartsAt,
  disabled,
  submitting,
  onChangeSlot,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<BookingFormValues>(empty)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedStartsAt) {
      setError('Elige un horario disponible primero.')
      return
    }

    const age = Number(values.childAge)
    if (!isValidChildAge(age)) {
      setError('La edad del niño debe estar entre 3 y 13 años.')
      return
    }

    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar.')
    }
  }

  return (
    <form
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
        <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Selecciona un horario en el paso 1 para continuar.
        </div>
      )}

      <Field
        id="guardianName"
        label="Tu nombre"
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
        <Label htmlFor="childAge">Edad (3 a 13 años)</Label>
        <Input
          id="childAge"
          type="number"
          min={3}
          max={13}
          required
          disabled={disabled}
          placeholder="Ej. 7"
          value={values.childAge}
          onChange={(e) => update('childAge', e.target.value)}
          className="h-11 rounded-xl"
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={disabled || submitting || !selectedStartsAt}
        className="h-11 w-full rounded-xl text-base"
        size="lg"
      >
        {submitting ? 'Reservando…' : 'Reservar sesión'}
      </Button>
    </form>
  )
}

function Field({
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
