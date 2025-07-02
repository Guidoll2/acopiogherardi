"use client"

import { useState } from "react"
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
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedCereal, setSelectedCereal] = useState("all")
  const [reportType, setReportType] = useState("operations")
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data
  const mockClients = [
    { id: "1", name: "Estancia La Esperanza" },
    { id: "2", name: "Agropecuaria San Martín" },
    { id: "3", name: "Cooperativa del Norte" },
  ]

  const mockCereals = [
    { id: "1", name: "Soja", code: "SOJ" },
    { id: "2", name: "Maíz", code: "MAI" },
    { id: "3", name: "Trigo", code: "TRI" },
  ]

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Genera y analiza reportes de operaciones y stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>Configura los parámetros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("today")}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("week")}>
                Última Semana
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("month")}>
                Último Mes
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickFilter("quarter")}>
                Último Trimestre
              </Button>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpiar
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Operaciones
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Financiero
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Operaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89</div>
                <p className="text-xs text-muted-foreground">57% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Egresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">67</div>
                <p className="text-xs text-muted-foreground">43% del total</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Operaciones</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleEmailReport}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,500t</div>
                <p className="text-xs text-muted-foreground">Todos los silos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,650t</div>
                <p className="text-xs text-muted-foreground">59% ocupación</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Espacio Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,850t</div>
                <p className="text-xs text-muted-foreground">41% disponible</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Silos</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>Rendimiento y actividad por cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reporte de clientes en desarrollo</p>
                <p className="text-sm">Próximamente disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporte Financiero</CardTitle>
              <CardDescription>Análisis de ingresos y costos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reporte financiero en desarrollo</p>
                <p className="text-sm">Próximamente disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
