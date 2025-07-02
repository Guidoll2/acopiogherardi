"use client"

import { users, demoCredentials } from "./mock-data"
import type { User } from "@/types"

interface LoginCredentials {
  email: string
  password: string
}

interface AuthUser extends User {
  role: User["role"]
}

export class AuthService {
  private static readonly STORAGE_KEY = "grain_auth_user"

  static login(credentials: LoginCredentials): AuthUser | null {
    console.log("Intentando login con:", credentials.email)

    // Verificar credenciales demo
    const demoUser = demoCredentials.find(
      (cred) => cred.email === credentials.email && cred.password === credentials.password,
    )

    console.log("Usuario demo encontrado:", demoUser)

    if (demoUser) {
      // Buscar usuario completo en la base de datos
      const fullUser = users.find((user) => user.email === demoUser.email)
      console.log("Usuario completo encontrado:", fullUser)

      if (fullUser) {
        const authUser: AuthUser = {
          ...fullUser,
          role: demoUser.role as User["role"], // Usar el rol de las credenciales demo
        }

        // Guardar en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser))
        }

        return authUser
      }
    }

    return null
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
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
