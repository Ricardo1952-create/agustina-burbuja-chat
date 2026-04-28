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

    // 🧠 RESPUESTA CON IA (CORRECTA)
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
- Responder claro, directo y breve
- Adaptarte a preguntas poco precisas

CRITERIO:
- Si la pregunta es general pero coincide con algo de la base → responder igual
- Ejemplo: "¿Qué espesor cortan?" → usar CORTE LÁSER
- Ejemplo: "¿Qué soldaduras hacen?" → usar SOLDADURA
- Ejemplo: "¿Qué materiales trabajan?" → usar MATERIALES
- Si el usuario pregunta por "espesor" o "espesores", aunque no aclare proceso → responder:
"Corte láser hasta 45 mm (depende del material)."

SI NO HAY INFORMACIÓN:
Responder EXACTAMENTE:
"No tengo esa información en este momento. Si querés, podés darme más detalles o completar el formulario y un asesor te responde."
`
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
      "No tengo esa información en este momento. Si querés, podés darme más detalles o completar el formulario y un asesor te responde."

    return NextResponse.json({ reply })

  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "Hubo un problema, intentá de nuevo"
    })
  }
}
