import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Silo from "@/app/mongoDB/models/silo"
import { verifyToken } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/silos/initialize-stocks ===")
    
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    // Buscar silos donde current_stock es null, undefined, o no existe
    const silosToFix = await Silo.find({
      $or: [
        { current_stock: { $exists: false } },
        { current_stock: null },
        { current_stock: { $type: "null" } }
      ]
    })

    console.log(`📦 Encontrados ${silosToFix.length} silos para inicializar`)

    let updatedCount = 0
    
    if (silosToFix.length > 0) {
      // Actualizar todos los silos para que tengan current_stock = 0
      const result = await Silo.updateMany(
        {
          $or: [
            { current_stock: { $exists: false } },
            { current_stock: null },
            { current_stock: { $type: "null" } }
          ]
        },
        {
          $set: { 
            current_stock: 0,
            updated_at: new Date().toISOString()
          }
        }
      )
      
      updatedCount = result.modifiedCount
      console.log(`✅ Actualizados ${updatedCount} silos con current_stock = 0`)
    }

    // Obtener todos los silos después de la corrección para verificar
    const allSilos = await Silo.find({}).sort({ name: 1 })
    
    console.log('📦 Estado final de todos los silos:')
    allSilos.forEach(silo => {
      console.log(`  - ${silo.name}: capacity=${silo.capacity}, current_stock=${silo.current_stock}`)
    })

    return NextResponse.json({ 
      success: true, 
      message: `Se inicializaron ${updatedCount} silos`,
      updatedCount,
      totalSilos: allSilos.length,
      silos: allSilos.map(silo => ({
        id: silo._id.toString(),
        name: silo.name,
        capacity: silo.capacity,
        current_stock: silo.current_stock
      }))
    })
    
  } catch (error) {
    console.error("Error inicializando stocks:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
