import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-green-600",
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Componente para loading de página completa
export function PageLoadingSpinner({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-center space-y-6">
        {/* Spinner principal con efecto glass */}
        <div className="relative">
          <div className="w-16 h-16 animate-spin rounded-full border-4 border-white/30 border-t-green-500 shadow-lg"></div>
          <div className="absolute inset-2 w-12 h-12 animate-pulse rounded-full bg-gradient-to-tr from-green-400/20 to-green-600/20 backdrop-blur-sm"></div>
        </div>
        
        {/* Texto con efecto glass sutil */}
        <div className="space-y-3">
          <p className="text-lg font-medium text-gray-800 drop-shadow-sm">{text}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce shadow-sm"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para loading inline
export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}

// Componente para loading de pantalla completa con efecto glass
export function FullScreenLoadingSpinner({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      {/* Background glass que ocupa toda la pantalla */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-white/30 backdrop-blur-lg"></div>
      
      {/* Contenido centrado con glass morfismo */}
      <div className="relative z-10 text-center">
        <div className="p-10 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
          <div className="space-y-6">
            {/* Spinner mejorado */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/40 border-t-green-500 shadow-lg"></div>
              <div className="absolute inset-3 animate-pulse rounded-full bg-gradient-to-tr from-green-400/30 to-green-600/30 backdrop-blur-sm"></div>
            </div>
            
            {/* Texto estilizado */}
            <div className="space-y-3">
              <p className="text-xl font-semibold text-gray-800 drop-shadow-sm">{text}</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
