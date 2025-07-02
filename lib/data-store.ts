"use client"
import { companies, users, clients, silos, operations, cerealTypes, drivers } from "./mock-data"

// Clase para manejar el almacenamiento de datos
class DataStore {
  private static instance: DataStore
  private storageKey = "grain_system_data"

  private constructor() {}

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }

  // Cargar datos desde localStorage o usar datos por defecto
  loadData() {
    if (typeof window === "undefined") {
      return {
        companies,
        users,
        clients,
        silos,
        operations,
        cerealTypes,
        drivers,
      }
    }

    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return this.getDefaultData()
      }
    }
    return this.getDefaultData()
  }

  // Guardar datos en localStorage
  saveData(data: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    }
  }

  // Obtener datos por defecto
  private getDefaultData() {
    return {
      companies,
      users,
      clients,
      silos,
      operations,
      cerealTypes,
      drivers,
    }
  }

  // Resetear datos a valores por defecto
  resetData() {
    const defaultData = this.getDefaultData()
    this.saveData(defaultData)
    return defaultData
  }
}

export const dataStore = DataStore.getInstance()
