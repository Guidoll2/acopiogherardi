"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthService } from "@/lib/auth"
import { Wheat, Eye, EyeOff, LogIn } from "lucide-react"

export function LoginSection() {
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
        let targetUrl = "/dashboard"
        
        if (user.role === "system_admin") {
          targetUrl = "/system-admin"
        } else if (user.role === "garita") {
          targetUrl = "/garita"
        } else {
          targetUrl = "/dashboard"
        }
        
        window.location.href = targetUrl
        return
      } else {
        setError("Credenciales inválidas")
        setLoading(false)
      }
    } catch (err) {
      console.error("Error en login:", err)
      setError("Error al iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <section id="login-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso al Sistema
            </h2>
            <p className="text-gray-600">
              ¿Ya tienes cuenta? Ingresa tus credenciales
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-green-700 flex items-center justify-center gap-2">
                <Wheat className="h-5 w-5" />
                Cuatro Granos
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sistema de Gestión de Cereales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent border-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Iniciar Sesión
                    </div>
                  )}
                </Button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  <strong>¿Nuevo usuario?</strong><br />
                  Continúa leyendo para conocer más sobre el sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}