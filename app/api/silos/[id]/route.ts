import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Silo from "@/app/mongoDB/models/silo"
import { verifyToken } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG PUT /api/silos/[id] ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const siloData = await request.json()
    siloData.updated_at = new Date().toISOString()

    const updatedSilo = await Silo.findByIdAndUpdate(
      params.id,
      siloData,
      { new: true }
    )

    if (!updatedSilo) {
      return NextResponse.json({ error: "Silo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      silo: updatedSilo,
      message: "Silo actualizado exitosamente"
    })
  } catch (error) {
    console.error("Error actualizando silo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG DELETE /api/silos/[id] ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const deletedSilo = await Silo.findByIdAndDelete(params.id)

    if (!deletedSilo) {
      return NextResponse.json({ error: "Silo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Silo eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error eliminando silo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
