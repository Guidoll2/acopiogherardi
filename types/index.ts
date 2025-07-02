export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  position?: string  
  name?: string  
  address: string
  created_at: string
  updated_at: string
  role: "system_admin" | "admin" | "company_admin" // <-- agrega esta línea
  is_active: boolean
  company_id?: string
}
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
  license_expiry: string
  created_at: string
  updated_at: string
}

export interface Silo {
  id: string
  name: string
  capacity: number
  current_stock: number
  cereal_type: string
  status: "active" | "inactive" | "maintenance"
  created_at: string
  updated_at: string
}

export interface Cereal {
  id: string
  name: string
  variety: string
  harvest_year: number
  quality_grade: string
  price_per_ton: number
  created_at: string
  updated_at: string
  }
export interface Operation {
  id: string
  operation_type: "ingreso" | "egreso"
  type: "entrada" | "salida"
  client_id: string
  driver_id: string
  cereal_id: string
  cereal_type_id?: string
  silo_id: string
  truck_plate: string
  gross_weight: number
  tare_weight: number
  net_weight: number
  humidity: number
  amount: number
  impurities: number
  status:
    | "pendiente"
    | "autorizar_acceso"
    | "balanza_ingreso"
    | "en_carga_descarga"
    | "balanza_egreso"
    | "autorizar_egreso"
    | "completado"
  entry_time: string
  exit_time: string | null
  createdAt: Date
  updatedAt?: Date

  // Campos adicionales para compatibilidad con actions.ts
  description?: string
  scheduled_date?: string
  estimated_duration?: number
  company_id?: string
  weight_in?: number
  weight_out?: number
  moisture?: number
  test_weight?: number
  observations?: string
}


// Nuevos tipos para cuenta corriente
export interface AccountMovement {
  id: string
  client_id: string
  operation_id: string
  cereal_id: string
  type: "entrada" | "salida"
  quantity: number // toneladas
  date: string
  description: string
  balance_after: number
  created_at: string
}

export interface ClientBalance {
  client_id: string
  cereal_id: string
  cereal_name: string
  total_entries: number // total entradas en toneladas
  total_exits: number // total salidas en toneladas
  current_balance: number // saldo actual en toneladas
  last_movement: string
}
