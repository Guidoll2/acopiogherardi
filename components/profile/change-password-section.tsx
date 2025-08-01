"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, KeyRound, Save } from "lucide-react"

interface ChangePasswordSectionProps {
  userId: string
  onPasswordChanged?: () => void
}

export function ChangePasswordSection({ userId, onPasswordChanged }: ChangePasswordSectionProps) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validatePasswords = () => {
    if (!passwords.current) {
      setError("La contraseña actual es requerida")
      return false
    }
    
    if (!passwords.new) {
      setError("La nueva contraseña es requerida")
      return false
    }
    
    if (passwords.new.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return false
    }
    
    if (passwords.new !== passwords.confirm) {
      setError("Las contraseñas nuevas no coinciden")
      return false
    }

    if (passwords.current === passwords.new) {
      setError("La nueva contraseña debe ser diferente a la actual")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña actualizada exitosamente")
        setPasswords({ current: "", new: "", confirm: "" })
        onPasswordChanged?.()
      } else {
        setError(data.error || "Error al actualizar la contraseña")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Cambiar Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña actual */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Se recomienda usar una combinación de letras, números y símbolos.
            </p>
          </div>

          {/* Confirmar nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
              {success}
            </div>
          )}

          {/* Botón de envío */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
