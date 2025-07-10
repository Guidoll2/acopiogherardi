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
    // Obtener token de cookies o header Authorization
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any
    
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
