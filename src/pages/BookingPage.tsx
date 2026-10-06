import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, createBooking, fetchSlots } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import {
  monthRangeLabel,
  shiftWeek,
  weekDaysMonSatYmd,
  weekMondayYmd,
} from '@/domain/booking'
import { useAuth } from '@/auth/auth-context'
import { SiteHeader } from '@/components/SiteHeader'
import { EducatorCard } from '@/components/EducatorCard'
import { HowItWorks } from '@/components/HowItWorks'
import { SiteFooter } from '@/components/SiteFooter'
import { DateStrip } from '@/components/DateStrip'
import { TimeSlotList } from '@/components/TimeSlotList'
import { BookingForm, type BookingFormValues } from '@/components/BookingForm'

export function BookingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile, acceptAuth, openLogin } = useAuth()
  const [weekStart, setWeekStart] = useState(() => weekMondayYmd(new Date()))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null)
  const [slotNotice, setSlotNotice] = useState<string | null>(null)
  const isCurrentWeek = weekStart === weekMondayYmd(new Date())

  const slotsQuery = useQuery({
    queryKey: queryKeys.slots(weekStart),
    queryFn: () => fetchSlots(weekStart),
  })

  const bookingMutation = useMutation({
    mutationFn: createBooking,
  })

  const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data])

  const days = useMemo(() => {
    return weekDaysMonSatYmd(weekStart).map((date) => {
      const daySlots = slots.filter((s) => s.date === date)
      return {
        date,
        hasSlots: daySlots.some((s) => !s.past),
        hasAvailable: daySlots.some((s) => s.available),
        freeCount: daySlots.filter((s) => s.available).length,
        allPast: daySlots.length > 0 && daySlots.every((s) => s.past),
      }
    })
  }, [weekStart, slots])

  const activeDate =
    selectedDate && days.some((d) => d.date === selectedDate && d.hasSlots)
      ? selectedDate
      : (days.find((d) => d.hasAvailable)?.date ??
        days.find((d) => d.hasSlots)?.date ??
        null)

  const weekHasAvailable = slots.some((s) => s.available)

  const daySlots = useMemo(
    () => slots.filter((s) => s.date === activeDate),
    [slots, activeDate],
  )

  function selectDate(date: string) {
    setSelectedDate(date)
    setSelectedStartsAt(null)
    setSlotNotice(null)
  }

  function goPrevWeek() {
    if (isCurrentWeek) return
    setWeekStart((w) => shiftWeek(w, -1))
    setSelectedDate(null)
    setSelectedStartsAt(null)
    setSlotNotice(null)
  }

  function goNextWeek() {
    setWeekStart((w) => shiftWeek(w, 1))
    setSelectedDate(null)
    setSelectedStartsAt(null)
    setSlotNotice(null)
  }

  async function handleSubmit(values: BookingFormValues) {
    if (!selectedStartsAt) return
    let result
    try {
      result = await bookingMutation.mutateAsync({
        startsAt: selectedStartsAt,
        guardianName: values.guardianName,
        email: values.email,
        phone: values.phone,
        childName: values.childName,
        childAge: Number(values.childAge),
        helpRequest: values.helpRequest.trim() || undefined,
        ...(values.createAccount
          ? { createAccount: { password: values.password } }
          : {}),
      })
    } catch (err) {
      // Otra familia tomó el cupo o ya pasó: refrescar la lista y pedir otro.
      if (
        err instanceof ApiError &&
        (err.code === 'SLOT_TAKEN' || err.code === 'PAST_SLOT')
      ) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.slots(weekStart) })
        setSelectedStartsAt(null)
        setSlotNotice(`${err.message} Elige otro horario.`)
        return
      }
      throw err
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.slots(weekStart) })
    if (result.auth) acceptAuth(result.auth)
    navigate(`/reserva/${result.session.id}`, {
      state: { accountCreated: Boolean(result.auth) },
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <SiteHeader />

      <section className="relative mt-4 mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-xl text-left">
          <p className="mb-4 text-sm font-semibold text-primary">
            Sesiones de apoyo con Loreto Castillo
          </p>
          <h1 className="font-heading text-4xl leading-[1.08] tracking-[-0.02em] text-balance text-foreground sm:text-[3.25rem]">
            Agenda una sesión para{' '}
            <em className="text-primary italic">acompañar</em> su proceso.
          </h1>
          <p className="mt-5 max-w-[52ch] text-base text-muted-foreground sm:text-lg">
            Elige el día y la hora que más les acomode. Es simple, cercano y sin
            necesidad de crear una cuenta.
          </p>
        </div>
        <EducatorCard />
      </section>

      <HowItWorks />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6 shadow-[0_12px_40px_-24px_rgb(74_36_48/0.35)] sm:p-8">
          <StepHeading step={1}>Elige un horario</StepHeading>

          <DateStrip
            monthLabel={monthRangeLabel(weekStart)}
            days={days}
            selectedDate={activeDate}
            onSelectDate={selectDate}
            canGoPrev={!isCurrentWeek}
            onPrevWeek={goPrevWeek}
            onNextWeek={goNextWeek}
          />

          <div className="mt-8 space-y-4">
            {slotNotice ? (
              <p role="alert" className="text-sm text-destructive">
                {slotNotice}
              </p>
            ) : null}
            {slotsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando horarios…</p>
            ) : slotsQuery.isError ? (
              <p className="text-sm text-destructive">
                {slotsQuery.error instanceof Error
                  ? slotsQuery.error.message
                  : 'Error al cargar cupos'}
              </p>
            ) : !weekHasAvailable ? (
              <p className="text-sm text-muted-foreground">
                No hay horarios disponibles esta semana. Prueba con la siguiente.
              </p>
            ) : (
              <TimeSlotList
                slots={daySlots}
                selectedStartsAt={selectedStartsAt}
                onSelect={(slot) => {
                  setSelectedStartsAt(slot.startsAt)
                  setSlotNotice(null)
                }}
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-[0_12px_40px_-24px_rgb(74_36_48/0.35)] sm:p-8">
          <StepHeading step={2}>Cuéntanos sobre ustedes</StepHeading>

          <BookingForm
            key={profile === undefined ? 'loading' : (profile?.guardian.id ?? 'anon')}
            selectedStartsAt={selectedStartsAt}
            disabled={!selectedStartsAt}
            submitting={bookingMutation.isPending}
            profile={profile ?? null}
            onChangeSlot={() => setSelectedStartsAt(null)}
            onRequestLogin={openLogin}
            onSubmit={handleSubmit}
          />
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}

function StepHeading({
  step,
  children,
}: {
  step: number
  children: string
}) {
  return (
    <h2 className="mb-6 flex items-center gap-3 font-heading text-2xl text-foreground">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-sans text-sm font-semibold text-primary tabular-nums"
      >
        {step}
      </span>
      <span>
        <span className="sr-only">Paso {step} de 2: </span>
        {children}
      </span>
    </h2>
  )
}
