import OpenAI from "openai";

const WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_XWvZnpcELHWI8L2cm5-KED5EIGDlzMG93EDS1NH-g33Ik4JsqlmsuNdGHJsrzlsorA/exec";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const last =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🔥 DETECCIÓN DE INTENCIÓN
    const intencion =
      last.includes("cotizar") ||
      last.includes("presupuesto") ||
      last.includes("precio") ||
      last.includes("trabajo") ||
      last.includes("cortar") ||
      last.includes("soldar") ||
      last.includes("plegar") ||
      last.includes("fabricar") ||
      last.includes("necesito") ||
      last.includes("quiero");

    // 🔥 RESPUESTA + FORMULARIO
    if (intencion) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para avanzar, dejá tus datos en el siguiente formulario y un asesor se va a comunicar con vos a la brevedad.",
          showForm: true,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔥 SI RECIBE DATOS DEL FORM → GUARDA EN GOOGLE SHEETS
    try {
      const posibleJSON = JSON.parse(last);

      if (
        posibleJSON.nombre &&
        posibleJSON.telefono &&
        posibleJSON.detalle
      ) {
        await fetch(WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // ✅ ESTE ES EL FIX
          },
          body: JSON.stringify(posibleJSON),
        });

        return new Response(
          JSON.stringify({
            reply:
              "Perfecto 👍 Ya registramos tu solicitud. Un asesor se va a comunicar con vos a la brevedad.",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      // no era JSON, seguimos normal
    }

    // 🤖 RESPUESTA NORMAL
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

Tu objetivo es atender consultas comerciales y técnicas simples sobre trabajos de corte láser, plegado y soldadura, y detectar oportunidades de cotización.

Horarios de atención:
Lunes a viernes de 8 a 12 y de 13 a 17.

Materiales:
Trabajamos principalmente acero al carbono y acero inoxidable.
También se pueden procesar otros materiales, excepto vidrio y cemento.
No listar todos los materiales, responder de forma general.

Capacidad de corte:
Trabajamos con chapas de hasta 1500 x 3000 mm y 2500 x 6000 mm.
Cortamos espesores de hasta 30 mm.

Estilo de respuesta:
Respondé en español.
Usá un tono claro, amable, breve y comercial.
No des respuestas largas salvo que el usuario lo pida.
Si el usuario consulta por un trabajo concreto, orientalo a dejar sus datos para que un asesor lo contacte.
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
