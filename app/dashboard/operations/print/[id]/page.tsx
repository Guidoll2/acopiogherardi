"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Truck, Package, Scale, Calendar, FileText } from "lucide-react"

export default function PrintOperationPage() {
  const params = useParams()
  const { operations, clients, drivers, silos, cerealTypes } = useData()
  const [operation, setOperation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const operationId = params.id as string

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

  useEffect(() => {
    if (operations && operationId) {
      const foundOperation = operations.find((op) => op.id === operationId)
      setOperation(foundOperation)
      setLoading(false)
      
      // Auto-print after component loads and operation is found
      if (foundOperation) {
        setTimeout(() => {
          window.print()
        }, 1500)
      }
    } else if (operations && operations.length > 0 && operationId) {
      // If operations are loaded but no operation found, stop loading
      setLoading(false)
    }
  }, [operations, operationId])

  if (loading || !operations) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando operación...</h2>
          <p className="text-sm text-gray-500">
            Preparando documento para impresión
          </p>
        </div>
      </div>
    )
  }

  if (!operation) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Operación no encontrada</h1>
          <p className="text-gray-600 mb-6">
            No se pudo encontrar la operación con ID: <span className="font-mono font-semibold">{operationId}</span>
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Posibles causas:</strong>
              <br />• La operación fue eliminada
              <br />• El ID es incorrecto
              <br />• No tienes permisos para ver esta operación
            </p>
          </div>
        </div>
      </div>
    )
  }

  const client = clients?.find((c) => c.id === operation.client_id) || 
    (operation.client_id?.startsWith('client-') ? clients?.[0] : null)
  const driver = drivers?.find((d) => d.id === operation.driver_id) || 
    (operation.driver_id?.startsWith('driver-') ? drivers?.[0] : null)
  const silo = silos?.find((s) => s.id === operation.silo_id) || 
    (operation.silo_id?.startsWith('silo-') ? silos?.[0] : null)
  const cereal = cerealTypes?.find((ct) => ct.id === operation.cereal_type_id) || 
    (operation.cereal_type_id?.startsWith('cereal-') ? cerealTypes?.[0] : null)

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending: "Pendiente",
      pendiente: "Pendiente",
      autorizar_acceso: "Autorizar Acceso",
      balanza_ingreso: "Balanza Ingreso",
      en_carga_descarga: "Carga/Descarga",
      balanza_egreso: "Balanza Egreso",
      autorizar_egreso: "Autorizar Egreso",
      completed: "Completado",
      completado: "Completado",
      in_progress: "En Progreso",
      cancelled: "Cancelado",
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: "bg-gray-100 text-gray-800",
      pendiente: "bg-gray-100 text-gray-800",
      autorizar_acceso: "bg-yellow-100 text-yellow-800",
      balanza_ingreso: "bg-blue-100 text-blue-800",
      en_carga_descarga: "bg-orange-100 text-orange-800",
      balanza_egreso: "bg-purple-100 text-purple-800",
      autorizar_egreso: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      completado: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 print:p-4 text-black">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 print:mb-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">4 Granos</h1>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Comprobante de Operación</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Generado el {new Date().toLocaleDateString("es-AR")} a las {new Date().toLocaleTimeString("es-AR")}
        </p>
      </div>

      {/* Operation Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 print:mb-6">
        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Operación #:</span>
              <p className="font-bold text-base sm:text-lg">{operation.id}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Tipo:</span>
              <br className="sm:hidden" />
              <Badge className={operation.operation_type === "ingreso" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                {operation.operation_type === "ingreso" ? "INGRESO" : "EGRESO"}
              </Badge>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Estado:</span>
              <br className="sm:hidden" />
              <Badge className={getStatusColor(operation.status)}>
                {getStatusLabel(operation.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Creado:</span>
              <p className="font-medium text-sm sm:text-base">{formatDate(operation.created_at || operation.createdAt)}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Actualizado:</span>
              <p className="font-medium text-sm sm:text-base">{formatDate(operation.updated_at, operation.created_at || operation.createdAt)}</p>
            </div>
            {operation.scheduled_date && (
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Programado:</span>
                <p className="font-medium text-sm sm:text-base">{new Date(operation.scheduled_date).toLocaleString("es-AR")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="print:border print:shadow-none sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Chasis:</span>
              <p className="font-bold text-base sm:text-lg font-mono">{operation.chassis_plate}</p>
            </div>
            {operation.trailer_plate && (
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Acoplado:</span>
                <p className="font-bold text-base sm:text-lg font-mono">{operation.trailer_plate}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client and Driver Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 print:mb-6">
        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Nombre:</span>
              <p className="font-bold text-base sm:text-lg break-words">{client?.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Email:</span>
              <p className="font-medium text-sm sm:text-base break-all">{client?.email || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Teléfono:</span>
              <p className="font-medium text-sm sm:text-base">{client?.phone || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Nombre:</span>
              <p className="font-bold text-base sm:text-lg break-words">{driver?.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Licencia:</span>
              <p className="font-medium font-mono text-sm sm:text-base">{driver?.license_number || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Teléfono:</span>
              <p className="font-medium text-sm sm:text-base">{driver?.phone || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product and Weight Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 print:mb-6">
        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Cereal:</span>
              <p className="font-bold text-base sm:text-lg">{cereal?.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Silo:</span>
              <p className="font-medium text-sm sm:text-base">{silo?.name || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Capacidad Silo:</span>
              <p className="font-medium text-sm sm:text-base">{silo?.capacity ? `${silo.capacity} t` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
              Pesos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Peso Bruto:</span>
              <p className="font-bold text-base sm:text-lg">{operation.gross_weight ? `${operation.gross_weight.toLocaleString()} kg` : "Pendiente"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Peso Tara:</span>
              <p className="font-bold text-base sm:text-lg">{operation.tare_weight ? `${operation.tare_weight.toLocaleString()} kg` : "Pendiente"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Peso Neto:</span>
              <p className="font-bold text-lg sm:text-xl text-green-600">{operation.net_weight ? `${operation.net_weight.toLocaleString()} kg` : "Pendiente"}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Cantidad:</span>
              <p className="font-bold text-lg sm:text-xl text-blue-600">{operation.quantity ? `${operation.quantity.toFixed(1)} t` : "Pendiente"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Analysis */}
      {(operation.moisture || operation.impurities || operation.test_weight) && (
        <Card className="mb-6 sm:mb-8 print:mb-6 print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Análisis de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Humedad</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{operation.moisture ? `${operation.moisture}%` : "N/A"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Impurezas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{operation.impurities ? `${operation.impurities}%` : "N/A"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Peso Hectolítrico</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{operation.test_weight ? `${operation.test_weight} kg/hl` : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {operation.notes && (
        <Card className="mb-6 sm:mb-8 print:mb-6 print:border print:shadow-none">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{operation.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer with signatures */}
      <div className="border-t pt-4 sm:pt-6 print:pt-4 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Firma del Operador</h3>
            <div className="border-b-2 border-gray-300 h-12 sm:h-16 mb-2"></div>
            <p className="text-xs sm:text-sm text-gray-600">Nombre y Apellido</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Firma del Conductor</h3>
            <div className="border-b-2 border-gray-300 h-12 sm:h-16 mb-2"></div>
            <p className="text-xs sm:text-sm text-gray-600">Nombre y Apellido</p>
          </div>
        </div>
        
        <div className="text-center mt-6 sm:mt-8 print:mt-6">
          <p className="text-xs text-gray-500">
            Este documento es válido como comprobante de operación - Sistema 4 Granos
          </p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:pt-4 {
            padding-top: 1rem !important;
          }
          
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
        }
        
        @media (max-width: 640px) {
          .break-words {
            word-break: break-word;
            overflow-wrap: anywhere;
          }
          
          .break-all {
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  )
}
