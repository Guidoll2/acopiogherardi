"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { Settings, Building2, CreditCard, Save } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [user, setUser] = useState<any>(null)
  const [companyData, setCompanyData] = useState({
    name: "Acopio Central S.A.",
    email: "admin@acopio.com",
    phone: "+54 11 4567-8900",
    address: "Av. Libertador 1234, Buenos Aires",
    tax_id: "30-12345678-9",
    subscription_plan: "premium",
  })
  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    autoBackup: true,
    maintenanceMode: false,
  })

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleSaveCompany = () => {
    // TODO: Implementar guardado de datos de empresa
    console.log("Guardando datos de empresa:", companyData)
  }

  const handleSaveSystem = () => {
    // TODO: Implementar guardado de configuración del sistema
    console.log("Guardando configuración del sistema:", systemSettings)
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return <Badge className="bg-purple-100 text-purple-800">Enterprise - $299/mes</Badge>
      case "premium":
        return <Badge className="bg-blue-100 text-blue-800">Premium - $99/mes</Badge>
      case "basic":
        return <Badge className="bg-gray-100 text-gray-800">Basic - $29/mes</Badge>
      default:
        return <Badge variant="secondary">Plan desconocido</Badge>
    }
  }

  // Solo mostrar configuración de empresa para administradores de empresa
  const canManageCompany = user?.role === "admin" || user?.role === "company_admin"
  // Solo mostrar configuración del sistema para administradores del sistema
  const canManageSystem = user?.role === "system_admin"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto text-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
          <DialogDescription>Gestiona la configuración de la empresa y del sistema</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={canManageCompany ? "company" : "system"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {canManageCompany && (
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </TabsTrigger>
            )}
            {canManageSystem && (
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            )}
          </TabsList>

          {canManageCompany && (
            <TabsContent value="company" className="space-y-6">
              <Card className="text-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información de la Empresa
                  </CardTitle>
                  <CardDescription>Actualiza los datos de tu empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nombre de la Empresa</Label>
                      <Input
                        id="company-name"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <Input
                        id="company-phone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-tax">CUIT</Label>
                      <Input
                        id="company-tax"
                        value={companyData.tax_id}
                        onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Dirección</Label>
                    <Textarea
                      id="company-address"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleSaveCompany} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plan de Suscripción
                  </CardTitle>
                  <CardDescription>Información sobre tu plan actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Plan Actual</p>
                      <p className="text-sm text-muted-foreground">Renovación automática</p>
                    </div>
                    {getPlanBadge(companyData.subscription_plan)}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full bg-transparent">
                      Cambiar Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canManageSystem && (
            <TabsContent value="system" className="space-y-6 text-gray-700">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Sistema
                  </CardTitle>
                  <CardDescription>Configuración global del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones</p>
                      <p className="text-sm text-muted-foreground">Enviar notificaciones por email</p>
                    </div>
                    <Button
                      variant={systemSettings.notifications ? "default" : "outline"}
                      onClick={() =>
                        setSystemSettings({ ...systemSettings, notifications: !systemSettings.notifications })
                      }
                    >
                      {systemSettings.notifications ? "Activado" : "Desactivado"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Backup Automático</p>
                      <p className="text-sm text-muted-foreground">Realizar backups diarios</p>
                    </div>
                    <Button
                      variant={systemSettings.autoBackup ? "default" : "outline"}
                      onClick={() => setSystemSettings({ ...systemSettings, autoBackup: !systemSettings.autoBackup })}
                    >
                      {systemSettings.autoBackup ? "Activado" : "Desactivado"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Modo Mantenimiento</p>
                      <p className="text-sm text-muted-foreground">Deshabilitar acceso temporal</p>
                    </div>
                    <Button
                      variant={systemSettings.maintenanceMode ? "default" : "outline"}
                      onClick={() =>
                        setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })
                      }
                    >
                      {systemSettings.maintenanceMode ? "Activado" : "Desactivado"}
                    </Button>
                  </div>
                  <Button onClick={handleSaveSystem} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
