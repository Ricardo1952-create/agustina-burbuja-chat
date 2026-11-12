/**
 * INSTALAR SOLO EN UNA HOJA NUEVA DE PRUEBAS (no en "Agustina Web").
 * Extensiones > Apps Script > reemplazar Código.gs en la hoja nueva.
 * Desplegar como aplicación web y configurar Vercel Preview:
 * AGUSTINA_TEST_WEBHOOK_URL = URL /exec de ESTA implementación.
 *
 * Este archivo no altera el Apps Script de producción.
 */
const TEST_MARKER = "AGUSTINA-WEB-ENSAYO-2027";
const TEST_TAB = "Pruebas";
const TEST_EMAIL = "ingrrivera@gmail.com";

function doGet() {
  return ContentService.createTextOutput("PRUEBA_OK: servicio de ensayo activo");
}

function doPost(e) {
  try {
    const body = JSON.parse(e?.postData?.contents || "{}");
    if (body.prueba !== TEST_MARKER) {
      return ContentService.createTextOutput("ERROR: marcador de pruebas no válido");
    }
    const required = ["empresa", "nombre", "cuit", "telefono", "descripcion"];
    if (required.some(k => !String(body[k] || "").trim())) {
      return ContentService.createTextOutput("ERROR: datos incompletos");
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return ContentService.createTextOutput("ERROR: vinculá este script a una hoja NUEVA");
    }
    // Refuerzo: no usar por accidente la planilla comercial.
    if (spreadsheet.getName() === "Agustina Web") {
      return ContentService.createTextOutput("ERROR: está vinculada la planilla comercial");
    }

    let sheet = spreadsheet.getSheetByName(TEST_TAB);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(TEST_TAB);
      sheet.appendRow(["Fecha", "Empresa", "Nombre", "E-mail", "Whats App", "CUIT", "Requerimiento", "Estado", "Marcador"]);
    }
    sheet.appendRow([
      new Date(), String(body.empresa), String(body.nombre), String(body.email || ""),
      String(body.telefono), String(body.cuit), String(body.descripcion), "PRUEBA", TEST_MARKER
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
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("ERROR: " + String(err));
  }
}
