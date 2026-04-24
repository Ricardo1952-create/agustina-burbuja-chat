import { NextResponse } from "next/server"

const KNOWLEDGE = `
LASERTEC INGENIERÍA

SERVICIOS:
- Corte láser de chapa
- Corte láser de caños
- Plegado CNC
- Soldadura MIG
- Soldadura TIG
- Fabricación de piezas y estructuras

MATERIALES:
- Principalmente acero al carbono y acero inoxidable
- Se trabajan todo tipo de materiales, excepto vidrio y cemento

ESPESORES:
- Corte láser hasta 45 mm (según material)

FORMATOS:
- 1500 x 3000 mm
- 2500 x 6000 mm

PROCESOS:
- Pulido
- Arenado
- Flapeado
- Avellanado
- Biselado
- Corte laser
- Esmerilado
- Galvanizado
- Mecanizado
- Pintura
- Planchado
- Plegado
- Conformado
- Rolado
- Roscado
- Soldadura Mig
- Soldadura Tig
- Soldadura Laser
- Soldar a punto
- Zincado

ENVÍOS:
- Se realizan envíos, incluyendo al interior

HORARIOS:
- Lunes a viernes de 8 a 17 hs
`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const lowerMessage = message.toLowerCase()

    // 🎯 SOLO disparan formulario
    const isLead =
      lowerMessage.includes("cotizar") ||
      lowerMessage.includes("presupuesto") ||
      lowerMessage.includes("precio")

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

    // 🧠 RESPUESTA NORMAL (CONSULTAS)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Sos Agustina, asistente comercial de LASERTEC.

Usá SOLO esta información:
${KNOWLEDGE}

REGLAS:
- Respondé corto, claro y directo
- No inventes datos
- No saludes innecesariamente
- No redirijas a formulario en consultas

- Si la información está → responder claro
- Si NO tenés información:
"Podrías darme un poco más de detalle así te ayudo mejor?"

Pregunta: ${message}`
      })
    })

    const data = await response.json()

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "Podrías darme un poco más de detalle así te ayudo mejor?"

    return NextResponse.json({ reply })

  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "Hubo un problema, intentá de nuevo"
    })
  }
}