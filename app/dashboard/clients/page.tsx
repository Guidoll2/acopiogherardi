"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Scale,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

export default function ClientsPage() {
  const { clients = [], operations = [], drivers = [], cereals = [], addClient, updateClient, deleteClient } = useData()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
    contact_person: "",
  })

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tax_id?.includes(searchTerm),
  )

  // Reemplazar la función formatDateTime con una versión más robusta:

  const formatDateTime = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A"

    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString
      if (isNaN(date.getTime())) return "N/A"

      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
  }

  // También actualizar la función getClientOperations para manejar fechas correctamente:

  const getClientOperations = (clientId: string) => {
    return operations
      .filter((op) => op.client_id === clientId && op.status === "completado")
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      .map((operation) => {
        const driver = drivers.find((d) => d.id === operation.driver_id)
        const cereal = cereals.find((c) => c.id === operation.cereal_type_id)
        return {
          ...operation,
          type: operation.operation_type, // Ensure 'operation_type' is present
          driver_name: driver?.name || "N/A",
          cereal_name: cereal?.name || "N/A",
          net_weight_tons: operation.net_weight ? operation.net_weight / 1000 : 0,
          display_date: operation.created_at || new Date().toISOString(),
        }
      })
  }

  const handleCreateClient = () => {
    if (formData.name && formData.email && formData.tax_id) {
      addClient({
        ...formData,
        status: "active",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        tax_id: "",
        contact_person: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditClient = () => {
    if (selectedClient && formData.name && formData.email && formData.tax_id) {
      updateClient(selectedClient.id, formData)
      setIsEditDialogOpen(false)
      setSelectedClient(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        tax_id: "",
        contact_person: "",
      })
    }
  }

  const openEditDialog = (client: any) => {
    setSelectedClient(client)
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      tax_id: client.tax_id || "",
      contact_person: client.contact_person || "",
    })
    setIsEditDialogOpen(true)
  }

  const openAccountDialog = (client: any) => {
    setSelectedClient(client)
    setIsAccountDialogOpen(true)
  }

  const handleDeleteClient = (clientId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      deleteClient(clientId)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Administra la información de los clientes y sus cuentas corrientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tax_id">CUIT/CUIL *</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="20123456789"
                  maxLength={11}
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Estancia La Esperanza S.A."
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
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
                <Label htmlFor="contact_person">Persona de Contacto</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ruta 9 Km 45, Buenos Aires"
                />
              </div>
              <Button
                onClick={handleCreateClient}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!formData.name || !formData.email || !formData.tax_id}
              >
                Crear Cliente
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
              placeholder="Buscar por nombre, email, teléfono, contacto o CUIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Persona de Contacto</TableHead>
                <TableHead>CUIT/CUIL</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {client.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.contact_person}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{client.tax_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{client.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openAccountDialog(client)}>
                        <Scale className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(client)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}>
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

      {/* Dialog de Cuenta Corriente */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5" />
              <span>Cuenta Corriente - {selectedClient?.name}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Operaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Operación</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>Cereal</TableHead>
                      <TableHead>Ingreso (Tn)</TableHead>
                      <TableHead>Salida (Tn)</TableHead>
                      <TableHead>Chofer</TableHead>
                      <TableHead>Ver Operación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getClientOperations(selectedClient.id).map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell className="font-mono text-sm">
                          <Badge variant="secondary">#{operation.id}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{formatDateTime(operation.display_date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{operation.cereal_name}</Badge>
                        </TableCell>
                        <TableCell>
                          {operation.type === "ingreso" ? (
                            <div className="flex items-center space-x-1 text-green-600 font-bold">
                              <TrendingUp className="h-4 w-4" />
                              <span>{formatNumber(operation.net_weight_tons)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {operation.type === "egreso" ? (
                            <div className="flex items-center space-x-1 text-red-600 font-bold">
                              <TrendingDown className="h-4 w-4" />
                              <span>{formatNumber(operation.net_weight_tons)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {operation.driver_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{operation.driver_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {getClientOperations(selectedClient.id).length === 0 && (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay operaciones completadas para este cliente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-tax">CUIT/CUIL *</Label>
              <Input
                id="edit-tax"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="20123456789"
                maxLength={11}
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
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
              <Label htmlFor="edit-contact">Persona de Contacto</Label>
              <Input
                id="edit-contact"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Dirección</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Button
              onClick={handleEditClient}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.email || !formData.tax_id}
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
