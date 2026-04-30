import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const last =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🔥 DETECCIÓN SIMPLE (intención real)
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

    // 🔥 SI HAY INTENCIÓN → DISPARA FORMULARIO
    if (intencion) {
      return new Response(
        JSON.stringify({
          reply: "__FORMULARIO__",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
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
