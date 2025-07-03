import type { User, Client, Driver, Silo, Cereal, Operation, AccountMovement } from "@/types"

// Empresas del sistema (para administrador del sistema)
export const companies = [
  {
    id: "1",
    name: "Acopio Central S.A.",
    email: "admin@acopio.com",
    phone: "+54 11 2345-6789",
    address: "Rosario, Santa Fe",
    cuit: "30-12345678-9",
    status: "active",
    subscription_plan: "premium",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Granos del Sur",
    email: "contacto@granossur.com",
    phone: "+54 11 3456-7890",
    address: "Córdoba, Córdoba",
    cuit: "30-87654321-0",
    status: "active",
    subscription_plan: "enterprise",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Cooperativa Agrícola",
    email: "info@coopagricola.com.ar",
    phone: "+54 11 4567-8901",
    address: "Mendoza, Mendoza",
    cuit: "30-11223344-5",
    status: "active",
    subscription_plan: "basic",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Usuarios del sistema
export const users: User[] = [
  {
    id: "1",
    email: "admin@sistema.com",
    full_name: "Administrador Sistema",
    phone: "+54 11 1234-5678",
    address: "Buenos Aires, Argentina",
    role: "system_admin",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "admin@acopio.com",
    full_name: "Juan Carlos Pérez",
    phone: "+54 11 2345-6789",
    address: "Rosario, Santa Fe",
    role: "admin",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "supervisor@acopio.com",
    full_name: "María González",
    phone: "+54 11 3456-7890",
    address: "Córdoba, Córdoba",
    role: "supervisor",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "operador@acopio.com",
    full_name: "Carlos Rodríguez",
    phone: "+54 11 4567-8901",
    address: "Mendoza, Mendoza",
    role: "operador",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    email: "garita@acopio.com",
    full_name: "Ana López",
    phone: "+54 11 5678-9012",
    address: "La Plata, Buenos Aires",
    role: "garita",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Credenciales demo para login
export const demoCredentials = [
  { email: "admin@sistema.com", password: "admin123", role: "system_admin" },
  { email: "admin@acopio.com", password: "admin123", role: "admin" },
  { email: "supervisor@acopio.com", password: "super123", role: "supervisor" },
  { email: "operador@acopio.com", password: "oper123", role: "operador" },
  { email: "garita@acopio.com", password: "garita123", role: "garita" },
]

// Clientes
export const clients: Client[] = [
  {
    id: "1",
    name: "Agropecuaria San Martín",
    email: "contacto@agrosanmartin.com",
    phone: "+54 11 1111-1111",
    address: "Ruta 9 Km 45, San Martín",
    cuit: "20-12345678-9",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Estancia La Esperanza",
    email: "info@laesperanza.com.ar",
    phone: "+54 11 2222-2222",
    address: "Camino Rural 123, Pergamino",
    cuit: "20-87654321-0",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Conductores
export const drivers: Driver[] = [
  {
    id: "1",
    name: "Roberto Fernández",
    license_number: "12345678",
    phone: "+54 11 9999-1111",
    license_expiry: "2025-12-31",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Miguel Torres",
    license_number: "87654321",
    phone: "+54 11 9999-2222",
    license_expiry: "2025-06-30",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Silos
export const silos: Silo[] = [
  {
    id: "1",
    name: "Silo A1",
    capacity: 1000,
    current_stock: 750,
    cereal_type: "Trigo",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Silo B2",
    capacity: 1500,
    current_stock: 200,
    cereal_type: "Maíz",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Cereales
export const cereals: Cereal[] = [
  {
    id: "1",
    name: "Trigo",
    variety: "Baguette 10",
    harvest_year: 2024,
    quality_grade: "A",
    price_per_ton: 250000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Maíz",
    variety: "DK 692",
    harvest_year: 2024,
    quality_grade: "A",
    price_per_ton: 200000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Operaciones
export const operations: Operation[] = [
  {
    id: "1",
    type: "entrada",
    client_id: "1",
    driver_id: "1",
    cereal_id: "1",
    silo_id: "1",
    truck_plate: "ABC123",
    gross_weight: 35000,
    tare_weight: 15000,
    net_weight: 20000,
    humidity: 12.5,
    impurities: 2.1,
    status: "completed",
    entry_time: "2024-01-15T08:30:00Z",
    exit_time: "2024-01-15T10:15:00Z",
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "2",
    type: "salida",
    client_id: "2",
    driver_id: "2",
    cereal_id: "2",
    silo_id: "2",
    truck_plate: "XYZ789",
    gross_weight: 32000,
    tare_weight: 14000,
    net_weight: 18000,
    humidity: 13.2,
    impurities: 1.8,
    status: "pendiente",
    entry_time: "2024-01-15T14:20:00Z",
    exit_time: null,
    createdAt: "2024-01-15T14:20:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
  },
]

// Movimientos de cuenta corriente
export const accountMovements: AccountMovement[] = [
  {
    id: "1",
    client_id: "1",
    operation_id: "1",
    cereal_id: "1",
    type: "entrada",
    quantity: 20.0, // 20 toneladas
    date: "2024-01-15T08:30:00Z",
    description: "Ingreso de Trigo - Operación #1",
    balance_after: 20.0,
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    client_id: "1",
    operation_id: null,
    cereal_id: "1",
    type: "salida",
    quantity: 5.0, // 5 toneladas
    date: "2024-01-16T10:00:00Z",
    description: "Retiro de Trigo - Venta directa",
    balance_after: 15.0,
    created_at: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    client_id: "2",
    operation_id: "2",
    cereal_id: "2",
    type: "entrada",
    quantity: 18.0, // 18 toneladas
    date: "2024-01-15T14:20:00Z",
    description: "Ingreso de Maíz - Operación #2",
    balance_after: 18.0,
    created_at: "2024-01-15T14:20:00Z",
  },
  {
    id: "4",
    client_id: "1",
    operation_id: null,
    cereal_id: "2",
    type: "entrada",
    quantity: 25.0, // 25 toneladas
    date: "2024-01-17T09:15:00Z",
    description: "Ingreso de Maíz - Entrega directa",
    balance_after: 25.0,
    created_at: "2024-01-17T09:15:00Z",
  },
  {
    id: "5",
    client_id: "1",
    operation_id: null,
    cereal_id: "2",
    type: "salida",
    quantity: 10.0, // 10 toneladas
    date: "2024-01-18T11:30:00Z",
    description: "Retiro de Maíz - Procesamiento",
    balance_after: 15.0,
    created_at: "2024-01-18T11:30:00Z",
  },
]
