"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, Truck, Warehouse, Wheat, Scale, Droplets, AlertCircle } from "lucide-react"
import { useData } from "@/contexts/offline-data-context"

interface OperationViewDialogProps {
  operationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationViewDialog({ operationId, open, onOpenChange }: OperationViewDialogProps) {
  const { operations, clients, drivers, silos, cerealTypes } = useData()

  console.log("🔍 OperationViewDialog props:", { operationId, open })
  console.log("📊 Operations available:", operations?.length || 0)

  const operation = operations?.find((op) => op.id === operationId)
  
  // Helper function to safely format dates
  const formatDate = (dateValue: string | undefined | null, fallback?: string): string => {
    try {
      const date = new Date(dateValue || fallback || new Date())
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString("es-AR")
      }
      return date.toLocaleString("es-AR")
    } catch (error) {
      console.warn("Error formatting date:", error)
      return new Date().toLocaleString("es-AR")
    }
  }
  
  // Función helper para encontrar entidades con fallback para IDs de ejemplo
  const findEntityWithFallback = (entities: any[], targetId: string, entityType: string) => {
    if (!entities || !targetId) return null
    
    // Primero buscar por ID exacto
    let found = entities.find((entity) => entity.id === targetId)
    if (found) return found
    
    // Si no se encuentra y es un ID de ejemplo, usar el primer disponible
    if (targetId.startsWith(entityType.toLowerCase() + '-')) {
      console.log(`🔄 Using fallback for ${entityType} ID: ${targetId} -> using first available`)
      return entities[0] || null
    }
    
    return null
  }
  
  const client = operation ? findEntityWithFallback(clients, operation.client_id, 'client') : null
  const driver = operation ? findEntityWithFallback(drivers, operation.driver_id, 'driver') : null
  const silo = operation ? findEntityWithFallback(silos, operation.silo_id, 'silo') : null
  const cereal = operation ? findEntityWithFallback(cerealTypes, operation.cereal_type_id, 'cereal') : null

  console.log("🔍 Found operation:", operation ? operation.id : "not found")
  
  // DEBUG: Solo mostrar cuando se encuentra la operación y hay logs útiles
  if (operation && operationId) {
    console.log("✅ Data mapping results:", {
      client: client ? `FOUND: ${client.name}` : `NOT FOUND`,
      driver: driver ? `FOUND: ${driver.name}` : `NOT FOUND`,
      silo: silo ? `FOUND: ${silo.name}` : `NOT FOUND`,
      cereal: cereal ? `FOUND: ${cereal.name}` : `NOT FOUND`
    })
  }  if (!operation) {
    console.log("❌ No operation found for ID:", operationId)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Operación no encontrada</DialogTitle>
            <DialogDescription>
              No se pudo encontrar la operación con ID: {operationId}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      pending: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      autorizar_acceso: { label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800" },
      balanza_ingreso: { label: "Balanza Ingreso", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "Carga/Descarga", color: "bg-orange-100 text-orange-800" },
      balanza_egreso: { label: "Balanza Egreso", color: "bg-purple-100 text-purple-800" },
      autorizar_egreso: { label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800" },
      completado: { label: "Completado", color: "bg-green-100 text-green-800" },
      completed: { label: "Completado", color: "bg-green-100 text-green-800" },
      in_progress: { label: "En Progreso", color: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return <Badge className={`${config.color} text-xs sm:text-sm px-2 py-1`}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant="secondary"
        className={`text-xs sm:text-sm px-2 py-1 font-medium ${
          type === "ingreso" ? "border-green-200 text-green-700 bg-green-50" : "border-orange-200 text-orange-700 bg-orange-50"
        }`}
      >
        {type === "ingreso" ? "INGRESO" : "EGRESO"}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-none md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 text-gray-700">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <Scale className="h-5 w-5 md:h-6 md:w-6" />
            <span className="break-all">Operación #{operation.id}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base md:text-lg">
            Información detallada de la operación y su estado actual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Header with status and type */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {getTypeBadge(operation.operation_type)}
              {getStatusBadge(operation.status)}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Creado: {formatDate(operation.created_at || operation.createdAt)}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
            {/* Client and Driver Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Cliente</label>
                  <p className="font-medium text-sm sm:text-base md:text-lg break-words">{client?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Email</label>
                  <p className="text-sm sm:text-base md:text-lg break-all">{client?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-sm sm:text-base md:text-lg">{client?.phone || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Conductor</label>
                  <p className="font-medium text-sm sm:text-base md:text-lg break-words">{driver?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Licencia</label>
                  <p className="text-sm sm:text-base md:text-lg">{driver?.license_number || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle and Cereal Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Truck className="h-4 w-4 md:h-5 md:w-5" />
                  Información del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Patente Chasis</label>
                  <p className="font-medium text-sm sm:text-base md:text-lg font-mono">{operation.chassis_plate}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Patente Acoplado</label>
                  <p className="text-sm sm:text-base md:text-lg font-mono">{operation.trailer_plate || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Cereal</label>
                  <p className="font-medium text-sm sm:text-base md:text-lg flex items-center gap-2 break-words">
                    <Wheat className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    {cereal?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Silo Asignado</label>
                  <p className="text-sm sm:text-base md:text-lg flex items-center gap-2 break-words">
                    <Warehouse className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    {silo?.name || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Scale className="h-4 w-4 md:h-5 md:w-5" />
                Información de Pesaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
                <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">
                    {operation.tare_weight > 0 ? `${operation.tare_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Tara (kg)</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">Camión vacío</div>
                </div>
                <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">
                    {operation.gross_weight > 0 ? `${operation.gross_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Bruto (kg)</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">Camión cargado</div>
                </div>
                <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">
                    {operation.net_weight > 0 ? `${operation.net_weight.toLocaleString()}` : "-"}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Neto (kg)</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">Cereal puro</div>
                </div>
                <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-600">
                    {operation.quantity > 0 ? `${operation.quantity.toFixed(1)}` : "-"}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Toneladas</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">Cantidad final</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Information */}
          {(operation.moisture || operation.impurities || operation.test_weight) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Droplets className="h-4 w-4 md:h-5 md:w-5" />
                  Análisis de Calidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
                  <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">
                      {operation.moisture ? `${operation.moisture}%` : "-"}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Humedad</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600">
                      {operation.impurities ? `${operation.impurities}%` : "-"}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Impurezas</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">
                      {operation.test_weight ? `${operation.test_weight} kg/hl` : "-"}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Peso Hectolítrico</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline and Notes */}
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  Cronología
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium">Creado</p>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                      {formatDate(operation.created_at || operation.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium">Última Actualización</p>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                      {formatDate(operation.updated_at, operation.created_at || operation.createdAt)}
                    </p>
                  </div>
                </div>
                {operation.scheduled_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium">Fecha Programada</p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                        {formatDate(operation.scheduled_date)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[100px] md:min-h-[150px] p-3 md:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {operation.notes || "Sin observaciones registradas."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
