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
- Lunes a viernes de 8 a 12 y de 13 a 17 hs
`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const lowerMessage = message.toLowerCase()

    // ✅ SALUDO FORZADO
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

    // 🎯 DETECCIÓN INTENCIÓN COMERCIAL
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

    // 🧠 RESPUESTA CONTROLADA CON KNOWLEDGE
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Sos Agustina, asistente comercial de LASERTEC.

BASE DE CONOCIMIENTO (ÚNICA FUENTE VÁLIDA):
${KNOWLEDGE}

REGLAS ESTRICTAS (OBLIGATORIAS):
- SOLO podés responder usando información textual exacta de la BASE DE CONOCIMIENTO
- NO podés usar conocimiento general
- NO podés asumir
- NO podés completar información faltante
- NO podés reinterpretar datos técnicos

COMPORTAMIENTO:
- Responder corto, claro y directo
- No saludar
- No agregar contexto innecesario

LÓGICA DE RESPUESTA:
1. Si la respuesta está explícitamente en la base → responder con esa información
2. Si la pregunta es ambigua → pedir aclaración
3. Si la información NO está en la base → responder EXACTAMENTE:

"No tengo esa información en este momento. Si querés, podés darme más detalles o completar el formulario y un asesor te responde."

IMPORTANTE:
- Nunca inventar horarios, espesores, materiales o capacidades
- Nunca responder fuera de la base

Pregunta del cliente:
${message}`
      })
    })

    const data = await response.json()

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "No tengo esa información en este momento. Si querés, podés darme más detalles o completar el formulario y un asesor te responde."

    return NextResponse.json({ reply })

  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "Hubo un problema, intentá de nuevo"
    })
  }
}