import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"

async function cleanupDemoUsers() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Emails de usuarios demo que queremos eliminar
    const demoEmails = [
      "admin@sistema.com",
      "admin@acopio.com", 
      "supervisor@acopio.com",
      "operador@acopio.com",
      "garita@acopio.com"
    ]

    console.log("Buscando usuarios demo para eliminar...")
    
    for (const email of demoEmails) {
      const user = await User.findOne({ email })
      if (user) {
        await User.deleteOne({ email })
        console.log(`✅ Eliminado usuario demo: ${email}`)
      } else {
        console.log(`⚪ Usuario no encontrado: ${email}`)
      }
    }

    // Verificar que solo quede el usuario correcto
    const remainingUsers = await User.find({})
    console.log(`\n--- Usuarios restantes (${remainingUsers.length}) ---`)
    
    remainingUsers.forEach((user) => {
      console.log(`📧 ${user.email} - ${user.full_name} (${user.role})`)
    })

    console.log("\n✅ Limpieza completada!")

  } catch (error) {
    console.error("❌ Error limpiando usuarios demo:", error)
  } finally {
    process.exit(0)
  }
}

cleanupDemoUsers()
