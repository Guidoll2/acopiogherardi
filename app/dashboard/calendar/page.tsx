"use client"

import { useState, useEffect, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, RefreshCw } from "lucide-react"

export default function CalendarPage() {
  const { operations, clients, drivers, cerealTypes, refreshData, isLoading } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "day">("week")
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Helper functions to get names from IDs
  const getClientName = (clientId: string) => {
    if (!clientId) return "Sin cliente"
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : `Cliente ID: ${clientId}`
  }

  const getDriverName = (driverId: string) => {
    if (!driverId) return "Sin conductor"
    const driver = drivers.find(d => d.id === driverId)
    return driver ? driver.name : `Conductor ID: ${driverId}`
  }

  const getCerealName = (cerealId: string) => {
    if (!cerealId) return "Sin cereal"
    const cereal = cerealTypes.find(c => c.id === cerealId)
    return cereal ? cereal.name : `Cereal ID: ${cerealId}`
  }

  // Helper function to check if an operation was scheduled vs same-day
  const getOperationTiming = (operation: any) => {
    const operationDate = new Date(operation.created_at || operation.createdAt)
    const scheduledDate = new Date(operation.scheduled_date || operation.created_at || operation.createdAt)
    
    // If operation was created on the same day as scheduled, it's same-day
    if (operationDate.toDateString() === scheduledDate.toDateString()) {
      return 'same-day'
    }
    // If it was created before the scheduled date, it's scheduled
    return 'scheduled'
  }

  // Get all operations grouped by date
  const operationsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {}
    
    operations.forEach(operation => {
      // Use scheduled_date if available, otherwise use created_at
      const dateStr = operation.scheduled_date || operation.created_at || operation.createdAt
      if (!dateStr) return
      
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return
      
      const key = date.toISOString().split('T')[0]
      if (!grouped[key]) {
        grouped[key] = []
      }
      
      grouped[key].push({
        ...operation,
        timing: getOperationTiming(operation),
        clientName: getClientName(operation.client_id),
        driverName: getDriverName(operation.driver_id),
        cerealName: getCerealName(operation.cereal_type_id)
      })
    })
    
    return grouped
  }, [operations, clients, drivers, cerealTypes])

  // Helper function to get week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Get filtered operations for selected date range
  const getFilteredOperations = () => {
    if (view === 'day') {
      const dateStr = selectedDate.toISOString().split('T')[0]
      return operationsByDate[dateStr] || []
    } else {
      // For week view, get all operations in the current week
      const weekDays = getWeekDays()
      const startDate = weekDays[0].toISOString().split('T')[0]
      const endDate = weekDays[6].toISOString().split('T')[0]
      
      const weekOperations: any[] = []
      Object.keys(operationsByDate).forEach(dateKey => {
        if (dateKey >= startDate && dateKey <= endDate) {
          weekOperations.push(...operationsByDate[dateKey])
        }
      })
      
      return weekOperations
    }
  }

  const filteredOperations = getFilteredOperations()

  // Calculate statistics for the current period
  const scheduledOperations = filteredOperations.filter(op => op.timing === 'scheduled')
  const sameDayOperations = filteredOperations.filter(op => op.timing === 'same-day')
  const ingresoOperations = filteredOperations.filter(op => op.operation_type === 'ingreso')
  const egresoOperations = filteredOperations.filter(op => op.operation_type === 'egreso')
  
  const totalToneladas = filteredOperations.reduce((sum, op) => {
    return sum + (op.quantity || op.net_weight || 0)
  }, 0)

  const getOperationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return operationsByDate[dateStr] || []
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const formatTime = (operation: any) => {
    const date = new Date(operation.created_at || operation.createdAt)
    if (isNaN(date.getTime())) return "00:00"
    return date.toLocaleTimeString("es-ES", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
    setSelectedDate(newDate)
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const getTimingBadge = (timing: string) => {
    return timing === 'scheduled' ? (
      <Badge className="bg-blue-100 text-blue-800 text-xs">Programada</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800 text-xs">Mismo día</Badge>
    )
  }

  const getStatusBadge = (operation: any) => {
    // Determine status based on operation properties
    if (operation.status) {
      return <Badge className="bg-green-100 text-green-800 text-xs">{operation.status}</Badge>
    }
    
    // Default status based on timing
    if (operation.timing === 'scheduled') {
      return <Badge className="bg-blue-100 text-blue-800 text-xs">Programada</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 text-xs">Ejecutada</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "ingreso" ? (
      <Badge className="bg-green-100 text-green-800 text-xs">Ingreso</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800 text-xs">Egreso</Badge>
    )
  }

  const handleRefreshData = async () => {
    try {
      if (refreshData) {
        await refreshData()
      }
    } catch (error) {
      console.error("Error actualizando datos:", error)
    }
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
                <p className="text-sm text-muted-foreground">Por favor espera mientras obtenemos las operaciones</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Calendario de Operaciones</h1>
            <p className="text-muted-foreground text-sm">Programa y gestiona las operaciones de ingreso y egreso</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 self-start sm:self-auto">
            <Button variant="outline" onClick={handleRefreshData} className="w-full xs:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Actualizar</span>
              <span className="xs:hidden">Actualizar</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 w-full xs:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Nueva Operación</span>
              <span className="xs:hidden">Nueva</span>
            </Button>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <span className="font-medium">Leyenda:</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">Programada</Badge>
                <span>Operación programada con anticipación</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 text-xs">Mismo día</Badge>
                <span>Operación creada y ejecutada el mismo día</span>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Controles del calendario */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "week" ? navigateWeek("prev") : navigateDay("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base sm:text-xl font-semibold text-center flex-1 sm:flex-none">
                {view === "week"
                  ? `${formatDate(getWeekDays()[0])} al ${formatDate(getWeekDays()[6])}`
                  : formatDate(currentDate)}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "week" ? navigateWeek("next") : navigateDay("next"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button 
                variant={view === "week" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setView("week")}
                className="flex-1 sm:flex-none"
              >
                Semana
              </Button>
              <Button 
                variant={view === "day" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setView("day")}
                className="flex-1 sm:flex-none"
              >
                Día
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "week" ? (
            <>
              {/* Desktop Week View - Hidden on mobile */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-7 gap-4">
                  {getWeekDays().map((day, index) => {
                    const operations = getOperationsForDate(day)
                    const isToday = day.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 min-h-[200px] cursor-pointer transition-colors ${
                          isToday ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50"
                        } ${
                          selectedDate.toDateString() === day.toDateString() ? "ring-2 ring-blue-400" : ""
                        }`}
                        onClick={() => selectDate(day)}
                      >
                        <div className="text-center mb-3">
                          <p className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                            {day.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase()}
                          </p>
                          <p className={`text-lg font-bold ${isToday ? "text-blue-600" : ""}`}>{day.getDate()}</p>
                        </div>
                        <div className="space-y-2">
                          {operations.map((operation) => (
                            <div
                              key={operation.id}
                              className={`border rounded p-2 text-xs cursor-pointer hover:shadow-sm ${
                                operation.timing === 'scheduled' 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-purple-50 border-purple-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{formatTime(operation)}</span>
                                {getTypeBadge(operation.operation_type)}
                              </div>
                              <p className="text-gray-600 truncate">{operation.clientName}</p>
                              <p className="text-gray-500">
                                {operation.cerealName} - {(operation.quantity || operation.net_weight || 0).toFixed(1)}t
                              </p>
                              <div className="mt-1">
                                {getTimingBadge(operation.timing)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mobile Week View - Shown only on small screens */}
              <div className="lg:hidden space-y-3">
                {getWeekDays().map((day, index) => {
                  const operations = getOperationsForDate(day)
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <Card key={index} className={`${isToday ? "border-blue-300 bg-blue-50" : ""} ${
                      selectedDate.toDateString() === day.toDateString() ? "ring-2 ring-blue-400" : ""
                    } cursor-pointer transition-all`}
                    onClick={() => selectDate(day)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                              {day.toLocaleDateString("es-ES", { weekday: "long" })}
                            </p>
                            <p className={`text-lg font-bold ${isToday ? "text-blue-600" : ""}`}>
                              {day.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {isToday && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Hoy</Badge>
                            )}
                            {selectedDate.toDateString() === day.toDateString() && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">Seleccionado</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {operations.length > 0 ? (
                          <div className="space-y-3">
                            {operations.map((operation) => (
                              <Card key={operation.id} className={`border transition-colors ${
                                operation.timing === 'scheduled' 
                                  ? 'border-blue-200 bg-blue-50' 
                                  : 'border-purple-200 bg-purple-50'
                              }`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-semibold">{formatTime(operation)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getTypeBadge(operation.operation_type)}
                                      {getTimingBadge(operation.timing)}
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-1 gap-1">
                                      <p className="font-medium truncate">{operation.clientName}</p>
                                      <p className="text-gray-600">
                                        {operation.cerealName} • {(operation.quantity || operation.net_weight || 0).toFixed(1)}t
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        {operation.driverName} • {operation.chassis_plate || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 text-sm py-4">Sin operaciones</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold">{formatDate(selectedDate)}</h3>
                <p className="text-sm text-muted-foreground">
                  {getOperationsForDate(selectedDate).length} operaciones para este día
                </p>
              </div>
              <div className="space-y-3">
                {getOperationsForDate(selectedDate).map((operation) => (
                  <Card key={operation.id} className={`hover:shadow-md transition-all ${
                    operation.timing === 'scheduled' 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-purple-200 bg-purple-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{formatTime(operation)}</span>
                          {getTypeBadge(operation.operation_type)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTimingBadge(operation.timing)}
                          {getStatusBadge(operation)}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-3 text-sm sm:text-base">
                        {operation.operation_type === 'ingreso' ? 'Ingreso' : 'Egreso'} de {operation.cerealName} - {operation.clientName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">Cliente: {operation.clientName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">Chofer: {operation.driverName}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="truncate">Patente: {operation.chassis_plate || "N/A"}</p>
                          <p className="truncate">Cereal: {operation.cerealName}</p>
                          <p className="truncate">Cantidad: {(operation.quantity || operation.net_weight || 0).toFixed(1)}t</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getOperationsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No hay operaciones para este día</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de operaciones - Datos dinámicos actualizados */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {scheduledOperations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {view === 'day' ? 'Este día' : 'Esta semana'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mismo Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {sameDayOperations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Creadas y ejecutadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos / Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-green-600">{ingresoOperations.length}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-orange-600">{egresoOperations.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {view === 'day' ? 'Este día' : 'Esta semana'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Toneladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {totalToneladas.toFixed(1)}t
            </div>
            <p className="text-xs text-muted-foreground">
              {view === 'day' ? 'Este día' : 'Esta semana'}
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
