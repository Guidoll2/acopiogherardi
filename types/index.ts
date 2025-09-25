export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
  role: "system_admin" | "admin" | "company_admin" | "supervisor" | "operator" | "garita"
  is_active: boolean
  company_id?: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  cuit: string
  status: "active" | "inactive"
  subscription_plan: "free" | "basic" | "enterprise"
  // Campos para control de suscripción
  operations_count_current_month: number
  operations_limit: number
  billing_cycle_start: string
  billing_cycle_end: string
  subscription_status: "active" | "suspended" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
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
  email: string
  transportista?: string
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
  is_active?: boolean
  status: "active" | "inactive" | "maintenance"
  created_at: string
  updated_at: string
}

export interface Cereal {
  id: string
  name: string
  code: string // Nuevo campo para código corto
  price_per_ton: number
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
  entry_time?: string
  exit_time?: string
  created_at: string // For frontend compatibility
  updated_at: string // For frontend compatibility
  createdAt: string
  amount?: number // For backward compatibility
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
  created_from_garita?: boolean
  
  // Legacy fields for backward compatibility
  type?: "entrada" | "salida"
  cereal_id?: string
  truck_plate?: string
  humidity?: number
  updatedAt?: Date
  description?: string
  weight_in?: number
  weight_out?: number
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

// Nuevos tipos para registro de empresas
export interface CompanyRegistrationRequest {
  id: string
  company_name: string
  email: string
  phone: string
  address: string
  cuit: string
  contact_person: string
  contact_phone: string
  status: "pending" | "approved" | "rejected"
  notes?: string
  created_at: string
  updated_at: string
  reviewed_by?: string
  reviewed_at?: string
}

// Tipo para reset de contraseña
export interface PasswordResetRequest {
  id: string
  email: string
  reset_code: string
  expires_at: string
  used: boolean
  created_at: string
}
