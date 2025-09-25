"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthService } from "@/lib/auth"
import { Wheat, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Iniciando login...")
      const user = await AuthService.login({ email, password })
      console.log("Resultado del login:", user)
      
      if (user) {
        console.log("Usuario logueado, rol:", user.role)
        console.log("Guardando en localStorage...")
        
        // Verificar que se guardó en localStorage
        const saved = localStorage.getItem("grain_auth_user")
        console.log("Datos guardados en localStorage:", saved ? "✅ Sí" : "❌ No")
        
        // Forzar navegación inmediata sin esperar
        let targetUrl = "/dashboard" // Por defecto
        
        if (user.role === "system_admin") {
          targetUrl = "/system-admin"
        } else if (user.role === "garita") {
          targetUrl = "/garita"
        } else {
          targetUrl = "/dashboard"
        }
        
        console.log("Redirigiendo a:", targetUrl)
        
        // Usar window.location para forzar navegación completa
        console.log("Ejecutando redirección...")
        window.location.href = targetUrl
        
        // Evitar que el loading se desactive cuando hay redirección exitosa
        return
      } else {
        console.log("Login falló - usuario es null")
        setError("Credenciales inválidas")
        setLoading(false) // Resetear loading cuando fallan las credenciales
      }
    } catch (err) {
      console.error("Error en handleSubmit:", err)
      setError("Error al iniciar sesión")
      setLoading(false) // Resetear loading cuando hay error
    }
  }
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Wheat className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Acopio</h1>
          <p className="text-gray-600 mt-2">Gestión de Cereales</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-700">Ingrese sus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-gray-700">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div className="space-y-2 text-gray-700">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Link href="/password-reset" className="text-center text-sm text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link href="/company-register" className="text-center text-sm text-green-600 hover:underline">
                  ¿Tu empresa aún no tiene cuenta? Solicita acceso aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
