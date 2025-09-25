"use client"

import { useState } from "react"
import Link from "next/link"
import { usePageReady } from "@/hooks/use-page-ready"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Filter,
  ChevronDown,
  Printer,
  RefreshCw,
  RotateCcw,
  ArrowRight,
  Clock,
} from "lucide-react"
import { useData } from "@/contexts/data-context"
import { AuthService } from "@/lib/auth"
import { OperationViewDialog } from "@/components/operations/operation-view-dialog"
import { OperationEditDialog } from "@/components/operations/operation-edit-dialog"
import { OperationStatusDialog } from "@/components/operations/operation-status-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function OperationsPage() {
  const { markPageAsReady } = usePageReady()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [editingOperation, setEditingOperation] = useState<string | null>(null)
  const [statusOperation, setStatusOperation] = useState<string | null>(null)
  const [advancingOperation, setAdvancingOperation] = useState<string | null>(null)

  const {
    operations = [],
    clients = [],
    silos = [],
    cerealTypes = [],
    companies = [],
    drivers = [],
    updateOperation,
    deleteOperation,
    resetData,
    isLoading,
  } = useData()
  const user = AuthService.getCurrentUser()

  // Usar solo operaciones reales de la base de datos
  const displayOperations = operations || []
  const displayClients = clients || []
  const displayCereals = cerealTypes || []

  // Filter and sort operations based on search and filters
  const filteredOperations = displayOperations
    .filter((operation) => {
      const client = displayClients.find((c) => c.id === operation.client_id)
      const cereal = displayCereals.find((c) => c.id === operation.cereal_type_id)

      const matchesSearch =
        operation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.chassis_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cereal?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || operation.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Ordenar por fecha de creación, más nuevas primero
      const dateA = new Date(a.created_at || a.createdAt).getTime()
      const dateB = new Date(b.created_at || b.createdAt).getTime()
      return dateB - dateA
    })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      pendiente: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      autorizar_acceso: { label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800" },
      balanza_ingreso: { label: "Balanza Ingreso", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "Carga/Descarga", color: "bg-orange-100 text-orange-800" },
      balanza_egreso: { label: "Balanza Egreso", color: "bg-purple-100 text-purple-800" },
      autorizar_egreso: { label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800" },
      completed: { label: "Completado", color: "bg-green-100 text-green-800" },
      completado: { label: "Completado", color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant="secondary"
        className={type === "ingreso" ? "border-green-200 text-green-700" : "border-orange-200 text-orange-700"}
      >
        {type === "ingreso" ? "Ingreso" : "Egreso"}
      </Badge>
    )
  }

  // Count operations by status
  const activeCounts = {
    pendiente: displayOperations.filter((op) => op.status === "pendiente" || op.status === "pending").length,
    autorizar_acceso: displayOperations.filter((op) => op.status === "autorizar_acceso").length,
    balanza_ingreso: displayOperations.filter((op) => op.status === "balanza_ingreso").length,
    en_carga_descarga: displayOperations.filter((op) => op.status === "en_carga_descarga").length,
    balanza_egreso: displayOperations.filter((op) => op.status === "balanza_egreso").length,
    autorizar_egreso: displayOperations.filter((op) => op.status === "autorizar_egreso").length,
    completado: displayOperations.filter((op) => op.status === "completado" || op.status === "completed").length,
  }

  // Button action handlers
  const handleViewOperation = (operationId: string) => {
    console.log("🔍 Ver operación clicked:", operationId)
    console.log("📊 Total operations:", operations?.length || 0)
    console.log("🔍 Operation exists:", operations?.find(op => op.id === operationId) ? "YES" : "NO")
    setSelectedOperation(operationId)
    console.log("✅ selectedOperation state set to:", operationId)
  }

  const handleEditOperation = (operationId: string) => {
    console.log("✏️ Editar operación clicked:", operationId)
    setEditingOperation(operationId)
    console.log("✅ editingOperation state set to:", operationId)
  }

  const handlePrintOperation = (operationId: string) => {
    console.log("🖨️ Imprimir operación:", operationId)
    const printUrl = `/dashboard/operations/print/${operationId}`
    window.open(printUrl, "_blank", "width=800,height=600")
  }

  const handleAdvanceStatus = async (operationId: string) => {
    console.log("⏭️ Avanzar estado operación:", operationId)
    console.log("📊 Total operations disponibles:", operations?.length || 0)
    console.log("🔍 Operations IDs:", operations?.map(op => ({ 
      id: op.id, 
      type: typeof op.id,
      _id: (op as any)._id,
      keys: Object.keys(op) 
    })) || [])
    
    setAdvancingOperation(operationId)

    try {
      let operation = operations.find((op) => op.id === operationId)
      
      if (!operation) {
        console.error("Operación no encontrada con ID exacto:", operationId)
        console.log("🔍 Intentando búsqueda flexible...")
        
        // Intentar búsqueda flexible
        operation = operations.find((op) => String(op.id) === String(operationId))
        
        if (!operation) {
          console.log("❌ Operación no encontrada incluso con búsqueda flexible")
          alert(`Operación no encontrada. ID buscado: ${operationId}`)
          return
        } else {
          console.log("✅ Operación encontrada con búsqueda flexible")
        }
      }

      const statusFlow = {
        pending: "autorizar_acceso",
        pendiente: "autorizar_acceso",
        autorizar_acceso: "balanza_ingreso",
        balanza_ingreso: "en_carga_descarga",
        en_carga_descarga: "balanza_egreso",
        balanza_egreso: "autorizar_egreso",
        autorizar_egreso: "completado",
      }

      const nextStatus = statusFlow[operation.status as keyof typeof statusFlow]
      if (!nextStatus) {
        console.log("No hay siguiente estado para:", operation.status)
        alert(`La operación ya está en estado final: ${operation.status}`)
        return
      }

      console.log(`Cambiando estado de ${operation.status} a ${nextStatus}`)

      // Llamar a la API para actualizar el estado
      const response = await fetch(`/api/operations/${operation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          ...operation,
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error actualizando operación")
      }

      // Actualizar en el contexto local
      if (updateOperation) {
        updateOperation(String(operation.id), { 
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
      }

      console.log("✅ Estado actualizado exitosamente")

    } catch (error) {
      console.error("❌ Error advancing status:", error)
      alert(`Error al avanzar el estado de la operación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setAdvancingOperation(null)
    }
  }

  const handleStatusUpdate = (operationId: string) => {
    console.log("📊 Actualizar estado operación:", operationId)
    setStatusOperation(operationId)
  }

  const handleRefresh = () => {
    console.log("🔄 Refrescando operaciones...")
    window.location.reload()
  }

  const handleResetData = () => {
    console.log("🔄 Reseteando datos...")
    if (resetData) {
      resetData()
    }
  }

  const handleNewOperation = () => {
    console.log("➕ Nueva operación - navegando...")
  }

  const handleFilterToggle = () => {
    console.log("🔽 Toggle filtros:", !showFilters)
    setShowFilters(!showFilters)
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando operaciones...</h2>
            <p className="text-sm text-gray-500">
              Obteniendo datos del sistema
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Operaciones</h2>
            <p className="text-muted-foreground text-sm">Panel de control de operaciones en tiempo real</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" size="sm" onClick={handleResetData} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Resetear Datos</span>
              <span className="sm:hidden">Resetear</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Link href="/dashboard/operations/new" className="w-full sm:w-auto">
              <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={handleNewOperation}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Operación
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-600">{activeCounts.pendiente}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Pendiente</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{activeCounts.autorizar_acceso}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Autorizar Acceso</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{activeCounts.balanza_ingreso}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Balanza Ingreso</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{activeCounts.en_carga_descarga}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Carga/Descarga</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{activeCounts.balanza_egreso}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Balanza Egreso</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-indigo-600">{activeCounts.autorizar_egreso}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Autorizar Egreso</div>
            </div>
          </Card>
          <Card className="p-2 sm:p-3">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{activeCounts.completado}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completado</div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, patente, silo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleFilterToggle} className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute top-full right-0 left-0 sm:left-auto mt-2 w-full sm:w-80 bg-white border rounded-lg shadow-lg p-4 z-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Estado</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="autorizar_acceso">Autorizar Acceso</option>
                      <option value="balanza_ingreso">Balanza Ingreso</option>
                      <option value="en_carga_descarga">Carga/Descarga</option>
                      <option value="balanza_egreso">Balanza Egreso</option>
                      <option value="autorizar_egreso">Autorizar Egreso</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setStatusFilter("all")
                      setCompanyFilter("all")
                      setDateFilter("all")
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Operations Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Control de Operaciones</CardTitle>
              <CardDescription>{filteredOperations.length} operaciones</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Cliente / Patente</TableHead>
                    <TableHead className="w-20">Tipo</TableHead>
                    <TableHead className="w-32">Estado</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-32">Fecha/Hora</TableHead>
                    <TableHead className="w-72">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.map((operation) => {
                    // Función helper para encontrar entidades con fallback
                    const findEntityWithFallback = (entities: any[], targetId: string, entityType: string) => {
                      if (!entities || !targetId) return null
                      
                      // Primero buscar por ID exacto
                      let found = entities.find((entity) => entity.id === targetId)
                      if (found) return found
                      
                      // Si no se encuentra y es un ID de ejemplo, usar el primer disponible
                      if (targetId.startsWith(entityType.toLowerCase() + '-')) {
                        return entities[0] || null
                      }
                      
                      return null
                    }
                    
                    const client = findEntityWithFallback(displayClients, operation.client_id, 'client')
                    const cereal = findEntityWithFallback(displayCereals, operation.cereal_type_id, 'cereal')

                    return (
                      <TableRow key={operation.id} className="h-14">
                        <TableCell className="font-medium text-sm">#{operation.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{client?.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{operation.chassis_plate}</div>
                            <div className="text-xs text-muted-foreground">{cereal?.name || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(operation.operation_type)}</TableCell>
                        <TableCell>{getStatusBadge(operation.status)}</TableCell>
                        <TableCell className="text-sm">
                          {operation.quantity > 0 ? `${operation.quantity.toFixed(1)} t` : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <div className="font-medium">
                              {new Date(operation.created_at || operation.createdAt).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(operation.created_at || operation.createdAt).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-blue-50"
                              onClick={() => handleViewOperation(operation.id)}
                              title="Ver operación"
                            >
                              <Eye className="h-5 w-5 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-green-50"
                              onClick={() => handleEditOperation(operation.id)}
                              title="Editar operación"
                            >
                              <Edit className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-purple-50"
                              onClick={() => handlePrintOperation(operation.id)}
                              title="Imprimir operación"
                            >
                              <Printer className="h-5 w-5 text-purple-600" />
                            </Button>
                            {operation.status !== "completado" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                onClick={() => handleAdvanceStatus(operation.id)}
                                disabled={advancingOperation === operation.id}
                                title="Avanzar estado"
                              >
                                {advancingOperation === operation.id ? (
                                  <Clock className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                )}
                                Avanzar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs hover:bg-gray-50"
                              onClick={() => handleStatusUpdate(operation.id)}
                              title="Actualizar estado"
                            >
                              Estado
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards - Shown only on small screens */}
            <div className="md:hidden space-y-4 p-3">
              {filteredOperations.map((operation) => {
                const findEntityWithFallback = (entities: any[], targetId: string, entityType: string) => {
                  if (!entities || !targetId) return null
                  
                  // Primero buscar por ID exacto
                  let found = entities.find((entity) => entity.id === targetId)
                  if (found) return found
                  
                  // Si no se encuentra y es un ID de ejemplo, usar el primer disponible
                  if (targetId.startsWith(entityType.toLowerCase() + '-')) {
                    return entities[0] || null
                  }
                  
                  return null
                }
                
                const client = findEntityWithFallback(displayClients, operation.client_id, 'client')
                const cereal = findEntityWithFallback(displayCereals, operation.cereal_type_id, 'cereal')

                return (
                  <Card key={operation.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      {/* Header with ID and Type - simplified */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-base text-blue-600">#{operation.id}</span>
                        {getTypeBadge(operation.operation_type)}
                      </div>

                      {/* Date and Time - moved below ID */}
                      <div className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">
                          {new Date(operation.created_at || operation.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(operation.created_at || operation.createdAt).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Client and Vehicle Info */}
                      <div className="mb-3 space-y-1">
                        <div className="font-medium text-sm text-gray-900">{client?.name || "N/A"}</div>
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{operation.chassis_plate}</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{cereal?.name || "N/A"}</span>
                        </div>
                      </div>

                      {/* Status and Quantity */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex-1">
                          {getStatusBadge(operation.status)}
                        </div>
                        <span className="text-base font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                          {operation.quantity > 0 ? `${operation.quantity.toFixed(1)} t` : "—"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50"
                            onClick={() => handleViewOperation(operation.id)}
                            title="Ver operación"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-green-50"
                            onClick={() => handleEditOperation(operation.id)}
                            title="Editar operación"
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-purple-50"
                            onClick={() => handlePrintOperation(operation.id)}
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4 text-purple-600" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {operation.status !== "completado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                              onClick={() => handleAdvanceStatus(operation.id)}
                              disabled={advancingOperation === operation.id}
                              title="Avanzar estado"
                            >
                              {advancingOperation === operation.id ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Avanzar</span>
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-xs hover:bg-gray-50"
                            onClick={() => handleStatusUpdate(operation.id)}
                            title="Actualizar estado"
                          >
                            <span className="hidden sm:inline">Estado</span>
                            <span className="sm:hidden">•••</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <OperationViewDialog
          operationId={selectedOperation}
          open={!!selectedOperation}
          onOpenChange={(open) => {
            console.log("🔄 Dialog onOpenChange called:", { open, selectedOperation })
            if (!open) {
              setSelectedOperation(null)
            }
          }}
        />

        <OperationEditDialog
          operationId={editingOperation}
          open={!!editingOperation}
          onOpenChange={(open) => !open && setEditingOperation(null)}
        />

        <OperationStatusDialog
          operationId={statusOperation}
          open={!!statusOperation}
          onOpenChange={(open) => !open && setStatusOperation(null)}
        />
        </div>
      )}
    </DashboardLayout>
  )
}
