import connectDB from "../app/mongoDB/db"
import User from "../app/mongoDB/models/user"

async function checkUsers() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    // Buscar todos los usuarios
    const users = await User.find({})
    console.log(`\nEncontrados ${users.length} usuarios:`)
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   Nombre: ${user.full_name}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Activo: ${user.is_active}`)
      console.log(`   ID: ${user._id}`)
    })

    // Buscar específicamente usuarios con rol system_admin
    const systemAdmins = await User.find({ role: "system_admin" })
    console.log(`\n--- Administradores del Sistema (${systemAdmins.length}) ---`)
    
    systemAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} - ${admin.full_name}`)
    })

  } catch (error) {
    console.error("❌ Error consultando usuarios:", error)
  } finally {
    process.exit(0)
  }
}

checkUsers()
