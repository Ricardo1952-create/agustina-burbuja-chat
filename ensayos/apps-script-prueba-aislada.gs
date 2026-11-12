/**
 * INSTALAR SOLO EN UNA HOJA NUEVA DE PRUEBAS (no en "Agustina Web").
 * Extensiones > Apps Script > reemplazar Código.gs en la hoja nueva.
 * Desplegar como aplicación web y configurar Vercel Preview:
 * AGUSTINA_TEST_WEBHOOK_URL = URL /exec de ESTA implementación.
 * AGUSTINA_TEST_SHARED_SECRET = clave privada de 32+ caracteres, idéntica
 * al valor en Propiedades de secuencia de comandos.
 * No guardar la clave en GitHub.
 *
 * Este archivo no altera el Apps Script de producción.
 */
const TEST_MARKER = "AGUSTINA-WEB-ENSAYO-2027";
const TEST_TAB = "Pruebas";
const TEST_SPREADSHEET_ID = "1TAbSYEnXL-MZsmjspK4j3jB0JtzWAohHiI43M-QY_Xo";
const TEST_EMAIL = "ingrrivera@gmail.com";

function doGet() {
  return ContentService.createTextOutput("Servicio de pruebas");
}

function doPost(e) {
  try {
    const body = JSON.parse(e?.postData?.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("AGUSTINA_TEST_SHARED_SECRET");
    if (!expectedSecret || expectedSecret.length < 32 ||
        typeof body.secret !== "string" || body.secret !== expectedSecret) {
      return ContentService.createTextOutput("ERROR: acceso denegado");
    }
    if (body.prueba !== TEST_MARKER) {
      return ContentService.createTextOutput("ERROR: marcador de pruebas no válido");
    }
    const required = ["empresa", "nombre", "cuit", "telefono", "descripcion"];
    if (required.some(k => !String(body[k] || "").trim())) {
      return ContentService.createTextOutput("ERROR: datos incompletos");
    }

    const spreadsheet = SpreadsheetApp.openById(TEST_SPREADSHEET_ID);
    if (spreadsheet.getId() !== TEST_SPREADSHEET_ID ||
        spreadsheet.getName() !== "AGUSTINA WEB - ENSAYO AISLADO 2027 (NO PRODUCCIÓN)") {
      return ContentService.createTextOutput("ERROR: destino no permitido");
    }

    const requestId = String(body.requestId || "");
    if (!/^[a-f0-9-]{36}$/.test(requestId)) {
      return ContentService.createTextOutput("ERROR: identificador inválido");
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) {
      return ContentService.createTextOutput("ERROR: reintentar");
    }
    try {
    let sheet = spreadsheet.getSheetByName(TEST_TAB);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(TEST_TAB);
      sheet.appendRow(["Fecha", "Empresa", "Nombre", "E-mail", "Whats App", "CUIT", "Requerimiento", "Estado", "Marcador", "Id solicitud"]);
    }
    const previous = sheet.getLastRow() > 1
      ? sheet.getRange(2, 10, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    if (previous.includes(requestId)) {
      return ContentService.createTextOutput("PRUEBA_OK: solicitud de ensayo ya registrada");
    }
    sheet.appendRow([
      new Date(), String(body.empresa), String(body.nombre), String(body.email || ""),
      String(body.telefono), String(body.cuit), String(body.descripcion), "PRUEBA", TEST_MARKER, requestId
    ]);

    MailApp.sendEmail({
      to: TEST_EMAIL,
      subject: "[PRUEBA] Nuevo prospecto de Agustina Web",
      body: [
        "PRUEBA AISLADA: este no es un prospecto real.",
        "Empresa: " + body.empresa,
        "Nombre: " + body.nombre,
        "WhatsApp: " + body.telefono,
        "CUIT: " + body.cuit,
        "Requerimiento: " + body.descripcion,
        "Marcador: " + TEST_MARKER,
      ].join("\n"),
    });

    return ContentService.createTextOutput("PRUEBA_OK: registro y correo procesados");
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("ERROR: " + String(err));
  }
}
