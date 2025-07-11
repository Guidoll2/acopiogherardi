import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Middleware temporalmente deshabilitado para resolver problemas de Edge Runtime
  // La autenticación se maneja en cada página individual
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
