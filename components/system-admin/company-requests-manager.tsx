"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import { CompanyRegistrationRequest } from "@/types"

export function CompanyRequestsManager() {
  const [requests, setRequests] = useState<CompanyRegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CompanyRegistrationRequest | null>(null)
  const [notes, setNotes] = useState("")

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/company-requests")
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error cargando solicitudes"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error de conexión"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    setActionLoading(requestId)
    setMessage(null)

    try {
      const response = await fetch(`/api/company-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes,
          reviewed_by: "System Admin" // En producción, obtener del usuario logueado
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message
        })
        setSelectedRequest(null)
        setNotes("")
        fetchRequests() // Recargar lista
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error procesando solicitud"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error de conexión"
      })
    } finally {
      setActionLoading("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      case "approved":
        return <Badge variant="default" className="bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aprobada
        </Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rechazada
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Ahora `requests` representa los últimos registros (company_admin)
  const recentRegistrations = requests

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Cargando solicitudes...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Últimos registros</h1>
          <p className="text-gray-600">Listado cronológico de los últimos usuarios registrados</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Listado de últimos registros */}
      {recentRegistrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Últimos registros ({recentRegistrations.length})
          </h2>
          
          <div className="grid gap-4">
            {recentRegistrations.map((request) => (
              <Card key={request.id} className="bg-white/80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {request.company_name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Registrado el {formatDate(request.created_at)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Contacto:</span>
                        <span>{request.contact_person}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">CUIT:</span>
                        <span>{request.cuit}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="font-medium">Dirección:</span>
                        <span className="text-gray-700">{request.address || ''}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historial previo eliminado - sólo mostramos los últimos registros */}

      {requests.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-600">No se han recibido solicitudes de registro aún.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}