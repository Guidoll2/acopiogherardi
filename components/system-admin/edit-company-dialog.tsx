"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Save, AlertTriangle, CheckCircle } from "lucide-react"
import type { Company } from "@/types"

interface EditCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
  onCompanyUpdated: (company: Company) => void
}

export function EditCompanyDialog({ open, onOpenChange, company, onCompanyUpdated }: EditCompanyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cuit: "",
    subscription_plan: "basic" as "basic" | "premium" | "enterprise",
    status: "active" as "active" | "inactive",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        cuit: company.cuit || "",
        subscription_plan: company.subscription_plan || "basic",
        status: company.status || "active",
        notes: company.notes || "",
      })
    }
  }, [company])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedCompany = await response.json()
        onCompanyUpdated(updatedCompany)
        
        setMessage({
          type: "success",
          text: "Empresa actualizada exitosamente"
        })

        // Cerrar diálogo después de 2 segundos
        setTimeout(() => {
          onOpenChange(false)
          setMessage(null)
        }, 2000)
        
      } else {
        const errorData = await response.json()
        setMessage({
          type: "error",
          text: errorData.error || "Error al actualizar la empresa"
        })
      }
    } catch (error) {
      console.error("Error updating company:", error)
      setMessage({
        type: "error",
        text: "Error de conexión. Por favor, intenta de nuevo."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setMessage(null)
    onOpenChange(false)
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Editar Empresa
          </DialogTitle>
          <DialogDescription>
            Modifica la información de {company.name}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información General</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT *</Label>
                <Input
                  id="cuit"
                  value={formData.cuit}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  placeholder="20-12345678-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
          </div>

          {/* Estado y suscripción */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estado y Suscripción</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_plan">Plan de Suscripción</Label>
                <Select value={formData.subscription_plan} onValueChange={(value: "basic" | "premium" | "enterprise") => setFormData({ ...formData, subscription_plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic ($29/mes)</SelectItem>
                    <SelectItem value="premium">Premium ($99/mes)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($299/mes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre la empresa..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
