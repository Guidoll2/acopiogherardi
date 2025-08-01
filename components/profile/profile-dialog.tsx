"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/contexts/offline-data-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { User, Building2, Shield, Save, LogOut } from "lucide-react"
import { ChangePasswordSection } from "./change-password-section"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const router = useRouter()
  const { companies } = useData()
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Obtener la empresa del usuario
  const userCompany = user?.company_id 
    ? companies.find(company => company.id === user.company_id)
    : null

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setProfileData({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        position: "", // Ya no existe en AuthUser, inicializamos vacío
      })
    }
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    onOpenChange(false)
    router.push("/login")
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      console.log("Guardando perfil:", profileData)
      
      // Actualizar perfil a través de la API
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil")
      }

      const updatedUser = await response.json()
      
      // Actualizar el usuario en el AuthService
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        const newUserData = {
          ...currentUser,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
        }
        localStorage.setItem("grain_auth_user", JSON.stringify(newUserData))
        setUser(newUserData)
      }
      
      console.log("Perfil actualizado exitosamente")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error al guardar el perfil. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "system_admin":
        return <Badge className="bg-red-100 text-red-800">Administrador Sistema</Badge>
      case "admin":
      case "company_admin":
        return <Badge className="bg-blue-100 text-blue-800">Administrador</Badge>
      case "supervisor":
        return <Badge className="bg-green-100 text-green-800">Supervisor</Badge>
      case "operator":
        return <Badge className="bg-yellow-100 text-yellow-800">Operador</Badge>
      case "garita":
        return <Badge className="bg-purple-100 text-purple-800">Operador Garita</Badge>
      default:
        return <Badge variant="secondary">Usuario</Badge>
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto text-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </DialogTitle>
          <DialogDescription>Gestiona tu información personal y configuración de cuenta</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-green-600 text-white text-lg">
                    {getInitials(user.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.full_name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    placeholder="Ej: Gerente de Operaciones"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la empresa (si aplica) */}
          {user.role !== "system_admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Empresa</p>
                      <p className="font-medium">{userCompany?.name || "Sin empresa asignada"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Permisos</p>
                      <p className="font-medium">
                        {user.role === "admin" || user.role === "company_admin"
                          ? "Administrador"
                          : user.role === "supervisor"
                            ? "Supervisor"
                            : user.role === "operator"
                              ? "Operador"
                              : "Usuario"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de cambio de contraseña */}
          <ChangePasswordSection userId={user.id} />

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
