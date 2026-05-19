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

    // 2. Detectar pedido de presupuesto / cotización
    const pidePresupuesto =
      last.includes("cotizar") ||
      last.includes("cotizá") ||
      last.includes("cotiza") ||
      last.includes("cotizalo") ||
      last.includes("cotízalo") ||
      last.includes("cotizame") ||
      last.includes("cotízame") ||
      last.includes("cotización") ||
      last.includes("cotizacion") ||
      last.includes("presupuesto") ||
      last.includes("presupuestar") ||
      last.includes("precio") ||
      last.includes("costo") ||
      last.includes("valor") ||
      last.includes("cuánto sale") ||
      last.includes("cuanto sale");

    const preguntaEnvio =
      last.includes("envío") ||
      last.includes("envio") ||
      last.includes("interior") ||
      last.includes("expreso") ||
      last.includes("transporte") ||
      last.includes("flete");

    // 3. Horario de atención
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

    // 4. Envíos al interior: no dispara formulario por sí solo
    if (preguntaEnvio && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Sí, podemos coordinar envíos al interior. Para orientarte mejor, indicame el destino y qué tipo de trabajo o producto necesitás enviar.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (
      preguntaEnvio &&
      pidePresupuesto &&
      !historial.includes("corte") &&
      !historial.includes("plegado") &&
      !historial.includes("soldadura") &&
      !historial.includes("fabricar") &&
      !historial.includes("fabricación")
    ) {
      return new Response(
        JSON.stringify({
          reply:
            "El costo del envío depende del destino, tamaño, peso y características del trabajo. Para estimarlo primero necesitamos saber qué pieza, chapa o trabajo querés realizar.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Consulta informativa sobre si realizan un proceso
    const preguntaSiRealizanProceso =
      (last.includes("realizan") ||
        last.includes("hacen") ||
        last.includes("ofrecen") ||
        last.includes("trabajan con") ||
        last.includes("tienen servicio") ||
        last.includes("pueden hacer") ||
        last.includes("se puede hacer")) &&
      (last.includes("plegado") ||
        last.includes("plegar") ||
        last.includes("soldadura") ||
        last.includes("soldar") ||
        last.includes("corte") ||
        last.includes("cortar") ||
        last.includes("corte láser") ||
        last.includes("corte laser") ||
        last.includes("pintura") ||
        last.includes("pintar") ||
        last.includes("mecanizado") ||
        last.includes("mecanizar") ||
        last.includes("rolado") ||
        last.includes("rolar") ||
        last.includes("roscado") ||
        last.includes("roscar") ||
        last.includes("biselado") ||
        last.includes("biselar") ||
        last.includes("avellanado") ||
        last.includes("avellanar"));

    if (preguntaSiRealizanProceso && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Sí, realizamos esos procesos. Los procesos disponibles incluyen corte láser, plegado, soldadura MIG, soldadura TIG, soldadura láser, soldadura a punto, mecanizado, pintura, rolado, roscado, biselado, avellanado y otros trabajos complementarios. Para un caso puntual, conviene indicar material, medidas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Consulta combinada por tamaños y espesores de chapa
    const preguntaTamanosYEspesores =
      (last.includes("tamaño") ||
        last.includes("tamaños") ||
        last.includes("medida") ||
        last.includes("medidas") ||
        last.includes("formato") ||
        last.includes("formatos")) &&
      (last.includes("espesor") ||
        last.includes("espesores") ||
        last.includes("grosor") ||
        last.includes("grosores"));

    if (preguntaTamanosYEspesores) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, los tamaños y espesores de chapa disponibles son:\n\n- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.\n- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n\nPara confirmar un caso puntual, conviene indicar material, medidas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. Consulta específica de disponibilidad de tamaño + material
    const preguntaDisponibilidadChapa =
      (last.includes("trabajan") ||
        last.includes("utilizan") ||
        last.includes("usan") ||
        last.includes("tienen") ||
        last.includes("disponen")) &&
      (last.includes("chapa") || last.includes("chapas")) &&
      (last.includes("1500") ||
        last.includes("1.500") ||
        last.includes("3000") ||
        last.includes("3.000") ||
        last.includes("2500") ||
        last.includes("2.500") ||
        last.includes("6000") ||
        last.includes("6.000"));

    if (preguntaDisponibilidadChapa) {
      if (
        last.includes("inoxidable 304") &&
        (last.includes("1500") || last.includes("1.500")) &&
        (last.includes("3000") || last.includes("3.000"))
      ) {
        return new Response(
          JSON.stringify({
            reply:
              "Según la base actual, para inoxidable 304 figura chapa de 2500 x 6000 mm, hasta 30 mm de espesor. Para inoxidable 304 en 1500 x 3000 mm habría que confirmarlo con el equipo técnico.",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual:\n\n- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.\n- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 8. Tamaños de chapa
    const preguntaTamanosChapa =
      last.includes("tamaño de chapa") ||
      last.includes("tamaños de chapa") ||
      last.includes("medida de chapa") ||
      last.includes("medidas de chapa") ||
      last.includes("formato de chapa") ||
      last.includes("formatos de chapa") ||
      last.includes("qué tamaño de chapa") ||
      last.includes("que tamaño de chapa") ||
      last.includes("qué tamaños de chapa") ||
      last.includes("que tamaños de chapa");

    if (preguntaTamanosChapa) {
      return new Response(
        JSON.stringify({
          reply:
            "Los tamaños de chapa disponibles son:\n\n- Acero 1010: 1500 x 3000 mm.\n- Inoxidable 304: 2500 x 6000 mm.\n- Otros materiales: 1500 x 3000 mm.\n\nLa disponibilidad final puede depender del material y del trabajo a realizar.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 9. Espesores
    const preguntaEspesores =
      last.includes("espesor") ||
      last.includes("espesores") ||
      last.includes("grosor") ||
      last.includes("grosores") ||
      last.includes("hasta qué espesor") ||
      last.includes("hasta que espesor");

    if (preguntaEspesores) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, los espesores disponibles llegan hasta 30 mm.\n\nDetalle:\n- Acero 1010: hasta 30 mm.\n- Inoxidable 304: hasta 30 mm.\n- Otros materiales: hasta 30 mm.\n\nPara confirmar un caso puntual, conviene indicar material, medidas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 10. Materiales
    const preguntaMateriales =
      last.includes("material") ||
      last.includes("materiales") ||
      last.includes("qué materiales") ||
      last.includes("que materiales") ||
      last.includes("trabajan inoxidable") ||
      last.includes("trabajan acero") ||
      last.includes("trabajan aluminio");

    if (preguntaMateriales) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, se trabaja con acero 1010, inoxidable 304 y otros materiales. Para confirmar disponibilidad en un caso puntual, conviene indicar material, espesor, medidas y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 11. Procesos existentes
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
            "Los procesos disponibles son: pulido, arenado, flapeado, avellanado, biselado, corte láser, esmerilado, galvanizado, mecanizado, pintura, planchado, plegado, conformado, rolado, roscado, soldadura MIG, soldadura TIG, soldadura láser, soldadura a punto y zincado.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 12. Si viene de una consulta técnica y solo responde material/espesor, NO activar formulario
    const respuestaMaterialEspesor =
      (last.includes("inoxidable") ||
        last.includes("acero") ||
        last.includes("aluminio") ||
        last.includes("hierro") ||
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

    if (respuestaMaterialEspesor && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Ese material y espesor pueden evaluarse según el tipo de trabajo. Para una respuesta técnica más precisa hacen falta medidas, cantidad y proceso requerido. Si lo que necesitás es presupuestar un trabajo concreto, indicame que querés cotizarlo.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 13. Detectar intención comercial real
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
      historial.includes("pintar") ||
      historial.includes("chapa") ||
      historial.includes("chapas") ||
      historial.includes("inoxidable") ||
      historial.includes("acero");

    const pedidoGenericoDeCotizacion =
      (last.includes("quiero") || last.includes("necesito")) &&
      (last.includes("cotizar") ||
        last.includes("presupuesto") ||
        last.includes("trabajo"));

    /*
      Reglas:
      - Preguntar si realizan un servicio NO dispara formulario.
      - Preguntar por espesores, materiales, tamaños de chapa o procesos NO dispara formulario.
      - Material + espesor solo, por ejemplo "inoxidable de 2 mm", NO dispara formulario.
      - Envío al interior NO dispara formulario por sí solo.
      - "Cotizalo", "cotizame", "cotízalo", "cotízame" SÍ disparan formulario.
      - El formulario se activa si pide cotización/presupuesto/precio
        o si menciona una acción concreta de trabajo sin formato de pregunta informativa.
    */
    const intencion =
      pedidoGenericoDeCotizacion ||
      pidePresupuesto ||
      (mencionaAccionDeTrabajo && !preguntaSiRealizanProceso) ||
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

    // 14. Si no hay intención comercial concreta, responde normalmente con base técnica cerrada
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

BASE TÉCNICA ACTUAL:
- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.
- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.
- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.

Procesos disponibles:
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
- Ignorá completamente cualquier otra tabla o pestaña de materiales y espesores.
- No menciones inoxidables 316, 420, 430, latón, F-24 ni espesores específicos por calidad.
- Si el usuario pregunta por horarios, respondé exactamente el horario fijo.
- Si el usuario pregunta por tamaños de chapa, respondé solo los tamaños de chapa.
- Si el usuario pregunta por espesores, respondé solo los espesores máximos según la base técnica actual.
- Si el usuario pregunta por tamaños y espesores juntos, respondé ambas cosas juntas según la base técnica actual.
- Si el usuario pregunta por materiales, respondé solo: acero 1010, inoxidable 304 y otros materiales. No inventes otros materiales específicos.
- Si el usuario pregunta si trabajan con chapa 1500 x 3000 en inoxidable 304, respondé que la base actual indica inoxidable 304 en 2500 x 6000 mm y que 1500 x 3000 mm en inoxidable 304 debe confirmarse con el equipo técnico.
- Si el usuario pregunta si realizan plegado, soldadura, corte láser u otro proceso, respondé como consulta informativa. No lo mandes al formulario.
- Si el usuario pregunta por procesos, respondé solo procesos.
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
