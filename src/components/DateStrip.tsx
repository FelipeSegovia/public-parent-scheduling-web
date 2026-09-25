import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { formatDayChip } from '@/domain/booking'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DayOption = {
  date: string
  hasSlots: boolean
}

type Props = {
  monthLabel: string
  days: DayOption[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function DateStrip({
  monthLabel,
  days,
  selectedDate,
  onSelectDate,
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
          onClick={onPrevWeek}
          className="rounded-full"
        >
          <HiChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium text-foreground">
          {monthLabel}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Semana siguiente"
          onClick={onNextWeek}
          className="rounded-full"
        >
          <HiChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const chip = formatDayChip(day.date)
          const selected = selectedDate === day.date
          return (
            <button
              key={day.date}
              type="button"
              disabled={!day.hasSlots}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-3 py-3 text-center transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/40',
                !day.hasSlots && 'cursor-not-allowed opacity-40 hover:border-border',
              )}
            >
              <span className="text-[0.65rem] font-semibold tracking-wide opacity-80">
                {chip.weekday}
              </span>
              <span className="text-xl font-semibold leading-tight">{chip.day}</span>
              <span className="text-xs capitalize opacity-80">{chip.month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
