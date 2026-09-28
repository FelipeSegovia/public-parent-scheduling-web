import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { createBooking, fetchSlots } from '@/api/client'
import {
  monthRangeLabel,
  shiftWeek,
  weekDaysMonSatYmd,
  weekMondayYmd,
} from '@/domain/booking'
import type { SlotView } from '@/domain/types'
import { SiteHeader } from '@/components/SiteHeader'
import { EducatorCard } from '@/components/EducatorCard'
import { DateStrip } from '@/components/DateStrip'
import { TimeSlotList } from '@/components/TimeSlotList'
import { BookingForm, type BookingFormValues } from '@/components/BookingForm'

type SlotsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; slots: SlotView[] }

export function BookingPage() {
  const navigate = useNavigate()
  const [weekStart, setWeekStart] = useState(() => weekMondayYmd(new Date()))
  const [slotsState, setSlotsState] = useState<SlotsState>({ status: 'loading' })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setSlotsState({ status: 'loading' })

    void fetchSlots(weekStart)
      .then((slots) => {
        if (!cancelled) setSlotsState({ status: 'ready', slots })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSlotsState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Error al cargar cupos',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [weekStart])

  const slots = useMemo(
    () => (slotsState.status === 'ready' ? slotsState.slots : []),
    [slotsState],
  )

  const days = useMemo(() => {
    return weekDaysMonSatYmd(weekStart).map((date) => {
      const daySlots = slots.filter((s) => s.date === date)
      return {
        date,
        hasSlots: daySlots.some((s) => !s.past),
        hasAvailable: daySlots.some((s) => s.available),
      }
    })
  }, [weekStart, slots])

  const activeDate =
    selectedDate && days.some((d) => d.date === selectedDate && d.hasSlots)
      ? selectedDate
      : (days.find((d) => d.hasAvailable)?.date ??
        days.find((d) => d.hasSlots)?.date ??
        null)

  const daySlots = useMemo(
    () => slots.filter((s) => s.date === activeDate),
    [slots, activeDate],
  )

  function selectDate(date: string) {
    setSelectedDate(date)
    setSelectedStartsAt(null)
  }

  function goPrevWeek() {
    setWeekStart((w) => shiftWeek(w, -1))
    setSelectedDate(null)
    setSelectedStartsAt(null)
  }

  function goNextWeek() {
    setWeekStart((w) => shiftWeek(w, 1))
    setSelectedDate(null)
    setSelectedStartsAt(null)
  }

  async function handleSubmit(values: BookingFormValues) {
    if (!selectedStartsAt) return
    setSubmitting(true)
    try {
      const result = await createBooking({
        startsAt: selectedStartsAt,
        guardianName: values.guardianName,
        email: values.email,
        phone: values.phone,
        childName: values.childName,
        childAge: Number(values.childAge),
        helpRequest: values.helpRequest.trim() || undefined,
      })
      navigate(`/reserva/${result.session.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <SiteHeader />

      <section className="relative mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="max-w-xl text-left">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Espacio de apoyo para tu familia
          </p>
          <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            Agenda una sesión para{' '}
            <em className="text-primary italic">acompañar</em> su proceso.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Elige el día y la hora que más les acomode. Es simple, cercano y sin
            necesidad de crear una cuenta.
          </p>
        </div>
        <div className="lg:pt-2">
          <EducatorCard />
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Paso 1 de 2
          </p>
          <h2 className="mb-6 font-heading text-2xl text-foreground">
            Elige un horario
          </h2>

          <DateStrip
            monthLabel={monthRangeLabel(weekStart)}
            days={days}
            selectedDate={activeDate}
            onSelectDate={selectDate}
            onPrevWeek={goPrevWeek}
            onNextWeek={goNextWeek}
          />

          <div className="mt-8">
            {slotsState.status === 'loading' ? (
              <p className="text-sm text-muted-foreground">Cargando horarios…</p>
            ) : slotsState.status === 'error' ? (
              <p className="text-sm text-destructive">{slotsState.message}</p>
            ) : (
              <TimeSlotList
                slots={daySlots}
                selectedStartsAt={selectedStartsAt}
                onSelect={(slot) => setSelectedStartsAt(slot.startsAt)}
              />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Paso 2 de 2
          </p>
          <h2 className="mb-6 font-heading text-2xl text-foreground">
            Cuéntanos sobre ustedes
          </h2>

          <BookingForm
            selectedStartsAt={selectedStartsAt}
            disabled={!selectedStartsAt}
            submitting={submitting}
            onChangeSlot={() => setSelectedStartsAt(null)}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </div>
  )
}
