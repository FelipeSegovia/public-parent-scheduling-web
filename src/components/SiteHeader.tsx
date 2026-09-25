import { Link } from 'react-router'
import { HiOutlineShieldCheck } from 'react-icons/hi2'

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-1 py-6">
      <Link to="/" className="flex items-center gap-2.5 text-primary no-underline">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" />
            <path
              d="M12 8.2c-.7 0-1.3.4-1.6 1-.2.4 0 .8.3 1 .4.3.9.3 1.3 0 .3-.2.5-.6.3-1-.3-.6-.9-1-1.3-1z"
              fill="var(--background)"
            />
          </svg>
        </span>
        <span className="font-heading text-2xl tracking-tight">Acompaña</span>
      </Link>

      <p className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <HiOutlineShieldCheck className="size-4 text-primary" aria-hidden />
        Reserva segura y sin registro
      </p>
    </header>
  )
}
