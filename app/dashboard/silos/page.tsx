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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Warehouse, AlertTriangle } from "lucide-react"

export default function SilosPage() {
  const { silos = [], cereals = [], addSilo, updateSilo } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSilo, setSelectedSilo] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    cereal_type_id: "",
  })

  const handleCreateSilo = () => {
    if (formData.name && formData.capacity) {
      addSilo({
        name: formData.name,
        capacity: Number(formData.capacity),
        current_stock: 0,
        cereal_type_id: formData.cereal_type_id,
        is_active: true,
      })
      setFormData({
        name: "",
        capacity: "",
        cereal_type_id: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditSilo = () => {
    if (selectedSilo && formData.name && formData.capacity) {
      updateSilo(selectedSilo.id, {
        name: formData.name,
        capacity: Number(formData.capacity),
        cereal_type_id: formData.cereal_type_id,
      })
      setIsEditDialogOpen(false)
      setSelectedSilo(null)
      setFormData({
        name: "",
        capacity: "",
        cereal_type_id: "",
      })
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Silos</h1>
          <p className="text-muted-foreground">Gestiona y monitorea el estado de los silos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Silo
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                disabled={!formData.name || !formData.capacity}
              >
                Crear Silo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Silos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Silos ({silos.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(silo)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
              disabled={!formData.name || !formData.capacity}
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
