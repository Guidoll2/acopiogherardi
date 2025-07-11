import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"
import bcrypt from "bcryptjs"

async function updateSystemAdmin() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Buscar y actualizar el administrador del sistema existente
    const existingAdmin = await User.findOne({ role: "system_admin" })
    
    if (existingAdmin) {
      console.log("Actualizando administrador existente:", existingAdmin.email)
      
      // Actualizar a las nuevas credenciales
      existingAdmin.email = "ignacio.gherardi@gmail.com"
      existingAdmin.full_name = "Ignacio Gherardi"
      existingAdmin.password = await bcrypt.hash("Caprichoso", 12)
      existingAdmin.updated_at = new Date().toISOString()
      
      await existingAdmin.save()
      console.log("✅ Administrador actualizado exitosamente!")
    } else {
      // Crear nuevo administrador si no existe
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
      console.log("✅ Nuevo administrador creado exitosamente!")
    }

    console.log("Email: ignacio.gherardi@gmail.com")
    console.log("Contraseña: Caprichoso")
    console.log("Rol: system_admin")

  } catch (error) {
    console.error("❌ Error actualizando administrador del sistema:", error)
  } finally {
    process.exit(0)
  }
}

updateSystemAdmin()
