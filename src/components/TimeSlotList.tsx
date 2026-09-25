import { HiOutlineClock } from 'react-icons/hi2'
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">Horarios disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Duración de la sesión: 1 hora
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HiOutlineClock className="size-3.5" aria-hidden />
          Hora de Chile
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const selected = selectedStartsAt === slot.startsAt
          const available = slot.available
          return (
            <button
              key={slot.startsAt}
              type="button"
              disabled={!available}
              onClick={() => onSelect(slot)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium tabular-nums transition-colors',
                selected && 'border-primary bg-brand-selected text-primary',
                available &&
                  !selected &&
                  'border-border bg-card hover:border-primary/40',
                !available &&
                  'cursor-not-allowed border-transparent bg-muted text-muted-foreground',
              )}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
