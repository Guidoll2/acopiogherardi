"use client"

import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">4 Granos</h2>
        <p className="mt-2 text-gray-600">Cargando aplicación...</p>
      </div>
    </div>
  )
}
