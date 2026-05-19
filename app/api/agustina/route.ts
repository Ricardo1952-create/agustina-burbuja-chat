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

    // 2. Detectar intención comercial real
    const palabrasDeCotizacion =
      last.includes("cotizar") ||
      last.includes("cotización") ||
      last.includes("presupuesto") ||
      last.includes("precio") ||
      last.includes("costo") ||
      last.includes("valor") ||
      last.includes("cuánto sale") ||
      last.includes("cuanto sale");

    const palabrasDeTrabajo =
      last.includes("trabajo") ||
      last.includes("servicio") ||
      last.includes("producto") ||
      last.includes("necesito") ||
      last.includes("quiero") ||
      last.includes("hacer") ||
      last.includes("fabricar") ||
      last.includes("fabricación") ||
      last.includes("fabricacion");

    const serviciosLasertec =
      last.includes("corte") ||
      last.includes("cortar") ||
      last.includes("corte láser") ||
      last.includes("corte laser") ||
      last.includes("chapa") ||
      last.includes("chapas") ||
      last.includes("metal") ||
      last.includes("metalúrgico") ||
      last.includes("metalurgico") ||
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
      last.includes("aluminio");

    const envioRelacionado =
      last.includes("envío") ||
      last.includes("envio") ||
      last.includes("interior") ||
      last.includes("expreso") ||
      last.includes("transporte") ||
      last.includes("mendoza") ||
      last.includes("cordoba") ||
      last.includes("córdoba") ||
      last.includes("rosario") ||
      last.includes("santa fe");

    const historialTieneConsultaComercial =
      historial.includes("cotizar") ||
      historial.includes("presupuesto") ||
      historial.includes("precio") ||
      historial.includes("costo") ||
      historial.includes("envío") ||
      historial.includes("envio") ||
      historial.includes("interior") ||
      historial.includes("trabajo") ||
      historial.includes("servicio");

    const intencion =
      palabrasDeCotizacion ||
      serviciosLasertec ||
      (historialTieneConsultaComercial && envioRelacionado) ||
      (historialTieneConsultaComercial && palabrasDeTrabajo);

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

    // 3. Si no hay intención comercial clara, responde normalmente
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

Tu objetivo es responder consultas simples y detectar oportunidades comerciales.

IMPORTANTE:
- Si el usuario pregunta datos generales, respondé normalmente.
- Si el usuario menciona un trabajo concreto, como corte de chapas, corte láser, plegado, soldadura, fabricación de piezas, materiales, cantidades, medidas, precio, presupuesto o envío asociado a un trabajo, el sistema debe activar el formulario.
- No inventes precios.
- No pidas datos de contacto dentro del chat.
- No menciones formularios por tu cuenta.
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
