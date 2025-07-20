import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Cereal from "@/app/mongoDB/models/cereal"
import { verifyToken } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG PUT /api/cereals/[id] ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const cerealData = await request.json()
    cerealData.updated_at = new Date().toISOString()

    const updatedCereal = await Cereal.findByIdAndUpdate(
      params.id,
      cerealData,
      { new: true }
    )

    if (!updatedCereal) {
      return NextResponse.json({ error: "Cereal no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      cereal: updatedCereal,
      message: "Cereal actualizado exitosamente"
    })
  } catch (error) {
    console.error("Error actualizando cereal:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG DELETE /api/cereals/[id] ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const deletedCereal = await Cereal.findByIdAndDelete(params.id)

    if (!deletedCereal) {
      return NextResponse.json({ error: "Cereal no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Cereal eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error eliminando cereal:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
