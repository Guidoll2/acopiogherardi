"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/offline-data-context"
import { useToasts } from "@/components/ui/toast"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Printer,
  Mail,
} from "lucide-react"

export default function ReportsPage() {
  const { clients, cerealTypes, operations, drivers, silos, refreshData, syncSiloStocks, isLoading } = useData()
  const { showSuccess, showError, showProcessing } = useToasts()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedCereal, setSelectedCereal] = useState("all")
  const [reportType, setReportType] = useState("operations")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Helper functions to get names from IDs
  const getClientName = (clientId: string) => {
    if (!clientId) return "Sin cliente"
    const client = clients.find(c => c.id === clientId)
    const result = client ? client.name : `Cliente ID: ${clientId}`
    return result
  }

  const getDriverName = (driverId: string) => {
    if (!driverId) return "Sin conductor"
    const driver = drivers.find(d => d.id === driverId)
    const result = driver ? driver.name : `Conductor ID: ${driverId}`
    return result
  }

  // Helper function to get cereal name from ID
  const getCerealName = (cerealId: string) => {
    if (!cerealId) return "Sin cereal"
    const cereal = cerealTypes.find(c => c.id === cerealId)
    const result = cereal ? cereal.name : `Cereal ID: ${cerealId}`
    return result
  }

  // Helper function to format dates safely
  const formatDate = (operation: any) => {
    // Try multiple date fields for backward compatibility
    const dateString = operation.created_at || operation.createdAt || operation.scheduled_date
    
    if (!dateString) {
      return "Sin fecha"
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return `Fecha inválida: ${dateString}`
      }
      return date.toLocaleDateString("es-AR")
    } catch (error) {
      return `Error en fecha: ${dateString}`
    }
  }

  // Filter operations based on current filters
  const getFilteredOperations = () => {
    let filtered = [...operations]

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(op => {
        const operationDate = new Date(op.created_at || op.createdAt || op.scheduled_date)
        return operationDate >= new Date(dateFrom)
      })
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // Include the entire day
      filtered = filtered.filter(op => {
        const operationDate = new Date(op.created_at || op.createdAt || op.scheduled_date)
        return operationDate <= toDate
      })
    }

    // Filter by client
    if (selectedClient !== "all") {
      filtered = filtered.filter(op => op.client_id === selectedClient)
    }

    // Filter by cereal
    if (selectedCereal !== "all") {
      filtered = filtered.filter(op => op.cereal_type_id === selectedCereal)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || a.scheduled_date)
      const dateB = new Date(b.created_at || b.createdAt || b.scheduled_date)
      return dateB.getTime() - dateA.getTime()
    })

    return filtered
  }

  const filteredOperations = getFilteredOperations()

  // Calculate statistics from real data
  const totalOperations = filteredOperations.length
  const ingresos = filteredOperations.filter(op => op.operation_type === "ingreso").length
  const egresos = filteredOperations.filter(op => op.operation_type === "egreso").length

  // Calculate stock data from silos
  const getStockData = () => {
    return silos.map(silo => {
      const cerealName = getCerealName(silo.cereal_type)
      const percentage = silo.capacity > 0 ? Math.round((silo.current_stock / silo.capacity) * 100) : 0
      
      return {
        silo: silo.name,
        cereal: cerealName,
        current: silo.current_stock,
        capacity: silo.capacity,
        percentage
      }
    })
  }

  const stockData = getStockData()
  const totalCapacity = silos.reduce((sum, silo) => sum + silo.capacity, 0)
  const totalCurrentStock = silos.reduce((sum, silo) => sum + silo.current_stock, 0)
  const totalAvailableSpace = totalCapacity - totalCurrentStock
  const totalOccupancy = totalCapacity > 0 ? Math.round((totalCurrentStock / totalCapacity) * 100) : 0

  // Button handlers
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Error generando reporte:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implementar descarga de PDF
  }

  const handleSyncStocks = async () => {
    setIsSyncing(true)
    showProcessing("Sincronizando stocks de silos...")
    
    try {
      await syncSiloStocks()
      showSuccess("Stocks sincronizados", "Los stocks de todos los silos han sido actualizados correctamente")
    } catch (error) {
      console.error("Error sincronizando stocks:", error)
      showError("Error en sincronización", "No se pudieron sincronizar los stocks de los silos")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleInitializeStocks = async () => {
    setIsSyncing(true)
    showProcessing("Inicializando stocks...")
    
    try {
      // Llamar a la API para inicializar stocks
      const response = await fetch('/api/silos/initialize-stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        showSuccess("Stocks inicializados", "Los stocks de los silos han sido inicializados correctamente");
        
        // Recargar datos
        await refreshData();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error inicializando stocks:", error)
      showError("Error en inicialización", "No se pudieron inicializar los stocks de los silos")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDownloadExcel = () => {
    // TODO: Implementar descarga de Excel
  }

  const handleRefreshData = async () => {
    try {
      await refreshData()
      showSuccess("Datos actualizados", "Los datos han sido recargados correctamente")
    } catch (error) {
      console.error("Error al actualizar datos:", error)
      showError("Error", "No se pudieron actualizar los datos")
    }
  }

  const handlePrintReport = () => {
    
    // Crear una nueva ventana para imprimir solo el contenido de la tabla
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    // Obtener el contenido de la tabla de operaciones
    const tableContent = document.querySelector('[data-print-content="operations-detail"]')
    if (!tableContent) {
      console.error("No se encontró el contenido a imprimir")
      return
    }
    
    // HTML para la ventana de impresión
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalle de Operaciones - 4 Granos</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #16a34a; 
              margin: 0;
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0; 
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
              font-size: 12px;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .badge {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
            }
            .badge-ingreso {
              background-color: #dcfce7;
              color: #166534;
            }
            .badge-egreso {
              background-color: #fef3c7;
              color: #92400e;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌾 4 Granos</h1>
            <p>Detalle de Operaciones</p>
            <p>Generado el: ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}</p>
          </div>
          ${tableContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `
    
    printWindow.document.write(printHTML)
    printWindow.document.close()
  }

  const handleEmailReport = () => {
    // TODO: Implementar envío por email
  }

  const handleApplyFilters = () => {
    // The filters are automatically applied through the getFilteredOperations function
  }

  const handleClearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setSelectedClient("all")
    setSelectedCereal("all")
  }

  const handleQuickFilter = (period: string) => {
    const today = new Date()
    const from = new Date()

    switch (period) {
      case "today":
        from.setDate(today.getDate())
        break
      case "week":
        from.setDate(today.getDate() - 7)
        break
      case "month":
        from.setMonth(today.getMonth() - 1)
        break
      case "quarter":
        from.setMonth(today.getMonth() - 3)
        break
    }

    setDateFrom(from.toISOString().split("T")[0])
    setDateTo(today.toISOString().split("T")[0])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-lg font-medium">Cargando datos...</p>
                <p className="text-sm text-muted-foreground">Por favor espera mientras obtenemos la información</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Reportes</h1>
            <p className="text-muted-foreground text-sm">Genera y analiza reportes de operaciones y stock</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 self-start sm:self-auto">
            <Button variant="outline" onClick={handleRefreshData} className="w-full xs:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Actualizar</span>
              <span className="xs:hidden">Actualizar</span>
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-green-600 hover:bg-green-700 w-full xs:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{isGenerating ? "Generando..." : "Generar Reporte"}</span>
              <span className="sm:hidden">{isGenerating ? "Generando..." : "Generar"}</span>
            </Button>
          </div>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>Configura los parámetros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operaciones</SelectItem>
                  <SelectItem value="stock">Stock de Silos</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="financial">Financiero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">Fecha Desde</Label>
              <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Fecha Hasta</Label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cereal">Cereal</Label>
              <Select value={selectedCereal} onValueChange={setSelectedCereal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cereales</SelectItem>
                  {cerealTypes.map((cereal) => (
                    <SelectItem key={cereal.id} value={cereal.id}>
                      {cereal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters - Mobile Optimized */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("today")} className="text-xs">
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("week")} className="text-xs">
                <span className="hidden xs:inline">Última Semana</span>
                <span className="xs:hidden">Semana</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("month")} className="text-xs">
                <span className="hidden xs:inline">Último Mes</span>
                <span className="xs:hidden">Mes</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("quarter")} className="text-xs">
                <span className="hidden sm:inline">Último Trimestre</span>
                <span className="sm:hidden">Trimestre</span>
              </Button>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 xs:justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full xs:w-auto">
                Limpiar
              </Button>
              <Button size="sm" onClick={handleApplyFilters} className="w-full xs:w-auto">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="operations" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Operaciones</span>
            <span className="xs:hidden">Op.</span>
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Stock</span>
            <span className="xs:hidden">St.</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Clientes</span>
            <span className="xs:hidden">Cl.</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Financiero</span>
            <span className="xs:hidden">Fin.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Operaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{totalOperations}</div>
                <p className="text-xs text-muted-foreground">
                  {dateFrom || dateTo ? "En el período seleccionado" : "Todas las operaciones"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{ingresos}</div>
                <p className="text-xs text-muted-foreground">
                  {totalOperations > 0 ? `${Math.round((ingresos / totalOperations) * 100)}% del total` : "0% del total"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Egresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{egresos}</div>
                <p className="text-xs text-muted-foreground">
                  {totalOperations > 0 ? `${Math.round((egresos / totalOperations) * 100)}% del total` : "0% del total"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  🚪 Control Garita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Esperando Entrada:</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {filteredOperations.filter(op => op.status === "autorizar_acceso").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">En Planta:</span>
                    <span className="text-sm font-bold text-blue-600">
                      {filteredOperations.filter(op => 
                        ["balanza_ingreso", "en_carga_descarga", "balanza_egreso"].includes(op.status)
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Esperando Salida:</span>
                    <span className="text-sm font-bold text-red-600">
                      {filteredOperations.filter(op => op.status === "autorizar_egreso").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Operaciones</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel} className="text-xs">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintReport} className="text-xs">
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Imprimir</span>
                  <span className="xs:hidden">Print</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0" data-print-content="operations-detail">
              {/* Desktop Table - Hidden on small screens */}
              <div className="hidden lg:block p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cereal</TableHead>
                      <TableHead>Cantidad (t)</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Patente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOperations.length > 0 ? (
                      filteredOperations.map((operation) => {
                        return (
                          <TableRow key={operation.id}>
                            <TableCell>{formatDate(operation)}</TableCell>
                            <TableCell>{getClientName(operation.client_id)}</TableCell>
                            <TableCell>
                              <Badge variant={operation.operation_type === "ingreso" ? "default" : "secondary"}>
                                {operation.operation_type === "ingreso" ? "Ingreso" : "Egreso"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getCerealName(operation.cereal_type_id)}</TableCell>
                            <TableCell className="font-mono">{operation.quantity?.toFixed(1) || operation.net_weight?.toFixed(1) || "0.0"}</TableCell>
                            <TableCell>{getDriverName(operation.driver_id)}</TableCell>
                            <TableCell className="font-mono">{operation.chassis_plate || "N/A"}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay operaciones que coincidan con los filtros seleccionados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Shown only on small screens */}
              <div className="lg:hidden space-y-3 p-4">
                {filteredOperations.length > 0 ? (
                  filteredOperations.map((operation) => (
                    <Card key={operation.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        {/* Header with Date and Type */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {formatDate(operation)}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{getClientName(operation.client_id)}</div>
                          </div>
                          <Badge variant={operation.operation_type === "ingreso" ? "default" : "secondary"} className="ml-2">
                            {operation.operation_type === "ingreso" ? "Ingreso" : "Egreso"}
                          </Badge>
                        </div>

                        {/* Operation Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs">Cereal</div>
                            <div className="font-medium">{getCerealName(operation.cereal_type_id)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Cantidad</div>
                            <div className="font-bold text-lg">{(operation.quantity?.toFixed(1) || operation.net_weight?.toFixed(1) || "0.0")}t</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Conductor</div>
                            <div className="font-medium truncate">{getDriverName(operation.driver_id)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Patente</div>
                            <div className="font-mono font-medium">{operation.chassis_plate || "N/A"}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay operaciones que coincidan con los filtros seleccionados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{totalCapacity.toLocaleString()}t</div>
                <p className="text-xs text-muted-foreground">Todos los silos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{totalCurrentStock.toLocaleString()}t</div>
                <p className="text-xs text-muted-foreground">{totalOccupancy}% ocupación</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Espacio Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{totalAvailableSpace.toLocaleString()}t</div>
                <p className="text-xs text-muted-foreground">{100 - totalOccupancy}% disponible</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de Silos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table - Hidden on small screens */}
              <div className="hidden md:block p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Silo</TableHead>
                      <TableHead>Cereal</TableHead>
                      <TableHead>Stock Actual</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Ocupación</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.length > 0 ? (
                      stockData.map((silo, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{silo.silo}</TableCell>
                          <TableCell>{silo.cereal}</TableCell>
                          <TableCell className="font-mono">{silo.current.toLocaleString()}t</TableCell>
                          <TableCell className="font-mono">{silo.capacity.toLocaleString()}t</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    silo.percentage >= 90
                                      ? "bg-red-500"
                                      : silo.percentage >= 70
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${silo.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-mono">{silo.percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                silo.percentage >= 90 ? "default" : silo.percentage >= 70 ? "default" : "secondary"
                              }
                            >
                              {silo.percentage >= 90 ? "Crítico" : silo.percentage >= 70 ? "Alto" : "Normal"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No hay silos configurados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Shown only on small screens */}
              <div className="md:hidden space-y-3 p-4">
                {stockData.length > 0 ? (
                  stockData.map((silo, index) => (
                    <Card key={index} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        {/* Header with Silo Name and Status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{silo.silo}</div>
                            <div className="text-sm text-gray-500">{silo.cereal}</div>
                          </div>
                          <Badge
                            variant={
                              silo.percentage >= 90 
                                ? "default" 
                                : silo.percentage >= 70 
                                  ? "default" 
                                  : "secondary"
                            }
                            className={
                              silo.percentage >= 90 
                                ? "bg-red-100 text-red-800 border-red-200" 
                                : silo.percentage >= 70 
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                                  : ""
                            }
                          >
                            {silo.percentage >= 90 ? "Crítico" : silo.percentage >= 70 ? "Alto" : "Normal"}
                          </Badge>
                        </div>

                        {/* Capacity Information */}
                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs">Stock Actual</div>
                            <div className="font-bold text-lg">{silo.current.toLocaleString()}t</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Capacidad</div>
                            <div className="font-medium">{silo.capacity.toLocaleString()}t</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Ocupación</span>
                            <span className="font-mono font-medium">{silo.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                silo.percentage >= 90
                                  ? "bg-red-500"
                                  : silo.percentage >= 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${silo.percentage}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay silos configurados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de sincronización de stocks */}
          <div className="flex gap-2 justify-end">
            <Button 
              onClick={handleInitializeStocks}
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Inicializando..." : "Inicializar Stocks"}
            </Button>
            <Button 
              onClick={handleSyncStocks}
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Stocks"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análisis de Clientes</CardTitle>
              <CardDescription className="text-sm">Rendimiento y actividad por cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Reporte de clientes en desarrollo</p>
                <p className="text-xs sm:text-sm">Próximamente disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporte Financiero</CardTitle>
              <CardDescription className="text-sm">Análisis de ingresos y costos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Reporte financiero en desarrollo</p>
                <p className="text-xs sm:text-sm">Próximamente disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
