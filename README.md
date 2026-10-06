# Pequeños pasos — Reserva pública para apoderados

Superficie web pública del MVP de agendamiento. Permite a un apoderado ver cupos libres y reservar **una sesión** con una educadora diferencial. La cuenta es opcional: sirve solo para no volver a escribir los datos.

Marca del producto: **Pequeños pasos**. Zona horaria: `America/Santiago`.

## Para quién es

- Apoderados de niños entre **3 y 13 años**.
- Pueden reservar sin cuenta. No hay panel de “mis citas”.
- Confirmación y cancelación solo con los enlaces del correo (en local se simulan en la pantalla de resultado).

## Qué hace

1. Muestra solo **fecha y hora** de cupos libres (no datos de otras familias).
2. Reserva una sesión suelta con: nombre del apoderado, email, teléfono, nombre del niño y edad (3–13).
3. Bloquea el cupo al reservar. Si faltan menos de 24 horas (incluye el mismo día), la sesión nace `confirmada`; si no, nace `pendiente`.
4. Confirmar o cancelar con token de enlace. Cancelar libera el cupo hasta la hora de la cita. No hay reprogramación desde esta superficie.
5. Cuenta opcional con correo y clave ([spec](.specs/001-cuenta-apoderado/spec.md)):
   - Registro: al reservar, marcar «Crear cuenta con estos datos» y escribir una clave (mínimo 8 caracteres). Un solo envío crea la cuenta y reserva.
   - Inicio de sesión: diálogo desde el encabezado. Completa nombre, correo, teléfono y niño (con varios niños, se elige uno o se escribe otro). La nota de ayuda no se completa.
   - Clave olvidada: enlace al correo que abre `/cuenta/restablecer/:token`. En local el enlace aparece en pantalla.
   - Una reserva sin sesión con un correo que ya tiene cuenta no cambia ese perfil.

Cuenta de prueba en local: `ejemplo@correo.cl` / `acompana123` (dos niños guardados).

Horario base del MVP:

- Lunes a viernes: 19:00 y 20:00
- Sábado: 9:00, 10:00 y 11:00
- Duración fija: 1 hora

## Qué no incluye

Cuenta obligatoria, panel de “mis citas”, series semanales, reprogramación por el apoderado, pago, WhatsApp automático ni el panel de la educadora. Eso vive en otras superficies o está fuera del MVP.

Requisitos canónicos: [`docs/mvp/REQUERIMIENTOS_FUNCIONALES.md`](../docs/mvp/REQUERIMIENTOS_FUNCIONALES.md) y [`docs/mvp/FUERA_DEL_MVP.md`](../docs/mvp/FUERA_DEL_MVP.md). Contexto para agentes: [`AGENTS.md`](./AGENTS.md).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui
- React Router
- TanStack Query (fetching y cache de `/api/*`)
- MSW (API mock en desarrollo)
- date-fns / date-fns-tz

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:5173/](http://localhost:5173/). Por defecto la app usa MSW: intercepta `/api/*` con datos en memoria, sin necesidad de backend.

```bash
pnpm build    # build de producción
pnpm preview  # servir el build
pnpm lint     # ESLint
```

No hay test runner. Verificar en el navegador con `pnpm dev`.

### Conectar con el backend real

`src/api/client.ts` habla el mismo contrato que `profesor-scheduling-api/` ([fuente de la verdad](../CLAUDE.md#hoja-de-ruta) de la API), así que alternar entre mock y backend real es solo variables de entorno. Copia `.env.example` a `.env.local` y ajusta:

| Variable | Default | Efecto |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | `true`: arranca MSW en dev. `false`: no arranca MSW; todo va al backend real. |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL del backend (`profesor-scheduling-api`). Vacío = rutas relativas (para que MSW las intercepte). |

Con `VITE_USE_MOCKS=false`, levanta `profesor-scheduling-api/` aparte (puerto `3000` por defecto, con CORS habilitado para `http://localhost:5173`) antes de correr `pnpm dev`.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Reserva: elegir cupo y completar datos |
| `/reserva/:id` | Resultado de la reserva (y enlaces locales Confirmo / No puedo) |
| `/sesion/:token/confirmar` | Confirmar sesión pendiente |
| `/sesion/:token/cancelar` | Cancelar sesión |
| `/cuenta/restablecer/:token` | Elegir una clave nueva |

## Estructura relevante

```
src/
  pages/          # BookingPage, resultado, enlaces de sesión y restablecer clave
  components/     # UI de reserva (fechas, chips de hora, formulario, login)
  auth/           # Contexto de sesión del apoderado (sobre TanStack Query)
  domain/         # Plantilla de cupos, plazo 24h, normalización
  mocks/          # MSW + store en memoria
  api/            # Cliente HTTP hacia /api + query-keys de TanStack Query
  lib/            # QueryClient y utilidades compartidas
```
