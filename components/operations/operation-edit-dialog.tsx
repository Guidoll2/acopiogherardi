"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X } from "lucide-react"
import { useData } from "@/contexts/offline-data-context"

interface OperationEditDialogProps {
  operationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationEditDialog({ operationId, open, onOpenChange }: OperationEditDialogProps) {
  const { operations, clients, drivers, silos, cerealTypes, updateOperation } = useData()
  const operation = operations?.find((op) => op.id === operationId)
  
  // Función helper para encontrar entidades con fallback
  const findEntityWithFallback = (entities: any[], targetId: string, entityType: string) => {
    if (!entities || !targetId) return null
    
    // Primero buscar por ID exacto
    let found = entities.find((entity) => entity.id === targetId)
    if (found) return found
    
    // Si no se encuentra y es un ID de ejemplo, usar el primer disponible
    if (targetId.startsWith(entityType.toLowerCase() + '-')) {
      return entities[0] || null
    }
    
    return null
  }

  const [formData, setFormData] = useState({
    client_id: "",
    driver_id: "",
    silo_id: "",
    cereal_type_id: "",
    operation_type: "ingreso" as "ingreso" | "egreso",
    chassis_plate: "",
    trailer_plate: "",
    quantity: "",
    tare_weight: "",
    gross_weight: "",
    net_weight: "",
    moisture: "",
    impurities: "",
    test_weight: "",
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (operation) {
      setFormData({
        client_id: operation.client_id || "",
        driver_id: operation.driver_id || "",
        silo_id: operation.silo_id || "",
        cereal_type_id: operation.cereal_type_id || "",
        operation_type: operation.operation_type || "ingreso",
        chassis_plate: operation.chassis_plate || "",
        trailer_plate: operation.trailer_plate || "",
        quantity: operation.quantity ? operation.quantity.toString() : "",
        tare_weight: operation.tare_weight ? operation.tare_weight.toString() : "",
        gross_weight: operation.gross_weight ? operation.gross_weight.toString() : "",
        net_weight: operation.net_weight ? operation.net_weight.toString() : "",
        moisture: operation.moisture ? operation.moisture.toString() : "",
        impurities: operation.impurities ? operation.impurities.toString() : "",
        test_weight: operation.test_weight ? operation.test_weight.toString() : "",
        notes: operation.notes || "",
      })
    }
  }, [operation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!operation) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedData = {
        client_id: formData.client_id,
        driver_id: formData.driver_id,
        silo_id: formData.silo_id,
        cereal_type: formData.cereal_type_id,
        operation_type: formData.operation_type,
        chassis_plate: formData.chassis_plate,
        trailer_plate: formData.trailer_plate,
        quantity: formData.quantity ? Number.parseFloat(formData.quantity) : 0,
        tare_weight: formData.tare_weight ? Number.parseInt(formData.tare_weight) : 0,
        gross_weight: formData.gross_weight ? Number.parseInt(formData.gross_weight) : 0,
        net_weight: formData.net_weight ? Number.parseInt(formData.net_weight) : 0,
        moisture: formData.moisture ? Number.parseFloat(formData.moisture) : undefined,
        impurities: formData.impurities ? Number.parseFloat(formData.impurities) : undefined,
        test_weight: formData.test_weight ? Number.parseFloat(formData.test_weight) : undefined,
        notes: formData.notes,
      }

      updateOperation(operation.id, updatedData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating operation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!operation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-gray-700">
        <DialogHeader>
          <DialogTitle>Editar Operación #{operation.id}</DialogTitle>
          <DialogDescription>
            Modifica los datos de la operación. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>

              <div className="space-y-2">
                <Label htmlFor="operation_type">Tipo de Operación *</Label>
                <Select
                  value={formData.operation_type}
                  onValueChange={(value) => setFormData({ ...formData, operation_type: value as "ingreso" | "egreso" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cereal_type_id">Tipo de Cereal *</Label>
                <Select
                  value={formData.cereal_type_id}
                  onValueChange={(value) => setFormData({ ...formData, cereal_type_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cereal" />
                  </SelectTrigger>
                  <SelectContent>
                    {cerealTypes.map((cereal) => (
                      <SelectItem key={cereal.id} value={cereal.id}>
                        {cereal.name} ({cereal.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_id">Conductor *</Label>
                <Select
                  value={formData.driver_id}
                  onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.license_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2">
                <Label htmlFor="silo_id">Silo *</Label>
                <Select
                  value={formData.silo_id}
                  onValueChange={(value) => setFormData({ ...formData, silo_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar silo" />
                  </SelectTrigger>
                  <SelectContent>
                    {silos.map((silo) => (
                      <SelectItem key={silo.id} value={silo.id}>
                        {silo.name} - {silo.current_stock}t / {silo.capacity}t
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del Vehículo</h3>

              <div className="space-y-2">
                <Label htmlFor="chassis_plate">Patente Chasis *</Label>
                <Input
                  id="chassis_plate"
                  value={formData.chassis_plate}
                  onChange={(e) => setFormData({ ...formData, chassis_plate: e.target.value.toUpperCase() })}
                  placeholder="ABC123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailer_plate">Patente Acoplado</Label>
                <Input
                  id="trailer_plate"
                  value={formData.trailer_plate}
                  onChange={(e) => setFormData({ ...formData, trailer_plate: e.target.value.toUpperCase() })}
                  placeholder="TRL456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad (toneladas)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="25.5"
                />
              </div>
            </div>
          </div>

          {/* Weight Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información de Pesaje</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tare_weight">Tara (kg)</Label>
                <Input
                  id="tare_weight"
                  type="number"
                  value={formData.tare_weight}
                  onChange={(e) => setFormData({ ...formData, tare_weight: e.target.value })}
                  placeholder="8500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gross_weight">Peso Bruto (kg)</Label>
                <Input
                  id="gross_weight"
                  type="number"
                  value={formData.gross_weight}
                  onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                  placeholder="34000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="net_weight">Peso Neto (kg)</Label>
                <Input
                  id="net_weight"
                  type="number"
                  value={formData.net_weight}
                  onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                  placeholder="25500"
                />
              </div>
            </div>
          </div>

          {/* Quality Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Análisis de Calidad</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="moisture">Humedad (%)</Label>
                <Input
                  id="moisture"
                  type="number"
                  step="0.1"
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  placeholder="14.2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impurities">Impurezas (%)</Label>
                <Input
                  id="impurities"
                  type="number"
                  step="0.1"
                  value={formData.impurities}
                  onChange={(e) => setFormData({ ...formData, impurities: e.target.value })}
                  placeholder="2.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_weight">Peso Hectolítrico (kg/hl)</Label>
                <Input
                  id="test_weight"
                  type="number"
                  step="0.1"
                  value={formData.test_weight}
                  onChange={(e) => setFormData({ ...formData, test_weight: e.target.value })}
                  placeholder="78.5"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales sobre la operación..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
