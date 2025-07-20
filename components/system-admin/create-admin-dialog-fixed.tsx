"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { UserPlus } from "lucide-react"
import type { Company, User } from "@/types"

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdminCreated: (admin: User) => void
}

export function CreateAdminDialog({ open, onOpenChange, onAdminCreated }: CreateAdminDialogProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_id: "",
    role: "company_admin" as "company_admin" | "admin",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  // Cargar empresas cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadCompanies()
    }
  }, [open])

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error("Error cargando empresas:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Crear administrador usando la API real
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: "temp123", // Contraseña temporal - debería ser cambiada en el primer login
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          company_id: formData.company_id,
        }),
      })

      if (response.ok) {
        const newAdmin: User = {
          id: `user_${Date.now()}`,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: "",
          company_id: formData.company_id,
          role: formData.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        onAdminCreated(newAdmin)
        onOpenChange(false)

        // Reset form
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          company_id: "",
          role: "company_admin",
        })
      } else {
        const errorData = await response.json()
        console.error("Error creando administrador:", errorData.error)
        // TODO: Mostrar error al usuario
      }
    } catch (error) {
      console.error("Error creating admin:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Administrador
          </DialogTitle>
          <DialogDescription>Complete la información del administrador de empresa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Juan Carlos Pérez"
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
              placeholder="admin@empresa.com"
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
            <Label htmlFor="company">Empresa *</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Administrador *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as any })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_admin">Administrador de Empresa</SelectItem>
                <SelectItem value="admin">Administrador General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
