"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, Truck, Warehouse, Wheat, Scale, Droplets, AlertCircle } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface OperationViewDialogProps {
  operationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationViewDialog({ operationId, open, onOpenChange }: OperationViewDialogProps) {
  const { operations, clients, drivers, silos, cerealTypes } = useData()

  const operation = operations.find((op) => op.id === operationId)
  const client = operation ? clients.find((c) => c.id === operation.client_id) : null
  const driver = operation ? drivers.find((d) => d.id === operation.driver_id) : null
  const silo = operation ? silos.find((s) => s.id === operation.silo_id) : null
  const cereal = operation ? cerealTypes.find((ct) => ct.id === operation.cereal_type_id) : null

  if (!operation) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      autorizar_acceso: { label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800" },
      balanza_ingreso: { label: "Balanza Ingreso", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "Carga/Descarga", color: "bg-orange-100 text-orange-800" },
      balanza_egreso: { label: "Balanza Egreso", color: "bg-purple-100 text-purple-800" },
      autorizar_egreso: { label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800" },
      completado: { label: "Completado", color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant="secondary"
        className={type === "ingreso" ? "border-green-200 text-green-700" : "border-orange-200 text-orange-700"}
      >
        {type === "ingreso" ? "INGRESO" : "EGRESO"}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Operación #{operation.id} - Detalles Completos
          </DialogTitle>
          <DialogDescription>Información detallada de la operación y su estado actual</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with status and type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTypeBadge(operation.operation_type)}
              {getStatusBadge(operation.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              Creado: {new Date(operation.created_at).toLocaleString("es-AR")}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Client and Driver Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="font-medium">{client?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{client?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p>{client?.phone || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Conductor</label>
                  <p className="font-medium">{driver?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Licencia</label>
                  <p>{driver?.license_number || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle and Cereal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Información del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patente Chasis</label>
                  <p className="font-medium">{operation.chassis_plate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patente Acoplado</label>
                  <p>{operation.trailer_plate || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cereal</label>
                  <p className="font-medium flex items-center gap-2">
                    <Wheat className="h-4 w-4" />
                    {cereal?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Silo Asignado</label>
                  <p className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    {silo?.name || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Información de Pesaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {operation.tare_weight > 0 ? `${operation.tare_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Tara (kg)</div>
                  <div className="text-xs text-muted-foreground mt-1">Camión vacío</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {operation.gross_weight > 0 ? `${operation.gross_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Bruto (kg)</div>
                  <div className="text-xs text-muted-foreground mt-1">Camión cargado</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {operation.net_weight > 0 ? `${operation.net_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Neto (kg)</div>
                  <div className="text-xs text-muted-foreground mt-1">Cereal puro</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {operation.quantity > 0 ? `${operation.quantity.toFixed(1)}` : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Toneladas</div>
                  <div className="text-xs text-muted-foreground mt-1">Cantidad final</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Information */}
          {(operation.moisture || operation.impurities || operation.test_weight) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Análisis de Calidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {operation.moisture ? `${operation.moisture}%` : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">Humedad</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {operation.impurities ? `${operation.impurities}%` : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">Impurezas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {operation.test_weight ? `${operation.test_weight} kg/hl` : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">Peso Hectolítrico</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline and Notes */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cronología
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Creado</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(operation.created_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Última Actualización</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(operation.updated_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
                {operation.scheduled_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha Programada</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(operation.scheduled_date).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[100px] p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{operation.notes || "Sin observaciones registradas."}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
