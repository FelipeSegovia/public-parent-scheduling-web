import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { formatDayChip, formatDayLong } from '@/domain/booking'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DayOption = {
  date: string
  hasSlots: boolean
  freeCount: number
  allPast: boolean
}

type Props = {
  monthLabel: string
  days: DayOption[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  canGoPrev: boolean
  onPrevWeek: () => void
  onNextWeek: () => void
}

function availabilityNote(day: DayOption): string {
  if (day.allPast) return 'Ya pasó'
  if (day.freeCount === 0) return 'Sin cupos'
  return day.freeCount === 1 ? '1 libre' : `${day.freeCount} libres`
}

function availabilityLabel(day: DayOption): string {
  if (day.allPast) return 'ya pasó'
  if (day.freeCount === 0) return 'sin horarios libres'
  return day.freeCount === 1
    ? '1 horario libre'
    : `${day.freeCount} horarios libres`
}

export function DateStrip({
  monthLabel,
  days,
  selectedDate,
  onSelectDate,
  canGoPrev,
  onPrevWeek,
  onNextWeek,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Semana anterior"
          disabled={!canGoPrev}
          onClick={onPrevWeek}
          className="size-11 rounded-full bg-card text-primary"
        >
          <HiChevronLeft className="size-[1.125rem]" />
        </Button>
        <p className="text-sm font-medium text-foreground">{monthLabel}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Semana siguiente"
          onClick={onNextWeek}
          className="size-11 rounded-full bg-card text-primary"
        >
          <HiChevronRight className="size-[1.125rem]" />
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const chip = formatDayChip(day.date)
          const selected = selectedDate === day.date
          return (
            <button
              key={day.date}
              type="button"
              disabled={!day.hasSlots}
              aria-pressed={selected}
              aria-label={`${formatDayLong(day.date)}, ${availabilityLabel(day)}`}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl border px-1 py-2.5 text-center transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/40',
                !day.hasSlots &&
                  'cursor-not-allowed border-transparent bg-transparent text-muted-foreground opacity-60 hover:border-transparent',
              )}
            >
              <span className="text-[0.65rem] font-semibold tracking-wide opacity-80">
                {chip.weekday}
              </span>
              <span className="text-xl leading-tight font-semibold tabular-nums">
                {chip.day}
              </span>
              <span
                aria-hidden
                className={cn(
                  'mt-1 size-1.5 rounded-full sm:hidden',
                  day.freeCount > 0
                    ? selected
                      ? 'bg-primary-foreground'
                      : 'bg-primary'
                    : 'bg-transparent',
                )}
              />
              <span
                aria-hidden
                className={cn(
                  'hidden text-[0.7rem] whitespace-nowrap sm:block',
                  selected ? 'opacity-90' : 'text-muted-foreground',
                )}
              >
                {availabilityNote(day)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
