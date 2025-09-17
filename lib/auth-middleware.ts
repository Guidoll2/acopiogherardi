import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export interface AuthenticatedUser {
  userId: string
  email: string
  role: string
  company_id?: string
}

export function verifyToken(request: NextRequest): AuthenticatedUser | null {
  try {
    console.log("=== DEBUG verifyToken ===")
    
    // Obtener token de cookies o header Authorization
    const cookieToken = request.cookies.get("auth-token")?.value
    const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "")

    // Log presence of token sources (do NOT print whole token)
    console.log("Cookie token presente:", !!cookieToken)
    console.log("Header token presente:", !!headerToken)

    const token = cookieToken || headerToken

    if (!token) {
      console.log("No se encontró token en cookies ni headers")
      return null
    }

    // Avoid logging the token value; instead log token length and a masked prefix to help debug
    try {
      const masked = token.length > 10 ? token.slice(0, 6) + '...' + token.slice(-4) : token
      console.log("Token encontrado (masked):", masked, "length:", token.length)
    } catch (e) {
      console.log("Token encontrado (unable to mask)")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any
    console.log("Token decodificado exitosamente:", { userId: decoded.userId, email: decoded.email, role: decoded.role })
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.company_id
    }
  } catch (error) {
    console.error("Error verificando token:", error)
    return null
  }
}

export function requireAuth(requiredRoles?: string[]) {
  return function(request: NextRequest) {
    const user = verifyToken(request)
    
    if (!user) {
      return { authenticated: false, error: "Token inválido o expirado" }
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return { authenticated: false, error: "Permisos insuficientes" }
    }

    return { authenticated: true, user }
  }
}
