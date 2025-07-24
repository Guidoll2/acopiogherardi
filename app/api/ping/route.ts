import { NextResponse } from "next/server"

// Simple endpoint para verificar conectividad
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'acopio-gh'
  })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
