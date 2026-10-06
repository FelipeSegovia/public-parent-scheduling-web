# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario de esta superficie es el apoderado de un niño de 3 a 13 años. Llega a reservar una sesión de apoyo con Loreto Castillo, educadora diferencial, elige un cupo libre y después confirma o cancela solo con los enlaces del correo. Puede reservar sin cuenta; si vuelve seguido, puede crear una cuenta opcional para no escribir de nuevo sus datos.

Loreto es la profesional real cuya agenda pública es este producto. No opera esta superficie: su panel (horario, fichas, series, bloqueos) vive aparte.

## Product Purpose

Permitir que un apoderado reserve una sola sesión, sin que la cuenta sea obligatoria, y que esa cita quede bloqueada, confirmada o cancelada con reglas claras. El éxito es una reserva hecha con los datos de esa familia, un cupo que ya no se ofrece a nadie más, y un correo que habla solo de esa cita.

## Positioning

Reserva privada de una sola sesión, sin cuenta obligatoria. El cupo se bloquea al reservar. Confirmar o cancelar ocurre solo por el correo. El apoderado ve fecha y hora de los cupos libres, nunca datos de otras familias.

## Operating Context

- Idioma de la interfaz: español. Zona horaria: `America/Santiago`.
- La sesión es presencial y dura 1 hora. La plantilla inicial, editable por la educadora en su panel, es lunes a viernes a las 19:00 y 20:00, y sábado a las 9:00, 10:00 y 11:00. Esta superficie solo muestra los cupos que siguen libres.
- El canal del apoderado es el correo: alta de la cita, confirmación, cancelación, reprogramación hecha por la educadora y liberación por falta de confirmación. En local, la pantalla de resultado simula los enlaces Confirmo y No puedo.
- El plazo inicial para confirmar es 24 horas antes de la cita. Si al reservar ese plazo ya venció (incluye el mismo día), la sesión nace confirmada.
- Rutas de esta superficie: `/` (elegir cupo y datos), `/reserva/:id` (resultado), `/sesion/:token/confirmar`, `/sesion/:token/cancelar` y `/cuenta/restablecer/:token` (clave nueva).

## Capabilities and Constraints

Esta superficie puede:

- Mostrar solo fecha y hora de cupos libres. Un cupo está libre si no tiene sesión `pendiente` o `confirmada`.
- Reservar una sesión con nombre del apoderado, email, teléfono, nombre del niño y edad de 3 a 13 inclusive. Fuera de ese rango, rechazar. Puede dejar una nota opcional sobre en qué quiere que la educadora ayude.
- Si el email ya existe, asociar la reserva a ese apoderado. Si el nombre del niño coincide (sin distinguir mayúsculas ni espacios de más), reutilizar el niño; si no, crear otro.
- Bloquear el cupo al reservar. Con plazo vigente, la sesión nace `pendiente` y el correo incluye Confirmo y No puedo. Con el plazo ya vencido, nace `confirmada`.
- Cancelar hasta la hora de la cita. No reprogramar: cancela y, si quiere, reserva otro cupo libre.
- Cuenta opcional con correo y clave, solo para completar el formulario. Se crea marcando «Crear cuenta con estos datos» al reservar; se inicia sesión desde un diálogo en el encabezado; la clave olvidada se recupera con un enlace al correo. Con sesión se completan nombre, correo, teléfono y niño; la nota de ayuda no. Una reserva sin sesión con un correo que tiene cuenta no modifica ese perfil.

No entra aquí, y no debe colarse en trabajo futuro de esta superficie:

- Cuenta obligatoria, panel de «mis citas», páginas propias de registro o login, o fichas editables fuera del formulario de reserva.
- Confirmar, cancelar o reprogramar desde la cuenta.
- Series semanales, plantilla de horario, bloqueo de cupos o reprogramación.
- WhatsApp automático, precio, pago (WebPay, transferencia, boleta) o duración distinta de 1 hora.
- Datos o estados de otras familias.
- Más de una profesional en la misma aplicación.
- El panel de la educadora.

## Brand Commitments

- Nombre: **Acompaña**.
- La voz ya presente en la interfaz es cercana y directa, en español, y insiste en que reservar no exige una cuenta. Ejemplo vigente: «Espacio de apoyo para tu familia» y «Puedes reservar sin cuenta».

## Evidence on Hand

- Requisitos canónicos: `../docs/mvp/REQUERIMIENTOS_FUNCIONALES.md` y `../docs/mvp/FUERA_DEL_MVP.md`.
- Contexto de esta superficie: `README.md` y `AGENTS.md`. Spec de la cuenta: `.specs/001-cuenta-apoderado/`.
- La interfaz identifica a Loreto Castillo (iniciales LC). No hay foto, testimonio, caso, precio ni nota de prensa. No inventar ninguno.

## Product Principles

- Una sesión suelta. Esta superficie nunca arma una serie.
- La cuenta es opcional y solo ahorra escribir. El correo sigue siendo el único control del apoderado sobre su cita.
- Privacidad entre familias. Lo único visible de la agenda ajena es que un horario está libre.
- Reservar bloquea. Confirmar o cancelar no mueve la cita a otro horario.
- El trabajo de la educadora se queda en su panel. Esta superficie no cobra, no escribe por WhatsApp y no edita el horario.
