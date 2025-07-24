"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuickLimitCheck } from "@/components/ui/subscription-alert"
import { ArrowLeft, Save, Plus, Truck, Package, Scale, Clock, AlertTriangle } from "lucide-react"
import { useData } from "@/contexts/offline-data-context"
import { useCanCreateOperation } from "@/hooks/use-subscription"
import { useSiloValidation } from "@/lib/silo-validation"
import { useToasts } from "@/components/ui/toast"

export default function NewOperationPage() {
  const router = useRouter()
  const { clients, drivers, silos, cerealTypes, addOperation } = useData()
  const { canCreate, remainingOperations, currentCount, limit, plan, loading: subscriptionLoading } = useCanCreateOperation()
  const { validateSiloCapacity } = useSiloValidation()
  const { showSuccess, showError, showProcessing } = useToasts()
  const [isLoading, setIsLoading] = useState(false)
  const [capacityError, setCapacityError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: "",
    operation_type: "",
    cereal_type_id: "",
    silo_id: "",
    driver_id: "",
    chassis_plate: "",
    trailer_plate: "",
    estimated_quantity: "",
    gross_weight: "",
    tare_weight: "",
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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      console.log(`📋 Estado actualizado del formulario:`, newData)
      
      // Log específico para cliente
      if (field === "client_id") {
        const cliente = displayClients.find(c => c.id === value)
        console.log(`👤 Cliente seleccionado: ID=${value}, Nombre=${cliente?.name}`)
      }
      
      // Validar capacidad del silo cuando cambia la cantidad estimada
      if (field === "estimated_quantity" && newData.silo_id && value) {
        const quantity = parseFloat(value)
        if (!isNaN(quantity) && quantity > 0) {
          const validation = validateSiloCapacity(displaySilos, newData.silo_id, quantity)
          if (!validation.valid) {
            setCapacityError(`La cantidad excede la capacidad disponible del silo (${validation.availableSpace} toneladas disponibles)`)
          } else {
            setCapacityError(null)
          }
        } else {
          setCapacityError(null)
        }
      }
      
      // También validar cuando cambia el silo seleccionado
      if (field === "silo_id" && newData.estimated_quantity) {
        const quantity = parseFloat(newData.estimated_quantity)
        if (!isNaN(quantity) && quantity > 0 && value) {
          const validation = validateSiloCapacity(displaySilos, value, quantity)
          if (!validation.valid) {
            setCapacityError(`La cantidad excede la capacidad disponible del silo (${validation.availableSpace} toneladas disponibles)`)
          } else {
            setCapacityError(null)
          }
        } else {
          setCapacityError(null)
        }
      }
      
      return newData
    })
  }

  const handleBack = () => {
    console.log("⬅️ Volviendo a operaciones...")
    router.push("/dashboard/operations")
  }

  const handleSave = async () => {
    // Verificar límites de suscripción antes de proceder
    if (!canCreate) {
      showError(`Has alcanzado el límite de ${limit} operaciones para tu plan. No puedes crear más operaciones este mes.`)
      return
    }

    // Verificar errores de capacidad
    if (capacityError) {
      showError(capacityError)
      return
    }

    setIsLoading(true)
    showProcessing("Creando operación...")

    try {
      // Log para debuggear los valores del formulario
      console.log("🔍 Datos del formulario:", formData)

      // Validar campos requeridos uno por uno para mejor debugging
      const requiredFields = [
        { field: 'client_id', value: formData.client_id, label: 'Cliente' },
        { field: 'operation_type', value: formData.operation_type, label: 'Tipo de operación' },
        { field: 'cereal_type_id', value: formData.cereal_type_id, label: 'Cereal' },
        { field: 'silo_id', value: formData.silo_id, label: 'Silo' },
        { field: 'driver_id', value: formData.driver_id, label: 'Conductor' },
        { field: 'chassis_plate', value: formData.chassis_plate, label: 'Patente chasis' }
      ]

      const missingFields = requiredFields.filter(f => !f.value || f.value.trim() === '')
      
      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(f => f.label).join(', ')
        console.log("❌ Campos faltantes:", missingFields)
        showError(`Por favor complete los siguientes campos requeridos: ${missingFieldNames}`)
        return
      }

      // Validar tipo de operación
      if (formData.operation_type !== "ingreso" && formData.operation_type !== "egreso") {
        showError("Tipo de operación inválido")
        return
      }

      // Validación final de capacidad del silo para operaciones de ingreso
      if (formData.operation_type === "ingreso" && formData.estimated_quantity && formData.silo_id) {
        const quantity = parseFloat(formData.estimated_quantity)
        if (!isNaN(quantity) && quantity > 0) {
          const validation = validateSiloCapacity(displaySilos, formData.silo_id, quantity)
          if (!validation.valid) {
            showError(`No se puede cargar ${quantity} toneladas. ${validation.message}`)
            return
          }
        }
      }

      // Crear nueva operación (con todos los campos requeridos)
      const newOperation = {
        client_id: formData.client_id,
        driver_id: formData.driver_id,
        silo_id: formData.silo_id,
        cereal_type_id: formData.cereal_type_id,
        company_id: "default-company-id", // Valor temporal hasta que se implemente autenticación
        operation_type: formData.operation_type as "ingreso" | "egreso",
        status: "pending",
        chassis_plate: formData.chassis_plate,
        trailer_plate: formData.trailer_plate || "",
        quantity: Number.parseFloat(formData.estimated_quantity) || 0,
        tare_weight: Number.parseFloat(formData.tare_weight) || 0,
        gross_weight: Number.parseFloat(formData.gross_weight) || 0,
        net_weight: (Number.parseFloat(formData.gross_weight) || 0) - (Number.parseFloat(formData.tare_weight) || 0),
        moisture: 0,
        impurities: 0,
        test_weight: 0,
        notes: formData.notes || "",
        scheduled_date: formData.scheduled_date && formData.scheduled_time 
          ? `${formData.scheduled_date}T${formData.scheduled_time}:00.000Z`
          : new Date().toISOString(),
        estimated_duration: 60, // 60 minutos por defecto
        createdAt: new Date().toISOString(), // Para compatibilidad hacia atrás
      }

      console.log("📤 Enviando operación:", newOperation)

      // Llamar a la función addOperation del contexto
      if (addOperation) {
        await addOperation(newOperation)
      }

      console.log("✅ Operación creada exitosamente")
      showSuccess("Operación creada exitosamente")
      router.push("/dashboard/operations")
    } catch (error) {
      console.error("❌ Error creando operación:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear la operación"
      showError(`Error al crear la operación: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = () => {
    console.log("⚡ Llenado rápido activado")
    const quickFillData = {
      client_id: "1",
      operation_type: "ingreso",
      cereal_type_id: "1",
      silo_id: "1",
      driver_id: "1",
      chassis_plate: "ABC123",
      trailer_plate: "TRL456",
      estimated_quantity: "25",
      gross_weight: "34000",
      tare_weight: "8500",
      scheduled_date: new Date().toISOString().split("T")[0],
      scheduled_time: "09:00",
      notes: "Operación de prueba",
    }
    console.log("📝 Datos de llenado rápido:", quickFillData)
    setFormData(quickFillData)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Header - Responsive */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <Button variant="outline" onClick={handleBack} className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Nueva Operación</h1>
              <p className="text-muted-foreground text-sm">Crear una nueva operación de ingreso o egreso</p>
            </div>
          </div>
          
          {/* Action buttons - Responsive layout */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleQuickFill} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Llenar Rápido</span>
                <span className="xs:hidden">Rápido</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log("🔍 Estado actual del formulario:", formData)
                  alert(`Estado del formulario:\n${JSON.stringify(formData, null, 2)}`)
                }}
                className="flex-1 sm:flex-none"
              >
                Debug
              </Button>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !canCreate || !!capacityError} 
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">{isLoading ? "Guardando..." : "Guardar Operación"}</span>
              <span className="xs:hidden">{isLoading ? "Guardando..." : "Guardar"}</span>
            </Button>
          </div>
        </div>

        {/* Subscription Limit Alert */}
        {!subscriptionLoading && (
          <QuickLimitCheck 
            currentCount={currentCount}
            limit={limit}
            plan={plan}
          />
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium">Cliente *</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(value) => {
                    console.log("🏢 Cliente seleccionado:", value)
                    console.log("🏢 Cliente encontrado:", displayClients.find(c => c.id === value))
                    handleInputChange("client_id", value)
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayClients.map((client, index) => (
                      <SelectItem key={client.id || `client-${index}`} value={client.id || `client-${index}`}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation_type" className="text-sm font-medium">Tipo de Operación *</Label>
                <Select
                  value={formData.operation_type}
                  onValueChange={(value) => handleInputChange("operation_type", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">🟢 Ingreso</SelectItem>
                    <SelectItem value="egreso">🟠 Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cereal" className="text-sm font-medium">Cereal *</Label>
                <Select
                  value={formData.cereal_type_id}
                  onValueChange={(value) => handleInputChange("cereal_type_id", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar cereal" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayCereals.map((cereal, index) => (
                      <SelectItem key={cereal.id || `cereal-${index}`} value={cereal.id || `cereal-${index}`}>
                        {cereal.name} ({cereal.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="silo" className="text-sm font-medium">Silo</Label>
                <Select value={formData.silo_id} onValueChange={(value) => handleInputChange("silo_id", value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar silo" />
                  </SelectTrigger>
                  <SelectContent>
                    {displaySilos.map((silo, index) => (
                      <SelectItem key={silo.id || `silo-${index}`} value={silo.id || `silo-${index}`}>
                        {silo.name} (Cap: {silo.capacity}t)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_quantity" className="text-sm font-medium">Cantidad Estimada (toneladas)</Label>
                <Input
                  id="estimated_quantity"
                  type="number"
                  step="0.1"
                  value={formData.estimated_quantity}
                  onChange={(e) => handleInputChange("estimated_quantity", e.target.value)}
                  placeholder="25.5"
                  className={`h-10 ${capacityError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {capacityError && (
                  <div className="flex items-start gap-2 text-red-600 text-sm p-2 bg-red-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{capacityError}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_weight" className="text-sm font-medium">Peso Bruto (kg)</Label>
                  <Input
                    id="gross_weight"
                    type="number"
                    step="0.1"
                    value={formData.gross_weight}
                    onChange={(e) => handleInputChange("gross_weight", e.target.value)}
                    placeholder="34000"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tare_weight" className="text-sm font-medium">Peso Tara (kg)</Label>
                  <Input
                    id="tare_weight"
                    type="number"
                    step="0.1"
                    value={formData.tare_weight}
                    onChange={(e) => handleInputChange("tare_weight", e.target.value)}
                    placeholder="8500"
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Transporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                Información del Transporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driver" className="text-sm font-medium">Conductor</Label>
                <Select value={formData.driver_id} onValueChange={(value) => handleInputChange("driver_id", value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayDrivers.map((driver, index) => (
                      <SelectItem key={driver.id || `driver-${index}`} value={driver.id || `driver-${index}`}>
                        <div className="flex flex-col">
                          <span>{driver.name}</span>
                          <span className="text-xs text-muted-foreground">Lic: {driver.license_number}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassis_plate" className="text-sm font-medium">Patente Chasis *</Label>
                <Input
                  id="chassis_plate"
                  value={formData.chassis_plate}
                  onChange={(e) => handleInputChange("chassis_plate", e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="h-10 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailer_plate" className="text-sm font-medium">Patente Acoplado</Label>
                <Input
                  id="trailer_plate"
                  value={formData.trailer_plate}
                  onChange={(e) => handleInputChange("trailer_plate", e.target.value.toUpperCase())}
                  placeholder="TRL456"
                  maxLength={6}
                  className="h-10 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Programación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date" className="text-sm font-medium">Fecha Programada</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_time" className="text-sm font-medium">Hora Programada</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => handleInputChange("scheduled_time", e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Información adicional sobre la operación..."
                  rows={3}
                  className="min-h-[80px] resize-none"
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
    </DashboardLayout>
  )
}
