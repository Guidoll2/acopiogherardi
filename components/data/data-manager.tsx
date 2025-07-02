"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/contexts/data-context"
import { Download, Upload, RotateCcw, Database, FileText, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DataManager() {
  const { companies, users, clients, silos, operations, cerealTypes, drivers, resetData, refreshData } = useData()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Exportar datos a archivo JSON
  const exportData = () => {
    setIsExporting(true)
    try {
      const allData = {
        companies,
        users,
        clients,
        silos,
        operations,
        cerealTypes,
        drivers,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `cuatrogranos-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Datos exportados correctamente" })
    } catch (error) {
      setMessage({ type: "error", text: "Error al exportar los datos" })
    } finally {
      setIsExporting(false)
    }
  }

  // Importar datos desde archivo JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        // Validar estructura básica
        if (!importedData.operations || !importedData.clients || !importedData.drivers) {
          throw new Error("Archivo no válido")
        }

        // Guardar en localStorage
        localStorage.setItem("grain_system_data", JSON.stringify(importedData))

        // Refrescar datos en la aplicación
        refreshData()

        setMessage({
          type: "success",
          text: `Datos importados correctamente. ${importedData.operations.length} operaciones cargadas.`,
        })
      } catch (error) {
        setMessage({ type: "error", text: "Error al importar los datos. Verifica el archivo." })
      } finally {
        setIsImporting(false)
      }
    }

    reader.readAsText(file)
    // Limpiar el input
    event.target.value = ""
  }

  // Resetear a datos por defecto
  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres resetear todos los datos a los valores por defecto?")) {
      resetData()
      setMessage({ type: "success", text: "Datos reseteados a valores por defecto" })
    }
  }

  // Limpiar mensaje después de 5 segundos
  if (message) {
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exportar Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
            <CardDescription>Descarga todos los datos del sistema en un archivo JSON para hacer backup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>📊 {operations.length} operaciones</p>
                <p>👥 {clients.length} clientes</p>
                <p>🚗 {drivers.length} choferes</p>
                <p>🏢 {silos.length} silos</p>
                <p>🌾 {cerealTypes.length} tipos de cereal</p>
              </div>
              <Button onClick={exportData} disabled={isExporting} className="w-full">
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Importar Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Datos
            </CardTitle>
            <CardDescription>Carga datos desde un archivo JSON de backup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>⚠️ Esto reemplazará todos los datos actuales</p>
                <p>📁 Selecciona un archivo .json válido</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button disabled={isImporting} className="w-full" variant="outline">
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Archivo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>Acciones adicionales para la gestión de datos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleReset} variant="secondary" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Resetear a Datos por Defecto
            </Button>

            <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Recargar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instrucciones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>📥 Para hacer backup:</strong> Haz clic en "Descargar Backup" para guardar todos tus datos
            </p>
            <p>
              <strong>📤 Para restaurar:</strong> Usa "Seleccionar Archivo" para cargar un backup previo
            </p>
            <p>
              <strong>🔄 Entre versiones:</strong> Exporta antes de actualizar, luego importa en la nueva versión
            </p>
            <p>
              <strong>⚠️ Importante:</strong> Los archivos se guardan en formato JSON y contienen todos los datos del
              sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
