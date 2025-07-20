"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Phone, MapPin, CreditCard, Calendar, Users } from "lucide-react"
import type { Company } from "@/types"

interface ViewCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
}

export function ViewCompanyDialog({ open, onOpenChange, company }: ViewCompanyDialogProps) {
  if (!company) return null

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "basic":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "$299/mes"
      case "premium":
        return "$99/mes"
      case "basic":
        return "$29/mes"
      default:
        return "N/A"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl text-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalles de la Empresa
          </DialogTitle>
          <DialogDescription>
            Información completa de {company.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nombre</span>
                  </div>
                  <p className="text-lg font-semibold">{company.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">CUIT</span>
                  </div>
                  <p className="font-mono">{company.cuit}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p>{company.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </div>
                  <p>{company.phone || "No especificado"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dirección</span>
                </div>
                <p>{company.address || "No especificada"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estado y suscripción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estado y Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Estado</span>
                  <div>
                    <Badge
                      variant="secondary"
                      className={
                        company.status === "active"
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-red-500 text-red-700 bg-red-50"
                      }
                    >
                      {company.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Plan de Suscripción</span>
                  <div>
                    <Badge className={getPlanBadgeColor(company.subscription_plan)}>
                      {company.subscription_plan.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getPlanPrice(company.subscription_plan)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Registro</span>
                  </div>
                  <p className="text-sm">
                    {new Date(company.created_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{company.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
