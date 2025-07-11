import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"
import bcrypt from "bcryptjs"

async function checkSystemAdmin() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Buscar el administrador del sistema
    const admin = await User.findOne({ email: "admin@sistema.com" })
    
    if (!admin) {
      console.log("❌ No se encontró el administrador del sistema")
      return
    }

    console.log("✅ Administrador encontrado:")
    console.log("Email:", admin.email)
    console.log("Nombre:", admin.full_name)
    console.log("Rol:", admin.role)
    console.log("Activo:", admin.is_active)
    console.log("Creado:", admin.created_at)

    // Verificar si la contraseña "admin123" coincide
    const passwordMatch = await bcrypt.compare("admin123", admin.password)
    console.log("Contraseña 'admin123' coincide:", passwordMatch)

    if (!passwordMatch) {
      console.log("🔄 Actualizando contraseña a 'admin123'...")
      admin.password = await bcrypt.hash("admin123", 12)
      admin.updated_at = new Date().toISOString()
      await admin.save()
      console.log("✅ Contraseña actualizada exitosamente!")
    }

    if (!admin.is_active) {
      console.log("🔄 Activando usuario...")
      admin.is_active = true
      admin.updated_at = new Date().toISOString()
      await admin.save()
      console.log("✅ Usuario activado exitosamente!")
    }

  } catch (error) {
    console.error("❌ Error verificando administrador:", error)
  } finally {
    process.exit(0)
  }
}

checkSystemAdmin()
