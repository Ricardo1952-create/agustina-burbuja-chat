import OpenAI from "openai";

const WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzP9DkhB-y7yfA6zUXomXyKckQBHShSPjj4ommedwR-7Twf8RZgKNS8kfT-JRj2_kzP7A/exec";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastMessage = messages[messages.length - 1]?.content || "";
    const last = lastMessage.toLowerCase();

    const historial = messages
      .map((m: any) => m.content || "")
      .join(" ")
      .toLowerCase();

    // 1. PRIMERO revisar si lo que llegó es el formulario completo
    try {
      const posibleJSON = JSON.parse(lastMessage);

      if (
        posibleJSON.nombre &&
        posibleJSON.telefono &&
        posibleJSON.detalle
      ) {
        const respuestaWebhook = await fetch(WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: posibleJSON.nombre || "",
            telefono: posibleJSON.telefono || "",
            email: "",
            empresa: "",
            descripcion: posibleJSON.detalle || "",
          }),
        });

        if (!respuestaWebhook.ok) {
          return new Response(
            JSON.stringify({
              reply:
                "Recibí tus datos, pero hubo un problema al guardarlos en la planilla. Por favor, avisá al equipo para revisarlo.",
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            reply:
              "Perfecto 👍 Ya registramos tu solicitud. Un asesor se va a comunicar con vos a la brevedad.",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      // No era JSON, seguimos normalmente
    }

    // 2. Horario de atención
    const preguntaHorario =
      last.includes("horario") ||
      last.includes("horarios") ||
      last.includes("hora atienden") ||
      last.includes("a qué hora") ||
      last.includes("a que hora") ||
      last.includes("cuando atienden") ||
      last.includes("cuándo atienden");

    if (preguntaHorario) {
      return new Response(
        JSON.stringify({
          reply:
            "Nuestro horario de atención es de 8:00 a 12:00 y de 13:00 a 17:00.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Consulta directa sobre espesores / materiales
    const preguntaEspesoresOMateriales =
      last.includes("espesor") ||
      last.includes("espesores") ||
      last.includes("grosor") ||
      last.includes("grosores") ||
      last.includes("material") ||
      last.includes("materiales") ||
      last.includes("qué chapas") ||
      last.includes("que chapas") ||
      last.includes("tamaño de chapa") ||
      last.includes("tamaños de chapa") ||
      last.includes("medida de chapa") ||
      last.includes("medidas de chapa");

    if (preguntaEspesoresOMateriales) {
      return new Response(
        JSON.stringify({
          reply:
            "Trabajamos chapas de 1500 x 3000 mm y 2500 x 6000 mm, según el material. En la base actual figuran espesores de hasta 30 mm.\n\nMateriales disponibles: acero 1010, acero 1045, inoxidable 304, 316, 420 y 430, galvanizado, aluminio, latón y F-24.\n\nLos espesores específicos dependen del material. Por ejemplo, en inoxidable hay espesores desde 0,5 mm hasta 19 mm según calidad; en acero 1010 hasta 12,7 mm; en aluminio hasta 10 mm; y en F-24 hasta 12,7 mm.\n\nSi querés cotizar un trabajo concreto, indicame el material, espesor, medidas y cantidad.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Consulta directa sobre procesos
    const preguntaProcesos =
      last.includes("procesos") ||
      last.includes("servicios") ||
      last.includes("qué hacen") ||
      last.includes("que hacen") ||
      last.includes("qué trabajos hacen") ||
      last.includes("que trabajos hacen") ||
      last.includes("capacidades");

    if (preguntaProcesos) {
      return new Response(
        JSON.stringify({
          reply:
            "Los procesos disponibles son: corte láser, plegado, soldadura MIG, soldadura TIG, soldadura láser, soldadura a punto, pulido, arenado, flapeado, avellanado, biselado, esmerilado, galvanizado, mecanizado, pintura, planchado, conformado, rolado, roscado y zincado.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Si viene de una consulta técnica y solo responde material/espesor, NO activar formulario
    const respuestaMaterialEspesor =
      (last.includes("inoxidable") ||
        last.includes("acero") ||
        last.includes("aluminio") ||
        last.includes("hierro") ||
        last.includes("galvanizado") ||
        last.includes("latón") ||
        last.includes("laton") ||
        last.includes("chapa") ||
        last.includes("chapas") ||
        last.includes("mm") ||
        last.includes("milimetro") ||
        last.includes("milímetro") ||
        last.includes("milimetros") ||
        last.includes("milímetros")) &&
      (historial.includes("espesor") ||
        historial.includes("espesores") ||
        historial.includes("grosor") ||
        historial.includes("grosores") ||
        historial.includes("material") ||
        historial.includes("materiales"));

    const pidePresupuesto =
      last.includes("cotizar") ||
      last.includes("cotización") ||
      last.includes("cotizacion") ||
      last.includes("presupuesto") ||
      last.includes("precio") ||
      last.includes("costo") ||
      last.includes("valor") ||
      last.includes("cuánto sale") ||
      last.includes("cuanto sale");

    if (respuestaMaterialEspesor && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Ese material y espesor pueden evaluarse según el tipo de trabajo. Para una respuesta técnica más precisa hacen falta medidas, cantidad y proceso requerido. Si lo que necesitás es presupuestar un trabajo concreto, indicame que querés cotizarlo.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Detectar intención comercial real
    const mencionaAccionDeTrabajo =
      last.includes("corte") ||
      last.includes("cortar") ||
      last.includes("corte láser") ||
      last.includes("corte laser") ||
      last.includes("plegado") ||
      last.includes("plegar") ||
      last.includes("soldadura") ||
      last.includes("soldar") ||
      last.includes("pintura") ||
      last.includes("pintar") ||
      last.includes("fabricación") ||
      last.includes("fabricacion") ||
      last.includes("fabricar") ||
      last.includes("mecanizado") ||
      last.includes("mecanizar") ||
      last.includes("rolado") ||
      last.includes("rolar") ||
      last.includes("roscado") ||
      last.includes("roscar") ||
      last.includes("biselado") ||
      last.includes("biselar") ||
      last.includes("avellanado") ||
      last.includes("avellanar");

    const mencionaObjetoDeTrabajo =
      last.includes("chapa") ||
      last.includes("chapas") ||
      last.includes("pieza") ||
      last.includes("piezas") ||
      last.includes("estructura") ||
      last.includes("soporte") ||
      last.includes("soportes") ||
      last.includes("placa") ||
      last.includes("placas");

    const mencionaMaterial =
      last.includes("acero") ||
      last.includes("inoxidable") ||
      last.includes("hierro") ||
      last.includes("aluminio") ||
      last.includes("galvanizado") ||
      last.includes("latón") ||
      last.includes("laton") ||
      last.includes("f-24") ||
      last.includes("metal") ||
      last.includes("metalúrgico") ||
      last.includes("metalurgico");

    const historialTieneServicioConcreto =
      historial.includes("corte") ||
      historial.includes("cortar") ||
      historial.includes("plegado") ||
      historial.includes("plegar") ||
      historial.includes("soldadura") ||
      historial.includes("soldar") ||
      historial.includes("fabricación") ||
      historial.includes("fabricacion") ||
      historial.includes("fabricar") ||
      historial.includes("mecanizado") ||
      historial.includes("mecanizar") ||
      historial.includes("pintura") ||
      historial.includes("pintar");

    const pedidoGenericoDeCotizacion =
      (last.includes("quiero") || last.includes("necesito")) &&
      (last.includes("cotizar") ||
        last.includes("presupuesto") ||
        last.includes("trabajo"));

    /*
      Reglas:
      - Preguntar por espesores, materiales o procesos NO dispara formulario.
      - Material + espesor solo, por ejemplo "inoxidable de 2 mm", NO dispara formulario.
      - Envío al interior NO dispara formulario por sí solo.
      - El formulario se activa si pide cotización/presupuesto/precio
        o si menciona una acción concreta de trabajo: cortar, plegar, soldar, fabricar, etc.
    */
    const intencion =
      pedidoGenericoDeCotizacion ||
      pidePresupuesto ||
      mencionaAccionDeTrabajo ||
      (mencionaObjetoDeTrabajo && historialTieneServicioConcreto) ||
      (pidePresupuesto && (mencionaMaterial || mencionaObjetoDeTrabajo));

    if (intencion) {
      return new Response(
        JSON.stringify({
          showForm: true,
          reply:
            "[FORMULARIO]\nPerfecto 👍 Para poder presupuestar el trabajo y, si corresponde, coordinar el envío, completá el siguiente formulario. Un especialista va a revisar tu caso y se va a comunicar con vos.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. Si no hay intención comercial concreta, responde normalmente con base técnica cerrada
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sos Agustina, asistente comercial de Lasertec Ingeniería.

Respondés consultas simples de forma clara y breve.

DATOS FIJOS DE LA EMPRESA:
- Horario de atención: de 8:00 a 12:00 y de 13:00 a 17:00.
- No digas que el horario es de 8 a 18.

CHAPAS, MATERIALES Y ESPESORES:
- Tamaños de chapa disponibles:
  - Acero 1010: 1500 x 3000 mm, hasta 30 mm.
  - Inoxidable 304: 2500 x 6000 mm, hasta 30 mm.
  - Otros materiales: 1500 x 3000 mm, hasta 30 mm.

Materiales y espesores registrados:
- Inoxidable 304: 0,5 / 0,7 / 0,8 / 1 / 1,2 / 1,5 / 2 / 2,5 / 3 / 4 / 5 / 6 / 8 / 10 / 12,7 / 19 mm, según terminación B, E o LC.
- Inoxidable 316: 1 / 1,25 / 1,5 / 2 / 2,5 / 3 / 4 / 5 / 6 / 8 mm.
- Inoxidable 420: 1,5 / 2,5 / 3 / 4 / 5 mm.
- Inoxidable 430: 0,5 / 1 / 1,2 / 1,5 / 2 mm, según terminación B o E.
- Acero 1010: 0,5 / 0,6 / 0,7 / 0,9 / 1,25 / 1,65 / 2 / 2,1 / 2,5 / 3 / 3,17 / 4 / 4,76 / 6,35 / 7,92 / 9,52 / 12,7 mm.
- Acero 1045: 3,17 / 4 / 4,76 / 6,35 / 7,92 / 9,52 / 12,7 mm.
- Galvanizado: 0,5 / 0,7 / 0,9 / 1,2 / 1,6 / 2 / 3 / 3,2 mm.
- Aluminio 45: 0,5 / 0,8 / 1 / 1,5 / 2 / 2,5 / 3 mm.
- Aluminio 52: 3 / 4 / 5 / 6 / 6,4 / 8 / 10 mm.
- Latón: 0,1 / 0,2 / 0,3 / 0,5 / 1 / 1,25 / 1,5 / 2 / 2,5 / 3 / 4 mm.
- F-24: 3,17 / 6,35 / 7,92 / 9,52 / 12,7 mm.

PROCESOS DISPONIBLES:
- Pulido.
- Arenado.
- Flapeado.
- Avellanado.
- Biselado.
- Corte láser.
- Esmerilado.
- Galvanizado.
- Mecanizado.
- Pintura.
- Planchado.
- Plegado.
- Conformado.
- Rolado.
- Roscado.
- Soldadura MIG.
- Soldadura TIG.
- Soldadura láser.
- Soldadura a punto.
- Zincado.

REGLAS IMPORTANTES:
- Si el usuario pregunta por horarios, respondé exactamente el horario fijo.
- Si el usuario pregunta por espesores, materiales, tamaños de chapa o procesos, respondé con la base técnica anterior. No inventes datos.
- Si el dato no está en la base técnica anterior, decí que hay que confirmarlo con el equipo técnico.
- Si el usuario pregunta si realizan envíos al interior, respondé que sí pueden coordinar envíos al interior y preguntá destino y tipo de trabajo.
- Si el usuario indica solo un destino, como Mendoza capital, respondé que pueden evaluar o coordinar el envío y preguntá qué tipo de trabajo o producto necesita cotizar.
- Si el usuario pregunta el costo del envío sin haber definido el trabajo, explicá que depende del tamaño, peso, destino y características del trabajo. No inventes precios.
- Si el usuario solo dice un material y espesor, como "inoxidable de 2 mm", no lo trates automáticamente como cotización. Respondé técnicamente y preguntá si quiere cotizar un trabajo concreto.
- No pidas datos personales dentro del chat.
- No menciones formularios por tu cuenta.
- No inventes precios.
- Respondé en español, breve y claro.
`,
        },
        ...messages,
      ],
    });

    return new Response(
      JSON.stringify({
        reply: completion.choices[0].message.content,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        reply: "Error en el servidor",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
