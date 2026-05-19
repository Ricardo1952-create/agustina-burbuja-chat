import OpenAI from "openai";

const WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzP9DkhB-y7yfA6zUXomXyKckQBHShSPjj4ommedwR-7Twf8RZgKNS8kfT-JRj2_kzP7A/exec";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastMessage = messages[messages.length - 1]?.content || "";
    const last = lastMessage.toLowerCase();

    const historial = messages
      .map((m: any) => m.content || "")
      .join(" ")
      .toLowerCase();

    // 1. PRIMERO revisar si lo que llegó es el formulario completo
    try {
      const posibleJSON = JSON.parse(lastMessage);

      if (
        posibleJSON.nombre &&
        posibleJSON.telefono &&
        posibleJSON.detalle
      ) {
        const respuestaWebhook = await fetch(WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: posibleJSON.nombre || "",
            telefono: posibleJSON.telefono || "",
            email: "",
            empresa: "",
            descripcion: posibleJSON.detalle || "",
          }),
        });

        if (!respuestaWebhook.ok) {
          return new Response(
            JSON.stringify({
              reply:
                "Recibí tus datos, pero hubo un problema al guardarlos en la planilla. Por favor, avisá al equipo para revisarlo.",
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            reply:
              "Perfecto 👍 Ya registramos tu solicitud. Un asesor se va a comunicar con vos a la brevedad.",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      // No era JSON, seguimos normalmente
    }

    // 2. Detectar pedido explícito de presupuesto / cotización
    const pidePresupuesto =
      last.includes("cotizar") ||
      last.includes("cotizá") ||
      last.includes("cotiza") ||
      last.includes("cotizalo") ||
      last.includes("cotízalo") ||
      last.includes("cotizame") ||
      last.includes("cotízame") ||
      last.includes("cotización") ||
      last.includes("cotizacion") ||
      last.includes("presupuesto") ||
      last.includes("presupuestar") ||
      last.includes("precio") ||
      last.includes("costo") ||
      last.includes("valor") ||
      last.includes("cuánto sale") ||
      last.includes("cuanto sale");

    // 3. Horario de atención
    const preguntaHorario =
      last.includes("horario") ||
      last.includes("horarios") ||
      last.includes("hora atienden") ||
      last.includes("a qué hora") ||
      last.includes("a que hora") ||
      last.includes("cuando atienden") ||
      last.includes("cuándo atienden");

    if (preguntaHorario) {
      return new Response(
        JSON.stringify({
          reply:
            "Nuestro horario de atención es de 8:00 a 12:00 y de 13:00 a 17:00.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Tamaños y espesores juntos
    const preguntaTamanosYEspesores =
      (last.includes("tamaño") ||
        last.includes("tamaños") ||
        last.includes("medida") ||
        last.includes("medidas") ||
        last.includes("formato") ||
        last.includes("formatos")) &&
      (last.includes("espesor") ||
        last.includes("espesores") ||
        last.includes("grosor") ||
        last.includes("grosores"));

    if (preguntaTamanosYEspesores) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, los tamaños y espesores de chapa disponibles son:\n\n- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.\n- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n\nPara confirmar un caso puntual, conviene indicar material, medidas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Tamaños de chapa
    const preguntaTamanosChapa =
      last.includes("tamaño de chapa") ||
      last.includes("tamaños de chapa") ||
      last.includes("medida de chapa") ||
      last.includes("medidas de chapa") ||
      last.includes("formato de chapa") ||
      last.includes("formatos de chapa") ||
      last.includes("qué tamaño de chapa") ||
      last.includes("que tamaño de chapa") ||
      last.includes("qué tamaños de chapa") ||
      last.includes("que tamaños de chapa");

    if (preguntaTamanosChapa) {
      return new Response(
        JSON.stringify({
          reply:
            "Los tamaños de chapa disponibles son:\n\n- Acero 1010: 1500 x 3000 mm.\n- Inoxidable 304: 2500 x 6000 mm.\n- Otros materiales: 1500 x 3000 mm.\n\nLa disponibilidad final puede depender del material y del trabajo a realizar.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Espesores
    const preguntaEspesores =
      last.includes("espesor") ||
      last.includes("espesores") ||
      last.includes("grosor") ||
      last.includes("grosores") ||
      last.includes("hasta qué espesor") ||
      last.includes("hasta que espesor");

    if (preguntaEspesores) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, los espesores disponibles llegan hasta 30 mm.\n\nDetalle:\n- Acero 1010: hasta 30 mm.\n- Inoxidable 304: hasta 30 mm.\n- Otros materiales: hasta 30 mm.\n\nPara confirmar un caso puntual, conviene indicar material, medidas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. Materiales
    const preguntaMateriales =
      last.includes("material") ||
      last.includes("materiales") ||
      last.includes("qué materiales") ||
      last.includes("que materiales") ||
      last.includes("trabajan inoxidable") ||
      last.includes("trabajan acero") ||
      last.includes("trabajan aluminio");

    if (preguntaMateriales) {
      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual, se trabaja con acero 1010, inoxidable 304 y otros materiales. Para confirmar disponibilidad en un caso puntual, conviene indicar material, espesor, medidas y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 8. Disponibilidad de chapa con tamaño y material
    const preguntaDisponibilidadChapa =
      (last.includes("trabajan") ||
        last.includes("utilizan") ||
        last.includes("usan") ||
        last.includes("tienen") ||
        last.includes("disponen")) &&
      (last.includes("chapa") || last.includes("chapas")) &&
      (last.includes("1500") ||
        last.includes("1.500") ||
        last.includes("3000") ||
        last.includes("3.000") ||
        last.includes("2500") ||
        last.includes("2.500") ||
        last.includes("6000") ||
        last.includes("6.000"));

    if (preguntaDisponibilidadChapa) {
      if (
        last.includes("inoxidable 304") &&
        (last.includes("1500") || last.includes("1.500")) &&
        (last.includes("3000") || last.includes("3.000"))
      ) {
        return new Response(
          JSON.stringify({
            reply:
              "Según la base actual, para inoxidable 304 figura chapa de 2500 x 6000 mm, hasta 30 mm de espesor. Para inoxidable 304 en 1500 x 3000 mm habría que confirmarlo con el equipo técnico.",
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          reply:
            "Según la base actual:\n\n- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.\n- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.\n- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 9. Procesos disponibles
    const preguntaProcesos =
      last.includes("procesos") ||
      last.includes("servicios") ||
      last.includes("qué hacen") ||
      last.includes("que hacen") ||
      last.includes("qué trabajos hacen") ||
      last.includes("que trabajos hacen") ||
      last.includes("capacidades");

    if (preguntaProcesos) {
      return new Response(
        JSON.stringify({
          reply:
            "Los procesos disponibles son: pulido, arenado, flapeado, avellanado, biselado, corte láser, esmerilado, galvanizado, mecanizado, pintura, planchado, plegado, conformado, rolado, roscado, soldadura MIG, soldadura TIG, soldadura láser, soldadura a punto y zincado.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 10. Envíos al interior
    const preguntaEnvio =
      last.includes("envío") ||
      last.includes("envio") ||
      last.includes("interior") ||
      last.includes("expreso") ||
      last.includes("transporte") ||
      last.includes("flete");

    if (preguntaEnvio && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Sí, podemos coordinar envíos al interior. Para orientarte mejor, indicame el destino y qué tipo de trabajo o producto tenés en mente.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (preguntaEnvio && pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "El costo del envío depende del destino, tamaño, peso y características del trabajo. Para estimarlo primero necesitamos saber qué pieza, chapa o trabajo tenés en mente.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 11. Consultas de capacidad: no disparan formulario, piden detalle
    const preguntaSiPuedenHacer =
      last.includes("hacen") ||
      last.includes("hace") ||
      last.includes("realizan") ||
      last.includes("realiza") ||
      last.includes("ofrecen") ||
      last.includes("ofrece") ||
      last.includes("trabajan con") ||
      last.includes("trabajan") ||
      last.includes("pueden hacer") ||
      last.includes("se puede hacer") ||
      last.includes("arman") ||
      last.includes("armados") ||
      last.includes("fabrican");

    const mencionaProcesoOTrabajo =
      last.includes("corte") ||
      last.includes("cortar") ||
      last.includes("plegado") ||
      last.includes("plegar") ||
      last.includes("soldadura") ||
      last.includes("soldar") ||
      last.includes("pintura") ||
      last.includes("pintar") ||
      last.includes("mecanizado") ||
      last.includes("mecanizar") ||
      last.includes("rolado") ||
      last.includes("rolar") ||
      last.includes("roscado") ||
      last.includes("roscar") ||
      last.includes("biselado") ||
      last.includes("biselar") ||
      last.includes("avellanado") ||
      last.includes("avellanar") ||
      last.includes("armado") ||
      last.includes("armados") ||
      last.includes("conjunto") ||
      last.includes("conjuntos") ||
      last.includes("prototipo") ||
      last.includes("prototipos") ||
      last.includes("estructura") ||
      last.includes("estructuras") ||
      last.includes("ensamble") ||
      last.includes("ensambles") ||
      last.includes("montaje") ||
      last.includes("montajes");

    if (preguntaSiPuedenHacer && mencionaProcesoOTrabajo && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Podemos evaluarlo. Para orientarte mejor, describime brevemente qué trabajo tenés en mente: piezas, material, medidas aproximadas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 12. Pedido de equipo técnico: pedir descripción
    const pideEquipoTecnico =
      last.includes("equipo técnico") ||
      last.includes("equipo tecnico") ||
      last.includes("técnico") ||
      last.includes("tecnico") ||
      last.includes("conectame") ||
      last.includes("contactame") ||
      last.includes("comunicarme") ||
      last.includes("hablar con alguien") ||
      last.includes("hablar con un técnico") ||
      last.includes("hablar con un tecnico");

    if (pideEquipoTecnico && !pidePresupuesto) {
      return new Response(
        JSON.stringify({
          reply:
            "Para que el equipo técnico pueda evaluar bien tu consulta, describime brevemente el trabajo: qué necesitás hacer, material, medidas aproximadas, cantidad y proceso requerido.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 13. Detectar descripción concreta de trabajo
    const describeTrabajoConcreto =
      last.includes("quiero") ||
      last.includes("necesito") ||
      last.includes("tengo que") ||
      last.includes("hay que") ||
      last.includes("busco") ||
      last.includes("hacer") ||
      last.includes("fabricar") ||
      last.includes("cortar") ||
      last.includes("corte") ||
      last.includes("plegar") ||
      last.includes("plegado") ||
      last.includes("soldar") ||
      last.includes("soldadura") ||
      last.includes("soldarlas") ||
      last.includes("soldarlos") ||
      last.includes("armar") ||
      last.includes("armado") ||
      last.includes("montar") ||
      last.includes("montaje") ||
      last.includes("mecanizar") ||
      last.includes("mecanizado") ||
      last.includes("pintar") ||
      last.includes("pintura");

    const tieneObjetoOMaterial =
      last.includes("pieza") ||
      last.includes("piezas") ||
      last.includes("chapa") ||
      last.includes("chapas") ||
      last.includes("placa") ||
      last.includes("placas") ||
      last.includes("estructura") ||
      last.includes("estructuras") ||
      last.includes("conjunto") ||
      last.includes("conjuntos") ||
      last.includes("motor") ||
      last.includes("motores") ||
      last.includes("acero") ||
      last.includes("inoxidable") ||
      last.includes("hierro") ||
      last.includes("aluminio") ||
      last.includes("metal") ||
      last.includes("metálica") ||
      last.includes("metalica");

    const intencion =
      pidePresupuesto ||
      (describeTrabajoConcreto && tieneObjetoOMaterial);

    if (intencion) {
      return new Response(
        JSON.stringify({
          showForm: true,
          reply:
            "[FORMULARIO]\nPerfecto 👍 Para que un especialista revise tu consulta y pueda responderte correctamente, completá el siguiente formulario.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 14. Si no entra en nada anterior, responde con IA usando base cerrada
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sos Agustina, asistente comercial de Lasertec Ingeniería.

Respondés consultas simples de forma clara y breve.

DATOS FIJOS:
- Horario de atención: de 8:00 a 12:00 y de 13:00 a 17:00.
- No digas que el horario es de 8 a 18.

BASE TÉCNICA ACTUAL:
- Acero 1010: chapa 1500 x 3000 mm, hasta 30 mm de espesor.
- Inoxidable 304: chapa 2500 x 6000 mm, hasta 30 mm de espesor.
- Otros materiales: chapa 1500 x 3000 mm, hasta 30 mm de espesor.

Procesos disponibles:
- Pulido.
- Arenado.
- Flapeado.
- Avellanado.
- Biselado.
- Corte láser.
- Esmerilado.
- Galvanizado.
- Mecanizado.
- Pintura.
- Planchado.
- Plegado.
- Conformado.
- Rolado.
- Roscado.
- Soldadura MIG.
- Soldadura TIG.
- Soldadura láser.
- Soldadura a punto.
- Zincado.

REGLAS:
- Ignorá cualquier otra tabla o pestaña de materiales y espesores.
- No inventes materiales, espesores, precios ni capacidades.
- Si preguntan si pueden hacer un trabajo, respondé que puede evaluarse y pedí descripción.
- Si describen un trabajo concreto, el sistema activará el formulario.
- No pidas datos personales dentro del chat.
- No menciones formularios por tu cuenta.
- Respondé en español, breve y claro.
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
