# 002 — Tareas

1. [x] Helpers de formato en `src/domain/booking.ts`: `formatDayLong` y `slotRangeLabel`.
2. [x] `EducatorCard` con la lista de datos (sesiones presenciales de 1 hora, 3 a 13 años, hora de Chile) y sin el punto verde.
3. [x] Componentes nuevos `HowItWorks` y `SiteFooter`, y montarlos en `BookingPage` junto con el eyebrow del héroe y las tarjetas `rounded-2xl`.
4. [x] `freeCount` y `allPast` en `days` de `BookingPage`; `DateStrip` en fila de seis columnas con cupos libres, punto en móvil, `aria-pressed` y `aria-label`.
5. [x] `TimeSlotList` con rangos, estados libre / elegido / no disponible, `aria-*` y leyenda.
6. [x] `BookingForm`: franja «Tu sesión», aviso sin horario, campos sin iconos, correo y teléfono en fila, grupo «Sobre tu hijo o hija» y caja del opt-in. Sin cambios de lógica.
7. [x] Documentación: «Sesiones presenciales» en `PRODUCT.md` y la sección Specs de `CLAUDE.md` (002 y siguiente número 003).
8. [x] Verificación: `pnpm lint`, `pnpm build` y recorrido en el navegador a 1440 px y 390 px según `plan.md`.
