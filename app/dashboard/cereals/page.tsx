"use client"

import { useState } from "react"
import { useData } from "@/contexts/offline-data-context"
import { useToasts } from "@/components/ui/toast"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Wheat } from "lucide-react"

export default function CerealsPage() {
  const { cereals = [], addCereal, updateCereal, deleteCereal, refreshData } = useData()
  const { showSuccess, showError, showProcessing } = useToasts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCereal, setSelectedCereal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    pricePerTon: "",
    variety: "",
    harvestYear: "",
    qualityGrade: "",
  })

  // Filtrar duplicados y asegurar keys únicos
  const uniqueCereals = cereals.filter((cereal, index, self) => 
    index === self.findIndex(c => c.id === cereal.id)
  )

  const handleCreateCereal = async () => {
    console.log("🚀 Iniciando handleCreateCereal")
    console.log("📝 FormData:", formData)
    
    if (formData.name && formData.code && formData.pricePerTon) {
      console.log("✅ Validación pasada, iniciando creación...")
      setIsLoading(true)
      showProcessing("Creando cereal...")
      
      try {
        console.log("📤 Enviando datos al contexto...")
        const dataToSend = {
          name: formData.name,
          code: formData.code.toUpperCase(),
          price_per_ton: Number(formData.pricePerTon),
        }
        console.log("📤 Datos a enviar:", dataToSend)
        
  await addCereal(dataToSend)
  // Refresh canonical data from server to avoid any stale/duplicate state
  try { await refreshData() } catch (e) { /* ignore */ }

  console.log("✅ addCereal completado exitosamente")
  showSuccess("Cereal creado", `${formData.name} ha sido agregado exitosamente`)
        
        setFormData({
          name: "",
          code: "",
          pricePerTon: "",
          variety: "",
          harvestYear: "",
          qualityGrade: "",
        })
        setIsCreateDialogOpen(false)
      } catch (error) {
        console.error("❌ Error en handleCreateCereal:", error)
        showError("Error al crear cereal", "No se pudo crear el cereal. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
        console.log("🏁 handleCreateCereal finalizado")
      }
    } else {
      console.log("❌ Validación fallida")
      console.log("name:", formData.name)
      console.log("code:", formData.code)
      console.log("pricePerTon:", formData.pricePerTon)
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  const handleEditCereal = async () => {
    if (selectedCereal && formData.name && formData.code && formData.pricePerTon) {
      setIsLoading(true)
      showProcessing("Actualizando cereal...")
      
      try {
        await updateCereal(selectedCereal.id, {
          name: formData.name,
          code: formData.code.toUpperCase(),
          price_per_ton: Number(formData.pricePerTon),
        })
        // Refresh server canonical data
        try { await refreshData() } catch (e) { /* ignore */ }

        showSuccess("Cereal actualizado", `${formData.name} ha sido actualizado exitosamente`)

        setIsEditDialogOpen(false)
        setSelectedCereal(null)
        setFormData({
          name: "",
          code: "",
          pricePerTon: "",
          variety: "",
          harvestYear: "",
          qualityGrade: "",
        })
      } catch (error) {
        showError("Error al actualizar cereal", "No se pudo actualizar el cereal. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      showError("Datos incompletos", "Por favor completa todos los campos obligatorios")
    }
  }

  const openEditDialog = (cereal: any) => {
    setSelectedCereal(cereal)
    setFormData({
      name: cereal.name || "",
      code: cereal.code || "",
      pricePerTon: cereal.price_per_ton?.toString() || "",
      variety: "",
      harvestYear: "",
      qualityGrade: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteCereal = async (cerealId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cereal?")) {
      showProcessing("Eliminando cereal...")
      
      try {
        setDeletingId(cerealId)
        await deleteCereal(cerealId)
        // Refresh canonical data
        try { await refreshData() } catch (e) { /* ignore */ }
        showSuccess("Cereal eliminado", "El cereal ha sido eliminado exitosamente")
      } catch (error) {
        showError("Error al eliminar cereal", "No se pudo eliminar el cereal. Intenta nuevamente.")
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Cereales</h1>
            <p className="text-muted-foreground text-sm">Gestiona los tipos de cereales y sus precios</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 self-start sm:self-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Nuevo Cereal</span>
            <span className="xs:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Tabla de Cereales */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cereales ({uniqueCereals.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden md:block p-6">
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
                  {uniqueCereals.map((cereal) => (
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
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(cereal)} title="Editar Cereal">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCereal(cereal.id)}
                            title="Eliminar Cereal"
                            disabled={deletingId !== null}
                            aria-busy={deletingId === cereal.id}
                          >
                            {deletingId === cereal.id ? (
                              <span className="text-xs">Eliminando...</span>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
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
              {uniqueCereals.map((cereal) => (
                <Card key={cereal.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    {/* Header with Cereal Name and Code */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Wheat className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{cereal.name}</div>
                          <div className="text-xs text-gray-500">ID: {cereal.id}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs ml-2">
                        {cereal.code}
                      </Badge>
                    </div>

                    {/* Price Information */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-500 mb-1">Precio por Tonelada</div>
                      <div className="text-lg font-bold text-green-600">
                        ${cereal.price_per_ton ? cereal.price_per_ton.toLocaleString() : "0"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9"
                        onClick={() => openEditDialog(cereal)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden xs:inline">Editar</span>
                        <span className="xs:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200"
                        onClick={() => handleDeleteCereal(cereal.id)}
                        title="Eliminar"
                        disabled={deletingId !== null}
                        aria-busy={deletingId === cereal.id}
                      >
                        {deletingId === cereal.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {uniqueCereals.length === 0 && (
              <div className="text-center py-12 px-4">
                <Wheat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cereales</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Comienza agregando tu primer tipo de cereal para gestionar los precios.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Cereal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-700">Crear Nuevo Cereal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-700">
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
              disabled={!formData.name || !formData.code || !formData.pricePerTon || isLoading}
            >
              {isLoading ? "Creando..." : "Crear Cereal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-gray-700">
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
              disabled={!formData.name || !formData.code || !formData.pricePerTon || isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
