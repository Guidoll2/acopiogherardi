// Servicio para manejar todas las operaciones de datos con la API
export class DataService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers: defaultHeaders,
      credentials: "include", // Para incluir cookies
    })
  }

  // Operaciones
  static async getOperations() {
    try {
      const response = await this.fetchWithAuth("/api/operations")
      const data = await response.json()
      return data.success ? data.operations : []
    } catch (error) {
      console.error("Error obteniendo operaciones:", error)
      return []
    }
  }

  static async createOperation(operationData: any) {
    try {
      const response = await this.fetchWithAuth("/api/operations", {
        method: "POST",
        body: JSON.stringify(operationData),
      })
      return await response.json()
    } catch (error) {
      console.error("Error creando operación:", error)
      return { success: false, error: "Error de conexión" }
    }
  }

  // Clientes
  static async getClients() {
    try {
      const response = await this.fetchWithAuth("/api/clients")
      const data = await response.json()
      return data.success ? data.clients : []
    } catch (error) {
      console.error("Error obteniendo clientes:", error)
      return []
    }
  }

  static async createClient(clientData: any) {
    try {
      const response = await this.fetchWithAuth("/api/clients", {
        method: "POST",
        body: JSON.stringify(clientData),
      })
      return await response.json()
    } catch (error) {
      console.error("Error creando cliente:", error)
      return { success: false, error: "Error de conexión" }
    }
  }

  // Conductores
  static async getDrivers() {
    try {
      const response = await this.fetchWithAuth("/api/drivers")
      const data = await response.json()
      return data.success ? data.drivers : []
    } catch (error) {
      console.error("Error obteniendo conductores:", error)
      return []
    }
  }

  // Silos
  static async getSilos() {
    try {
      const response = await this.fetchWithAuth("/api/silos")
      const data = await response.json()
      return data.success ? data.silos : []
    } catch (error) {
      console.error("Error obteniendo silos:", error)
      return []
    }
  }

  // Cereales
  static async getCereals() {
    try {
      const response = await this.fetchWithAuth("/api/cereals")
      const data = await response.json()
      return data.success ? data.cereals : []
    } catch (error) {
      console.error("Error obteniendo cereales:", error)
      return []
    }
  }
}
