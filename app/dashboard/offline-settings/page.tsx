"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OfflineSettings } from "@/components/ui/offline-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Wifi } from "lucide-react"

export default function OfflineSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Settings className="h-8 w-8" />
            <span>Configuración Offline</span>
          </h1>
          <p className="text-muted-foreground">
            Gestiona la funcionalidad offline, sincronización y almacenamiento local
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>Funcionalidad Offline</span>
            </CardTitle>
            <CardDescription>
              Esta aplicación puede funcionar sin conexión a internet. Los datos se almacenan localmente 
              y se sincronizan automáticamente cuando vuelve la conectividad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">✅ Funciona Offline</h4>
                <p className="text-green-600">Crear, editar y ver operaciones</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">🔄 Sincronización</h4>
                <p className="text-blue-600">Automática al volver online</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800">💾 Cache Local</h4>
                <p className="text-purple-600">Datos disponibles sin internet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <OfflineSettings />
      </div>
    </DashboardLayout>
  )
}
