import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🔍 INTENCIÓN FUERTE (compra real)
    const intencionFuerte =
      lastUserMessage.includes("cotizar") ||
      lastUserMessage.includes("presupuesto") ||
      lastUserMessage.includes("precio") ||
      lastUserMessage.includes("cuánto sale") ||
      lastUserMessage.includes("cuanto sale") ||
      lastUserMessage.includes("hacer un trabajo") ||
      lastUserMessage.includes("necesito fabricar") ||
      lastUserMessage.includes("necesito cortar") ||
      lastUserMessage.includes("quiero hacer un trabajo");

    // 🔍 CONSULTA TÉCNICA
    const consultaTecnica =
      lastUserMessage.includes("espesor") ||
      lastUserMessage.includes("material") ||
      lastUserMessage.includes("trabajan") ||
      lastUserMessage.includes("pueden") ||
      lastUserMessage.includes("hacen") ||
      lastUserMessage.includes("capacidad") ||
      lastUserMessage.includes("qué tipo") ||
      lastUserMessage.includes("que tipo");

    // 🎯 DECISIÓN
    if (intencionFuerte && !consultaTecnica) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para avanzar con el presupuesto, completá este formulario y un asesor te va a contactar a la brevedad:\n\n👉 [LINK_FORMULARIO]",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🤖 RESPUESTA NORMAL CON IA
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sos Agustina, asistente comercial de Lasertec.

Tu función es:
- responder consultas técnicas
- ayudar al usuario
- detectar oportunidades comerciales

Reglas:
- Si el usuario consulta información → respondé claro y profesional
- Si muestra intención de trabajo → guiá hacia cotización
- No seas insistente ni agresiva
- Mantené tono profesional y directo
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
