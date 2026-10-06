import { Link } from 'react-router'
import { HiOutlineShieldCheck, HiOutlineUserCircle } from 'react-icons/hi2'
import { useAuth } from '@/auth/auth-context'
import logoIcon from '@/assets/icon_acompana.svg'

const quietAction =
  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'

export function SiteHeader() {
  const { profile, openLogin, logout } = useAuth()

  return (
    <header className="flex items-center justify-between gap-4 px-1 py-6">
      <Link to="/" className="flex items-center gap-2.5 text-primary no-underline">
        <img src={logoIcon} alt="" className="size-9" />
        <span className="font-heading text-2xl tracking-tight">Pequeños pasos</span>
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
