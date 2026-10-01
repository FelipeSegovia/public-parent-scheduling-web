# 001 — Plan técnico

## Datos (mock MSW, en memoria)

- `Account`: `{ guardianId, passwordHash, salt }`. Una cuenta por apoderado; la ficha sigue siendo `Guardian` + `Child`.
- `AuthSession`: `{ token, guardianId }`. Token opaco guardado en `sessionStorage` del navegador y enviado en `Authorization: Bearer <token>`.
- `PasswordReset`: `{ token, guardianId, expiresAt }`. Vence en 1 hora y se usa una sola vez.
- Hash con `crypto.subtle` SHA-256 sobre `salt + clave`. Es un mock: no es autenticación de producción.

## Contratos

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password, guardianName, phone }` | `{ token, profile }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, profile }` |
| POST | `/api/auth/logout` | — | `204` |
| GET | `/api/auth/me` | — | `{ profile }` |
| GET | `/api/auth/email-status?email=` | — | `{ hasAccount }` |
| POST | `/api/auth/forgot` | `{ email }` | `{ ok, devResetToken? }` |
| POST | `/api/auth/reset` | `{ token, password }` | `{ token, profile }` |

`profile` = `{ guardian, children }`.

`POST /api/bookings` acepta `Authorization` y opcionalmente `createAccount: { password }`:

- Con sesión: el correo del cuerpo debe ser el de la cuenta; se actualizan nombre, teléfono y niño.
- Sin sesión y el correo tiene cuenta: se reserva, pero no se tocan nombre ni teléfono, ni la edad de un niño existente.
- Sin sesión, sin cuenta y con `createAccount`: se valida la clave antes de crear nada, se reserva y se crea la cuenta; la respuesta incluye `auth: { token, profile }`.

`forgot` siempre responde `ok` (no revela si el correo existe). En desarrollo devuelve `devResetToken` para simular el correo.

## Archivos

- `src/domain/types.ts`: `GuardianProfile`, `AuthResult`, `createAccount` en `CreateBookingInput`.
- `src/domain/auth.ts`: `PASSWORD_MIN_LENGTH`, `getPasswordErrors`.
- `src/mocks/db.ts`: cuentas, sesiones, restablecimiento y reglas en `createBooking`.
- `src/mocks/handlers.ts`: rutas nuevas.
- `src/api/client.ts`: funciones de auth y token en `sessionStorage`.
- `src/auth/AuthContext.tsx`: estado de sesión compartido (perfil, login, logout, register).
- `src/components/LoginDialog.tsx`: diálogo nativo `<dialog>` con login y «olvidé mi clave».
- `src/components/SiteHeader.tsx`, `BookingForm.tsx`, `ChildPicker.tsx`.
- `src/pages/ResetPasswordPage.tsx` en `/cuenta/restablecer/:token`.
