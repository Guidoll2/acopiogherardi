import connectDB from "../app/mongoDB/db"
import Operation from "../app/mongoDB/models/operation"

async function cleanupOperations() {
  try {
    await connectDB()
    
    console.log("🧹 Limpiando operaciones con datos incorrectos...")
    
    // Eliminar todas las operaciones existentes para empezar limpio
    const result = await Operation.deleteMany({})
    
    console.log(`✅ Eliminadas ${result.deletedCount} operaciones`)
    console.log("🎯 Base de datos lista para nuevas operaciones")
    
  } catch (error) {
    console.error("❌ Error limpiando operaciones:", error)
  } finally {
    process.exit(0)
  }
}

cleanupOperations()
