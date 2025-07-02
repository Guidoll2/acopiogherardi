"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Truck,
  Warehouse,
  Package,
  FileText,
  Calendar,
  LogOut,
  Wheat,
  Shield,
} from "lucide-react"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/login")
  }

  // Definir navegación según el rol del usuario
  const getNavigationForRole = (role: string) => {
    // Navegación para administrador de sistema - SOLO administración del sistema
    if (role === "system_admin") {
      return [
        {
          name: "Admin Sistema",
          href: "/system-admin",
          icon: Shield,
          roles: ["system_admin"],
        },
      ]
    }

    // Navegación para usuario garita - SOLO dashboard (que será redirigido)
    if (role === "garita") {
      return [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: ["garita"],
        },
      ]
    }

    // Navegación completa para administradores de empresa y operadores
    const fullNavigation = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "company_admin", "supervisor", "operator"],
      },
      {
        name: "Operaciones",
        href: "/dashboard/operations",
        icon: Package,
        roles: ["admin", "company_admin", "supervisor", "operator"],
      },
      {
        name: "Clientes",
        href: "/dashboard/clients",
        icon: Users,
        roles: ["admin", "company_admin", "supervisor"],
      },
      {
        name: "Conductores",
        href: "/dashboard/drivers",
        icon: Truck,
        roles: ["admin", "company_admin", "supervisor"],
      },
      {
        name: "Silos",
        href: "/dashboard/silos",
        icon: Warehouse,
        roles: ["admin", "company_admin", "supervisor"],
      },
      {
        name: "Cereales",
        href: "/dashboard/cereals",
        icon: Wheat,
        roles: ["admin", "company_admin", "supervisor"],
      },
      {
        name: "Reportes",
        href: "/dashboard/reports",
        icon: FileText,
        roles: ["admin", "company_admin", "supervisor"],
      },
      {
        name: "Calendario",
        href: "/dashboard/calendar",
        icon: Calendar,
        roles: ["admin", "company_admin", "supervisor", "operator"],
      },
    ]

    // Filtrar según el rol
    return fullNavigation.filter((item) => item.roles.includes(role))
  }

  const navigation = user ? getNavigationForRole(user.role) : []

  // Función para obtener el título según el rol
  const getTitle = (role: string) => {
    switch (role) {
      case "system_admin":
        return "Admin Sistema"
      case "garita":
        return "Control de Garita"
      default:
        return "Sistema Acopio"
    }
  }

  // Función para obtener el subtítulo según el rol
  const getSubtitle = (role: string) => {
    switch (role) {
      case "system_admin":
        return "Administración del Sistema"
      case "garita":
        return "Control de Acceso"
      default:
        return "Gestión de Cereales"
    }
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-green-600 p-2 rounded-lg">
            {user?.role === "system_admin" ? (
              <Shield className="h-6 w-6 text-white" />
            ) : (
              <Wheat className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{getTitle(user?.role)}</h2>
            <p className="text-xs text-gray-500">{getSubtitle(user?.role)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Button
            key={item.name}
            variant={pathname === item.href ? "secondary" : "outline"}
            className="w-full justify-start"
            onClick={() => router.push(item.href)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t mt-auto">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium">{user.full_name || user.name}</p>
            <p className="text-xs text-gray-500">
              {user.role === "system_admin"
                ? "Administrador Sistema"
                : user.role === "garita"
                  ? "Operador de Garita"
                  : user.role === "admin" || user.role === "company_admin"
                    ? "Administrador"
                    : user.role === "supervisor"
                      ? "Supervisor"
                      : user.role === "operator"
                        ? "Operador"
                        : user.position || user.system_role}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
