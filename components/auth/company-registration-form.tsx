"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Mail, Phone, MapPin, CreditCard, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function CompanyRegistrationForm() {
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    cuit: "",
    contact_person: "",
    contact_phone: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/company-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Solicitud enviada exitosamente"
        })
        // Limpiar formulario
        setFormData({
          company_name: "",
          email: "",
          phone: "",
          address: "",
          cuit: "",
          contact_person: "",
          contact_phone: ""
        })
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error enviando la solicitud"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Empresa</h1>
          <p className="text-gray-600 mt-2">Solicita acceso al Sistema de Acopio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">Datos de la Empresa</CardTitle>
            <CardDescription className="text-gray-700">
              Complete todos los campos para solicitar acceso al sistema. 
              Recibirá una respuesta por email una vez que su solicitud sea revisada.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
              {/* Información de la empresa */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información de la Empresa
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-gray-700">
                    <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="Ej: Cereales del Norte S.A."
                      required
                      className="text-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuit">CUIT *</Label>
                    <Input
                      id="cuit"
                      name="cuit"
                      type="text"
                      value={formData.cuit}
                      onChange={handleInputChange}
                      placeholder="XX-XXXXXXXX-X"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa de la empresa"
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
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contacto@empresa.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono Empresa *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+54 11 1234-5678"
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
                    <Label htmlFor="contact_person">Nombre Completo *</Label>
                    <Input
                      id="contact_person"
                      name="contact_person"
                      type="text"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Teléfono Personal</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Login
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-600">
          <p>¿Ya tienes cuenta? <Link href="/login" className="text-green-600 hover:underline">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  )
}