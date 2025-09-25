"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Truck, AlertCircle, X } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { AuthService } from "@/lib/auth"

interface CreateSpontaneousEntryDialogProps {
  onSuccess?: () => void
}

export function CreateSpontaneousEntryDialog({ onSuccess }: CreateSpontaneousEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { clients, drivers, addOperation } = useData()
  
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "", // Para clientes no registrados
    driver_id: "",
    driver_name: "", // Para conductores no registrados
    chassis_plate: "",
    trailer_plate: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error("Usuario no autenticado")
      }

      // Validaciones básicas
      if ((!formData.client_id && !formData.client_name) || 
          (!formData.driver_id && !formData.driver_name) || 
          !formData.chassis_plate) {
        setError("Por favor complete todos los campos obligatorios (Cliente/Nombre, Conductor/Nombre y Chasis)")
        setLoading(false)
        return
      }

      const now = new Date()
      
      // Crear operación básica desde garita
      const newOperation = {
        operation_type: "ingreso" as const,
        date: now.toISOString(),
        client_id: formData.client_id || "pending", // "pending" si no hay cliente registrado
        driver_id: formData.driver_id || "pending", // "pending" si no hay conductor registrado
        cereal_type_id: "", // Se definirá después
        silo_id: "", // Se definirá después
        chassis_plate: formData.chassis_plate.toUpperCase(),
        trailer_plate: formData.trailer_plate.toUpperCase() || "",
        quantity: 0, // Se definirá después
        gross_weight: 0,
        tare_weight: 0,
        net_weight: 0,
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: [
          formData.notes,
          formData.client_name ? `Cliente: ${formData.client_name}` : "",
          formData.driver_name ? `Conductor: ${formData.driver_name}` : "",
          "(Creado desde garita)"
        ].filter(Boolean).join(" - "),
        status: "autorizar_acceso", // Esperando autorización de entrada
        scheduled_date: now.toISOString(),
        estimated_duration: 60,
        created_from_garita: true,
        company_id: currentUser.company_id || "",
        createdAt: now.toISOString()
      }

      await addOperation(newOperation)
      
      // Resetear formulario
      setFormData({
        client_id: "",
        client_name: "",
        driver_id: "",
        driver_name: "",
        chassis_plate: "",
        trailer_plate: "",
        notes: ""
      })
      
      setOpen(false)
      onSuccess?.()
      
    } catch (err) {
      console.error("Error creando operación espontánea:", err)
      setError(err instanceof Error ? err.message : "Error al crear la operación")
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (clientId: string) => {
    return clients?.find(c => c.id === clientId)?.name || "Cliente no encontrado"
  }

  const getDriverName = (driverId: string) => {
    return drivers?.find(d => d.id === driverId)?.name || "Conductor no encontrado"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] text-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-600" />
            Crear Ingreso Espontáneo
          </DialogTitle>
          <DialogDescription>
            Crear una nueva operación de ingreso. Si el cliente o conductor no están registrados, puede ingresar sus nombres manualmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="client_id">Cliente</Label>
                {formData.client_id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, client_id: "", client_name: "" })}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 border-gray-300"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <Select
                value={formData.client_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, client_id: value, client_name: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente registrado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!formData.client_id && (
                <div className="mt-2">
                  <Label htmlFor="client_name" className="text-sm text-gray-600">
                    O ingrese nombre del cliente *
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Nombre del cliente no registrado"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="driver_id">Conductor</Label>
                {formData.driver_id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, driver_id: "", driver_name: "" })}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 border-gray-300"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, driver_id: value, driver_name: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor registrado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!formData.driver_id && (
                <div className="mt-2">
                  <Label htmlFor="driver_name" className="text-sm text-gray-600">
                    O ingrese nombre del conductor *
                  </Label>
                  <Input
                    id="driver_name"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    placeholder="Nombre del conductor no registrado"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chassis_plate">Chasis *</Label>
              <Input
                id="chassis_plate"
                value={formData.chassis_plate}
                onChange={(e) => setFormData({ ...formData, chassis_plate: e.target.value })}
                placeholder="ABC123"
                className="uppercase"
                maxLength={7}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailer_plate">Acoplado</Label>
              <Input
                id="trailer_plate"
                value={formData.trailer_plate}
                onChange={(e) => setFormData({ ...formData, trailer_plate: e.target.value })}
                placeholder="XYZ789"
                className="uppercase"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalles adicionales del vehículo o carga..."
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Información:</p>
            <p className="text-xs text-blue-700 mt-1">
              • Esta operación se creará con estado "Autorizar Acceso"<br/>
              • Los detalles del cereal y silo se completarán después por otros usuarios<br/>
              • Si ingresa nombres manualmente, los datos se guardarán en las observaciones
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creando..." : "Crear Operación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
