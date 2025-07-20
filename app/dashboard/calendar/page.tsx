"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "day">("week")

  // Datos de ejemplo de operaciones programadas
  const scheduledOperations = [
    {
      id: "1",
      title: "Ingreso de Soja - Cliente ABC",
      date: "2024-01-15",
      time: "09:00",
      type: "ingreso",
      client: "Agropecuaria ABC",
      driver: "Carlos Mendez",
      truck: "ABC-123",
      cereal: "Soja",
      quantity: "25 toneladas",
      status: "programada",
    },
    {
      id: "2",
      title: "Egreso de Maíz - Cliente XYZ",
      date: "2024-01-15",
      time: "14:30",
      type: "egreso",
      client: "Estancia XYZ",
      driver: "Ana Rodriguez",
      truck: "XYZ-789",
      cereal: "Maíz",
      quantity: "18 toneladas",
      status: "programada",
    },
    {
      id: "3",
      title: "Ingreso de Trigo - Cliente DEF",
      date: "2024-01-16",
      time: "10:15",
      type: "ingreso",
      client: "Cooperativa DEF",
      driver: "Luis Garcia",
      truck: "DEF-456",
      cereal: "Trigo",
      quantity: "30 toneladas",
      status: "confirmada",
    },
  ]

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

  const getOperationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return scheduledOperations.filter((op) => op.date === dateStr)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
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
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "programada":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case "en_proceso":
        return <Badge className="bg-yellow-100 text-yellow-800">En Proceso</Badge>
      case "completada":
        return <Badge className="bg-gray-100 text-gray-800">Completada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "ingreso" ? (
      <Badge className="bg-green-100 text-green-800">Ingreso</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Egreso</Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Calendario de Operaciones</h1>
            <p className="text-muted-foreground text-sm">Programa y gestiona las operaciones de ingreso y egreso</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Nueva Operación</span>
            <span className="xs:hidden">Nueva</span>
          </Button>
        </div>

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
                        className={`border rounded-lg p-3 min-h-[200px] ${
                          isToday ? "bg-blue-50 border-blue-200" : "bg-white"
                        }`}
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
                              className="bg-white border rounded p-2 text-xs cursor-pointer hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{operation.time}</span>
                                {getTypeBadge(operation.type)}
                              </div>
                              <p className="text-gray-600 truncate">{operation.client}</p>
                              <p className="text-gray-500">
                                {operation.cereal} - {operation.quantity}
                              </p>
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
                    <Card key={index} className={`${isToday ? "border-blue-300 bg-blue-50" : ""}`}>
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
                          {isToday && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Hoy</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {operations.length > 0 ? (
                          <div className="space-y-3">
                            {operations.map((operation) => (
                              <Card key={operation.id} className="border border-gray-200">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-semibold">{operation.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getTypeBadge(operation.type)}
                                      {getStatusBadge(operation.status)}
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-1 gap-1">
                                      <p className="font-medium truncate">{operation.client}</p>
                                      <p className="text-gray-600">
                                        {operation.cereal} • {operation.quantity}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        {operation.driver} • {operation.truck}
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
                <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
              </div>
              <div className="space-y-3">
                {getOperationsForDate(currentDate).map((operation) => (
                  <Card key={operation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{operation.time}</span>
                          {getTypeBadge(operation.type)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(operation.status)}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-3 text-sm sm:text-base">{operation.title}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">Cliente: {operation.client}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">Chofer: {operation.driver}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="truncate">Patente: {operation.truck}</p>
                          <p className="truncate">Cereal: {operation.cereal}</p>
                          <p className="truncate">Cantidad: {operation.quantity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getOperationsForDate(currentDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No hay operaciones programadas para este día</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de operaciones */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {scheduledOperations.filter((op) => op.status === "programada").length}
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {scheduledOperations.filter((op) => op.status === "confirmada").length}
            </div>
            <p className="text-xs text-muted-foreground">Listas para ejecutar</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Toneladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">73</div>
            <p className="text-xs text-muted-foreground">Programadas esta semana</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
