"use client"

import { useEffect, useState } from "react"
import { useData } from "@/contexts/offline-data-context"

interface OperationPrintProps {
  operationId: string
}

export function OperationPrint({ operationId }: OperationPrintProps) {
  const { operations, clients, drivers, silos, cerealTypes } = useData()
  const [operation, setOperation] = useState<any>(null)

  useEffect(() => {
    // Find operation or use mock data
    const foundOperation = operations?.find((op) => op.id === operationId) || {
      id: operationId,
      client_id: "1",
      operation_type: "ingreso",
      status: "completado",
      chassis_plate: "ABC123",
      trailer_plate: "TRL456",
      quantity: 25.5,
      tare_weight: 8500,
      gross_weight: 34000,
      net_weight: 25500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cereal_type_id: "1",
      silo_id: "1",
      driver_id: "1",
      notes: "Operación de prueba para impresión",
    }

    setOperation(foundOperation)

    // Auto print when component loads
    const timer = setTimeout(() => {
      window.print()
    }, 1000)

    return () => clearTimeout(timer)
  }, [operationId, operations])

  if (!operation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando operación...</p>
        </div>
      </div>
    )
  }

  const client = clients?.find((c) => c.id === operation.client_id) || { name: "Cliente de Prueba" }
  const driver = drivers?.find((d) => d.id === operation.driver_id) || {
    name: "Conductor de Prueba",
    license_number: "12345678",
  }
  const silo = silos?.find((s) => s.id === operation.silo_id) || { name: "Silo A1" }
  const cereal = cerealTypes?.find((ct) => ct.id === operation.cereal_type_id) || { name: "Soja", code: "SOJ" }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-2xl font-bold mb-2">TICKET DE OPERACIÓN</h1>
        <p className="text-lg">CuatroGranos S.A.</p>
        <p className="text-sm text-gray-600">Sistema de Gestión de Acopio</p>
      </div>

      {/* Operation Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Información de la Operación</h2>
          <div className="space-y-2">
            <p>
              <strong>Nº Operación:</strong> #{operation.id}
            </p>
            <p>
              <strong>Tipo:</strong> {operation.operation_type === "ingreso" ? "INGRESO" : "EGRESO"}
            </p>
            <p>
              <strong>Estado:</strong> {operation.status}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(operation.created_at).toLocaleDateString("es-AR")}
            </p>
            <p>
              <strong>Hora:</strong> {new Date(operation.created_at).toLocaleTimeString("es-AR")}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Cliente y Producto</h2>
          <div className="space-y-2">
            <p>
              <strong>Cliente:</strong> {client.name}
            </p>
            <p>
              <strong>Cereal:</strong> {cereal.name} ({cereal.code})
            </p>
            <p>
              <strong>Silo:</strong> {silo.name}
            </p>
            <p>
              <strong>Cantidad:</strong> {operation.quantity.toFixed(2)} toneladas
            </p>
          </div>
        </div>
      </div>

      {/* Transport Info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Información del Transporte</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p>
              <strong>Conductor:</strong> {driver.name}
            </p>
            <p>
              <strong>Licencia:</strong> {driver.license_number}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Chasis:</strong> {operation.chassis_plate}
            </p>
            <p>
              <strong>Acoplado:</strong> {operation.trailer_plate || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Weight Info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Información de Pesaje</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center border p-4">
            <p className="text-sm text-gray-600">Tara</p>
            <p className="text-xl font-bold">{operation.tare_weight.toLocaleString()} kg</p>
          </div>
          <div className="text-center border p-4">
            <p className="text-sm text-gray-600">Peso Bruto</p>
            <p className="text-xl font-bold">{operation.gross_weight.toLocaleString()} kg</p>
          </div>
          <div className="text-center border p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Peso Neto</p>
            <p className="text-xl font-bold">{operation.net_weight.toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {operation.notes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Observaciones</h2>
          <p className="border p-4 bg-gray-50">{operation.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p>Documento generado automáticamente el {new Date().toLocaleString("es-AR")}</p>
        <p>CuatroGranos S.A. - Sistema de Gestión de Acopio</p>
      </div>
    </div>
  )
}
