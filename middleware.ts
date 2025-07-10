import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
  // Solo aplicar middleware en rutas protegidas
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/garita") ||
    request.nextUrl.pathname.startsWith("/system-admin")
  ) {
    // Para la ruta principal, solo verificar si hay un token válido para redirigir apropiadamente
    if (request.nextUrl.pathname === "/") {
      const token = request.cookies.get("auth-token")?.value
      if (!token) {
        // No hay token, permitir que la página principal maneje la redirección al login
        return NextResponse.next()
      }
      // Hay token, permitir que la página principal maneje la redirección al dashboard apropiado
      return NextResponse.next()
    }

    try {
      // Verificar token de autenticación para rutas protegidas
      const token = request.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Verificar validez del token
      jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")

      // Si el token es válido, continuar
      return NextResponse.next()
    } catch (error) {
      // Token inválido, redirigir a login
      console.error("Token inválido:", error)
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/garita/:path*", "/system-admin/:path*"],
}
