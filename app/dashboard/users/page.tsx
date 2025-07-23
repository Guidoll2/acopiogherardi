"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { useData } from "@/contexts/data-context"
import { usePageReady } from "@/hooks/use-page-ready"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToasts } from "@/components/ui/toast"
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Shield,
  User,
  Settings,
} from "lucide-react"

export default function UsersPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToasts()
  const { users, refreshData } = useData()
  const { markPageAsReady } = usePageReady()
  const [searchTerm, setSearchTerm] = useState("")
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  })

  const currentUser = AuthService.getCurrentUser()

  // Verificar permisos
  useEffect(() => {
    if (!currentUser || !["admin", "company_admin"].includes(currentUser.role)) {
      router.push("/dashboard")
      return
    }
    // Marcar página como lista una vez verificados los permisos
    markPageAsReady()
  }, [currentUser, router, markPageAsReady])

  // Filtrar usuarios de la misma empresa
  const companyUsers = users?.filter(user => 
    user.company_id === currentUser?.company_id && 
    user.role !== "system_admin" // No mostrar system_admins
  ) || []

  const filteredUsers = companyUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      showError("Error de validación", "Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      showError("Error de validación", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!currentUser?.company_id) {
      showError("Error", "No se pudo determinar la empresa del usuario")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: currentUser.company_id,
        }),
      })

      if (response.ok) {
        showSuccess("Usuario creado", "Usuario creado exitosamente")
        setCreateUserOpen(false)
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          role: "",
          password: "",
          confirmPassword: "",
        })
        await refreshData()
      } else {
        const error = await response.json()
        showError("Error", error.error || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      showError("Error", "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = companyUsers.find(u => u.id === userId)
    if (!user) return

    if (user.id === currentUser?.id) {
      showError("Error", "No puedes eliminar tu propio usuario")
      return
    }

    if (confirm(`¿Estás seguro de que deseas eliminar el usuario "${user.full_name}"?`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          showSuccess("Usuario eliminado", "Usuario eliminado exitosamente")
          await refreshData()
        } else {
          const error = await response.json()
          showError("Error", error.error || "Error al eliminar usuario")
        }
      } catch (error) {
        console.error("Error:", error)
        showError("Error", "Error al eliminar usuario")
      }
    }
  }

  const handleResetPassword = async (userId: string) => {
    const user = companyUsers.find(u => u.id === userId)
    if (!user) return

    const newPassword = prompt(`Ingrese la nueva contraseña para ${user.full_name}:`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      showError("Error de validación", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        showSuccess("Contraseña actualizada", `Contraseña actualizada para ${user.full_name}`)
      } else {
        const error = await response.json()
        showError("Error", error.error || "Error al resetear contraseña")
      }
    } catch (error) {
      console.error("Error:", error)
      showError("Error", "Error al resetear contraseña")
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrador", color: "bg-blue-100 text-blue-800" },
      company_admin: { label: "Admin Empresa", color: "bg-purple-100 text-purple-800" },
      supervisor: { label: "Supervisor", color: "bg-green-100 text-green-800" },
      operator: { label: "Operario", color: "bg-yellow-100 text-yellow-800" },
      garita: { label: "Garita", color: "bg-orange-100 text-orange-800" },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || 
                   { label: role, color: "bg-gray-100 text-gray-800" }
    
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "supervisor":
        return "Acceso completo excepto gestión de usuarios"
      case "operator":
        return "Solo operaciones y calendario"
      case "garita":
        return "Solo control de acceso vehicular"
      default:
        return "Permisos de administrador"
    }
  }

  if (!currentUser || !["admin", "company_admin"].includes(currentUser.role)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra los usuarios de tu empresa</p>
          </div>
          
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Crear Usuario</span>
                <span className="sm:hidden">Crear</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md text-gray-700">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">👤 Supervisor</SelectItem>
                      <SelectItem value="operator">⚙️ Operario</SelectItem>
                      <SelectItem value="garita">🚪 Garita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creando..." : "Crear Usuario"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <User className="h-5 w-5 mr-2" />
              Usuarios ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay usuarios</p>
                <p className="text-sm">Crea el primer usuario de tu empresa</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Permisos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {getRolePermissions(user.role)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={user.is_active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                            }
                          >
                            {user.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(user.id)}
                              className="h-8 w-8 p-0"
                              title="Resetear contraseña"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            
                            {user.id !== currentUser.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Información de Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Badge className="bg-green-100 text-green-800 mr-2">Supervisor</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso completo a todas las funciones del sistema excepto la gestión de usuarios.
                  Puede gestionar clientes, conductores, operaciones, reportes y más.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 mr-2">Operario</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso limitado solo a operaciones y calendario. 
                  Puede crear, editar y gestionar operaciones pero no tiene acceso a configuraciones.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Badge className="bg-orange-100 text-orange-800 mr-2">Garita</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso exclusivo al control de garita. 
                  Solo puede ver y gestionar el acceso de vehículos (entradas y salidas).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
