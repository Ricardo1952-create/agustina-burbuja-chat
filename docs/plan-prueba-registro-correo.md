# Plan de validación — Agustina Web / registro y correo

## Alcance y seguridad
- Rama de prueba: `pruebas-migracion-modelo-2027`. No fusionar con main ni desplegar Production sin aprobación.
- Preview NO debe enviar información a Google Sheets ni generar correos.
- No ejecutar peticiones contra los Apps Script de producción durante esta fase.
- No incluir datos personales reales en pruebas.

## Evidencia de circuito real
- Hoja existente: `Agustina Web`, pestaña `Prospectos Agustina`.
- Encabezados: Fecha, Empresa, Nombre, E-mail, Whats App, CUIT, Requerimiento, Estado.
- Evidencia observada: fila 31 con fecha 11/11/2026 13:42:49; coincide en nombre, WhatsApp y requerimiento con email `Nuevo prospecto de Agustina Web` de ese mismo momento.
- Esto confirma una ejecución real anterior de registro + notificación; NO identifica todavía cuál de los tres Apps Script la generó.

## Tres flujos distintos detectados en producción
1. `app/api/agustina/route.ts` -> webhook fijo (POST JSON) para formulario principal.
2. `app/chat/chatui.tsx` -> otro Apps Script (POST JSON con mode no-cors) para formulario secundario.
3. `public/bubble.js` -> tercer Apps Script (GET con parámetros empresa/nombre/contacto/necesidad) para burbuja embebida.

## Pruebas ya realizadas
- Preview: formulario principal simulado y bloqueado, sin escritura real.
- Preview: burbuja embebida simula prospecto y bloquea llamada a Apps Script.
- Ninguna de esas pruebas demuestra que se envíe correo desde Google Apps Script.

## Prueba controlada pendiente (requiere identificar scripts)
1. Identificar en Google Apps Script el proyecto y la implementación asociada a cada una de las tres URL; inspeccionar `doGet`, `doPost`, `SpreadsheetApp`, `GmailApp`/`MailApp`, destinatarios y configuración.
2. Crear versiones de prueba de Apps Script vinculadas a una planilla de prueba NUEVA y correo de test autorizado; nunca reutilizar el destino de producción.
3. Configurar webhooks de prueba solo en Preview; conservar URL originales de producción y credenciales intactas.
4. Enviar UN prospecto ficticio con identificador `PRUEBA-AGUSTINA-WEB` por cada flujo (principal, secundario y burbuja).
5. Confirmar exactamente una fila por evento en hoja de prueba y exactamente un correo por evento en casilla de prueba, con campos completos.
6. Confirmar que ni planilla ni correo de producción recibieron pruebas; verificar errores, duplicados y manejo de fallas.
7. Eliminar o deshabilitar las configuraciones de prueba antes de promover; realizar revisión final sin alterar conexiones de producción.

## Criterio de salida
No declarar finalizada la migración de registro y correo hasta conocer las tres implementaciones y completar prueba aislada de extremo a extremo.
