# Acompaña — Reserva pública para apoderados

Superficie web pública del MVP de agendamiento. Permite a un apoderado ver cupos libres y reservar **una sesión** con una educadora diferencial, sin crear cuenta ni iniciar sesión.

Marca del producto: **Acompaña**. Zona horaria: `America/Santiago`.

## Para quién es

- Apoderados de niños entre **3 y 13 años**.
- Sin login, registro ni panel de “mis citas”.
- Confirmación y cancelación solo con los enlaces del correo (en local se simulan en la pantalla de resultado).

## Qué hace

1. Muestra solo **fecha y hora** de cupos libres (no datos de otras familias).
2. Reserva una sesión suelta con: nombre del apoderado, email, teléfono, nombre del niño y edad (3–13).
3. Bloquea el cupo al reservar. Si faltan menos de 24 horas (incluye el mismo día), la sesión nace `confirmada`; si no, nace `pendiente`.
4. Confirmar o cancelar con token de enlace. Cancelar libera el cupo hasta la hora de la cita. No hay reprogramación desde esta superficie.

Horario base del MVP:

- Lunes a viernes: 19:00 y 20:00
- Sábado: 9:00, 10:00 y 11:00
- Duración fija: 1 hora

## Qué no incluye

Login, series semanales, reprogramación por el apoderado, pago, WhatsApp automático ni el panel de la educadora. Eso vive en otras superficies o está fuera del MVP.

Requisitos canónicos: [`docs/mvp/REQUERIMIENTOS_FUNCIONALES.md`](../docs/mvp/REQUERIMIENTOS_FUNCIONALES.md) y [`docs/mvp/FUERA_DEL_MVP.md`](../docs/mvp/FUERA_DEL_MVP.md). Contexto para agentes: [`AGENTS.md`](./AGENTS.md).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui
- React Router
- MSW (API mock en desarrollo)
- date-fns / date-fns-tz

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:5173/](http://localhost:5173/). En desarrollo, MSW intercepta `/api/*` con datos en memoria.

```bash
pnpm build    # build de producción
pnpm preview  # servir el build
pnpm lint     # ESLint
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Reserva: elegir cupo y completar datos |
| `/reserva/:id` | Resultado de la reserva (y enlaces locales Confirmo / No puedo) |
| `/sesion/:token/confirmar` | Confirmar sesión pendiente |
| `/sesion/:token/cancelar` | Cancelar sesión |

## Estructura relevante

```
src/
  pages/          # BookingPage, resultado y enlaces de sesión
  components/     # UI de reserva (fechas, chips de hora, formulario)
  domain/         # Plantilla de cupos, plazo 24h, normalización
  mocks/          # MSW + store en memoria
  api/            # Cliente HTTP hacia /api
```
