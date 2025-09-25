"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/hooks/use-subscription"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsageMeter } from "@/components/ui/usage-meter"
import { SubscriptionAlert } from "@/components/ui/subscription-alert"
import { BarChart3, Users, Truck, Warehouse } from "lucide-react"
import { GaritaDashboard } from "@/components/dashboard/garita-dashboard"
import { OperatorDashboard } from "@/components/dashboard/operator-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  type UserRole = "system_admin" | "admin" | "company_admin" | "garita" | "operator" | undefined
  type User = {
    role: UserRole
    full_name?: string
    name?: string
    // add other user properties as needed
  }
  const user = AuthService.getCurrentUser() as User
  const { operations, clients, drivers, silos } = useData()
  const { data: subscriptionData, loading: subscriptionLoading } = useSubscription()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Redirigir system_admin al panel de administración del sistema
    if (user.role === "system_admin") {
      router.push("/system-admin")
      return
    }
  }, [user, router])

  // Redirigir según el rol del usuario
  if (user?.role === "garita") {
    return <GaritaDashboard />
  }

  if (user?.role === "operator") {
    return <OperatorDashboard />
  }

  // Si es system_admin, no debería llegar aquí por el useEffect, pero por si acaso
  if (user?.role === "system_admin") {
    return null // o un spinner mientras redirige
  }

  // Dashboard para admin, supervisor, company_admin, system_admin
  const stats = [
    {
      title: "Operaciones Hoy",
      value:
        operations?.filter((op) => {
          const today = new Date().toDateString()
          return new Date(op.created_at || "").toDateString() === today
        }).length || 0,
      description: "Operaciones registradas hoy",
      icon: BarChart3,
    },
    {
      title: "Clientes Activos",
      value: clients?.filter((client) => client.status === "active").length || 0,
      description: "Clientes con estado activo",
      icon: Users,
    },
    {
      title: "Conductores",
      value: drivers?.length || 0,
      description: "Conductores disponibles",
      icon: Truck,
    },
    {
      title: "Silos",
      value: silos?.length || 0,
      description: "Silos operativos",
      icon: Warehouse,
    },
  ]

  const recentOperations = operations?.slice(0, 5) || []
  const activeSilos = silos?.slice(0, 2) || []

  return (
    <DashboardLayout>
      <div className="space-y-6 text-gray-700">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user?.full_name || user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-gray-700">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Usage */}
        {subscriptionData && !subscriptionLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            <UsageMeter
              currentCount={subscriptionData.subscription.currentCount}
              limit={subscriptionData.subscription.limit}
              plan={subscriptionData.subscription.plan}
              planName={subscriptionData.subscription.planName}
            />
            <div className="space-y-4">
              <SubscriptionAlert
                currentCount={subscriptionData.subscription.currentCount}
                limit={subscriptionData.subscription.limit}
                plan={subscriptionData.subscription.plan}
                planName={subscriptionData.subscription.planName}
                onUpgrade={() => {
                  // TODO: Implementar modal de upgrade
                  alert("Funcionalidad de upgrade próximamente")
                }}
              />
              {subscriptionData.subscription.plan !== "enterprise" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Plan Actual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{subscriptionData.subscription.planName}</span>
                      <span className="text-lg font-bold text-green-600">
                        ${subscriptionData.subscription.price}/mes
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Próximo ciclo: {new Date(subscriptionData.subscription.billingCycleEnd).toLocaleDateString('es-AR')}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Recent Operations and Silo Status */}
        <div className="grid gap-4 md:grid-cols-2 text-gray-700">
          <Card>
            <CardHeader>
              <CardTitle>Operaciones Recientes</CardTitle>
              <p className="text-sm text-muted-foreground">Últimas operaciones registradas</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                {recentOperations.length > 0 ? (
                  recentOperations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{operation.operation_type}</p>
                        <p className="text-sm text-muted-foreground">{operation.quantity} toneladas</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {operation.created_at ? new Date(operation.created_at).toLocaleDateString() : "Invalid Date"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Salida</p>
                        <p className="text-sm text-muted-foreground">toneladas</p>
                      </div>
                      <div className="text-sm text-muted-foreground">Invalid Date</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Salida</p>
                        <p className="text-sm text-muted-foreground">toneladas</p>
                      </div>
                      <div className="text-sm text-muted-foreground">Invalid Date</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="text-gray-700">
            <CardHeader>
              <CardTitle>Estado de Silos</CardTitle>
              <p className="text-sm text-muted-foreground">Capacidad y stock actual</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSilos.length > 0 ? (
                  activeSilos.map((silo) => (
                    <div key={silo.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{silo.name}</span>
                        <span className="text-sm text-muted-foreground">/{silo.capacity || 1000} t</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(((silo.current_stock || 0) / (silo.capacity || 1000)) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Silo A1</span>
                        <span className="text-sm text-muted-foreground">/1000 t</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Silo B2</span>
                        <span className="text-sm text-muted-foreground">/1500 t</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
