# 001 — Cuenta opcional del apoderado

Estado: aprobado (plan «Cuenta opcional y pulido de la reserva», 2026-09-28).

## Objetivo

Que un apoderado que vuelve a reservar no tenga que escribir de nuevo sus datos ni los de su hijo. La cuenta es opcional y sirve solo para completar el formulario de reserva.

## Qué debe hacer

1. **Reservar sin cuenta** sigue igual que hoy.
2. **Registro desde el formulario.** Debajo de los datos, un checkbox «Crear cuenta con estos datos». Al marcarlo aparecen solo «Clave» y «Repite la clave». Un solo envío crea la cuenta, inicia sesión y reserva.
3. **Inicio de sesión** en un diálogo desde el encabezado (correo y clave). No sale de la página ni pierde el horario elegido.
4. **Autocompletado.** Con sesión, se completan nombre, correo (fijo), teléfono y niño. La nota de ayuda no se completa.
5. **Varios niños.** Si hay uno, se completa solo. Si hay más, el apoderado elige uno o escribe otro nombre (se crea como hoy).
6. **Correo con cuenta, sin sesión.** Una reserva anónima con ese correo se acepta, pero no modifica el perfil guardado. El formulario avisa que ese correo tiene cuenta y ofrece iniciar sesión.
7. **Registro con correo ya usado en reservas previas** asocia la cuenta a la ficha existente y a sus niños.
8. **Registro con correo que ya tiene clave** se rechaza con el mensaje «Ese correo ya tiene cuenta. Inicia sesión.».
9. **Clave olvidada.** Desde el diálogo, pedir un enlace al correo. El enlace abre `/cuenta/restablecer/:token`, donde se elige una clave nueva y se inicia sesión. En local el enlace se muestra en pantalla (simula el correo).
10. **Salir** cierra la sesión del navegador.

Clave: mínimo 8 caracteres, repetida una vez.

## Fuera de alcance

- Panel de «mis citas», historial o fichas editables fuera del formulario.
- Confirmar, cancelar o reprogramar desde la cuenta: sigue siendo solo por el enlace del correo.
- Obligar a tener cuenta para ver cupos o reservar.
- Páginas separadas de registro o de inicio de sesión.
- Login social, verificación de correo, cambio de correo o borrado de cuenta.
- Cambios de paleta, tipografía o marca.

## Criterios de aceptación

- Una reserva sin cuenta funciona igual que antes.
- Marcar «Crear cuenta», completar clave y reservar deja la sesión iniciada y el encabezado muestra el nombre.
- Tras salir y volver a iniciar sesión, el formulario aparece completo salvo la nota de ayuda.
- Con dos niños guardados, se puede elegir cualquiera o escribir un tercero.
- Una reserva anónima con un correo que tiene cuenta no cambia el nombre ni el teléfono guardados.
- «Olvidé mi clave» genera un enlace; con él se define una clave nueva y la anterior deja de funcionar.
- Errores claros: clave corta, claves distintas, credenciales incorrectas, enlace de restablecer inválido o vencido.
