"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useNavigationWithLoading } from "@/hooks/use-navigation"
import { cn } from "@/lib/utils"
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
  X,
} from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { navigateWithLoading, navigateAndReplace } = useNavigationWithLoading()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    navigateAndReplace("/login")
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

  const handleNavigation = (href: string) => {
    navigateWithLoading(href)
    onClose?.() // Cerrar el menú móvil después de navegar
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-80 md:w-64 bg-white shadow-lg 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Header con botón de cierre para móvil */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg flex-shrink-0">
                {user?.role === "system_admin" ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <Wheat className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{getTitle(user?.role)}</h2>
                <p className="text-xs text-gray-600">{getSubtitle(user?.role)}</p>
              </div>
            </div>
            {/* Botón de cierre para móvil */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden p-2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "outline"}
              className={cn(
                "w-full h-12 !justify-start px-4 gap-3 text-left font-medium",
                pathname === item.href 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Button>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t mt-auto">
          {user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{user.full_name || user.name}</p>
              <p className="text-xs text-gray-600">
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
            className="w-full h-12 !justify-start px-4 gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </>
  )
}
