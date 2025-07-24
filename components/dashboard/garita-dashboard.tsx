"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { useData } from "@/contexts/offline-data-context"
import { RefreshCw, Truck, Users, LogIn, LogOut, Clock } from "lucide-react"

export function GaritaDashboard() {
  type UserRole = "admin" | "system_admin" | "company_admin" | "garita"
  const user = AuthService.getCurrentUser() as (ReturnType<typeof AuthService.getCurrentUser> & { role: UserRole }) | null
  const isGarita = user?.role === "garita"
  const { operations, clients, drivers, companies, updateOperation } = useData()
  const [processingOperation, setProcessingOperation] = useState<string | null>(null)

  // Verificar que el usuario sea de garita
  if (!user || user.role !== "garita") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Acceso denegado. Solo usuarios de garita pueden ver esta página.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Filtrar operaciones activas para garita (las que están en proceso de ingreso/egreso)
  const relevantOperations = operations
    .filter((op) =>
      ["autorizar_acceso", "balanza_ingreso", "en_carga_descarga", "balanza_egreso", "autorizar_egreso"].includes(
        op.status,
      ),
    )
    .sort((a, b) => {
      // Priorizar las que necesitan acción de garita
      const needsGaritaAction = (status: string) => ["autorizar_acceso", "autorizar_egreso"].includes(status)
      if (needsGaritaAction(a.status) && !needsGaritaAction(b.status)) return -1
      if (!needsGaritaAction(a.status) && needsGaritaAction(b.status)) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      autorizar_acceso: { label: "Esperando Ingreso", color: "bg-yellow-100 text-yellow-800" },
      autorizar_egreso: { label: "Esperando Salida", color: "bg-orange-100 text-orange-800" },
      balanza_ingreso: { label: "En Planta", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "En Proceso", color: "bg-purple-100 text-purple-800" },
      balanza_egreso: { label: "Proceso Completo", color: "bg-green-100 text-green-800" },
      completado: { label: "Salió de Planta", color: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? <Badge className={config.color}>{config.label}</Badge> : null
  }

  const handleAccessControl = async (operationId: string, action: "ingreso" | "salida") => {
    setProcessingOperation(operationId)

    try {
      // Simular delay de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const operation = operations.find((op) => op.id === operationId)
      if (!operation) return

      // Determinar el siguiente estado según la acción
      let nextStatus
      if (action === "ingreso" && operation.status === "autorizar_acceso") {
        nextStatus = "balanza_ingreso"
      } else if (action === "salida" && operation.status === "autorizar_egreso") {
        nextStatus = "completado"
      }

      if (nextStatus) {
        updateOperation(operationId, {
          status: nextStatus as any,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error al procesar acceso:", error)
    } finally {
      setProcessingOperation(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-red-400">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Control de Garita</h2>
            <p className="text-muted-foreground">
              Bienvenido, {user?.full_name}. Control de ingreso y egreso de vehículos.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Resumen rápido */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-green-100">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{relevantOperations.length}</p>
                <p className="text-sm text-muted-foreground">Operaciones Activas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(relevantOperations.map((op) => op.driver_id)).size}</p>
                <p className="text-sm text-muted-foreground">Choferes en Planta</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de operaciones para garita */}
        <Card>
          <CardHeader>
            <CardTitle>Control de Acceso - Portería</CardTitle>
            <CardDescription>
              Registra el ingreso y salida física de vehículos - {relevantOperations.length} operaciones en seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Operación</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Patente Chasis</TableHead>
                  <TableHead>Patente Acoplado</TableHead>
                  <TableHead className="w-32">Estado</TableHead>
                  <TableHead className="w-24">Hora</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay operaciones pendientes de autorización
                    </TableCell>
                  </TableRow>
                ) : (
                  relevantOperations.map((operation) => {
                    const client = clients.find((c) => c.id === operation.client_id)
                    const driver = drivers.find((d) => d.id === operation.driver_id)
                    const company = companies.find((c) => c.id === operation.company_id)

                    return (
                      <TableRow key={operation.id}>
                        <TableCell className="font-medium">#{operation.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{client?.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{company?.name || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{driver?.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{driver?.license_number || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{operation.chassis_plate}</TableCell>
                        <TableCell className="font-mono text-sm">{operation.trailer_plate || "-"}</TableCell>
                        <TableCell>{getStatusBadge(operation.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(operation.updated_at).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {operation.status === "autorizar_acceso" && (
                              <Button
                                size="sm"
                                onClick={() => handleAccessControl(operation.id, "ingreso")}
                                disabled={processingOperation === operation.id}
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                {processingOperation === operation.id ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <LogIn className="h-3 w-3 mr-1" />
                                    INGRESO
                                  </>
                                )}
                              </Button>
                            )}
                            {operation.status === "autorizar_egreso" && (
                              <Button
                                size="sm"
                                onClick={() => handleAccessControl(operation.id, "salida")}
                                disabled={processingOperation === operation.id}
                                className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                              >
                                {processingOperation === operation.id ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <LogOut className="h-3 w-3 mr-1" />
                                    SALIDA
                                  </>
                                )}
                              </Button>
                            )}
                            {!["autorizar_acceso", "autorizar_egreso"].includes(operation.status) && (
                              <span className="text-xs text-muted-foreground px-2 py-1">
                                {operation.status === "balanza_ingreso" && "En planta"}
                                {operation.status === "en_carga_descarga" && "Procesando"}
                                {operation.status === "balanza_egreso" && "Listo para salir"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • <strong>Esperando Ingreso:</strong> Vehículo autorizado, presionar INGRESO cuando llegue
              </p>
              <p>
                • <strong>Esperando Salida:</strong> Vehículo listo para salir, presionar SALIDA cuando se retire
              </p>
              <p>• Verificar que las patentes coincidan con la documentación</p>
              <p>• En caso de dudas, contactar al supervisor de turno</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
