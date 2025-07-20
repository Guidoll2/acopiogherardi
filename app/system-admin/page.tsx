"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/contexts/data-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import type { Company, User, Operation } from "@/types"
import { Building2, Users, Activity, TrendingUp, CheckCircle, Plus, Edit, Eye, UserPlus, Settings, Trash2, Key } from "lucide-react"
import { CreateCompanyDialog } from "@/components/system-admin/create-company-dialog"
import { CreateAdminDialog } from "@/components/system-admin/create-admin-dialog"
import { ViewCompanyDialog } from "@/components/system-admin/view-company-dialog"
import { EditCompanyDialog } from "@/components/system-admin/edit-company-dialog"

export default function SystemAdminPage() {
  const { 
    companies: companiesList, 
    users: usersList, 
    operations,
    isLoading,
    refreshData 
  } = useData()
  
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false)
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [viewCompanyOpen, setViewCompanyOpen] = useState(false)
  const [editCompanyOpen, setEditCompanyOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    console.log("Usuario en system-admin:", user)
    
    if (!user || user.role !== "system_admin") {
      console.log("Usuario no autorizado, redirigiendo...")
      router.push("/login")
    } else {
      console.log("Usuario autorizado, cargando datos...")
      // Los datos se cargan automáticamente a través del DataProvider
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Estadísticas del sistema
  const totalCompanies = companiesList.length
  const activeCompanies = companiesList.filter((c: Company) => c.status === "active").length
  const totalUsers = usersList.length
  const activeUsers = usersList.filter((u: User) => u.is_active).length
  const totalOperations = operations.length

  // Estadísticas por plan
  const planStats = {
    basic: companiesList.filter((c: Company) => c.subscription_plan === "basic").length,
    premium: companiesList.filter((c: Company) => c.subscription_plan === "premium").length,
    enterprise: companiesList.filter((c: Company) => c.subscription_plan === "enterprise").length,
  }

  const stats = [
    {
      title: "Total Empresas",
      value: totalCompanies.toString(),
      description: `${activeCompanies} activas`,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Usuarios",
      value: totalUsers.toString(),
      description: `${activeUsers} activos`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Operaciones",
      value: totalOperations.toString(),
      description: "En todo el sistema",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Crecimiento",
      value: "+12%",
      description: "Este mes",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const handleCompanyCreated = async (newCompany: Company) => {
    // Los datos se actualizan automáticamente a través del DataProvider
    await refreshData()
  }

  const handleCompanyUpdated = async (updatedCompany: Company) => {
    // Los datos se actualizan automáticamente a través del DataProvider
    await refreshData()
  }

  const handleAdminCreated = async (newAdmin: User) => {
    // Los datos se actualizan automáticamente a través del DataProvider
    await refreshData()
  }

  const handleEditCompany = (companyId: string) => {
    const company = companiesList.find(c => c.id === companyId)
    if (company) {
      setSelectedCompany(company)
      setEditCompanyOpen(true)
    }
  }

  const handleViewCompany = (companyId: string) => {
    const company = companiesList.find(c => c.id === companyId)
    if (company) {
      setSelectedCompany(company)
      setViewCompanyOpen(true)
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    const company = companiesList.find(c => c.id === companyId)
    if (!company) return

    if (confirm(`¿Está seguro de que desea eliminar la empresa "${company.name}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/companies/${companyId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await refreshData()
          alert('Empresa eliminada exitosamente')
        } else {
          const error = await response.json()
          if (error.users && error.users.length > 0 && error.canForceDelete) {
            const userList = error.users.map((u: any) => `• ${u.name} (${u.email})`).join('\n')
            const forceDelete = confirm(
              `No se puede eliminar la empresa "${company.name}" porque tiene usuarios asociados:\n\n${userList}\n\n¿Desea eliminar la empresa Y todos sus usuarios asociados? Esta acción es irreversible.`
            )
            
            if (forceDelete) {
              try {
                const forceResponse = await fetch(`/api/companies/${companyId}?force=true`, {
                  method: 'DELETE',
                })
                
                if (forceResponse.ok) {
                  const result = await forceResponse.json()
                  await refreshData()
                  alert(result.message)
                } else {
                  const forceError = await forceResponse.json()
                  alert(`Error al eliminar empresa: ${forceError.error || 'Error desconocido'}`)
                }
              } catch (forceErr) {
                console.error('Error:', forceErr)
                alert('Error al eliminar empresa')
              }
            }
          } else {
            alert(`Error al eliminar empresa: ${error.error || 'Error desconocido'}`)
          }
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error al eliminar empresa')
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = usersList.find(u => u.id === userId)
    if (!user) return

    if (confirm(`¿Está seguro de que desea eliminar el usuario "${user.full_name}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await refreshData()
          alert('Usuario eliminado exitosamente')
        } else {
          const error = await response.json()
          alert(`Error al eliminar usuario: ${error.error || 'Error desconocido'}`)
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleResetPassword = async (userId: string) => {
    const user = usersList.find(u => u.id === userId)
    if (!user) return

    const newPassword = prompt(`Ingrese la nueva contraseña para ${user.full_name}:`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Contraseña actualizada exitosamente para ${user.full_name}\n\nNueva contraseña: ${result.newPassword}\n\n¡Guarda esta información!`)
      } else {
        const error = await response.json()
        alert(`Error al resetear contraseña: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al resetear contraseña')
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "basic":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "$299/mes"
      case "premium":
        return "$99/mes"
      case "basic":
        return "$29/mes"
      default:
        return "N/A"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-700">Panel de Administración del Sistema</h2>
            <p className="text-muted-foreground text-gray-700">Gestión completa de empresas, usuarios y planes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateAdminOpen(true)} className="bg-green-600 hover:bg-green-700 ">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Admin
            </Button>
            <Button onClick={() => setCreateCompanyOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-gray-700">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="text-gray-700">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 text-gray-700">
          {/* Gestión de empresas */}
          <Card className="col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Empresas</CardTitle>
                <CardDescription>Administrar empresas registradas y sus planes</CardDescription>
              </div>
              <Button onClick={() => setCreateCompanyOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companiesList.map((company: Company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{company.name}</p>
                          <Badge
                            variant="secondary"
                            className={
                              company.status === "active"
                                ? "border-green-500 text-green-700"
                                : "border-red-500 text-red-700"
                            }
                          >
                            {company.status === "active" ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                        <p className="text-xs text-muted-foreground">CUIT: {company.cuit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge className={getPlanBadgeColor(company.subscription_plan)}>
                          {company.subscription_plan.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{getPlanPrice(company.subscription_plan)}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewCompany(company.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditCompany(company.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteCompany(company.id)}
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Planes de suscripción */}
          <Card className="col-span-2 text-gray-700">
            <CardHeader>
              <CardTitle>Planes de Suscripción</CardTitle>
              <CardDescription>Distribución y ingresos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enterprise</p>
                    <p className="text-sm text-muted-foreground">$299/mes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{planStats.enterprise}</p>
                    <p className="text-xs text-muted-foreground">empresas</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Premium</p>
                    <p className="text-sm text-muted-foreground">$99/mes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{planStats.premium}</p>
                    <p className="text-xs text-muted-foreground">empresas</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Basic</p>
                    <p className="text-sm text-muted-foreground">$29/mes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-600">{planStats.basic}</p>
                    <p className="text-xs text-muted-foreground">empresas</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ingresos Mensuales</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(planStats.enterprise * 299 + planStats.premium * 99 + planStats.basic * 29).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Sistema operativo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Administradores de empresa */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Administradores de Empresa</CardTitle>
              <CardDescription>Gestión de usuarios administradores por empresa</CardDescription>
            </div>
            <Button onClick={() => setCreateAdminOpen(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Admin
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersList
                .filter((user: User) => user.role === "admin" || user.role === "company_admin")
                .map((admin: User) => {
                  const company = companiesList.find((c: Company) => c.id === admin.company_id)
                  return (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{admin.full_name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {company ? company.name : "Sin empresa asignada"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className={
                            admin.is_active ? "border-green-500 text-green-700" : "border-red-500 text-red-700"
                          }
                        >
                          {admin.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {admin.role === "company_admin" ? "Admin Empresa" : "Administrador"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleResetPassword(admin.id)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                          title="Resetear contraseña"
                        >
                          <Key className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteUser(admin.id)}
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente del sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente del Sistema</CardTitle>
            <CardDescription>Últimas operaciones y eventos importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {operations.slice(0, 5).map((operation: Operation) => {
                const client = companiesList.find((c: Company) => c.id === operation.client_id)
                return (
                  <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          operation.operation_type === "ingreso" ? "bg-green-100" : "bg-orange-100"
                        }`}
                      >
                        <Activity
                          className={`h-4 w-4 ${
                            operation.operation_type === "ingreso" ? "text-green-600" : "text-orange-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          Operación #{operation.id} - {operation.operation_type === "ingreso" ? "Ingreso" : "Egreso"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {client ? client.name : "Cliente desconocido"} - {operation.amount} toneladas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(operation.createdAt).toLocaleDateString("es-AR")} -{" "}
                          {new Date(operation.createdAt).toLocaleTimeString("es-AR")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        operation.status === "completado"
                          ? "bg-green-100 text-green-800"
                          : operation.status === "en_carga_descarga"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {operation.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Diálogos */}
        <CreateCompanyDialog
          open={createCompanyOpen}
          onOpenChange={setCreateCompanyOpen}
          onCompanyCreated={handleCompanyCreated}
        />

        <CreateAdminDialog
          open={createAdminOpen}
          onOpenChange={setCreateAdminOpen}
          onAdminCreated={handleAdminCreated}
        />

        <ViewCompanyDialog
          open={viewCompanyOpen}
          onOpenChange={setViewCompanyOpen}
          company={selectedCompany}
        />

        <EditCompanyDialog
          open={editCompanyOpen}
          onOpenChange={setEditCompanyOpen}
          company={selectedCompany}
          onCompanyUpdated={handleCompanyUpdated}
        />
      </div>
    </DashboardLayout>
  )
}
