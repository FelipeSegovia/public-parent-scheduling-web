# 002 — Estado

Completado el 2026-10-06. Tareas 1 a 8 hechas.

## Hecho

1. `formatDayLong` («martes 6 de octubre») y `slotRangeLabel` («19:00 – 20:00») en `src/domain/booking.ts`.
2. `EducatorCard` con lista de datos (sesiones presenciales de 1 hora, 3 a 13 años, hora de Chile) y sin punto verde.
3. `HowItWorks` y `SiteFooter` montados en `BookingPage`; línea sobre el título y tarjetas `rounded-2xl`.
4. `freeCount` y `allPast` por día; `DateStrip` en fila de seis columnas con cupos libres (punto en móvil), `aria-pressed` y `aria-label`.
5. `TimeSlotList` con rangos, estados libre / elegido / no disponible (punteado y tachado) y leyenda.
6. `BookingForm`: franja «Tu sesión», aviso sin horario con icono, campos sin iconos, correo y teléfono en fila, grupo «Sobre tu hijo o hija» y caja del opt-in. Lógica, textos e ids sin cambios.
7. `PRODUCT.md` (sesión presencial) y sección Specs de `CLAUDE.md`.
8. Verificación: `pnpm lint` (0 errores; 1 aviso previo en `public/mockServiceWorker.js`) y `pnpm build` pasan. En el navegador con MSW, a 1440 px y 390 px: sin desborde horizontal, sin errores de consola, la cantidad de cupos de cada día coincide con las horas libres al elegirlo, aviso de correo con cuenta visible, reserva con cuenta nueva llega a `/reserva/:id`, login con la cuenta sembrada muestra el selector de dos niños.

## Desvíos y decisiones

- Solo cambios visuales; se mantiene el flujo del formulario y del selector de horario (pedido del usuario, 2026-10-06).
- Las sesiones son presenciales (dato del usuario, 2026-10-06).
- Del lienzo se descartan la grilla semanal de un clic y el flujo móvil en dos pasos.
- La línea sobre el título va sin mayúsculas: la 001 decidió no usar etiquetas en mayúsculas.
- `TimeSlotList`: el título «Horarios disponibles» pasa a ser el día elegido («Martes 6 de octubre») y la duración se movió a la leyenda. No estaba detallado en el plan.
- `DateStrip`: se quitó el mes de cada día (ya aparece sobre la fila), como decía el plan.

## Límites conocidos

- El `.env` del repo apunta al backend real (`VITE_USE_MOCKS=false`); la verificación se hizo con `VITE_USE_MOCKS=true VITE_API_BASE_URL=` en la línea de comandos, sin tocar `.env`.
- No se probó el caso de cupo tomado por otra familia: no se reproduce con MSW y el backend no estaba levantado. El código de ese caso en `BookingPage` no cambió.
- `LoginDialog` mantiene los iconos en sus campos (fuera de alcance).
