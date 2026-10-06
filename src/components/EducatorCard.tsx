import type { IconType } from 'react-icons'
import {
  HiOutlineClock,
  HiOutlineGlobeAmericas,
  HiOutlineUser,
} from 'react-icons/hi2'

const facts: { icon: IconType; text: string }[] = [
  { icon: HiOutlineClock, text: 'Sesiones presenciales de 1 hora' },
  { icon: HiOutlineUser, text: 'Niños y niñas de 3 a 13 años' },
  { icon: HiOutlineGlobeAmericas, text: 'Horarios en hora de Chile' },
]

export function EducatorCard() {
  return (
    <aside className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-left lg:w-80">
      <div className="flex items-center gap-4">
        <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-full bg-brand-selected font-heading text-3xl text-primary">
          LC
        </div>
        <div className="min-w-0">
          <p className="font-heading text-2xl leading-tight text-foreground">
            Loreto Castillo
          </p>
          <p className="text-muted-foreground">Educadora diferencial</p>
        </div>
      </div>
      <ul className="space-y-3 border-t border-border pt-4 text-[0.9375rem]">
        {facts.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <Icon className="size-[1.125rem] shrink-0 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </aside>
  )
}
