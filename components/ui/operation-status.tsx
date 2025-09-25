"use client"

import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface OperationStatusProps {
  operation: any
}

export function OperationStatus({ operation }: OperationStatusProps) {
  const getStatusBadge = () => {
    // Mapeo básico de estados de operaciones
    switch (operation.status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            En Progreso
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {operation.status || 'Sin estado'}
          </Badge>
        )
    }
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
    </div>
  )
}