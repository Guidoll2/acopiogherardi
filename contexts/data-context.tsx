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
  variety?: string
  harvest_year?: number
  quality_grade?: string
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
      const response = await authenticatedFetch("/api/silos")
      if (response.ok) {
        const data = await response.json()
        setSilos(data.silos || [])
      }
    } catch (error) {
      console.error("Error loading silos:", error)
    }
  }

  // Load cereal types
  const loadCerealTypes = async () => {
    try {
      const response = await authenticatedFetch("/api/cereals")
      if (response.ok) {
        const data = await response.json()
        setCerealTypes(data.cereals || [])
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
      const response = await authenticatedFetch("/api/cereals", {
        method: "POST",
        body: JSON.stringify(cerealData)
      })
      if (response.ok) {
        await loadCerealTypes()
      }
    } catch (error) {
      console.error("Error adding cereal type:", error)
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
        
        // También recargar desde el servidor para estar seguro
        await loadOperations()
      }
    } catch (error) {
      console.error("Error updating operation:", error)
    }
  }

  const deleteOperation = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/operations/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await loadOperations()
      }
    } catch (error) {
      console.error("Error deleting operation:", error)
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
