"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Truck, Package, Scale, Clock } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function NewOperationPage() {
  const router = useRouter()
  const { clients, drivers, silos, cerealTypes, addOperation } = useData()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: "",
    operation_type: "",
    cereal_type_id: "",
    silo_id: "",
    driver_id: "",
    chassis_plate: "",
    trailer_plate: "",
    estimated_quantity: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  })

  // Mock data if no data available
  const mockClients = [
    { id: "1", name: "Estancia La Esperanza" },
    { id: "2", name: "Agropecuaria San Martín" },
    { id: "3", name: "Cooperativa del Norte" },
  ]

  const mockDrivers = [
    { id: "1", name: "Carlos Mendez", license_number: "12345678" },
    { id: "2", name: "Ana Rodriguez", license_number: "87654321" },
    { id: "3", name: "Luis Garcia", license_number: "11223344" },
  ]

  const mockSilos = [
    { id: "1", name: "Silo A1", capacity: 1000 },
    { id: "2", name: "Silo B2", capacity: 1500 },
    { id: "3", name: "Silo C3", capacity: 2000 },
  ]

  const mockCereals = [
    { id: "1", name: "Soja", code: "SOJ" },
    { id: "2", name: "Maíz", code: "MAI" },
    { id: "3", name: "Trigo", code: "TRI" },
  ]

  const displayClients = clients?.length > 0 ? clients : mockClients
  const displayDrivers = drivers?.length > 0 ? drivers : mockDrivers
  const displaySilos = silos?.length > 0 ? silos : mockSilos
  const displayCereals = cerealTypes?.length > 0 ? cerealTypes : mockCereals

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Campo ${field} cambiado a:`, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBack = () => {
    console.log("⬅️ Volviendo a operaciones...")
    router.push("/dashboard/operations")
  }

  const handleSave = async () => {
    console.log("💾 Guardando nueva operación:", formData)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.client_id || !formData.operation_type || !formData.cereal_type_id || !formData.chassis_plate) {
        alert("Por favor complete todos los campos requeridos")
        return
      }

      // Create new operation
      const newOperation = {
  client_id: formData.client_id,
  operation_type: formData.operation_type as "ingreso" | "egreso",
  cereal_type_id: formData.cereal_type_id,
  silo_id: formData.silo_id,
  driver_id: formData.driver_id,
  chassis_plate: formData.chassis_plate,
  trailer_plate: formData.trailer_plate,
  estimated_quantity: Number.parseFloat(formData.estimated_quantity) || 0,
  scheduled_date: formData.scheduled_date && formData.scheduled_time
    ? new Date(formData.scheduled_date + "T" + formData.scheduled_time).toISOString()
    : new Date().toISOString(),
  notes: formData.notes,
  status: "pendiente" as
    | "pendiente"
    | "autorizar_acceso"
    | "balanza_ingreso"
    | "en_carga_descarga"
    | "balanza_egreso"
    | "autorizar_egreso"
    | "completado",
  quantity: 0,
  tare_weight: 0,
  gross_weight: 0,
  net_weight: 0,
  moisture: 0,
  impurities: 0,
  test_weight: 0,
  estimated_duration: 0,
  createdAt: new Date().toISOString(),
  company_id: "1",
}
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (addOperation) {
        addOperation(newOperation)
      }

      console.log("✅ Operación creada exitosamente")
      router.push("/dashboard/operations")
    } catch (error) {
      console.error("❌ Error creando operación:", error)
      alert("Error al crear la operación")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = () => {
    console.log("⚡ Llenado rápido activado")
    setFormData({
      client_id: "1",
      operation_type: "ingreso",
      cereal_type_id: "1",
      silo_id: "1",
      driver_id: "1",
      chassis_plate: "ABC123",
      trailer_plate: "TRL456",
      estimated_quantity: "25",
      scheduled_date: new Date().toISOString().split("T")[0],
      scheduled_time: "09:00",
      notes: "Operación de prueba",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Operación</h1>
            <p className="text-muted-foreground">Crear una nueva operación de ingreso o egreso</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleQuickFill}>
            <Plus className="h-4 w-4 mr-2" />
            Llenar Rápido
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Operación"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange("client_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {displayClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_type">Tipo de Operación *</Label>
              <Select
                value={formData.operation_type}
                onValueChange={(value) => handleInputChange("operation_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cereal">Cereal *</Label>
              <Select
                value={formData.cereal_type_id}
                onValueChange={(value) => handleInputChange("cereal_type_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cereal" />
                </SelectTrigger>
                <SelectContent>
                  {displayCereals.map((cereal) => (
                    <SelectItem key={cereal.id} value={cereal.id}>
                      {cereal.name} ({cereal.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="silo">Silo</Label>
              <Select value={formData.silo_id} onValueChange={(value) => handleInputChange("silo_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar silo" />
                </SelectTrigger>
                <SelectContent>
                  {displaySilos.map((silo) => (
                    <SelectItem key={silo.id} value={silo.id}>
                      {silo.name} (Cap: {silo.capacity}t)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_quantity">Cantidad Estimada (toneladas)</Label>
              <Input
                id="estimated_quantity"
                type="number"
                step="0.1"
                value={formData.estimated_quantity}
                onChange={(e) => handleInputChange("estimated_quantity", e.target.value)}
                placeholder="25.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del Transporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información del Transporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Conductor</Label>
              <Select value={formData.driver_id} onValueChange={(value) => handleInputChange("driver_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor" />
                </SelectTrigger>
                <SelectContent>
                  {displayDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - Lic: {driver.license_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chassis_plate">Patente Chasis *</Label>
              <Input
                id="chassis_plate"
                value={formData.chassis_plate}
                onChange={(e) => handleInputChange("chassis_plate", e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailer_plate">Patente Acoplado</Label>
              <Input
                id="trailer_plate"
                value={formData.trailer_plate}
                onChange={(e) => handleInputChange("trailer_plate", e.target.value.toUpperCase())}
                placeholder="TRL456"
                maxLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Programación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Programación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Fecha Programada</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Hora Programada</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange("scheduled_time", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Información adicional sobre la operación..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la Operación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <p className="font-medium">
                {formData.client_id ? displayClients.find((c) => c.id === formData.client_id)?.name : "No seleccionado"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <p className="font-medium">{formData.operation_type || "No seleccionado"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cereal:</span>
              <p className="font-medium">
                {formData.cereal_type_id
                  ? displayCereals.find((c) => c.id === formData.cereal_type_id)?.name
                  : "No seleccionado"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Patente:</span>
              <p className="font-medium">{formData.chassis_plate || "No ingresada"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
