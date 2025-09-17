"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { useData } from "@/contexts/offline-data-context"
import { ArrowRight, Clock, RefreshCw, Eye, Printer, CheckCircle, AlertTriangle, Play } from "lucide-react"
import { OperationViewDialog } from "@/components/operations/operation-view-dialog"
import { OperationStatusDialog } from "@/components/operations/operation-status-dialog"

export function OperatorDashboard() {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [statusOperation, setStatusOperation] = useState<string | null>(null)
  const [advancingOperation, setAdvancingOperation] = useState<string | null>(null)

  const user = AuthService.getCurrentUser()
  const { operations, clients, silos, cerealTypes, updateOperation } = useData()

  // Filter only active operations (not completed)
  const activeOperations = operations
    .filter((op) => op.status !== "completado")
    .sort((a, b) => {
      const statusPriority = {
        pendiente: 1,
        autorizar_acceso: 2,
        balanza_ingreso: 3,
        en_carga_descarga: 4,
        balanza_egreso: 5,
        autorizar_egreso: 6,
      }
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999
      return aPriority - bPriority
    })

  // Define status flows
  const getStatusFlow = (operationType: string) => {
    const ingresoFlow = [
      { key: "pendiente", label: "Pendiente", next: "autorizar_acceso", nextLabel: "Autorizar Ingreso" },
      { key: "autorizar_acceso", label: "Autorizar Acceso", next: "balanza_ingreso", nextLabel: "Ir a Balanza" },
      { key: "balanza_ingreso", label: "Balanza (Bruto)", next: "en_carga_descarga", nextLabel: "Iniciar Descarga" },
      { key: "en_carga_descarga", label: "Descargando", next: "balanza_egreso", nextLabel: "Pesar Vacío" },
      { key: "balanza_egreso", label: "Balanza (Tara)", next: "autorizar_egreso", nextLabel: "Autorizar Salida" },
      { key: "autorizar_egreso", label: "Autorizar Egreso", next: "completado", nextLabel: "Completar" },
    ]

    const egresoFlow = [
      { key: "pendiente", label: "Pendiente", next: "autorizar_acceso", nextLabel: "Autorizar Ingreso" },
      { key: "autorizar_acceso", label: "Autorizar Acceso", next: "balanza_ingreso", nextLabel: "Ir a Balanza" },
      { key: "balanza_ingreso", label: "Balanza (Tara)", next: "en_carga_descarga", nextLabel: "Iniciar Carga" },
      { key: "en_carga_descarga", label: "Cargando", next: "balanza_egreso", nextLabel: "Pesar Cargado" },
      { key: "balanza_egreso", label: "Balanza (Bruto)", next: "autorizar_egreso", nextLabel: "Autorizar Salida" },
      { key: "autorizar_egreso", label: "Autorizar Egreso", next: "completado", nextLabel: "Completar" },
    ]

    return operationType === "ingreso" ? ingresoFlow : egresoFlow
  }

  // Function to advance operation
  const handleAdvanceOperation = async (operationId: string) => {
    const operation = operations.find((op) => op.id === operationId)
    if (!operation) return

    const statusFlow = getStatusFlow(operation.operation_type)
    const currentStep = statusFlow.find((step) => step.key === operation.status)

    if (!currentStep?.next) return

    setAdvancingOperation(operationId)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      updateOperation(operationId, {
        status: currentStep.next as any,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error al avanzar operación:", error)
    } finally {
      setAdvancingOperation(null)
    }
  }

  const getStatusBadge = (status: string, operationType?: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", color: "bg-gray-100 text-gray-800", icon: Clock },
      autorizar_acceso: { label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      balanza_ingreso: {
        label: operationType === "ingreso" ? "Balanza (Bruto)" : "Balanza (Tara)",
        color: "bg-blue-100 text-blue-800",
        icon: Play,
      },
      en_carga_descarga: {
        label: operationType === "ingreso" ? "Descargando" : "Cargando",
        color: "bg-orange-100 text-orange-800",
        icon: Play,
      },
      balanza_egreso: {
        label: operationType === "ingreso" ? "Balanza (Tara)" : "Balanza (Bruto)",
        color: "bg-purple-100 text-purple-800",
        icon: Play,
      },
      autorizar_egreso: { label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800", icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getAdvanceButton = (operation: any) => {
    const statusFlow = getStatusFlow(operation.operation_type)
    const currentStep = statusFlow.find((step) => step.key === operation.status)

    if (!currentStep?.next) return null

    const isAdvancing = advancingOperation === operation.id

    return (
      <Button
        size="sm"
        onClick={() => handleAdvanceOperation(operation.id)}
        disabled={isAdvancing}
        className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isAdvancing ? (
          <>
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <ArrowRight className="h-3 w-3 mr-1" />
            {currentStep.nextLabel}
          </>
        )}
      </Button>
    )
  }

  const handlePrint = (operationId: string) => {
    const printUrl = `/dashboard/operations/print/${operationId}`
    window.open(printUrl, "_blank", "width=800,height=600")
  }

  // Count operations by status
  const statusCounts = {
    pendiente: activeOperations.filter((op) => op.status === "pendiente").length,
    autorizar_acceso: activeOperations.filter((op) => op.status === "autorizar_acceso").length,
    balanza_ingreso: activeOperations.filter((op) => op.status === "balanza_ingreso").length,
    en_carga_descarga: activeOperations.filter((op) => op.status === "en_carga_descarga").length,
    balanza_egreso: activeOperations.filter((op) => op.status === "balanza_egreso").length,
    autorizar_egreso: activeOperations.filter((op) => op.status === "autorizar_egreso").length,
  }

  const totalActiveOperations = activeOperations.length
  const completedToday = operations.filter(
    (op) => op.status === "completado" && new Date(op.updated_at).toDateString() === new Date().toDateString(),
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Panel de Operador</h2>
            <p className="text-muted-foreground">
              Bienvenido, {user?.full_name}. Gestiona las operaciones activas que requieren tu atención.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operaciones Activas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveOperations}</div>
              <p className="text-xs text-muted-foreground">En proceso actualmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">Finalizadas en el día</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requieren Atención</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.pendiente + statusCounts.autorizar_acceso}</div>
              <p className="text-xs text-muted-foreground">Pendientes y autorizaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusCounts.balanza_ingreso + statusCounts.en_carga_descarga + statusCounts.balanza_egreso}
              </div>
              <p className="text-xs text-muted-foreground">En balanza y carga/descarga</p>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.pendiente}</div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.autorizar_acceso}</div>
              <div className="text-xs text-muted-foreground">Autorizar Acceso</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.balanza_ingreso}</div>
              <div className="text-xs text-muted-foreground">En Balanza</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.en_carga_descarga}</div>
              <div className="text-xs text-muted-foreground">Carga/Descarga</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.balanza_egreso}</div>
              <div className="text-xs text-muted-foreground">Pesaje Final</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{statusCounts.autorizar_egreso}</div>
              <div className="text-xs text-muted-foreground">Autorizar Salida</div>
            </div>
          </Card>
        </div>

        {/* Operations queue */}
        <Card>
          <CardHeader>
            <CardTitle>Cola de Operaciones Activas</CardTitle>
            <CardDescription>
              {activeOperations.length} operaciones requieren atención - Ordenadas por prioridad
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activeOperations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay operaciones activas</h3>
                <p>Todas las operaciones han sido completadas.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Cliente / Patente</TableHead>
                    <TableHead className="w-20">Tipo</TableHead>
                    <TableHead className="w-32">Estado</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-24">Actualizado</TableHead>
                    <TableHead className="w-48">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOperations.map((operation) => {
                    const client = clients.find((c) => c.id === operation.client_id)
                    const cereal = cerealTypes.find((ct) => ct.id === operation.cereal_type_id)

                    return (
                      <TableRow key={operation.id}>
                        <TableCell className="font-medium text-sm">#{operation.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{client?.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{operation.chassis_plate}</div>
                            <div className="text-xs text-muted-foreground">{cereal?.name || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              operation.operation_type === "ingreso"
                                ? "border-green-200 text-green-700"
                                : "border-orange-200 text-orange-700"
                            }
                          >
                            {operation.operation_type === "ingreso" ? "Ingreso" : "Egreso"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(operation.status, operation.operation_type)}</TableCell>
                        <TableCell className="text-sm">
                          {operation.quantity > 0 ? `${operation.quantity.toFixed(1)} t` : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(operation.updated_at).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getAdvanceButton(operation)}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setSelectedOperation(operation.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handlePrint(operation.id)}
                              title="Imprimir"
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setStatusOperation(operation.id)}
                              title="Cambiar estado"
                            >
                              Estado
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Silo status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Silos</CardTitle>
            <CardDescription>Ocupación actual de cada silo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {silos.map((silo) => {
                const cerealType = cerealTypes.find((ct) => ct.id === silo.cereal_type_id)
                const occupancy = (silo.current_stock / silo.capacity) * 100

                return (
                  <div key={silo.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{silo.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          silo.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {silo.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cerealType?.name || "Sin asignar"}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ocupación</span>
                        <span>{occupancy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            occupancy > 90 ? "bg-red-600" : occupancy > 70 ? "bg-yellow-600" : "bg-green-600"
                          }`}
                          style={{ width: `${occupancy}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{silo.current_stock}t</span>
                        <span>{silo.capacity}t</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <OperationViewDialog
          operationId={selectedOperation}
          open={!!selectedOperation}
          onOpenChange={(open) => !open && setSelectedOperation(null)}
        />

        <OperationStatusDialog
          operationId={statusOperation}
          open={!!statusOperation}
          onOpenChange={(open) => !open && setStatusOperation(null)}
        />
      </div>
    </DashboardLayout>
  )
}
