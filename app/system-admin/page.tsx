"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { companies, users, operations } from "@/lib/mock-data"
import { Building2, Users, Activity, TrendingUp, CheckCircle, Plus, Edit, Eye, UserPlus, Settings } from "lucide-react"
import { CreateCompanyDialog } from "@/components/system-admin/create-company-dialog"
import { CreateAdminDialog } from "@/components/system-admin/create-admin-dialog"

export default function SystemAdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false)
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [companiesList, setCompaniesList] = useState(companies)
  const [usersList, setUsersList] = useState(users)
  const router = useRouter()


  useEffect(() => {
    const user = AuthService.getCurrentUser()
    if (!user || user.role !== "system_admin") {
      router.push("/dashboard")
    } else {
      setIsLoading(false)
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
  const activeCompanies = companiesList.filter((c) => c.status === "active").length
  const totalUsers = usersList.length
  const activeUsers = usersList.filter((u) => u.is_active).length
  const totalOperations = operations.length

  // Estadísticas por plan
  const planStats = {
    basic: companiesList.filter((c) => c.subscription_plan === "basic").length,
    premium: companiesList.filter((c) => c.subscription_plan === "premium").length,
    enterprise: companiesList.filter((c) => c.subscription_plan === "enterprise").length,
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

  const handleCompanyCreated = (newCompany: any) => {
    setCompaniesList([...companiesList, newCompany])
  }

  const handleAdminCreated = (newAdmin: any) => {
    setUsersList([...usersList, newAdmin])
  }

  const handleEditCompany = (companyId: string) => {
    console.log("Editar empresa:", companyId)
    // TODO: Implementar edición de empresa
  }

  const handleViewCompany = (companyId: string) => {
    console.log("Ver empresa:", companyId)
    // TODO: Implementar vista detallada de empresa
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Panel de Administración del Sistema</h2>
            <p className="text-muted-foreground">Gestión completa de empresas, usuarios y planes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateAdminOpen(true)} className="bg-green-600 hover:bg-green-700">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                {companiesList.map((company) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Planes de suscripción */}
          <Card className="col-span-2">
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
                .filter((user) => user.role === "admin" || user.role === "company_admin")
                .map((admin) => {
                  const company = companiesList.find((c) => c.id === admin.company_id)
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
              {operations.slice(0, 5).map((operation) => {
                const client = companiesList.find((c) => c.id === operation.client_id)
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
          onAdminCreated={handleAdminCreated}
        />

        <CreateAdminDialog
          open={createAdminOpen}
          onOpenChange={setCreateAdminOpen}
          onAdminCreated={handleAdminCreated}
        />
      </div>
    </DashboardLayout>
  )
}
