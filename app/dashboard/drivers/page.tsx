"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, User, Phone, Mail, CreditCard } from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
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

  const handleCreateDriver = () => {
    if (formData.name && formData.email && formData.license_number) {
      addDriver({
        ...formData,
        is_active: true,
        status: "active",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        license_number: "",
        license_expiry: "",
        transportista: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditDriver = () => {
    if (selectedDriver && formData.name && formData.email && formData.license_number) {
      updateDriver(selectedDriver.id, formData)
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

  const handleDeleteDriver = (driverId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este conductor?")) {
      deleteDriver(driverId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conductores</h1>
          <p className="text-muted-foreground">Gestiona la información de los conductores</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Conductor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                disabled={!formData.name || !formData.email || !formData.license_number}
              >
                Crear Conductor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
        <CardContent>
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
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(driver)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDriver(driver.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
              disabled={!formData.name || !formData.email || !formData.license_number}
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
