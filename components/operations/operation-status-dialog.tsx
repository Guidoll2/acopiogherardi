"use client"
type OperationStatus =
  | "pendiente"
  | "autorizar_acceso"
  | "balanza_ingreso"
  | "en_carga_descarga"
  | "balanza_egreso"
  | "autorizar_egreso"
  | "completado"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface OperationStatusDialogProps {
  operationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OperationStatusDialog({ operationId, open, onOpenChange }: OperationStatusDialogProps) {
  const { operations = [], updateOperation } = useData()
 const [newStatus, setNewStatus] = useState<OperationStatus | "">("")
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Mock data fallback
  const mockOperations = [
    {
      id: "1",
      client_id: "1",
      operation_type: "ingreso",
      status: "pendiente",
      chassis_plate: "ABC123",
      quantity: 25.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cereal_type_id: "1",
      silo_id: "1",
      driver_id: "1",
      notes: "Operación de prueba",
    },
  ]

  const displayOperations = operations.length > 0 ? operations : mockOperations
  const operation = displayOperations.find((op) => op.id === operationId)

  const statusOptions = [
    { value: "pendiente", label: "Pendiente", color: "bg-gray-100 text-gray-800", icon: Clock },
    { value: "autorizar_acceso", label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    { value: "balanza_ingreso", label: "Balanza Ingreso", color: "bg-blue-100 text-blue-800", icon: Clock },
    { value: "en_carga_descarga", label: "Carga/Descarga", color: "bg-orange-100 text-orange-800", icon: Clock },
    { value: "balanza_egreso", label: "Balanza Egreso", color: "bg-purple-100 text-purple-800", icon: Clock },
    { value: "autorizar_egreso", label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800", icon: AlertCircle },
    { value: "completado", label: "Completado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  ]

  const getStatusConfig = (status: string) => {
    return statusOptions.find((option) => option.value === status) || statusOptions[0]
  }

  const handleUpdateStatus = async () => {
    if (!operation || !newStatus) return

    setIsUpdating(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (updateOperation) {
        updateOperation(operation.id, {
          status: newStatus,
          notes: notes || operation.notes,
          updated_at: new Date().toISOString(),
        })
      }

      onOpenChange(false)
      setNewStatus("")
      setNotes("")
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!operation) return null

  const currentStatusConfig = getStatusConfig(operation.status)
  const newStatusConfig = newStatus ? getStatusConfig(newStatus) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Actualizar Estado - Operación #{operation.id}</DialogTitle>
          <DialogDescription>Cambia el estado actual de la operación</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado Actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <currentStatusConfig.icon className="h-5 w-5" />
                <Badge className={currentStatusConfig.color}>{currentStatusConfig.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  Actualizado: {new Date(operation.updated_at).toLocaleString("es-AR")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Nuevo Estado */}
          <div className="space-y-3">
            <Label htmlFor="new_status">Nuevo Estado</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OperationStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.value === operation.status}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                      {option.value === operation.status && " (Actual)"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview del nuevo estado */}
          {newStatusConfig && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vista Previa</CardTitle>
                <CardDescription>Así se verá el nuevo estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <newStatusConfig.icon className="h-5 w-5" />
                  <Badge className={newStatusConfig.color}>{newStatusConfig.label}</Badge>
                  <span className="text-sm text-muted-foreground">Se actualizará ahora</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas adicionales */}
          <div className="space-y-3">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones sobre el cambio de estado..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={!newStatus || isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Actualizar Estado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
