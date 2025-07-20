"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, LogOut, Wheat, ArrowRight, ArrowLeft, Phone } from "lucide-react"

export default function GaritaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pendingVehicles, setPendingVehicles] = useState([
    {
      id: 1,
      driver: "Carlos Mendez",
      truck: "ABC-123",
      trailer: "TRL-456",
      company: "Transportes del Norte",
      status: "esperando_entrada",
      arrivalTime: "14:30",
      phone: "+54 9 11 1234-5678",
    },
    {
      id: 2,
      driver: "Ana Rodriguez",
      truck: "XYZ-789",
      trailer: "TRL-789",
      company: "Logística Sur",
      status: "esperando_salida",
      arrivalTime: "13:45",
      phone: "+54 9 11 8765-4321",
    },
    {
      id: 3,
      driver: "Luis Garcia",
      truck: "DEF-456",
      trailer: null,
      company: "Granos Express",
      status: "esperando_entrada",
      arrivalTime: "14:45",
      phone: "+54 9 11 5555-1234",
    },
    {
      id: 4,
      driver: "Maria Fernandez",
      truck: "GHI-789",
      trailer: "TRL-123",
      company: "Transportes Unidos",
      status: "esperando_salida",
      arrivalTime: "15:00",
      phone: "+54 9 11 9999-8888",
    },
    {
      id: 5,
      driver: "Roberto Silva",
      truck: "JKL-012",
      trailer: null,
      company: "Logística Rápida",
      status: "esperando_entrada",
      arrivalTime: "15:15",
      phone: "+54 9 11 7777-6666",
    },
  ])

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    // Allow any string for role to avoid type overlap error
    if (
      !currentUser ||
      !["garita", "admin", "system_admin", "company_admin"].includes(
        (currentUser as { role?: string }).role ?? ""
      )
    ) {
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

  const handleVehicleAction = (vehicleId: number, action: "entrada" | "salida") => {
    // Remover de vehículos pendientes
    setPendingVehicles(pendingVehicles.filter((v) => v.id !== vehicleId))
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

      {/* Main Content - Solo tabla de vehículos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Vehículos Pendientes ({pendingVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVehicles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay vehículos pendientes</p>
                <p className="text-sm">Los vehículos aparecerán aquí cuando estén esperando entrada o salida</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Conductor</TableHead>
                      <TableHead className="w-[250px]">Empresa</TableHead>
                      <TableHead className="w-[120px]">Chasis</TableHead>
                      <TableHead className="w-[120px]">Acoplado</TableHead>
                      <TableHead className="w-[100px]">Llegada</TableHead>
                      <TableHead className="w-[120px]">Estado</TableHead>
                      <TableHead className="w-[140px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{vehicle.driver}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {vehicle.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{vehicle.company}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm font-medium text-gray-900">{vehicle.truck}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm text-gray-900">{vehicle.trailer || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{vehicle.arrivalTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              vehicle.status === "esperando_entrada"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {vehicle.status === "esperando_entrada" ? "Entrada" : "Salida"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.status === "esperando_entrada" && (
                            <Button
                              onClick={() => handleVehicleAction(vehicle.id, "entrada")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-medium"
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              ENTRADA
                            </Button>
                          )}
                          {vehicle.status === "esperando_salida" && (
                            <Button
                              onClick={() => handleVehicleAction(vehicle.id, "salida")}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" />
                              SALIDA
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
