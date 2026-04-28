import { NextResponse } from "next/server"

const KNOWLEDGE = `
EMPRESA: LASERTEC INGENIERÍA

SERVICIOS PRINCIPALES:
- Corte láser (chapa y caños)
- Plegado CNC
- Soldadura (MIG y TIG)
- Fabricación de piezas y estructuras metálicas

CORTE LÁSER:
- Aplica a chapa y caños
- Espesor máximo: 45 mm (depende del material)
- Formatos disponibles:
  - 1500 x 3000 mm
  - 2500 x 6000 mm

PLEGADO CNC:
- Servicio disponible para piezas metálicas

SOLDADURA:
- Tipos disponibles:
  - MIG
  - TIG
  - Láser
  - Punto

MATERIALES:
- Acero al carbono
- Acero inoxidable
- Otros materiales (excepto vidrio y cemento)

PROCESOS ADICIONALES:
- Pulido
- Arenado
- Flapeado
- Avellanado
- Biselado
- Esmerilado
- Galvanizado
- Mecanizado
- Pintura
- Planchado
- Conformado
- Rolado
- Roscado
- Zincado

ENVÍOS:
- Se realizan envíos, incluyendo al interior

HORARIOS DE ATENCIÓN:
- Lunes a viernes
- 08:00 a 12:00
- 13:00 a 17:00
`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const lowerMessage = message.toLowerCase()

    // ✅ SALUDO
    const isGreeting =
      lowerMessage.includes("hola") ||
      lowerMessage.includes("buenas") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hello")

    if (isGreeting) {
      return NextResponse.json({
        reply:
          "Hola, soy el asistente comercial. Puedo ayudarte con consultas o cotizaciones de corte, plegado y soldadura. ¿Qué necesitás?"
      })
    }

    // 🎯 INTENCIÓN COMERCIAL
    const isLead =
      /cotiz|presupuest|precio|cuánto|valor|necesito/i.test(lowerMessage)

    const wantsHuman =
      lowerMessage.includes("humano") ||
      lowerMessage.includes("persona") ||
      lowerMessage.includes("representante") ||
      lowerMessage.includes("asesor")

    if (isLead || wantsHuman) {
      return NextResponse.json({
        reply: `[FORMULARIO]
Perfecto. Completá el formulario con tu empresa, nombre y qué necesitás, y un asesor técnico se va a contactar con vos.`
      })
    }

    // 🧠 RESPUESTAS DIRECTAS (CRÍTICAS)
    if (lowerMessage.includes("espesor")) {
      return NextResponse.json({
        reply: "Corte láser hasta 45 mm (depende del material)."
      })
    }

    if (lowerMessage.includes("horario") || lowerMessage.includes("hora")) {
      return NextResponse.json({
        reply: "Lunes a viernes de 8 a 12 y de 13 a 17 hs."
      })
    }

    if (lowerMessage.includes("soldadura")) {
      return NextResponse.json({
        reply: "Trabajamos con soldadura MIG, TIG, láser y a punto."
      })
    }

    if (lowerMessage.includes("material")) {
      return NextResponse.json({
        reply: "Trabajamos principalmente acero al carbono y acero inoxidable."
      })
    }

    // 🧠 IA PARA CONSULTAS MÁS ABIERTAS
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Sos Agustina, asistente comercial de LASERTEC.

Usás únicamente esta base de conocimiento:

${KNOWLEDGE}

REGLAS:
- No inventar datos
- No usar conocimiento externo
- Responder claro y directo

Si no hay información suficiente, pedir más detalle.`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    })

    const data = await response.json()

    const reply =
      data.choices?.[0]?.message?.content ||
      "Podrías darme un poco más de detalle así te ayudo mejor?"

    return NextResponse.json({ reply })

  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "Hubo un problema, intentá de nuevo"
    })
  }
}
