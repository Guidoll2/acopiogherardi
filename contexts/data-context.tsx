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
  email?: string           // <-- agrega esto
  transportista?: string   // <-- y esto
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
  price_per_ton?: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  tax_id: string
  address: string
  phone: string
  email: string
  plan: string
  status: "active" | "inactive"
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
  status:
    | "pendiente"
    | "autorizar_acceso"
    | "balanza_ingreso"
    | "en_carga_descarga"
    | "balanza_egreso"
    | "autorizar_egreso"
    | "completado"
  chassis_plate: string
  trailer_plate?: string
  quantity: number
  tare_weight: number
  gross_weight: number
  net_weight: number
  moisture?: number
  impurities?: number
  test_weight?: number
  notes?: string
  scheduled_date?: string
  estimated_duration?: number
  created_at: string
  updated_at: string
}

// Add User interface definition
export interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface DataContextType {
  // Data arrays
    users: User[]  
  clients: Client[]
  drivers: Driver[]
  silos: Silo[]
    refreshData: () => void
  cerealTypes: CerealType[]
  companies: Company[]
  operations: Operation[]
    cereals: CerealType[]
  addCereal: (cereal: Omit<CerealType, "id" | "created_at" | "updated_at">) => void
  updateCereal: (id: string, cereal: Partial<CerealType>) => void
  deleteCereal: (id: string) => void

  // CRUD operations
  addClient: (client: Omit<Client, "id" | "created_at" | "updated_at">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void

  addDriver: (driver: Omit<Driver, "id" | "created_at" | "updated_at">) => void
  updateDriver: (id: string, driver: Partial<Driver>) => void
  deleteDriver: (id: string) => void

  addSilo: (silo: Omit<Silo, "id" | "created_at" | "updated_at">) => void
  updateSilo: (id: string, silo: Partial<Silo>) => void
  deleteSilo: (id: string) => void

  addCerealType: (cereal: Omit<CerealType, "id" | "created_at" | "updated_at">) => void
  updateCerealType: (id: string, cereal: Partial<CerealType>) => void
  deleteCerealType: (id: string) => void

  addCompany: (company: Omit<Company, "id" | "created_at" | "updated_at">) => void
  updateCompany: (id: string, company: Partial<Company>) => void
  deleteCompany: (id: string) => void

  addOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at">) => void
  updateOperation: (id: string, operation: Partial<Operation>) => void
  deleteOperation: (id: string) => void

  // Utility functions
  resetData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Mock data
const mockClients: Client[] = [
  {
    id: "1",
    name: "Estancia La Esperanza",
    email: "contacto@laesperanza.com",
    phone: "+54 11 4567-8901",
    address: "Ruta 5 Km 120, Buenos Aires",
    tax_id: "20-12345678-9",
    contact_person: "Juan Pérez",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Agropecuaria San Martín",
    email: "admin@sanmartin.com.ar",
    phone: "+54 11 4567-8902",
    address: "Av. San Martín 456, Córdoba",
    tax_id: "20-87654321-0",
    contact_person: "María González",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Campo Verde S.A.",
    email: "info@campoverde.com",
    phone: "+54 11 4567-8903",
    address: "Ruta 9 Km 85, Santa Fe",
    tax_id: "30-11223344-5",
    contact_person: "Carlos Rodríguez",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "Roberto Silva",
    license_number: "B1234567",
    phone: "+54 11 9876-5432",
    license_expiry: "2025-12-31",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Miguel Torres",
    license_number: "B2345678",
    phone: "+54 11 9876-5433",
    license_expiry: "2025-08-15",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Diego Morales",
    license_number: "B3456789",
    phone: "+54 11 9876-5434",
    license_expiry: "2026-03-20",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockSilos: Silo[] = [
  {
    id: "1",
    name: "Silo A1",
    capacity: 1000,
    current_stock: 750,
    cereal_type_id: "1",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Silo B2",
    capacity: 1500,
    current_stock: 900,
    cereal_type_id: "2",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Silo C3",
    capacity: 800,
    current_stock: 200,
    cereal_type_id: "3",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Silo D4",
    capacity: 1200,
    current_stock: 0,
    cereal_type_id: "1",
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockCerealTypes: CerealType[] = [
  {
    id: "1",
    name: "Soja",
    code: "SOJ",
    variety: "RR",
    harvest_year: 2024,
    quality_grade: "A",
    price_per_ton: 350000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Maíz",
    code: "MAI",
    variety: "Flint",
    harvest_year: 2024,
    quality_grade: "A",
    price_per_ton: 280000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Trigo",
    code: "TRI",
    variety: "Pan",
    harvest_year: 2024,
    quality_grade: "B",
    price_per_ton: 320000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acopio Central",
    tax_id: "30-12345678-9",
    address: "Av. Principal 123, Buenos Aires",
    phone: "+54 11 4000-0000",
    email: "info@acopiocentral.com",
    plan: "premium",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockOperations: Operation[] = [
  {
    id: "1",
    client_id: "1",
    driver_id: "1",
    silo_id: "1",
    cereal_type_id: "1",
    company_id: "1",
    operation_type: "ingreso",
    status: "pendiente",
    chassis_plate: "ABC123",
    trailer_plate: "TRL456",
    quantity: 25.5,
    tare_weight: 8500,
    gross_weight: 34000,
    net_weight: 25500,
    moisture: 14.2,
    impurities: 2.1,
    test_weight: 78.5,
    notes: "Carga de soja de primera calidad",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 120,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
  },
  {
    id: "2",
    client_id: "2",
    driver_id: "2",
    silo_id: "2",
    cereal_type_id: "2",
    company_id: "1",
    operation_type: "egreso",
    status: "autorizar_acceso",
    chassis_plate: "XYZ789",
    trailer_plate: "TRL789",
    quantity: 18.2,
    tare_weight: 9000,
    gross_weight: 27200,
    net_weight: 18200,
    moisture: 13.8,
    impurities: 1.9,
    test_weight: 76.2,
    notes: "Retiro de maíz para exportación",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 90,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
  },
  {
    id: "3",
    client_id: "1",
    driver_id: "3",
    silo_id: "3",
    cereal_type_id: "3",
    company_id: "1",
    operation_type: "ingreso",
    status: "balanza_ingreso",
    chassis_plate: "DEF456",
    trailer_plate: "",
    quantity: 30.0,
    tare_weight: 7800,
    gross_weight: 37800,
    net_weight: 30000,
    moisture: 12.5,
    impurities: 1.5,
    test_weight: 79.1,
    notes: "Trigo de excelente calidad",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 150,
    created_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    updated_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
  },
  {
    id: "4",
    client_id: "3",
    driver_id: "1",
    silo_id: "1",
    cereal_type_id: "1",
    company_id: "1",
    operation_type: "egreso",
    status: "en_carga_descarga",
    chassis_plate: "GHI789",
    trailer_plate: "TRL123",
    quantity: 22.8,
    tare_weight: 8200,
    gross_weight: 31000,
    net_weight: 22800,
    moisture: 14.0,
    impurities: 2.0,
    test_weight: 78.0,
    notes: "Carga en proceso",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 100,
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  },
  {
    id: "5",
    client_id: "2",
    driver_id: "2",
    silo_id: "2",
    cereal_type_id: "2",
    company_id: "1",
    operation_type: "ingreso",
    status: "balanza_egreso",
    chassis_plate: "JKL012",
    trailer_plate: "",
    quantity: 28.5,
    tare_weight: 8800,
    gross_weight: 37300,
    net_weight: 28500,
    moisture: 13.5,
    impurities: 1.8,
    test_weight: 77.5,
    notes: "Pesaje final completado",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 110,
    created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    updated_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
  },
  {
    id: "6",
    client_id: "3",
    driver_id: "3",
    silo_id: "3",
    cereal_type_id: "3",
    company_id: "1",
    operation_type: "egreso",
    status: "autorizar_egreso",
    chassis_plate: "MNO345",
    trailer_plate: "TRL890",
    quantity: 19.2,
    tare_weight: 7500,
    gross_weight: 26700,
    net_weight: 19200,
    moisture: 12.8,
    impurities: 1.6,
    test_weight: 79.3,
    notes: "Listo para autorizar salida",
    scheduled_date: new Date().toISOString(),
    estimated_duration: 80,
    created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
  },
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [silos, setSilos] = useState<Silo[]>(mockSilos)
  const [cerealTypes, setCerealTypes] = useState<CerealType[]>(mockCerealTypes)
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [operations, setOperations] = useState<Operation[]>(mockOperations)
    const [users, setUsers] = useState<User[]>([]) // <-- agrega aquí


  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOperations = localStorage.getItem("grain_operations")
      if (savedOperations) {
        try {
          setOperations(JSON.parse(savedOperations))
        } catch (error) {
          console.error("Error loading operations from localStorage:", error)
        }
      }
    }
  }, [])

  // Save operations to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("grain_operations", JSON.stringify(operations))
    }
  }, [operations])

  // Client operations
  const addClient = (clientData: Omit<Client, "id" | "created_at" | "updated_at">) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setClients((prev) => [...prev, newClient])
  }

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...updates, updated_at: new Date().toISOString() } : client,
      ),
    )
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  // Driver operations
  const addDriver = (driverData: Omit<Driver, "id" | "created_at" | "updated_at">) => {
    const newDriver: Driver = {
      ...driverData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setDrivers((prev) => [...prev, newDriver])
  }

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((driver) =>
        driver.id === id ? { ...driver, ...updates, updated_at: new Date().toISOString() } : driver,
      ),
    )
  }

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((driver) => driver.id !== id))
  }

  // Silo operations
  const addSilo = (siloData: Omit<Silo, "id" | "created_at" | "updated_at">) => {
    const newSilo: Silo = {
      ...siloData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSilos((prev) => [...prev, newSilo])
  }

  const updateSilo = (id: string, updates: Partial<Silo>) => {
    setSilos((prev) =>
      prev.map((silo) => (silo.id === id ? { ...silo, ...updates, updated_at: new Date().toISOString() } : silo)),
    )
  }

  const deleteSilo = (id: string) => {
    setSilos((prev) => prev.filter((silo) => silo.id !== id))
  }

  // CerealType operations
  const addCerealType = (cerealData: Omit<CerealType, "id" | "created_at" | "updated_at">) => {
    const newCereal: CerealType = {
      ...cerealData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCerealTypes((prev) => [...prev, newCereal])
  }

  const updateCerealType = (id: string, updates: Partial<CerealType>) => {
    setCerealTypes((prev) =>
      prev.map((cereal) =>
        cereal.id === id ? { ...cereal, ...updates, updated_at: new Date().toISOString() } : cereal,
      ),
    )
  }

  const deleteCerealType = (id: string) => {
    setCerealTypes((prev) => prev.filter((cereal) => cereal.id !== id))
  }

  // Company operations
  const addCompany = (companyData: Omit<Company, "id" | "created_at" | "updated_at">) => {
    const newCompany: Company = {
      ...companyData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCompanies((prev) => [...prev, newCompany])
  }

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id ? { ...company, ...updates, updated_at: new Date().toISOString() } : company,
      ),
    )
  }

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id))
  }

  // Operation operations
  const addOperation = (operationData: Omit<Operation, "id" | "created_at" | "updated_at">) => {
    const newOperation: Operation = {
      ...operationData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setOperations((prev) => [...prev, newOperation])
  }

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations((prev) =>
      prev.map((operation) =>
        operation.id === id ? { ...operation, ...updates, updated_at: new Date().toISOString() } : operation,
      ),
    )
  }

  const deleteOperation = (id: string) => {
    setOperations((prev) => prev.filter((operation) => operation.id !== id))
  }

  // Reset data to initial mock state
  const resetData = () => {
    setClients(mockClients)
    setDrivers(mockDrivers)
    setSilos(mockSilos)
    setCerealTypes(mockCerealTypes)
    setCompanies(mockCompanies)
    setOperations(mockOperations)

    if (typeof window !== "undefined") {
      localStorage.removeItem("grain_operations")
    }
  }

  const contextValue: DataContextType = {
    clients,
    drivers,
    silos,
    cerealTypes,
    companies,
    operations,
    addClient,
    updateClient,
    deleteClient,
    addDriver,
    updateDriver,
    deleteDriver,
    addSilo,
    updateSilo,
    deleteSilo,
    addCerealType,
    updateCerealType,
    deleteCerealType,
    addCompany,
    updateCompany,
    deleteCompany,
    addOperation,
    updateOperation,
    deleteOperation,
    resetData,
    cereals: cerealTypes,
    addCereal: addCerealType,
    updateCereal: updateCerealType,
    deleteCereal: deleteCerealType,
    users: [],
    refreshData: function (): void {
      throw new Error("Function not implemented.")
    }
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
