"use client"

import { useState } from "react"
import Link from "next/link"
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

export default function OperationsPage() {
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
  } = useData()
  const user = AuthService.getCurrentUser()

  // Mock data for demonstration
  const mockOperations = [
    {
      id: "1",
      client_id: "1",
      operation_type: "ingreso",
      status: "pendiente",
      chassis_plate: "ABC123",
      trailer_plate: "TRL456",
      quantity: 25.5,
      tare_weight: 8500,
      gross_weight: 34000,
      net_weight: 25500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cereal_type_id: "1",
      silo_id: "1",
      driver_id: "1",
      notes: "Operación de prueba",
    },
    {
      id: "2",
      client_id: "2",
      operation_type: "egreso",
      status: "autorizar_acceso",
      chassis_plate: "XYZ789",
      trailer_plate: "TRL789",
      quantity: 18.2,
      tare_weight: 9000,
      gross_weight: 27200,
      net_weight: 18200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cereal_type_id: "2",
      silo_id: "2",
      driver_id: "2",
      notes: "",
    },
    {
      id: "3",
      client_id: "1",
      operation_type: "ingreso",
      status: "balanza_ingreso",
      chassis_plate: "DEF456",
      trailer_plate: "",
      quantity: 30.0,
      tare_weight: 7800,
      gross_weight: 37800,
      net_weight: 30000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cereal_type_id: "3",
      silo_id: "3",
      driver_id: "3",
      notes: "Carga completa",
    },
  ]

  const mockClients = [
    { id: "1", name: "Estancia La Esperanza" },
    { id: "2", name: "Agropecuaria San Martín" },
  ]

  const mockCereals = [
    { id: "1", name: "Soja", code: "SOJ" },
    { id: "2", name: "Maíz", code: "MAI" },
    { id: "3", name: "Trigo", code: "TRI" },
  ]

  const displayOperations = operations.length > 0 ? operations : mockOperations
  const displayClients = clients.length > 0 ? clients : mockClients
  const displayCereals = cerealTypes.length > 0 ? cerealTypes : mockCereals

  // Filter operations based on search and filters
  const filteredOperations = displayOperations.filter((operation) => {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
      autorizar_acceso: { label: "Autorizar Acceso", color: "bg-yellow-100 text-yellow-800" },
      balanza_ingreso: { label: "Balanza Ingreso", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "Carga/Descarga", color: "bg-orange-100 text-orange-800" },
      balanza_egreso: { label: "Balanza Egreso", color: "bg-purple-100 text-purple-800" },
      autorizar_egreso: { label: "Autorizar Egreso", color: "bg-indigo-100 text-indigo-800" },
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
    pendiente: displayOperations.filter((op) => op.status === "pendiente").length,
    autorizar_acceso: displayOperations.filter((op) => op.status === "autorizar_acceso").length,
    balanza_ingreso: displayOperations.filter((op) => op.status === "balanza_ingreso").length,
    en_carga_descarga: displayOperations.filter((op) => op.status === "en_carga_descarga").length,
    balanza_egreso: displayOperations.filter((op) => op.status === "balanza_egreso").length,
    autorizar_egreso: displayOperations.filter((op) => op.status === "autorizar_egreso").length,
    completado: displayOperations.filter((op) => op.status === "completado").length,
  }

  // Button action handlers
  const handleViewOperation = (operationId: string) => {
    console.log("🔍 Ver operación:", operationId)
    setSelectedOperation(operationId)
  }

  const handleEditOperation = (operationId: string) => {
    console.log("✏️ Editar operación:", operationId)
    setEditingOperation(operationId)
  }

  const handlePrintOperation = (operationId: string) => {
    console.log("🖨️ Imprimir operación:", operationId)
    const printUrl = `/dashboard/operations/print/${operationId}`
    window.open(printUrl, "_blank", "width=800,height=600")
  }

  const handleAdvanceStatus = async (operationId: string) => {
    console.log("⏭️ Avanzar estado operación:", operationId)
    setAdvancingOperation(operationId)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const operation = displayOperations.find((op) => op.id === operationId)
      if (operation) {
        type StatusType =
          | "pendiente"
          | "autorizar_acceso"
          | "balanza_ingreso"
          | "en_carga_descarga"
          | "balanza_egreso"
          | "autorizar_egreso"
          | "completado"

        const statusFlow: Record<Exclude<StatusType, "completado">, StatusType> = {
          pendiente: "autorizar_acceso",
          autorizar_acceso: "balanza_ingreso",
          balanza_ingreso: "en_carga_descarga",
          en_carga_descarga: "balanza_egreso",
          balanza_egreso: "autorizar_egreso",
          autorizar_egreso: "completado",
        }

        const nextStatus = statusFlow[operation.status as Exclude<StatusType, "completado">]
        if (nextStatus && updateOperation) {
          updateOperation(operationId, { status: nextStatus })
        }
      }
    } catch (error) {
      console.error("Error advancing status:", error)
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operaciones</h2>
          <p className="text-muted-foreground text-sm">Panel de control de operaciones en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetData}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetear Datos
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Link href="/dashboard/operations/new">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleNewOperation}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Operación
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-7">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{activeCounts.pendiente}</div>
            <div className="text-xs text-muted-foreground">Pendiente</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{activeCounts.autorizar_acceso}</div>
            <div className="text-xs text-muted-foreground">Autorizar Acceso</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeCounts.balanza_ingreso}</div>
            <div className="text-xs text-muted-foreground">Balanza Ingreso</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activeCounts.en_carga_descarga}</div>
            <div className="text-xs text-muted-foreground">Carga/Descarga</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{activeCounts.balanza_egreso}</div>
            <div className="text-xs text-muted-foreground">Balanza Egreso</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{activeCounts.autorizar_egreso}</div>
            <div className="text-xs text-muted-foreground">Autorizar Egreso</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeCounts.completado}</div>
            <div className="text-xs text-muted-foreground">Completado</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, patente, silo o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="relative">
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleFilterToggle}>
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-10">
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
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Cliente / Patente</TableHead>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="w-32">Estado</TableHead>
                <TableHead className="w-24">Cantidad</TableHead>
                <TableHead className="w-24">Hora</TableHead>
                <TableHead className="w-48">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => {
                const client = displayClients.find((c) => c.id === operation.client_id)
                const cereal = displayCereals.find((c) => c.id === operation.cereal_type_id)

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
                      {new Date(operation.updated_at).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleViewOperation(operation.id)}
                          title="Ver operación"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditOperation(operation.id)}
                          title="Editar operación"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handlePrintOperation(operation.id)}
                          title="Imprimir operación"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        {operation.status !== "completado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleAdvanceStatus(operation.id)}
                            disabled={advancingOperation === operation.id}
                            title="Avanzar estado"
                          >
                            {advancingOperation === operation.id ? (
                              <Clock className="h-3 w-3 animate-spin" />
                            ) : (
                              <ArrowRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OperationViewDialog
        operationId={selectedOperation}
        open={!!selectedOperation}
        onOpenChange={(open) => !open && setSelectedOperation(null)}
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
  )
}
