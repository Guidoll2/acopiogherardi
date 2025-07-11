import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"
import bcrypt from "bcryptjs"

async function createSystemAdmin() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Verificar si ya existe un administrador del sistema
    const existingAdmin = await User.findOne({ role: "system_admin" })
    if (existingAdmin) {
      console.log("Ya existe un administrador del sistema:")
      console.log("Email:", existingAdmin.email)
      return
    }

    // Crear el primer administrador del sistema
    const adminData = {
      email: "ignacio.gherardi@gmail.com",
      password: await bcrypt.hash("Caprichoso", 12),
      full_name: "Ignacio Gherardi",
      phone: "+54 11 1234-5678",
      role: "system_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const systemAdmin = new User(adminData)
    await systemAdmin.save()

    console.log("✅ Administrador del sistema creado exitosamente!")
    console.log("Email: ignacio.gherardi@gmail.com")
    console.log("Contraseña: Caprichoso")
    console.log("⚠️  IMPORTANTE: Este es el usuario principal del sistema")

  } catch (error) {
    console.error("❌ Error creando administrador del sistema:", error)
  } finally {
    process.exit(0)
  }
}

createSystemAdmin()
