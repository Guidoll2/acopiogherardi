import { NextResponse } from "next/server"

// Método GET para evitar errores de build
export async function GET() {
  return NextResponse.json({ message: "Logout API endpoint" })
}

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada exitosamente"
  })

  // Eliminar cookie de autenticación
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0
  })

  return response
}
