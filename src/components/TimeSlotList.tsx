import { HiOutlineClock } from 'react-icons/hi2'
import { formatDayLong, slotRangeLabel } from '@/domain/booking'
import type { SlotView } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  slots: SlotView[]
  selectedStartsAt: string | null
  onSelect: (slot: SlotView) => void
}

export function TimeSlotList({ slots, selectedStartsAt, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay horarios para este día.
      </p>
    )
  }

  const allPast = slots.every((s) => s.past)
  if (allPast) {
    return (
      <p className="text-sm text-muted-foreground">
        Este día ya pasó. Elige otra fecha.
      </p>
    )
  }

  const dayLabel = formatDayLong(slots[0].date)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="font-medium text-foreground first-letter:uppercase">
          {dayLabel}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HiOutlineClock className="size-3.5" aria-hidden />
          Hora de Chile
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const selected = selectedStartsAt === slot.startsAt
          const available = slot.available
          return (
            <button
              key={slot.startsAt}
              type="button"
              disabled={!available}
              aria-pressed={selected}
              aria-label={`${slotRangeLabel(slot.time)}${available ? '' : ', no disponible'}`}
              onClick={() => onSelect(slot)}
              className={cn(
                'min-h-11 rounded-full border px-3 text-sm font-medium tabular-nums transition-colors',
                selected && 'border-primary bg-primary text-primary-foreground',
                available &&
                  !selected &&
                  'border-border bg-card text-foreground hover:border-primary',
                !available &&
                  'cursor-not-allowed border-dashed border-brand-selected bg-transparent text-muted-foreground line-through',
              )}
            >
              {slotRangeLabel(slot.time)}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded-full border border-border bg-card" />
          Libre
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded-full bg-primary" />
          Tu elección
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-3.5 rounded-full border border-dashed border-muted-foreground/60"
          />
          No disponible
        </span>
        <span className="sm:ml-auto">Todas las sesiones duran 1 hora</span>
      </div>
    </div>
  )
}
