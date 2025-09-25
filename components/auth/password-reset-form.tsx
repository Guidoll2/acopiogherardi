"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, KeyRound, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

type Step = "email" | "code" | "password" | "success"

export function PasswordResetForm() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message
        })
        setStep("code")
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error enviando el código"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden"
      })
      return
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres"
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode, newPassword }),
      })

      const result = await response.json()

      if (result.success) {
        setStep("success")
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error cambiando la contraseña"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Código"}
            </Button>
          </form>
        )

      case "code":
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetCode">Código de Verificación</Label>
              <Input
                id="resetCode"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Ingresa el código de 6 dígitos"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-600">
                Revisa tu email. Te enviamos un código de 6 dígitos a <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep("email")}
                className="flex-1"
              >
                Volver
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                disabled={loading}
              >
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </div>
          </form>
        )

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">¡Contraseña Cambiada!</h3>
            <p className="text-gray-600">
              Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link href="/login">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Ir al Login
              </Button>
            </Link>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Recuperar Contraseña"
      case "code":
        return "Verificar Código"
      case "password":
        return "Nueva Contraseña"
      case "success":
        return "¡Listo!"
      default:
        return "Recuperar Contraseña"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case "email":
        return "Ingresa tu email para recibir un código de recuperación"
      case "code":
        return "Ingresa el código que recibiste por email y tu nueva contraseña"
      case "password":
        return "Crea una nueva contraseña segura"
      case "success":
        return "Tu contraseña ha sido actualizada"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Acopio</h1>
          <p className="text-gray-600 mt-2">Recuperación de Contraseña</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">{getStepTitle()}</CardTitle>
            <CardDescription className="text-gray-700">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderStepContent()}
            
            {step !== "success" && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}