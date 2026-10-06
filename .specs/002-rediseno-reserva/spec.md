# 002 — Rediseño visual de la página de reserva

Estado: aprobado con cambios (2026-10-06): solo cambios visuales; se mantiene el flujo actual del formulario y del selector de horario. Las sesiones son presenciales.

Referencia visual: lienzo «Acompaña — ideas de diseño» (https://claude.ai/artifact/6DzfVmB6BmHKyAgWT7vRdw), artboard «Escritorio · reserva en una sola vista». Del lienzo se toma el estilo, no el flujo: los artboards móviles en dos pasos y la grilla semanal de un clic no se implementan.

## Objetivo

Que la página `/` se vea más clara y cercana: quién atiende, cómo funciona la reserva, qué horarios quedan libres y qué falta para reservar. El comportamiento queda exactamente como hoy.

## Qué debe hacer

1. **Tarjeta de la educadora.** Más grande: iniciales LC, «Loreto Castillo», «Educadora diferencial» y una lista con iconos: «Sesiones presenciales de 1 hora», «Niños y niñas de 3 a 13 años» y «Horarios en hora de Chile». Se quita el punto verde «Disponible».
2. **Cómo funciona.** Bajo el título, tres pasos en tarjetas suaves: «Elige un horario libre», «Deja tus datos» (sin cuenta) y «Confirma desde tu correo» (enlaces Confirmo y No puedo). Solo informativo.
3. **Días de la semana.** Los mismos botones de día y las mismas flechas de semana, con dos cambios visuales: cada día muestra debajo cuántos cupos libres quedan («2 libres», «1 libre», «Sin cupos», «Ya pasó»). En pantallas angostas los seis días ocupan una fila sin desplazamiento horizontal y el texto se reemplaza por un punto cuando quedan cupos (la cantidad sigue en la etiqueta accesible).
4. **Horas.** Los mismos botones de hora, más anchos y con el rango («19:00 – 20:00»). Elegido: relleno primario. Libre: fondo claro con borde. No disponible: borde punteado y tachado. Leyenda debajo (Libre, Tu elección, No disponible).
5. **Resumen del horario.** El recuadro «Tu sesión» del paso 2 pasa a una franja de color primario con «Cambiar». El aviso sin horario («Selecciona un horario en el paso 1 para continuar.») se mantiene, con borde punteado e icono de calendario.
6. **Formulario agrupado.** Mismos campos, textos, validaciones y orden lógico. Cambios visuales: sin iconos dentro de los campos; correo y teléfono en una fila cuando cabe (el aviso «Este correo ya tiene cuenta» queda debajo de esa fila); los datos del niño (selector de niños, nombre, edad y nota de ayuda) dentro de un grupo «Sobre tu hijo o hija»; el opt-in «Crear cuenta con estos datos» en una caja de fondo suave. El formulario sigue deshabilitado hasta elegir horario y el botón sigue diciendo «Reservar sesión».
7. **Pie de página.** «Tus datos solo los ve Loreto. Nunca mostramos información de otras familias.».
8. **Accesibilidad.** Botones de día y hora con `aria-pressed` y etiqueta con día, hora y disponibilidad. Áreas táctiles de al menos 44 px. Foco visible con el color de marca. Contraste AA.

## Fuera de alcance

- Cualquier cambio de comportamiento: elegir día y luego hora, formulario deshabilitado sin horario, validaciones, mensajes de error, cuenta, aviso de correo con cuenta, cupo tomado por otra familia.
- Grilla semanal de un clic, flujo móvil en dos pasos y barra fija inferior del lienzo.
- Cambios de texto en el opt-in, en el botón de reservar o en los mensajes del formulario.
- Páginas de resultado, enlaces de confirmar/cancelar, restablecer clave y diálogo de inicio de sesión.
- Rutas, API, mock o reglas de negocio.
- Paleta, tipografías o marca nuevas: se usan los tokens de `src/index.css`.

## Criterios de aceptación

- Reservar sin cuenta, con cuenta nueva, con sesión iniciada (uno y varios niños) y con cupo tomado por otra familia funciona igual que antes.
- Cada día muestra su cantidad de cupos libres y coincide con las horas que aparecen al elegirlo.
- Las horas ocupadas y los días pasados se distinguen sin depender del color.
- A 390 px no hay desborde horizontal y los seis días caben en una fila.
- `pnpm build` y `pnpm lint` pasan.
