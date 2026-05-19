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

    // 2. Respuestas directas para datos generales conocidos
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

    // 3. Detectar servicio/trabajo concreto de Lasertec
    const mencionaServicioConcreto =
      last.includes("corte") ||
      last.includes("cortar") ||
      last.includes("corte láser") ||
      last.includes("corte laser") ||
      last.includes("chapa") ||
      last.includes("chapas") ||
      last.includes("plegado") ||
      last.includes("plegar") ||
      last.includes("soldadura") ||
      last.includes("soldar") ||
      last.includes("pintura") ||
      last.includes("pieza") ||
      last.includes("piezas") ||
      last.includes("acero") ||
      last.includes("inoxidable") ||
      last.includes("hierro") ||
      last.includes("aluminio") ||
      last.includes("metal") ||
      last.includes("metalúrgico") ||
      last.includes("metalurgico") ||
      last.includes("fabricación") ||
      last.includes("fabricacion") ||
      last.includes("fabricar");

    // 4. Detectar pedido explícito de presupuesto
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

    // 5. Detectar si en el historial ya se habló de un servicio concreto
    const historialTieneServicioConcreto =
      historial.includes("corte") ||
      historial.includes("cortar") ||
      historial.includes("chapa") ||
      historial.includes("chapas") ||
      historial.includes("plegado") ||
      historial.includes("plegar") ||
      historial.includes("soldadura") ||
      historial.includes("soldar") ||
      historial.includes("pieza") ||
      historial.includes("piezas") ||
      historial.includes("acero") ||
      historial.includes("inoxidable") ||
      historial.includes("hierro") ||
      historial.includes("aluminio") ||
      historial.includes("metal") ||
      historial.includes("fabricación") ||
      historial.includes("fabricacion") ||
      historial.includes("fabricar");

    // 6. Caso genérico aceptado: "quiero cotizar un trabajo"
    const pedidoGenericoDeCotizacion =
      (last.includes("quiero") || last.includes("necesito")) &&
      (last.includes("cotizar") ||
        last.includes("presupuesto") ||
        last.includes("trabajo"));

    /*
      Regla:
      - Envío al interior NO dispara formulario por sí solo.
      - Mendoza / Córdoba / expreso / transporte NO disparan formulario por sí solos.
      - El formulario se activa cuando aparece un trabajo concreto
        o cuando pide presupuesto y ya hay un servicio concreto en la conversación.
    */
    const intencion =
      mencionaServicioConcreto ||
      pedidoGenericoDeCotizacion ||
      (pidePresupuesto && historialTieneServicioConcreto);

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

    // 7. Si no hay intención comercial concreta, responde normalmente
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

Datos fijos de la empresa:
- El horario de atención es de 8:00 a 12:00 y de 13:00 a 17:00.
- Si te preguntan por horarios, respondé exactamente ese horario. No digas 8 a 18.

Reglas importantes:
- Si el usuario pregunta si realizan envíos al interior, respondé que sí pueden coordinar envíos al interior y preguntá destino y tipo de trabajo.
- Si el usuario indica solo un destino, como Mendoza capital, respondé que pueden evaluar o coordinar el envío y preguntá qué tipo de trabajo o producto necesita cotizar.
- Si el usuario pregunta el costo del envío sin haber definido el trabajo, explicá que depende del tamaño, peso, destino y características del trabajo. No inventes precios.
- Si el usuario menciona un trabajo concreto como corte de chapas, corte láser, plegado, soldadura, fabricación de piezas, acero, inoxidable, hierro, aluminio o pintura, el sistema activará el formulario.
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
