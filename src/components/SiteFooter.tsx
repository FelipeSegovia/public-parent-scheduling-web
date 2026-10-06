import { HiOutlineLockClosed } from 'react-icons/hi2'

export function SiteFooter() {
  return (
    <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-left text-sm text-muted-foreground">
      <p className="flex items-start gap-2">
        <HiOutlineLockClosed
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        Tus datos solo los ve Loreto. Nunca mostramos información de otras
        familias.
      </p>
      <p>Pequeños pasos · Loreto Castillo, educadora diferencial</p>
    </footer>
  )
}
