import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

export async function GET() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Buscar todos los usuarios
    const allUsers = await User.find({})
    console.log(`Total usuarios: ${allUsers.length}`)

    // Buscar el usuario específico
    let targetUser = await User.findOne({ email: "ignacio.gherardi@gmail.com" })
    
    if (targetUser) {
      console.log("Usuario encontrado, actualizando...")
      
      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash("Caprichoso", 12)
      targetUser.password = hashedPassword
      targetUser.role = "system_admin"
      targetUser.is_active = true
      targetUser.updated_at = new Date().toISOString()
      
      await targetUser.save()
      
      console.log("Usuario actualizado")
    } else {
      console.log("Usuario no encontrado, creando...")
      
      const hashedPassword = await bcrypt.hash("Caprichoso", 12)
      
      targetUser = new User({
        email: "ignacio.gherardi@gmail.com",
        password: hashedPassword,
        full_name: "Ignacio Gherardi",
        phone: "+54 11 1234-5678",
        role: "system_admin",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      await targetUser.save()
      console.log("Usuario creado")
    }

    // Verificación final
    const finalUser = await User.findOne({ email: "ignacio.gherardi@gmail.com" })
    const passwordCheck = await bcrypt.compare("Caprichoso", finalUser.password)

    return NextResponse.json({
      success: true,
      message: "Usuario configurado correctamente",
      user: {
        email: finalUser.email,
        full_name: finalUser.full_name,
        role: finalUser.role,
        is_active: finalUser.is_active,
        passwordValid: passwordCheck
      },
      totalUsers: allUsers.length
    })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { 
        error: "Error configurando usuario", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
