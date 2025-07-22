"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { useToasts } from "@/components/ui/toast"
import { validateSiloCapacity } from "@/lib/silo-validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Warehouse, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SilosPage() {
  const { silos = [], cereals = [], addSilo, updateSilo } = useData()
  const { showSuccess, showError, showProcessing } = useToasts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSilo, setSelectedSilo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    cereal_type_id: "",
  })

  const handleCreateSilo = async () => {
    if (formData.name && formData.capacity) {
      setIsLoading(true)
      showProcessing("Creando silo...")
      
      try {
        await addSilo({
          name: formData.name,
          capacity: Number(formData.capacity),
          current_stock: 0,
          cereal_type_id: formData.cereal_type_id,
          is_active: true,
        })
        
        showSuccess("Silo creado", `${formData.name} ha sido agregado exitosamente`)
        
        setFormData({
          name: "",
          capacity: "",
          cereal_type_id: "",
        })
        setIsCreateDialogOpen(false)
      } catch (error) {
        showError("Error al crear silo", "No se pudo crear el silo. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  const handleEditSilo = async () => {
    if (selectedSilo && formData.name && formData.capacity) {
      setIsLoading(true)
      showProcessing("Actualizando silo...")
      
      try {
        await updateSilo(selectedSilo.id, {
          name: formData.name,
          capacity: Number(formData.capacity),
          cereal_type_id: formData.cereal_type_id,
        })
        
        showSuccess("Silo actualizado", `${formData.name} ha sido actualizado exitosamente`)
        
        setIsEditDialogOpen(false)
        setSelectedSilo(null)
        setFormData({
          name: "",
          capacity: "",
          cereal_type_id: "",
        })
      } catch (error) {
        showError("Error al actualizar silo", "No se pudo actualizar el silo. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  // Función para validar capacidad del silo (local)
  const validateCapacity = (siloId: string, newQuantity: number) => {
    return validateSiloCapacity(silos, siloId, newQuantity)
  }

  const openEditDialog = (silo: any) => {
    setSelectedSilo(silo)
    setFormData({
      name: silo.name || "",
      capacity: silo.capacity?.toString() || "",
      cereal_type_id: silo.cereal_type_id || "",
    })
    setIsEditDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Silos</h1>
            <p className="text-muted-foreground text-sm">Gestiona y monitorea el estado de los silos</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 self-start sm:self-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Nuevo Silo</span>
            <span className="xs:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Tabla de Silos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Silos ({silos.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden md:block p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Silo</TableHead>
                    <TableHead>Cereal</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {silos.map((silo) => {
                    const cereal = cereals.find((c) => c.id === silo.cereal_type_id)
                    const occupancy = silo.capacity > 0 ? (silo.current_stock / silo.capacity) * 100 : 0

                    return (
                      <TableRow key={silo.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Warehouse className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="font-medium">{silo.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cereal?.name || "Sin asignar"}</TableCell>
                        <TableCell>{silo.capacity?.toLocaleString() || 0} t</TableCell>
                        <TableCell>{silo.current_stock?.toLocaleString() || 0} t</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{occupancy.toFixed(1)}%</span>
                              <Badge variant={occupancy >= 90 ? "default" : occupancy >= 70 ? "default" : "secondary"}>
                                {occupancy >= 90 ? "Crítico" : occupancy >= 70 ? "Alto" : "Normal"}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancy >= 90 ? "bg-red-500" : occupancy >= 70 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(occupancy, 100)}%` }}
                              />
                            </div>
                            {occupancy >= 90 && (
                              <div className="flex items-center gap-1 text-red-600 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Atención requerida</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={silo.is_active ? "default" : "secondary"}>
                            {silo.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(silo)} title="Editar Silo">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards - Shown only on small screens */}
            <div className="md:hidden space-y-3 p-4">
              {silos.map((silo) => {
                const cereal = cereals.find((c) => c.id === silo.cereal_type_id)
                const occupancy = silo.capacity > 0 ? (silo.current_stock / silo.capacity) * 100 : 0

                return (
                  <Card key={silo.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      {/* Header with Silo Name and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Warehouse className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{silo.name}</div>
                            <div className="text-xs text-gray-500">{cereal?.name || "Sin asignar"}</div>
                          </div>
                        </div>
                        <Badge variant={silo.is_active ? "default" : "secondary"} className="ml-2">
                          {silo.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      {/* Capacity and Stock Info */}
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 block">Capacidad</span>
                          <span className="text-gray-900 font-medium">{silo.capacity?.toLocaleString() || 0} t</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Stock Actual</span>
                          <span className="text-gray-900 font-medium">{silo.current_stock?.toLocaleString() || 0} t</span>
                        </div>
                      </div>

                      {/* Occupancy Section */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-500 text-sm">Ocupación</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{occupancy.toFixed(1)}%</span>
                            <Badge 
                              variant={occupancy >= 90 ? "default" : occupancy >= 70 ? "default" : "secondary"}
                              className={`text-xs ${occupancy >= 90 ? "bg-red-500 text-white" : ""}`}
                            >
                              {occupancy >= 90 ? "Crítico" : occupancy >= 70 ? "Alto" : "Normal"}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              occupancy >= 90 ? "bg-red-500" : occupancy >= 70 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                          />
                        </div>

                        {/* Critical Alert */}
                        {occupancy >= 90 && (
                          <div className="flex items-center gap-1 text-red-600 text-xs bg-red-50 p-2 rounded">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                            <span>Atención requerida - Silo casi lleno</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9"
                          onClick={() => openEditDialog(silo)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          <span>Editar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Empty State */}
            {silos.length === 0 && (
              <div className="text-center py-12 px-4">
                <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay silos</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Comienza agregando tu primer silo para gestionar el almacenamiento.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Silo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="text-gray-700">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Silo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Silo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Silo A1"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad (toneladas) *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="cereal_type">Tipo de Cereal</Label>
              <Select
                value={formData.cereal_type_id}
                onValueChange={(value) => setFormData({ ...formData, cereal_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cereal" />
                </SelectTrigger>
                <SelectContent>
                  {cereals.map((cereal) => (
                    <SelectItem key={cereal.id} value={cereal.id}>
                      {cereal.name} ({cereal.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateSilo}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.capacity || isLoading}
            >
              {isLoading ? "Creando..." : "Crear Silo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-gray-700">
          <DialogHeader>
            <DialogTitle>Editar Silo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre del Silo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacidad (toneladas) *</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-cereal">Tipo de Cereal</Label>
              <Select
                value={formData.cereal_type_id}
                onValueChange={(value) => setFormData({ ...formData, cereal_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cereal" />
                </SelectTrigger>
                <SelectContent>
                  {cereals.map((cereal) => (
                    <SelectItem key={cereal.id} value={cereal.id}>
                      {cereal.name} ({cereal.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleEditSilo}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.capacity || isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
