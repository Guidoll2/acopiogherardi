"use client"

import { useState } from "react"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Operaciones</h1>
          <p className="text-muted-foreground">Programa y gestiona las operaciones de ingreso y egreso</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Operación
        </Button>
      </div>

      {/* Controles del calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "week" ? navigateWeek("prev") : navigateDay("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {view === "week"
                  ? `Semana del ${formatDate(getWeekDays()[0])} al ${formatDate(getWeekDays()[6])}`
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
            <div className="flex items-center space-x-2">
              <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
                Semana
              </Button>
              <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>
                Día
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "week" ? (
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
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
              </div>
              <div className="space-y-3">
                {getOperationsForDate(currentDate).map((operation) => (
                  <Card key={operation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{operation.time}</span>
                          {getTypeBadge(operation.type)}
                          {getStatusBadge(operation.status)}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{operation.title}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Cliente: {operation.client}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Chofer: {operation.driver}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p>Patente: {operation.truck}</p>
                          <p>Cereal: {operation.cereal}</p>
                          <p>Cantidad: {operation.quantity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getOperationsForDate(currentDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay operaciones programadas para este día</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de operaciones */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">
              {scheduledOperations.filter((op) => op.status === "confirmada").length}
            </div>
            <p className="text-xs text-muted-foreground">Listas para ejecutar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Toneladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73</div>
            <p className="text-xs text-muted-foreground">Programadas esta semana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
