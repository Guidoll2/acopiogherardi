import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Driver from "@/app/mongoDB/models/driver"
import { verifyToken } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Re-habilitar autenticación después del desarrollo
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()
    const { id } = await params

    const driverData = await request.json()
    driverData.updated_at = new Date().toISOString()

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      driverData,
      { new: true }
    )

    if (!updatedDriver) {
      return NextResponse.json({ error: "Driver no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      driver: updatedDriver,
      message: "Driver actualizado exitosamente"
    })
  } catch (error) {
    console.error("Error actualizando driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Re-habilitar autenticación después del desarrollo
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()
    const { id } = await params

    const deletedDriver = await Driver.findByIdAndDelete(id)

    if (!deletedDriver) {
      return NextResponse.json({ error: "Driver no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Driver eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error eliminando driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
