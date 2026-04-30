import OpenAI from "openai";

const WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_XWvZnpcELHWI8L2cm5-KED5EIGDlzMG93EDS1NH-g33Ik4JsqlmsuNdGHJsrzlsorA/exec";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const last =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🔥 DETECTAR INTENCIÓN
    const intencion =
      last.includes("cotizar") ||
      last.includes("presupuesto") ||
      last.includes("precio") ||
      last.includes("trabajo");

    // 👉 PASO 1: activar flujo
    if (intencion && messages.length < 4) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para cotizar, decime tu nombre, teléfono y qué necesitás hacer.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 👉 PASO 2: capturar datos y enviar
    if (messages.length >= 4) {
      await fetch(WEBHOOK, {
        method: "POST",
        body: JSON.stringify({
          mensaje: last,
        }),
      });

      return new Response(
        JSON.stringify({
          reply:
            "Gracias 👍 Ya registramos tu pedido. Un asesor te va a contactar a la brevedad.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 👉 RESPUESTA NORMAL
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
