"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, LogOut, Wheat, ArrowRight, ArrowLeft, Phone, Clock, Calendar } from "lucide-react"

export default function GaritaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { operations, clients, drivers, updateOperation } = useData()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "garita") {
      router.push("/login")
      return
    }
    setUser(currentUser)

    // Actualizar reloj cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/login")
  }

  const handleVehicleAction = async (operationId: string, action: "entrada" | "salida") => {
    try {
      if (action === "entrada") {
        // Cambiar estado a "balanza_ingreso" para entrada
        await updateOperation(operationId, { 
          status: "balanza_ingreso"
        })
      } else {
        // Cambiar estado a "completado" para salida
        await updateOperation(operationId, { 
          status: "completado"
        })
      }
    } catch (error) {
      console.error("Error al actualizar operación:", error)
    }
  }

  // Filtrar operaciones relevantes para garita
  const todayOperations = operations?.filter(op => {
    const today = new Date().toDateString()
    const operationDate = new Date(op.scheduled_date || op.created_at).toDateString()
    
    // Mostrar operaciones programadas para hoy o que necesitan autorización de acceso/egreso
    return operationDate === today || 
           op.status === "autorizar_acceso" || 
           op.status === "autorizar_egreso"
  }).sort((a, b) => {
    // Priorizar por estado (autorizaciones primero) y luego por hora programada
    const statusPriority = {
      "autorizar_acceso": 1,
      "autorizar_egreso": 2,
      "pendiente": 3,
      "en_carga_descarga": 4,
      "balanza_ingreso": 5,
      "balanza_egreso": 6
    }
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999
    
    if (aPriority !== bPriority) return aPriority - bPriority
    
    // Si tienen la misma prioridad, ordenar por fecha programada
    const aDate = a.scheduled_date || "1970-01-01"
    const bDate = b.scheduled_date || "1970-01-01"
    return aDate.localeCompare(bDate)
  }) || []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Programado", color: "bg-gray-100 text-gray-800" },
      autorizar_acceso: { label: "Autorizar Entrada", color: "bg-yellow-100 text-yellow-800" },
      balanza_ingreso: { label: "En Planta", color: "bg-blue-100 text-blue-800" },
      en_carga_descarga: { label: "Carga/Descarga", color: "bg-purple-100 text-purple-800" },
      balanza_egreso: { label: "Listo para Salir", color: "bg-orange-100 text-orange-800" },
      autorizar_egreso: { label: "Autorizar Salida", color: "bg-red-100 text-red-800" },
      completado: { label: "Completado", color: "bg-green-100 text-green-800" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId)
    return client?.name || "Cliente Desconocido"
  }

  const getDriverInfo = (driverId: string) => {
    const driver = drivers?.find(d => d.id === driverId)
    return driver || { name: "Conductor Desconocido", phone: "Sin teléfono" }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wheat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Control de Garita</h1>
                <p className="text-sm text-gray-500">Sistema de Acceso Vehicular</p>
              </div>
            </div>

            {/* Reloj en el header */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {currentTime.toLocaleTimeString("es-ES")}
                </div>
                <div className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.full_name || user.name}</p>
                  <p className="text-xs text-gray-500">Operador de Garita</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Operaciones del día */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{todayOperations.length}</p>
                  <p className="text-sm text-gray-600">Operaciones Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {todayOperations.filter(op => op.status === "autorizar_acceso").length}
                  </p>
                  <p className="text-sm text-gray-600">Esperando Entrada</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {todayOperations.filter(op => ["balanza_ingreso", "en_carga_descarga", "balanza_egreso"].includes(op.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">En Planta</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ArrowLeft className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {todayOperations.filter(op => op.status === "autorizar_egreso").length}
                  </p>
                  <p className="text-sm text-gray-600">Esperando Salida</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Operaciones del Día ({todayOperations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayOperations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay operaciones para hoy</p>
                <p className="text-sm">Las operaciones programadas aparecerán aquí</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Conductor</TableHead>
                      <TableHead className="w-[200px]">Cliente</TableHead>
                      <TableHead className="w-[120px]">Chasis</TableHead>
                      <TableHead className="w-[120px]">Acoplado</TableHead>
                      <TableHead className="w-[100px]">Hora Prog.</TableHead>
                      <TableHead className="w-[140px]">Estado</TableHead>
                      <TableHead className="w-[140px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayOperations.map((operation) => {
                      const driverInfo = getDriverInfo(operation.driver_id)
                      const clientName = getClientName(operation.client_id)
                      
                      return (
                        <TableRow key={operation.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{driverInfo.name}</div>
                              {driverInfo.phone && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {driverInfo.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{clientName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm font-medium text-gray-900">
                              {operation.chassis_plate || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm text-gray-900">
                              {operation.trailer_plate || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {operation.scheduled_date ? 
                                new Date(operation.scheduled_date).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }) : "Sin hora"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(operation.status)}
                          </TableCell>
                          <TableCell>
                            {operation.status === "autorizar_acceso" && (
                              <Button
                                onClick={() => handleVehicleAction(operation.id, "entrada")}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                ENTRADA
                              </Button>
                            )}
                            {operation.status === "autorizar_egreso" && (
                              <Button
                                onClick={() => handleVehicleAction(operation.id, "salida")}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium"
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                SALIDA
                              </Button>
                            )}
                            {!["autorizar_acceso", "autorizar_egreso"].includes(operation.status) && (
                              <Badge variant="secondary" className="text-xs">
                                {operation.status === "pendiente" ? "Esperando" : 
                                 operation.status === "balanza_ingreso" ? "En Balanza" :
                                 operation.status === "en_carga_descarga" ? "Procesando" :
                                 operation.status === "balanza_egreso" ? "Pesaje Final" :
                                 "En Proceso"}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
