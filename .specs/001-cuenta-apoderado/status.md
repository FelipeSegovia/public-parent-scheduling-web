# 001 — Estado

Completado el 2026-09-28. Tareas 1 a 6 hechas.

## Hecho

1. Spec, plan y tareas; PRODUCT.md, README, AGENTS.md y `../docs/mvp` actualizados.
2. Dominio y mock: `src/domain/auth.ts`, cuentas, sesiones y restablecimiento en `src/mocks/db.ts`; `createBooking` protege el perfil de cuentas sin sesión y acepta `createAccount`.
3. Cliente API (`src/api/client.ts`, token en `sessionStorage`) y contexto `src/auth/`.
4. Interfaz: `LoginDialog`, opt-in de registro y aviso de correo con cuenta en `BookingForm`, `ChildPicker`, `ResetPasswordPage`.
5. Pulido: encabezado con sesión, pasos numerados sin etiquetas en mayúsculas, tarjetas con una sola elevación y radio menor, selección y foco con color de marca, botones del resultado a la altura del resto.
6. Verificado en el navegador: reserva sin cuenta, registro con validaciones, login con autocompletado y conservación del horario elegido, selector de varios niños, reserva con sesión, salir, aviso de correo con cuenta, clave olvidada completa (enlace de un uso, clave vieja y sesiones anteriores invalidadas) y móvil a 390 px sin desborde.

## Desvíos y decisiones

- Cuenta con correo y clave (elegida por el usuario frente a enlace mágico).
- Sin páginas propias de registro ni login: registro como opt-in en el formulario, login en diálogo.
- Se agregó `GET /api/auth/email-status` para el aviso «Este correo ya tiene cuenta».
- Una reserva sin sesión con correo que tiene cuenta puede crear un niño nuevo bajo esa ficha, pero no cambia nombre, teléfono ni edades guardadas.
- Cuenta sembrada para pruebas: `ejemplo@correo.cl` / `acompana123`, con dos niños.

## Límites conocidos

- El mock vive en memoria: recargar la página borra cuentas nuevas y cierra la sesión. La cuenta sembrada se recrea.
- El hash de clave del mock (SHA-256 con sal) no es autenticación de producción; el backend real debe usar un algoritmo lento (argon2 o bcrypt), limitar intentos y enviar el correo de restablecimiento.
