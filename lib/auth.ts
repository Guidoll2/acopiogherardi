"use client"

import type { User } from "@/types"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  role: User["role"]
  company_id?: string
}

interface AuthUser extends User {
  role: User["role"]
}

export class AuthService {
  private static readonly STORAGE_KEY = "grain_auth_user"

  static async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      console.log("Intentando login con:", credentials.email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      console.log("Respuesta del servidor:", { status: response.status, data })

      if (!response.ok) {
        console.error("Error en login:", data.error)
        return null
      }

      const authUser: AuthUser = {
        id: data.user._id,
        email: data.user.email,
        full_name: data.user.full_name,
        phone: data.user.phone || "",
        address: data.user.address || "",
        role: data.user.role,
        is_active: data.user.is_active,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        company_id: data.user.company_id,
      }

      console.log("Usuario autenticado:", authUser)

      // Guardar en localStorage para el cliente
      if (typeof window !== "undefined") {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser))
      }

      return authUser
    } catch (error) {
      console.error("Error en login:", error)
      return null
    }
  }

  static async register(userData: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      return { success: true }
    } catch (error) {
      console.error("Error en registro:", error)
      return { success: false, error: "Error de conexión" }
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Error en logout:", error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.STORAGE_KEY)
      }
    }
  }

  static getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") {
      return null
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static hasRole(requiredRoles: string[]): boolean {
    const user = this.getCurrentUser()
    return user ? requiredRoles.includes(user.role) : false
  }

  static canManageCompany(): boolean {
    const user = this.getCurrentUser()
    return user ? ["system_admin", "company_admin", "admin"].includes(user.role) : false
  }

  static canManageCompanySettings(): boolean {
    const user = this.getCurrentUser()
    return user ? ["admin", "company_admin", "system_admin"].includes(user.role) : false
  }

  static canManageUsers(): boolean {
    const user = this.getCurrentUser()
    return user ? ["system_admin", "company_admin"].includes(user.role) : false
  }

  static canViewReports(): boolean {
    const user = this.getCurrentUser()
    return user ? ["system_admin", "company_admin", "admin", "supervisor"].includes(user.role) : false
  }
}
