import type { Operation } from "@/types"

// Simular acciones del servidor usando localStorage
export async function addOperation(operation: Partial<Operation>) {
  try {
    // Obtener operaciones existentes
    const existingOperations = JSON.parse(localStorage.getItem("operations") || "[]")

    // Crear nueva operación con ID único
    const newOperation: Operation = {
      id: Date.now().toString(),
      type: operation.type || "entrada",
      description: operation.description ?? "",
      amount: operation.amount || 0,
      status: operation.status || "pendiente",
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduled_date: operation.scheduled_date,
      estimated_duration: operation.estimated_duration,
      client_id: operation.client_id || "",
      driver_id: operation.driver_id || "",
      silo_id: operation.silo_id || "",
      cereal_type_id: operation.cereal_type_id,
      company_id: operation.company_id || "1",
      weight_in: operation.weight_in,
      weight_out: operation.weight_out,
      net_weight: operation.net_weight ?? 0,
      moisture: operation.moisture,
      impurities: operation.impurities ?? 0,
      test_weight: operation.test_weight,
      observations: operation.observations,
      operation_type: "ingreso",
      cereal_id: "",
      truck_plate: "",
      gross_weight: 0,
      tare_weight: 0,
      humidity: 0,
      entry_time: "",
      exit_time: null
    }

    // Agregar la nueva operación
    const updatedOperations = [...existingOperations, newOperation]
    localStorage.setItem("operations", JSON.stringify(updatedOperations))

    // Disparar evento personalizado para actualizar el contexto
    window.dispatchEvent(new CustomEvent("operationsUpdated"))

    return { success: true, operation: newOperation }
  } catch (error) {
    console.error("Error adding operation:", error)
    return { success: false, error: "Error al crear la operación" }
  }
}

export async function updateOperation(id: string, updates: Partial<Operation>) {
  try {
    const existingOperations = JSON.parse(localStorage.getItem("operations") || "[]")
    const operationIndex = existingOperations.findIndex((op: Operation) => op.id === id)

    if (operationIndex === -1) {
      return { success: false, error: "Operación no encontrada" }
    }

    // Actualizar la operación
    existingOperations[operationIndex] = {
      ...existingOperations[operationIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem("operations", JSON.stringify(existingOperations))
    window.dispatchEvent(new CustomEvent("operationsUpdated"))

    return { success: true, operation: existingOperations[operationIndex] }
  } catch (error) {
    console.error("Error updating operation:", error)
    return { success: false, error: "Error al actualizar la operación" }
  }
}

export async function deleteOperation(id: string) {
  try {
    const existingOperations = JSON.parse(localStorage.getItem("operations") || "[]")
    const filteredOperations = existingOperations.filter((op: Operation) => op.id !== id)

    localStorage.setItem("operations", JSON.stringify(filteredOperations))
    window.dispatchEvent(new CustomEvent("operationsUpdated"))

    return { success: true }
  } catch (error) {
    console.error("Error deleting operation:", error)
    return { success: false, error: "Error al eliminar la operación" }
  }
}

export async function getOperations() {
  try {
    const operations = JSON.parse(localStorage.getItem("operations") || "[]")
    return { success: true, operations }
  } catch (error) {
    console.error("Error getting operations:", error)
    return { success: false, operations: [] }
  }
}
