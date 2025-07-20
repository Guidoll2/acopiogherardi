"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
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
  const { clients, cerealTypes, operations } = useData()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedCereal, setSelectedCereal] = useState("all")
  const [reportType, setReportType] = useState("operations")
  const [isGenerating, setIsGenerating] = useState(false)

  const mockOperationsData = [
    {
      id: "1",
      date: "2024-01-15",
      client: "Estancia La Esperanza",
      type: "ingreso",
      cereal: "Soja",
      quantity: 25.5,
      driver: "Carlos Mendez",
      truck: "ABC123",
    },
    {
      id: "2",
      date: "2024-01-15",
      client: "Agropecuaria San Martín",
      type: "egreso",
      cereal: "Maíz",
      quantity: 18.2,
      driver: "Ana Rodriguez",
      truck: "XYZ789",
    },
    {
      id: "3",
      date: "2024-01-16",
      client: "Cooperativa del Norte",
      type: "ingreso",
      cereal: "Trigo",
      quantity: 30.0,
      driver: "Luis Garcia",
      truck: "DEF456",
    },
  ]

  const mockStockData = [
    { silo: "Silo A1", cereal: "Soja", current: 850, capacity: 1000, percentage: 85 },
    { silo: "Silo B2", cereal: "Maíz", current: 1200, capacity: 1500, percentage: 80 },
    { silo: "Silo C3", cereal: "Trigo", current: 600, capacity: 2000, percentage: 30 },
  ]

  // Button handlers
  const handleGenerateReport = async () => {
    console.log("📊 Generando reporte:", {
      type: reportType,
      dateFrom,
      dateTo,
      client: selectedClient,
      cereal: selectedCereal,
    })

    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("✅ Reporte generado exitosamente")
    } catch (error) {
      console.error("❌ Error generando reporte:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    console.log("📄 Descargando reporte en PDF...")
  }

  const handleDownloadExcel = () => {
    console.log("📊 Descargando reporte en Excel...")
  }

  const handlePrintReport = () => {
    console.log("🖨️ Imprimiendo reporte...")
    window.print()
  }

  const handleEmailReport = () => {
    console.log("📧 Enviando reporte por email...")
  }

  const handleRefreshData = () => {
    console.log("🔄 Actualizando datos...")
  }

  const handleApplyFilters = () => {
    console.log("🔍 Aplicando filtros:", {
      dateFrom,
      dateTo,
      client: selectedClient,
      cereal: selectedCereal,
    })
  }

  const handleClearFilters = () => {
    console.log("🧹 Limpiando filtros...")
    setDateFrom("")
    setDateTo("")
    setSelectedClient("all")
    setSelectedCereal("all")
  }

  const handleQuickFilter = (period: string) => {
    console.log("⚡ Filtro rápido:", period)
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Operaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">89</div>
                <p className="text-xs text-muted-foreground">57% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Egresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-orange-600">67</div>
                <p className="text-xs text-muted-foreground">43% del total</p>
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
                <Button variant="outline" size="sm" onClick={handleEmailReport} className="text-xs">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                    {mockOperationsData.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>{new Date(operation.date).toLocaleDateString("es-AR")}</TableCell>
                        <TableCell>{operation.client}</TableCell>
                        <TableCell>
                          <Badge variant={operation.type === "ingreso" ? "default" : "secondary"}>
                            {operation.type === "ingreso" ? "Ingreso" : "Egreso"}
                          </Badge>
                        </TableCell>
                        <TableCell>{operation.cereal}</TableCell>
                        <TableCell className="font-mono">{operation.quantity.toFixed(1)}</TableCell>
                        <TableCell>{operation.driver}</TableCell>
                        <TableCell className="font-mono">{operation.truck}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Shown only on small screens */}
              <div className="lg:hidden space-y-3 p-4">
                {mockOperationsData.map((operation) => (
                  <Card key={operation.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      {/* Header with Date and Type */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {new Date(operation.date).toLocaleDateString("es-AR")}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{operation.client}</div>
                        </div>
                        <Badge variant={operation.type === "ingreso" ? "default" : "secondary"} className="ml-2">
                          {operation.type === "ingreso" ? "Ingreso" : "Egreso"}
                        </Badge>
                      </div>

                      {/* Operation Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Cereal</div>
                          <div className="font-medium">{operation.cereal}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Cantidad</div>
                          <div className="font-bold text-lg">{operation.quantity.toFixed(1)}t</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Conductor</div>
                          <div className="font-medium truncate">{operation.driver}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Patente</div>
                          <div className="font-mono font-medium">{operation.truck}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <div className="text-xl sm:text-2xl font-bold">4,500t</div>
                <p className="text-xs text-muted-foreground">Todos los silos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">2,650t</div>
                <p className="text-xs text-muted-foreground">59% ocupación</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Espacio Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">1,850t</div>
                <p className="text-xs text-muted-foreground">41% disponible</p>
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
                    {mockStockData.map((silo, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{silo.silo}</TableCell>
                        <TableCell>{silo.cereal}</TableCell>
                        <TableCell className="font-mono">{silo.current}t</TableCell>
                        <TableCell className="font-mono">{silo.capacity}t</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Shown only on small screens */}
              <div className="md:hidden space-y-3 p-4">
                {mockStockData.map((silo, index) => (
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
                          <div className="font-bold text-lg">{silo.current}t</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Capacidad</div>
                          <div className="font-medium">{silo.capacity}t</div>
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
                ))}
              </div>
            </CardContent>
          </Card>
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
