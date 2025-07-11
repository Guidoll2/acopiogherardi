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
import { Building2 } from "lucide-react"
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
        onOpenChange(false)

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          cuit: "",
          subscription_plan: "basic",
        })
      } else {
        const errorData = await response.json()
        console.error("Error creando empresa:", errorData.error)
        // TODO: Mostrar error al usuario
      }
    } catch (error) {
      console.error("Error creating company:", error)
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
          <DialogDescription>Complete la información de la nueva empresa.</DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@empresa.com"
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
