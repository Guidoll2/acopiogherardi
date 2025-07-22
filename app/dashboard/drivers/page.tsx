"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { useToasts } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, User, Phone, Mail, CreditCard } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

type Driver = {
  id: string
  name: string
  email?: string
  phone?: string
  license_number: string
  license_expiry?: string
  transportista?: string
  is_active?: boolean
  status?: string
}

export default function DriversPage() {
  const { drivers = [], addDriver, updateDriver, deleteDriver } = useData()
  const { showSuccess, showError, showProcessing } = useToasts()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    license_expiry: "",
    transportista: "",
  })

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm) ||
      driver.license_number?.includes(searchTerm) ||
      driver.transportista?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateDriver = async () => {
    if (formData.name && formData.email && formData.license_number) {
      setIsLoading(true)
      showProcessing("Creando conductor...")
      
      try {
        await addDriver({
          ...formData,
          is_active: true,
          status: "active",
        })
        
        showSuccess("Conductor creado", `${formData.name} ha sido agregado exitosamente`)
        
        setFormData({
          name: "",
          email: "",
          phone: "",
          license_number: "",
          license_expiry: "",
          transportista: "",
        })
        setIsCreateDialogOpen(false)
      } catch (error) {
        showError("Error al crear conductor", "No se pudo crear el conductor. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  const handleEditDriver = async () => {
    if (selectedDriver && formData.name && formData.email && formData.license_number) {
      setIsLoading(true)
      showProcessing("Actualizando conductor...")
      
      try {
        await updateDriver(selectedDriver.id, formData)
        
        showSuccess("Conductor actualizado", `${formData.name} ha sido actualizado exitosamente`)
        
        setIsEditDialogOpen(false)
        setSelectedDriver(null)
        setFormData({
          name: "",
          email: "",
          phone: "",
          license_number: "",
          license_expiry: "",
          transportista: "",
        })
      } catch (error) {
        showError("Error al actualizar conductor", "No se pudo actualizar el conductor. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  const openEditDialog = (driver: any) => {
    setSelectedDriver(driver)
    setFormData({
      name: driver.name || "",
      email: driver.email || "",
      phone: driver.phone || "",
      license_number: driver.license_number || "",
      license_expiry: driver.license_expiry || "",
      transportista: driver.transportista || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteDriver = async (driverId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este conductor?")) {
      showProcessing("Eliminando conductor...")
      
      try {
        await deleteDriver(driverId)
        showSuccess("Conductor eliminado", "El conductor ha sido eliminado exitosamente")
      } catch (error) {
        showError("Error al eliminar conductor", "No se pudo eliminar el conductor. Intenta nuevamente.")
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Conductores</h1>
            <p className="text-muted-foreground text-sm">Gestiona la información de los conductores</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 self-start sm:self-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Nuevo Conductor</span>
            <span className="xs:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, teléfono, licencia o transportista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Conductores */}
        <Card>
          <CardHeader>
            <CardTitle>Conductores ({filteredDrivers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden md:block p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Licencia</TableHead>
                    <TableHead>Transportista</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {driver.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{driver.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{driver.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">{driver.license_number}</span>
                        </div>
                        {driver.license_expiry && (
                          <div className="text-xs text-muted-foreground">
                            Vence: {new Date(driver.license_expiry).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{driver.transportista || "Independiente"}</TableCell>
                      <TableCell>
                        <Badge variant={driver.is_active ? "default" : "secondary"}>
                          {driver.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(driver)} title="Editar Conductor">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteDriver(driver.id)} title="Eliminar Conductor">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards - Shown only on small screens */}
            <div className="md:hidden space-y-3 p-4">
              {filteredDrivers.map((driver) => (
                <Card key={driver.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    {/* Header with Driver Name and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{driver.name}</div>
                          <div className="text-xs text-gray-500">ID: {driver.id}</div>
                        </div>
                      </div>
                      <Badge variant={driver.is_active ? "default" : "secondary"} className="ml-2">
                        {driver.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{driver.email}</span>
                      </div>
                      {driver.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{driver.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* License and Company Details */}
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Licencia:</span>
                        <span className="text-gray-700 font-mono text-xs">{driver.license_number}</span>
                      </div>
                      {driver.license_expiry && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Vencimiento:</span>
                          <span className="text-gray-700 text-xs">
                            {new Date(driver.license_expiry).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Transportista:</span>
                        <span className="text-gray-700 text-xs text-right truncate max-w-32">
                          {driver.transportista || "Independiente"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9"
                        onClick={() => openEditDialog(driver)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden xs:inline">Editar</span>
                        <span className="xs:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200"
                        onClick={() => handleDeleteDriver(driver.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredDrivers.length === 0 && (
              <div className="text-center py-12 px-4">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conductores</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchTerm ? "No se encontraron conductores que coincidan con tu búsqueda." : "Comienza agregando tu primer conductor."}
                </p>
                {!searchTerm && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Conductor
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl text-gray-700">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Conductor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="license_number">Número de Licencia *</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="12345678"
              />
            </div>
            <div>
              <Label htmlFor="license_expiry">Vencimiento de Licencia</Label>
              <Input
                id="license_expiry"
                type="date"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="transportista">Transportista</Label>
              <Input
                id="transportista"
                value={formData.transportista}
                onChange={(e) => setFormData({ ...formData, transportista: e.target.value })}
                placeholder="Empresa de Transporte S.A."
              />
            </div>
            <Button
              onClick={handleCreateDriver}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.email || !formData.license_number || isLoading}
            >
              {isLoading ? "Creando..." : "Crear Conductor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-gray-700">
          <DialogHeader>
            <DialogTitle>Editar Conductor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-license">Número de Licencia *</Label>
              <Input
                id="edit-license"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-expiry">Vencimiento de Licencia</Label>
              <Input
                id="edit-expiry"
                type="date"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-transportista">Transportista</Label>
              <Input
                id="edit-transportista"
                value={formData.transportista}
                onChange={(e) => setFormData({ ...formData, transportista: e.target.value })}
              />
            </div>
            <Button
              onClick={handleEditDriver}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.email || !formData.license_number || isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
