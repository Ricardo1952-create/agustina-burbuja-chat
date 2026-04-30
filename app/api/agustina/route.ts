import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const last =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🎯 DETECCIÓN SIMPLE Y ESTABLE (como antes)
    const intencionTrabajo =
      last.includes("cotizar") ||
      last.includes("presupuesto") ||
      last.includes("precio") ||
      last.includes("trabajo") ||
      last.includes("cortar") ||
      last.includes("soldar") ||
      last.includes("plegar") ||
      last.includes("fabricar");

    // 🔥 SI HAY INTENCIÓN → ACTIVAR FLUJO (sin link, sin complicar)
    if (intencionTrabajo) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para avanzar con el trabajo, te voy a pedir unos datos así un asesor puede contactarte.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🤖 SI NO → RESPUESTA NORMAL
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

- Respondés consultas técnicas
- Ayudás al usuario
- Si detectás interés, guiás la conversación
- No seas insistente
- Respondé claro y profesional
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
