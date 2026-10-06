# 002 — Plan técnico

Solo presentación. No se tocan `src/api/`, `src/auth/`, `src/mocks/`, `src/domain/` (salvo helpers de formato puros), rutas ni estados de los componentes.

## Archivos

| Archivo | Cambio |
| --- | --- |
| `src/components/EducatorCard.tsx` | Tarjeta más grande (avatar 72 px con iniciales en `font-heading`), separador y lista de tres datos con iconos `react-icons/hi2` (`HiOutlineClock`, `HiOutlineUser`, `HiOutlineGlobeAmericas`). Sin punto verde. |
| `src/components/HowItWorks.tsx` (nuevo) | `<ol>` de tres pasos en `bg-brand-soft`, número en círculo `bg-card text-primary`. Grilla `sm:grid-cols-3`, apilada en móvil. Sin props. |
| `src/components/SiteFooter.tsx` (nuevo) | Pie con borde superior, icono `HiOutlineLockClosed` y la frase de privacidad; a la derecha «Acompaña · Loreto Castillo, educadora diferencial». |
| `src/pages/BookingPage.tsx` | Monta `HowItWorks` entre el héroe y las tarjetas, y `SiteFooter` al final. En `days` agrega `freeCount` (horas `available`) y `allPast` (hay horas y todas `past`). Héroe: eyebrow «Sesiones de apoyo con Loreto Castillo» y la tarjeta de la educadora a la altura del bloque de texto. Las tarjetas pasan a `rounded-2xl`. Sin cambios de estado ni handlers. |
| `src/components/DateStrip.tsx` | Recibe `freeCount` y `allPast` por día. Fila `grid grid-cols-6 gap-1.5 sm:gap-2` en lugar de `overflow-x-auto`. Cada botón: `min-h-16`, `aria-pressed`, `aria-label` «martes 6 de octubre, 2 horarios libres» / «…, ya pasó» / «…, sin cupos». Debajo del número: texto «2 libres» desde `sm`; en móvil un punto `size-1.5` si `freeCount > 0`. Se quita el mes del chip (ya está en el título de la semana) para ganar espacio. Flechas: `size-11`. |
| `src/components/TimeSlotList.tsx` | Botones en grilla `grid-cols-2 sm:grid-cols-3`, `min-h-11`, texto `19:00 – 20:00`. Estilos: elegido `bg-primary text-primary-foreground`; libre `bg-card border-border hover:border-primary`; no disponible `border-dashed line-through text-muted-foreground`. `aria-pressed` y `aria-label` con disponibilidad. Leyenda al final con tres muestras y «Todas las sesiones duran 1 hora» (reemplaza la línea «Duración de la sesión: 1 hora»). |
| `src/components/BookingForm.tsx` | Solo marcado y clases: resumen «Tu sesión» en `bg-primary text-primary-foreground` con «Cambiar» como botón contorneado claro (`min-h-11`); aviso sin horario con `HiOutlineCalendar`. `Field` deja de recibir `icon` y los `Input` pierden `pl-9`. Correo y teléfono en `grid sm:grid-cols-2`; el aviso de correo con cuenta pasa debajo de esa grilla. `ChildPicker`, nombre, edad y nota de ayuda dentro de `<fieldset>` con `<legend>` «Sobre tu hijo o hija» (`rounded-2xl border p-4`). Opt-in dentro de `rounded-xl bg-brand-soft p-4`. Lógica, textos, ids y `aria-*` existentes intactos. |
| `src/domain/booking.ts` | `formatDayLong(dateYmd)` («martes 6 de octubre») y `slotRangeLabel(time)` («19:00 – 20:00»), puros, para etiquetas. |

## Decisiones

- Los días y las horas siguen siendo dos controles separados: elegir día y luego hora, como hoy.
- La lógica de `BookingForm` no se reordena: solo se envuelven bloques en contenedores nuevos. El aviso de correo con cuenta conserva su condición y su botón.
- `LoginDialog` mantiene sus iconos en los campos (fuera de alcance); queda una diferencia menor entre el diálogo y el formulario.
- Colores solo con tokens de Tailwind del tema (`primary`, `brand-soft`, `border`, `muted-foreground`…); nada de hex sueltos.

## Verificación

- `pnpm lint` y `pnpm build`.
- `pnpm dev` con MSW, en 1440 px y 390 px: reserva sin cuenta; con «Crear cuenta»; con la cuenta sembrada (`ejemplo@correo.cl`, dos niños); correo con cuenta sin sesión (aviso visible bajo correo/teléfono); semana siguiente y vuelta. El cupo tomado por otra familia no se puede reproducir con MSW (cada pestaña tiene su propio mock en memoria); se prueba con el backend real si está disponible y, si no, se revisa que el código de ese caso no cambió. Revisar que cada día muestre la cantidad correcta y que no haya desborde horizontal.
