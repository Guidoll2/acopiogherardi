"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { AuthService } from "@/lib/auth"
import { Wheat, Eye, EyeOff, LogIn, Building2, Mail, Phone, User } from "lucide-react"

export function LoginSection() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Estados para el formulario de registro
  const [registerData, setRegisterData] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    cuit: "",
    contact_person: "",
    contact_phone: ""
  })
  const [registerMessage, setRegisterMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

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

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRegisterMessage(null)

    try {
      const response = await fetch("/api/company-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      const result = await response.json()

      if (result.success) {
        setRegisterMessage({
          type: "success",
          text: result.message || "Solicitud enviada exitosamente"
        })
        // Limpiar formulario
        setRegisterData({
          company_name: "",
          email: "",
          phone: "",
          address: "",
          cuit: "",
          contact_person: "",
          contact_phone: ""
        })
      } else {
        setRegisterMessage({
          type: "error",
          text: result.error || "Error enviando la solicitud"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setRegisterMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="login-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                {activeTab === "login" ? <LogIn className="h-6 w-6 text-white" /> : <Building2 className="h-6 w-6 text-white" />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "login" ? "Acceso al Sistema" : "Registro de Empresa"}
            </h2>
            <p className="text-gray-600">
              {activeTab === "login" 
                ? "¿Ya tienes cuenta? Ingresa tus credenciales" 
                : "¿Tu empresa aún no tiene cuenta? Solicita acceso aquí"
              }
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <Button
                variant={activeTab === "login" ? "default" : "outline"}
                className={`px-6 py-2 ${activeTab === "login" ? "bg-green-600 text-white" : "text-gray-600"}`}
                onClick={() => {
                  setActiveTab("login")
                  setError("")
                  setRegisterMessage(null)
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant={activeTab === "register" ? "default" : "outline"}
                className={`px-6 py-2 ${activeTab === "register" ? "bg-green-600 text-white" : "text-gray-600"}`}
                onClick={() => {
                  setActiveTab("register")
                  setError("")
                  setRegisterMessage(null)
                }}
              >
                Registrar Empresa
              </Button>
            </div>
          </div>

          {/* Login/Register Card */}
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
              {activeTab === "login" ? (
                // Login Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
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
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10 text-gray-700"
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
              ) : (
                // Register Form
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Información de la empresa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Información de la Empresa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-gray-700">Nombre de la Empresa *</Label>
                        <Input
                          id="company_name"
                          name="company_name"
                          type="text"
                          value={registerData.company_name}
                          onChange={handleRegisterInputChange}
                          placeholder="Ej: Cereales del Norte S.A."
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cuit" className="text-gray-700">CUIT *</Label>
                        <Input
                          id="cuit"
                          name="cuit"
                          type="text"
                          value={registerData.cuit}
                          onChange={handleRegisterInputChange}
                          placeholder="XX-XXXXXXXX-X"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-700">Dirección *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={registerData.address}
                        onChange={handleRegisterInputChange}
                        placeholder="Dirección completa de la empresa"
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Información de Contacto
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register_email" className="text-gray-700">Email Corporativo *</Label>
                        <Input
                          id="register_email"
                          name="email"
                          type="email"
                          value={registerData.email}
                          onChange={handleRegisterInputChange}
                          placeholder="contacto@empresa.com"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">Teléfono Empresa *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={registerData.phone}
                          onChange={handleRegisterInputChange}
                          placeholder="+54 11 1234-5678"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Persona de contacto */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Persona de Contacto
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_person" className="text-gray-700">Nombre Completo *</Label>
                        <Input
                          id="contact_person"
                          name="contact_person"
                          type="text"
                          value={registerData.contact_person}
                          onChange={handleRegisterInputChange}
                          placeholder="Juan Pérez"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone" className="text-gray-700">Teléfono Personal</Label>
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          type="tel"
                          value={registerData.contact_phone}
                          onChange={handleRegisterInputChange}
                          placeholder="+54 9 11 1234-5678"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {registerMessage && (
                    <Alert variant={registerMessage.type === "error" ? "destructive" : "default"} className={registerMessage.type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                      <AlertDescription className={registerMessage.type === "error" ? "text-red-800" : "text-green-800"}>
                        {registerMessage.text}
                      </AlertDescription>
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
                        Enviando solicitud...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Enviar Solicitud
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  {activeTab === "login" ? (
                    <>
                      <strong>¿Nuevo usuario?</strong><br />
                      Cambia a la pestaña "Registrar Empresa" para solicitar acceso
                    </>
                  ) : (
                    <>
                      <strong>¿Ya tienes cuenta?</strong><br />
                      Cambia a la pestaña "Iniciar Sesión" para acceder al sistema
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}