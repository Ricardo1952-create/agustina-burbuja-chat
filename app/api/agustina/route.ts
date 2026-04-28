import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    return NextResponse.json({
      reply: "PRUEBA ROUTE TS ACTIVO"
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json({
      reply: "ERROR"
    })
  }
}
