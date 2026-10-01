import { Link } from 'react-router'
import { HiOutlineShieldCheck, HiOutlineUserCircle } from 'react-icons/hi2'
import { useAuth } from '@/auth/auth-context'

const quietAction =
  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'

export function SiteHeader() {
  const { profile, openLogin, logout } = useAuth()

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

      {profile === undefined ? null : profile ? (
        <div className="flex items-center gap-1 text-sm">
          <span className="hidden items-center gap-1.5 pr-1 text-foreground sm:flex">
            <HiOutlineUserCircle className="size-5 text-primary" aria-hidden />
            {profile.guardian.name.split(' ')[0]}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className={`${quietAction} text-muted-foreground hover:bg-muted hover:text-foreground`}
          >
            Salir
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <HiOutlineShieldCheck className="size-4 text-primary" aria-hidden />
            Puedes reservar sin cuenta
          </p>
          <button
            type="button"
            onClick={() => openLogin()}
            className={`${quietAction} border border-border bg-card text-primary hover:border-primary/40`}
          >
            Iniciar sesión
          </button>
        </div>
      )}
    </header>
  )
}
