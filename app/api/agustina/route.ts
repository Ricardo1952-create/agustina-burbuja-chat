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

    // 🔥 DISPARA FORMULARIO VISUAL
    if (intencion) {
      return new Response(
        JSON.stringify({
          reply: "__FORM__",
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
          body: JSON.stringify(posibleJSON),
        });

        return new Response(
          JSON.stringify({
            reply:
              "Perfecto 👍 Ya registramos tu solicitud. Un asesor te va a contactar a la brevedad.",
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
      messages,
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
