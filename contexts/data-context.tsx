"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Updated types for the grain management system
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  tax_id: string
  contact_person: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  name: string
  license_number: string
  phone: string
  email?: string           
  transportista?: string   
  license_expiry: string
  is_active?: boolean
  status?: string
  created_at: string
  updated_at: string
}

export interface Silo {
  id: string
  name: string
  capacity: number
  current_stock: number
  cereal_type_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CerealType {
  id: string
  name: string
  code: string
  price_per_ton: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  cuit: string
  status: "active" | "inactive"
  subscription_plan: "basic" | "premium" | "enterprise"
  created_at: string
  updated_at: string
}

export interface Operation {
  id: string
  client_id: string
  driver_id: string
  silo_id: string
  cereal_type_id: string
  company_id: string
  operation_type: "ingreso" | "egreso"
  status: string
  chassis_plate: string
  trailer_plate: string
  quantity: number
  tare_weight: number
  gross_weight: number
  net_weight: number
  moisture: number
  impurities: number
  test_weight: number
  notes: string
  scheduled_date: string
  estimated_duration: number
  
  // Campos de autorización de garita
  authorized_entry?: {
    timestamp: string
    authorized_by: string
    notes?: string
  }
  authorized_exit?: {
    timestamp: string
    authorized_by: string
    notes?: string
  }
  
  // Campo para identificar operaciones creadas desde garita
  created_from_garita?: boolean
  
  created_at: string
  updated_at: string
  createdAt: string // For backward compatibility
  amount?: number // For backward compatibility
}

export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  role: "system_admin" | "admin" | "company_admin" | "garita"
  is_active: boolean
  company_id?: string
  created_at: string
  updated_at: string
}

interface DataContextType {
  // Loading states
  isLoading: boolean
  
  // Data arrays
  users: User[]  
  clients: Client[]
  drivers: Driver[]
  silos: Silo[]
  cerealTypes: CerealType[]
  companies: Company[]
  operations: Operation[]
  cereals: CerealType[] // Alias for cerealTypes
  
  // Refresh function
  refreshData: () => Promise<void>
  
  // Silo stock management
  recalculateSiloStock: (siloId: string) => number
  syncSiloStocks: () => Promise<void>

  // Client CRUD operations
  addClient: (client: Omit<Client, "id" | "created_at" | "updated_at">) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  // Driver CRUD operations
  addDriver: (driver: Omit<Driver, "id" | "created_at" | "updated_at">) => Promise<void>
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>
  deleteDriver: (id: string) => Promise<void>

  // Silo CRUD operations
  addSilo: (silo: Omit<Silo, "id" | "created_at" | "updated_at">) => Promise<void>
  updateSilo: (id: string, silo: Partial<Silo>) => Promise<void>
  deleteSilo: (id: string) => Promise<void>

  // CerealType CRUD operations
  addCereal: (cereal: Omit<CerealType, "id" | "created_at" | "updated_at">) => Promise<void>
  addCerealType: (cereal: Omit<CerealType, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCereal: (id: string, cereal: Partial<CerealType>) => Promise<void>
  updateCerealType: (id: string, cereal: Partial<CerealType>) => Promise<void>
  deleteCereal: (id: string) => Promise<void>
  deleteCerealType: (id: string) => Promise<void>

  // Company CRUD operations
  addCompany: (company: Omit<Company, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>

  // Operation CRUD operations
  addOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at">) => Promise<void>
  updateOperation: (id: string, operation: Partial<Operation>) => Promise<void>
  deleteOperation: (id: string) => Promise<void>

  // Utility functions
  resetData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [silos, setSilos] = useState<Silo[]>([])
  const [cerealTypes, setCerealTypes] = useState<CerealType[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Helper function for authenticated fetch requests
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  }

  // Load all data from APIs
  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadCompanies(),
        loadUsers(),
        loadClients(),
        loadDrivers(),
        loadSilos(),
        loadCerealTypes(),
        loadOperations()
      ])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load companies
  const loadCompanies = async () => {
    try {
      const response = await authenticatedFetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error("Error loading companies:", error)
    }
  }

  // Load users
  const loadUsers = async () => {
    try {
      const response = await authenticatedFetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  // Load clients
  const loadClients = async () => {
    try {
      const response = await authenticatedFetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  // Load drivers
  const loadDrivers = async () => {
    try {
      const response = await authenticatedFetch("/api/drivers")
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers || [])
      }
    } catch (error) {
      console.error("Error loading drivers:", error)
    }
  }

  // Load silos
  const loadSilos = async () => {
    try {
      console.log("🔍 Cargando silos...")
      const response = await authenticatedFetch("/api/silos")
      if (response.ok) {
        const data = await response.json()
        console.log("📦 Datos de silos recibidos:", data)
        console.log("📦 Silos mapeados:", data.silos)
        setSilos(data.silos || [])
        
        // Log adicional para verificar el estado
        if (data.silos && data.silos.length > 0) {
          console.log("📦 Primer silo:", data.silos[0])
          console.log("📦 Current stock del primer silo:", data.silos[0].current_stock)
        }
      } else {
        console.error("❌ Error en respuesta:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error loading silos:", error)
    }
  }

  // Load cereal types
  const loadCerealTypes = async () => {
    try {
      console.log("🌾 Cargando tipos de cereal...")
      const response = await authenticatedFetch("/api/cereals")
      console.log("🌾 Respuesta de cereales:", response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log("🌾 Datos de cereales recibidos:", data)
        console.log("🌾 Cereales mapeados:", data.cereals)
        setCerealTypes(data.cereals || [])
        console.log("🌾 Estado de cereales actualizado")
      } else {
        console.error("❌ Error en respuesta de cereales:", response.status, response.statusText)
        const errorData = await response.json()
        console.error("❌ Datos de error:", errorData)
      }
    } catch (error) {
      console.error("Error loading cereal types:", error)
    }
  }

  // Load operations
  const loadOperations = async () => {
    try {
      const response = await authenticatedFetch("/api/operations")
      if (response.ok) {
        const data = await response.json()
        setOperations(data.operations || [])
      }
    } catch (error) {
      console.error("Error loading operations:", error)
    }
  }

  // Client CRUD operations
  const addClient = async (clientData: Omit<Client, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await authenticatedFetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(clientData)
      })
      if (response.ok) {
        await loadClients() // Reload clients
      }
    } catch (error) {
      console.error("Error adding client:", error)
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const response = await authenticatedFetch(`/api/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await loadClients()
      }
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/clients/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadClients()
      }
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  // Driver CRUD operations
  const addDriver = async (driverData: Omit<Driver, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await authenticatedFetch("/api/drivers", {
        method: "POST",
        body: JSON.stringify(driverData)
      })
      if (response.ok) {
        await loadDrivers()
      }
    } catch (error) {
      console.error("Error adding driver:", error)
    }
  }

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    try {
      const response = await authenticatedFetch(`/api/drivers/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await loadDrivers()
      }
    } catch (error) {
      console.error("Error updating driver:", error)
    }
  }

  const deleteDriver = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/drivers/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadDrivers()
      }
    } catch (error) {
      console.error("Error deleting driver:", error)
    }
  }

  // Silo CRUD operations
  const addSilo = async (siloData: Omit<Silo, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await authenticatedFetch("/api/silos", {
        method: "POST",
        body: JSON.stringify(siloData)
      })
      if (response.ok) {
        await loadSilos()
      }
    } catch (error) {
      console.error("Error adding silo:", error)
    }
  }

  const updateSilo = async (id: string, updates: Partial<Silo>) => {
    try {
      const response = await authenticatedFetch(`/api/silos/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await loadSilos()
      }
    } catch (error) {
      console.error("Error updating silo:", error)
    }
  }

  const deleteSilo = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/silos/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadSilos()
      }
    } catch (error) {
      console.error("Error deleting silo:", error)
    }
  }

  // CerealType CRUD operations
  const addCerealType = async (cerealData: Omit<CerealType, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("=== Iniciando creación de cereal ===")
      console.log("Datos a enviar:", cerealData)
      
      const response = await authenticatedFetch("/api/cereals", {
        method: "POST",
        body: JSON.stringify(cerealData)
      })
      
      console.log("Respuesta del servidor:", response.status, response.statusText)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log("Datos de respuesta:", responseData)
        console.log("Recargando lista de cereales...")
        await loadCerealTypes()
        console.log("Lista de cereales recargada")
      } else {
        const errorData = await response.json()
        console.error("Error en respuesta del servidor:", errorData)
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error("Error adding cereal type:", error)
      throw error // Re-lanzar el error para que sea capturado en handleCreateCereal
    }
  }

  const updateCerealType = async (id: string, updates: Partial<CerealType>) => {
    try {
      const response = await authenticatedFetch(`/api/cereals/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await loadCerealTypes()
      }
    } catch (error) {
      console.error("Error updating cereal type:", error)
    }
  }

  const deleteCerealType = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/cereals/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadCerealTypes()
      }
    } catch (error) {
      console.error("Error deleting cereal type:", error)
    }
  }

  // Company CRUD operations
  const addCompany = async (companyData: Omit<Company, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await authenticatedFetch("/api/companies", {
        method: "POST",
        body: JSON.stringify(companyData)
      })
      if (response.ok) {
        await loadCompanies()
      }
    } catch (error) {
      console.error("Error adding company:", error)
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const response = await authenticatedFetch(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await loadCompanies()
      }
    } catch (error) {
      console.error("Error updating company:", error)
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/companies/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadCompanies()
      }
    } catch (error) {
      console.error("Error deleting company:", error)
    }
  }

  // Operation CRUD operations
  const addOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at">) => {
    try {
      // Convertir el formato del frontend al formato de la API
      const apiOperation = {
        client_id: operationData.client_id,
        driver_id: operationData.driver_id || "",
        silo_id: operationData.silo_id || "",
        cereal_type_id: operationData.cereal_type_id,
        company_id: operationData.company_id || "",
        type: operationData.operation_type, // Convertir operation_type a type
        status: operationData.status || "pending",
        chassis_plate: operationData.chassis_plate,
        trailer_plate: operationData.trailer_plate || "",
        quantity: operationData.quantity || 0,
        tare_weight: operationData.tare_weight || 0,
        gross_weight: operationData.gross_weight || 0,
        net_weight: operationData.net_weight || 0,
        moisture: operationData.moisture || 0,
        impurities: operationData.impurities || 0,
        test_weight: operationData.test_weight || 0,
        notes: operationData.notes || "",
        scheduled_date: operationData.scheduled_date || new Date().toISOString(),
        estimated_duration: operationData.estimated_duration || 60,
        date: new Date().toISOString().split('T')[0], // Para compatibilidad hacia atrás
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      console.log("📤 Enviando a API:", apiOperation)
      
      const response = await authenticatedFetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiOperation)
      })
      if (response.ok) {
        const result = await response.json()
        console.log("✅ Operación creada:", result)
        
        // Actualizar inmediatamente el estado local
        if (result.operation) {
          setOperations(prev => [...prev, result.operation])
        }
        
        // Actualizar el stock del silo según el tipo de operación
        if (operationData.silo_id && operationData.quantity) {
          const affectedSilo = silos.find(s => s.id === operationData.silo_id)
          if (affectedSilo) {
            let newStock = affectedSilo.current_stock
            
            if (operationData.operation_type === "ingreso") {
              newStock += operationData.quantity
            } else if (operationData.operation_type === "egreso") {
              newStock = Math.max(0, newStock - operationData.quantity) // No permitir stock negativo
            }
            
            console.log(`📦 Actualizando stock del silo ${affectedSilo.name}: ${affectedSilo.current_stock} → ${newStock}`)
            
            // Actualizar el silo localmente de inmediato
            setSilos(prev => prev.map(silo => 
              silo.id === operationData.silo_id 
                ? { ...silo, current_stock: newStock }
                : silo
            ))
            
            // También enviar la actualización al servidor
            try {
              await updateSilo(operationData.silo_id, { current_stock: newStock })
            } catch (error) {
              console.error("❌ Error actualizando stock del silo:", error)
              // Revertir el cambio local si falla la actualización del servidor
              setSilos(prev => prev.map(silo => 
                silo.id === operationData.silo_id 
                  ? { ...silo, current_stock: affectedSilo.current_stock }
                  : silo
              ))
            }
          }
        }
        
        // También recargar desde el servidor para estar seguro
        await loadOperations()
      } else {
        const error = await response.json()
        console.error("❌ Error del servidor:", error)
        throw new Error(error.error || "Error creando operación")
      }
    } catch (error) {
      console.error("Error adding operation:", error)
      throw error
    }
  }

  const updateOperation = async (id: string, updates: Partial<Operation>) => {
    try {
      // Obtener la operación original antes de actualizarla
      const originalOperation = operations.find(op => op.id === id)
      if (!originalOperation) {
        throw new Error("Operación no encontrada")
      }

      const response = await authenticatedFetch(`/api/operations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const result = await response.json()
        console.log("✅ Operación actualizada:", result)
        
        // Actualizar inmediatamente el estado local
        setOperations(prev => 
          prev.map(op => 
            op.id === id ? { ...op, ...updates, updated_at: new Date().toISOString() } : op
          )
        )

        // Actualizar el stock del silo si cambió la cantidad o el silo
        const quantityChanged = updates.quantity !== undefined && updates.quantity !== originalOperation.quantity
        const siloChanged = updates.silo_id !== undefined && updates.silo_id !== originalOperation.silo_id
        
        if (quantityChanged || siloChanged) {
          console.log("📦 Actualizando stock del silo debido a cambios en la operación")
          
          // Si cambió el silo, revertir el stock del silo original
          if (siloChanged && originalOperation.silo_id) {
            const originalSilo = silos.find(s => s.id === originalOperation.silo_id)
            if (originalSilo) {
              let revertedStock = originalSilo.current_stock
              
              if (originalOperation.operation_type === "ingreso") {
                revertedStock -= (originalOperation.quantity || 0)
              } else if (originalOperation.operation_type === "egreso") {
                revertedStock += (originalOperation.quantity || 0)
              }
              
              revertedStock = Math.max(0, revertedStock)
              
              console.log(`📦 Revirtiendo stock del silo original ${originalSilo.name}: ${originalSilo.current_stock} → ${revertedStock}`)
              
              setSilos(prev => prev.map(silo => 
                silo.id === originalOperation.silo_id 
                  ? { ...silo, current_stock: revertedStock }
                  : silo
              ))
              
              try {
                await updateSilo(originalOperation.silo_id, { current_stock: revertedStock })
              } catch (error) {
                console.error("❌ Error actualizando silo original:", error)
              }
            }
          }
          
          // Actualizar el stock del silo actual (nuevo o modificado)
          const currentSiloId = updates.silo_id || originalOperation.silo_id
          const currentSilo = silos.find(s => s.id === currentSiloId)
          
          if (currentSilo && currentSiloId) {
            let newStock = currentSilo.current_stock
            const operationType = updates.operation_type || originalOperation.operation_type
            
            // Si solo cambió la cantidad (mismo silo), calcular la diferencia
            if (!siloChanged && quantityChanged) {
              const oldQuantity = originalOperation.quantity || 0
              const newQuantity = updates.quantity || 0
              const quantityDifference = newQuantity - oldQuantity
              
              if (operationType === "ingreso") {
                newStock += quantityDifference
              } else if (operationType === "egreso") {
                newStock -= quantityDifference
              }
            } else {
              // Si cambió el silo, aplicar la cantidad completa
              const newQuantity = updates.quantity || originalOperation.quantity || 0
              
              if (operationType === "ingreso") {
                newStock += newQuantity
              } else if (operationType === "egreso") {
                newStock -= newQuantity
              }
            }
            
            newStock = Math.max(0, newStock)
            
            console.log(`📦 Actualizando stock del silo ${currentSilo.name}: ${currentSilo.current_stock} → ${newStock}`)
            
            setSilos(prev => prev.map(silo => 
              silo.id === currentSiloId 
                ? { ...silo, current_stock: newStock }
                : silo
            ))
            
            try {
              await updateSilo(currentSiloId, { current_stock: newStock })
            } catch (error) {
              console.error("❌ Error actualizando stock del silo:", error)
              // Revertir el cambio local si falla la actualización del servidor
              setSilos(prev => prev.map(silo => 
                silo.id === currentSiloId 
                  ? { ...silo, current_stock: currentSilo.current_stock }
                  : silo
              ))
            }
          }
        }
        
        // También recargar desde el servidor para estar seguro
        await loadOperations()
      }
    } catch (error) {
      console.error("Error updating operation:", error)
      throw error
    }
  }

  const deleteOperation = async (id: string) => {
    try {
      // Obtener la operación antes de eliminarla para revertir el stock
      const operationToDelete = operations.find(op => op.id === id)
      
      const response = await authenticatedFetch(`/api/operations/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        // Revertir el stock del silo si la operación tenía cantidad y silo asignado
        if (operationToDelete && operationToDelete.silo_id && operationToDelete.quantity) {
          const affectedSilo = silos.find(s => s.id === operationToDelete.silo_id)
          if (affectedSilo) {
            let newStock = affectedSilo.current_stock
            
            // Revertir el efecto de la operación eliminada
            if (operationToDelete.operation_type === "ingreso") {
              newStock -= operationToDelete.quantity
            } else if (operationToDelete.operation_type === "egreso") {
              newStock += operationToDelete.quantity
            }
            
            newStock = Math.max(0, newStock)
            
            console.log(`📦 Revirtiendo stock por eliminación de operación en silo ${affectedSilo.name}: ${affectedSilo.current_stock} → ${newStock}`)
            
            setSilos(prev => prev.map(silo => 
              silo.id === operationToDelete.silo_id 
                ? { ...silo, current_stock: newStock }
                : silo
            ))
            
            try {
              await updateSilo(operationToDelete.silo_id, { current_stock: newStock })
            } catch (error) {
              console.error("❌ Error actualizando stock tras eliminación:", error)
            }
          }
        }
        
        await loadOperations()
      }
    } catch (error) {
      console.error("Error deleting operation:", error)
      throw error
    }
  }

  // Reset data (for testing purposes - remove in production)
  const resetData = async () => {
    setClients([])
    setDrivers([])
    setSilos([])
    setCerealTypes([])
    setCompanies([])
    setOperations([])
    setUsers([])
  }

  // Refresh all data
  const refreshData = async () => {
    await loadData()
  }

  // Función para recalcular el stock de un silo basado en operaciones
  const recalculateSiloStock = (siloId: string): number => {
    const siloOperations = operations.filter(op => op.silo_id === siloId)
    
    let stock = 0
    siloOperations.forEach(op => {
      if (op.operation_type === "ingreso") {
        stock += op.quantity || 0
      } else if (op.operation_type === "egreso") {
        stock -= op.quantity || 0
      }
    })
    
    return Math.max(0, stock) // No permitir stock negativo
  }

  // Función para sincronizar todos los stocks de silos con las operaciones
  const syncSiloStocks = async () => {
    console.log("🔄 Sincronizando stocks de silos...")
    
    const updates = silos.map(silo => {
      const calculatedStock = recalculateSiloStock(silo.id)
      return {
        siloId: silo.id,
        currentStock: silo.current_stock,
        calculatedStock
      }
    })
    
    const needsUpdate = updates.filter(u => u.currentStock !== u.calculatedStock)
    
    if (needsUpdate.length > 0) {
      console.log("📦 Silos que necesitan actualización:", needsUpdate)
      
      for (const update of needsUpdate) {
        try {
          await updateSilo(update.siloId, { current_stock: update.calculatedStock })
          console.log(`✅ Stock actualizado para silo ${update.siloId}: ${update.currentStock} → ${update.calculatedStock}`)
        } catch (error) {
          console.error(`❌ Error actualizando silo ${update.siloId}:`, error)
        }
      }
      
      // Recargar silos después de las actualizaciones
      await loadSilos()
    } else {
      console.log("✅ Todos los stocks están sincronizados")
    }
  }

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const contextValue: DataContextType = {
    isLoading,
    clients,
    drivers,
    silos,
    cerealTypes,
    companies,
    operations,
    users,
    cereals: cerealTypes, // Alias
    refreshData,
    recalculateSiloStock,
    syncSiloStocks,
    
    // Client operations
    addClient,
    updateClient,
    deleteClient,
    
    // Driver operations
    addDriver,
    updateDriver,
    deleteDriver,
    
    // Silo operations
    addSilo,
    updateSilo,
    deleteSilo,
    
    // Cereal operations (with aliases)
    addCereal: addCerealType,
    addCerealType,
    updateCereal: updateCerealType,
    updateCerealType,
    deleteCereal: deleteCerealType,
    deleteCerealType,
    
    // Company operations
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Operation operations
    addOperation,
    updateOperation,
    deleteOperation,
    
    // Utility
    resetData
  }

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
