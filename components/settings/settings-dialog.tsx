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
import { Settings, Building2, CreditCard, Save, KeyRound } from "lucide-react"
import { ChangePasswordSection } from "@/components/profile/change-password-section"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [user, setUser] = useState<any>(null)
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
    subscription_plan: "basic",
  })
  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    autoBackup: true,
    maintenanceMode: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    
    // Cargar datos de la empresa cuando se abre el dialog
    if (open && currentUser?.company_id) {
      loadCompanyData(currentUser.company_id)
    }
  }, [open])

  const loadCompanyData = async (companyId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/companies/${companyId}`)
      if (response.ok) {
        const company = await response.json()
        setCompanyData({
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          tax_id: company.cuit || "",
          subscription_plan: company.subscription_plan || "basic",
        })
      } else {
        console.error("Error loading company data:", await response.text())
      }
    } catch (error) {
      console.error("Error loading company data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!user?.company_id) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/companies/${user.company_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          cuit: companyData.tax_id,
          subscription_plan: companyData.subscription_plan,
        }),
      })
      
      if (response.ok) {
        alert('Datos de empresa guardados exitosamente')
      } else {
        const errorData = await response.json()
        alert(`Error al guardar: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error("Error saving company data:", error)
      alert('Error de conexión al guardar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSystem = () => {
    // TODO: Implementar guardado de configuración del sistema
    console.log("Guardando configuración del sistema:", systemSettings)
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return <Badge className="bg-purple-100 text-purple-800">Enterprise - $299/mes</Badge>
      case "basic":
        return <Badge className="bg-blue-100 text-blue-800">Basic - $29/mes</Badge>
      case "free":
        return <Badge className="bg-gray-100 text-gray-800">Free - Gratis</Badge>
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

        <Tabs defaultValue="account" className="w-full">
          <TabsList className={`grid w-full ${canManageCompany && canManageSystem ? 'grid-cols-3' : canManageCompany || canManageSystem ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Cuenta
            </TabsTrigger>
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

          {/* Pestaña de Cuenta - Disponible para todos los usuarios */}
          <TabsContent value="account" className="space-y-6 text-gray-700">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Configuración de Cuenta</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona la seguridad y configuración de tu cuenta personal
                </p>
              </div>
              
              {/* Sección de cambio de contraseña */}
              {user && <ChangePasswordSection userId={user.id} />}
            </div>
          </TabsContent>

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
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <Input
                        id="company-phone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-tax">CUIT</Label>
                      <Input
                        id="company-tax"
                        value={companyData.tax_id}
                        onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                        disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                  <Button onClick={handleSaveCompany} className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
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
