# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Superficie pública del agendamiento: el apoderado reserva una sesión y, si quiere, crea una cuenta para no volver a escribir sus datos. Mapa general del proyecto en [`../CLAUDE.md`](../CLAUDE.md).

Reglas de la superficie, paleta y flujo SDD:
@AGENTS.md

Producto, usuarios y rutas:
@PRODUCT.md

## Comandos

```bash
pnpm dev        # Vite; en dev arranca MSW antes de renderizar
pnpm build      # tsc -b && vite build
pnpm lint       # eslint .
pnpm preview
```

No hay test runner. Verificar en el navegador con `pnpm dev`.

## Arquitectura

Vite + React 19 + TypeScript + Tailwind v4 + shadcn (sobre `@base-ui/react`) + react-router 8 + TanStack Query 5 + React Compiler. Alias `@` → `src/`. Fechas con `date-fns` / `date-fns-tz` y `TIMEZONE` de `src/domain/types.ts`.

Flujo de datos:

```
src/pages/*  →  TanStack Query (useQuery/useMutation)  →  src/api/client.ts  →  fetch /api/*
                     ↑                                                              ↓
             src/auth/ (AuthProvider, también sobre TanStack Query)   MSW src/mocks/handlers.ts → src/mocks/db.ts
                                                                        (VITE_USE_MOCKS=false la desactiva)
```

- `src/domain/`: tipos (`types.ts`) y reglas sin efectos (`booking.ts`: normalización de nombres, rango de edad; `auth.ts`: validación de clave, normalización de email). Reutilizarlas en UI y mock.
- `src/api/client.ts`: única puerta a la API. Prefija cada request con `VITE_API_BASE_URL` (vacío = rutas relativas). Lanza `ApiError`. El token de sesión se guarda en `sessionStorage`.
- `src/api/query-keys.ts`: keys centralizadas para invalidar cache de TanStack Query (`slots`, `booking`, `auth.me`).
- `src/lib/query-client.ts`: instancia única de `QueryClient`, montada en `App.tsx` con `QueryClientProvider`.
- `src/auth/`: contexto de la cuenta opcional (`AuthProvider`, `auth-context.ts`). El perfil (`GET /api/auth/me`) se maneja con `useQuery`; login/logout/reset con `useMutation`.
- `src/mocks/db.ts`: **aquí vive la lógica de negocio del "backend" mockeado** (cupos libres, estado inicial según plazo, reutilizar apoderado por email y niño por nombre, tokens de confirmar/cancelar, cuentas y restablecimiento de clave). Es en memoria: recargar la página lo reinicia. El contrato coincide con el del backend real (ver más abajo).
- `src/pages/`: una página por ruta de `src/App.tsx`. `src/components/`: formulario de reserva, selector de fecha/hora, diálogo de login, encabezado.

## Backend real vs. mocks

La fuente de la verdad del contrato de la API es [`../profesor-scheduling-api/docs/`](../profesor-scheduling-api/docs/) (`API.md` y `openapi.json`) — no este mock. `src/api/client.ts` implementa ese mismo contrato 1:1, así que cambiar de mock a backend real no toca código, solo variables de entorno (`.env.local`, ver `.env.example`):

| Variable | Efecto |
| --- | --- |
| `VITE_USE_MOCKS` | `true` (default): arranca MSW en dev. `false`: no arranca MSW; todas las peticiones van al backend real. |
| `VITE_API_BASE_URL` | Base URL del backend (`profesor-scheduling-api`), ej. `http://localhost:3000`. Vacío = rutas relativas (necesario para que MSW las intercepte). |

Con backend real, levantarlo aparte (`profesor-scheduling-api/`, puerto por defecto `3000`) y confirmar que tiene CORS habilitado para el origen de Vite.

## API

Rutas que usa esta app (contrato completo en [`../profesor-scheduling-api/docs/`](../profesor-scheduling-api/docs/)):

| Método y ruta | Uso |
| --- | --- |
| `GET /api/slots?weekStart=` | Cupos libres de la semana (solo fecha y hora) |
| `POST /api/bookings` | Crear reserva (opcional `createAccount`) |
| `GET /api/bookings/:id` | Resultado de la reserva |
| `POST /api/sessions/confirm/:token` · `cancel/:token` | Enlaces Confirmo / No puedo del correo |
| `POST /api/auth/register` · `login` · `logout` · `forgot` · `reset` | Cuenta opcional |
| `GET /api/auth/me` · `GET /api/auth/email-status` | Perfil con sesión; aviso «este correo ya tiene cuenta» |

Los correos no se envían (el backend los encola pero aún no los despacha): la pantalla `/reserva/:id` muestra los enlaces Confirmo / No puedo.

El mock usa la plantilla inicial fija y el plazo de 24 h, y no reproduce bloqueos de día o cupo ni el horizonte de reserva (`bookingHorizonWeeks`). Para probar esos casos, usa el backend real.

## Datos de prueba

Cuenta sembrada en `src/mocks/db.ts` (`ejemplo@correo.cl`, clave en `SEED_PASSWORD`) con dos niños. Se recrea en cada carga.

## Specs

- `.specs/001-cuenta-apoderado/`: cuenta opcional. Completada (ver `status.md`, incluye límites conocidos del mock de auth).
- La siguiente feature usa `002-`.
