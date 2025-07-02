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
import { Plus, Edit, Trash2, Wheat } from "lucide-react"

export default function CerealsPage() {
  const { cereals = [], addCereal, updateCereal, deleteCereal } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCereal, setSelectedCereal] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    pricePerTon: "",
  })

  const handleCreateCereal = () => {
    if (formData.name && formData.code && formData.pricePerTon) {
      addCereal({
        name: formData.name,
        code: formData.code.toUpperCase(),
        price_per_ton: Number(formData.pricePerTon),
      })
      setFormData({
        name: "",
        code: "",
        pricePerTon: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditCereal = () => {
    if (selectedCereal && formData.name && formData.code && formData.pricePerTon) {
      updateCereal(selectedCereal.id, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        price_per_ton: Number(formData.pricePerTon),
      })
      setIsEditDialogOpen(false)
      setSelectedCereal(null)
      setFormData({
        name: "",
        code: "",
        pricePerTon: "",
      })
    }
  }

  const openEditDialog = (cereal: any) => {
    setSelectedCereal(cereal)
    setFormData({
      name: cereal.name || "",
      code: cereal.code || "",
      pricePerTon: cereal.price_per_ton?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteCereal = (cerealId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cereal?")) {
      deleteCereal(cerealId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cereales</h1>
          <p className="text-muted-foreground">Gestiona los tipos de cereales y sus precios</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cereal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cereal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Soja"
                />
              </div>
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SOJ"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="price">Precio por Tonelada *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerTon}
                  onChange={(e) => setFormData({ ...formData, pricePerTon: e.target.value })}
                  placeholder="45000"
                />
              </div>
              <Button
                onClick={handleCreateCereal}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!formData.name || !formData.code || !formData.pricePerTon}
              >
                Crear Cereal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Cereales */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cereales ({cereals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cereal</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Precio por Tonelada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cereals.map((cereal) => (
                <TableRow key={cereal.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Wheat className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="font-medium">{cereal.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {cereal.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${cereal.price_per_ton ? cereal.price_per_ton.toLocaleString() : "0"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(cereal)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCereal(cereal.id)}>
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
            <DialogTitle>Editar Cereal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-code">Código *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                maxLength={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Precio por Tonelada *</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.pricePerTon}
                onChange={(e) => setFormData({ ...formData, pricePerTon: e.target.value })}
              />
            </div>
            <Button
              onClick={handleEditCereal}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.code || !formData.pricePerTon}
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
