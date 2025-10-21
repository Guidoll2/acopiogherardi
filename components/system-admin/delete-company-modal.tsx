"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToasts } from "@/components/ui/toast"

interface DeleteCompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: any | null
  onDeleted?: () => void
}

export function DeleteCompanyModal({ open, onOpenChange, company, onDeleted }: DeleteCompanyModalProps) {
  const [isSending, setIsSending] = useState(false)
  const [code, setCode] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [force, setForce] = useState(false)
  const { showSuccess, showError, showInfo } = useToasts()

  const sendCode = async () => {
    if (!company) return
    setIsSending(true)
    try {
      const res = await fetch(`/api/companies/${company.id}/delete/request`, { method: 'POST' })
      if (res.ok) {
        showInfo('Código enviado', 'Si la empresa tiene un email registrado, recibirá el código.')
      } else {
        const err = await res.json()
        showError('Error enviando código', err.error || 'Error desconocido')
      }
    } catch (e) {
      console.error(e)
      showError('Error', 'No se pudo enviar el código')
    } finally {
      setIsSending(false)
    }
  }

  const confirmDelete = async () => {
    if (!company) return
    if (!code || code.trim().length === 0) {
      showError('Código requerido', 'Ingresa el código recibido por email')
      return
    }
    setIsConfirming(true)
    try {
      const res = await fetch(`/api/companies/${company.id}/delete/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), force })
      })
      if (res.ok) {
        const json = await res.json()
        showSuccess('Empresa eliminada', json.message || 'La empresa fue eliminada exitosamente')
        onOpenChange(false)
        onDeleted && onDeleted()
      } else {
        const err = await res.json()
        showError('Error', err.error || 'Código inválido o error')
      }
    } catch (e) {
      console.error(e)
      showError('Error', 'Error confirmando la eliminación')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar empresa</DialogTitle>
          <DialogDescription>
            Este procedimiento requiere un código enviado al email de la empresa. Puedes solicitar el código y luego ingresarlo aquí para confirmar la eliminación. La eliminación es irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="font-medium">Empresa:</p>
            <p className="text-sm text-muted-foreground">{company?.name} — {company?.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={sendCode} disabled={isSending} className="bg-yellow-500 hover:bg-yellow-600">{isSending ? 'Enviando...' : 'Enviar código'}</Button>
            <Button variant="outline" onClick={() => setCode('')}>Limpiar código</Button>
          </div>

          <div>
            <Input placeholder="Ingrese el código recibido" value={code} onChange={(e:any) => setCode(e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <input id="force-delete" type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
            <label htmlFor="force-delete" className="text-sm">Forzar eliminación (eliminar también usuarios asociados)</label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={isConfirming}>{isConfirming ? 'Eliminando...' : 'Confirmar eliminación'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
