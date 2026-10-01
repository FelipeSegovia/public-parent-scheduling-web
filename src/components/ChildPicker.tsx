import { HiOutlinePlus } from 'react-icons/hi2'
import { normalizeName } from '@/domain/booking'
import type { Child } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  saved: Child[]
  childName: string
  onPick: (child: Child | null) => void
}

const chip =
  'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'

export function ChildPicker({ saved, childName, onPick }: Props) {
  const current = normalizeName(childName)
  const match = saved.find((c) => normalizeName(c.name) === current)

  return (
    <fieldset className="space-y-2 text-left">
      <legend className="mb-2 text-sm font-medium">¿Para quién es la sesión?</legend>
      <div className="flex flex-wrap gap-2">
        {saved.map((child) => {
          const selected = match?.id === child.id
          return (
            <button
              key={child.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(child)}
              className={cn(
                chip,
                selected
                  ? 'border-primary bg-brand-selected text-primary'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              {child.name}
              <span className="font-normal text-muted-foreground tabular-nums">
                {child.age} años
              </span>
            </button>
          )
        })}
        <button
          type="button"
          aria-pressed={!match && current !== ''}
          onClick={() => onPick(null)}
          className={cn(
            chip,
            !match && current !== ''
              ? 'border-primary bg-brand-selected text-primary'
              : 'border-dashed border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <HiOutlinePlus className="size-4" aria-hidden />
          Otro niño o niña
        </button>
      </div>
    </fieldset>
  )
}
