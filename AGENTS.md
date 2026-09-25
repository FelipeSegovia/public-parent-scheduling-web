# AGENTS.md

Contexto para agentes que trabajan en la **superficie pública** del MVP: reserva y gestión de citas del apoderado.

Fuente canónica: [docs/mvp/REQUERIMIENTOS_FUNCIONALES.md](../docs/mvp/REQUERIMIENTOS_FUNCIONALES.md) y [docs/mvp/FUERA_DEL_MVP.md](../docs/mvp/FUERA_DEL_MVP.md). Si hay conflicto, prevalecen esos documentos. El contexto de la educadora está en [AGENTS_PRIVATE.md](AGENTS_PRIVATE.md).

## Quién es el usuario

- Apoderado de un niño entre 3 y 13 años.
- Sin cuenta. No hay login, registro ni panel de “mis citas”.
- Zona horaria: `America/Santiago`.

## Qué puede hacer esta superficie

1. Ver solo fecha y hora de cupos libres. Un cupo está libre si no tiene sesión `pendiente` o `confirmada`. No mostrar nombres de niños ni apoderados ajenos.
2. Reservar **una sola sesión** (nunca una serie) con: nombre del apoderado, email, teléfono, nombre del niño y edad de 3 a 13 inclusive. Fuera de ese rango, rechazar.
3. Si el email ya existe, asociar la reserva a ese apoderado. Si el nombre del niño coincide (sin distinguir mayúsculas ni espacios de más), reutilizar el niño; si no, crear otro.
4. Al reservar, bloquear el cupo. Si el plazo de confirmación ya venció (incluye cita del mismo día), la sesión nace `confirmada`. Si no, nace `pendiente` y el correo incluye enlaces Confirmo y No puedo.
5. Confirmar o cancelar solo con los enlaces del correo. Puede cancelar hasta la hora de la cita. No puede reprogramar: cancela y, si quiere, reserva otro cupo libre.

## Correos al apoderado

Cada correo habla solo de la cita de esa familia:

- Alta de la cita (pendiente con enlaces, o ya confirmada).
- Confirmación, cancelación, reprogramación hecha por la educadora y liberación por falta de confirmación.

## Qué no implementar aquí

No agregar en esta superficie:

- Login, cuenta de apoderado o fichas editables por el apoderado.
- Series semanales, plantilla de horario, bloqueo de cupos o reprogramación.
- WhatsApp automático, precio, pago (WebPay/transferencia/boleta) o duración distinta de 1 hora.
- Datos o estados de otras familias.

## Herramientas instaladas
- Shadcn para la reutilización de componentes.
- tailwindcss - estilos
- react router - para definir rutas
- msw - data mock local
- react-schedule-meeting - ui para visualizar calendario y agendamiento

## Metodología: Spec-Driven Development (SDD)

Este proyecto sigue SDD para features que tocan más de un archivo o capa
(DB, API, UI). Los bugfixes simples y cambios triviales de una línea
no requieren este flujo.

### Ubicación de los documentos

Cada feature vive en `.specs/<numero>-<nombre-corto>/` con:

- `spec.md` — qué debe hacer, qué queda fuera de alcance, criterios de aceptación
- `plan.md` — diseño técnico: archivos a tocar, contratos, algoritmo
- `tasks.md` — lista numerada y ordenada de tareas ejecutables
- `status.md` — estado actual y qué sigue (para retomar entre sesiones)

Plantilla base: `specs/_templates/` .

### Reglas de flujo (IMPORTANTE)

1. **Nunca escribas código de una feature nueva sin spec.md aprobado.**
   Si no existe, propón uno primero y espera confirmación antes de seguir.
2. **No pases de spec a plan, ni de plan a tasks, sin que yo lo apruebe.**
   Genera el documento y detente — no continúes automáticamente a la siguiente fase.
3. **Sigue tasks.md en orden.** No te adelantes a tareas futuras ni reordenes
   sin avisar primero.
4. **Actualiza status.md** después de cada tarea completada: qué se hizo,
   qué sigue, y cualquier decisión o desvío del plan original.
5. **Si el plan resulta inviable durante la implementación**, detente y
   avísame en vez de improvisar una solución distinta silenciosamente.

### Convención de numeración

Las specs se numeran secuencialmente y de forma independiente a
las de la raíz: `001-`, `002-`, etc. Antes de crear una nueva, revisa
`.specs/` para usar el siguiente número disponible.

## Comandos de desarrollo


`pnpm dev` ejecución local.

When starting the dev server, use background mode with msw:

```
astro dev --background
```