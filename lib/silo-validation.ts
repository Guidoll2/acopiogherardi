import { useToasts } from "@/components/ui/toast"

// Función para validar capacidad del silo
export const validateSiloCapacity = (silos: any[], siloId: string, newQuantity: number) => {
  const silo = silos.find(s => s.id === siloId)
  if (!silo) return { valid: false, message: "Silo no encontrado" }
  
  const totalAfterLoad = (silo.current_stock || 0) + newQuantity
  
  if (totalAfterLoad > silo.capacity) {
    const availableSpace = silo.capacity - (silo.current_stock || 0)
    return { 
      valid: false, 
      message: `Capacidad insuficiente. Espacio disponible: ${availableSpace.toFixed(1)}t de ${silo.capacity}t total.`,
      availableSpace: availableSpace,
      currentStock: silo.current_stock || 0,
      capacity: silo.capacity
    }
  }
  
  return { 
    valid: true, 
    message: "Capacidad suficiente",
    availableSpace: silo.capacity - (silo.current_stock || 0),
    currentStock: silo.current_stock || 0,
    capacity: silo.capacity
  }
}

// Hook para usar validación de capacidad con toasters
export const useSiloValidation = () => {
  const { showError, showWarning, showSuccess } = useToasts()
  
  const validateAndShowToast = (silos: any[], siloId: string, newQuantity: number) => {
    const validation = validateSiloCapacity(silos, siloId, newQuantity)
    
    if (!validation.valid) {
      showError("Capacidad insuficiente", validation.message)
      return false
    }
    
    // Mostrar advertencia si está cerca del límite (80% o más)
    const usagePercentage = ((validation.currentStock + newQuantity) / validation.capacity) * 100
    if (usagePercentage >= 80) {
      showWarning(
        "Silo casi lleno", 
        `El silo estará al ${usagePercentage.toFixed(1)}% de su capacidad tras esta operación.`
      )
    }
    
    return true
  }
  
  return {
    validateSiloCapacity,
    validateAndShowToast
  }
}
