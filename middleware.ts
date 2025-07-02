import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Solo aplicar middleware en rutas protegidas
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/garita") ||
    request.nextUrl.pathname.startsWith("/system-admin")
  ) {
    // En el servidor no podemos acceder a localStorage directamente
    // La verificación de autenticación se hará en los componentes del cliente
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/garita/:path*", "/system-admin/:path*"],
}
