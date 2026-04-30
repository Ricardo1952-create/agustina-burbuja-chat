import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const last =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 🔥 LISTA DE ACCIONES (lo que indica trabajo real)
    const acciones = [
      "cortar",
      "plegar",
      "soldar",
      "fabricar",
      "hacer",
      "necesito",
      "quiero",
      "trabajo",
    ];

    // 🔥 PALABRAS DE COMPRA
    const compra = [
      "cotizar",
      "presupuesto",
      "precio",
      "cuanto sale",
      "cuánto sale",
    ];

    // 🔍 CONSULTA PURA (no compra)
    const consulta = [
      "espesor",
      "material",
      "trabajan",
      "pueden",
      "hacen",
      "capacidad",
      "tipo",
    ];

    // 🔍 DETECCIÓN
    const tieneAccion = acciones.some(p => last.includes(p));
    const quiereComprar = compra.some(p => last.includes(p));
    const esConsulta = consulta.some(p => last.includes(p));

    // 🎯 REGLA FUERTE (esto es lo que te faltaba)
    // 👉 si hay ACCIÓN + (compra o intención) → FORMULARIO
    if (tieneAccion && !esConsulta) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para avanzar con el trabajo, completá este formulario y un asesor te va a contactar a la brevedad:\n\n👉 [LINK_FORMULARIO]",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (quiereComprar && !esConsulta) {
      return new Response(
        JSON.stringify({
          reply:
            "Perfecto 👍 Para cotizar, completá este formulario y un asesor te va a contactar a la brevedad:\n\n👉 [LINK_FORMULARIO]",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🤖 RESPUESTA NORMAL (consultas)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sos Agustina, asistente de Lasertec.

- Respondés consultas técnicas
- Ayudás al usuario
- Si no hay intención clara, informás
- No fuerces venta
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
