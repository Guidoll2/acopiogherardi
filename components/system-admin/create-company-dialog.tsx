"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Mail, CheckCircle, AlertTriangle, Copy } from "lucide-react"
import type { Company } from "@/types"

interface CreateCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyCreated: (company: Company) => void
}

export function CreateCompanyDialog({ open, onOpenChange, onCompanyCreated }: CreateCompanyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cuit: "",
    subscription_plan: "basic" as "basic" | "premium" | "enterprise",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  const copyCredentials = () => {
    if (credentials) {
      const text = `Credenciales de acceso - ${formData.name}\nEmail: ${credentials.email}\nContraseña: ${credentials.password}\n\nURL de acceso: ${window.location.origin}/login`
      navigator.clipboard.writeText(text)
      alert("Credenciales copiadas al portapapeles")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Crear empresa usando la API real
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        onCompanyCreated(data.company)
        
        // Guardar las credenciales para mostrarlas
        setCredentials({
          email: data.adminUser?.email || formData.email,
          password: data.temporaryPassword
        })
        
        setMessage({
          type: "success",
          text: `Empresa "${formData.name}" creada exitosamente. Guarda las credenciales mostradas abajo para entregar al cliente.`
        })

        // Cerrar diálogo después de 10 segundos para dar tiempo a copiar credenciales
        setTimeout(() => {
          onOpenChange(false)
          setMessage(null)
          setCredentials(null)
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            cuit: "",
            subscription_plan: "basic",
          })
        }, 10000)
        
      } else {
        const errorData = await response.json()
        console.error("Error creando empresa:", errorData.error)
        setMessage({
          type: "error",
          text: errorData.error || "Error al crear la empresa"
        })
      }
    } catch (error) {
      console.error("Error creating company:", error)
      setMessage({
        type: "error",
        text: "Error inesperado al crear la empresa. Por favor, intenta de nuevo."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear Nueva Empresa
          </DialogTitle>
          <DialogDescription>
            Complete la información de la nueva empresa. Se creará automáticamente un usuario administrador y se mostrarán las credenciales para entrega manual.
          </DialogDescription>
        </DialogHeader>

        {message && (
          <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Mostrar credenciales cuando la empresa se crea exitosamente */}
        {credentials && (
          <Alert className="border-blue-500 bg-blue-50">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-blue-700">
              <div className="space-y-3">
                <p className="font-semibold">Credenciales del Administrador:</p>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  <p><strong>Email:</strong> {credentials.email}</p>
                  <p><strong>Contraseña:</strong> {credentials.password}</p>
                  <p><strong>URL:</strong> {window.location.origin}/login</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyCredentials}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar Credenciales
                  </Button>
                </div>
                <p className="text-xs">⚠️ Guarda estas credenciales para entregarlas al cliente. La ventana se cerrará automáticamente en 10 segundos.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Empresa S.A."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email * (se enviarán las credenciales aquí)</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@empresa.com"
                required
                className="pr-10"
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              📧 Se creará automáticamente un usuario administrador y se enviarán las credenciales de acceso a este email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle 123, Ciudad, Provincia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuit">CUIT *</Label>
            <Input
              id="cuit"
              value={formData.cuit}
              onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
              placeholder="30-12345678-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription_plan">Plan de Suscripción *</Label>
            <Select
              value={formData.subscription_plan}
              onValueChange={(value) => setFormData({ ...formData, subscription_plan: value as any })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico - $29/mes</SelectItem>
                <SelectItem value="premium">Premium - $99/mes</SelectItem>
                <SelectItem value="enterprise">Enterprise - $299/mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
