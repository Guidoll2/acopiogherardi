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
      const user = await AuthService.login({ email, password })
      if (user) {
        // Redirección específica según el rol
        if (user.role === "system_admin") {
          router.push("/system-admin")
        } else if (user.role === "company_admin") {
          router.push("/dashboard")
        } else if (user.role === "admin") {
          router.push("/dashboard")
        } else {
          setError("Rol de usuario no reconocido")
        }
      } else {
        setError("Credenciales inválidas")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const demoUsers = [
    { email: "admin@sistema.com", password: "admin123", role: "system_admin" },
    { email: "admin@acopio.com", password: "admin123", role: "company_admin" },
    { email: "supervisor@acopio.com", password: "super123", role: "admin" },
    { email: "operador@acopio.com", password: "oper123", role: "admin" },
    { email: "garita@acopio.com", password: "garita123", role: "admin" },
  ]
    
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
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Usuarios Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            {demoUsers.map((user, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                <div className="font-medium">{user.role}</div>
                <div className="text-gray-600">
                  {user.email} / {user.password}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
