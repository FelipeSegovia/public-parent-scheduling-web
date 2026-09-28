import type { ReactNode } from 'react'

type Props = {
  id?: string
  children: ReactNode
}

/** Mensaje de error o validación alineado con el resto del sitio. */
export function FieldMessage({ id, children }: Props) {
  return (
    <p
      id={id}
      role="alert"
      className="text-xs text-destructive"
    >
      {children}
    </p>
  )
}
