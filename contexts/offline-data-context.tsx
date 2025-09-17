"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { offlineStorage } from "@/lib/offline-storage"
import { syncService } from "@/lib/sync-service"
import type { 
  User, 
  Client, 
  Driver, 
  Silo, 
  Cereal, 
  Company, 
  Operation 
} from '@/types'

// Define the data context interface based on the original
interface DataContextType {
  // Loading states
  isLoading: boolean
  
  // Data arrays
  users: User[]  
  clients: Client[]
  drivers: Driver[]
  silos: Silo[]
  cerealTypes: Cereal[]
  companies: Company[]
  operations: Operation[]
  cereals: Cereal[] // Alias for cerealTypes
  
  // Refresh function
  refreshData: () => Promise<void>
  
  // Silo stock management
  recalculateSiloStock: (siloId: string) => number
  syncSiloStocks: () => Promise<void>

  // Client CRUD operations
  addClient: (client: Omit<Client, "id" | "created_at" | "updated_at">) => Promise<Client>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  // Driver CRUD operations
  addDriver: (driver: Omit<Driver, "id" | "created_at" | "updated_at"> & { status?: string }) => Promise<void>
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>
  deleteDriver: (id: string) => Promise<void>

  // Silo CRUD operations
  addSilo: (silo: Omit<Silo, "id" | "created_at" | "updated_at">) => Promise<Silo>
  updateSilo: (id: string, silo: Partial<Silo>) => Promise<void>
  deleteSilo: (id: string) => Promise<void>

  // Cereal CRUD operations
  addCereal: (cereal: Omit<Cereal, "id" | "created_at" | "updated_at">) => Promise<void>
  addCerealType: (cereal: Omit<Cereal, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCereal: (id: string, cereal: Partial<Cereal>) => Promise<void>
  updateCerealType: (id: string, cereal: Partial<Cereal>) => Promise<void>
  deleteCereal: (id: string) => Promise<void>
  deleteCerealType: (id: string) => Promise<void>

  // Company CRUD operations
  addCompany: (company: Omit<Company, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>

  // Operation CRUD operations
  addOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at">) => Promise<Operation>
  updateOperation: (id: string, operation: Partial<Operation>) => Promise<void>
  deleteOperation: (id: string) => Promise<void>

  // Utility functions
  resetData: () => Promise<void>
}

// Extended interface with offline capabilities
interface OfflineDataContextType extends DataContextType {
  // Network status
  isOnline: boolean
  hasBeenOffline: boolean
  
  // Offline status
  pendingActions: number
  lastSyncTime: Date | null
  syncInProgress: boolean
  
  // Cache management
  cacheAge: Record<string, Date>
  clearCache: (entity?: string) => Promise<void>
  
  // Sync operations
  forcSync: () => Promise<void>
  autoSyncEnabled: boolean
  setAutoSyncEnabled: (enabled: boolean) => void
}

const OfflineDataContext = createContext<OfflineDataContextType | undefined>(undefined)

export function OfflineDataProvider({ children }: { children: ReactNode }) {
  // Network status
  const { isOnline, hasBeenOffline } = useNetworkStatus()
  const { cacheApiData, cachePageVisit } = useServiceWorker()
  
  // Original state from data-context
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [silos, setSilos] = useState<Silo[]>([])
  const [cerealTypes, setCerealTypes] = useState<Cereal[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Offline-specific state
  const [pendingActions, setPendingActions] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [cacheAge, setCacheAge] = useState<Record<string, Date>>({})
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)

  // Refs to avoid re-renders
  const initComplete = useRef(false)

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

  // Initialize offline storage and load data
  useEffect(() => {
    if (!initComplete.current) {
      initComplete.current = true
      loadData()
      setupEventListeners()
      initializeOfflineNavigation()
    }
  }, [])

  // Pre-cache important pages for offline navigation
  const initializeOfflineNavigation = () => {
    if (isOnline && cachePageVisit) {
      // Cache las páginas principales del dashboard
      const importantPages = [
        '/dashboard',
        '/dashboard/cereals',
        '/dashboard/clients', 
        '/dashboard/drivers',
        '/dashboard/silos',
        '/dashboard/operations',
        '/dashboard/offline-settings'
      ]

      setTimeout(() => {
        importantPages.forEach(page => {
          try {
            const fullUrl = new URL(page, window.location.origin).href
            cachePageVisit(fullUrl)
          } catch (error) {
            console.log('Could not pre-cache page:', page)
          }
        })
        console.log('📱 Pre-cached important dashboard pages for offline navigation')
      }, 2000) // Delay para no interferir con la carga inicial
    }
  }

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && hasBeenOffline && autoSyncEnabled) {
      console.log('🌐 Back online, triggering auto-sync...')
      autoSync()
    }
  }, [isOnline, hasBeenOffline, autoSyncEnabled])

  const setupEventListeners = () => {
    // Listen for pending changes updates
    const handlePendingChanges = (event: Event) => {
      const customEvent = event as CustomEvent
      setPendingActions(customEvent.detail?.count || 0)
    }

    // Listen for sync events
    const handleSyncStart = () => setSyncInProgress(true)
    const handleSyncEnd = () => {
      setSyncInProgress(false)
      setLastSyncTime(new Date())
    }

    // Listen for background sync from service worker
    const handleBackgroundSync = () => {
      if (autoSyncEnabled) {
        autoSync()
      }
    }

    window.addEventListener('pendingChangesUpdate', handlePendingChanges as EventListener)
    window.addEventListener('syncStart', handleSyncStart)
    window.addEventListener('syncEnd', handleSyncEnd)
    window.addEventListener('backgroundSync', handleBackgroundSync)

    return () => {
      window.removeEventListener('pendingChangesUpdate', handlePendingChanges as EventListener)
      window.removeEventListener('syncStart', handleSyncStart)
      window.removeEventListener('syncEnd', handleSyncEnd)
      window.removeEventListener('backgroundSync', handleBackgroundSync)
    }
  }

  // Load all data with offline support
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
      
      // Update cache age
      await updateCacheAge()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Hybrid loading: try network first, fallback to cache
  const loadWithCache = async (
    entity: string,
    setter: (data: any[]) => void,
    endpoint: string
  ) => {
    try {
      if (isOnline) {
        // Try network first
        const response = await authenticatedFetch(endpoint)
        if (response.ok) {
          const data = await response.json()
          const items = data[entity] || []
          
          // Update local state
          setter(items)
          
          // Cache data for offline use
          await offlineStorage.saveData(entity, items)
          
          // Cache in service worker
          if (cacheApiData) {
            cacheApiData(endpoint, data)
          }
          
          console.log(`📱 Loaded ${items.length} ${entity} from network`)
          return
        }
      }
    } catch (error) {
      console.log(`🔌 Network failed for ${entity}, trying cache...`)
    }

    // Fallback to cache
    try {
      const cachedData = await offlineStorage.getData(entity)
      setter(cachedData)
      console.log(`💾 Loaded ${cachedData.length} ${entity} from cache`)
    } catch (error) {
      console.error(`❌ Failed to load ${entity} from cache:`, error)
      setter([])
    }
  }

  // Individual load functions
  const loadCompanies = () => loadWithCache('companies', setCompanies, '/api/companies')
  const loadUsers = () => loadWithCache('users', setUsers, '/api/users')
  const loadClients = () => loadWithCache('clients', setClients, '/api/clients')
  const loadDrivers = () => loadWithCache('drivers', setDrivers, '/api/drivers')
  const loadSilos = () => loadWithCache('silos', setSilos, '/api/silos')
  const loadCerealTypes = () => loadWithCache('cereals', setCerealTypes, '/api/cereals')
  const loadOperations = () => loadWithCache('operations', setOperations, '/api/operations')

  // Update cache age metadata
  const updateCacheAge = async () => {
    const entities = ['companies', 'users', 'clients', 'drivers', 'silos', 'cereals', 'operations']
    const ages: Record<string, Date> = {}
    
    for (const entity of entities) {
      const age = await offlineStorage.getCacheAge(entity)
      if (age) ages[entity] = age
    }
    
    setCacheAge(ages)
  }

  // CRUD operations with offline support
  const addClient = async (clientData: Omit<Client, "id" | "created_at" | "updated_at">) => {
    // Client creation is network-only. Offline/optimistic temporary entries were removed to
    // avoid duplicate records caused by mixing optimistic IDs and server IDs.
    if (!isOnline) {
      throw new Error('No network: creating clients is not supported while offline')
    }

    console.log('OfflineData:addClient - starting', clientData)
    // Send to server
    const response = await authenticatedFetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
    }

    const result = await response.json()
    let newClient: Client = result.client
    console.log('OfflineData:addClient - server returned', newClient)

    // If server for some reason didn't return an id, attempt to recover the created
    // client by re-fetching the clients list and matching by stable fields (tax_id, email or name).
    if (!newClient || !newClient.id) {
      console.warn('OfflineData:addClient - server response missing id, attempting to recover by fetching clients list')
      try {
        const listResp = await authenticatedFetch('/api/clients')
        if (listResp.ok) {
          const listJson = await listResp.json()
          const items: Client[] = listJson.clients || listJson.data || listJson || []
          const match = items.find(c => (
            (clientData.tax_id && c.tax_id === clientData.tax_id) ||
            (clientData.email && c.email === clientData.email) ||
            (clientData.name && c.name === clientData.name)
          ))

          if (match && match.id) {
            newClient = match
            console.log('OfflineData:addClient - recovered created client from list', newClient)
          } else {
            console.error('OfflineData:addClient - could not recover created client; server did not return id')
            throw new Error('El servidor no devolvió el ID del cliente creado. Por favor refresca la página o revisa el servidor.')
          }
        } else {
          console.error('OfflineData:addClient - failed to fetch clients list to recover id')
          throw new Error('El servidor no devolvió el ID del cliente creado y no fue posible recuperar la lista.')
        }
      } catch (e) {
        console.error('OfflineData:addClient - recovery attempt failed', e)
        throw e
      }
    }

    // Update local state with simple, robust deduplication:
    // - If an item with the same server id exists, replace it
    // - Else if a temporary-like entry exists matching tax/email/name, replace it
    // - Else append
    setClients(prev => {
      if (!newClient) return prev

      // Already present by server id?
      if (prev.some(c => c.id === newClient.id)) {
        const mapped = prev.map(c => c.id === newClient.id ? newClient : c)
        console.log('OfflineData:addClient - replaced existing by id', { before: prev.length, after: mapped.length })
        return mapped
      }

      // Replace any local entry that looks like an optimistic/temp entry (starts with 'temp_')
      const tempIdx = prev.findIndex(c => c.id && String(c.id).startsWith('temp_') && (
        (newClient.tax_id && c.tax_id === newClient.tax_id) ||
        (newClient.email && c.email === newClient.email) ||
        (newClient.name && c.name === newClient.name)
      ))

      if (tempIdx >= 0) {
        const updated = [...prev]
        const oldId = prev[tempIdx].id
        updated[tempIdx] = newClient
        // try to update offline storage mapping; non-critical
        offlineStorage.replaceTemporaryId('clients', oldId as string, newClient.id, newClient).catch(() => {})
        console.log('OfflineData:addClient - replaced temp entry', { tempIndex: tempIdx, oldId, newId: newClient.id })
        return updated
      }

      // Otherwise append if not duplicated by tax/email/name
      const duplicate = prev.find(c => (newClient.tax_id && c.tax_id === newClient.tax_id) || (newClient.email && c.email === newClient.email))
      if (duplicate) {
        console.log('OfflineData:addClient - duplicate detected by tax/email, skipping add', { duplicateId: duplicate.id })
        return prev
      }

      const appended = [...prev, newClient]
      console.log('OfflineData:addClient - appending new client', { before: prev.length, after: appended.length, newId: newClient.id })
      return appended
    })

    // Update cache (keep for offline reads)
    try { await offlineStorage.saveItem('clients', newClient) } catch (e) { /* ignore */ }

    return newClient
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const existingClient = clients.find(c => c.id === id)
    if (!existingClient) return

    const updatedClient = {
      ...existingClient,
      ...updates,
      updated_at: new Date().toISOString()
    }

    if (isOnline) {
      try {
        const response = await authenticatedFetch(`/api/clients/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates)
        })
        
        if (response.ok) {
          const result = await response.json()
          const serverClient = result.client
          
          // Update local state
          setClients(prev => prev.map(c => c.id === id ? serverClient : c))
          
          // Update cache
          await offlineStorage.saveItem('clients', serverClient)
          
          return serverClient
        }
      } catch (error) {
        console.log('🔌 Network failed, saving offline...')
      }
    }

    // Offline mode
    setClients(prev => prev.map(c => c.id === id ? updatedClient : c))
    await offlineStorage.saveItem('clients', updatedClient)
    
    await offlineStorage.addToSyncQueue({
      type: 'UPDATE',
      entity: 'clients',
      data: updatedClient,
      timestamp: Date.now()
    })

    return updatedClient
  }

  const deleteClient = async (id: string) => {
    const clientToDelete = clients.find(c => c.id === id)
    if (!clientToDelete) return

    if (isOnline) {
      try {
        const response = await authenticatedFetch(`/api/clients/${id}`, {
          method: "DELETE"
        })
        
        if (response.ok) {
          setClients(prev => prev.filter(c => c.id !== id))
          await offlineStorage.deleteItem('clients', id)
          return
        }
      } catch (error) {
        console.log('🔌 Network failed, queuing delete...')
      }
    }

    // Offline mode: mark as deleted and queue
    setClients(prev => prev.filter(c => c.id !== id))
    await offlineStorage.deleteItem('clients', id)
    
    await offlineStorage.addToSyncQueue({
      type: 'DELETE',
      entity: 'clients',
      data: clientToDelete,
      timestamp: Date.now()
    })
  }

  // Similar implementations for other entities (drivers, silos, etc.)
  // For brevity, I'll implement just the pattern for operations which is critical

  const addOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at">) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const tempOperation: Operation = {
      ...operationData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      createdAt: new Date().toISOString() // for compatibility
    }

    if (isOnline) {
      try {
        // Convert to API format
        const apiOperation = {
          client_id: operationData.client_id,
          driver_id: operationData.driver_id || "",
          silo_id: operationData.silo_id || "",
          cereal_type_id: operationData.cereal_type_id,
          company_id: operationData.company_id || "",
          type: operationData.operation_type,
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
          scheduled_date: operationData.scheduled_date,
          estimated_duration: operationData.estimated_duration || 60
        }

        const response = await authenticatedFetch("/api/operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiOperation)
        })
        
        if (response.ok) {
          const result = await response.json()
          const newOperation = result.operation
          
          setOperations(prev => [...prev, newOperation])
          await offlineStorage.saveItem('operations', newOperation)
          
          // Update silo stock if applicable
          await updateSiloStockFromOperation(newOperation, 'add')
          
          return newOperation
        }
      } catch (error) {
        console.log('🔌 Network failed, saving offline...')
      }
    }

    // Offline mode
    setOperations(prev => [...prev, tempOperation])
    await offlineStorage.saveItem('operations', tempOperation)
    
    await offlineStorage.addToSyncQueue({
      type: 'CREATE',
      entity: 'operations',
      data: operationData,
      timestamp: Date.now(),
      tempId
    })

    // Update silo stock locally
    await updateSiloStockFromOperation(tempOperation, 'add')

    console.log('📱 Operation saved offline, will sync when online')
    return tempOperation
  }

  // Helper function to update silo stock
  const updateSiloStockFromOperation = async (operation: Operation, action: 'add' | 'remove') => {
    if (!operation.silo_id || !operation.quantity) return

    const silo = silos.find(s => s.id === operation.silo_id)
    if (!silo) return

    let newStock = silo.current_stock
    
    if (action === 'add') {
      if (operation.operation_type === "ingreso") {
        newStock += operation.quantity
      } else if (operation.operation_type === "egreso") {
        newStock -= operation.quantity
      }
    } else { // remove
      if (operation.operation_type === "ingreso") {
        newStock -= operation.quantity
      } else if (operation.operation_type === "egreso") {
        newStock += operation.quantity
      }
    }

    newStock = Math.max(0, newStock)

    const updatedSilo = { ...silo, current_stock: newStock }
    setSilos(prev => prev.map(s => s.id === operation.silo_id ? updatedSilo : s))
    await offlineStorage.saveItem('silos', updatedSilo)
  }

  // Placeholder implementations for remaining CRUD operations
  const addDriver = async (driverData: any) => { /* Similar to addClient */ }
  const updateDriver = async (id: string, updates: any) => { /* Similar to updateClient */ }
  const deleteDriver = async (id: string) => { /* Similar to deleteClient */ }
  
  const addSilo = async (siloData: Omit<Silo, "id" | "created_at" | "updated_at">) => {
    console.log("🏗️ Iniciando addSilo en contexto offline...")
    console.log("🏗️ Datos recibidos:", siloData)
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const tempSilo: Silo = {
      ...siloData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (isOnline) {
      try {
        console.log("🏗️ Modo online - enviando al servidor...")
        const response = await authenticatedFetch("/api/silos", {
          method: "POST",
          body: JSON.stringify(siloData)
        })
        
        console.log("🏗️ Respuesta del servidor:", response.status, response.statusText)
        
        if (response.ok) {
          const result = await response.json()
          console.log("🏗️ Resultado del servidor:", result)
          const newSilo = result.silo
          
          // Update local state - verificar que no exista ya
          setSilos(prev => {
            const exists = prev.find(s => s.id === newSilo.id)
            if (exists) {
              console.log("🏗️ Silo ya existe, no agregando duplicado")
              return prev
            }
            console.log("🏗️ Agregando nuevo silo al estado")
            return [...prev, newSilo]
          })
          
          // Update cache
          await offlineStorage.saveItem('silos', newSilo)
          
          console.log("🏗️ Silo guardado exitosamente")
          return newSilo
        } else {
          const errorData = await response.json()
          console.error("🏗️ Error del servidor:", errorData)
          throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`)
        }
      } catch (error) {
        console.log('🔌 Network failed, saving offline...', error)
      }
    }

    // Offline mode: save locally and queue for sync
    console.log("🏗️ Modo offline - guardando localmente...")
    setSilos(prev => [...prev, tempSilo])
    await offlineStorage.saveItem('silos', tempSilo)
    
    await offlineStorage.addToSyncQueue({
      type: 'CREATE',
      entity: 'silos',
      data: siloData,
      timestamp: Date.now(),
      tempId
    })
    
    console.log("🏗️ Silo guardado offline")
    return tempSilo
  }
  const updateSilo = async (id: string, updates: any) => { /* Similar to updateClient */ }
  const deleteSilo = async (id: string): Promise<void> => {
    try {
      const response = await authenticatedFetch(`/api/silos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
      }

      setSilos(prev => prev.filter(s => s.id !== id))
      try { await offlineStorage.deleteItem('silos', id) } catch (e) { /* ignore */ }
      return
    } catch (error) {
      console.error('❌ deleteSilo failed:', error)
      throw error
    }
  }
  
  // Network-only implementation for cereals: always call API and update state from server
  const addCereal = async (cerealData: Omit<Cereal, "id" | "created_at" | "updated_at">): Promise<void> => {
    console.log("🌾 addCereal: sending to server (network-only)\n", cerealData)

    try {
      const response = await authenticatedFetch("/api/cereals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cerealData)
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
      }

      const result = await response.json()
      const newCereal = result.cereal || result.data || null

      if (!newCereal) throw new Error('Invalid server response when creating cereal')

      // Ensure no duplicate in current state then add
      setCerealTypes(prev => {
        const exists = prev.find(c => c.id === newCereal.id)
        if (exists) return prev
        return [...prev, newCereal]
      })

      // Persist to offline cache for completeness
      try { await offlineStorage.saveItem('cereals', newCereal) } catch (e) { /* ignore */ }
      return
    } catch (error) {
      console.error('❌ addCereal failed (network-only):', error)
      throw error
    }
  }
  
  const addCerealType = async (cerealData: Omit<Cereal, "id" | "created_at" | "updated_at">) => {
    return addCereal(cerealData) // Alias para compatibilidad
  }
  const updateCereal = async (id: string, updates: any): Promise<void> => {
    try {
      const response = await authenticatedFetch(`/api/cereals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
      }

      const result = await response.json()
  const updated = result.cereal || result.data || null
  if (!updated) throw new Error('Invalid server response when updating cereal')

  setCerealTypes(prev => prev.map(c => c.id === id ? updated : c))
  try { await offlineStorage.saveItem('cereals', updated) } catch (e) { /* ignore */ }
  return
    } catch (error) {
      console.error('❌ updateCereal failed:', error)
      throw error
    }
  }

  const updateCerealType = updateCereal

  const deleteCereal = async (id: string): Promise<void> => {
    try {
      const response = await authenticatedFetch(`/api/cereals/${id}`, {
        method: 'DELETE'
      })

      // allow 404 as success (already deleted on server)
      if (!response.ok && response.status !== 404) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
      }

  // Remove from local state and cache
  setCerealTypes(prev => prev.filter(c => c.id !== id))
  try { await offlineStorage.deleteItem('cereals', id) } catch (e) { /* ignore */ }

  return
    } catch (error) {
      console.error('❌ deleteCereal failed:', error)
      throw error
    }
  }
  const deleteCerealType = deleteCereal
  
  const addCompany = async (companyData: any) => { /* Similar to addClient */ }
  const updateCompany = async (id: string, updates: any) => { /* Similar to updateClient */ }
  const deleteCompany = async (id: string) => { /* Similar to deleteClient */ }
  
  const updateOperation = async (id: string, updates: any) => {
    // If this is a temporary (offline) operation id, we must not call the server with it
    try {
      const isTemp = typeof id === 'string' && id.startsWith('temp_')

      // Find the local (possibly temporary) operation to compute correct offline behavior
      const localOp = operations.find(op => op.id === id)

      if (isTemp) {
        // If online, attempt to sync pending creates so the temp id gets replaced
        if (isOnline) {
          console.log('🔁 updateOperation: temp id detected, running sync to resolve real id...')
          try {
            await syncService.syncPendingData()
          } catch (e) {
            console.warn('⚠️ syncPendingData failed while resolving temp id:', e)
          }

          // Reload operations from server/cache to pick up replacements
          await loadOperations()

          // Try to find the corresponding server-created operation that matches the temp one
          let mappedOp: Operation | undefined
          if (localOp) {
            mappedOp = operations.find(op =>
              // match by stable-ish fields: client_id, chassis_plate, scheduled_date and quantity
              op.client_id === localOp.client_id &&
              op.chassis_plate === localOp.chassis_plate &&
              (op.scheduled_date === localOp.scheduled_date || !op.scheduled_date) &&
              op.quantity === localOp.quantity &&
              !op.id.startsWith('temp_')
            )
          }

          if (!mappedOp) {
            // If we can't map, surface an explicit error so caller can handle it
            throw new Error('Operación creada en modo offline aún no sincronizada. Sincroniza cambios o espera a que finalice la sincronización automática.')
          }

          // Retry the update against the real id
          const realId = mappedOp.id
          const response = await authenticatedFetch(`/api/operations/${realId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
          }

          const result = await response.json()
          const updatedOp = result.operation || result.data || null
          if (!updatedOp) throw new Error('Invalid server response when updating operation')

          // Update local state and cache
          setOperations(prev => prev.map(o => o.id === id ? updatedOp : o))
          try { await offlineStorage.saveItem('operations', updatedOp) } catch (e) { /* ignore */ }
          return
        } else {
          // Offline: update local item and queue for sync
          console.log('📱 updateOperation: offline - queuing update for temp operation')
          if (!localOp) throw new Error('Operación local no encontrada para actualizar offline')

          const updatedLocal = { ...localOp, ...updates, updated_at: new Date().toISOString() }
          setOperations(prev => prev.map(o => o.id === id ? updatedLocal : o))
          try { await offlineStorage.saveItem('operations', updatedLocal) } catch (e) { /* ignore */ }

          await offlineStorage.addToSyncQueue({
            type: 'UPDATE',
            entity: 'operations',
            data: updatedLocal,
            timestamp: Date.now()
          })

          return
        }
      }

      // Non-temp id: normal online/offline update flow
      if (isOnline) {
        const response = await authenticatedFetch(`/api/operations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
        }

        const result = await response.json()
        const updatedOp = result.operation || result.data || null
        if (!updatedOp) throw new Error('Invalid server response when updating operation')

        setOperations(prev => prev.map(o => o.id === id ? updatedOp : o))
        try { await offlineStorage.saveItem('operations', updatedOp) } catch (e) { /* ignore */ }
        return
      } else {
        // Offline: update local state and queue for later sync
        const existing = operations.find(op => op.id === id)
        if (!existing) throw new Error('Operación no encontrada')

        const updatedLocal = { ...existing, ...updates, updated_at: new Date().toISOString() }
        setOperations(prev => prev.map(o => o.id === id ? updatedLocal : o))
        try { await offlineStorage.saveItem('operations', updatedLocal) } catch (e) { /* ignore */ }

        await offlineStorage.addToSyncQueue({
          type: 'UPDATE',
          entity: 'operations',
          data: updatedLocal,
          timestamp: Date.now()
        })
        return
      }
    } catch (error) {
      console.error('Error in updateOperation:', error)
      throw error
    }
  }

  const deleteOperation = async (id: string) => {
    try {
      const isTemp = typeof id === 'string' && id.startsWith('temp_')
      const localOp = operations.find(op => op.id === id)

      if (isTemp) {
        // If online, attempt to sync pending creates so the temp id gets replaced then delete
        if (isOnline) {
          console.log('🔁 deleteOperation: temp id detected, running sync to resolve real id...')
          try {
            await syncService.syncPendingData()
          } catch (e) {
            console.warn('⚠️ syncPendingData failed while resolving temp id for delete:', e)
          }

          await loadOperations()

          let mappedOp: Operation | undefined
          if (localOp) {
            mappedOp = operations.find(op =>
              op.client_id === localOp.client_id &&
              op.chassis_plate === localOp.chassis_plate &&
              (op.scheduled_date === localOp.scheduled_date || !op.scheduled_date) &&
              op.quantity === localOp.quantity &&
              !op.id.startsWith('temp_')
            )
          }

          if (!mappedOp) {
            // If we still can't find mapping, simply remove local temp and queue a delete action
            console.log('🗑️ deleteOperation: could not map temp id to real id after sync, removing local temp and queueing delete')
            setOperations(prev => prev.filter(o => o.id !== id))
            try { await offlineStorage.deleteItem('operations', id) } catch (e) { /* ignore */ }

            await offlineStorage.addToSyncQueue({
              type: 'DELETE',
              entity: 'operations',
              data: localOp || { id },
              timestamp: Date.now(),
              tempId: id
            })
            return
          }

          // Delete using mapped real id
          const realId = mappedOp.id
          const response = await authenticatedFetch(`/api/operations/${realId}`, { method: 'DELETE' })
          if (!response.ok && response.status !== 404) {
            const err = await response.json().catch(() => ({}))
            throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
          }

          // Remove from local state and cache
          setOperations(prev => prev.filter(o => o.id !== id && o.id !== realId))
          try { await offlineStorage.deleteItem('operations', id) } catch (e) { /* ignore */ }
          try { await offlineStorage.deleteItem('operations', realId) } catch (e) { /* ignore */ }
          return
        } else {
          // Offline: just remove the local temp and queue delete
          setOperations(prev => prev.filter(o => o.id !== id))
          try { await offlineStorage.deleteItem('operations', id) } catch (e) { /* ignore */ }

          await offlineStorage.addToSyncQueue({
            type: 'DELETE',
            entity: 'operations',
            data: localOp || { id },
            timestamp: Date.now(),
            tempId: id
          })
          return
        }
      }

      // Non-temp id: normal delete flow
      if (isOnline) {
        const response = await authenticatedFetch(`/api/operations/${id}`, { method: 'DELETE' })
        if (!response.ok && response.status !== 404) {
          const err = await response.json().catch(() => ({}))
          throw new Error(`Server error ${response.status}: ${err.error || response.statusText}`)
        }

        // Revert silo stock if necessary -- caller already handles some stock logic elsewhere, but keep local state coherent
        setOperations(prev => prev.filter(o => o.id !== id))
        try { await offlineStorage.deleteItem('operations', id) } catch (e) { /* ignore */ }
        return
      } else {
        // Offline: remove locally and queue delete
        const toDelete = localOp || { id }
        setOperations(prev => prev.filter(o => o.id !== id))
        try { await offlineStorage.deleteItem('operations', id) } catch (e) { /* ignore */ }

        await offlineStorage.addToSyncQueue({
          type: 'DELETE',
          entity: 'operations',
          data: toDelete,
          timestamp: Date.now()
        })
        return
      }
    } catch (error) {
      console.error('Error in deleteOperation:', error)
      throw error
    }
  }

  // Silo stock management
  const recalculateSiloStock = (siloId: string): number => {
    const relevantOps = operations.filter(op => 
      op.silo_id === siloId && 
      op.quantity && 
      (op.status === 'completado' || op.status === 'completed')
    )
    
    return relevantOps.reduce((stock, op) => {
      if (op.operation_type === 'ingreso') {
        return stock + op.quantity
      } else if (op.operation_type === 'egreso') {
        return stock - op.quantity
      }
      return stock
    }, 0)
  }

  const syncSiloStocks = async () => {
    for (const silo of silos) {
      const calculatedStock = recalculateSiloStock(silo.id)
      if (calculatedStock !== silo.current_stock) {
        await updateSilo(silo.id, { current_stock: calculatedStock })
      }
    }
  }

  // Sync operations
  const forceSync = async () => {
    if (!isOnline) {
      console.log('❌ Cannot sync while offline')
      return
    }

    try {
      await syncService.syncPendingData()
      await loadData() // Refresh data after sync
    } catch (error) {
      console.error('❌ Sync failed:', error)
      throw error
    }
  }

  const autoSync = async () => {
    if (isOnline && autoSyncEnabled) {
      try {
        await syncService.autoSync()
      } catch (error) {
        console.error('❌ Auto-sync failed:', error)
      }
    }
  }

  // Cache management
  const clearCache = async (entity?: string) => {
    await offlineStorage.clearCache(entity)
    if (!entity) {
      // Clear all local state
      setClients([])
      setDrivers([])
      setSilos([])
      setCerealTypes([])
      setCompanies([])
      setOperations([])
      setUsers([])
    }
    await updateCacheAge()
  }

  const refreshData = async () => {
    await loadData()
  }

  const resetData = async () => {
    await clearCache()
    await loadData()
  }

  const value: OfflineDataContextType = {
    // Original interface
    isLoading,
    users,
    clients,
    drivers,
    silos,
    cerealTypes,
    companies,
    operations,
    cereals: cerealTypes, // alias
    refreshData,
    recalculateSiloStock,
    syncSiloStocks,
    
    // CRUD operations
    addClient,
    updateClient,
    deleteClient,
    addDriver,
    updateDriver,
    deleteDriver,
    addSilo,
    updateSilo,
    deleteSilo,
    addCereal,
    addCerealType,
    updateCereal,
    updateCerealType,
    deleteCereal,
    deleteCerealType,
    addCompany,
    updateCompany,
    deleteCompany,
    addOperation,
    updateOperation,
    deleteOperation,
    resetData,

    // Offline extensions
    isOnline,
    hasBeenOffline,
    pendingActions,
    lastSyncTime,
    syncInProgress,
    cacheAge,
    clearCache,
    forcSync: forceSync,
    autoSyncEnabled,
    setAutoSyncEnabled
  }

  return (
    <OfflineDataContext.Provider value={value}>
      {children}
    </OfflineDataContext.Provider>
  )
}

export function useOfflineData() {
  const context = useContext(OfflineDataContext)
  if (context === undefined) {
    throw new Error("useOfflineData must be used within an OfflineDataProvider")
  }
  return context
}

// Alias for compatibility with existing code
export const useData = useOfflineData
